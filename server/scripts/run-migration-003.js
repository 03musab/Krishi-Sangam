require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { getDb } = require('../db');

async function run() {
  try {
    const db = getDb();
    const sqlPath = path.join(__dirname, '../sql/003_smart_matching_and_reviews.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('Running Migration 003...');
    await db.exec(sql);
    console.log('✅ Migration 003 executed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration 003 failed:', err);
    process.exit(1);
  }
}

run();
