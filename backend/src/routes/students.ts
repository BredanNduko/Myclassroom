import express from 'express';
import { body, validationResult } from 'express-validator';
import type { Request, Response } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { generateId } from '../utils/auth';
import db from '../models/db';

const router = express.Router();

router.get('/', authMiddleware, (req: Request, res: Response) => {
  const studentId = req.user!.userId;

  const enrollments = db.prepare(`
    SELECT c.id, c.name, c.code, c.schedule, c.location, c.semester
    FROM class_enrollments ce
    JOIN classes c ON ce.classId = c.id
    WHERE ce.studentId = ?
  `).all(studentId);

  res.json({ classes: enrollments });
});

router.post('/', authMiddleware, roleMiddleware('student'), [
  body('classId').notEmpty(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { classId } = req.body;
  const studentId = req.user!.userId;

  const classExists = db.prepare('SELECT id FROM classes WHERE id = ?').get(classId);
  if (!classExists) {
    return res.status(404).json({ error: 'Class not found' });
  }

  const alreadyEnrolled = db.prepare('SELECT id FROM class_enrollments WHERE classId = ? AND studentId = ?')
    .get(classId, studentId);
  if (alreadyEnrolled) {
    return res.status(400).json({ error: 'Already enrolled in this class' });
  }

  const id = generateId();
  db.prepare('INSERT INTO class_enrollments (id, classId, studentId) VALUES (?, ?, ?)')
    .run(id, classId, studentId);

  res.status(201).json({ message: 'Enrolled successfully', enrollmentId: id });
});

router.delete('/:classId', authMiddleware, roleMiddleware('student'), (req: Request, res: Response) => {
  const { classId } = req.params;
  const studentId = req.user!.userId;

  const result = db.prepare('DELETE FROM class_enrollments WHERE classId = ? AND studentId = ?')
    .run(classId, studentId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Enrollment not found' });
  }

  res.json({ message: 'Dropped successfully' });
});

export default router;
