export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'lecturer';
  token: string;
}

export interface Class {
  id: string;
  name: string;
  code: string;
  schedule?: string;
  location?: string;
  semester?: string;
  lecturerName?: string;
}

export interface Note {
  id: string;
  classId: string;
  lecturerId: string;
  title: string;
  description?: string;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  mimeType?: string;
  lecturerName?: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  description?: string;
  dueDate?: string;
  points: number;
  lecturerName?: string;
  submissionCount?: number;
  submittedAt?: string;
  isOverdue?: number;
  grade?: string;
  className?: string;
}

export interface Todo {
  id: string;
  studentId: string;
  text: string;
  completed: number;
  dueDate?: string;
  priority: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  classId: string;
  lecturerId: string;
  title: string;
  content: string;
  priority: string;
  createdAt: string;
  lecturerName?: string;
}

export interface Evaluation {
  id: string;
  classId: string;
  studentId: string;
  studentName?: string;
  rating: number;
  feedback?: string;
  submittedAt: string;
}
