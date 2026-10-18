const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { getDb } = require('../db');
const bcrypt = require('bcryptjs');

async function checkAdmin() {
  const db = getDb();
  let admin = await db.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get();
  if (!admin) {
    console.log('No admin found, creating test admin...');
    const hash = await bcrypt.hash('admin123', 10);
    const res = await db.prepare(`
      INSERT INTO users (username, email, password_hash, role, phone, location)
      VALUES (?, ?, ?, 'admin', '9999999999', 'Nashik, Maharashtra')
    `).run('admin', 'admin@krishisangam.com', hash);
    admin = await db.prepare("SELECT * FROM users WHERE id = ?").get(res.lastInsertRowid);
  }
  console.log('Admin found/created:', { id: admin.id, username: admin.username, email: admin.email, role: admin.role });
  process.exit(0);
}

checkAdmin().catch(e => { console.error(e); process.exit(1); });
