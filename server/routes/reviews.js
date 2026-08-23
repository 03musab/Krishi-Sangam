/* ═══════════════════════════════════════════
   Krishi-Sangam — server/routes/reviews.js
   (Comprehensive Reviews & Ratings API)
   ═══════════════════════════════════════════ */

const express = require('express');
const { getDb } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/* ── POST /api/reviews — Submit or update a review for a booking ── */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const { booking_id, is_service, reviewee_id, rating, comment } = req.body;

    const numRating = Math.round(Number(rating));
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5 stars.' });
    }
    if (!booking_id || !reviewee_id) {
      return res.status(400).json({ error: 'Booking ID and reviewee ID are required.' });
    }

    const cleanComment = typeof comment === 'string' && comment.trim() ? comment.trim() : null;

    // Check if review already exists for this booking & reviewer
    const existing = await db.prepare(`
      SELECT id FROM reviews WHERE reviewer_id = ? AND booking_id = ?
    `).get(req.user.id, booking_id);

    let reviewId;
    if (existing) {
      // Update existing review
      await db.prepare(`
        UPDATE reviews
        SET rating = ?, comment = ?, reviewee_id = ?, created_at = NOW()
        WHERE id = ?
      `).run(numRating, cleanComment, reviewee_id, existing.id);
      reviewId = existing.id;
    } else {
      // Insert new review
      const result = await db.prepare(`
        INSERT INTO reviews (reviewer_id, reviewee_id, booking_id, rating, comment)
        VALUES (?, ?, ?, ?, ?)
      `).run(req.user.id, reviewee_id, booking_id, numRating, cleanComment);
      reviewId = result.lastInsertRowid;
    }

    // Also update booking record with rating & review comment
    if (is_service) {
      await db.prepare(`
        UPDATE service_bookings
        SET rating = ?, review_comment = ?
        WHERE id = ?
      `).run(numRating, cleanComment, booking_id);
    } else {
      await db.prepare(`
        UPDATE bookings
        SET rating = ?, review_comment = ?
        WHERE id = ?
      `).run(numRating, cleanComment, booking_id);
    }

    const review = await db.prepare(`
      SELECT r.*, u1.username as reviewer_name, u2.username as reviewee_name
      FROM reviews r
      LEFT JOIN users u1 ON r.reviewer_id = u1.id
      LEFT JOIN users u2 ON r.reviewee_id = u2.id
      WHERE r.id = ?
    `).get(reviewId);

    res.status(201).json({ message: 'Review submitted successfully!', review });
  } catch (err) {
    console.error('Submit review error:', err);
    res.status(500).json({ error: 'Server error submitting review.' });
  }
});

/* ── GET /api/reviews/provider/:id or /user/:id — Get reviews and aggregate stats ── */
const getProviderReviews = async (req, res) => {
  try {
    const db = getDb();
    const providerId = req.params.id;

    const reviews = await db.prepare(`
      SELECT r.*, u.username as reviewer_name, u.phone as reviewer_phone
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
      avg_rating: Math.round((Number(stats.avg_rating) || 0) * 10) / 10,
      total_reviews: Number(stats.total_reviews) || 0
    });
  } catch (err) {
    console.error('Get provider reviews error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
};

router.get('/provider/:id', getProviderReviews);
router.get('/user/:id', getProviderReviews);

/* ── GET /api/reviews/my — Get reviews submitted and received by logged-in user ── */
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;

    const given = await db.prepare(`
      SELECT r.*, u.username as reviewee_name, u.role as reviewee_role
      FROM reviews r
      LEFT JOIN users u ON r.reviewee_id = u.id
      WHERE r.reviewer_id = ?
      ORDER BY r.created_at DESC
    `).all(userId);

    const received = await db.prepare(`
      SELECT r.*, u.username as reviewer_name, u.phone as reviewer_phone
      FROM reviews r
      LEFT JOIN users u ON r.reviewer_id = u.id
      WHERE r.reviewee_id = ?
      ORDER BY r.created_at DESC
    `).all(userId);

    const stats = await db.prepare(`
      SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(*) as total_reviews
      FROM reviews
      WHERE reviewee_id = ?
    `).get(userId);

    res.json({
      given,
      received,
      avg_rating: Math.round((Number(stats.avg_rating) || 0) * 10) / 10,
      total_reviews: Number(stats.total_reviews) || 0
    });
  } catch (err) {
    console.error('Get my reviews error:', err);
    res.status(500).json({ error: 'Server error fetching my reviews.' });
  }
});

/* ── DELETE /api/reviews/:id — Delete a review by owner or admin ── */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const reviewId = req.params.id;

    const review = await db.prepare('SELECT * FROM reviews WHERE id = ?').get(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    if (review.reviewer_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this review.' });
    }

    await db.prepare('DELETE FROM reviews WHERE id = ?').run(reviewId);
    res.json({ message: 'Review deleted successfully.' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ error: 'Server error deleting review.' });
  }
});

module.exports = router;
