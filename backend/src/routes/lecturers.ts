import express from 'express';
import { body, validationResult } from 'express-validator';
import type { Request, Response } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { generateId } from '../utils/auth';
import db from '../models/db';

const router = express.Router();

router.get('/', authMiddleware, roleMiddleware('lecturer'), (req: Request, res: Response) => {
  const lecturerId = req.user!.userId;

  const classes = db.prepare(`
    SELECT id, name, code, schedule, location, semester, createdAt
    FROM classes
    WHERE lecturerId = ?
    ORDER BY createdAt DESC
  `).all(lecturerId);

  res.json({ classes });
});

router.post('/', authMiddleware, roleMiddleware('lecturer'), [
  body('name').trim().notEmpty(),
  body('code').trim().notEmpty(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, code, schedule, location, semester } = req.body;
  const lecturerId = req.user!.userId;

  const id = generateId();
  db.prepare(`
    INSERT INTO classes (id, name, code, lecturerId, schedule, location, semester)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, code, lecturerId, schedule || null, location || null, semester || 'Current');

  res.status(201).json({ message: 'Class created successfully', class: { id, name, code } });
});

router.put('/:id', authMiddleware, roleMiddleware('lecturer'), (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, code, schedule, location, semester } = req.body;
  const lecturerId = req.user!.userId;

  const existing = db.prepare('SELECT id FROM classes WHERE id = ? AND lecturerId = ?')
    .get(id, lecturerId);
  if (!existing) {
    return res.status(404).json({ error: 'Class not found or unauthorized' });
  }

  db.prepare(`
    UPDATE classes SET name = ?, code = ?, schedule = ?, location = ?, semester = ?
    WHERE id = ?
  `).run(name, code, schedule, location, semester, id);

  res.json({ message: 'Class updated successfully' });
});

router.delete('/:id', authMiddleware, roleMiddleware('lecturer'), (req: Request, res: Response) => {
  const { id } = req.params;
  const lecturerId = req.user!.userId;

  const result = db.prepare('DELETE FROM classes WHERE id = ? AND lecturerId = ?')
    .run(id, lecturerId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Class not found or unauthorized' });
  }

  res.json({ message: 'Class deleted successfully' });
});

export default router;
