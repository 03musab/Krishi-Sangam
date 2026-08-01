/* KrishiSetu — server/routes/messages.js (User-to-User Messaging) */
const express = require('express');
const { getDb } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

/* GET /api/messages/unread/count (BEFORE :userId!) */
router.get('/unread/count', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const result = db.prepare(`SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0`).get(req.user.id);
    res.json({ count: result.count });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

/* GET /api/messages — My conversations list */
router.get('/', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;
    const conversations = db.prepare(`
      SELECT DISTINCT
        CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as other_user_id,
        u.username as other_username,
        (SELECT content FROM messages
         WHERE (sender_id = ? AND receiver_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)
            OR (receiver_id = ? AND sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)
         ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages
         WHERE (sender_id = ? AND receiver_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)
            OR (receiver_id = ? AND sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)
         ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM messages
         WHERE sender_id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
           AND receiver_id = ? AND is_read = 0) as unread_count
      FROM messages m
      JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
      WHERE m.sender_id = ? OR m.receiver_id = ?
      GROUP BY other_user_id
      ORDER BY last_message_time DESC
    `).all(userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId, userId);
    res.json({ conversations });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

/* GET /api/messages/:userId — Thread */
router.get('/:userId', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const otherUserId = Number(req.params.userId);
    const userId = req.user.id;
    const messages = db.prepare(`
      SELECT m.*, u.username as sender_name
      FROM messages m JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `).all(userId, otherUserId, otherUserId, userId);
    db.prepare(`UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0`).run(otherUserId, userId);
    const otherUser = db.prepare(`SELECT id, username, role FROM users WHERE id = ?`).get(otherUserId);
    res.json({ messages, otherUser });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

/* POST /api/messages — Send */
router.post('/', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { receiver_id, content, booking_id } = req.body;
    if (!receiver_id || !content) return res.status(400).json({ error: 'Receiver and content required.' });
    if (receiver_id === req.user.id) return res.status(400).json({ error: 'Cannot message yourself.' });
    const receiver = db.prepare('SELECT id FROM users WHERE id = ?').get(receiver_id);
    if (!receiver) return res.status(404).json({ error: 'User not found.' });
    const result = db.prepare(`INSERT INTO messages (sender_id, receiver_id, booking_id, content) VALUES (?, ?, ?, ?)`)
      .run(req.user.id, receiver_id, booking_id || null, content);
    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ message: 'Sent.', data: message });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

/* PUT /api/messages/read/:userId */
router.put('/read/:userId', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    db.prepare(`UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0`)
      .run(Number(req.params.userId), req.user.id);
    res.json({ message: 'Marked as read.' });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

module.exports = router;
