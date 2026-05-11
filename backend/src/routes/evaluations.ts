import express from 'express';
import { body, validationResult } from 'express-validator';
import type { Request, Response } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { generateId } from '../utils/auth';
import db from '../models/db';

const router = express.Router();

router.get('/class/:classId', authMiddleware, (req: Request, res: Response) => {
  const { classId } = req.params;

  const evaluations = db.prepare(`
    SELECT e.*, u.name as studentName
    FROM evaluations e
    JOIN users u ON e.studentId = u.id
    WHERE e.classId = ?
    ORDER BY e.submittedAt DESC
  `).all(classId);

  res.json({ evaluations });
});

router.post('/class/:classId', authMiddleware, roleMiddleware('student'), [
  body('rating').isInt({ min: 1, max: 5 }),
  body('feedback').optional().trim(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { classId } = req.params;
  const { rating, feedback } = req.body;
  const studentId = req.user!.userId;

  const isEnrolled = db.prepare('SELECT id FROM class_enrollments WHERE classId = ? AND studentId = ?')
    .get(classId, studentId);
  if (!isEnrolled) {
    return res.status(403).json({ error: 'Not enrolled in this class' });
  }

  const existing = db.prepare('SELECT id FROM evaluations WHERE classId = ? AND studentId = ?')
    .get(classId, studentId);

  if (existing) {
    db.prepare('UPDATE evaluations SET rating = ?, feedback = ?, submittedAt = datetime("now") WHERE id = ?')
      .run(rating, feedback || '', existing.id);
    res.json({ message: 'Evaluation updated' });
  } else {
    const id = generateId();
    db.prepare('INSERT INTO evaluations (id, classId, studentId, rating, feedback) VALUES (?, ?, ?, ?, ?)')
      .run(id, classId, studentId, rating, feedback || '');
    res.status(201).json({ message: 'Evaluation submitted' });
  }
});

export default router;
