# API Backend - Code Reference Guide

## 📦 api/package.json (Production Dependencies Only)

```json
{
  "name": "ins-statistiques-api",
  "version": "1.0.0",
  "description": "Isolated backend API for INS Statistics portal - Pure Node.js/Express with ZERO browser dependencies",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=16"
  },
  "keywords": [
    "express",
    "oauth2",
    "jwt",
    "statistics",
    "api",
    "backend"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.6",
    "dotenv": "^16.6.1",
    "express": "^5.2.1",
    "fast-xml-parser": "^5.9.3",
    "jsonwebtoken": "^9.0.3",
    "node-fetch": "^2.7.0",
    "passport": "^0.7.0",
    "passport-facebook": "^3.0.0",
    "passport-github2": "^0.1.12",
    "passport-google-oauth20": "^2.0.0",
    "passport-oauth": "^1.0.0",
    "passport-twitter": "^0.1.5",
    "uuid": "^14.0.1"
  }
}
```

---

## 🖥️ api/server.js (848 Lines - Complete Isolated Backend)

### Key Features Implemented

```javascript
/*
FEATURES IN api/server.js:
═══════════════════════════════════════════════════════════════

1. ENVIRONMENT & CONFIGURATION (lines 1-85)
   ✓ dotenv for environment variables
   ✓ PORT, HOST, NODE_ENV configuration
   ✓ JWT secret & expiry settings
   ✓ OAuth2 config for Google, Facebook, Twitter, GitHub
   ✓ CORS configuration
   ✓ File paths for data storage

2. IN-MEMORY USER DATABASE (lines 87-165)
   ✓ User creation & retrieval
   ✓ Password hashing (bcrypt)
   ✓ JSON file persistence
   ✓ Last login tracking

3. PASSPORT OAUTH2 STRATEGIES (lines 167-301)
   ✓ Google OAuth2 strategy
   ✓ Facebook OAuth2 strategy
   ✓ Twitter/X OAuth2 (OAuth 1.0a)
   ✓ GitHub OAuth2 strategy
   ✓ Mock user fallback (for missing credentials)
   ✓ User serialization/deserialization

4. AUTHENTICATION MIDDLEWARE (lines 303-324)
   ✓ JWT verification middleware
   ✓ Admin role requirement
   ✓ Editor role requirement

5. XML METADATA PARSER (lines 326-359)
   ✓ Parses INS SDMX XML file
   ✓ Extracts datasets, dimensions, periods
   ✓ Returns clean JSON structure

6. GEOLOCATION CACHING (lines 361-380)
   ✓ IP-based geolocation lookup
   ✓ Private IP detection
   ✓ 24-hour cache with auto-cleanup
   ✓ Graceful fallback to ip-api.com

7. EXPRESS APP SETUP (lines 382-396)
   ✓ JSON/URL parsing middleware
   ✓ CORS enabled
   ✓ Passport initialization
   ✓ Cookie parsing

8. HEALTH CHECK ENDPOINT (lines 398-408)
   ✓ GET /api/health
   ✓ Returns service status and metadata

9. AUTHENTICATION ENDPOINTS (lines 410-517)
   ✓ POST /auth/register - Email/password registration
   ✓ POST /auth/login - Email/password login
   ✓ GET /auth/google - Google OAuth flow
   ✓ GET /auth/facebook - Facebook OAuth flow
   ✓ GET /auth/twitter - Twitter OAuth flow
   ✓ GET /auth/github - GitHub OAuth flow
   ✓ POST /auth/logout - Logout (stateless)

10. DATASET ENDPOINTS (lines 519-546)
    ✓ GET /api/datasets - All datasets from XML
    ✓ GET /api/datasets/:id - Single dataset lookup

11. INS PROXY ENDPOINT (lines 548-575)
    ✓ POST /api/ins - Proxy requests to INS server
    ✓ Language support (fr, ar, en)
    ✓ Error handling & logging

12. GEOLOCATION ENDPOINT (lines 577-625)
    ✓ GET /api/geo - Detect client location from IP
    ✓ Smart caching to reduce external API calls
    ✓ Private IP special handling

13. AI ASSISTANT ENDPOINT (lines 627-680)
    ✓ POST /api/ai - Chat with Hugging Face Qwen model
    ✓ Supports conversation history
    ✓ Context-aware responses
    ✓ Graceful degradation if API key missing

14. SETTINGS MANAGEMENT (lines 682-702)
    ✓ GET /api/settings - Retrieve app settings
    ✓ POST /api/settings - Update settings (admin only)

15. ERROR HANDLING (lines 704-714)
    ✓ 404 handler for unknown routes
    ✓ Global error handler with logging

16. SERVER STARTUP (lines 716-848)
    ✓ Listen on PORT/HOST
    ✓ Pretty console output with service info
    ✓ SIGTERM graceful shutdown
    ✓ SIGINT graceful shutdown

═══════════════════════════════════════════════════════════════
NO BROWSER DEPENDENCIES:
✗ No window object references
✗ No document/DOM access
✗ No Chart.js or chart libraries
✗ No React/Vue/Angular
✗ No CSS-in-JS frameworks
✗ No build tool dependencies

PURE NODE.JS BACKEND:
✓ Only Express.js and related packages
✓ File system operations (fs, path)
✓ HTTP requests (node-fetch)
✓ Cryptography (bcryptjs)
✓ Data validation & parsing (fast-xml-parser)
═══════════════════════════════════════════════════════════════
*/
```

