/* ═══════════════════════════════════════════
   KrishiSetu — server/routes/produce.js
   (Produce Marketplace CRUD — async, Postgres)
   ═══════════════════════════════════════════ */

const express = require('express');
const { getDb } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

/* ── GET /api/produce — List all approved produce ── */
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { search, district, state, crop, min_price, max_price } = req.query;

    let query = `SELECT p.*, u.username as seller_name, u.phone as seller_phone
                 FROM produce_listings p
                 JOIN users u ON p.seller_id = u.id
                 WHERE p.status = 'approved'`;
    const params = [];

    if (search) {
      query += ` AND (p.crop_name LIKE ? OR p.location LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (district) { query += ` AND p.district = ?`; params.push(district); }
    if (state) { query += ` AND p.state = ?`; params.push(state); }
    if (crop) { query += ` AND p.crop_name LIKE ?`; params.push(`%${crop}%`); }
    if (min_price) { query += ` AND p.price_per_unit >= ?`; params.push(Number(min_price)); }
    if (max_price) { query += ` AND p.price_per_unit <= ?`; params.push(Number(max_price)); }

    query += ` ORDER BY p.created_at DESC`;
    const listings = await db.prepare(query).all(...params);
    res.json({ listings, count: listings.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── GET /api/produce/my ── */
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const listings = await db.prepare(
      `SELECT * FROM produce_listings WHERE seller_id = ? ORDER BY created_at DESC`
    ).all(req.user.id);
    res.json({ listings, count: listings.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── GET /api/produce/pending ── */
router.get('/pending', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const db = getDb();
    const listings = await db.prepare(
      `SELECT p.*, u.username as seller_name
       FROM produce_listings p JOIN users u ON p.seller_id = u.id
       WHERE p.status = 'pending' ORDER BY p.created_at DESC`
    ).all();
    res.json({ listings, count: listings.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── GET /api/produce/:id ── */
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const listing = await db.prepare(
      `SELECT p.*, u.username as seller_name, u.phone as seller_phone
       FROM produce_listings p JOIN users u ON p.seller_id = u.id WHERE p.id = ?`
    ).get(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found.' });
    res.json({ listing });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── POST /api/produce — Create ── */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const { crop_name, description, quantity, unit, price_per_unit,
            location, district, state, quality_grade, photo_url } = req.body;

    if (!crop_name || !quantity || !price_per_unit || !location) {
      return res.status(400).json({ error: 'Crop name, quantity, price, and location are required.' });
    }

    const result = await db.prepare(`
      INSERT INTO produce_listings (seller_id, crop_name, description, quantity, unit,
        price_per_unit, location, district, state, quality_grade, photo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, crop_name, description || null, quantity,
           unit || 'kg', price_per_unit, location,
           district || null, state || null, quality_grade || 'A', photo_url || null);

    const listing = await db.prepare('SELECT * FROM produce_listings WHERE id = ?')
      .get(result.lastInsertRowid);
    res.status(201).json({ message: 'Produce listing created! Awaiting approval.', listing });
  } catch (err) {
    console.error('Create produce error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── PUT /api/produce/:id ── */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const listing = await db.prepare('SELECT * FROM produce_listings WHERE id = ?').get(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found.' });
    if (listing.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const { crop_name, description, quantity, unit, price_per_unit,
            location, district, state, quality_grade, photo_url } = req.body;

    await db.prepare(`
      UPDATE produce_listings SET crop_name=?, description=?, quantity=?, unit=?,
        price_per_unit=?, location=?, district=?, state=?, quality_grade=?,
        photo_url=?, updated_at=NOW() WHERE id=?
    `).run(crop_name || listing.crop_name, description ?? listing.description,
           quantity || listing.quantity, unit || listing.unit,
           price_per_unit || listing.price_per_unit,
           location || listing.location, district ?? listing.district,
           state ?? listing.state, quality_grade || listing.quality_grade,
           photo_url ?? listing.photo_url, req.params.id);

    const updated = await db.prepare('SELECT * FROM produce_listings WHERE id = ?').get(req.params.id);
    res.json({ message: 'Updated.', listing: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── DELETE /api/produce/:id ── */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const listing = await db.prepare('SELECT * FROM produce_listings WHERE id = ?').get(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found.' });
    if (listing.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    await db.prepare('DELETE FROM produce_listings WHERE id = ?').run(req.params.id);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── PUT /api/produce/:id/status — Admin ── */
router.put('/:id/status', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const db = getDb();
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected.' });
    }
    await db.prepare(`UPDATE produce_listings SET status=?, updated_at=NOW() WHERE id=?`)
      .run(status, req.params.id);
    res.json({ message: `Listing ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
