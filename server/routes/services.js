/* Krishi Sangam — server/routes/services.js
   (Agricultural Services & Labour Team Bookings — async, Postgres) */

const express = require('express');
const { getDb } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/* ── POST /api/services/book ─────────────────
   Body:
     kind: 'labour_team' | 'service'
     category, service_name
     num_workers, days, team_type, skill_level, start_date
     location, lat, lng, description, price
*/
router.post('/book', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const {
      kind, category, service_name, num_workers, days,
      team_type, skill_level, start_date, location,
      lat, lng, description, price
    } = req.body;

    if (!kind || !['labour_team', 'service'].includes(kind)) {
      return res.status(400).json({ error: 'Valid booking kind is required.' });
    }
    if (!location) {
      return res.status(400).json({ error: 'Farm location is required.' });
    }
    if (!service_name && kind === 'service') {
      return res.status(400).json({ error: 'Service name is required.' });
    }

    const result = await db.prepare(`
      INSERT INTO service_bookings (
        user_id, kind, category, service_name, num_workers, days,
        team_type, skill_level, start_date, location, lat, lng,
        description, price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id, kind, category || null, service_name || null,
      num_workers != null ? Number(num_workers) : null,
      days != null ? Number(days) : null,
      team_type || null, skill_level || null,
      start_date || null, location,
      lat != null ? Number(lat) : null,
      lng != null ? Number(lng) : null,
      description || null,
      price != null ? Number(price) : null
    );

    const booking = await db.prepare('SELECT * FROM service_bookings WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json({
      message: kind === 'labour_team'
        ? 'Labour team request submitted!'
        : 'Service request submitted!',
      booking
    });
  } catch (err) {
    console.error('Service booking error:', err);
    res.status(500).json({ error: 'Server error creating service booking.' });
  }
});

/* ── GET /api/services/my — My service bookings ── */
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const bookings = await db.prepare(
      `SELECT * FROM service_bookings WHERE user_id = ? ORDER BY created_at DESC`
    ).all(req.user.id);
    res.json({ bookings, count: bookings.length });
  } catch (err) {
    console.error('Get service bookings error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── PUT /api/services/:id — Cancel / update ── */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const booking = await db.prepare('SELECT * FROM service_bookings WHERE id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    const { status } = req.body;
    if (status && !['confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    await db.prepare(`UPDATE service_bookings SET status = COALESCE(?, status), updated_at = NOW() WHERE id = ?`)
      .run(status || null, req.params.id);
    const updated = await db.prepare('SELECT * FROM service_bookings WHERE id = ?').get(req.params.id);
    res.json({ message: 'Booking updated.', booking: updated });
  } catch (err) {
    console.error('Update service booking error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