### Code Structure Highlights

```javascript
// ═══════════════════════════════════════════════════════════════
// ENVIRONMENT & CONFIGURATION
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// NO BROWSER CODE HERE - only Node.js modules
// NO import statements for React, Chart.js, or UI libraries


// ═══════════════════════════════════════════════════════════════
// USER DATABASE (in-memory + file persistence)
// ═══════════════════════════════════════════════════════════════

let usersDb = [];

const UserDB = {
  findUserById(id) { /* ... */ },
  findUserByEmail(email) { /* ... */ },
  createUser(userData) { /* ... */ },
  updateUser(id, updates) { /* ... */ },
  verifyPassword(plaintext, hash) { /* ... */ },
  hashPassword(plaintext) { /* ... */ }
};


// ═══════════════════════════════════════════════════════════════
// PASSPORT OAUTH2 STRATEGIES
// ═══════════════════════════════════════════════════════════════

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

// Each strategy configured with environment variables
if (GOOGLE_CONFIG.clientID && GOOGLE_CONFIG.clientSecret) {
  passport.use(new GoogleStrategy(
    GOOGLE_CONFIG,
    (accessToken, refreshToken, profile, done) => {
      // Create/update user in database
      // Return user object
    }
  ));
}
// ... Facebook, Twitter, GitHub follow same pattern


// ═══════════════════════════════════════════════════════════════
// AUTHENTICATION ENDPOINTS
// ═══════════════════════════════════════════════════════════════

app.post('/auth/register', express.json(), (req, res) => {
  const { email, password, name } = req.body;
  const user = UserDB.createUser({ email, passwordHash, name });
  const token = jwt.sign({ id: user.id, email, role }, JWT_SECRET);
  res.json({ success: true, token, user });
});

app.post('/auth/login', express.json(), (req, res) => {
  const { email, password } = req.body;
  const user = UserDB.findUserByEmail(email);
  if (!UserDB.verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email, role }, JWT_SECRET);
  res.json({ success: true, token, user });
});

app.get('/auth/google', (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// ... /auth/facebook, /auth/twitter, /auth/github follow same pattern


// ═══════════════════════════════════════════════════════════════
// XML PARSING - NO BROWSER DEPENDENCIES
// ═══════════════════════════════════════════════════════════════

function parseMetadataXML() {
  const xmlData = fs.readFileSync(XML_FILE_PATH, 'utf8');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_'
  });
  const parsed = parser.parse(xmlData);
  // Return clean JSON datasets array
}

app.get('/api/datasets', (req, res) => {
  const data = parseMetadataXML();
  res.json({ success: true, data });
});


// ═══════════════════════════════════════════════════════════════
// GEOLOCATION WITH CACHING
// ═══════════════════════════════════════════════════════════════

const geoCache = new Map();

app.get('/api/geo', async (req, res) => {
  const ip = req.socket.remoteAddress;
  
  // Check cache first
  if (geoCache.has(ip)) {
    return res.json(geoCache.get(ip).data);
  }
  
  // Fetch from ip-api.com if not cached
  const geoRes = await fetch(`http://ip-api.com/json/${ip}...`);
  const geoData = await geoRes.json();
  
  // Cache result
  geoCache.set(ip, { timestamp: Date.now(), data: geoData });
  res.json(geoData);
});


// ═══════════════════════════════════════════════════════════════
// AI INTEGRATION
// ═══════════════════════════════════════════════════════════════

