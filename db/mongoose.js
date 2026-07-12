/**
 * db/mongoose.js
 * ──────────────────────────────────────────────────────────────
 * Establishes a persistent Mongoose connection to MongoDB.
 * Called once at server start; subsequent requires share the
 * same connection pool automatically.
 *
 * Usage:
 *   require('./db/mongoose');   // connects; errors are logged
 * ──────────────────────────────────────────────────────────────
 */

'use strict';

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  // Not a fatal error – the profile routes fall back to file-based storage
  console.warn('[MongoDB] MONGODB_URI/DATABASE_URL not set – skipping Mongoose connection.');
  module.exports = { connected: false };
  return;
}

mongoose.set('strictQuery', true);

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS:          45000,
  })
  .then(() => {
    console.log('[MongoDB] ✓ Connected to', MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@'));
  })
  .catch((err) => {
    console.error('[MongoDB] ✗ Connection failed:', err.message);
    // Don't crash the process – fall back to file-based storage
  });

// Reconnect on unexpected disconnection
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected. Attempting to reconnect…');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Reconnected.');
});

module.exports = { connected: true, mongoose };
