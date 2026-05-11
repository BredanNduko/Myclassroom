import express from 'express';
import { body, validationResult } from 'express-validator';
import type { Request, Response } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { generateId } from '../utils/auth';
import db from '../models/db';

const router = express.Router();

router.get('/', authMiddleware, (req: Request, res: Response) => {
  const studentId = req.user!.userId;

  const todos = db.prepare(`
    SELECT * FROM todos
    WHERE studentId = ?
    ORDER BY dueDate ASC, priority DESC, createdAt DESC
  `).all(studentId);

  res.json({ todos });
});

router.post('/', authMiddleware, roleMiddleware('student'), [
  body('text').trim().notEmpty(),
  body('dueDate').optional().isISO8601(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { text, dueDate, priority } = req.body;
  const studentId = req.user!.userId;

  const id = generateId();
  db.prepare(`
    INSERT INTO todos (id, studentId, text, dueDate, priority)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, studentId, text, dueDate || null, priority || 'medium');

  res.status(201).json({ message: 'Todo created', todoId: id });
});

router.put('/:id/complete', authMiddleware, roleMiddleware('student'), (req: Request, res: Response) => {
  const { id } = req.params;
  const studentId = req.user!.userId;

  const result = db.prepare('UPDATE todos SET completed = 1 WHERE id = ? AND studentId = ?')
    .run(id, studentId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Todo not found or unauthorized' });
  }

  res.json({ message: 'Todo completed' });
});

router.delete('/:id', authMiddleware, roleMiddleware('student'), (req: Request, res: Response) => {
  const { id } = req.params;
  const studentId = req.user!.userId;

  const result = db.prepare('DELETE FROM todos WHERE id = ? AND studentId = ?').run(id, studentId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Todo not found or unauthorized' });
  }

  res.json({ message: 'Todo deleted successfully' });
});

export default router;
