/* ═══════════════════════════════════════════
   Krishi Sangam — server/scripts/create-admin.js
   Creates (or resets) the admin account.
   Idempotent — safe to run any number of times.

   Usage:
     node server/scripts/create-admin.js

   Optional overrides (env vars):
     ADMIN_USERNAME  (default: admin)
     ADMIN_EMAIL     (default: admin@krishisangam.com)
     ADMIN_PASSWORD  (default: Admin@123)
     ADMIN_PHONE     (default: 9999999999)
   ═══════════════════════════════════════════ */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getDb } = require('../db');

const USERNAME = process.env.ADMIN_USERNAME || 'admin';
const EMAIL = process.env.ADMIN_EMAIL || 'admin@krishisangam.com';
const PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const PHONE = process.env.ADMIN_PHONE || '9999999999';
const SALT_ROUNDS = 10;

async function ensureAdmin() {
  const db = getDb();

  if (!PASSWORD || PASSWORD.length < 6) {
    throw new Error('Admin password must be at least 6 characters.');
  }

  const passwordHash = bcrypt.hashSync(PASSWORD, SALT_ROUNDS);

  try {
    const existing = await db.prepare(
      'SELECT id, username, email FROM users WHERE username = ? OR email = ?'
    ).get(USERNAME, EMAIL);

    if (existing) {
      await db.prepare(
        "UPDATE users SET role = 'admin', password_hash = ?, phone = ?, email = ? WHERE id = ?"
      ).run(passwordHash, PHONE, EMAIL, existing.id);
      console.log(`✅ Updated existing account "${existing.username}" to admin role.`);
    } else {
      const info = await db.prepare(
        `INSERT INTO users (username, email, password_hash, role, phone, location)
         VALUES (?, ?, ?, 'admin', ?, 'Thane, Maharashtra')`
      ).run(USERNAME, EMAIL, passwordHash, PHONE);
      console.log(`✅ Admin account created (id ${info.lastInsertRowid}).`);
    }
  } catch (err) {
    if (String(err.message || '').toLowerCase().includes('duplicate') || String(err.message || '').includes('unique')) {
      throw new Error(
        `The email "${EMAIL}" (or username "${USERNAME}") is already taken by another account. ` +
        `Use different ADMIN_EMAIL / ADMIN_USERNAME values, or pick the username of the existing account.`
      );
    }
    throw err;
  }

  if (PASSWORD === 'Admin@123') {
    console.log('   ⚠️  Using the default password — set ADMIN_PASSWORD to a strong password before going to production.');
  }

  console.log('');
  console.log('   ┌─────────────────────────────────────────┐');
  console.log('   │  Admin login credentials                │');
  console.log(`   │  Email:    ${EMAIL.padEnd(24)}│`);
  console.log(`   │  Password: ${PASSWORD.padEnd(24)}│`);
  console.log('   └─────────────────────────────────────────┘');
  console.log('   Sign in at /signin with these credentials.');
  console.log('');
}

async function main() {
  try {
    await ensureAdmin();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create admin:', err);
    console.error('   → Is DATABASE_URL set in server/.env? (see .env.example)');
    process.exit(1);
  }
}

main();
