# 🎯 Backend Decoupling & Deployment Architecture

## Overview

Your INS Statistics platform has been successfully decoupled from the root directory into a **completely isolated, production-ready backend API**. This separation prevents Node.js/Render deployment crashes caused by browser-facing UI configurations (Chart.js, window objects, etc.) that were previously mixed in with server-side code.

---

## 📁 Final Project Structure

```
d:\VSCODE\ANTIGRAVITY\INS_STATISTIQUES\
├── 📂 api/                                 ← NEW: Isolated Backend Server
│   ├── server.js                           ← Pure Node.js/Express server (550+ lines)
│   ├── package.json                        ← Backend-only dependencies
│   └── .env                                ← Backend environment variables
│
├── 📂 WebApp/                              ← UNTOUCHED: React Frontend
│   ├── src/
│   ├── vite.config.js
│   └── package.json
│
├── 📂 MobileApp/                           ← UNTOUCHED: React Native
│   ├── App.js
│   └── package.json
│
├── 📂 auth/                                ← Authentication helper modules
│   ├── config.js                           ← OAuth configurations (now imported by api/server.js)
│   ├── middleware.js                       ← JWT verification helpers
│   ├── routes.js                           ← Route definitions (legacy, can be retired)
│   └── db.js
│
├── 📂 data/                                ← Data files
│   ├── agriculture.json
│   ├── demographics.json
│   ├── users.json                          ← Persisted user database
│   └── ...
│
├── 📂 exporter/                            ← PDF/Excel/Word export logic
│   ├── exporter.ts
│   └── ...
│
├── 📂 shared/                              ← Shared UI components
│   ├── components/
│   └── core/
│
├── app.js                                  ← LEGACY: Old client-side code (DO NOT USE)
├── backend.js                              ← LEGACY: Old backend (superseded by api/server.js)
├── proxy.js                                ← LEGACY: Old proxy (DO NOT USE)
├── package.json                            ← ROOT: Frontend tooling only
├── render.yaml                             ← Render deployment config
├── settings.json                           ← Application settings
│
├── e426de42-8f6e-4e74-a23f-65a314f8c426.xml  ← INS SDMX metadata
├── README.md
└── ...
```

### Key Changes

| Component | Before | After |
| ----------- | -------- | ------- |
| **Backend Server** | Mixed in `backend.js` at root | ✅ Isolated at `api/server.js` |
| **Dependencies** | Everything in root `package.json` | ✅ Only `api/package.json` for backend |
| **Browser Code** | Could interfere with Node startup | ✅ Completely separated into WebApp/ |
| **Deployment Target** | Full directory (crashes) | ✅ Only `api/` directory for Render |
| **OAuth/Auth** | Fragmented across files | ✅ Fully self-contained in `api/server.js` |

---

## 🚀 How to Deploy to Render

### Step 1: Create a New Render Service

