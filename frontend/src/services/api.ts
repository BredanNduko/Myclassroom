import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const apiService = {
  Auth: {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }).then(r => r.data),
    register: (email: string, password: string, name: string, role: string) => api.post('/auth/register', { email, password, name, role }).then(r => r.data),
    getUser: () => api.get('/auth/me').then(r => r.data.user),
  },
  Classes: {
    getAvailable: () => api.get('/classes/available').then(r => r.data.classes),
    getMyClasses: () => api.get('/classes/my').then(r => r.data.classes),
    getMyClassesAsLecturer: () => api.get('/lecturers').then(r => r.data.classes),
    createClass: (data: any) => api.post('/lecturers', data),
    updateClass: (id: string, data: any) => api.put(`/lecturers/${id}`, data),
    deleteClass: (id: string) => api.delete(`/lecturers/${id}`),
    enroll: (classId: string) => api.post('/students/classes', { classId }),
    drop: (classId: string) => api.delete(`/students/classes/${classId}`),
  },
  Notes: {
    getByClass: (classId: string) => api.get(`/notes/class/${classId}`).then(r => r.data.notes),
    create: (data: FormData) => api.post('/notes', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
    delete: (id: string) => api.delete(`/notes/${id}`),
    download: (id: string) => window.open(`/api/notes/${id}/download`, '_blank'),
  },
  Announcements: {
    getByClass: (classId: string) => api.get(`/announcements/class/${classId}`).then(r => r.data.announcements),
    create: (data: any) => api.post('/announcements', data),
    delete: (id: string) => api.delete(`/announcements/${id}`),
  },
  Assignments: {
    getByClass: (classId: string) => api.get(`/assignments/class/${classId}`).then(r => r.data.assignments),
    create: (data: any) => api.post('/assignments', data),
    delete: (id: string) => api.delete(`/assignments/${id}`),
    getPending: () => api.get('/assignments/my/pending').then(r => r.data.assignments),
  },
  Todos: {
    getAll: () => api.get('/todos').then(r => r.data.todos),
    create: (data: any) => api.post('/todos', data),
    complete: (id: string) => api.put(`/todos/${id}/complete`),
    delete: (id: string) => api.delete(`/todos/${id}`),
  },
  Evaluations: {
    getByClass: (classId: string) => api.get(`/evaluations/class/${classId}`).then(r => r.data.evaluations),
    submit: (classId: string, rating: number, feedback?: string) => api.post(`/evaluations/class/${classId}`, { rating, feedback }),
  },
};

export default apiService;
