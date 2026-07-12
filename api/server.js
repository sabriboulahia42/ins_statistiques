/**
 * api/server.js
 * ══════════════════════════════════════════════════════════════════
 * Isolated INS Statistics Backend API Server
 * 
 * Pure Node.js/Express backend:
 * - NO browser dependencies (no window, document, Chart.js, etc.)
 * - NO UI configuration files
 * - Express.js server with CORS
 * - Passport OAuth2 authentication (Google, Facebook, Twitter, GitHub)
 * - JWT token generation and verification
 * - XML metadata parsing from INS SDMX file
 * - Geolocation API proxy with caching
 * - AI integration (Hugging Face)
 * - Settings management
 * 
 * Deploy to Render.com with: npm start
 * ══════════════════════════════════════════════════════════════════
 */

'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const fetch = require('node-fetch');
const { XMLParser } = require('fast-xml-parser');
const bcryptjs = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// ══════════════════════════════════════════════════════════════════
// ENVIRONMENT & CONFIGURATION
// ══════════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// File paths (relative to api/ directory)
const XML_FILE_PATH = path.join(__dirname, '..', 'e426de42-8f6e-4e74-a23f-65a314f8c426.xml');
const SETTINGS_FILE = path.join(__dirname, '..', 'settings.json');
const USERS_DB_FILE = path.join(__dirname, '..', 'data', 'users.json');

// OAuth Configuration
const GOOGLE_CONFIG = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/auth/google/callback'
};

const FACEBOOK_CONFIG = {
  clientID: process.env.FACEBOOK_CLIENT_ID || process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:4000/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'photos', 'emails']
};

const TWITTER_CONFIG = {
  consumerKey: process.env.TWITTER_CONSUMER_KEY || process.env.X_CLIENT_ID,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET || process.env.X_CLIENT_SECRET,
  callbackURL: process.env.TWITTER_CALLBACK_URL || 'http://localhost:4000/auth/twitter/callback',
  includeEmail: true
};

const GITHUB_CONFIG = {
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:4000/auth/github/callback'
};

const CORS_ORIGIN = (process.env.CORS_ORIGIN || 'http://localhost:3080').split(',');

const CORS_CONFIG = {
  origin: CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-token']
};

const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

// ══════════════════════════════════════════════════════════════════
// DATABASE CONNECTION (MONGOOSE)
// ══════════════════════════════════════════════════════════════════
require('../db/mongoose');

// ══════════════════════════════════════════════════════════════════
// IN-MEMORY USER DATABASE
// ══════════════════════════════════════════════════════════════════

let usersDb = [];

function initUsersDb() {
  try {
    if (fs.existsSync(USERS_DB_FILE)) {
      const data = fs.readFileSync(USERS_DB_FILE, 'utf8');
      usersDb = JSON.parse(data);
      console.log(`[DB] Loaded ${usersDb.length} users from file`);
    }
  } catch (err) {
    console.warn('[DB] Could not load users file:', err.message);
  }
}

function saveUsersDb() {
  try {
    const dir = path.dirname(USERS_DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_DB_FILE, JSON.stringify(usersDb, null, 2));
  } catch (err) {
    console.error('[DB] Failed to save users:', err.message);
  }
}

const UserDB = {
  findUserById(id) {
    return usersDb.find(u => u.id === id) || null;
  },
  
  findUserByEmail(email) {
    return usersDb.find(u => u.email === email) || null;
  },
  
  createUser(userData) {
    const user = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      isActive: true,
      ...userData
    };
    usersDb.push(user);
    saveUsersDb();
    return user;
  },
  
  updateUser(id, updates) {
    const user = this.findUserById(id);
    if (user) {
      Object.assign(user, updates);
      saveUsersDb();
    }
    return user;
  },
  
  updateLastLogin(id) {
    const user = this.findUserById(id);
    if (user) {
      user.lastLogin = new Date().toISOString();
      saveUsersDb();
    }
  },
  
  verifyPassword(plaintext, hash) {
    return bcryptjs.compareSync(plaintext, hash);
  },
  
  hashPassword(plaintext) {
    return bcryptjs.hashSync(plaintext, 10);
  }
};

initUsersDb();

// ══════════════════════════════════════════════════════════════════
// PASSPORT OAUTH2 STRATEGIES
// ══════════════════════════════════════════════════════════════════

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