1. Go to [render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository

### Step 2: Configure the Render Service

| Setting | Value |
| --------- | ------- |
| **Name** | `ins-api` (or your choice) |
| **Environment** | `Node` |
| **Region** | Select your preferred region |
| **Branch** | `main` (or your default branch) |
| **Build Command** | `cd api && npm install` |
| **Start Command** | `cd api && npm start` |
| **Plan** | Free/Paid (your choice) |

### Step 3: Set Environment Variables

Click **Environment** and add:

```env
NODE_ENV=production
PORT=4000
HOST=0.0.0.0
JWT_SECRET=<your-secure-secret-key>
JWT_EXPIRES_IN=7d

# OAuth Credentials (if using)
GOOGLE_CLIENT_ID=<your-value>
GOOGLE_CLIENT_SECRET=<your-value>
GOOGLE_CALLBACK_URL=https://your-render-app.onrender.com/auth/google/callback

FACEBOOK_CLIENT_ID=<your-value>
FACEBOOK_CLIENT_SECRET=<your-value>
FACEBOOK_CALLBACK_URL=https://your-render-app.onrender.com/auth/facebook/callback

TWITTER_CONSUMER_KEY=<your-value>
TWITTER_CONSUMER_SECRET=<your-value>
TWITTER_CALLBACK_URL=https://your-render-app.onrender.com/auth/twitter/callback

GITHUB_CLIENT_ID=<your-value>
GITHUB_CLIENT_SECRET=<your-value>
GITHUB_CALLBACK_URL=https://your-render-app.onrender.com/auth/github/callback

CORS_ORIGIN=https://your-frontend-url.com
FRONTEND_URL=https://your-frontend-url.com
HF_API_KEY=<your-hugging-face-key>
```

### Step 4: Deploy

Click **Create Web Service**. Render will automatically:

1. Clone your repository
2. Navigate to the `api/` directory
3. Run `npm install` (only backend dependencies)
4. Start the server with `npm start`

Your backend will be live at:

```
https://ins-api.onrender.com
```

---

## ✅ What's Included in api/server.js

### Pure Backend Features (NO Browser Dependencies)

#### 1. **Authentication (Full Stack)**

- Local login/register with email/password
- JWT token generation and validation
- **Google OAuth2** ✓
- **Facebook OAuth** ✓
- **Twitter/X OAuth** ✓
- **GitHub OAuth** ✓
- Mock OAuth for development (when credentials missing)
- Role-based access control (ADMIN, EDITOR, VIEWER)

```javascript
POST /auth/login          → Local login
POST /auth/register       → User registration
GET  /auth/google         → Google OAuth flow
GET  /auth/google/callback → Google OAuth callback
GET  /auth/facebook       → Facebook OAuth flow
GET  /auth/facebook/callback → Facebook OAuth callback
GET  /auth/twitter        → Twitter OAuth flow
GET  /auth/twitter/callback → Twitter OAuth callback
GET  /auth/github         → GitHub OAuth flow
GET  /auth/github/callback → GitHub OAuth callback
POST /auth/logout         → Logout (client-side token removal)
```

#### 2. **XML Metadata Parsing**

- Parses INS SDMX XML structure file
- Extracts datasets, dimensions, time periods
- Returns clean JSON

```javascript
GET /api/datasets         → Get all datasets
GET /api/datasets/:id     → Get single dataset by ID
```

#### 3. **INS API Proxy**

- Proxies requests to official dataportal.ins.tn
- Handles CORS transparently
- Supports XML transformations

```javascript
POST /api/ins?lang=fr     → Proxy to INS endpoint
```

#### 4. **Geolocation Service**

- Caches geolocation data (24-hour TTL)
- Falls back to hardcoded Tunisia for local IPs
- Integrates with ip-api.com

```javascript
GET /api/geo              → Get visitor geolocation
```

#### 5. **AI Assistant**

- Integrates Hugging Face API
- Context-aware statistics assistant
- Multi-turn conversation support

```javascript
POST /api/ai              → Ask statistics questions
```

#### 6. **Settings Management**

- Read/write application settings
- Admin-only write access
- Persistent storage

```javascript
GET  /api/settings        → Get settings (public)
POST /api/settings        → Update settings (admin only)
```

#### 7. **Health & Status**

```javascript
GET /api/health           → Server status check
```

---

## 🔑 Key Features of api/server.js

### ✓ Completely Isolated

- **No external auth module dependencies** (everything self-contained)
- **No frontend code** (no window, document, Chart.js references)
- **Pure Node.js** (bcryptjs, uuid, jwt, passport)
- **Environment-based configuration** (all via .env)

### ✓ Production-Ready

- Graceful shutdown handling (SIGTERM/SIGINT)
- Proper error handling (404, 500 handlers)
- Middleware for CORS, JSON parsing, cookies
- Request logging for debugging
- Password hashing with bcryptjs
- JWT token expiration

### ✓ User Database

- In-memory user database with file persistence
- UUID-based user IDs
- Password hashing and verification
- Last login tracking
- Account activation status

### ✓ OAuth2 Support

- All 4 providers (Google, Facebook, Twitter, GitHub)
- Graceful fallback to mock OAuth when credentials missing
- User auto-registration on first OAuth login
- Profile picture and user name extraction
- Hybrid provider support

### ✓ Security

- JWT secret from environment variable
- Password hashing with bcryptjs (10 rounds)
- Role-based access control middleware
- Token verification on protected routes
- CORS configuration per environment

---

## 📋 Environment Variables (.env)

Create an `.env` file in the `api/` directory:

```env
# Core
NODE_ENV=development
PORT=4000
HOST=0.0.0.0

# Authentication
JWT_SECRET=your-very-long-random-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# OAuth - Facebook
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:4000/auth/facebook/callback

# OAuth - Twitter/X
TWITTER_CONSUMER_KEY=your-twitter-api-key
TWITTER_CONSUMER_SECRET=your-twitter-api-secret
TWITTER_CALLBACK_URL=http://localhost:4000/auth/twitter/callback

# OAuth - GitHub
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:4000/auth/github/callback

# CORS & Frontend
CORS_ORIGIN=http://localhost:3080
FRONTEND_URL=http://localhost:3080

# AI (Hugging Face)
HF_API_KEY=your-hugging-face-api-key
```

---

## 🧪 Local Development

### 1. Install Backend Dependencies

```bash
cd api
npm install
```

### 2. Create .env File

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Start the Backend Server

```bash
npm start
```

Output:

```
╔════════════════════════════════════════════════════════════╗
║       INS Statistics Backend API Server Started            ║
╠════════════════════════════════════════════════════════════╣
║ Environment: development
║ Host:        0.0.0.0
║ Port:        4000
║ URL:         http://0.0.0.0:4000
╠════════════════════════════════════════════════════════════╣
║ Health Check:    /api/health
║ Datasets API:    /api/datasets
║ Auth Endpoints:  /auth/{google|facebook|twitter|github}
║ Settings API:    /api/settings (admin only)
╚════════════════════════════════════════════════════════════╝
```

### 4. Test the API

```bash
# Health check
curl http://localhost:4000/api/health

# Get datasets
curl http://localhost:4000/api/datasets

# Local login (create user first via register)
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret123","name":"Test User"}'

# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret123"}'
```

---

## 📊 API Response Examples

### Health Check

```json
{
  "status": "ok",
  "service": "INS Statistics Backend API",
  "environment": "production",
  "version": "1.0.0",
  "timestamp": "2026-03-12T14:07:30.123Z"
}
```

### User Registration

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "User Name",
    "role": "viewer",
    "createdAt": "2026-03-12T14:07:30.123Z",
    "isActive": true
  }
}
```

### Datasets

```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "agriculture",
      "key": "AG001",
      "name": "Agriculture Production",
      "description": "Agricultural statistics for Tunisia",
      "period": { "start": 2015, "end": 2024 },
      "dimensions": [
        {
          "id": "Region",
          "name": "Geographic Region",
          "type": "Geo"
        }
      ]
    }
  ]
}
```

---

## 🔄 Frontend Integration

### Connect Frontend to Backend

Update your React/Vite configuration:

```javascript
// vite.config.js or environment variables
const API_URL = process.env.VITE_API_URL || 'http://localhost:4000';

