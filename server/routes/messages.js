/* KrishiSetu — server/routes/messages.js (User-to-User Messaging — async, Postgres) */
const express = require('express');
const { getDb } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

/* GET /api/messages/unread/count (BEFORE :userId!) */
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const result = await db.prepare(`SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0`).get(req.user.id);
    res.json({ count: result.count });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

/* ── Help & Support routing ────────────────────────────────
   Help chats are delivered to ALL support accounts: every user with the
   admin role, plus HELP_SUPPORT_USERNAME when set. A user's help message is
   fanned out to each support account (copies share a help_uid so the user's
   combined view shows it once).
*/
async function getSupportUsers(db) {
  let users = await db.prepare("SELECT id, username, role FROM users WHERE role = 'admin' ORDER BY id ASC").all();
  const extra = (process.env.HELP_SUPPORT_USERNAME || '').trim();
  if (extra) {
    const u = await db.prepare('SELECT id, username, role FROM users WHERE username = ? LIMIT 1').get(extra);
    if (u && !users.some((x) => x.id === u.id)) users.push(u);
  }
  return users;
}

/* GET /api/messages/help-target (BEFORE :userId!) — all support accounts */
router.get('/help-target', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const admins = await getSupportUsers(db);
    if (!admins.length) return res.status(404).json({ error: 'Support is not available yet.' });
    res.json({ admins });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

/* GET /api/messages/help (BEFORE :userId!) — the user's combined help thread
   (messages with any support account, deduped by help_uid) */
router.get('/help', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const support = await getSupportUsers(db);
    if (!support.length) return res.status(404).json({ error: 'Support is not available yet.' });
    const ids = support.map((s) => s.id);
    const placeholders = ids.map(() => '?').join(', ');
    const userId = req.user.id;
    const rows = await db.prepare(`
      SELECT m.*, u.username AS sender_name
      FROM messages m JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = ? AND m.receiver_id IN (${placeholders}))
         OR (m.receiver_id = ? AND m.sender_id IN (${placeholders}))
      ORDER BY m.created_at ASC, m.id ASC
    `).all(userId, ...ids, userId, ...ids);
    // Fan-out copies of the user's own messages share a help_uid — show once
    const seen = new Set();
    const messages = [];
    for (const m of rows) {
      const key = m.help_uid || `id:${m.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      messages.push(m);
    }
    // Mark replies from support as read
    await db.prepare(`UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id IN (${placeholders}) AND is_read = 0`)
      .run(userId, ...ids);
    res.json({ messages });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

/* POST /api/messages/help (BEFORE :userId!) — send a help message to every
   support account (one copy each, sharing a help_uid) */
router.post('/help', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const { content, image_url } = req.body;
    if (!content && !image_url) return res.status(400).json({ error: 'Content required.' });
    const support = await getSupportUsers(db);
    const targets = support.filter((s) => s.id !== req.user.id);
    if (!targets.length) return res.status(404).json({ error: 'Support is not available yet.' });
    const img = typeof image_url === 'string' && image_url.trim() ? image_url.trim().slice(0, 2000) : null;
    const helpUid = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    for (const s of targets) {
      await db.prepare(`INSERT INTO messages (sender_id, receiver_id, content, image_url, help_uid) VALUES (?, ?, ?, ?, ?)`)
        .run(req.user.id, s.id, content || '', img, helpUid);
    }
    res.status(201).json({ message: 'Sent.', sent: targets.length });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

/* GET /api/messages — My conversations list */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;
    // Rewritten for Postgres (the old GROUP BY + bare-column version is SQLite-only)
    const conversations = await db.prepare(`
      SELECT
        c.other_user_id,
        u.username AS other_username,
        c.last_message,
        c.last_message_time,
        c.unread_count
      FROM (
        SELECT
          x.other_user_id,
          (SELECT content FROM messages m2
            WHERE (m2.sender_id = ? AND m2.receiver_id = x.other_user_id)
               OR (m2.receiver_id = ? AND m2.sender_id = x.other_user_id)
            ORDER BY m2.created_at DESC LIMIT 1) AS last_message,
          (SELECT created_at FROM messages m2
            WHERE (m2.sender_id = ? AND m2.receiver_id = x.other_user_id)
               OR (m2.receiver_id = ? AND m2.sender_id = x.other_user_id)
            ORDER BY m2.created_at DESC LIMIT 1) AS last_message_time,
          (SELECT COUNT(*) FROM messages m2
            WHERE m2.sender_id = x.other_user_id AND m2.receiver_id = ? AND m2.is_read = 0) AS unread_count
        FROM (
          SELECT DISTINCT
            CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END AS other_user_id
          FROM messages
          WHERE sender_id = ? OR receiver_id = ?
        ) x
      ) c
      JOIN users u ON u.id = c.other_user_id
      ORDER BY c.last_message_time DESC NULLS LAST
    `).all(userId, userId, userId, userId, userId, userId, userId, userId);
    res.json({ conversations });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

/* GET /api/messages/:userId — Thread */
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const otherUserId = Number(req.params.userId);
    const userId = req.user.id;
    const messages = await db.prepare(`
      SELECT m.*, u.username as sender_name
      FROM messages m JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `).all(userId, otherUserId, otherUserId, userId);
    await db.prepare(`UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0`).run(otherUserId, userId);
    const otherUser = await db.prepare(`SELECT id, username, role FROM users WHERE id = ?`).get(otherUserId);
    res.json({ messages, otherUser });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

/* POST /api/messages — Send */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const { receiver_id, content, booking_id, listing_type, listing_id, image_url } = req.body;
    if (!receiver_id || (!content && !image_url)) return res.status(400).json({ error: 'Receiver and content required.' });
    if (receiver_id === req.user.id) return res.status(400).json({ error: 'Cannot message yourself.' });
    const receiver = await db.prepare('SELECT id FROM users WHERE id = ?').get(receiver_id);
    if (!receiver) return res.status(404).json({ error: 'User not found.' });
    const lType = ['land', 'equipment', 'labour', 'produce'].includes(listing_type) ? listing_type : null;
    const lId = lType ? Number(listing_id) || null : null;
    const img = typeof image_url === 'string' && image_url.trim() ? image_url.trim().slice(0, 2000) : null;
    const result = await db.prepare(`INSERT INTO messages (sender_id, receiver_id, booking_id, listing_type, listing_id, content, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .run(req.user.id, receiver_id, booking_id || null, lType, lId, content || '', img);
    const message = await db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Sent.', data: message });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

/* PUT /api/messages/read/:userId */
router.put('/read/:userId', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    await db.prepare(`UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0`)
      .run(Number(req.params.userId), req.user.id);
    res.json({ message: 'Marked as read.' });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;
