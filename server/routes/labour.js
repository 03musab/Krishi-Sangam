/* ═══════════════════════════════════════════
   KrishiSetu — server/routes/labour.js
   (Labour Services CRUD)
   ═══════════════════════════════════════════ */

const express = require('express');
const { getDb } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

/* ── GET /api/labour — List all approved labour ── */
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { search, district, state, skill, min_rate, max_rate } = req.query;

    let query = `SELECT l.*, u.username as worker_name, u.phone as worker_phone, u.avatar_url
                 FROM labour_services l
                 JOIN users u ON l.worker_id = u.id
                 WHERE l.status = 'approved'`;
    const params = [];

    if (search) {
      query += ` AND (l.title LIKE ? OR l.location LIKE ? OR l.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (district) { query += ` AND l.district = ?`; params.push(district); }
    if (state) { query += ` AND l.state = ?`; params.push(state); }
    if (skill) { query += ` AND l.skills LIKE ?`; params.push(`%${skill}%`); }
    if (min_rate) { query += ` AND (l.daily_rate >= ? OR l.hourly_rate >= ?)`; params.push(Number(min_rate), Number(min_rate)); }
    if (max_rate) { query += ` AND (l.daily_rate <= ? OR l.hourly_rate <= ?)`; params.push(Number(max_rate), Number(max_rate)); }

    query += ` ORDER BY l.created_at DESC`;
    const listings = db.prepare(query).all(...params);
    res.json({ listings, count: listings.length });
  } catch (err) {
    console.error('Get labour error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── GET /api/labour/my ── */
router.get('/my', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const listings = db.prepare(
      `SELECT * FROM labour_services WHERE worker_id = ? ORDER BY created_at DESC`
    ).all(req.user.id);
    res.json({ listings, count: listings.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── GET /api/labour/pending ── */
router.get('/pending', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const db = getDb();
    const listings = db.prepare(
      `SELECT l.*, u.username as worker_name
       FROM labour_services l JOIN users u ON l.worker_id = u.id
       WHERE l.status = 'pending' ORDER BY l.created_at DESC`
    ).all();
    res.json({ listings, count: listings.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── GET /api/labour/:id ── */
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const listing = db.prepare(
      `SELECT l.*, u.username as worker_name, u.phone as worker_phone, u.avatar_url
       FROM labour_services l JOIN users u ON l.worker_id = u.id WHERE l.id = ?`
    ).get(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found.' });
    res.json({ listing });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── POST /api/labour — Create ── */
router.post('/', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { title, description, skills, experience_years, daily_rate,
            hourly_rate, location, district, state, photo_url } = req.body;

    if (!title || !location) {
      return res.status(400).json({ error: 'Title and location are required.' });
    }

    const result = db.prepare(`
      INSERT INTO labour_services (worker_id, title, description, skills,
        experience_years, daily_rate, hourly_rate, location, district, state, photo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, title, description || null, skills || null,
           experience_years || 0, daily_rate || null, hourly_rate || null,
           location, district || null, state || null, photo_url || null);

    const listing = db.prepare('SELECT * FROM labour_services WHERE id = ?')
      .get(result.lastInsertRowid);
    res.status(201).json({ message: 'Labour listing created! Awaiting approval.', listing });
  } catch (err) {
    console.error('Create labour error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── PUT /api/labour/:id ── */
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const listing = db.prepare('SELECT * FROM labour_services WHERE id = ?').get(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found.' });
    if (listing.worker_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const { title, description, skills, experience_years, daily_rate,
            hourly_rate, location, district, state, availability, photo_url } = req.body;

    db.prepare(`
      UPDATE labour_services SET title=?, description=?, skills=?, experience_years=?,
        daily_rate=?, hourly_rate=?, location=?, district=?, state=?, availability=?,
        photo_url=?, updated_at=datetime('now') WHERE id=?
    `).run(title || listing.title, description ?? listing.description,
           skills ?? listing.skills, experience_years ?? listing.experience_years,
           daily_rate ?? listing.daily_rate, hourly_rate ?? listing.hourly_rate,
           location || listing.location, district ?? listing.district,
           state ?? listing.state, availability || listing.availability,
           photo_url ?? listing.photo_url, req.params.id);

    const updated = db.prepare('SELECT * FROM labour_services WHERE id = ?').get(req.params.id);
    res.json({ message: 'Updated.', listing: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── DELETE /api/labour/:id ── */
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const listing = db.prepare('SELECT * FROM labour_services WHERE id = ?').get(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found.' });
    if (listing.worker_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    db.prepare('DELETE FROM labour_services WHERE id = ?').run(req.params.id);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── PUT /api/labour/:id/status — Admin ── */
router.put('/:id/status', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const db = getDb();
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected.' });
    }
    db.prepare(`UPDATE labour_services SET status=?, updated_at=datetime('now') WHERE id=?`)
      .run(status, req.params.id);
    res.json({ message: `Listing ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
