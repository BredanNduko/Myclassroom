import express from 'express';
import { body, validationResult } from 'express-validator';
import type { Request, Response } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { generateId } from '../utils/auth';
import db from '../models/db';

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware('lecturer'), [
  body('classId').notEmpty(),
  body('title').trim().notEmpty(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { classId, title, description } = req.body;
  const lecturerId = req.user!.userId;

  const classExists = db.prepare('SELECT id FROM classes WHERE id = ? AND lecturerId = ?')
    .get(classId, lecturerId);
  if (!classExists) {
    return res.status(404).json({ error: 'Class not found or unauthorized' });
  }

  const id = generateId();
  db.prepare(`
    INSERT INTO announcements (id, classId, lecturerId, title, content)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, classId, lecturerId, title, description || '');

  res.status(201).json({ message: 'Announcement created', announcementId: id });
});

router.get('/class/:classId', (req: Request, res: Response) => {
  const { classId } = req.params;

  const announcements = db.prepare(`
    SELECT a.*, u.name as lecturerName
    FROM announcements a
    JOIN users u ON a.lecturerId = u.id
    WHERE a.classId = ?
    ORDER BY a.createdAt DESC
  `).all(classId);

  res.json({ announcements });
});

router.delete('/:id', authMiddleware, roleMiddleware('lecturer'), (req: Request, res: Response) => {
  const { id } = req.params;
  const lecturerId = req.user!.userId;

  const result = db.prepare('DELETE FROM announcements WHERE id = ? AND lecturerId = ?')
    .run(id, lecturerId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Announcement not found or unauthorized' });
  }

  res.json({ message: 'Announcement deleted successfully' });
});

export default router;
