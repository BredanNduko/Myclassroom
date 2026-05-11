import express from 'express';
import type { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import db from '../models/db';

const router = express.Router();

router.get('/available', authMiddleware, (req: Request, res: Response) => {
  const studentId = req.user!.userId;

  const enrolled = db.prepare(`
    SELECT classId FROM class_enrollments WHERE studentId = ?
  `).all(studentId).map((e: any) => e.classId);

  let classes: any[];
  if (enrolled.length === 0) {
    classes = db.prepare(`
      SELECT c.id, c.name, c.code, c.schedule, c.location, u.name as lecturerName
      FROM classes c
      JOIN users u ON c.lecturerId = u.id
      ORDER BY c.name
    `).all();
  } else {
    classes = db.prepare(`
      SELECT c.id, c.name, c.code, c.schedule, c.location, u.name as lecturerName
      FROM classes c
      JOIN users u ON c.lecturerId = u.id
      WHERE c.id NOT IN (${enrolled.map(() => '?').join(',')})
      ORDER BY c.name
    `).all(...enrolled);
  }

  res.json({ classes });
});

router.get('/my', authMiddleware, (req: Request, res: Response) => {
  const studentId = req.user!.userId;

  const classes = db.prepare(`
    SELECT c.id, c.name, c.code, c.schedule, c.location, u.name as lecturerName
    FROM class_enrollments ce
    JOIN classes c ON ce.classId = c.id
    JOIN users u ON c.lecturerId = u.id
    WHERE ce.studentId = ?
    ORDER BY c.name
  `).all(studentId);

  res.json({ classes });
});

export default router;
