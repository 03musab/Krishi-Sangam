/* Krishi Sangam — server/routes/services.js
   (Agricultural Services, Labour Teams, Equipment Smart Matching & Lifecycle — async, Postgres) */

const express = require('express');
const { getDb } = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/* Helper: Generate 4-digit OTP code */
function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/* Helper: Haversine distance in km */
function getHaversineDistance(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null;
  const R = 6371; // Earth radius in km
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/* Helper: Check if provider is unavailable on date */
async function isProviderUnavailable(db, providerId, startDateStr) {
  if (!startDateStr) return false;
  const targetDate = String(startDateStr).slice(0, 10);
  const record = await db.prepare(`
    SELECT status FROM provider_availability
    WHERE provider_id = ? AND date = ?
  `).get(providerId, targetDate);
  return record && record.status === 'unavailable';
}

/* ── POST /api/services/book ───────────────── */
router.post('/book', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const {
      kind, category, service_name, num_workers, days,
      team_type, skill_level, start_date, location,
      lat, lng, description, price, farm_for, farm_details
    } = req.body;

    if (!kind || !['labour_team', 'service', 'equipment'].includes(kind)) {
      return res.status(400).json({ error: 'Valid booking kind is required.' });
    }
    if (!location) {
      return res.status(400).json({ error: 'Farm location is required.' });
    }
    if (!service_name && (kind === 'service' || kind === 'equipment')) {
      return res.status(400).json({ error: 'Service name is required.' });
    }

    const otp = generateOtp();

    const result = await db.prepare(`
      INSERT INTO service_bookings (
        user_id, kind, category, service_name, num_workers, days,
        team_type, skill_level, start_date, location, lat, lng,
        description, price, farm_for, farm_details, otp_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id, kind, category || null, service_name || null,
      num_workers != null ? Number(num_workers) : null,
      days != null ? Number(days) : null,
      team_type || null, skill_level || null,
      start_date || null, location,
      lat != null ? Number(lat) : null,
      lng != null ? Number(lng) : null,
      description || null,
      price != null ? Number(price) : null,
      farm_for || 'my_farm',
      farm_details || null,
      otp
    );

    const booking = await db.prepare('SELECT * FROM service_bookings WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json({
      message: kind === 'labour_team'
        ? 'Labour team request submitted!'
        : kind === 'equipment'
          ? 'Equipment request submitted!'
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
      `SELECT sb.*, u.username as owner_name, u.phone as owner_phone
       FROM service_bookings sb
       LEFT JOIN users u ON sb.owner_id = u.id
       WHERE sb.user_id = ?
       ORDER BY sb.created_at DESC`
    ).all(req.user.id);
    res.json({ bookings, count: bookings.length });
  } catch (err) {
    console.error('Get service bookings error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── PUT /api/services/:id — Cancel / update status ── */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const booking = await db.prepare('SELECT * FROM service_bookings WHERE id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.user_id !== req.user.id && booking.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    const { status, payment_status } = req.body;
    if (status && !['pending', 'confirmed', 'active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    await db.prepare(`
      UPDATE service_bookings
      SET status = COALESCE(?, status),
          payment_status = COALESCE(?, payment_status),
          updated_at = NOW()
      WHERE id = ?
    `).run(status || null, payment_status || null, req.params.id);

    const updated = await db.prepare('SELECT * FROM service_bookings WHERE id = ?').get(req.params.id);
    res.json({ message: 'Booking updated.', booking: updated });
  } catch (err) {
    console.error('Update service booking error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── POST /api/services/book-equipment — Smart 25 km match (Tractor + Operator Always) ── */
router.post('/book-equipment', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const {
      equipment_type, hp_min, hp_max, attachment, farm_size,
      days, start_date, location, lat, lng, work_description,
      farm_for, farm_details
    } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'Farm location is required.' });
    }
    if (!equipment_type) {
      return res.status(400).json({ error: 'Equipment type is required.' });
    }

    // SPEC REQUIREMENT: Tractor is ALWAYS provided WITH an operator
    let query = `
      SELECT e.*, u.username as owner_name, u.phone as owner_phone
      FROM equipment_listings e
      JOIN users u ON e.owner_id = u.id
      WHERE e.status = 'approved'
        AND e.with_operator = 1
        AND (e.type ILIKE ? OR e.name ILIKE ?)
    `;
    const params = [`%${equipment_type}%`, `%${equipment_type}%`];

    if (hp_min) { query += ` AND (e.hp IS NULL OR e.hp >= ?)`; params.push(Number(hp_min)); }
    if (hp_max) { query += ` AND (e.hp IS NULL OR e.hp <= ?)`; params.push(Number(hp_max)); }
    if (attachment) {
      query += ` AND (e.attachment IS NULL OR e.attachments_list IS NULL OR e.attachment ILIKE ? OR e.attachments_list ILIKE ?)`;
      params.push(`%${attachment}%`, `%${attachment}%`);
    }

    query += ` ORDER BY e.created_at DESC`;
    const listings = await db.prepare(query).all(...params);

    // 25 km Radius & Availability Filter
    const farmerLat = lat != null ? Number(lat) : null;
    const farmerLng = lng != null ? Number(lng) : null;

    const matched = [];
    for (const l of listings) {
      // Exclude if provider is marked unavailable on target start date
      if (await isProviderUnavailable(db, l.owner_id, start_date)) {
        continue;
      }

      const distKm = getHaversineDistance(farmerLat, farmerLng, l.lat, l.lng);
      const maxDist = l.max_distance || 25;

      // Keep if within provider max_distance (default 25 km) or if lat/lng not provided
      if (distKm == null || distKm <= maxDist) {
        matched.push({ ...l, _distKm: distKm });
      }
    }

    // Sort by proximity
    matched.sort((a, b) => {
      if (a._distKm != null && b._distKm != null) return a._distKm - b._distKm;
      if (a._distKm != null) return -1;
      if (b._distKm != null) return 1;
      return 0;
    });

    if (matched.length === 0) {
      return res.status(200).json({
        message: 'No matching tractor/equipment providers found within 25 km.',
        matched: [],
        booking: null
      });
    }

    // Create a service_booking request per matched provider
    const created = [];
    for (const listing of matched) {
      const otp = generateOtp();
      const price = (listing.price_per_day || 1500) * (Number(days) || 1);

      const result = await db.prepare(`
        INSERT INTO service_bookings (
          user_id, owner_id, listing_id, kind, category, service_name,
          days, start_date, location, lat, lng,
          hp, attachment, farm_size, description, price,
          farm_for, farm_details, otp_code
        ) VALUES (?, ?, ?, 'equipment', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user.id, listing.owner_id, listing.id,
        'Equipment Rental', equipment_type,
        days != null ? Number(days) : 1,
        start_date || null, location,
        farmerLat, farmerLng,
        hp_min != null ? Number(hp_min) : listing.hp,
        attachment || listing.attachment || null,
        farm_size || null,
        work_description || null,
        price,
        farm_for || 'my_farm',
        farm_details || null,
        otp
      );

      const booking = await db.prepare('SELECT * FROM service_bookings WHERE id = ?')
        .get(result.lastInsertRowid);

      created.push({
        id: booking.id,
        provider_name: listing.owner_name,
        provider_phone: listing.owner_phone,
        equipment: listing.name,
        hp: listing.hp,
        with_operator: true,
        price,
        distance_km: listing._distKm != null ? Math.round(listing._distKm) : null
      });
    }

    res.status(201).json({
      message: `Request sent to ${created.length} matching provider(s). Waiting for acceptance.`,
      matched: created,
      booking: created[0] || null
    });
  } catch (err) {
    console.error('Smart equipment booking error:', err);
    res.status(500).json({ error: 'Server error creating equipment booking.' });
  }
});

