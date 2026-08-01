/* ═══════════════════════════════════════════
   KrishiSetu — server/db.js
   (SQLite database setup with better-sqlite3)
   ═══════════════════════════════════════════ */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'krishisetu.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    /* ── Users ── */
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT    NOT NULL UNIQUE,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      role          TEXT    NOT NULL DEFAULT 'farmer'
                            CHECK(role IN ('farmer','owner','labourer','admin')),
      phone         TEXT,
      location      TEXT,
      bio           TEXT,
      skills        TEXT,
      avatar_url    TEXT,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    /* ── Sessions ── */
    CREATE TABLE IF NOT EXISTS sessions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token      TEXT    NOT NULL UNIQUE,
      expires_at TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    /* ── Land Listings ── */
    CREATE TABLE IF NOT EXISTS land_listings (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id          INTEGER NOT NULL REFERENCES users(id),
      title             TEXT    NOT NULL,
      description       TEXT,
      area_acres        REAL    NOT NULL,
      lease_type        TEXT    DEFAULT 'Per Season'
                                CHECK(lease_type IN ('Per Season','Per Month','Per Year')),
      price_per_season  INTEGER,
      price_per_month   INTEGER,
      price_per_year    INTEGER,
      location          TEXT    NOT NULL,
      district          TEXT,
      state             TEXT,
      soil_type         TEXT,
      water_source      TEXT,
      crop_history      TEXT,
      photo_url         TEXT,
      status            TEXT    DEFAULT 'pending'
                                CHECK(status IN ('pending','approved','rejected')),
      created_at        TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at        TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    /* ── Equipment Listings ── */
    CREATE TABLE IF NOT EXISTS equipment_listings (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      owner_id      INTEGER NOT NULL REFERENCES users(id),
      name          TEXT    NOT NULL,
      type          TEXT    NOT NULL,
      description   TEXT,
      price_per_hour INTEGER,
      price_per_day  INTEGER,
      location      TEXT    NOT NULL,
      district      TEXT,
      state         TEXT,
      with_operator INTEGER DEFAULT 0,
      photo_url     TEXT,
      status        TEXT    DEFAULT 'pending'
                            CHECK(status IN ('pending','approved','rejected')),
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    /* ── Labour Services ── */
    CREATE TABLE IF NOT EXISTS labour_services (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      worker_id       INTEGER NOT NULL REFERENCES users(id),
      title           TEXT    NOT NULL,
      description     TEXT,
      skills          TEXT,
      experience_years INTEGER DEFAULT 0,
      daily_rate      INTEGER,
      hourly_rate     INTEGER,
      location        TEXT    NOT NULL,
      district        TEXT,
      state           TEXT,
      availability    TEXT    DEFAULT 'available'
                              CHECK(availability IN ('available','busy','offline')),
      photo_url       TEXT,
      status          TEXT    DEFAULT 'pending'
                              CHECK(status IN ('pending','approved','rejected')),
      created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    /* ── Produce Listings ── */
    CREATE TABLE IF NOT EXISTS produce_listings (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_id     INTEGER NOT NULL REFERENCES users(id),
      crop_name     TEXT    NOT NULL,
      description   TEXT,
      quantity      REAL    NOT NULL,
      unit          TEXT    DEFAULT 'kg' CHECK(unit IN ('kg','quintal','tonne','piece')),
      price_per_unit INTEGER NOT NULL,
      location      TEXT    NOT NULL,
      district      TEXT,
      state         TEXT,
      quality_grade TEXT    DEFAULT 'A',
      photo_url     TEXT,
      status        TEXT    DEFAULT 'pending'
                            CHECK(status IN ('pending','approved','rejected')),
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    /* ── Bookings ── */
    CREATE TABLE IF NOT EXISTS bookings (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      booker_id       INTEGER NOT NULL REFERENCES users(id),
      owner_id        INTEGER NOT NULL REFERENCES users(id),
      listing_type    TEXT    NOT NULL CHECK(listing_type IN ('land','equipment','labour','produce')),
      listing_id      INTEGER NOT NULL,
      listing_title   TEXT,
      start_date      TEXT,
      end_date        TEXT,
      quantity        REAL    DEFAULT 1,
      total_price     INTEGER NOT NULL,
      status          TEXT    DEFAULT 'pending'
                              CHECK(status IN ('pending','confirmed','active','completed','cancelled')),
      payment_status  TEXT    DEFAULT 'unpaid'
                              CHECK(payment_status IN ('unpaid','escrow','released','refunded')),
      created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    /* ── Messages ── */
    CREATE TABLE IF NOT EXISTS messages (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id   INTEGER NOT NULL REFERENCES users(id),
      receiver_id INTEGER NOT NULL REFERENCES users(id),
      booking_id  INTEGER REFERENCES bookings(id),
      content     TEXT    NOT NULL,
      is_read     INTEGER DEFAULT 0,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    /* ── Payments (Escrow Ledger) ── */
    CREATE TABLE IF NOT EXISTS payments (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id      INTEGER NOT NULL REFERENCES bookings(id),
      payer_id        INTEGER NOT NULL REFERENCES users(id),
      payee_id        INTEGER NOT NULL REFERENCES users(id),
      amount          INTEGER NOT NULL,
      status          TEXT    DEFAULT 'held'
                              CHECK(status IN ('held','released','refunded')),
      method          TEXT    DEFAULT 'upi',
      transaction_ref TEXT,
      created_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    /* ── Reviews ── */
    CREATE TABLE IF NOT EXISTS reviews (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      reviewer_id INTEGER NOT NULL REFERENCES users(id),
      reviewee_id INTEGER NOT NULL REFERENCES users(id),
      booking_id  INTEGER NOT NULL REFERENCES bookings(id),
      rating      INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
      comment     TEXT,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    /* ── Indexes ── */
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_land_owner ON land_listings(owner_id);
    CREATE INDEX IF NOT EXISTS idx_land_status ON land_listings(status);
    CREATE INDEX IF NOT EXISTS idx_equip_owner ON equipment_listings(owner_id);
    CREATE INDEX IF NOT EXISTS idx_equip_status ON equipment_listings(status);
    CREATE INDEX IF NOT EXISTS idx_labour_worker ON labour_services(worker_id);
    CREATE INDEX IF NOT EXISTS idx_labour_status ON labour_services(status);
    CREATE INDEX IF NOT EXISTS idx_produce_seller ON produce_listings(seller_id);
    CREATE INDEX IF NOT EXISTS idx_produce_status ON produce_listings(status);
    CREATE INDEX IF NOT EXISTS idx_bookings_booker ON bookings(booker_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_owner ON bookings(owner_id);
    CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
    CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
    CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
  `);

  // ── Add new columns to existing users table if missing ──
  const cols = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
  const addCol = (name, type) => {
    if (!cols.includes(name)) {
      db.exec(`ALTER TABLE users ADD COLUMN ${name} ${type}`);
    }
  };
  addCol('bio', 'TEXT');
  addCol('skills', 'TEXT');
  addCol('gender', 'TEXT');
  addCol('dob', 'TEXT');
  addCol('govt_id_url', 'TEXT');
  addCol('village', 'TEXT');
  addCol('taluka', 'TEXT');
  addCol('district', 'TEXT');
  addCol('state', 'TEXT');
  addCol('labour_category', 'TEXT');
  addCol('skill_level', 'TEXT');
  addCol('bank_account', 'TEXT');
  addCol('ifsc', 'TEXT');
  addCol('upi_id', 'TEXT');
  addCol('farm_size', 'TEXT');
  addCol('farm_lat', 'REAL');
  addCol('farm_lng', 'REAL');
  addCol('phone_verified', 'INTEGER DEFAULT 0');
  ensureServiceSchema();
}

function ensureServiceSchema() {
  db.exec(`
    /* ── OTP Verifications ── */
    CREATE TABLE IF NOT EXISTS otp_verifications (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      phone      TEXT    NOT NULL,
      otp        TEXT    NOT NULL,
      expires_at TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    /* ── Service Bookings (Agricultural Services & Labour Teams) ── */
    CREATE TABLE IF NOT EXISTS service_bookings (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id         INTEGER NOT NULL REFERENCES users(id),
      kind            TEXT    NOT NULL DEFAULT 'service'
                              CHECK(kind IN ('labour_team','service')),
      category        TEXT,
      service_name    TEXT,
      num_workers     INTEGER,
      days            INTEGER,
      team_type       TEXT,
      skill_level     TEXT,
      start_date      TEXT,
      location        TEXT,
      lat             REAL,
      lng             REAL,
      description     TEXT,
      price           INTEGER,
      status          TEXT    DEFAULT 'pending'
                              CHECK(status IN ('pending','confirmed','completed','cancelled')),
      created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

module.exports = { getDb };