app.post('/api/ai', express.json(), async (req, res) => {
  const { prompt, history, context } = req.body;
  const apiKey = process.env.HF_API_KEY;
  
  if (!apiKey) {
    return res.status(503).json({ error: 'AI Service Unavailable' });
  }
  
  const response = await fetch('https://api-inference.huggingface.co/models/Qwen/Qwen2.5-72B-Instruct', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: [...] // messages formatted for model
    })
  });
  
  const result = await response.json();
  res.json({ text: result[0].generated_text });
});


// ═══════════════════════════════════════════════════════════════
// SERVER STARTUP
// ═══════════════════════════════════════════════════════════════

const server = app.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║       INS Statistics Backend API Server Started            ║
╠════════════════════════════════════════════════════════════╣
║ Environment: production
║ Host:        0.0.0.0
║ Port:        4000
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
```

---

## 🔧 Setup Instructions

### 1. **Install Dependencies**

```bash
cd api
npm install
```

### 2. **Create Environment File**

```bash
cd api
cp .env.example .env.local
# Edit .env.local with your values
```

### 3. **Run Locally**

```bash
cd api
npm start

# Expected output:
# ╔════════════════════════════════════════════════════════════╗
# ║       INS Statistics Backend API Server Started            ║
# ╠════════════════════════════════════════════════════════════╣
# ║ Environment: development
# ║ Host:        0.0.0.0
# ║ Port:        4000
# ╚════════════════════════════════════════════════════════════╝
```

### 4. **Test Health Endpoint**

```bash
curl http://localhost:4000/api/health

# Response:
# {
#   "status": "ok",
#   "service": "INS Statistics Backend API",
#   "environment": "development",
#   "version": "1.0.0",
#   "timestamp": "2026-07-04T12:34:56.789Z"
# }
```

---

## 📋 Endpoints Cheat Sheet

```bash
# Health
curl http://localhost:4000/api/health

# Auth - Register
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123","name":"John"}'

# Auth - Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Datasets - All
curl http://localhost:4000/api/datasets

# Datasets - Single
curl http://localhost:4000/api/datasets/DATASET_ID

# Geolocation
curl http://localhost:4000/api/geo

# AI Assistant
curl -X POST http://localhost:4000/api/ai \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Tell me about Tunisia agriculture"}'

# Settings (authenticated)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:4000/api/settings
```

---

## ✅ Verification Checklist

```bash
# 1. Check no browser dependencies
cd api && npm ls 2>&1 | grep -iE "react|chart|vue|angular|webpack|vite" || echo "✅ Clean!"

# 2. Verify server starts
npm start &
sleep 2
curl http://localhost:4000/api/health && echo "✅ API Running"

# 3. Check for Window/Document references
grep -r "window\|document\|chrome\|navigator" api/server.js || echo "✅ No browser APIs"

# 4. Verify file structure
ls -la api/
# Should show: server.js, package.json, .env.example

# 5. Test with frontend
# Update WebApp to call: http://localhost:4000 (or https://your-api.onrender.com in production)
```

---

## 🚀 Render Deployment

### Build Command

```bash
cd api && npm install
```

### Start Command

```bash
cd api && npm start
```

### Environment Variables in Render

- `PORT=4000`
- `NODE_ENV=production`
- `JWT_SECRET=<strong-random-string>`
- `CORS_ORIGIN=https://your-frontend.onrender.com`
- All OAuth credentials
- `HF_API_KEY=<hugging-face-key>`
- `FRONTEND_URL=https://your-frontend.onrender.com`

### Deployed URL

`https://your-service-name.onrender.com`

---

## 📊 Database Schema

### User Object

```javascript
{
  id: "uuid-string",
  email: "user@example.com",
  name: "User Name",
  passwordHash: "$2a$10...", // bcrypt hash
  provider: "google|facebook|twitter|github|local",
  googleId: "...",           // OAuth provider IDs
  facebookId: "...",
  twitterId: "...",
  githubId: "...",
  profilePicture: "https://...",
  role: "admin|editor|viewer",
  isActive: true,
  createdAt: "2026-07-04T12:34:56.789Z",
  lastLogin: "2026-07-04T15:30:00.000Z"
}
```

### Settings Object

```javascript
{
  overrides: {
    theme: "dark|light",
    language: "fr|ar|en",
    dataRefreshInterval: 3600000
  },
  config: {
    enableAI: true,
    enableGeo: true,
    cacheTTL: 86400000
  }
}
```

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: 2026-07-04
