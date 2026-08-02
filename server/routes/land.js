/* ═══════════════════════════════════════════
   KrishiSetu — server/routes/land.js
   (Land Listings CRUD — async, Postgres)
   ═══════════════════════════════════════════ */

const express = require('express');
const { getDb } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

/* ── GET /api/land — List all approved land ── */
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { search, district, state, soil_type, min_acres, max_acres, sort } = req.query;

    let query = `SELECT l.*, u.username as owner_name, u.phone as owner_phone
                 FROM land_listings l
                 JOIN users u ON l.owner_id = u.id
                 WHERE l.status = 'approved'`;
    const params = [];

    if (search) {
      query += ` AND (l.title LIKE ? OR l.location LIKE ? OR l.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (district) {
      query += ` AND l.district = ?`;
      params.push(district);
    }
    if (state) {
      query += ` AND l.state = ?`;
      params.push(state);
    }
    if (soil_type) {
      query += ` AND l.soil_type = ?`;
      params.push(soil_type);
    }
    if (min_acres) {
      query += ` AND l.area_acres >= ?`;
      params.push(Number(min_acres));
    }
    if (max_acres) {
      query += ` AND l.area_acres <= ?`;
      params.push(Number(max_acres));
    }

    query += ` ORDER BY l.created_at DESC`;

    const listings = await db.prepare(query).all(...params);
    res.json({ listings, count: listings.length });
  } catch (err) {
    console.error('Get land listings error:', err);
    res.status(500).json({ error: 'Server error fetching land listings.' });
  }
});

/* ── GET /api/land/my — My listings ── */
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const listings = await db.prepare(
      `SELECT * FROM land_listings WHERE owner_id = ? ORDER BY created_at DESC`
    ).all(req.user.id);
    res.json({ listings, count: listings.length });
  } catch (err) {
    console.error('Get my land listings error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── GET /api/land/pending — Admin: pending listings ── */
router.get('/pending', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const db = getDb();
    const listings = await db.prepare(
      `SELECT l.*, u.username as owner_name
       FROM land_listings l JOIN users u ON l.owner_id = u.id
       WHERE l.status = 'pending' ORDER BY l.created_at DESC`
    ).all();
    res.json({ listings, count: listings.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── GET /api/land/:id — Single listing ── */
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const listing = await db.prepare(
      `SELECT l.*, u.username as owner_name, u.phone as owner_phone
       FROM land_listings l JOIN users u ON l.owner_id = u.id
       WHERE l.id = ?`
    ).get(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found.' });
    }
    res.json({ listing });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── POST /api/land — Create listing ── */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const { title, description, area_acres, lease_type, price_per_season,
            price_per_month, price_per_year, location, district, state,
            soil_type, water_source, crop_history, photo_url } = req.body;

    if (!title || !area_acres || !location) {
      return res.status(400).json({ error: 'Title, area, and location are required.' });
    }

    const result = await db.prepare(`
      INSERT INTO land_listings (owner_id, title, description, area_acres, lease_type,
        price_per_season, price_per_month, price_per_year, location, district, state,
        soil_type, water_source, crop_history, photo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, title, description || null, area_acres,
           lease_type || 'Per Season', price_per_season || null,
           price_per_month || null, price_per_year || null, location,
           district || null, state || null, soil_type || null,
           water_source || null, crop_history || null, photo_url || null);

    const listing = await db.prepare('SELECT * FROM land_listings WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Land listing created! Awaiting admin approval.', listing });
  } catch (err) {
    console.error('Create land listing error:', err);
    res.status(500).json({ error: 'Server error creating listing.' });
  }
});

/* ── PUT /api/land/:id — Update listing ── */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const listing = await db.prepare('SELECT * FROM land_listings WHERE id = ?').get(req.params.id);

    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    if (listing.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const { title, description, area_acres, lease_type, price_per_season,
            price_per_month, price_per_year, location, district, state,
            soil_type, water_source, crop_history, photo_url } = req.body;

    await db.prepare(`
      UPDATE land_listings SET
        title = ?, description = ?, area_acres = ?, lease_type = ?,
        price_per_season = ?, price_per_month = ?, price_per_year = ?,
        location = ?, district = ?, state = ?, soil_type = ?,
        water_source = ?, crop_history = ?, photo_url = ?,
        updated_at = NOW()
      WHERE id = ?
    `).run(title || listing.title, description ?? listing.description,
           area_acres || listing.area_acres, lease_type || listing.lease_type,
           price_per_season ?? listing.price_per_season,
           price_per_month ?? listing.price_per_month,
           price_per_year ?? listing.price_per_year,
           location || listing.location, district ?? listing.district,
           state ?? listing.state, soil_type ?? listing.soil_type,
           water_source ?? listing.water_source,
           crop_history ?? listing.crop_history,
           photo_url ?? listing.photo_url, req.params.id);

    const updated = await db.prepare('SELECT * FROM land_listings WHERE id = ?').get(req.params.id);
    res.json({ message: 'Listing updated.', listing: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating listing.' });
  }
});

/* ── DELETE /api/land/:id ── */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const listing = await db.prepare('SELECT * FROM land_listings WHERE id = ?').get(req.params.id);

    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    if (listing.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await db.prepare('DELETE FROM land_listings WHERE id = ?').run(req.params.id);
    res.json({ message: 'Listing deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── PUT /api/land/:id/status — Admin approve/reject ── */
router.put('/:id/status', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const db = getDb();
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected.' });
    }

    await db.prepare(`UPDATE land_listings SET status = ?, updated_at = NOW() WHERE id = ?`)
      .run(status, req.params.id);

    res.json({ message: `Listing ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
