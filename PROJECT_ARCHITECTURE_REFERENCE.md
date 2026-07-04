# Project Structure & Architecture Reference

## Final Directory Tree

```
INS_STATISTIQUES/  (Project Root)
│
├── 📁 api/  ⭐ ISOLATED BACKEND SERVER (NEW)
│   ├── server.js                  # 848 lines - Pure Express.js server
│   │   ├── Health checks
│   │   ├── Auth endpoints (OAuth2 + JWT)
│   │   ├── XML parsing & datasets API
│   │   ├── Geolocation proxy with caching
│   │   ├── AI integration (Hugging Face)
│   │   ├── Settings management
│   │   ├── INS data proxy
│   │   └── Error handling & graceful shutdown
│   │
│   ├── package.json               # Backend-only dependencies
│   │   ├── express ^5.2.1
│   │   ├── cors ^2.8.6
│   │   ├── passport ^0.7.0
│   │   ├── jsonwebtoken ^9.0.3
│   │   ├── fast-xml-parser ^5.9.3
│   │   └── ...11 other backend libs
│   │
│   ├── .env.example               # Template (copy to .env.local)
│   └── .env.local                 # ⚠️ NOT in git (create locally)
│
├── 📁 WebApp/  ⭐ UNTOUCHED FRONTEND
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.tsx
│   │   ├── style.css
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DataExplorer.jsx
│   │   │   ├── ExportPanel.jsx
│   │   │   └── ... (all UI components)
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── StatsPage.jsx
│   │   │   └── ...
│   │   ├── auth/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── styles/
│   │       └── chart-defaults.js  # ⭐ Chart.js stays here!
│   │
│   ├── package.json               # Frontend-only dependencies
│   │   ├── react
│   │   ├── vite
│   │   ├── typescript
│   │   ├── react-router-dom
│   │   └── chart.js (and similar)
│   │
│   ├── vite.config.js
│   ├── tsconfig.json
│   ├── index.html
│   └── public/
│
├── 📁 data/  (Shared Data Layer - accessed by API)
│   ├── users.json                 # User database (created by API)
│   ├── agriculture.json           # INS datasets
│   ├── demographics.json
│   ├── industry.json
│   ├── tourism.json
│   ├── trade.json
│   └── traditional.json
│
├── 📁 auth/  (Legacy - can be deprecated)
│   ├── config.js
│   ├── db.js
│   ├── middleware.js
│   └── routes.js
│   ⚠️ Note: Logic consolidated into api/server.js
│
├── 📁 shared/  (Legacy utilities)
│   ├── components/
│   │   ├── DatasetList.jsx
│   │   ├── ExportPanel.jsx
│   │   └── StatsCard.jsx
│   └── core/
│       ├── exporter.js
│       └── theme.js
│
├── 📁 exporter/  (TypeScript export utilities)
│   ├── exporter.ts
│   ├── exportExcel.ts
│   ├── exportJSON.ts
│   ├── exportPDF.ts
│   ├── exportPowerPoint.ts
│   ├── exportUtils.ts
│   ├── exportWord.ts
│   └── types.ts
│
├── 📁 MobileApp/  (React Native)
│   ├── App.js
│   ├── package.json
│   ├── api/
│   │   └── client.js              # Makes calls to api/server.js
│   ├── components/
│   ├── screens/
│   ├── macos/
│   └── windows/
│
├── 📄 e426de42-8f6e-4e74-a23f-65a314f8c426.xml
│   └─ INS SDMX metadata file (read by api/server.js)
│
├── 📄 settings.json               # Configuration (written by api/server.js)
├── 📄 package.json                # Root package.json (workspaces)
├── 📄 README.md
├── 📄 DEPLOYMENT_GUIDE.md
├── 📄 BACKEND_MIGRATION_COMPLETE.md  ⭐ (This project structure)
├── 📄 BACKEND_INTEGRATION_GUIDE.md
├── 📄 render.yaml
└── ... (other root level files)
```

---

