/* KrishiSetu — server/routes/payments.js (Payments / Escrow) */
const express = require('express');
const { getDb } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

/* GET /api/payments/stats — Admin (BEFORE :id routes!) */
router.get('/stats', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const db = getDb();
    const totalRevenue = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'released'`).get();
    const heldInEscrow = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'held'`).get();
    const totalTransactions = db.prepare(`SELECT COUNT(*) as count FROM payments`).get();
    res.json({ totalRevenue: totalRevenue.total, heldInEscrow: heldInEscrow.total, totalTransactions: totalTransactions.count });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

/* GET /api/payments/all — Admin */
router.get('/all', authenticateToken, requireRole('admin'), (req, res) => {
  try {
    const db = getDb();
    const payments = db.prepare(`SELECT p.*, u1.username as payer_name, u2.username as payee_name, b.listing_title, b.listing_type
      FROM payments p JOIN users u1 ON p.payer_id = u1.id JOIN users u2 ON p.payee_id = u2.id
      JOIN bookings b ON p.booking_id = b.id ORDER BY p.created_at DESC`).all();
    res.json({ payments, count: payments.length });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

/* GET /api/payments — My payments */
router.get('/', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const payments = db.prepare(`SELECT p.*, b.listing_title, b.listing_type, b.listing_id
      FROM payments p JOIN bookings b ON p.booking_id = b.id
      WHERE p.payer_id = ? OR p.payee_id = ? ORDER BY p.created_at DESC`).all(req.user.id, req.user.id);
    res.json({ payments, count: payments.length });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

/* POST /api/payments — Create escrow */
router.post('/', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { booking_id, method } = req.body;
    if (!booking_id) return res.status(400).json({ error: 'Booking ID required.' });
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.booker_id !== req.user.id) return res.status(403).json({ error: 'Only the booker can pay.' });
    if (booking.payment_status !== 'unpaid') return res.status(400).json({ error: 'Already paid.' });
    const txnRef = 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    const result = db.prepare(`INSERT INTO payments (booking_id, payer_id, payee_id, amount, status, method, transaction_ref)
      VALUES (?, ?, ?, ?, 'held', ?, ?)`).run(booking_id, booking.booker_id, booking.owner_id, booking.total_price, method || 'upi', txnRef);
    db.prepare(`UPDATE bookings SET payment_status = 'escrow', updated_at = datetime('now') WHERE id = ?`).run(booking_id);
    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Payment held in escrow.', payment });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

/* PUT /api/payments/:id/release */
router.put('/:id/release', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Not found.' });
    if (payment.payee_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized.' });
    if (payment.status !== 'held') return res.status(400).json({ error: 'Not in escrow.' });
    db.prepare(`UPDATE payments SET status = 'released' WHERE id = ?`).run(req.params.id);
    db.prepare(`UPDATE bookings SET payment_status = 'released', updated_at = datetime('now') WHERE id = ?`).run(payment.booking_id);
    res.json({ message: 'Escrow released.' });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

/* PUT /api/payments/:id/refund */
router.put('/:id/refund', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Not found.' });
    if (payment.payer_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Not authorized.' });
    if (payment.status !== 'held') return res.status(400).json({ error: 'Not in escrow.' });
    db.prepare(`UPDATE payments SET status = 'refunded' WHERE id = ?`).run(req.params.id);
    db.prepare(`UPDATE bookings SET payment_status = 'refunded', updated_at = datetime('now') WHERE id = ?`).run(payment.booking_id);
    res.json({ message: 'Escrow refunded.' });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;