/* ── GET /api/services/equipment-incoming — Provider sees incoming requests ── */
router.get('/equipment-incoming', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const bookings = await db.prepare(
      `SELECT sb.*, u.username as booker_name, u.phone as booker_phone
       FROM service_bookings sb
       JOIN users u ON sb.user_id = u.id
       WHERE sb.owner_id = ?
       ORDER BY sb.created_at DESC`
    ).all(req.user.id);
    res.json({ bookings, count: bookings.length });
  } catch (err) {
    console.error('Get equipment incoming error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/* ── POST /api/services/book-labour-team — Capacity-based 25 km matching ── */
router.post('/book-labour-team', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const {
      num_workers, days, start_date, location, lat, lng,
      work_description, farm_size, rate_per_worker,
      farm_for, farm_details
    } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'Farm location is required.' });
    }
    if (!num_workers || Number(num_workers) < 1) {
      return res.status(400).json({ error: 'At least 1 worker is required.' });
    }

    const needed = Number(num_workers);

    // SPEC REQUIREMENT: Labour providers who can supply required number of workers
    let query = `
      SELECT l.*, u.username as worker_name, u.phone as worker_phone, u.avatar_url
      FROM labour_services l
      JOIN users u ON l.worker_id = u.id
      WHERE l.status = 'approved'
        AND l.availability = 'available'
        AND (l.team_size IS NULL OR l.team_size >= ?)
    `;
    const params = [needed];
    const listings = await db.prepare(query).all(...params);

    const farmerLat = lat != null ? Number(lat) : null;
    const farmerLng = lng != null ? Number(lng) : null;

    const matched = [];
    for (const l of listings) {
      if (await isProviderUnavailable(db, l.worker_id, start_date)) {
        continue;
      }
      const distKm = getHaversineDistance(farmerLat, farmerLng, l.lat, l.lng);
      const maxDist = l.max_distance || 25;
      if (distKm == null || distKm <= maxDist) {
        matched.push({ ...l, _distKm: distKm });
      }
    }

    matched.sort((a, b) => {
      const aFit = Math.abs((a.team_size || needed) - needed);
      const bFit = Math.abs((b.team_size || needed) - needed);
      if (aFit !== bFit) return aFit - bFit;
      if (a._distKm != null && b._distKm != null) return a._distKm - b._distKm;
      if (a._distKm != null) return -1;
      if (b._distKm != null) return 1;
      return 0;
    });

    if (matched.length === 0) {
      return res.status(200).json({
        message: 'No labour providers found nearby matching worker count capacity.',
        matched: [],
        booking: null
      });
    }

    const created = [];
    for (const listing of matched) {
      const otp = generateOtp();
      const price = (listing.daily_rate || rate_per_worker || 350) * needed * (Number(days) || 1);

      const result = await db.prepare(`
        INSERT INTO service_bookings (
          user_id, owner_id, listing_id, kind, category, service_name,
          num_workers, days, start_date, location, lat, lng,
          description, price, farm_for, farm_details, otp_code
        ) VALUES (?, ?, ?, 'labour_team', 'Farm Workers', 'Farm Workers', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user.id, listing.worker_id, listing.id,
        needed,
        days != null ? Number(days) : 1,
        start_date || null, location,
        farmerLat, farmerLng,
        work_description || null,
        price,
        farm_for || 'my_farm',
        farm_details || null,
        otp
      );

      const booking = await db.prepare('SELECT * FROM service_bookings WHERE id = ?')
        .get(result.lastInsertRowid);

      created.push({
        id: booking.id,
        provider_name: listing.worker_name,
        provider_phone: listing.worker_phone,
        team_size: listing.team_size || needed,
        daily_rate: listing.daily_rate,
        price,
        distance_km: listing._distKm != null ? Math.round(listing._distKm) : null
      });
    }

    res.status(201).json({
      message: `Request sent to ${created.length} matching labour provider(s). Waiting for acceptance.`,
      matched: created,
      booking: created[0] || null
    });
  } catch (err) {
    console.error('Smart labour booking error:', err);
    res.status(500).json({ error: 'Server error creating labour booking.' });
  }
});

/* ── POST /api/services/book-service — Category & Service-Specific 25 km Match ── */
router.post('/book-service', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const {
      category, service_name, start_date, location, lat, lng,
      num_workers, service_details, farm_for, farm_details
    } = req.body;

    if (!location) {
      return res.status(400).json({ error: 'Farm location is required.' });
    }
    if (!service_name) {
      return res.status(400).json({ error: 'Service name is required.' });
    }

    const searchTerms = [service_name, category].filter(Boolean);
    let skillClause = '';
    const skillParams = [];
    if (searchTerms.length > 0) {
      const conditions = searchTerms.map((term) => {
        skillParams.push(`%${term}%`);
        skillParams.push(`%${term}%`);
        skillParams.push(`%${term}%`);
        return `(l.skills ILIKE ? OR l.title ILIKE ? OR l.description ILIKE ?)`;
      });
      skillClause = `AND (${conditions.join(' OR ')})`;
    }

    let query = `
      SELECT l.*, u.username as worker_name, u.phone as worker_phone
      FROM labour_services l
      JOIN users u ON l.worker_id = u.id
      WHERE l.status = 'approved'
        AND l.availability = 'available'
        ${skillClause}
    `;
    const listings = await db.prepare(query).all(...skillParams);

    const farmerLat = lat != null ? Number(lat) : null;
    const farmerLng = lng != null ? Number(lng) : null;

    const matched = [];
    for (const l of listings) {
      if (await isProviderUnavailable(db, l.worker_id, start_date)) {
        continue;
      }
      const distKm = getHaversineDistance(farmerLat, farmerLng, l.lat, l.lng);
      const maxDist = l.max_distance || 25;
      if (distKm == null || distKm <= maxDist) {
        matched.push({ ...l, _distKm: distKm });
      }
    }

    matched.sort((a, b) => {
      if (a._distKm != null && b._distKm != null) return a._distKm - b._distKm;
      if (a._distKm != null) return -1;
      if (b._distKm != null) return 1;
      return 0;
    });

    if (matched.length === 0) {
      return res.status(200).json({
        message: 'No matching service providers found within 25 km.',
        matched: [],
        booking: null
      });
    }

    const created = [];
    for (const listing of matched) {
      const otp = generateOtp();
      const price = (listing.daily_rate || 500) * (Number(num_workers) || 1);

      const result = await db.prepare(`
        INSERT INTO service_bookings (
          user_id, owner_id, listing_id, kind, category, service_name,
          num_workers, start_date, location, lat, lng,
          description, price, farm_for, farm_details, otp_code
        ) VALUES (?, ?, ?, 'service', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user.id, listing.worker_id, listing.id,
        category || null, service_name,
        num_workers != null ? Number(num_workers) : null,
        start_date || null, location,
        farmerLat, farmerLng,
        service_details || null,
        price,
        farm_for || 'my_farm',
        farm_details || null,
        otp
      );

      const booking = await db.prepare('SELECT * FROM service_bookings WHERE id = ?')
        .get(result.lastInsertRowid);

      created.push({
        id: booking.id,
        provider_name: listing.worker_name,
        provider_phone: listing.worker_phone,
        skills: listing.skills,
        price,
        distance_km: listing._distKm != null ? Math.round(listing._distKm) : null
      });
    }

    res.status(201).json({
      message: `Request sent to ${created.length} matching service provider(s). Waiting for acceptance.`,
      matched: created,
      booking: created[0] || null
    });
  } catch (err) {
    console.error('Smart service booking error:', err);
    res.status(500).json({ error: 'Server error creating service booking.' });
  }
});

