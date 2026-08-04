/* ═══════════════════════════════════════════
   KrishiSetu — server/routes/equipment.js
   (Equipment Listings CRUD — async, Postgres)
   ═══════════════════════════════════════════ */

const express = require('express');
const { getDb } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

/* ── GET /api/equipment — List all approved equipment ── */
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { search, type, district, state, min_price, max_price } = req.query;

    let query = `SELECT e.*, u.username as owner_name, u.phone as owner_phone
                 FROM equipment_listings e
                 JOIN users u ON e.owner_id = u.id
                 WHERE e.status = 'approved'`;
    const params = [];

    if (search) {
      query += ` AND (e.name LIKE ? OR e.type LIKE ? OR e.location LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (type) { query += ` AND e.type = ?`; params.push(type); }
    if (district) { query += ` AND e.district = ?`; params.push(district); }
    if (state) { query += ` AND e.state = ?`; params.push(state); }
    if (min_price) { query += ` AND e.price_per_day >= ?`; params.push(Number(min_price)); }
    if (max_price) { query += ` AND e.price_per_day <= ?`; params.push(Number(max_price)); }

    query += ` ORDER BY e.created_at DESC`;
    const listings = await db.prepare(query).all(...params);
    res.json({ listings, count: listings.length });
  } catch (err) {
    console.error('Get equipment error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── GET /api/equipment/my ── */
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const listings = await db.prepare(
      `SELECT * FROM equipment_listings WHERE owner_id = ? ORDER BY created_at DESC`
    ).all(req.user.id);
    res.json({ listings, count: listings.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── GET /api/equipment/pending ── */
router.get('/pending', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const db = getDb();
    const listings = await db.prepare(
      `SELECT e.*, u.username as owner_name
       FROM equipment_listings e JOIN users u ON e.owner_id = u.id
       WHERE e.status = 'pending' ORDER BY e.created_at DESC`
    ).all();
    res.json({ listings, count: listings.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── GET /api/equipment/:id ── */
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const listing = await db.prepare(
      `SELECT e.*, u.username as owner_name, u.phone as owner_phone
       FROM equipment_listings e JOIN users u ON e.owner_id = u.id WHERE e.id = ?`
    ).get(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    res.json({ listing });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── POST /api/equipment — Create ── */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const { name, type, description, price_per_hour, price_per_day, deposit,
            location, district, state, with_operator, photo_url } = req.body;

    if (!name || !type || !location) {
      return res.status(400).json({ error: 'Name, type, and location are required.' });
    }

    const result = await db.prepare(`
      INSERT INTO equipment_listings (owner_id, name, type, description,
        price_per_hour, price_per_day, deposit, location, district, state, with_operator, photo_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')
    `).run(req.user.id, name, type, description || null,
           price_per_hour || null, price_per_day || null, deposit || null,
           location, district || null, state || null,
           with_operator ? 1 : 0, photo_url || null);

    const listing = await db.prepare('SELECT * FROM equipment_listings WHERE id = ?')
      .get(result.lastInsertRowid);
    res.status(201).json({ message: 'Equipment listing created!', listing });
  } catch (err) {
    console.error('Create equipment error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── PUT /api/equipment/:id ── */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const listing = await db.prepare('SELECT * FROM equipment_listings WHERE id = ?').get(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found.' });
    if (listing.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const { name, type, description, price_per_hour, price_per_day, deposit,
            location, district, state, with_operator, photo_url } = req.body;

    await db.prepare(`
      UPDATE equipment_listings SET name=?, type=?, description=?, price_per_hour=?,
        price_per_day=?, deposit=?, location=?, district=?, state=?, with_operator=?, photo_url=?,
        updated_at=NOW() WHERE id=?
    `).run(name || listing.name, type || listing.type, description ?? listing.description,
           price_per_hour ?? listing.price_per_hour, price_per_day ?? listing.price_per_day,
           deposit ?? listing.deposit,
           location || listing.location, district ?? listing.district, state ?? listing.state,
           with_operator !== undefined ? (with_operator ? 1 : 0) : listing.with_operator,
           photo_url ?? listing.photo_url, req.params.id);

    const updated = await db.prepare('SELECT * FROM equipment_listings WHERE id = ?').get(req.params.id);
    res.json({ message: 'Updated.', listing: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── DELETE /api/equipment/:id ── */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const listing = await db.prepare('SELECT * FROM equipment_listings WHERE id = ?').get(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Not found.' });
    if (listing.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    await db.prepare('DELETE FROM equipment_listings WHERE id = ?').run(req.params.id);
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── PUT /api/equipment/:id/status — Admin ── */
router.put('/:id/status', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const db = getDb();
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected.' });
    }
    await db.prepare(`UPDATE equipment_listings SET status=?, updated_at=NOW() WHERE id=?`)
      .run(status, req.params.id);
    res.json({ message: `Listing ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