## Dependency Separation Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         Your Application                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────┐       ┌──────────────────────────┐ │
│  │  FRONTEND (WebApp/)     │       │  BACKEND (api/)          │ │
│  │  React + Vite           │       │  Express.js              │ │
│  │  Port: 3080             │       │  Port: 4000              │ │
│  ├─────────────────────────┤       ├──────────────────────────┤ │
│  │ Dependencies:           │       │ Dependencies:            │ │
│  │ ✓ react                 │       │ ✓ express               │ │
│  │ ✓ typescript            │       │ ✓ passport              │ │
│  │ ✓ vite                  │       │ ✓ jsonwebtoken          │ │
│  │ ✓ react-router-dom      │       │ ✓ cors                  │ │
│  │ ✓ chart.js              │       │ ✓ dotenv                │ │
│  │ ✓ @tanstack/react-query │       │ ✓ fast-xml-parser      │ │
│  │ ✓ ... UI libs           │       │ ✓ bcryptjs              │ │
│  │                         │       │ ✓ node-fetch            │ │
│  │ NO SERVER CODE          │       │ ✓ uuid                  │ │
│  │ NO NODE MODULES LIKE:   │       │                         │ │
│  │   ✗ express             │       │ NO BROWSER CODE LIKE:   │ │
│  │   ✗ dotenv              │       │   ✗ react              │ │
│  │   ✗ passport            │       │   ✗ chart.js           │ │
│  │   ✗ node-fetch          │       │   ✗ vite               │ │
│  │                         │       │   ✗ @tanstack/...      │ │
│  │ Environment:            │       │   ✗ browser window/doc │ │
│  │ NODE_ENV=development    │       │                         │ │
│  │ VITE_API_BASE_URL=...   │       │ Environment:            │ │
│  │                         │       │ NODE_ENV=production     │ │
│  │ Browser: ✓              │       │ PORT, JWT_SECRET        │ │
│  │ Node.js: ✗              │       │ OAuth credentials       │ │
│  └─────────────────────────┘       │ HF_API_KEY              │ │
│           │                        │                         │ │
│           │ HTTP/REST Calls        │ Browser: ✗              │ │
│           │ GET /api/datasets      │ Node.js: ✓              │ │
│           │ POST /auth/login       │                         │ │
│           │ GET /api/geo           │                         │ │
│           │ POST /api/ai           │                         │ │
│           └──────────────────────┬─┘                         │ │
│                                  │                         │ │
│  ┌────────────────────────────────────────────────────────┐ │ │
│  │         SHARED DATA LAYER (root level)                 │ │ │
│  ├────────────────────────────────────────────────────────┤ │ │
│  │ • data/*.json (datasets)                               │ │ │
│  │ • e426de42-8f6e-4e74-a23f-65a314f8c426.xml (SDMX)     │ │ │
│  │ • settings.json (config)                               │ │ │
│  │ Read/written by: api/server.js                         │ │ │
│  │ Accessed by: Frontend via API calls                    │ │ │
│  └────────────────────────────────────────────────────────┘ │ │
│                                                              │ │
└──────────────────────────────────────────────────────────────┘
```

---

## Network Architecture (Render Deployment)

```
                        INTERNET
                           │
         ┌─────────────────┼──────────────────┐
         │                 │                  │
         ▼                 ▼                  ▼
    
    User's Browser    OAuth Providers    IP-API.com
    (React App)    (Google, FB, X, GH)   (Geolocation)
         │                 │                  │
         │ (HTTPS)         │ (HTTPS)          │ (HTTPS)
         │                 │                  │
         ▼                 ▼                  ▼
    
    ┌─────────────────────────────────────────────────────┐
    │         RENDER.COM - YOUR DEPLOYMENT                │
    │  ┌───────────────────────────────────────────────┐  │
    │  │  Frontend Service (WebApp)                    │  │
    │  │  https://ins-web.onrender.com                 │  │
    │  │  • React/Vite SPA                             │  │
    │  │  • Static assets                              │  │
    │  │  • Makes HTTP calls to backend                │  │
    │  └───────────────────────────────────────────────┘  │
    │           │                                          │
    │           │ API Calls (CORS enabled)                │
    │           │ /api/datasets                           │
    │           │ /auth/login                             │
    │           │ /auth/google                            │
    │           │ /api/ai                                 │
    │           ▼                                          │
    │  ┌───────────────────────────────────────────────┐  │
    │  │  Backend Service (api)                        │  │
    │  │  https://ins-api.onrender.com                 │  │
    │  │  • Express.js HTTP server                     │  │
    │  │ • Passport OAuth handling                     │  │
    │  │  • JWT token management                       │  │
    │  │  • XML parsing                                │  │
    │  │  • Data queries                               │  │
    │  │  • AI integration                             │  │
    │  │                                               │  │
    │  │  Environment:                                 │  │
    │  │  PORT=4000 (Render assigns)                   │  │
    │  │  NODE_ENV=production                          │  │
    │  │  JWT_SECRET=<generated>                       │  │
    │  │  CORS_ORIGIN=https://ins-web.onrender.com    │  │
    │  │  OAuth credentials                            │  │
    │  └───────────────────────────────────────────────┘  │
    │           │                                          │
    │           │ File System Access                       │
    │           │ /data/users.json                         │
    │           │ /settings.json                           │
    │           │ /e426de42-8f6e-4e74-a23f-65a314f8c426   │
    │           │ /.xml                                    │
    │           ▼                                          │
    │  ┌───────────────────────────────────────────────┐  │
    │  │  Persistent Storage (Render Disk)             │  │
    │  │  • data/users.json                            │  │
    │  │  • settings.json                              │  │
    │  │  • e426de42-8f6e-4e74-a23f-65a314f8c426.xml  │  │
    │  └───────────────────────────────────────────────┘  │
    │                                                      │
    └──────────────────────────────────────────────────────┘
                           ▲
                           │
              GitHub (for git deployment)
```

---

## API Call Flow Examples

### Authentication Flow

```
Browser                          Backend (api/)              OAuth Provider
   │                                  │                           │
   ├─ Click "Login with Google" ──►  GET /auth/google  ──────────┤
   │                                  │◄──── Redirect to OAuth     │
   │◄─────────────────────────────────│                           │
   │                                                              │
   ├──── [User logs in at Google] ────────────────────────────────┤
   │                                                              │
   │◄─────────────────────────────── Redirect to /auth/google/callback
   │                                                     │        │
   │                    Backend validates & creates JWT │        │
   │◄─────────────────────────────────────────────────────────────┤
   │                                                              │
   ├─ Stores JWT in localStorage                                │
   │                                                             │
   ├─ All future requests include:                             │
   │  Authorization: Bearer eyJhbGc...                          │
```

### Data Fetching Flow

```
Frontend (WebApp)         Backend (api/)           Data Sources
   │                          │                         │
   ├─ GET /api/datasets ─────►│                         │
   │                          ├─ Read & parse ─────────►│
   │                          │  e426de42-...xml        │
   │                          │◄─ Datasets array ───────┤
   │                          │                         │
   │◄─ { datasets, count }───┤                         │
   │                          │                         │
   │                                                    │
   ├─ POST /api/ins ────────────────────────────────────────────►
   │  (XML Query)             │                    INS Portal     │
   │                          ├─ Forward request ──────────────────►
   │                          │◄─ XML Response ──────────────────┤
   │◄─ [Response XML] ────────┤                                  │
   │                          │                                  │
```

### AI Assistant Flow

```
Frontend                 Backend                  Hugging Face
   │                        │                         │
   ├─ POST /api/ai      ───►│ { prompt: "..." }       │
   │  { prompt, history }   │                         │
   │                        ├─ Format messages       │
   │                        │  for Qwen model        │
   │                        │                         │
   │                        ├─ POST Request ────────►│
   │                        │  with HF_API_KEY       │
   │                        │◄─ Generated text ──────┤
   │                        │                         │
   │◄─ { text: "..." } ─────┤                         │
   │                        │                         │
```

---

## Dependencies by Type

### Backend Only (api/package.json)

```
Production:
  ✓ express              - HTTP server framework
  ✓ cors                 - Cross-origin resource handling
  ✓ dotenv              - Environment variables
  ✓ passport            - Authentication strategy abstraction
  ✓ passport-google-oauth20    - Google OAuth
  ✓ passport-facebook          - Facebook OAuth
  ✓ passport-twitter           - Twitter/X OAuth
  ✓ passport-github2           - GitHub OAuth
  ✓ jsonwebtoken        - JWT token creation/verification
  ✓ bcryptjs            - Password hashing
  ✓ fast-xml-parser     - XML parsing for SDMX file
  ✓ node-fetch          - HTTP requests in Node
  ✓ cookie-parser       - Cookie handling
  ✓ uuid                - Unique ID generation

Development: (none specified - pure Node.js)
```

### Frontend Only (WebApp/package.json)

```
Production:
  ✓ react               - UI framework
  ✓ react-dom           - React rendering
  ✓ typescript          - Type safety
  ✓ react-router-dom    - Client-side routing
  ✓ chart.js            - Charts/graphs
  ✓ axios or fetch      - HTTP requests
  ✓ ... other UI libs

Development:
  ✓ vite               - Build tool/dev server
  ✓ @vitejs/plugin-react
  ✓ ... other build tools
```

---

## Key Separation Rules

| What | Frontend | Backend | Notes |
| ------ | ---------- | --------- | ------- |
| **Browser APIs** | ✓ `window`, `document`, DOM | ✗ | Backend never uses browser objects |
| **UI Libraries** | ✓ React, chart.js, CSS | ✗ | Frontend handles all visualization |
| **HTTP Server** | ✗ | ✓ Express | Backend serves APIs only |
| **Database** | ✗ | ✓ (JSON files) | Frontend calls via API |
| **Authentication** | ✓ Stores JWT | ✓ Issues JWT | Both use same token standard |
| **Environment Vars** | `VITE_*` prefix | Regular env vars | Different namespaces |
| **Node.js Core** | ✗ fs, path, etc. | ✓ | Backend uses file system |
| **OAuth Providers** | Frontend redirects | Backend handles logic | Separation of concerns |

---

## Troubleshooting Checklist

```
✅ Deployed api/ to Render?
   └─ Check: https://your-api.onrender.com/api/health

✅ Deployed WebApp/ to Render?
   └─ Check: https://your-web.onrender.com loads without errors

✅ CORS configured correctly?
   └─ CORS_ORIGIN in api env should match frontend domain exactly

✅ OAuth callbacks registered?
   └─ Each provider config should use your Render domain URLs

✅ JWT_SECRET set in production?
   └─ Must be strong random string, different from dev

✅ Environment variables loaded?
   └─ Check Render dashboard → Environment

✅ API calls using correct domain?
   └─ Frontend should call https://your-api.onrender.com
   └─ NOT http://localhost:4000

✅ No browser libraries in api/package.json?
   └─ `npm ls | grep react` should return nothing

✅ XML file accessible?
   └─ File exists at project root: e426de42-8f6e-4e74-a23f-65a314f8c426.xml

✅ Data directory writable?
   └─ Backend needs to write to data/users.json
```

---

## Quick Reference Commands

```bash
# Start backend locally
cd api && npm start
# Response: "INS Statistics Backend API Server Started"

# Start frontend locally
cd WebApp && npm run dev
# Response: "VITE v5.x.x ready in xxx ms"

# Test backend health
curl http://localhost:4000/api/health

# Test datasets endpoint
curl http://localhost:4000/api/datasets

# Install new backend dependency
cd api && npm install passport-custom

# Check for accidental browser deps
cd api && npm ls | grep -i "react\|chart\|vue"

# Build frontend for production
cd WebApp && npm run build
# Output: dist/ folder

# Login to Render
render login

# Deploy to Render (via git push)
git push origin main
# Render auto-deploys based on your settings
```

---

**Architecture finalized**: 2026-07-04
**Status**: ✅ Ready for Render deployment
