import express from 'express';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import type { Request, Response } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { generateId } from '../utils/auth';
import db from '../models/db';

const router = express.Router();
const upload = multer({ dest: 'backend/uploads/' });

router.get('/class/:classId', authMiddleware, (req: Request, res: Response) => {
  const { classId } = req.params;

  const assignments = db.prepare(`
    SELECT a.*, u.name as lecturerName,
      (SELECT COUNT(*) FROM assignment_submissions WHERE assignmentId = a.id) as submissionCount
    FROM assignments a
    JOIN users u ON a.lecturerId = u.id
    WHERE a.classId = ?
    ORDER BY a.dueDate ASC
  `).all(classId);

  res.json({ assignments });
});

router.post('/', authMiddleware, roleMiddleware('lecturer'), [
  body('classId').notEmpty(),
  body('title').trim().notEmpty(),
  body('dueDate').optional().isISO8601(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { classId, title, description, dueDate, points } = req.body;
  const lecturerId = req.user!.userId;

  const classExists = db.prepare('SELECT id FROM classes WHERE id = ? AND lecturerId = ?')
    .get(classId, lecturerId);
  if (!classExists) {
    return res.status(404).json({ error: 'Class not found or unauthorized' });
  }

  const id = generateId();
  db.prepare(`
    INSERT INTO assignments (id, classId, lecturerId, title, description, dueDate, points)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, classId, lecturerId, title, description || '', dueDate || null, points || 100);

  res.status(201).json({ message: 'Assignment created', assignmentId: id });
});

router.delete('/:id', authMiddleware, roleMiddleware('lecturer'), (req: Request, res: Response) => {
  const { id } = req.params;
  const lecturerId = req.user!.userId;

  const result = db.prepare('DELETE FROM assignments WHERE id = ? AND lecturerId = ?')
    .run(id, lecturerId);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Assignment not found or unauthorized' });
  }

  res.json({ message: 'Assignment deleted successfully' });
});

router.post('/:id/submit', authMiddleware, roleMiddleware('student'), upload.single('file'), (req: Request, res: Response) => {
  const { id: assignmentId } = req.params;
  const studentId = req.user!.userId;

  const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(assignmentId);
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found' });
  }

  let filePath = null;
  if (req.file) {
    filePath = req.file.path;
  }

  const existing = db.prepare('SELECT id FROM assignment_submissions WHERE assignmentId = ? AND studentId = ?')
    .get(assignmentId, studentId);

  if (existing) {
    db.prepare('UPDATE assignment_submissions SET filePath = ?, submittedAt = datetime("now") WHERE id = ?')
      .run(filePath, existing.id);
    res.json({ message: 'Assignment resubmitted successfully' });
  } else {
    const submissionId = generateId();
    db.prepare('INSERT INTO assignment_submissions (id, assignmentId, studentId, filePath) VALUES (?, ?, ?, ?)')
      .run(submissionId, assignmentId, studentId, filePath);
    res.status(201).json({ message: 'Assignment submitted successfully' });
  }
});

router.get('/my/pending', authMiddleware, roleMiddleware('student'), (req: Request, res: Response) => {
  const studentId = req.user!.userId;

  const pending = db.prepare(`
    SELECT a.*, c.name as className,
      s.submittedAt, s.grade,
      CASE WHEN a.dueDate < datetime('now') THEN 1 ELSE 0 END as isOverdue
    FROM assignments a
    JOIN classes c ON a.classId = c.id
    JOIN class_enrollments ce ON c.id = ce.classId
    LEFT JOIN assignment_submissions s ON a.id = s.assignmentId AND s.studentId = ?
    WHERE ce.studentId = ?
      AND (s.id IS NULL OR s.grade IS NULL)
    ORDER BY a.dueDate ASC
  `).all(studentId, studentId);

  res.json({ assignments: pending });
});

export default router;
