/* ═══════════════════════════════════════════
   KrishiSetu — server/routes/profile.js
   (Profile Update & Password Change)
   ═══════════════════════════════════════════ */

const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const SALT_ROUNDS = 10;

/* ── GET /api/profile — Get my profile ── */
router.get('/', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare(
      `SELECT id, username, email, role, phone, location, bio, skills,
              avatar_url, created_at, updated_at FROM users WHERE id = ?`
    ).get(req.user.id);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── PUT /api/profile — Update profile ── */
router.put('/', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { username, phone, location, bio, skills, avatar_url } = req.body;

    // Check username uniqueness if changed
    if (username && username !== req.user.username) {
      const existing = db.prepare('SELECT id FROM users WHERE username = ? AND id != ?')
        .get(username, req.user.id);
      if (existing) {
        return res.status(409).json({ error: 'Username already taken.' });
      }
    }

    db.prepare(`
      UPDATE users SET
        username = COALESCE(?, username),
        phone = COALESCE(?, phone),
        location = COALESCE(?, location),
        bio = COALESCE(?, bio),
        skills = COALESCE(?, skills),
        avatar_url = COALESCE(?, avatar_url),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(username || null, phone ?? null, location ?? null,
           bio ?? null, skills ?? null, avatar_url ?? null, req.user.id);

    const user = db.prepare(
      `SELECT id, username, email, role, phone, location, bio, skills,
              avatar_url, created_at, updated_at FROM users WHERE id = ?`
    ).get(req.user.id);

    res.json({ message: 'Profile updated.', user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── PUT /api/profile/password — Change password ── */
router.put('/password', authenticateToken, (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current and new password are required.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const db = getDb();
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);

    const valid = bcrypt.compareSync(current_password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const newHash = bcrypt.hashSync(new_password, SALT_ROUNDS);
    db.prepare(`UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`)
      .run(newHash, req.user.id);

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── GET /api/profile/:userId — Public profile ── */
router.get('/:userId', (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare(
      `SELECT id, username, role, location, bio, skills, avatar_url, created_at
       FROM users WHERE id = ?`
    ).get(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
