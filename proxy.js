/**
 * proxy.js
 * ──────────────────────────────────────────────────────────────
 * INS Tunisia – Local Proxy + Static File Server
 *
 * Solves the CORS problem: the browser cannot call the INS API
 * directly because the server doesn't send CORS headers.
 * This proxy:
 *   1. Serves your static website files (index.html, CSS, JS, data/)
 *   2. Exposes  POST /api/ins  →  forwards to the real INS endpoint
 *
 * Usage:
 *   npm install          ← first time only
 *   node proxy.js        ← start the server
 *   Open http://localhost:3080
 * ──────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const express = require("express");
const fetch   = require("node-fetch");
const path    = require("path");
const passport = require('passport');
const cookieParser = require('cookie-parser');

// Auth imports
const authRoutes = require('./auth/routes');
const { CORS_CONFIG } = require('./auth/config');
const { requireAdmin } = require('./auth/middleware');

const app  = express();
const PORT = process.env.PORT || 3080;
const HOST = process.env.HOST || '0.0.0.0'; 
const fs = require('fs');

// ── CORS & Body Parsers ──────────────────────────────────────
const cors = require('cors');
app.use(cors(CORS_CONFIG));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Passport initialization ──────────────────────────────────
app.use(passport.initialize());

// ── 1. Serve static files (index.html, app.js, data/, …) ──────
app.use(express.static(path.join(__dirname)));

// ── 2. Accept raw XML in POST /api/ins  ───────────────────────
app.use("/api/ins", express.text({ type: "*/*", limit: "1mb" }));

// ── 2b. Authentication Routes ────────────────────────────────
app.use('/auth', authRoutes);

/**
 * POST /api/ins?lang=fr
 *
 * Body   : XML QueryMessage (same format as Request.xml)
 * Returns: Raw XML from the INS API
 *
 * The client (ins-api.js) sends its XML body here instead of
 * directly to the INS server, bypassing CORS entirely.
 */
app.post("/api/ins", async (req, res) => {
  const lang       = req.query.lang ?? "fr";           // "en" | "fr" | "ar"
  const insEndpoint = `http://dataportal.ins.tn/${lang}/api/getdata`;

  console.log(`[INS Proxy] → POST ${insEndpoint}`);
  console.log(`[INS Proxy]   Body length: ${(req.body ?? "").length} chars`);

  try {
    const insResponse = await fetch(insEndpoint, {
      method:  "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        Accept:         "text/xml, application/xml",
        // Mimic a browser referer so the server is less likely to block
        Referer:        "http://dataportal.ins.tn/",
        "User-Agent":   "Mozilla/5.0 (compatible; INS-Client/1.0)",
      },
      body: req.body,
    });

    const responseText = await insResponse.text();

    if (!insResponse.ok) {
      console.error(`[INS Proxy] ✗ ${insResponse.status} ${insResponse.statusText}`);
      return res.status(insResponse.status).send(responseText);
    }

    console.log(`[INS Proxy] ✓ ${insResponse.status} (${responseText.length} chars)`);

    // Forward the XML back to the browser
    res.setHeader("Content-Type", "text/xml; charset=utf-8");
    res.send(responseText);

  } catch (err) {
    console.error("[INS Proxy] Network error:", err.message);
    res.status(502).json({ error: "Proxy could not reach the INS server.", detail: err.message });
  }
});

// ── 3. Hot Reload (SSE + Watcher) ────────────────────────────
let clients = [];
app.get('/hot-reload', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  clients.push(res);
  req.on('close', () => clients = clients.filter(c => c !== res));
});

let fileChanges = 0;
require("fs").watch(__dirname, { recursive: true }, (e, f) => {
  if (f && !f.includes('node_modules')) {
    fileChanges = 1;
    if (fileChanges) {
      clients.forEach(c => c.write('data: reload\n\n'));
      clients = [];
      fileChanges = 0;
    }
  }
});