if (GOOGLE_CONFIG.clientID && GOOGLE_CONFIG.clientSecret) {
  passport.use(new GoogleStrategy(
    GOOGLE_CONFIG,
    (accessToken, refreshToken, profile, done) => {
      try {
        let user = UserDB.findUserByEmail(profile.emails[0].value);
        if (!user) {
          user = UserDB.createUser({
            email: profile.emails[0].value,
            name: profile.displayName,
            googleId: profile.id,
            profilePicture: profile.photos[0]?.value,
            provider: 'google',
            role: ROLES.VIEWER
          });
        } else {
          UserDB.updateUser(user.id, {
            googleId: profile.id,
            profilePicture: profile.photos[0]?.value || user.profilePicture,
            provider: user.provider === 'google' ? 'google' : 'hybrid'
          });
          user = UserDB.findUserById(user.id);
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
}

if (FACEBOOK_CONFIG.clientID && FACEBOOK_CONFIG.clientSecret) {
  passport.use(new FacebookStrategy(
    FACEBOOK_CONFIG,
    (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `facebook-${profile.id}@ins.tn`;
        let user = UserDB.findUserByEmail(email);
        if (!user) {
          user = UserDB.createUser({
            email,
            name: profile.displayName,
            facebookId: profile.id,
            profilePicture: profile.photos?.[0]?.value,
            provider: 'facebook',
            role: ROLES.VIEWER
          });
        } else {
          UserDB.updateUser(user.id, {
            facebookId: profile.id,
            profilePicture: profile.photos?.[0]?.value || user.profilePicture,
            provider: user.provider === 'facebook' ? 'facebook' : 'hybrid'
          });
          user = UserDB.findUserById(user.id);
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
}

if (TWITTER_CONFIG.consumerKey && TWITTER_CONFIG.consumerSecret) {
  passport.use(new TwitterStrategy(
    TWITTER_CONFIG,
    (token, tokenSecret, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `twitter-${profile.id}@ins.tn`;
        let user = UserDB.findUserByEmail(email);
        if (!user) {
          user = UserDB.createUser({
            email,
            name: profile.displayName || profile.username,
            twitterId: profile.id,
            profilePicture: profile.photos?.[0]?.value,
            provider: 'twitter',
            role: ROLES.VIEWER
          });
        } else {
          UserDB.updateUser(user.id, {
            twitterId: profile.id,
            profilePicture: profile.photos?.[0]?.value || user.profilePicture,
            provider: user.provider === 'twitter' ? 'twitter' : 'hybrid'
          });
          user = UserDB.findUserById(user.id);
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
}

if (GITHUB_CONFIG.clientID && GITHUB_CONFIG.clientSecret) {
  passport.use(new GitHubStrategy(
    GITHUB_CONFIG,
    (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || `github-${profile.id}@ins.tn`;
        let user = UserDB.findUserByEmail(email);
        if (!user) {
          user = UserDB.createUser({
            email,
            name: profile.displayName || profile.username,
            githubId: profile.id,
            profilePicture: profile.photos?.[0]?.value,
            provider: 'github',
            role: ROLES.VIEWER
          });
        } else {
          UserDB.updateUser(user.id, {
            githubId: profile.id,
            profilePicture: profile.photos?.[0]?.value || user.profilePicture,
            provider: user.provider === 'github' ? 'github' : 'hybrid'
          });
          user = UserDB.findUserById(user.id);
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
}

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, UserDB.findUserById(id)));

// ══════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ══════════════════════════════════════════════════════════════════

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }
    next();
  });
}

function requireEditor(req, res, next) {
  verifyToken(req, res, () => {
    if (![ROLES.ADMIN, ROLES.EDITOR].includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Editor access required' });
    }
    next();
  });
}

// ══════════════════════════════════════════════════════════════════
// XML METADATA PARSER
// ══════════════════════════════════════════════════════════════════

function parseMetadataXML() {
  if (!fs.existsSync(XML_FILE_PATH)) {
    throw new Error(`XML file not found at ${XML_FILE_PATH}`);
  }
  const xmlData = fs.readFileSync(XML_FILE_PATH, 'utf8');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (name) => ['Source', 'Dimension'].includes(name)
  });
  const parsed = parser.parse(xmlData);
  const sources = parsed?.Structure?.Sources?.Source || [];
  return sources.map((source) => {
    const rawDimensions = source.Dimensions?.Dimension || [];
    const dimensions = rawDimensions.map((dim) => ({
      id: dim['@_Id'],
      name: dim['@_Name'],
      type: dim['@_DimensionType']
    }));
    const period = source.Period || {};
    return {
      id: source['@_Id'],
      key: source['@_Key'],
      name: source['@_Name'],
      description: source.Description || 'No description available.',
      period: { start: period.StartYear || null, end: period.FinishYear || null },
      dimensions
    };
  });
}

// ══════════════════════════════════════════════════════════════════
// GEOLOCATION CACHING
// ══════════════════════════════════════════════════════════════════

const PRIVATE_IP_RE = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fc|fd)/;
const geoCache = new Map();
const GEO_CACHE_TTL = 24 * 60 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of geoCache.entries()) {
    if (now - entry.timestamp > GEO_CACHE_TTL) geoCache.delete(ip);
  }
}, 60 * 60 * 1000);

// ══════════════════════════════════════════════════════════════════
// EXPRESS APP SETUP
// ══════════════════════════════════════════════════════════════════

const app = express();
app.disable('x-powered-by');
app.use(cors(CORS_CONFIG));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use('/api/ins', express.text({ type: '*/*', limit: '1mb' }));

// ══════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ══════════════════════════════════════════════════════════════════

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'INS Statistics Backend API',
    environment: NODE_ENV,
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'INS Statistics Backend API',
    environment: NODE_ENV,
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ══════════════════════════════════════════════════════════════════
// AUTHENTICATION ENDPOINTS
// ══════════════════════════════════════════════════════════════════

app.post('/auth/login', express.json(), (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });
    const user = UserDB.findUserByEmail(email);
    if (!user || !user.passwordHash) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ success: false, error: 'Account is inactive' });
    if (!UserDB.verifyPassword(password, user.passwordHash)) return res.status(401).json({ success: false, error: 'Invalid credentials' });
    UserDB.updateLastLogin(user.id);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ success: true, token, user: userWithoutPassword });
  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

app.post('/auth/register', express.json(), (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, error: 'Email and password required' });
    const existing = UserDB.findUserByEmail(email);
    if (existing) return res.status(409).json({ success: false, error: 'Email already registered' });
    const user = UserDB.createUser({
      email,
      name: name || email.split('@')[0],
      passwordHash: UserDB.hashPassword(password),
      provider: 'local',
      role: ROLES.VIEWER
    });
    const { passwordHash, ...userWithoutPassword } = user;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.status(201).json({ success: true, token, user: userWithoutPassword });
  } catch (err) {
    console.error('[Auth] Register error:', err.message);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

function handleOAuthCallback(req, res) {
  try {
    const user = req.user;
    if (!user || !user.isActive) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3080';
      return res.redirect(`${frontendUrl}/login?error=account_inactive`);
    }
    UserDB.updateLastLogin(user.id);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3080';
    res.redirect(`${frontendUrl}/dashboard?token=${token}`);
  } catch (err) {
    console.error('[Auth] OAuth callback error:', err.message);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3080';
    res.redirect(`${frontendUrl}/login?error=callback_failed`);
  }
}