/* ── POST /api/services/:id/verify-otp — Provider inputs OTP to start work ── */
router.post('/:id/verify-otp', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const { otp } = req.body;

    const booking = await db.prepare('SELECT * FROM service_bookings WHERE id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    if (booking.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only the assigned provider can verify OTP.' });
    }

    if (booking.otp_code !== String(otp).trim()) {
      return res.status(400).json({ error: 'Invalid OTP code. Please ask farmer for correct OTP.' });
    }

    // OTP verified! Transition status to active (In Progress)
    await db.prepare(`
      UPDATE service_bookings
      SET otp_verified = 1, status = 'active', updated_at = NOW()
      WHERE id = ?
    `).run(req.params.id);

    const updated = await db.prepare('SELECT * FROM service_bookings WHERE id = ?').get(req.params.id);
    res.json({ message: 'OTP verified! Work has officially started.', booking: updated });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Server error verifying OTP.' });
  }
});

/* ── POST /api/services/:id/complete — Work complete & Escrow payout release ── */
router.post('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const booking = await db.prepare('SELECT * FROM service_bookings WHERE id = ?').get(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    const isFarmer = booking.user_id === req.user.id;
    const isProvider = booking.owner_id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isFarmer && !isProvider && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    // Update status to completed & payment_status to released
    await db.prepare(`
      UPDATE service_bookings
      SET status = 'completed', payment_status = 'released', updated_at = NOW()
      WHERE id = ?
    `).run(req.params.id);

    const updated = await db.prepare('SELECT * FROM service_bookings WHERE id = ?').get(req.params.id);
    res.json({ message: 'Work completed! Payment released from Escrow.', booking: updated });
  } catch (err) {
    console.error('Complete booking error:', err);
    res.status(500).json({ error: 'Server error completing booking.' });
  }
});

module.exports = router;
