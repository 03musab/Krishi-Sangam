/* ═══════════════════════════════════════════
   Krishi-Sangam — server/routes/availability.js
   (Provider Availability Calendar Management)
   ═══════════════════════════════════════════ */

const express = require('express');
const { getDb } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/* ── GET /api/availability/my — Fetch logged-in provider's calendar ── */
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const records = await db.prepare(`
      SELECT * FROM provider_availability
      WHERE provider_id = ?
      ORDER BY date ASC
    `).all(req.user.id);
    res.json({ availability: records });
  } catch (err) {
    console.error('Get availability error:', err);
    res.status(500).json({ error: 'Server error fetching availability.' });
  }
});

/* ── GET /api/availability/provider/:id — Fetch provider's blocked dates ── */
router.get('/provider/:id', async (req, res) => {
  try {
    const db = getDb();
    const records = await db.prepare(`
      SELECT date, status FROM provider_availability
      WHERE provider_id = ?
    `).all(req.params.id);
    res.json({ availability: records });
  } catch (err) {
    console.error('Get provider availability error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── POST /api/availability/toggle — Mark a date as available or unavailable ── */
router.post('/toggle', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const { date, status, note } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required (YYYY-MM-DD).' });
    }

    const dateStr = String(date).slice(0, 10);
    const targetStatus = status === 'available' ? 'available' : 'unavailable';

    // Upsert record
    const existing = await db.prepare(`
      SELECT id FROM provider_availability WHERE provider_id = ? AND date = ?
    `).get(req.user.id, dateStr);

    if (existing) {
      await db.prepare(`
        UPDATE provider_availability
        SET status = ?, note = ?
        WHERE id = ?
      `).run(targetStatus, note || null, existing.id);
    } else {
      await db.prepare(`
        INSERT INTO provider_availability (provider_id, date, status, note)
        VALUES (?, ?, ?, ?)
      `).run(req.user.id, dateStr, targetStatus, note || null);
    }

    const updated = await db.prepare(`
      SELECT * FROM provider_availability WHERE provider_id = ? ORDER BY date ASC
    `).all(req.user.id);

    res.json({ message: 'Availability updated.', availability: updated });
  } catch (err) {
    console.error('Toggle availability error:', err);
    res.status(500).json({ error: 'Server error updating availability.' });
  }
});

module.exports = router;
