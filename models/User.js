/**
 * models/User.js
 * ──────────────────────────────────────────────────────────────
 * Mongoose User schema for MongoDB.
 * Mirrors the fields used by the file-based auth/db.js so that
 * switching between storage backends requires no route changes.
 * ──────────────────────────────────────────────────────────────
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      match:     [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
    },
    passwordHash: {
      type:   String,
      select: false,   // Never returned in queries by default
    },
    role: {
      type:    String,
      enum:    ['admin', 'editor', 'viewer'],
      default: 'viewer',
    },
    provider: {
      type:    String,
      default: 'local',
    },
    googleId:       { type: String, default: null },
    facebookId:     { type: String, default: null },
    twitterId:      { type: String, default: null },
    githubId:       { type: String, default: null },
    profilePicture: { type: String, default: null },
    isActive:       { type: Boolean, default: true },
    lastLogin:      { type: Date,    default: null },
  },
  {
    timestamps: true,   // adds createdAt / updatedAt
    versionKey: false,
  }
);

// ── Instance helpers ──────────────────────────────────────────

/**
 * Hash a plain-text password and store it.
 */
UserSchema.methods.setPassword = async function (plain) {
  this.passwordHash = await bcrypt.hash(plain, 10);
};

/**
 * Compare a plain-text password against the stored hash.
 * Requires the document to have been fetched with `+passwordHash`.
 */
UserSchema.methods.verifyPassword = async function (plain) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plain, this.passwordHash);
};

/**
 * Return a safe user object (no passwordHash).
 */
UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

// ── Prevent model re-compilation during hot-reload ───────────
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
