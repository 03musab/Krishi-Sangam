/* ═══════════════════════════════════════════
   Krishi-Sangam — server/routes/reviews.js
   (Reviews & Ratings API)
   ═══════════════════════════════════════════ */

const express = require('express');
const { getDb } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/* ── POST /api/reviews — Submit review for a completed booking ── */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const { booking_id, is_service, reviewee_id, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
    }
    if (!booking_id || !reviewee_id) {
      return res.status(400).json({ error: 'Booking ID and reviewee ID are required.' });
    }

    // Insert into reviews table
    const result = await db.prepare(`
      INSERT INTO reviews (reviewer_id, reviewee_id, booking_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.user.id, reviewee_id, booking_id, Math.round(rating), comment || null);

    // Also update booking record with rating
    if (is_service) {
      await db.prepare(`
        UPDATE service_bookings
        SET rating = ?, review_comment = ?
        WHERE id = ?
      `).run(Math.round(rating), comment || null, booking_id);
    } else {
      await db.prepare(`
        UPDATE bookings
        SET rating = ?, review_comment = ?
        WHERE id = ?
      `).run(Math.round(rating), comment || null, booking_id);
    }

    const review = await db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ message: 'Review submitted successfully!', review });
  } catch (err) {
    console.error('Submit review error:', err);
    res.status(500).json({ error: 'Server error submitting review.' });
  }
});

/* ── GET /api/reviews/provider/:id — Get reviews and rating stats for provider ── */
router.get('/provider/:id', async (req, res) => {
  try {
    const db = getDb();
    const providerId = req.params.id;

    const reviews = await db.prepare(`
      SELECT r.*, u.username as reviewer_name, u.avatar_url as reviewer_avatar
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.reviewee_id = ?
      ORDER BY r.created_at DESC
    `).all(providerId);

    const stats = await db.prepare(`
      SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total_reviews
      FROM reviews
      WHERE reviewee_id = ?
    `).get(providerId);

    res.json({
      reviews,
      avg_rating: Math.round((stats.avg_rating || 0) * 10) / 10,
      total_reviews: stats.total_reviews || 0
    });
  } catch (err) {
    console.error('Get provider reviews error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
