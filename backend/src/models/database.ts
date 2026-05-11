import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'myclassroom.db');

class DatabaseClass {
  private static instance: DatabaseClass | null = null;
  private db: any = null;
  private static initPromise: Promise<void> | null = null;

  private constructor() {}

  static async getInstance(): Promise<DatabaseClass> {
    if (!DatabaseClass.instance) {
      const instance = new DatabaseClass();
      await instance.init();
      DatabaseClass.instance = instance;
    }
    return DatabaseClass.instance;
  }

  static async getDB(): Promise<any> {
    const instance = await this.getInstance();
    return instance.db;
  }

  private async init() {
    const SQL = await initSqlJs();
    
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      this.db = new SQL.Database(fileBuffer);
    } else {
      this.db = new SQL.Database();
    }

    this.createTables();
    this.save();
  }

  private createTables() {
    const db = this.db;
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student', 'lecturer')),
        createdAt TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT NOT NULL,
        lecturerId TEXT NOT NULL,
        schedule TEXT,
        location TEXT,
        semester TEXT DEFAULT 'Current',
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (lecturerId) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS class_enrollments (
        id TEXT PRIMARY KEY,
        classId TEXT NOT NULL,
        studentId TEXT NOT NULL,
        enrolledAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(classId, studentId)
      );

      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        classId TEXT NOT NULL,
        lecturerId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        fileName TEXT,
        filePath TEXT,
        fileSize INTEGER,
        mimeType TEXT,
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (lecturerId) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        classId TEXT NOT NULL,
        lecturerId TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        dueDate TEXT,
        points INTEGER DEFAULT 100,
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (lecturerId) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id TEXT PRIMARY KEY,
        assignmentId TEXT NOT NULL,
        studentId TEXT NOT NULL,
        filePath TEXT,
        submittedAt TEXT DEFAULT (datetime('now')),
        grade TEXT,
        feedback TEXT,
        FOREIGN KEY (assignmentId) REFERENCES assignments(id) ON DELETE CASCADE,
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(assignmentId, studentId)
      );

      CREATE TABLE IF NOT EXISTS announcements (
        id TEXT PRIMARY KEY,
        classId TEXT NOT NULL,
        lecturerId TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high')),
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (lecturerId) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        studentId TEXT NOT NULL,
        text TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        dueDate TEXT,
        priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
        createdAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS evaluations (
        id TEXT PRIMARY KEY,
        classId TEXT NOT NULL,
        studentId TEXT NOT NULL,
        rating INTEGER CHECK(rating >= 1 AND rating <= 5),
        feedback TEXT,
        submittedAt TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(classId, studentId)
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_classes_lecturer ON classes(lecturerId);
      CREATE INDEX IF NOT EXISTS idx_enrollments_student ON class_enrollments(studentId);
      CREATE INDEX IF NOT EXISTS idx_notes_class ON notes(classId);
      CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(classId);
      CREATE INDEX IF NOT EXISTS idx_announcements_class ON announcements(classId);
      CREATE INDEX IF NOT EXISTS idx_todos_student ON todos(studentId);
    `);
  }

  private save() {
    const data = this.db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }

  prepare(sql: string) {
    return {
      get: (...params: any[]) => this.get(sql, params),
      all: (...params: any[]) => this.exec(sql, params),
      run: (...params: any[]) => this.run(sql, params),
    };
  }

  exec(sql: string, params: any[] = []): any[] {
    try {
      const stmt = this.db.prepare(sql);
      if (params.length) {
        stmt.bind(params);
      }
      const results: any[] = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      this.save();
      return results;
    } catch (err) {
      console.error('SQL error:', err);
      throw err;
    }
  }

  get(sql: string, params: any[] = []): any {
    const results = this.exec(sql, params);
    return results[0] || null;
  }

  run(sql: string, params: any[] = []): { changes: number } {
    this.exec(sql, params);
    return { changes: this.db.getRowsModified() };
  }

  close() {
    this.save();
    this.db.close();
  }
}

export default DatabaseClass;
