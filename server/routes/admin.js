/* ═══════════════════════════════════════════
   KrishiSetu — server/routes/admin.js
   (Admin Panel: Stats, Approve/Reject, Users — async, Postgres)
   ═══════════════════════════════════════════ */

const express = require('express');
const { getDb } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin role
router.use(authenticateToken, requireRole('admin'));

/* ── GET /api/admin/stats — Dashboard statistics ── */
router.get('/stats', async (req, res) => {
  try {
    const db = getDb();

    const totalUsers = await db.prepare(`SELECT COUNT(*) as count FROM users`).get();
    const totalLand = await db.prepare(`SELECT COUNT(*) as count FROM land_listings`).get();
    const totalEquipment = await db.prepare(`SELECT COUNT(*) as count FROM equipment_listings`).get();
    const totalLabour = await db.prepare(`SELECT COUNT(*) as count FROM labour_services`).get();
    const totalProduce = await db.prepare(`SELECT COUNT(*) as count FROM produce_listings`).get();
    const totalBookings = await db.prepare(`SELECT COUNT(*) as count FROM bookings`).get();
    const pendingLand = await db.prepare(`SELECT COUNT(*) as count FROM land_listings WHERE status = 'pending'`).get();
    const pendingEquip = await db.prepare(`SELECT COUNT(*) as count FROM equipment_listings WHERE status = 'pending'`).get();
    const pendingLabour = await db.prepare(`SELECT COUNT(*) as count FROM labour_services WHERE status = 'pending'`).get();
    const pendingProduce = await db.prepare(`SELECT COUNT(*) as count FROM produce_listings WHERE status = 'pending'`).get();
    const totalRevenue = await db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'released'`).get();
    const heldEscrow = await db.prepare(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'held'`).get();

    // Users by role
    const usersByRole = await db.prepare(`SELECT role, COUNT(*) as count FROM users GROUP BY role`).all();

    // Recent activity
    const recentBookings = await db.prepare(`
      SELECT b.*, u1.username as booker_name, u2.username as owner_name
      FROM bookings b
      JOIN users u1 ON b.booker_id = u1.id
      JOIN users u2 ON b.owner_id = u2.id
      ORDER BY b.created_at DESC LIMIT 10
    `).all();

    res.json({
      stats: {
        totalUsers: totalUsers.count,
        totalLand: totalLand.count,
        totalEquipment: totalEquipment.count,
        totalLabour: totalLabour.count,
        totalProduce: totalProduce.count,
        totalBookings: totalBookings.count,
        pendingLand: pendingLand.count,
        pendingEquip: pendingEquip.count,
        pendingLabour: pendingLabour.count,
        pendingProduce: pendingProduce.count,
        totalPending: pendingLand.count + pendingEquip.count + pendingLabour.count + pendingProduce.count,
        totalRevenue: totalRevenue.total,
        heldEscrow: heldEscrow.total,
        usersByRole
      },
      recentBookings
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── GET /api/admin/listings/pending — All pending listings ── */
router.get('/listings/pending', async (req, res) => {
  try {
    const db = getDb();
    const { type } = req.query;

    let landPending = [], equipPending = [], labourPending = [], producePending = [];

    if (!type || type === 'land') {
      landPending = await db.prepare(`
        SELECT l.*, u.username as owner_name FROM land_listings l
        JOIN users u ON l.owner_id = u.id WHERE l.status = 'pending'
        ORDER BY l.created_at DESC
      `).all();
    }
    if (!type || type === 'equipment') {
      equipPending = await db.prepare(`
        SELECT e.*, u.username as owner_name FROM equipment_listings e
        JOIN users u ON e.owner_id = u.id WHERE e.status = 'pending'
        ORDER BY e.created_at DESC
      `).all();
    }
    if (!type || type === 'labour') {
      labourPending = await db.prepare(`
        SELECT l.*, u.username as worker_name FROM labour_services l
        JOIN users u ON l.worker_id = u.id WHERE l.status = 'pending'
        ORDER BY l.created_at DESC
      `).all();
    }
    if (!type || type === 'produce') {
      producePending = await db.prepare(`
        SELECT p.*, u.username as seller_name FROM produce_listings p
        JOIN users u ON p.seller_id = u.id WHERE p.status = 'pending'
        ORDER BY p.created_at DESC
      `).all();
    }

    res.json({
      land: landPending,
      equipment: equipPending,
      labour: labourPending,
      produce: producePending,
      counts: {
        land: landPending.length,
        equipment: equipPending.length,
        labour: labourPending.length,
        produce: producePending.length,
        total: landPending.length + equipPending.length + labourPending.length + producePending.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── GET /api/admin/listings — All listings (manage tab, filter by type/status) ── */
router.get('/listings', async (req, res) => {
  try {
    const db = getDb();
    const { type, status } = req.query;

    const statusClause = status && ['pending', 'approved', 'rejected'].includes(status)
      ? "AND l.status = '" + status + "'"
      : '';
    const order = 'ORDER BY l.created_at DESC LIMIT 200';

    const out = {};
    if (!type || type === 'land') {
      out.land = await db.prepare(`
        SELECT l.*, u.username as owner_name FROM land_listings l
        JOIN users u ON l.owner_id = u.id WHERE 1=1 ${statusClause} ${order}
      `).all();
    }
    if (!type || type === 'equipment') {
      out.equipment = await db.prepare(`
        SELECT e.*, u.username as owner_name FROM equipment_listings e
        JOIN users u ON e.owner_id = u.id WHERE 1=1 ${statusClause} ${order}
      `).all();
    }
    if (!type || type === 'labour') {
      out.labour = await db.prepare(`
        SELECT l.*, u.username as worker_name FROM labour_services l
        JOIN users u ON l.worker_id = u.id WHERE 1=1 ${statusClause} ${order}
      `).all();
    }
    if (!type || type === 'produce') {
      out.produce = await db.prepare(`
        SELECT p.*, u.username as seller_name FROM produce_listings p
        JOIN users u ON p.seller_id = u.id WHERE 1=1 ${statusClause} ${order}
      `).all();
    }

    res.json(out);
  } catch (err) {
    console.error('Admin listings error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── PUT /api/admin/approve/:type/:id ── */
router.put('/approve/:type/:id', async (req, res) => {
  try {
    const db = getDb();
    const { type } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be approved or rejected.' });
    }

    let table;
    if (type === 'land') table = 'land_listings';
    else if (type === 'equipment') table = 'equipment_listings';
    else if (type === 'labour') table = 'labour_services';
    else if (type === 'produce') table = 'produce_listings';
    else return res.status(400).json({ error: 'Invalid listing type.' });

    const listing = await db.prepare(`SELECT id FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });

    await db.prepare(`UPDATE ${table} SET status = ?, updated_at = NOW() WHERE id = ?`)
      .run(status, req.params.id);

    res.json({ message: `Listing ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── PUT /api/admin/bulk-approve — Bulk approve ── */
router.put('/bulk-approve', async (req, res) => {
  try {
    const db = getDb();
    const { type, status, ids } = req.body;

    if (!['approved', 'rejected'].includes(status) || !ids || !ids.length) {
      return res.status(400).json({ error: 'Invalid parameters.' });
    }

    let table;
    if (type === 'land') table = 'land_listings';
    else if (type === 'equipment') table = 'equipment_listings';
    else if (type === 'labour') table = 'labour_services';
    else if (type === 'produce') table = 'produce_listings';
    else return res.status(400).json({ error: 'Invalid listing type.' });

    const placeholders = ids.map(() => '?').join(',');
    const result = await db.prepare(
      `UPDATE ${table} SET status = ?, updated_at = NOW() WHERE id IN (${placeholders})`
    ).run(status, ...ids);

    res.json({ message: `${result.changes} listing(s) ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── GET /api/admin/users — List all users ── */
router.get('/users', async (req, res) => {
  try {
    const db = getDb();
    const { role, search } = req.query;

    let query = `SELECT id, username, email, role, phone, location, created_at FROM users WHERE 1=1`;
    const params = [];

    if (role) { query += ` AND role = ?`; params.push(role); }
    if (search) {
      query += ` AND (username LIKE ? OR email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC`;
    const users = await db.prepare(query).all(...params);
    res.json({ users, count: users.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── PUT /api/admin/users/:id/role — Change user role ── */
router.put('/users/:id/role', async (req, res) => {
  try {
    const db = getDb();
    const { role } = req.body;
    if (!['farmer', 'owner', 'labourer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role.' });
    }
    await db.prepare(`UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?`)
      .run(role, req.params.id);
    res.json({ message: 'Role updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── DELETE /api/admin/users/:id — Delete user ── */
router.delete('/users/:id', async (req, res) => {
  try {
    const uid = Number(req.params.id);
    if (uid === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself.' });
    }

    // Use a transaction to cascade-delete all dependent records
    const pool = getDb().getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Reviews (references bookings & users)
      await client.query('DELETE FROM reviews WHERE reviewer_id = $1 OR reviewee_id = $1', [uid]);

      // 2. Payments (references bookings & users)
      await client.query('DELETE FROM payments WHERE payer_id = $1 OR payee_id = $1', [uid]);

      // 3. Messages (references users & bookings)
      await client.query('DELETE FROM messages WHERE sender_id = $1 OR receiver_id = $1', [uid]);

      // 4. Bookings (references users)
      await client.query('DELETE FROM bookings WHERE booker_id = $1 OR owner_id = $1', [uid]);

      // 5. Service bookings
      await client.query('DELETE FROM service_bookings WHERE user_id = $1', [uid]);

      // 6. Listings
      await client.query('DELETE FROM land_listings WHERE owner_id = $1', [uid]);
      await client.query('DELETE FROM equipment_listings WHERE owner_id = $1', [uid]);
      await client.query('DELETE FROM labour_services WHERE worker_id = $1', [uid]);
      await client.query('DELETE FROM produce_listings WHERE seller_id = $1', [uid]);

      // 7. Sessions (has ON DELETE CASCADE, but be explicit)
      await client.query('DELETE FROM sessions WHERE user_id = $1', [uid]);

      // 8. Finally, delete the user
      await client.query('DELETE FROM users WHERE id = $1', [uid]);

      await client.query('COMMIT');
      res.json({ message: 'User and all associated data deleted.' });
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── DELETE /api/admin/listings/:type/:id — Delete listing ── */
router.delete('/listings/:type/:id', async (req, res) => {
  try {
    const db = getDb();
    const { type, id } = req.params;

    let table;
    if (type === 'land') table = 'land_listings';
    else if (type === 'equipment') table = 'equipment_listings';
    else if (type === 'labour') table = 'labour_services';
    else if (type === 'produce') table = 'produce_listings';
    else return res.status(400).json({ error: 'Invalid type.' });

    await db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
    res.json({ message: 'Listing deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── GET /api/admin/help-conversations — Help Requests ──
   Conversations between the admin and regular (non-admin) users — i.e. the
   chats users start from the Help & Support page (or anywhere else). */
router.get('/help-conversations', async (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;
    const conversations = await db.prepare(`
      SELECT
        c.other_user_id,
        u.username AS other_username,
        u.role AS other_role,
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
      WHERE u.role <> 'admin'
      ORDER BY c.last_message_time DESC NULLS LAST
    `).all(userId, userId, userId, userId, userId, userId, userId, userId);
    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
