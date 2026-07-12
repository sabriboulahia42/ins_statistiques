/**
 * routes/profile.js
 * ──────────────────────────────────────────────────────────────
 * CRUD profile routes:
 *
 *   POST   /login                 – authenticate, return JWT
 *   GET    /profile               – get own profile (auth required)
 *   PUT    /profile/update        – update own profile (auth required)
 *   DELETE /account/deactivate    – soft-delete own account (auth required)
 *
 * Storage strategy
 * ────────────────
 * When MONGODB_URI is set in .env, routes use Mongoose (MongoDB).
 * Otherwise they fall back to the existing file-based auth/db.js
 * so the server works out-of-the-box without a database.
 * ──────────────────────────────────────────────────────────────
 */

'use strict';

const express = require('express');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');

const { verifyToken } = require('../auth/middleware');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../auth/config');

const router = express.Router();

// ── Storage back-end selection ────────────────────────────────

const USE_MONGO = Boolean(process.env.MONGODB_URI || process.env.DATABASE_URL);

/**
 * Thin adapter so routes are identical regardless of storage back-end.
 *
 * Each method returns plain JS objects (never Mongoose documents),
 * and passwordHash is NEVER included unless explicitly requested.
 */
const store = USE_MONGO
  ? (() => {
      const User = require('../models/User');

      return {
        /** Find by email; optionally include passwordHash for verification */
        async findByEmail(email, withHash = false) {
          const q = User.findOne({ email: email.toLowerCase() });
          if (withHash) q.select('+passwordHash');
          const doc = await q.lean();
          if (!doc) return null;
          // normalise _id → id
          const { _id, ...rest } = doc;
          return { id: _id.toString(), ...rest };
        },

        async findById(id) {
          const doc = await User.findById(id).lean();
          if (!doc) return null;
          const { _id, passwordHash, ...rest } = doc;
          return { id: _id.toString(), ...rest };
        },

        async create({ email, password, name, role = 'viewer' }) {
          const hash = await bcrypt.hash(password, 10);
          const doc  = await User.create({
            email: email.toLowerCase(),
            name,
            passwordHash: hash,
            role,
            provider: 'local',
          });
          const { _id, passwordHash, ...rest } = doc.toObject();
          return { id: _id.toString(), ...rest };
        },

        async update(id, data) {
          const doc = await User.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true, runValidators: true }
          ).lean();
          if (!doc) return null;
          const { _id, passwordHash, ...rest } = doc;
          return { id: _id.toString(), ...rest };
        },

        async deactivate(id) {
          await User.findByIdAndUpdate(id, { $set: { isActive: false } });
        },

        async verifyPassword(plainPassword, user) {
          // Re-fetch with hash
          const doc = await User.findById(user.id).select('+passwordHash').lean();
          if (!doc || !doc.passwordHash) return false;
          return bcrypt.compare(plainPassword, doc.passwordHash);
        },

        async updateLastLogin(id) {
          await User.findByIdAndUpdate(id, { $set: { lastLogin: new Date() } });
        },
      };
    })()
  : (() => {
      // File-based fallback (auth/db.js)
      const db = require('../auth/db');

      return {
        async findByEmail(email) {
          return db.findUserByEmail(email) || null;
        },
        async findById(id) {
          return db.findUserById(id) || null;
        },
        async create(data) {
          return db.createUser(data);
        },
        async update(id, data) {
          return db.updateUser(id, data);
        },
        async deactivate(id) {
          db.updateUser(id, { isActive: false });
        },
        async verifyPassword(plainPassword, user) {
          const fullUser = db.findUserById(user.id);
          if (!fullUser || !fullUser.passwordHash) return false;
          return db.verifyPassword(plainPassword, fullUser.passwordHash);
        },
        async updateLastLogin(id) {
          db.updateLastLogin(id);
        },
      };
    })();

// ── Helpers ───────────────────────────────────────────────────

function signToken(payload) {
  return jwt.sign(
    { id: payload.id, email: payload.email, role: payload.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// ── Routes ────────────────────────────────────────────────────

/**
 * POST /login
 * ──────────────────────────────────────────────────────────────
 * Body: { email, password }
 *
 * Returns: { success, token, user }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Fetch user (with passwordHash for Mongo path)
    const user = USE_MONGO
      ? await store.findByEmail(email, true)
      : await store.findByEmail(email);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'Account is deactivated' });
    }

    const valid = await store.verifyPassword(password, user);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    await store.updateLastLogin(user.id);

    const token = signToken(user);

    // Strip sensitive fields before sending
    const { passwordHash, ...safeUser } = user;

    return res.status(200).json({ success: true, token, user: safeUser });
  } catch (err) {
    console.error('[Profile] POST /login error:', err.message);
    return res.status(500).json({ success: false, error: 'Login failed' });
  }
});

/**
 * GET /profile
 * ──────────────────────────────────────────────────────────────
 * Header: Authorization: Bearer <token>
 *
 * Returns: { success, user }
 */
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await store.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('[Profile] GET /profile error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

/**
 * PUT /profile/update
 * ──────────────────────────────────────────────────────────────
 * Header: Authorization: Bearer <token>
 * Body  : { name?, email?, password? }   (all optional)
 *
 * Returns: { success, user }
 */
router.put('/profile/update', verifyToken, async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    const updateData = {};

    if (name  !== undefined) updateData.name  = name.trim();
    if (email !== undefined) updateData.email = email.toLowerCase().trim();

    // If a new password is supplied, hash it before saving
    if (password !== undefined) {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters',
        });
      }
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No update fields provided (name, email, or password)',
      });
    }

    const updated = await store.update(req.user.id, updateData);

    if (!updated) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Never expose passwordHash in the response
    const { passwordHash, ...safeUser } = updated;

    return res.status(200).json({ success: true, user: safeUser });
  } catch (err) {
    console.error('[Profile] PUT /profile/update error:', err.message);
    // Mongoose validation errors surface as 'ValidationError'
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: err.message });
    }
    return res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

/**
 * DELETE /account/deactivate
 * ──────────────────────────────────────────────────────────────
 * Header: Authorization: Bearer <token>
 *
 * Soft-deletes the account (sets isActive = false) instead of
 * purging the record so audit trails and foreign-key references
 * remain intact.
 *
 * Returns: { success, message }
 */
router.delete('/account/deactivate', verifyToken, async (req, res) => {
  try {
    const user = await store.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(409).json({
        success: false,
        error: 'Account is already deactivated',
      });
    }

    await store.deactivate(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Account deactivated successfully. Contact support to reactivate.',
    });
  } catch (err) {
    console.error('[Profile] DELETE /account/deactivate error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to deactivate account' });
  }
});

module.exports = router;
