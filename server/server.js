/* ═══════════════════════════════════════════
   Krishi Sangam — server/server.js
   (Express server entry point)
   ═══════════════════════════════════════════ */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const landRoutes = require('./routes/land');
const equipmentRoutes = require('./routes/equipment');
const labourRoutes = require('./routes/labour');
const produceRoutes = require('./routes/produce');
const bookingsRoutes = require('./routes/bookings');
const messagesRoutes = require('./routes/messages');
const paymentsRoutes = require('./routes/payments');
const profileRoutes = require('./routes/profile');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const servicesRoutes = require('./routes/services');
const { getPool } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

/* ── Middleware ───────────────────────────── */
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, file:// protocol)
    const allowedOrigins = [
      'http://localhost:3000', 'http://127.0.0.1:3000',
      'http://localhost:5500', 'http://127.0.0.1:5500',
      `http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true
}));
app.use(express.json());

/* ── Request Logger ───────────────────────── */
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

/* ── API Routes (defined BEFORE static files) ── */
app.use('/api/auth', authRoutes);
app.use('/api/land', landRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/labour', labourRoutes);
app.use('/api/produce', produceRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', servicesRoutes);

/* ── Health Check ─────────────────────────── */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/* ── Catch-all for unmatched API routes ───── */
// Returns JSON instead of HTML for any unmatched API method/path
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

/* ── Serve Static Frontend Files ──────────── */
// Serve the React build (client/dist); NOTE: placed AFTER API routes so API requests are never intercepted
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

/* ── Serve Uploads ───────────────────────── */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ── SPA fallback: serve React index.html for all non-API routes ── */
const indexFile = path.join(clientDist, 'index.html');
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(indexFile);
  }
});

/* ── Initialize Database & Start Server ──── */
async function init() {
  try {
    const { getPool } = require('./db');
    const pool = getPool();

    // Verify connection & clean up expired sessions on startup
    await pool.query('SELECT 1');

    // Idempotently add new columns to existing databases
    // (fresh installs get them from sql/schema.sql)
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS id_type TEXT');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS id_number TEXT');
    await pool.query('ALTER TABLE equipment_listings ADD COLUMN IF NOT EXISTS deposit INTEGER');
    // OTP delivery tracking (provider, request_id, delivery status)
    await pool.query('ALTER TABLE otp_verifications ADD COLUMN IF NOT EXISTS provider TEXT');
    await pool.query('ALTER TABLE otp_verifications ADD COLUMN IF NOT EXISTS request_id TEXT');
    await pool.query('ALTER TABLE otp_verifications ADD COLUMN IF NOT EXISTS delivery_status TEXT');
    await pool.query('ALTER TABLE otp_verifications ADD COLUMN IF NOT EXISTS delivery_checked_at TIMESTAMPTZ');
    // Messages can reference the listing they were sent about (for "view listing" links in chat)
    await pool.query('ALTER TABLE messages ADD COLUMN IF NOT EXISTS listing_type TEXT');
    await pool.query('ALTER TABLE messages ADD COLUMN IF NOT EXISTS listing_id BIGINT');
    // Messages can carry an attached image (help chats, screenshots, etc.)
    await pool.query('ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT');
    // Groups the fan-out copies of a user's help message (one per admin)
    await pool.query('ALTER TABLE messages ADD COLUMN IF NOT EXISTS help_uid TEXT');
    // service_bookings can now be an equipment-with-operator request too
    await pool.query(`
      DO $$ BEGIN
        ALTER TABLE service_bookings DROP CONSTRAINT IF EXISTS service_bookings_kind_check;
        ALTER TABLE service_bookings ADD CONSTRAINT service_bookings_kind_check
          CHECK (kind IN ('labour_team','service','equipment'));
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    const deleted = await pool.query("DELETE FROM sessions WHERE expires_at < NOW()");
    if (deleted.rowCount > 0) {
      console.log(`🧹 Cleaned up ${deleted.rowCount} expired session(s)`);
    }

    console.log('✅ PostgreSQL database connected');

    app.listen(PORT, () => {
    console.log(`\n🌾 Krishi Sangam API Server`);
    console.log(`   └── Running on http://localhost:${PORT}`);
    console.log(`   └── Health: http://localhost:${PORT}/api/health`);
    console.log(`   └── Auth:     http://localhost:${PORT}/api/auth`);
    console.log(`   └── Land:     http://localhost:${PORT}/api/land`);
    console.log(`   └── Equip:    http://localhost:${PORT}/api/equipment`);
    console.log(`   └── Labour:   http://localhost:${PORT}/api/labour`);
    console.log(`   └── Produce:  http://localhost:${PORT}/api/produce`);
    console.log(`   └── Bookings: http://localhost:${PORT}/api/bookings`);
    console.log(`   └── Messages: http://localhost:${PORT}/api/messages`);
    console.log(`   └── Payments: http://localhost:${PORT}/api/payments`);
    console.log(`   └── Profile:  http://localhost:${PORT}/api/profile`);
    console.log(`   └── Upload:   http://localhost:${PORT}/api/upload`);
    console.log(`   └── Admin:    http://localhost:${PORT}/api/admin`);
    console.log(`   └── Services: http://localhost:${PORT}/api/services`);
    console.log(`   └── App:    http://localhost:${PORT}\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    console.error('   → Is DATABASE_URL set in server/.env? (see .env.example)');
    process.exit(1);
  }
}

init();
