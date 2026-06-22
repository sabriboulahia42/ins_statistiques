/**
 * auth/config.js
 * ──────────────────────────────────────────────────────────────
 * OAuth2 & JWT Configuration for INS Statistics Portal
 * ──────────────────────────────────────────────────────────────
 */

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const GOOGLE_CONFIG = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3080/auth/google/callback'
};

const FACEBOOK_CONFIG = {
  clientID: process.env.FACEBOOK_CLIENT_ID || process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3080/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'photos', 'emails']
};

const TWITTER_CONFIG = {
  consumerKey: process.env.TWITTER_CONSUMER_KEY || process.env.X_CLIENT_ID,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET || process.env.X_CLIENT_SECRET,
  callbackURL: process.env.TWITTER_CALLBACK_URL || 'http://localhost:3080/auth/twitter/callback',
  includeEmail: true
};

const GITHUB_CONFIG = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3080/auth/github/callback'
};

const CORS_CONFIG = {
  origin: (process.env.CORS_ORIGIN || 'http://localhost:3080').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token']
};

const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  GOOGLE_CONFIG,
  FACEBOOK_CONFIG,
  TWITTER_CONFIG,
  GITHUB_CONFIG,
  CORS_CONFIG,
  ROLES
};
