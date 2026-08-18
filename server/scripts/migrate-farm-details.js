#!/usr/bin/env node
/* ═══════════════════════════════════════════
   Migration 002 — Farm detail columns
   Adds 8 new columns to the users table.

   Usage:
     cd server && node scripts/migrate-farm-details.js
   ═══════════════════════════════════════════ */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs   = require('fs');
const path = require('path');
const { getPool } = require('../db');

const SQL_FILE = path.join(__dirname, '..', 'sql', '002_farm_details.sql');

async function run() {
  const pool = getPool();
  const sql  = fs.readFileSync(SQL_FILE, 'utf8');

  // Split on semicolons and filter out blank / comment-only chunks
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('/*') && !s.startsWith('--'));

  console.log(`\n🔧  Running migration 002 — farm details`);
  console.log(`   Found ${statements.length} statement(s) in 002_farm_details.sql\n`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await pool.query(stmt);
      // Extract the column name from the statement for a friendly log
      const colMatch = stmt.match(/ADD COLUMN IF NOT EXISTS\s+(\w+)/i);
      const col = colMatch ? colMatch[1] : `statement ${i + 1}`;
      console.log(`   ✅  ${col}`);
    } catch (err) {
      // If the column already exists (column already exists error), skip gracefully
      if (err.code === '42701') {
        console.log(`   ⏭️  column already exists — skipped`);
      } else {
        console.error(`   ❌  Statement ${i + 1} failed:`, err.message);
        process.exit(1);
      }
    }
  }

  console.log('\n✨  Migration 002 complete.\n');
  await pool.end();
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
