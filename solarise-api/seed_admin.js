import pool from './config/db.js';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    // Update or Insert admin user
    await pool.query(
      `INSERT INTO users (full_name, email, phone, role, password_hash, is_active)
       VALUES ('Omprakash', 'admin@solarise.com', '9876543210', 'admin', $1, true)
       ON CONFLICT (email) DO UPDATE SET password_hash = $1, is_active = true`,
      [hash]
    );

    // Also update om@solarise.com
    await pool.query(
      `UPDATE users SET password_hash = $1 WHERE email = 'om@solarise.com'`,
      [hash]
    );

    console.log('Admin user updated successfully! Credentials: admin@solarise.com / 9876543210 / admin123');
  } catch (err) {
    console.error('Error seeding admin:', err);
  } finally {
    pool.end();
  }
}

seedAdmin();