// ── 4. Geolocation API ───────────────────────────────────────
/**
 * GET /api/geo
 *
 * Detects the real client IP (works behind proxies / Heroku / nginx),
 * looks it up via ip-api.com (server-side, no CORS issues), and returns
 * clean metadata used by geo-adapter.js to personalise the UI.
 *
 * Response shape:
 * {
 *   ip, country, countryCode, city, region, isp, lat, lon, timezone,
 *   isLocal  ← true when running on localhost / LAN
 * }
 */
const PRIVATE_IP_RE = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fc|fd)/;

// Simple in-memory cache to protect ip-api.com free tier limits
const geoCache = new Map();
const GEO_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Cleanup expired cache entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of geoCache.entries()) {
    if (now - entry.timestamp > GEO_CACHE_TTL) {
      geoCache.delete(ip);
    }
  }
}, 60 * 60 * 1000);

app.get("/api/geo", async (req, res) => {
  // Resolve real IP (CDN / reverse-proxy friendly)
  const forwarded = req.headers["x-forwarded-for"];
  const rawIp     = forwarded ? forwarded.split(",")[0].trim()
                              : req.socket.remoteAddress;

  // Strip IPv6-mapped IPv4 prefix  (e.g. "::ffff:192.168.1.1" → "192.168.1.1")
  const ip = rawIp.replace(/^::ffff:/, "");

  // Localhost / LAN — ip-api.com can't resolve private addresses
  if (PRIVATE_IP_RE.test(ip)) {
    console.log(`[GEO] Local request from ${ip} – returning isLocal placeholder`);
    return res.json({
      ip,
      country:     "Tunisia",
      countryCode: "TN",
      city:        "Local",
      region:      "",
      isp:         "localhost",
      lat:         36.8065,
      lon:         10.1815,
      timezone:    "Africa/Tunis",
      isLocal:     true
    });
  }

  // Check cache first
  const cached = geoCache.get(ip);
  if (cached && (Date.now() - cached.timestamp < GEO_CACHE_TTL)) {
    console.log(`[GEO] ⚡ Cache hit for ${ip}`);
    return res.json(cached.data);
  }

  try {
    console.log(`[GEO] → Lookup ${ip}`);
    const geoRes  = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,regionName,isp,lat,lon,timezone`);
    const geoData = await geoRes.json();

    if (geoData.status !== "success") {
      throw new Error("ip-api returned: " + geoData.status);
    }

    const result = {
      ip,
      country:     geoData.country,
      countryCode: geoData.countryCode,
      city:        geoData.city,
      region:      geoData.regionName || "",
      isp:         geoData.isp        || "",
      lat:         geoData.lat,
      lon:         geoData.lon,
      timezone:    geoData.timezone,
      isLocal:     false
    };

    // Save to cache
    geoCache.set(ip, { timestamp: Date.now(), data: result });
    console.log(`[GEO] ✓ ${ip} → ${result.city}, ${result.country}`);
    
    res.json(result);
  } catch (err) {
    console.error("[GEO] Lookup failed:", err.message);
    // Graceful fallback — don't crash the page
    res.json({
      ip, country: "Unknown", countryCode: "XX", city: "Unknown",
      region: "", isp: "", lat: 0, lon: 0, timezone: "UTC", isLocal: false
    });
  }
});

// ── 6. AI Assistant Bridge (Qwen via Hugging Face Free Tier) ──────────────────────────
// Requires HF_API_KEY environment variable
app.post("/api/ai", express.json(), async (req, res) => {
  const { prompt, history, context } = req.body;
  const apiKey = process.env.HF_API_KEY;
  const model = "Qwen/Qwen2.5-72B-Instruct";
  
  if (!apiKey) {
    return res.status(503).json({ error: "AI Service Unavailable (API Key missing)" });
  }

  try {
    // Build conversation history for Qwen
    let messages = [];
    
    // Add system context
    messages.push({
      role: "system",
      content: `You are the INS Statistics Assistant for Tunisia. 
Help the user analyze statistics about agriculture, tourism, industry, etc.
Current section context: ${JSON.stringify(context)}.
Be concise, use markdown. If appropriate, suggest a chart by starting a line with [CHART] followed by JSON {type, labels, data, label}.`
    });
    
    // Add conversation history
    if (history && Array.isArray(history)) {
      history.forEach(h => {
        messages.push({ role: h.role === 'assistant' ? 'assistant' : 'user', content: h.content });
      });
    }
    
    // Add current prompt
    messages.push({ role: "user", content: prompt });

    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        inputs: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
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
      console.error("Hugging Face API Error:", errorData);
      
      // Handle model loading state (common with free tier)
      if (errorData.error && errorData.error.includes("loading")) {
        return res.json({ text: "⏳ The AI model is currently warming up. Please try again in 30 seconds." });
      }
      throw new Error(errorData.error || "Failed to fetch AI response");
    }

    const result = await response.json();
    const botText = Array.isArray(result) && result[0]?.generated_text 
      ? result[0].generated_text.trim() 
      : "I'm sorry, I couldn't process that.";
    
    res.json({ text: botText });
  } catch (err) {
    console.error("AI Error:", err.message);
    res.status(500).json({ error: "AI unreachable" });
  }
});

// ── 7. Research Bridge ───────────────────────────────────────
app.get("/api/research", async (req, res) => {
  const query = req.query.q;
  console.log(`[RESEARCH] Query: ${query}`);
  
  // Simulate a research response based on the query
  // In a real app, use Google Custom Search API or Similar
  setTimeout(() => {
    res.json({
      query,
      results: [
        { title: `Latest trends in ${query}`, snippet: "Recent data shows a 5% increase compared to last year...", link: "#" },
        { title: "INS Official Report 2024", snippet: "According to the National Institute of Statistics, the sector is growing.", link: "#" }
      ]
    });
  }, 1000);
});

// ── 8. Admin & Settings API ──────────────────────────────────
const SETTINGS_FILE = path.join(__dirname, 'settings.json');

app.get("/api/settings", (req, res) => {
  try {
    const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.json({ overrides: {}, config: {} });
  }
});

app.post("/api/settings", requireAdmin, (req, res) => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save settings" });
  }
});
// ── 9. Catch-All Route for React Router ───────────────────────
app.get('*', (req, res) => {
  const reactIndexPath = path.join(__dirname, 'WebApp', 'dist', 'index.html');
  
  // Check if the React build exists
  if (fs.existsSync(reactIndexPath)) {
    console.log(`[Router] Serving React App for: ${req.path}`);
    res.sendFile(reactIndexPath);
  } else {
    // If no build exists, show a helpful error instead of the wrong page
    console.error(`[Router] Build not found at ${reactIndexPath}. Did the Vite build fail?`);
    res.status(500).send(`
      <h1>React Build Missing</h1>
      <p>The frontend build (WebApp/dist/index.html) was not found.</p>
      <p><strong>Debug Steps:</strong></p>
      <ol>
        <li>Check Render Deployment Logs for "Vite build" errors.</li>
        <li>Ensure your Render Build Command is: <code>cd WebApp && npm install && npm run build</code></li>
        <li>Verify <code>WebApp/dist</code> exists in your repository (or is generated during build).</li>
      </ol>
    `);
  }
});
// ── 5. Start server ───────────────────────────────────────────
app.listen(PORT, HOST, () => {
  const displayHost = (HOST === '0.0.0.0' || HOST === '::') ? 'localhost' : HOST;
  console.log("─────────────────────────────────────────────");
  console.log(`  🇹🇳  INS Statistics Portal`);
  console.log(`  ✔  Static site  → http://${displayHost}:${PORT}`);
  console.log(`  ✔  INS Proxy    → POST http://${displayHost}:${PORT}/api/ins`);
  console.log(`  ✔  Auth API     → http://${displayHost}:${PORT}/auth`);
  console.log(`  ✔  Admin Panel  → http://${displayHost}:${PORT}/dashboard`);
  console.log("─────────────────────────────────────────────");
  console.log(`  📖 Default admin: admin@ins.tn / admin123`);
  console.log(`  🔐 OAuth2: Google (configure GOOGLE_CLIENT_ID in .env)`);
  console.log("─────────────────────────────────────────────");
});
