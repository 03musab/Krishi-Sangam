/* ═══════════════════════════════════════════
   KrishiSetu — server/server.js
   (Express server entry point)
   ═══════════════════════════════════════════ */

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
const { getDb } = require('./db');

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
// Serve the root directory so index.html, css/, js/ work from the API server
// NOTE: placed AFTER API routes so API requests are never intercepted
app.use(express.static(path.join(__dirname, '..')));

/* ── Serve Uploads ───────────────────────── */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* ── SPA fallback: serve index.html for all non-API routes ── */
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
});

/* ── Initialize Database & Start Server ──── */
try {
  const db = getDb();

  // Clean up expired sessions on startup
  const deleted = db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();
  if (deleted.changes > 0) {
    console.log(`🧹 Cleaned up ${deleted.changes} expired session(s)`);
  }

  console.log('✅ SQLite database initialized');

  app.listen(PORT, () => {
    console.log(`\n🌾 KrishiSetu API Server`);
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
    console.log(`   └── App:    http://localhost:${PORT}\n`);
  });
} catch (err) {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
}
