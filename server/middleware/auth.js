/* ═══════════════════════════════════════════
   KrishiSetu — server/middleware/auth.js
   (JWT authentication middleware)
   ═══════════════════════════════════════════ */

const jwt = require('jsonwebtoken');
const { getDb } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'krishisetu_jwt_secret_key_change_in_production';
const JWT_EXPIRES_IN = '7d';

/**
 * Authenticate a user by verifying their JWT token.
 * Attaches `req.user` if successful.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify session exists in DB
    const db = getDb();
    const session = db.prepare(
      'SELECT id FROM sessions WHERE token = ? AND expires_at > datetime(\'now\')'
    ).get(token);

    if (!session) {
      return res.status(401).json({ error: 'Session expired or invalid.' });
    }

    // Get user data
    const user = db.prepare(
      'SELECT id, username, email, role, phone, location, avatar_url, created_at FROM users WHERE id = ?'
    ).get(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

/**
 * Generate a JWT token for a user.
 */
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Optional: require a specific role.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    next();
  };
}

module.exports = { authenticateToken, generateToken, requireRole, JWT_SECRET };
