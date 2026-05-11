import express from 'express';
import multer from 'multer';
import type { Request, Response } from 'express';


const router = express.Router();
const upload = multer({ dest: 'backend/uploads/' });

router.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    url: `/api/files/${req.file.filename}`,
    filename: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

export default router;
