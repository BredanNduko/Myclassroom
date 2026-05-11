import { hashPassword } from './utils/auth';
import db from './models/db';

async function seed() {
  console.log('Seeding database...');

  // Initialize database first
  await db.init();
  console.log('Database initialized');

  const database = db.getDB();

  // Default demo accounts
  const users = [
    {
      id: 'student-1',
      email: 'student@demo.com',
      password: 'demo123',
      name: 'Demo Student',
      role: 'student' as const,
    },
    {
      id: 'lecturer-1',
      email: 'lecturer@demo.com',
      password: 'demo123',
      name: 'Demo Lecturer',
      role: 'lecturer' as const,
    },
  ];

  for (const user of users) {
    try {
      const existing = database.prepare('SELECT id FROM users WHERE email = ?').get(user.email);
      if (existing) {
        console.log(`User ${user.email} already exists`);
        continue;
      }
      const hashedPassword = await hashPassword(user.password);
      database.prepare(`
        INSERT INTO users (id, email, password, name, role)
        VALUES (?, ?, ?, ?, ?)
      `).run(user.id, user.email, hashedPassword, user.name, user.role);
      console.log(`Created ${user.role}: ${user.email} / ${user.password}`);
    } catch (error) {
      console.error(`Failed to create ${user.email}:`, error);
    }
  }

  console.log('Seeding complete! Credentials:');
  console.log('  Student: student@demo.com / demo123');
  console.log('  Lecturer: lecturer@demo.com / demo123');
  process.exit(0);
}

seed().catch(console.error);