function mockOAuthRedirect(providerName) {
  return (req, res) => {
    console.log(`[Auth] Credentials missing for ${providerName}. Using mock token.`);
    const mockEmail = `mock-${providerName}-user@ins.tn`;
    let user = UserDB.findUserByEmail(mockEmail);
    if (!user) {
      user = UserDB.createUser({
        email: mockEmail,
        name: `Mock ${providerName.charAt(0).toUpperCase() + providerName.slice(1)} User`,
        [`${providerName}Id`]: `mock-${providerName}-id`,
        provider: providerName,
        role: ROLES.VIEWER
      });
    } else {
      UserDB.updateLastLogin(user.id);
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3080';
    res.redirect(`${frontendUrl}/dashboard?token=${token}`);
  };
}

app.get('/auth/google', (req, res, next) => {
  if (GOOGLE_CONFIG.clientID && GOOGLE_CONFIG.clientSecret) {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  } else {
    mockOAuthRedirect('google')(req, res);
  }
});

app.get('/auth/google/callback', (req, res, next) => {
  if (GOOGLE_CONFIG.clientID && GOOGLE_CONFIG.clientSecret) {
    passport.authenticate('google', { failureRedirect: '/login?error=auth_failed', session: false })(req, res, next);
  } else {
    res.redirect('/login?error=config_missing');
  }
}, handleOAuthCallback);

app.get('/auth/facebook', (req, res, next) => {
  if (FACEBOOK_CONFIG.clientID && FACEBOOK_CONFIG.clientSecret) {
    passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
  } else {
    mockOAuthRedirect('facebook')(req, res);
  }
});

app.get('/auth/facebook/callback', (req, res, next) => {
  if (FACEBOOK_CONFIG.clientID && FACEBOOK_CONFIG.clientSecret) {
    passport.authenticate('facebook', { failureRedirect: '/login?error=auth_failed', session: false })(req, res, next);
  } else {
    res.redirect('/login?error=config_missing');
  }
}, handleOAuthCallback);

app.get('/auth/twitter', (req, res, next) => {
  if (TWITTER_CONFIG.consumerKey && TWITTER_CONFIG.consumerSecret) {
    passport.authenticate('twitter')(req, res, next);
  } else {
    mockOAuthRedirect('twitter')(req, res);
  }
});

app.get('/auth/twitter/callback', (req, res, next) => {
  if (TWITTER_CONFIG.consumerKey && TWITTER_CONFIG.consumerSecret) {
    passport.authenticate('twitter', { failureRedirect: '/login?error=auth_failed', session: false })(req, res, next);
  } else {
    res.redirect('/login?error=config_missing');
  }
}, handleOAuthCallback);

app.get('/auth/github', (req, res, next) => {
  if (GITHUB_CONFIG.clientID && GITHUB_CONFIG.clientSecret) {
    passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
  } else {
    mockOAuthRedirect('github')(req, res);
  }
});

app.get('/auth/github/callback', (req, res, next) => {
  if (GITHUB_CONFIG.clientID && GITHUB_CONFIG.clientSecret) {
    passport.authenticate('github', { failureRedirect: '/login?error=auth_failed', session: false })(req, res, next);
  } else {
    res.redirect('/login?error=config_missing');
  }
}, handleOAuthCallback);

app.post('/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ══════════════════════════════════════════════════════════════════
// XML/DATASETS ENDPOINTS
// ══════════════════════════════════════════════════════════════════

app.get('/api/datasets', (req, res) => {
  try {
    const data = parseMetadataXML();
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('[XML] Parse error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/datasets/:id', (req, res) => {
  try {
    const data = parseMetadataXML();
    const dataset = data.find((item) => item.id === req.params.id);
    if (!dataset) return res.status(404).json({ success: false, error: 'Dataset not found' });
    res.json({ success: true, data: dataset });
  } catch (err) {
    console.error('[XML] Dataset lookup error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════
// INS PROXY ENDPOINT
// ══════════════════════════════════════════════════════════════════

app.post('/api/ins', async (req, res) => {
  const lang = req.query.lang ?? 'fr';
  const insEndpoint = `http://dataportal.ins.tn/${lang}/api/getdata`;
  try {
    const insResponse = await fetch(insEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        Accept: 'text/xml, application/xml',
        Referer: 'http://dataportal.ins.tn/',
        'User-Agent': 'Mozilla/5.0 (compatible; INS-Client/1.0)'
      },
      body: req.body
    });
    const responseText = await insResponse.text();
    if (!insResponse.ok) {
      console.error(`[INS Proxy] ${insResponse.status} ${insResponse.statusText}`);
      return res.status(insResponse.status).send(responseText);
    }
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.send(responseText);
  } catch (err) {
    console.error('[INS Proxy] Network error:', err.message);
    res.status(502).json({ error: 'Proxy could not reach the INS server.', detail: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════
// GEOLOCATION ENDPOINT
// ══════════════════════════════════════════════════════════════════

app.get('/api/geo', async (req, res) => {
  const forwarded = req.headers['x-forwarded-for'];
  const rawIp = forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress;
  const ip = rawIp.replace(/^::ffff:/, '');
  
  if (PRIVATE_IP_RE.test(ip)) {
    return res.json({
      ip,
      country: 'Tunisia',
      countryCode: 'TN',
      city: 'Local',
      region: '',
      isp: 'localhost',
      lat: 36.8065,
      lon: 10.1815,
      timezone: 'Africa/Tunis',
      isLocal: true
    });
  }
  
  const cached = geoCache.get(ip);
  if (cached && (Date.now() - cached.timestamp < GEO_CACHE_TTL)) {
    return res.json(cached.data);
  }
  
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,regionName,isp,lat,lon,timezone`);
    const geoData = await geoRes.json();
    if (geoData.status !== 'success') throw new Error(`ip-api returned: ${geoData.status}`);
    const result = {
      ip,
      country: geoData.country,
      countryCode: geoData.countryCode,
      city: geoData.city,
      region: geoData.regionName || '',
      isp: geoData.isp || '',
      lat: geoData.lat,
      lon: geoData.lon,
      timezone: geoData.timezone,
      isLocal: false
    };
    geoCache.set(ip, { timestamp: Date.now(), data: result });
    res.json(result);
  } catch (err) {
    console.error('[GEO] Lookup failed:', err.message);
    res.json({
      ip,
      country: 'Unknown',
      countryCode: 'XX',
      city: 'Unknown',
      region: '',
      isp: '',
      lat: 0,
      lon: 0,
      timezone: 'UTC',
      isLocal: false
    });
  }
});

// ══════════════════════════════════════════════════════════════════
// AI ENDPOINT
// ══════════════════════════════════════════════════════════════════

app.post('/api/ai', express.json(), async (req, res) => {
  const { prompt, history, context } = req.body;
  const apiKey = process.env.HF_API_KEY;
  const model = 'Qwen/Qwen2.5-72B-Instruct';
  
  if (!apiKey) {
    return res.status(503).json({ error: 'AI Service Unavailable (API Key missing)' });
  }
  
  try {
    const messages = [
      {
        role: 'system',
        content: `You are the INS Statistics Assistant for Tunisia. Help the user analyze statistics about agriculture, tourism, industry, and more. Current context: ${JSON.stringify(context || {})}. Be concise.`
      },
      ...(Array.isArray(history) ? history.map((item) => ({
        role: item.role === 'assistant' ? 'assistant' : 'user',
        content: item.content
      })) : []),
      { role: 'user', content: prompt }
    ];
    
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: messages.map((item) => `${item.role}: ${item.content}`).join('\n'),
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch AI response');
    }
    
    const result = await response.json();
    const botText = Array.isArray(result) && result[0]?.generated_text
      ? result[0].generated_text.trim()
      : "I'm sorry, I couldn't process that.";
    
    res.json({ text: botText });
  } catch (err) {
    console.error('[AI] Error:', err.message);
    res.status(500).json({ error: 'AI unreachable' });
  }
});

// ══════════════════════════════════════════════════════════════════
// SETTINGS ENDPOINTS
// ══════════════════════════════════════════════════════════════════

app.get('/api/settings', (req, res) => {
  try {
    const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.json({ overrides: {}, config: {} });
  }
});

app.post('/api/settings', requireAdmin, (req, res) => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// ══════════════════════════════════════════════════════════════════
// PROFILE CRUD ROUTES
// ══════════════════════════════════════════════════════════════════
app.use('/', require('../routes/profile'));

// ══════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ══════════════════════════════════════════════════════════════════

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not Found', path: req.path });
});

app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// ══════════════════════════════════════════════════════════════════
// SERVER STARTUP
// ══════════════════════════════════════════════════════════════════

const server = app.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║       INS Statistics Backend API Server Started            ║
╠════════════════════════════════════════════════════════════╣
║ Environment: ${NODE_ENV.padEnd(49)}║
║ Host:        ${HOST.padEnd(49)}║
║ Port:        ${PORT.toString().padEnd(49)}║
║ URL:         http://${HOST}:${PORT}${'/'.padEnd(39 - PORT.toString().length)}║
╠════════════════════════════════════════════════════════════╣
║ Health Check:    /api/health                               ║
║ Datasets API:    /api/datasets                             ║
║ Auth Endpoints:  /auth/{google|facebook|twitter|github}    ║
║ Settings API:    /api/settings (admin only)                ║
╚════════════════════════════════════════════════════════════╝
  `);
});

process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, gracefully shutting down...');
  server.close(() => {
    console.log('[Server] Closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received, gracefully shutting down...');
  server.close(() => {
    console.log('[Server] Closed');
    process.exit(0);
  });
});

module.exports = app;
