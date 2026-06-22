/* =============================================================
   geo-adapter.js  —  INS Statistiques Tunisia Portal
   ─────────────────────────────────────────────────────────────
   Detects the visitor's geolocation via /api/geo (server-side
   proxy → ip-api.com), then personalises the UI:

     • Applies one of 4 CSS theme classes to <body>
     • Shows a flag + city pill in the nav logo
     • Displays a dismissible welcome banner below the header
     • Shows a non-blocking toast on first visit
     • Suggests an appropriate language (Arabic / French)
     • Exposes window.GeoAdapter.meta for use anywhere in app.js

   Geo Metadata Object (geoMetadata):
   {
     ip, country, countryCode, city, region, isp,
     lat, lon, timezone, isLocal,
     geoTheme,       // CSS class: 'geo-tn' | 'geo-fr' | 'geo-ar' | 'geo-intl'
     suggestedLang,  // 'ar' | 'fr'
     greeting,       // Welcome string in the appropriate language
     flag,           // Flag emoji (e.g. 🇹🇳)
     connectionHint  // 'fast' | 'slow' | 'unknown'
   }
   ============================================================= */

'use strict';

const GeoAdapter = (() => {

  /* ── 1. Country → Theme mapping ───────────────────────────── */
  const THEME_MAP = {
    // Tunisia → keep current red/gold Tunisian palette
    TN: 'geo-tn',

    // Arab World → warm gold-green
    DZ: 'geo-ar', MA: 'geo-ar', LY: 'geo-ar', EG: 'geo-ar',
    SA: 'geo-ar', AE: 'geo-ar', QA: 'geo-ar', KW: 'geo-ar',
    BH: 'geo-ar', OM: 'geo-ar', JO: 'geo-ar', IQ: 'geo-ar',
    SY: 'geo-ar', LB: 'geo-ar', YE: 'geo-ar', SD: 'geo-ar',
    MR: 'geo-ar', SO: 'geo-ar', DJ: 'geo-ar', KM: 'geo-ar',

    // France & Europe → cool blue-white
    FR: 'geo-fr', BE: 'geo-fr', CH: 'geo-fr', LU: 'geo-fr',
    DE: 'geo-fr', IT: 'geo-fr', ES: 'geo-fr', PT: 'geo-fr',
    NL: 'geo-fr', AT: 'geo-fr', PL: 'geo-fr', SE: 'geo-fr',
    NO: 'geo-fr', DK: 'geo-fr', FI: 'geo-fr', GR: 'geo-fr',
    CZ: 'geo-fr', HU: 'geo-fr',

    // English-speaking world → geo-intl (purple-teal)
    GB: 'geo-intl', US: 'geo-intl', CA: 'geo-intl', AU: 'geo-intl',
    NZ: 'geo-intl', IE: 'geo-intl', ZA: 'geo-intl', NG: 'geo-intl',
    GH: 'geo-intl', KE: 'geo-intl', PK: 'geo-intl', IN: 'geo-intl',
    SG: 'geo-intl', MY: 'geo-intl', PH: 'geo-intl',
  };

  /* ── 2. Country → Language suggestion ─────────────────────── */
  const LANG_MAP = {
    TN: 'ar', DZ: 'ar', MA: 'ar', LY: 'ar', EG: 'ar',
    SA: 'ar', AE: 'ar', QA: 'ar', KW: 'ar', BH: 'ar',
    OM: 'ar', JO: 'ar', IQ: 'ar', SY: 'ar', LB: 'ar',
    YE: 'ar', SD: 'ar', MR: 'ar',
    FR: 'fr', BE: 'fr', CH: 'fr', LU: 'fr', CI: 'fr',
    SN: 'fr', CM: 'fr', MG: 'fr', ML: 'fr', BF: 'fr',
    NE: 'fr', TD: 'fr', RW: 'fr', BI: 'fr', BJ: 'fr',
    TG: 'fr', GN: 'fr', GA: 'fr', CG: 'fr', CD: 'fr',
    // English-speaking world
    GB: 'en', US: 'en', CA: 'en', AU: 'en', NZ: 'en',
    IE: 'en', ZA: 'en', NG: 'en', GH: 'en', KE: 'en',
    PK: 'en', IN: 'en', SG: 'en', MY: 'en', PH: 'en',
  };

  /* ── 3. Flag emoji lookup ──────────────────────────────────── */
  function countryFlag(code) {
    if (!code || code.length !== 2) return '🌐';
    const offset = 127397; // Unicode regional indicator base
    return String.fromCodePoint(
      code.toUpperCase().charCodeAt(0) + offset,
      code.toUpperCase().charCodeAt(1) + offset
    );
  }

  /* ── 4. Build greeting string ──────────────────────────────── */
  function buildGreeting(meta) {
    const { countryCode, country, city, isLocal } = meta;
    const theme = meta.geoTheme;

    if (isLocal) {
      return {
        ar: `مرحباً بك في بوابة الإحصائيات التونسية 🇹🇳`,
        fr: `Bienvenue sur le portail des statistiques tunisiennes 🇹🇳`,
        en: `Welcome to the Tunisia Statistics Portal 🇹🇳`
      };
    }

    if (countryCode === 'TN') {
      return {
        ar: `مرحباً بك من ${city} 🇹🇳`,
        fr: `Bienvenue de ${city} 🇹🇳`,
        en: `Welcome from ${city} 🇹🇳`
      };
    }

    if (theme === 'geo-ar') {
      return {
        ar: `مرحباً ${meta.flag} بك من ${country} — هذه البوابة تعرض إحصائيات تونس الاقتصادية`,
        fr: `Bienvenue ${meta.flag} de ${country} — Ce portail présente les statistiques économiques de la Tunisie`,
        en: `Welcome ${meta.flag} from ${country} — Explore Tunisia's economic statistics`
      };
    }

    if (theme === 'geo-fr') {
      return {
        ar: `أهلاً بك ${meta.flag} قادماً من ${country}`,
        fr: `Bonjour ${meta.flag} depuis ${country} — Explorez les statistiques tunisiennes`,
        en: `Hello ${meta.flag} from ${country} — Explore Tunisia's statistics`
      };
    }

    // International (geo-intl) — includes English-speaking world
    return {
      ar: `مرحباً ${meta.flag} بزائرنا من ${country}`,
      fr: `Bienvenue ${meta.flag} depuis ${country} — Portail Statistiques Tunisie`,
      en: `Welcome ${meta.flag} from ${country} — Tunisia Statistics Portal`
    };
  }

  /* ── 5. Connection quality hint ───────────────────────────── */
  function detectConnectionHint() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return 'unknown';
    const slow = ['slow-2g', '2g', '3g'];
    if (slow.includes(conn.effectiveType)) return 'slow';
    return 'fast';
  }

  /* ── 6. Fetch geo metadata ─────────────────────────────────── */
  async function fetchGeoMetadata() {
    const CACHE_KEY = 'ins_geo_metadata';
    const cached    = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try { return JSON.parse(cached); } catch (_) { /* stale cache */ }
    }

    const res  = await fetch('/api/geo');
    if (!res.ok) throw new Error(`/api/geo returned ${res.status}`);
    const data = await res.json();

    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return data;
  }

  /* ── 7. Build full metadata object ────────────────────────── */
  function buildMetadata(raw) {
    const cc   = raw.countryCode || 'TN';
    const theme = THEME_MAP[cc] || 'geo-intl';
    const flag  = countryFlag(cc);
    const greeting = buildGreeting({ ...raw, geoTheme: theme, flag });

    return {
      // Raw geo fields
      ip:          raw.ip          || '',
      country:     raw.country     || 'Tunisia',
      countryCode: cc,
      city:        raw.city        || '',
      region:      raw.region      || '',
      isp:         raw.isp         || '',
      lat:         raw.lat         || 0,
      lon:         raw.lon         || 0,
      timezone:    raw.timezone    || 'UTC',
      isLocal:     raw.isLocal     || false,

      // Derived
      geoTheme:       theme,
      suggestedLang:  LANG_MAP[cc] || 'fr',
      greeting,
      flag,
      connectionHint: detectConnectionHint(),
    };
  }

  /* ── 8. Apply CSS theme to body ───────────────────────────── */
  function applyTheme(meta) {
    // Remove any existing geo classes
    document.body.classList.remove('geo-tn', 'geo-fr', 'geo-ar', 'geo-intl');
    document.body.classList.add(meta.geoTheme);
    // Store metadata on body for easy CSS targeting
    document.body.dataset.geoCountry = meta.countryCode;
    document.body.dataset.geoTheme   = meta.geoTheme;
  }

  /* ── 9. Render geo pill in nav logo ───────────────────────── */
  function renderGeoPill(meta) {
    const pill = document.getElementById('geo-pill');
    if (!pill) return;

    const locationText = meta.isLocal
      ? 'Local'
      : (meta.city && meta.city !== 'Unknown' ? meta.city : meta.country);

    pill.textContent  = `${meta.flag} ${locationText}`;
    pill.title        = `${meta.country} · ${meta.ip} · ${meta.timezone}`;
    pill.style.display = 'inline-flex';
  }

  /* ── 10. Render the geo banner ────────────────────────────── */
  function renderBanner(meta, currentLang) {
    const banner = document.getElementById('geo-banner');
    if (!banner) return;

    const lang = currentLang || 'ar';
    const greet = meta.greeting[lang] || meta.greeting.en || meta.greeting.fr;

    const locationDetail = meta.isLocal
      ? (lang === 'ar' ? 'تشغيل محلي' : lang === 'en' ? 'Local mode' : 'Mode local')
      : `${meta.city}${meta.region ? ', ' + meta.region : ''} · ${meta.country}`;

    const ispDetail = meta.isp && !meta.isLocal
      ? `<span class="geo-banner-isp">🌐 ${meta.isp}</span>`
      : '';

    const tzDetail = `<span class="geo-banner-tz">🕐 ${meta.timezone}</span>`;

    banner.innerHTML = `
      <div class="geo-banner-inner">
        <div class="geo-banner-left">
          <span class="geo-banner-flag">${meta.flag}</span>
          <div class="geo-banner-text">
            <span class="geo-banner-greeting">${greet}</span>
            <span class="geo-banner-detail">📍 ${locationDetail} ${ispDetail} ${tzDetail}</span>
          </div>
        </div>
        <button class="geo-banner-close" id="geo-banner-close" title="Fermer / إغلاق">×</button>
      </div>
    `;

    banner.style.display = 'block';
    banner.classList.add('geo-banner-enter');

    // Close button
    document.getElementById('geo-banner-close').addEventListener('click', () => {
      banner.classList.add('geo-banner-exit');
      setTimeout(() => { banner.style.display = 'none'; }, 300);
    });

    // Auto-dismiss after 12 seconds
    setTimeout(() => {
      if (banner.style.display !== 'none') {
        banner.classList.add('geo-banner-exit');
        setTimeout(() => { banner.style.display = 'none'; }, 300);
      }
    }, 12_000);
  }

  /* ── 11. Show welcome toast (first visit only) ─────────────── */
  function showToast(meta, currentLang) {
    const TOAST_KEY = 'ins_geo_toast_shown';
    if (sessionStorage.getItem(TOAST_KEY)) return; // Only once per session
    sessionStorage.setItem(TOAST_KEY, '1');

    const toast = document.getElementById('geo-toast');
    if (!toast) return;

    const lang  = currentLang || 'ar';
    const lines = {
      ar: { line1: 'تم اكتشاف موقعك', line2: `${meta.flag} ${meta.country}` },
      fr: { line1: 'Localisation détectée', line2: `${meta.flag} ${meta.country}` },
      en: { line1: 'Location detected', line2: `${meta.flag} ${meta.country}` }
    };
    const { line1, line2 } = lines[lang] || lines.en;

    const qualityIcon = { fast: '⚡', slow: '🐌', unknown: '🌐' }[meta.connectionHint] || '🌐';

    toast.innerHTML = `
      <div class="geo-toast-body">
        <div class="geo-toast-icon">${qualityIcon}</div>
        <div class="geo-toast-text">
          <span class="geo-toast-title">${line1}</span>
          <span class="geo-toast-sub">${line2}</span>
        </div>
        <button class="geo-toast-close" id="geo-toast-close">×</button>
      </div>
    `;

    toast.classList.add('geo-toast-show');

    // Manual close
    document.getElementById('geo-toast-close').addEventListener('click', () => {
      toast.classList.remove('geo-toast-show');
    });

    // Auto-dismiss after 5 seconds
    setTimeout(() => toast.classList.remove('geo-toast-show'), 5_000);
  }

  /* ── 12. Public init() ─────────────────────────────────────── */
  async function init(currentLang) {
    try {
      const raw  = await fetchGeoMetadata();
      const meta = buildMetadata(raw);

      // Store on GeoAdapter for external access
      GeoAdapter.meta = meta;

      // Apply all personalisation layers
      applyTheme(meta);
      renderGeoPill(meta);
      renderBanner(meta, currentLang);
      showToast(meta, currentLang);

      console.log('[GeoAdapter] ✓ Personalised UI for', meta.country, '→ theme:', meta.geoTheme);
      return meta;

    } catch (err) {
      // Never block the app — geo is progressive enhancement
      console.warn('[GeoAdapter] Failed to personalise (graceful skip):', err.message);
      document.body.classList.add('geo-tn'); // Default to Tunisian theme
      return null;
    }
  }

  /* ── Public API ────────────────────────────────────────────── */
  return { init, meta: null };

})();

// Make available globally
window.GeoAdapter = GeoAdapter;
