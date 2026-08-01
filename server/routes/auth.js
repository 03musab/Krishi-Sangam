/* ═══════════════════════════════════════════
   KrishiSetu — server/routes/auth.js
   (Authentication routes: signup, signin, me)
   ═══════════════════════════════════════════ */

const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db');
const { authenticateToken, generateToken } = require('../middleware/auth');

const router = express.Router();

const SALT_ROUNDS = 10;
const SESSION_DAYS = 7;

/* ── POST /api/auth/signup ─────────────────── */
router.post('/signup', (req, res) => {
  try {
    const { username, email, password, role, phone, location } = req.body;

    // ── Validation ──
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    const validRoles = ['farmer', 'owner', 'labourer', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'farmer';

    const db = getDb();

    // ── Check duplicates ──
    const existingUser = db.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    ).get(email, username);

    if (existingUser) {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }

    // ── Create user ──
    const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);

    const result = db.prepare(`
      INSERT INTO users (username, email, password_hash, role, phone, location)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(username, email, passwordHash, userRole, phone || null, location || null);

    const userId = result.lastInsertRowid;

    // ── Generate token & create session ──
    const token = generateToken(userId);
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `).run(userId, token, expiresAt);

    // ── Response ──
    const user = db.prepare(
      'SELECT id, username, email, role, phone, location, avatar_url, created_at FROM users WHERE id = ?'
    ).get(userId);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

/* ── POST /api/auth/signin ─────────────────── */
router.post('/signin', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = getDb();

    // ── Find user ──
    const user = db.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // ── Verify password ──
    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // ── Generate token & create session ──
    const token = generateToken(user.id);
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `).run(user.id, token, expiresAt);

    // ── Response (exclude password_hash) ──
    const { password_hash, ...safeUser } = user;

    res.json({
      message: 'Signed in successfully!',
      token,
      user: safeUser
    });

  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Server error during signin.' });
  }
});

/* ── GET /api/auth/me ──────────────────────── */
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

/* ── POST /api/auth/signout ────────────────── */
router.post('/signout', authenticateToken, (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    const db = getDb();
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);

    res.json({ message: 'Signed out successfully.' });
  } catch (err) {
    console.error('Signout error:', err);
    res.status(500).json({ error: 'Server error during signout.' });
  }
});

module.exports = router;
