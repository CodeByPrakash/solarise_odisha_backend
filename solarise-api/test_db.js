import pool from './config/db.js';

async function test() {
  try {
    const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    console.log('USERS COLUMNS:', cols.rows.map(r => r.column_name));

    const users = await pool.query("SELECT * FROM users");
    console.log('USERS COUNT:', users.rowCount);
    console.log('USERS DATA:', users.rows);
  } catch (err) {
    console.error('DB ERROR:', err);
  } finally {
    pool.end();
  }
}

test();
