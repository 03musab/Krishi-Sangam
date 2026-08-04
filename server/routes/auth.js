/* ═══════════════════════════════════════════
   KrishiSetu — server/routes/auth.js
   (Authentication routes: signup, signin, me — async, Postgres)
   ═══════════════════════════════════════════ */

const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db');
const { sendOtp: sendOtpSms } = require('../lib/sms');
const { authenticateToken, generateToken } = require('../middleware/auth');

const router = express.Router();

const SALT_ROUNDS = 10;
const SESSION_DAYS = 7;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/* ── POST /api/auth/send-otp ───────────────── */
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute between sends per phone

router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10}$/.test(String(phone))) {
      return res.status(400).json({ error: 'A valid 10-digit mobile number is required.' });
    }
    const db = getDb();
    const phoneStr = String(phone);

    // Cooldown: block rapid resends (SMS-bombing / cost protection).
    const recent = await db.prepare(
      'SELECT created_at FROM otp_verifications WHERE phone = ? ORDER BY id DESC LIMIT 1'
    ).get(phoneStr);
    if (recent && recent.created_at) {
      const elapsed = Date.now() - new Date(recent.created_at).getTime();
      if (elapsed < OTP_RESEND_COOLDOWN_MS) {
        const wait = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
        return res.status(429).json({ error: `Please wait ${wait}s before requesting another OTP.` });
      }
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await db.prepare('DELETE FROM otp_verifications WHERE phone = ?').run(phoneStr);
    await db.prepare('INSERT INTO otp_verifications (phone, otp, expires_at) VALUES (?, ?, ?)')
      .run(phoneStr, otp, expiresAt);

    // Deliver via Knock SMS in production; fall back to returning the OTP in
    // the response when no KNOCK_API_KEY is configured (local dev / demo).
    const result = await sendOtpSms(phoneStr, otp);
    if (result.delivered) {
      res.json({ message: 'OTP sent successfully.' });
    } else {
      console.log(`[OTP] Dev mode — OTP for ${phone}: ${otp}`);
      res.json({ message: 'OTP sent successfully.', devOtp: result.devOtp });
    }
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ error: 'Server error sending OTP.' });
  }
});

/* ── POST /api/auth/verify-otp ─────────────── */
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: 'Phone and OTP are required.' });
    }
    const db = getDb();
    const record = await db.prepare(
      'SELECT * FROM otp_verifications WHERE phone = ? ORDER BY id DESC LIMIT 1'
    ).get(String(phone));

    if (!record) {
      return res.status(400).json({ error: 'No OTP request found for this number.' });
    }
    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }
    if (record.otp !== String(otp)) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    await db.prepare('DELETE FROM otp_verifications WHERE phone = ?').run(String(phone));
    res.json({ message: 'OTP verified successfully.', verified: true });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Server error verifying OTP.' });
  }
});