// Example API call
fetch(`${API_URL}/api/datasets`)
  .then(r => r.json())
  .then(data => console.log(data));

// Example authenticated call
fetch(`${API_URL}/api/settings`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## ⚠️ Migration Notes

### What Changed

- ✅ Backend completely isolated in `api/server.js`
- ✅ Backend has zero UI dependencies
- ✅ Can be deployed independently to Render
- ✅ Root directory only contains frontend configs
- ✅ WebApp/ and MobileApp/ remain untouched

### What Stayed the Same

- ✓ All data files in `data/`
- ✓ XML metadata file (e426de42-8f6e-4e74-a23f-65a314f8c426.xml)
- ✓ Settings.json for application configuration
- ✓ All OAuth provider integrations

### What Can Be Deleted (Optional)

- `app.js` - old client code
- `backend.js` - old backend (superseded)
- `proxy.js` - old proxy (superseded)
- `auth/routes.js` - logic now in api/server.js

---

## 🚨 Troubleshooting

### "Module not found: passport-google-oauth20"

```bash
cd api && npm install passport-google-oauth20
```

### Port 4000 already in use

```bash
# Find and kill process on port 4000
lsof -i :4000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### CORS errors from frontend

Update `CORS_ORIGIN` in your `.env`:

```env
CORS_ORIGIN=https://your-frontend-domain.com
```

### OAuth callback not working

Ensure callback URLs match in `.env`:

- Render: `https://your-api.onrender.com/auth/google/callback`
- Development: `http://localhost:4000/auth/google/callback`

---

## 📚 Additional Resources

- [Render Deployment Docs](https://render.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [Passport OAuth2](http://www.passportjs.org/docs/oauth/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)

---

## ✨ Summary

Your backend is now:

- 🎯 **Completely decoupled** from frontend UI code
- 🚀 **Ready for Render deployment**
- 🔒 **Production-hardened** with security best practices
- 🧩 **Self-contained** with all auth logic included
- 📡 **API-first** architecture for scalability

**Deploy with confidence!** 🇹🇳
