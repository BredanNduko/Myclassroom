import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import type { Request, Response } from 'express';
import db from './models/db';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static('backend/uploads'));

async function start() {
  try {
    await db.init();
    (global as any).db = db;  // Use db wrapper, not raw DB
    console.log('Database initialized');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }

  // Load routes using require (CommonJS)
  const authRoute = require('./routes/auth');
  const studentsRoute = require('./routes/students');
  const lecturersRoute = require('./routes/lecturers');
  const classesRoute = require('./routes/classes');
  const notesRoute = require('./routes/notes');
  const assignmentsRoute = require('./routes/assignments');
  const announcementsRoute = require('./routes/announcements');
  const todosRoute = require('./routes/todos');
  const evaluationsRoute = require('./routes/evaluations');
  const filesRoute = require('./routes/files');

  app.use('/api/auth', authRoute.default);
  app.use('/api/students', studentsRoute.default);
  app.use('/api/lecturers', lecturersRoute.default);
  app.use('/api/classes', classesRoute.default);
  app.use('/api/notes', notesRoute.default);
  app.use('/api/assignments', assignmentsRoute.default);
  app.use('/api/announcements', announcementsRoute.default);
  app.use('/api/todos', todosRoute.default);
  app.use('/api/evaluations', evaluationsRoute.default);
  app.use('/api/files', filesRoute.default);

  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
