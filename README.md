# MyClassroom - Campus Study Management System

A full-stack application for managing campus studies. Students can enroll in classes, access notes, track assignments, and manage todo lists. Lecturers can create classes, upload notes, make announcements, and view teaching evaluations.

## Project Structure

```
myclassroom/
├── backend/          # Node.js + Express + TypeScript + SQLite
│   ├── src/
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Auth middleware
│   │   ├── utils/       # Auth utilities
│   │   └── index.ts     # Entry point
│   └── package.json
├── frontend/         # Flutter mobile app
│   ├── lib/
│   │   ├── models/          # Data models
│   │   ├── services/        # API & Auth services
│   │   ├── screens/         # App screens
│   │   ├── widgets/         # Reusable widgets
│   │   └── main.dart        # Entry point
│   └── pubspec.yaml
└── README.md
```

## Features

### For Students
- Browse and enroll in available classes
- View enrolled classes with schedule/location info
- Access class notes organized by class
- Track pending assignments with due dates
- Personal todo list with priorities
- Clean, intuitive Material Design UI

### For Lecturers
- Create and manage multiple classes
- Set class schedule, location, and semester
- Upload notes (title, description, files)
- Post announcements with priority levels
- View teaching evaluation statistics
- Dashboard organized by tabs

## Backend Setup (Node.js)

```bash
cd backend
npm install
npm run dev
```

Backend runs on http://localhost:3001

API endpoints:
- `POST /api/auth/register` - Register user (role: student|lecturer)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/classes/my` - Get user's classes
- `POST /api/classes` - Create class (lecturer only)
- `POST /api/students/classes` - Enroll in class
- `GET /api/notes/class/:id` - Get notes for class
- `POST /api/notes` - Upload note (lecturer only)
- `POST /api/announcements` - Create announcement (lecturer only)
- `GET /api/assignments/my/pending` - Get pending assignments
- `GET /api/todos` - Get todo list
- `POST /api/todos` - Create todo
- `PUT /api/todos/:id/complete` - Mark todo complete
- `GET /api/evaluations/class/:id` - Get evaluations

## Frontend Setup (Flutter)

```bash
cd frontend
flutter pub get
flutter run
```

**Important:** Update the backend URL in `lib/services/api_service.dart`:
```dart
static const String baseUrl = 'http://YOUR_IP:3001/api';
```

For Android emulator: `http://10.0.2.2:3001/api` (maps to host localhost:3001)
For iOS simulator: `http://localhost:3001/api`
For real device: Use your computer's local IP (e.g., `http://192.168.1.5:3001/api`)

## Database

Uses SQLite (`backend/data/myclassroom.db`) with tables:
- `users` - Student and lecturer accounts
- `classes` - Class information
- `class_enrollments` - Student class enrollments
- `notes` - Lecture notes
- `assignments` - Assignment details
- `assignment_submissions` - Student submissions
- `announcements` - Class announcements
- `todos` - Student todo items
- `evaluations` - Student teaching evaluations

## Tech Stack

**Backend**
- Express.js + TypeScript
-SQLite (better-sqlite3)
- JWT authentication
- Bcrypt password hashing
- Multer file uploads
- Express Validator

**Frontend**
- Flutter (Dart)
- Provider state management
- HTTP client
- SharedPreferences for token storage
- Material Design 3

## Future Enhancements

- Audio note reading (text-to-speech) for students
- Push notifications for announcements
- Grade tracking and GPA calculation
- Calendar view for schedule
- Dark mode
- File attachments for assignments
- Real-time chat/discussion

## Notes

Backend must be running before starting Flutter app. Default port: 3001.
Make sure CORS is configured for your frontend URL in production.
