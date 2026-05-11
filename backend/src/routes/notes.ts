import express from 'express';
import multer from 'multer';
import path from 'path';
import type { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { generateId } from '../utils/auth';
import db from '../models/db';

const router = express.Router();
const upload = multer({ dest: 'backend/uploads/' });

router.get('/class/:classId', authMiddleware, (req: Request, res: Response) => {
  const { classId } = req.params;

  const notes = db.prepare(`
    SELECT n.*, u.name as lecturerName
    FROM notes n
    JOIN users u ON n.lecturerId = u.id
    WHERE n.classId = ?
    ORDER BY n.createdAt DESC
  `).all(classId);

  res.json({ notes });
});

router.post('/', authMiddleware, roleMiddleware('lecturer'), upload.single('file'), [
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
  let fileName = null;
  let filePath = null;
  let fileSize = null;
  let mimeType = null;

  if (req.file) {
    fileName = req.file.originalname;
    filePath = req.file.path;
    fileSize = req.file.size;
    mimeType = req.file.mimetype;
  }

  db.prepare(`
    INSERT INTO notes (id, classId, lecturerId, title, description, fileName, filePath, fileSize, mimeType)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, classId, lecturerId, title, description || '', fileName, filePath, fileSize, mimeType);

  res.status(201).json({ message: 'Note created', noteId: id });
});

router.delete('/:id', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.userId;
  const role = req.user!.role;

  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as any;
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  if (role === 'lecturer' && note.lecturerId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  db.prepare('DELETE FROM notes WHERE id = ?').run(id);

  res.json({ message: 'Note deleted successfully' });
});

router.get('/:id/download', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;

  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as any;
  if (!note || !note.filePath) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.download(note.filePath, note.fileName);
});

export default router;
