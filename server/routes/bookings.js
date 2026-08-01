/* ═══════════════════════════════════════════
   KrishiSetu — server/routes/bookings.js
   (Bookings CRUD)
   ═══════════════════════════════════════════ */

const express = require('express');
const { getDb } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/* ── GET /api/bookings — My bookings (as booker) ── */
router.get('/', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const bookings = db.prepare(`
      SELECT b.*, u.username as owner_name
      FROM bookings b JOIN users u ON b.owner_id = u.id
      WHERE b.booker_id = ? ORDER BY b.created_at DESC
    `).all(req.user.id);
    res.json({ bookings, count: bookings.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── GET /api/bookings/incoming — Bookings where I'm the owner ── */
router.get('/incoming', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const bookings = db.prepare(`
      SELECT b.*, u.username as booker_name
      FROM bookings b JOIN users u ON b.booker_id = u.id
      WHERE b.owner_id = ? ORDER BY b.created_at DESC
    `).all(req.user.id);
    res.json({ bookings, count: bookings.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── GET /api/bookings/all — All bookings (admin) ── */
router.get('/all', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin only.' });
    }
    const db = getDb();
    const bookings = db.prepare(`
      SELECT b.*, u1.username as booker_name, u2.username as owner_name
      FROM bookings b
      JOIN users u1 ON b.booker_id = u1.id
      JOIN users u2 ON b.owner_id = u2.id
      ORDER BY b.created_at DESC
    `).all();
    res.json({ bookings, count: bookings.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── GET /api/bookings/:id ── */
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const booking = db.prepare(`
      SELECT b.*, u1.username as booker_name, u2.username as owner_name
      FROM bookings b
      JOIN users u1 ON b.booker_id = u1.id
      JOIN users u2 ON b.owner_id = u2.id
      WHERE b.id = ?
    `).get(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found.' });
    if (booking.booker_id !== req.user.id && booking.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── POST /api/bookings — Create booking ── */
router.post('/', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { listing_type, listing_id, start_date, end_date, quantity } = req.body;

    if (!listing_type || !listing_id) {
      return res.status(400).json({ error: 'Listing type and listing ID are required.' });
    }

    // Get listing details and owner
    let listing, owner_id, title, total_price;

    if (listing_type === 'land') {
      listing = db.prepare('SELECT * FROM land_listings WHERE id = ? AND status = ?').get(listing_id, 'approved');
      if (!listing) return res.status(404).json({ error: 'Land listing not found or not approved.' });
      owner_id = listing.owner_id;
      title = listing.title;
      total_price = listing.price_per_season || listing.price_per_month || listing.price_per_year || 0;
    } else if (listing_type === 'equipment') {
      listing = db.prepare('SELECT * FROM equipment_listings WHERE id = ? AND status = ?').get(listing_id, 'approved');
      if (!listing) return res.status(404).json({ error: 'Equipment listing not found or not approved.' });
      owner_id = listing.owner_id;
      title = listing.name;
      total_price = listing.price_per_day || listing.price_per_hour || 0;
    } else if (listing_type === 'labour') {
      listing = db.prepare('SELECT * FROM labour_services WHERE id = ? AND status = ?').get(listing_id, 'approved');
      if (!listing) return res.status(404).json({ error: 'Labour listing not found or not approved.' });
      owner_id = listing.worker_id;
      title = listing.title;
      total_price = listing.daily_rate || listing.hourly_rate || 0;
    } else if (listing_type === 'produce') {
      listing = db.prepare('SELECT * FROM produce_listings WHERE id = ? AND status = ?').get(listing_id, 'approved');
      if (!listing) return res.status(404).json({ error: 'Produce listing not found or not approved.' });
      owner_id = listing.seller_id;
      title = listing.crop_name;
      total_price = listing.price_per_unit * (quantity || 1);
    } else {
      return res.status(400).json({ error: 'Invalid listing type.' });
    }

    if (owner_id === req.user.id) {
      return res.status(400).json({ error: 'You cannot book your own listing.' });
    }

    const result = db.prepare(`
      INSERT INTO bookings (booker_id, owner_id, listing_type, listing_id, listing_title,
        start_date, end_date, quantity, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, owner_id, listing_type, listing_id, title,
           start_date || null, end_date || null, quantity || 1, total_price);

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Booking created!', booking });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── PUT /api/bookings/:id — Update status ── */
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found.' });

    // Owner can confirm/cancel, booker can cancel, admin can do anything
    const isOwner = booking.owner_id === req.user.id;
    const isBooker = booking.booker_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isBooker && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    const { status, payment_status } = req.body;

    if (status) {
      if (!['confirmed', 'active', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status.' });
      }
      // Only owner/admin can confirm
      if (status === 'confirmed' && !isOwner && !isAdmin) {
        return res.status(403).json({ error: 'Only the listing owner can confirm.' });
      }
      db.prepare(`UPDATE bookings SET status=?, updated_at=datetime('now') WHERE id=?`)
        .run(status, req.params.id);
    }

    if (payment_status && isAdmin) {
      db.prepare(`UPDATE bookings SET payment_status=?, updated_at=datetime('now') WHERE id=?`)
        .run(payment_status, req.params.id);
    }

    const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    res.json({ message: 'Booking updated.', booking: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── DELETE /api/bookings/:id ── */
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found.' });
    if (booking.booker_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
    res.json({ message: 'Booking deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