/* ── POST /api/auth/register ───────────────── */
router.post('/register', async (req, res) => {
  try {
    const db = getDb();
    const {
      full_name, username, phone, email, password, role,
      gender, dob, govt_id_url, id_type, id_number, village, taluka, district, state,
      labour_category, skill_level, bank_account, ifsc, upi_id,
      farm_size, farm_lat, farm_lng, location
    } = req.body;

    if (!full_name || !phone || !password) {
      return res.status(400).json({ error: 'Full name, mobile number, and password are required.' });
    }
    if (!/^\d{10}$/.test(String(phone))) {
      return res.status(400).json({ error: 'A valid 10-digit mobile number is required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const validIdTypes = ['aadhaar', 'voter', 'driving'];
    if (!id_type || !validIdTypes.includes(id_type)) {
      return res.status(400).json({ error: 'Please choose a valid government ID type.' });
    }
    if (!id_number || !String(id_number).trim()) {
      return res.status(400).json({ error: 'Please provide your government ID number.' });
    }

    const validRoles = ['farmer', 'owner', 'labourer', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'farmer';

    // Unique username/email derived from phone (fallback if the user leaves them blank)
    const derivedUsername = (full_name || '').trim().replace(/\s+/g, '_').toLowerCase() + '_' + phone;
    const providedUsername = (username || '').trim().replace(/\s+/g, '_').toLowerCase();
    if (providedUsername && !/^[a-z0-9_]{3,30}$/.test(providedUsername)) {
      return res.status(400).json({ error: 'Username must be 3-30 characters using letters, numbers, or underscores.' });
    }
    const finalUsername = providedUsername || derivedUsername;
    const userEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? email.trim()
      : `${phone}@krishisangam.local`;

    const existing = await db.prepare('SELECT id FROM users WHERE email = ? OR username = ?')
      .get(userEmail, finalUsername);
    if (existing) {
      return res.status(409).json({ error: 'Username, email, or mobile number already in use.' });
    }

    const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);
    const result = await db.prepare(`
      INSERT INTO users (
        username, email, password_hash, role, phone, gender, dob,
        govt_id_url, id_type, id_number, village, taluka, district, state, location,
        labour_category, skill_level, bank_account, ifsc, upi_id,
        farm_size, farm_lat, farm_lng, phone_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      finalUsername, userEmail, passwordHash, userRole, String(phone),
      gender || null, dob || null, govt_id_url || null,
      id_type || null, id_number || null,
      village || null, taluka || null, district || null, state || null,
      location || [village, taluka, district, state].filter(Boolean).join(', ') || null,
      labour_category || null, skill_level || null,
      bank_account || null, ifsc || null, upi_id || null,
      farm_size || null,
      farm_lat != null ? Number(farm_lat) : null,
      farm_lng != null ? Number(farm_lng) : null
    );

    const userId = result.lastInsertRowid;
    const token = generateToken(userId);
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();

    await db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)')
      .run(userId, token, expiresAt);

    const user = await db.prepare(
      'SELECT id, username, email, role, phone, gender, dob, govt_id_url, id_type, id_number, village, taluka, district, state, labour_category, skill_level, bank_account, ifsc, upi_id, farm_size, created_at FROM users WHERE id = ?'
    ).get(userId);

    res.status(201).json({ message: 'Registration successful!', token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

/* ── POST /api/auth/signup ─────────────────── */
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, role, phone, location } = req.body;

    // ── Validation ──
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    const validRoles = ['farmer', 'owner', 'labourer', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'farmer';

    const db = getDb();

    // ── Check duplicates ──
    const existingUser = await db.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    ).get(email, username);

    if (existingUser) {
      return res.status(409).json({ error: 'Username or email already exists.' });
    }

    // ── Create user ──
    const passwordHash = bcrypt.hashSync(password, SALT_ROUNDS);

    const result = await db.prepare(`
      INSERT INTO users (username, email, password_hash, role, phone, location)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(username, email, passwordHash, userRole, phone || null, location || null);

    const userId = result.lastInsertRowid;

    // ── Generate token & create session ──
    const token = generateToken(userId);
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();

    await db.prepare(`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `).run(userId, token, expiresAt);

    // ── Response ──
    const user = await db.prepare(
      'SELECT id, username, email, role, phone, location, avatar_url, created_at FROM users WHERE id = ?'
    ).get(userId);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

/* ── GET /api/auth/check-username ──────────── */
router.get('/check-username', async (req, res) => {
  try {
    const raw = (req.query.username || '').trim();
    if (!raw) {
      return res.json({ available: false });
    }
    // Sanitize the same way registration does
    const username = raw.replace(/\s+/g, '_').toLowerCase();
    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      return res.json({ available: false });
    }
    const db = getDb();
    const existing = await db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    res.json({ available: !existing });
  } catch (err) {
    console.error('Check username error:', err);
    res.status(500).json({ error: 'Server error checking username.' });
  }
});

/* ── POST /api/auth/signin ─────────────────── */
router.post('/signin', async (req, res) => {
  try {
    const { identifier, email, phone, password } = req.body;

    // Accept email or phone as the login identifier (username is no longer used)
    const loginId = (identifier || email || phone || '').toString().trim();
    if (!loginId || !password) {
      return res.status(400).json({ error: 'Email/phone and password are required.' });
    }

    const db = getDb();

    // ── Find user by email or phone ──
    const user = await db.prepare(
      'SELECT * FROM users WHERE email = ? OR phone = ?'
    ).get(loginId, loginId);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email/phone or password.' });
    }

    // ── Verify password ──
    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email/phone or password.' });
    }

    // ── Generate token & create session ──
    const token = generateToken(user.id);
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();

    await db.prepare(`
      INSERT INTO sessions (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `).run(user.id, token, expiresAt);

    // ── Response (exclude password_hash) ──
    const { password_hash, ...safeUser } = user;

    res.json({
      message: 'Signed in successfully!',
      token,
      user: safeUser
    });

  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Server error during signin.' });
  }
});

/* ── POST /api/auth/signin-otp ─────────────── */
// Logs the user in using a phone number + OTP (no password, no username).
router.post('/signin-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !/^\d{10}$/.test(String(phone)) || !otp) {
      return res.status(400).json({ error: 'A valid 10-digit mobile number and OTP are required.' });
    }

    const db = getDb();
    const record = await db.prepare(
      'SELECT * FROM otp_verifications WHERE phone = ? ORDER BY id DESC LIMIT 1'
    ).get(String(phone));

    if (!record) {
      return res.status(400).json({ error: 'No OTP request found for this number.' });
    }
    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }
    if (record.otp !== String(otp)) {
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    // ── Find the user by phone first, so a valid OTP isn't consumed for an unknown number ──
    const user = await db.prepare('SELECT * FROM users WHERE phone = ?').get(String(phone));
    if (!user) {
      return res.status(404).json({ error: 'No account found for this number. Please sign up first.' });
    }

    await db.prepare('DELETE FROM otp_verifications WHERE phone = ?').run(String(phone));

    // ── Generate token & create session ──
    const token = generateToken(user.id);
    const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000).toISOString();

    await db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)')
      .run(user.id, token, expiresAt);

    const { password_hash, ...safeUser } = user;
    res.json({ message: 'Signed in successfully!', token, user: safeUser });
  } catch (err) {
    console.error('Signin OTP error:', err);
    res.status(500).json({ error: 'Server error during signin.' });
  }
});

/* ── GET /api/auth/me ──────────────────────── */
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

/* ── POST /api/auth/signout ────────────────── */
router.post('/signout', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    const db = getDb();
    await db.prepare('DELETE FROM sessions WHERE token = ?').run(token);

    res.json({ message: 'Signed out successfully.' });
  } catch (err) {
    console.error('Signout error:', err);
    res.status(500).json({ error: 'Server error during signout.' });
  }
});

module.exports = router;
