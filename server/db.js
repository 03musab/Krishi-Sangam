/* ═══════════════════════════════════════════
   Krishi Sangam — server/db.js
   (PostgreSQL connection + better-sqlite3-compatible facade)
   ═══════════════════════════════════════════ */

require('dotenv').config();
const { Pool, types } = require('pg');

// BIGINT (int8, oid 20) → Number so API responses match the old SQLite output
// (ids, counts, sums, amounts were numbers before — keep them numbers).
types.setTypeParser(20, (v) => (v === null ? null : parseInt(v, 10)));
// NUMERIC (oid 1700) → Number
types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v)));

let pool;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL is not set. Add it to server/.env (see .env.example).'
      );
    }
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      // Supabase requires TLS; disable only when DATABASE_SSL=false is set
      ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
    });
  }
  return pool;
}

/* ── SQLite → Postgres SQL translation ─────────────────────────
   Keeps the existing route SQL strings unchanged:
   •  datetime('now')  → NOW()
   •  LIKE             → ILIKE  (SQLite LIKE is case-insensitive)
   •  ?                → $1..$n (Postgres numbered placeholders)
*/
function translate(sql) {
  let out = String(sql).replace(/datetime\(\s*'now'\s*\)/gi, 'NOW()');
  out = out.replace(/\bLIKE\b/gi, 'ILIKE');
  let n = 0;
  out = out.replace(/\?/g, () => `$${++n}`);
  return out;
}

/* ── Facade: mirrors better-sqlite3's prepare().get/all/run ────
   All methods are async (return Promises). Handlers must await them.
*/
function prepare(sql) {
  return {
    async get(...params) {
      const { rows } = await getPool().query(translate(sql), params);
      return rows[0];
    },
    async all(...params) {
      const { rows } = await getPool().query(translate(sql), params);
      return rows;
    },
    async run(...params) {
      const trimmed = String(sql).trim();
      const isInsert = /^INSERT/i.test(trimmed);
      const translated = translate(sql);
      // Append RETURNING id on INSERT so lastInsertRowid works as before
      const finalSql = isInsert
        ? `${translated} RETURNING id`
        : translated;
      const res = await getPool().query(finalSql, params);
      return {
        changes: res.rowCount ?? 0,
        lastInsertRowid: res.rows && res.rows[0] ? res.rows[0].id : undefined
      };
    }
  };
}

/* Execute raw SQL (multi-statement, no params — e.g. schema bootstrap). */
async function exec(sql) {
  await getPool().query(sql);
}

const db = { prepare, exec, getPool };

function getDb() {
  return db;
}

module.exports = { getDb, getPool };
