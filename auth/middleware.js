/**
 * auth/middleware.js
 * ──────────────────────────────────────────────────────────────
 * JWT verification and role-based access control middleware
 * ──────────────────────────────────────────────────────────────
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET, ROLES } = require('./config');

/**
 * Verify JWT token from Authorization header
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

/**
 * Verify token is from an admin
 */
function requireAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    next();
  });
}

/**
 * Verify token is from admin or editor
 */
function requireEditor(req, res, next) {
  verifyToken(req, res, () => {
    if (![ROLES.ADMIN, ROLES.EDITOR].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Editor access required' });
    }
    next();
  });
}

/**
 * Optional token verification (won't fail if missing)
 */
function optionalToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Silently ignore invalid token
    }
  }
  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
  requireEditor,
  optionalToken
};
