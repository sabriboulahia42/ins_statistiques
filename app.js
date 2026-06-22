/* =============================================================
   app.js – Tunisia Statistics Website
   Language: Trilingual Arabic (default) / French / English
   ============================================================= */

'use strict';

/* ─── 0. Analytics helper ────────────────────────────────── */
// Thin wrapper — gracefully no-ops if gtag isn't loaded yet
const Analytics = {
  /**
   * Track a GA4 event.
   * @param {string} eventName  GA4 event name (snake_case recommended)
   * @param {object} params     Additional event parameters
   */
  track(eventName, params = {}) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }
  },

  /** Called once after GeoAdapter resolves, enriches all future events */
  setGeoContext(meta) {
    if (!meta || typeof gtag !== 'function') return;
    gtag('set', {
      geo_country:   meta.countryCode || 'XX',
      geo_theme:     meta.geoTheme    || 'geo-tn',
      user_language: meta.suggestedLang || 'ar',
    });
    this.track('geo_detected', {
      country_code:  meta.countryCode,
      city:          meta.city,
      geo_theme:     meta.geoTheme,
      is_local:      meta.isLocal,
      connection:    meta.connectionHint,
    });
  },

  /** Update Google Consent Mode v2 state */
  trackConsent(status) {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        'ad_storage': status,
        'ad_user_data': status,
        'ad_personalization': status,
        'analytics_storage': status
      });
      console.log(`[Analytics] Consent updated to: ${status}`);
    }
  }
};

/* ─── 1. Translations ─────────────────────────────────────── */
const i18n = {
  ar: {
    badge: 'السنة التاسعة أساسي — المنهج التونسي',
    hero_title: 'إحصائيات تونس الاقتصادية',
    hero_sub: 'بوابة تفاعلية للإحصائيات الاقتصادية التونسية — مصدرها المعهد الوطني للإحصاء. استكشف أرقام الفلاحة والسياحة والصناعة والصناعة التقليدية والتبادل التجاري الخارجي.',
    hero_s1: 'مؤشر متاح', hero_s2: 'قطاعات اقتصادية', hero_s3: 'آخر تحديث',
    tab_ag: 'الفلاحة', tab_tour: 'السياحة', tab_ind: 'الصناعة',
    tab_trad: 'الصناعة التقليدية', tab_demog: 'الخصائص الديمغرافية', tab_trade: 'التبادل التجاري',
    ag_title: 'القطاع الفلاحي',
    ag_sub: 'الإنتاج الزراعي والثروة الحيوانية والصيد البحري في تونس',
    ag_info_title: 'معلومة تربوية',
    ag_info: 'تُعدّ تونس من أكبر منتجي زيت الزيتون في العالم، وتحتل المرتبة الثانية أو الثالثة عالمياً في سنوات الإنتاج الكبير. تُمثّل الفلاحة نحو 10% من الناتج المحلي الإجمالي وتشغّل ما يقارب 15% من القوى العاملة.',
    tour_title: 'قطاع السياحة',
    tour_sub: 'الوافدون السياحيون والليالي الفندقية والعائدات السياحية',
    tour_info_title: 'معلومة تربوية',
    tour_info: 'تُشكّل السياحة ركيزة اقتصادية هامة لتونس. تأثّر القطاع بالأحداث السياسية (2011 و2015) والجائحة (2020)، لكنه تعافى بقوة ليرتفع عدد السياح إلى 8.8 مليون سائح عام 2023.',
    ind_title: 'القطاع الصناعي',
    ind_sub: 'مؤشر الإنتاج الصناعي وتوزيع القطاعات والمؤسسات',
    ind_info_title: 'معلومة تربوية',
    ind_info: 'تمثّل الصناعات الميكانيكية والكهربائية أكبر قطاع صناعي في تونس لما تحققه من قيمة مضافة عالية وتصدير. تُشغّل الصناعة نحو 700 ألف عامل في 137 منطقة صناعية.',
    trad_title: 'الصناعة التقليدية',
    trad_sub: 'الحرفيون والصادرات وأنواع الحرف اليدوية التونسية',
    trad_info_title: 'معلومة تربوية',
    trad_info: 'تتميّز تونس بتنوع حرفها اليدوية من نسيج وفخّار وجلد ونحاس وصياغة. تضمّ مدن مثل نابل وقيروان وسيدي بوسعيد مخازن تاريخية للصناعة التقليدية وتُصدّر منتجاتها إلى أوروبا والعالم.',
    demog_title: 'الخصائص الديمغرافية',
    demog_sub: 'السكان حسب الجنس والعمر والوسط الذي يعيشون فيه',
    demog_info_title: 'معلومة تربوية',
    demog_info: 'يشهد المجتمع التونسي تحولا ديمغرافيا حيث ترتفع نسبة كبار السن وتتراجع نسبة الخصوبة. يعيش حوالي 69% من السكان في المناطق الحضرية، مع تركز كبير في الشريط الساحلي.',
    trade_title: 'التبادل التجاري الخارجي',
    trade_sub: 'الصادرات والواردات والميزان التجاري وأهم الشركاء',
    trade_info_title: 'معلومة تربوية',
    trade_info: 'يُعاني الميزان التجاري التونسي من عجز مزمن بسبب ارتفاع فاتورة الطاقة والمواد الأولية. تُهيمن فرنسا وإيطاليا وألمانيا على التبادل التجاري لتونس، وهو ما يعكس قرب تونس الجغرافي من أوروبا.',
    source: 'المصدر:', request_xml: 'استعلام XML: ',
    footer: 'المعطيات مصدرها <a href="http://dataportal.ins.tn" target="_blank">المعهد الوطني للإحصاء — INS تونس</a> · أُعدّ لتلاميذ السنة التاسعة أساسي · 2024–2025',
    logo: 'إحصائيات تونس',
    ct_cereals: 'الحبوب', ct_olive: 'زيت الزيتون', ct_dates: 'التمور', ct_fish: 'الصيد البحري',
    ch_cereals: 'إنتاج الحبوب (1000 طن)', ch_olive: 'إنتاج زيت الزيتون (1000 طن)',
    ch_dates: 'إنتاج التمور (1000 طن)', ch_fish: 'الإنتاج السمكي (1000 طن)',
    ch_arrivals: 'الوافدون السياحيون (مليون)', ch_receipts: 'عائدات السياحة (مليون دينار)',
    ch_prod_index: 'مؤشر الإنتاج الصناعي', ch_ind_sectors: 'توزيع القطاعات الصناعية 2023 (%)',
    ch_craft_exports: 'صادرات الصناعة التقليدية (مليون دينار)', ch_craft_types: 'توزيع أنواع الحرف 2023 (%)',
    ch_pop: 'تطور عدد السكان (مليون)', ch_age: 'التوزيع حسب الفئة العمرية (%)', ch_urban: 'حضري مقابل ريفي (%)',
    ch_trade_balance: 'الصادرات والواردات والميزان التجاري (مليون دينار)',
    ch_trade_partners: 'أهم الشركاء التجاريين — الصادرات 2023 (%)',
    ch_coverage: 'نسبة التغطية (%)',
    label_exports: 'الصادرات', label_imports: 'الواردات', label_balance: 'الميزان التجاري',
    label_coverage: 'نسبة التغطية (%)',
    export: 'تصدير',
    preview: 'معاينة البيانات',
    print: 'عملية الطباعة',
    history_title: 'السجلات السابقة',
    no_history: 'لا يوجد سجلات حالياً',
    clear_history: 'حذف الكل',
    cookie_title: 'نحن نحترم خصوصيتك',
    cookie_desc: 'نستخدم ملفات تعريف الارتباط وتقنيات التتبع (Google Analytics) لتحسين تجربتك على بوابتنا.',
    cookie_accept: 'موافق',
    cookie_reject: 'لا أوافق',
    random_title: 'أرقام عشوائية ومعلومات ملهمة',
    random_sub: 'اكتشف حقائق اقتصادية من خلال مؤشرات عشوائية من المعهد الوطني للإحصاء',
    refresh: 'تحديث',
    loading: 'جاري تحميل البيانات...',
    did_you_know: 'هل تعلم؟',
    tab_request: 'طلب بيانات',
    request_title: 'طلب بيانات مخصصة',
    request_sub: 'اختر القطاع والمؤشر والسنوات للحصول على بيانات مباشرة من المعهد',
    label_domain: 'القطاع الاقتصادي',
    label_indicator: 'المؤشر المطلوب',
    label_years: 'الفترة الزمنية',
    btn_fetch: 'تحميل البيانات',
  },
  fr: {
    badge: '9ème année de base — Programme tunisien',
    hero_title: 'Statistiques Économiques de la Tunisie',
    hero_sub: 'Portail interactif de statistiques économiques tunisiennes — Source : Institut National des Statistiques. Explorez les chiffres de l\'agriculture, du tourisme, de l\'industrie, de l\'artisanat et du commerce extérieur.',
    hero_s1: 'indicateurs disponibles', hero_s2: 'secteurs économiques', hero_s3: 'dernière mise à jour',
    tab_ag: 'Agriculture', tab_tour: 'Tourisme', tab_ind: 'Industrie',
    tab_trad: 'Artisanat', tab_demog: 'Démographie', tab_trade: 'Commerce Extérieur',
    ag_title: 'Secteur Agricole',
    ag_sub: 'Production agricole, élevage et pêche en Tunisie',
    ag_info_title: 'Point éducatif',
    ag_info: 'La Tunisie est l\'un des plus grands producteurs d\'huile d\'olive au monde, se classant 2e ou 3e certaines années. L\'agriculture représente environ 10 % du PIB et emploie près de 15 % de la main-d\'œuvre.',
    tour_title: 'Secteur Touristique',
    tour_sub: 'Arrivées touristiques, nuitées hôtelières et recettes',
    tour_info_title: 'Point éducatif',
    tour_info: 'Le tourisme est un pilier économique majeur pour la Tunisie. Le secteur a été impacté par les événements politiques (2011, 2015) et la pandémie (2020), mais s\'est fortement redressé pour atteindre 8,8 millions de touristes en 2023.',
    ind_title: 'Secteur Industriel',
    ind_sub: 'Indice de production industrielle, répartition par secteur et entreprises',
    ind_info_title: 'Point éducatif',
    ind_info: 'Les industries mécaniques et électriques constituent le plus grand secteur industriel tunisien en termes de valeur ajoutée et d\'exportations. L\'industrie emploie environ 700 000 travailleurs dans 137 zones industrielles.',
    trad_title: 'Artisanat Traditionnel',
    trad_sub: 'Artisans, exportations et types de métiers artisanaux tunisiens',
    trad_info_title: 'Point éducatif',
    trad_info: 'La Tunisie se distingue par la diversité de son artisanat : tissage, poterie, cuir, cuivre et bijouterie. Des villes comme Nabeul, Kairouan et Sidi Bou Saïd sont des centres historiques de l\'artisanat, exportant vers l\'Europe et le monde.',
    demog_title: 'Démographie',
    demog_sub: 'Population par âge, sexe et répartition géographique',
    demog_info_title: 'Point éducatif',
    demog_info: 'La Tunisie connaît une transition démographique avancée avec une fécondité en baisse. Le pays est très urbanisé (69%) avec une forte densité sur le littoral.',
    trade_title: 'Commerce Extérieur',
    trade_sub: 'Exportations, importations, balance commerciale et principaux partenaires',
    trade_info_title: 'Point éducatif',
    trade_info: 'La balance commerciale tunisienne souffre d\'un déficit chronique dû à la facture énergétique et aux matières premières. La France, l\'Italie et l\'Allemagne dominent les échanges commerciaux de la Tunisie, reflétant la proximité géographique avec l\'Europe.',
    source: 'Source :', request_xml: 'Requête XML : ',
    footer: 'Données issues de <a href="http://dataportal.ins.tn" target="_blank">l\'INS — Institut National des Statistiques Tunisie</a> · Conçu pour les élèves de 9ème année · 2024–2025',
    logo: 'Statistiques Tunisie',
    ct_cereals: 'Céréales', ct_olive: 'Huile d\'olive', ct_dates: 'Dattes', ct_fish: 'Pêche',
    ch_cereals: 'Production de céréales (1 000 t)', ch_olive: 'Production d\'huile d\'olive (1 000 t)',
    ch_dates: 'Production de dattes (1 000 t)', ch_fish: 'Production halieutique (1 000 t)',
    ch_arrivals: 'Arrivées touristiques (millions)', ch_receipts: 'Recettes touristiques (MTND)',
    ch_prod_index: 'Indice de production industrielle', ch_ind_sectors: 'Répartition industries 2023 (%)',
    ch_craft_exports: 'Exportations artisanales (MTND)', ch_craft_types: 'Répartition par type de métier 2023 (%)',
    ch_pop: 'Croissance de la population (millions)', ch_age: 'Répartition par tranches d\'âge (%)', ch_urban: 'Milieu urbain vs rural (%)',
    ch_trade_balance: 'Exportations, Importations et Balance (MTND)',
    ch_trade_partners: 'Principaux clients à l\'export 2023 (%)',
    ch_coverage: 'Taux de couverture (%)',
    label_exports: 'Exportations', label_imports: 'Importations', label_balance: 'Balance commerciale',
    label_coverage: 'Taux de couverture (%)',
    export: 'Exporter',
    preview: 'Aperçu des données',
    print: 'Imprimer',
    history_title: 'Historique récent',
    no_history: 'Aucun historique',
    clear_history: 'Tout effacer',
    cookie_title: 'Nous respectons votre vie privée',
    cookie_desc: 'Nous utilisons des cookies et Google Analytics pour améliorer votre expérience sur notre portail.',
    cookie_accept: 'Accepter',
    cookie_reject: 'Refuser',
    random_title: 'Chiffres aléatoires et infos inspirantes',
    random_sub: 'Découvrez des faits économiques via des indicateurs aléatoires de l\'INS',
    refresh: 'Actualiser',
    loading: 'Chargement des données...',
    did_you_know: 'Le saviez-vous ?',
    tab_request: 'Requête',
    request_title: 'Demande de données personnalisées',
    request_sub: 'Choisissez le secteur, l\'indicateur et les années pour obtenir des données en direct.',
    label_domain: 'Secteur économique',
    label_indicator: 'Indicateur souhaité',
    label_years: 'Période temporelle',
    btn_fetch: 'Charger les données',
  },
  en: {
    badge: '9th Grade — Tunisian Curriculum',
    hero_title: 'Tunisia Economic Statistics',
    hero_sub: 'Interactive portal for Tunisian economic statistics — Source: National Institute of Statistics. Explore figures on agriculture, tourism, industry, crafts and foreign trade.',
    hero_s1: 'available indicators', hero_s2: 'economic sectors', hero_s3: 'last updated',
    tab_ag: 'Agriculture', tab_tour: 'Tourism', tab_ind: 'Industry',
    tab_trad: 'Traditional Crafts', tab_demog: 'Demographics', tab_trade: 'Foreign Trade',
    ag_title: 'Agricultural Sector',
    ag_sub: 'Agricultural production, livestock and fisheries in Tunisia',
    ag_info_title: 'Educational insight',
    ag_info: 'Tunisia is one of the world\'s largest olive oil producers, ranking 2nd or 3rd globally in peak years. Agriculture represents about 10% of GDP and employs approximately 15% of the workforce.',
    tour_title: 'Tourism Sector',
    tour_sub: 'Tourist arrivals, hotel nights and tourism receipts',
    tour_info_title: 'Educational insight',
    tour_info: 'Tourism is a major economic pillar for Tunisia. The sector was impacted by political events (2011, 2015) and the pandemic (2020), but strongly recovered, reaching 8.8 million tourists in 2023.',
    ind_title: 'Industrial Sector',
    ind_sub: 'Industrial production index, sector distribution and enterprises',
    ind_info_title: 'Educational insight',
    ind_info: 'Mechanical and electrical industries constitute Tunisia\'s largest industrial sector in terms of added value and exports. Industry employs around 700,000 workers in 137 industrial zones.',
    trad_title: 'Traditional Crafts',
    trad_sub: 'Artisans, exports and types of Tunisian handicrafts',
    trad_info_title: 'Educational insight',
    trad_info: 'Tunisia is distinguished by the diversity of its crafts: weaving, pottery, leather, copper and jewellery. Cities like Nabeul, Kairouan and Sidi Bou Saïd are historic centres of craftsmanship, exporting to Europe and beyond.',
    demog_title: 'Demographics',
    demog_sub: 'Population by age, gender and geographic distribution',
    demog_info_title: 'Educational insight',
    demog_info: 'Tunisia is experiencing an advanced demographic transition with declining fertility rates. The population is highly urbanized (69%) with a heavy concentration along coastal areas.',
    trade_title: 'Foreign Trade',
    trade_sub: 'Exports, imports, trade balance and key partners',
    trade_info_title: 'Educational insight',
    trade_info: 'Tunisia\'s trade balance suffers from a chronic deficit driven by energy costs and raw materials. France, Italy and Germany dominate trade flows, reflecting Tunisia\'s geographic proximity to Europe.',
    source: 'Source:', request_xml: 'XML Query: ',
    footer: 'Data from <a href="http://dataportal.ins.tn" target="_blank">INS — National Institute of Statistics Tunisia</a> · Designed for 9th grade students · 2024–2025',
    logo: 'Tunisia Statistics',
    ct_cereals: 'Cereals', ct_olive: 'Olive Oil', ct_dates: 'Dates', ct_fish: 'Fishing',
    ch_cereals: 'Cereal Production (1,000 t)', ch_olive: 'Olive Oil Production (1,000 t)',
    ch_dates: 'Date Production (1,000 t)', ch_fish: 'Fishery Production (1,000 t)',
    ch_arrivals: 'Tourist Arrivals (millions)', ch_receipts: 'Tourism Revenue (MTND)',
    ch_prod_index: 'Industrial Production Index', ch_ind_sectors: 'Industry Sectors 2023 (%)',
    ch_craft_exports: 'Craft Exports (MTND)', ch_craft_types: 'Craft Type Breakdown 2023 (%)',
    ch_pop: 'Population Growth (millions)', ch_age: 'Age Groups (%)', ch_urban: 'Urban vs Rural (%)',
    ch_trade_balance: 'Exports, Imports & Trade Balance (MTND)',
    ch_trade_partners: 'Top Export Partners 2023 (%)',
    ch_coverage: 'Trade Coverage Rate (%)',
    label_exports: 'Exports', label_imports: 'Imports', label_balance: 'Trade Balance',
    label_coverage: 'Coverage Rate (%)',
    export: 'Export',
    preview: 'Data Preview',
    print: 'Print',
    history_title: 'Recent History',
    no_history: 'No history found',
    clear_history: 'Clear All',
    cookie_title: 'We respect your privacy',
    cookie_desc: 'We use cookies and Google Analytics to improve your experience on our portal.',
    cookie_accept: 'Accept',
    cookie_reject: 'Reject',
    random_title: 'Random Figures & Inspiring Insights',
    random_sub: 'Discover economic facts through random indicators from the INS',
    refresh: 'Refresh',
    loading: 'Loading data...',
    did_you_know: 'Did you know?',
    tab_request: 'Data Request',
    request_title: 'Custom Data Request',
    request_sub: 'Select sector, indicator, and years to fetch live data from the INS.',
    label_domain: 'Economic Sector',
    label_indicator: 'Requested Indicator',
    label_years: 'Time Period',
    btn_fetch: 'Fetch Data',
  }
};

/* ─── 2. State ────────────────────────────────────────────── */
let lang = 'ar'; // 'ar' | 'fr' | 'en'
let currentSection = 'agriculture';
const chartInstances = {};

/* ─── 3. Chart defaults ───────────────────────────────────── */
const CHART_COLORS = {
  red:    '#dc0a26', redAlpha:  'rgba(220,10,38,0.15)',
  gold:   '#f5a623', goldAlpha: 'rgba(245,166,35,0.15)',
  blue:   '#3b82f6', blueAlpha: 'rgba(59,130,246,0.15)',
  green:  '#22c55e', greenAlpha:'rgba(34,197,94,0.15)',
  purple: '#a855f7', purpleAlpha:'rgba(168,85,247,0.15)',
  orange: '#f97316',
  pie: ['#dc0a26','#f5a623','#3b82f6','#22c55e','#a855f7','#f97316'],
};

Chart.defaults.color = '#7a8ba5';
Chart.defaults.font.family = "'Tajawal', sans-serif";

function lineOptions(label, color, alpha) {
  return {
    type: 'line',
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0d1826', borderColor: color, borderWidth: 1 } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { maxRotation: 45, font: { size: 11 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, beginAtZero: false }
      }
    },
    datasetConfig: (data, lbl) => ({
      label: lbl,
      data,
      borderColor: color,
      backgroundColor: alpha,
      borderWidth: 2.5,
      pointBackgroundColor: color,
      pointRadius: 4,
      pointHoverRadius: 7,
      tension: 0.4,
      fill: true,
    })
  };
}

function barOptions(color, alpha) {
  return {
    type: 'bar',
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0d1826', borderColor: color, borderWidth: 1 } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 10 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, beginAtZero: true }
      }
    },
    datasetConfig: (data, lbl) => ({
      label: lbl,
      data,
      backgroundColor: color,
      borderRadius: 6,
      hoverBackgroundColor: alpha,
    })
  };
}

function doughnutOptions() {
  return {
    type: 'doughnut',
    options: {
      responsive: true,
      cutout: '60%',
      plugins: {
        legend: { position: 'right', labels: { font: { size: 11 }, color: '#7a8ba5', padding: 12 } },
        tooltip: { backgroundColor: '#0d1826', borderColor: '#f5a623', borderWidth: 1 }
      }
    },
    datasetConfig: (data) => ({ data, backgroundColor: CHART_COLORS.pie, borderWidth: 2, borderColor: '#0d1826', hoverOffset: 8 })
  };
}

/* ─── 4. Build / destroy chart ────────────────────────────── */
function buildChart(canvasId, type, labels, datasets, options) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  if (chartInstances[canvasId]) chartInstances[canvasId].destroy();
  chartInstances[canvasId] = new Chart(canvas, { type, data: { labels, datasets }, options });
}

/* ─── 5. Data loaders ─────────────────────────────────────── */
async function loadJSON(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error('Failed to load ' + path);
  return r.json();
}

/* ─── 6. Render sections ──────────────────────────────────── */
async function renderAgriculture(data) {
  // KPIs
  renderKPIs('kpis-agriculture', data.kpis, lang);

  const T = i18n[lang];
  const years = data.cereals.years.map(String);

  // Cereals – bar
  buildChart('chart-ag-cereals', 'bar',
    years,
    [barOptions(CHART_COLORS.gold, CHART_COLORS.goldAlpha).datasetConfig(data.cereals.values, T.ch_cereals)],
    barOptions(CHART_COLORS.gold, CHART_COLORS.goldAlpha).options
  );
  // Olive oil – line
  buildChart('chart-ag-olive', 'line',
    years,
    [lineOptions(null, CHART_COLORS.green, CHART_COLORS.greenAlpha).datasetConfig(data.olive_oil.values, T.ch_olive)],
    lineOptions(null, CHART_COLORS.green, CHART_COLORS.greenAlpha).options
  );
  // Dates – line
  buildChart('chart-ag-dates', 'line',
    years,
    [lineOptions(null, CHART_COLORS.gold, CHART_COLORS.goldAlpha).datasetConfig(data.dates.values, T.ch_dates)],
    lineOptions(null, CHART_COLORS.gold, CHART_COLORS.goldAlpha).options
  );
  // Fishing – bar
  buildChart('chart-ag-fish', 'bar',
    years,
    [barOptions(CHART_COLORS.blue, CHART_COLORS.blueAlpha).datasetConfig(data.fishing.values, T.ch_fish)],
    barOptions(CHART_COLORS.blue, CHART_COLORS.blueAlpha).options
  );
}

async function renderTourism(data) {
  renderKPIs('kpis-tourism', data.kpis, lang);
  const T = i18n[lang];
  const years = data.arrivals.years.map(String);

  buildChart('chart-tour-arrivals', 'line',
    years,
    [lineOptions(null, CHART_COLORS.blue, CHART_COLORS.blueAlpha).datasetConfig(data.arrivals.values, T.ch_arrivals)],
    lineOptions(null, CHART_COLORS.blue, CHART_COLORS.blueAlpha).options
  );
  buildChart('chart-tour-receipts', 'bar',
    years,
    [barOptions(CHART_COLORS.gold, CHART_COLORS.goldAlpha).datasetConfig(data.receipts.values, T.ch_receipts)],
    barOptions(CHART_COLORS.gold, CHART_COLORS.goldAlpha).options
  );
}

async function renderIndustry(data) {
  renderKPIs('kpis-industry', data.kpis, lang);
  const T = i18n[lang];
  const years = data.production_index.years.map(String);

  buildChart('chart-ind-index', 'line',
    years,
    [lineOptions(null, CHART_COLORS.gold, CHART_COLORS.goldAlpha).datasetConfig(data.production_index.values, T.ch_prod_index)],
    lineOptions(null, CHART_COLORS.gold, CHART_COLORS.goldAlpha).options
  );

  const sectorLabels = lang === 'ar' ? data.sectors.labels_ar
                     : lang === 'en' ? (data.sectors.labels_en || data.sectors.labels_fr)
                     : data.sectors.labels_fr;
  const dOpts = doughnutOptions();
  buildChart('chart-ind-sectors', 'doughnut',
    sectorLabels,
    [dOpts.datasetConfig(data.sectors.values)],
    dOpts.options
  );
}

async function renderTraditional(data) {
  renderKPIs('kpis-traditional', data.kpis, lang);
  const T = i18n[lang];
  const years = data.exports.years.map(String);

  buildChart('chart-trad-exports', 'bar',
    years,
    [barOptions(CHART_COLORS.purple, CHART_COLORS.purpleAlpha).datasetConfig(data.exports.values, T.ch_craft_exports)],
    barOptions(CHART_COLORS.purple, CHART_COLORS.purpleAlpha).options
  );

  const craftLabels = lang === 'ar' ? data.crafts_categories.labels_ar
                    : lang === 'en' ? (data.crafts_categories.labels_en || data.crafts_categories.labels_fr)
                    : data.crafts_categories.labels_fr;
  const dOpts = doughnutOptions();
  buildChart('chart-trad-types', 'doughnut',
    craftLabels,
    [dOpts.datasetConfig(data.crafts_categories.values)],
    dOpts.options
  );
}

/* ─── 7. Render Demographics ────────────────────────────────── */
async function renderDemographics(data) {
  renderKPIs('kpi-demographics', data.kpis, lang);
  const T = i18n[lang];
  const years = data.population.years.map(String);

  buildChart('chart-demog-pop', 'line',
    years,
    [lineOptions(null, CHART_COLORS.red, CHART_COLORS.redAlpha).datasetConfig(data.population.values, T.ch_pop)],
    lineOptions(null, CHART_COLORS.red, CHART_COLORS.redAlpha).options
  );

  const ageLabels = lang === 'ar' ? data.age_groups.labels_ar
                  : lang === 'en' ? (data.age_groups.labels_en || data.age_groups.labels_fr)
                  : data.age_groups.labels_fr;
  const dOpts = doughnutOptions();
  buildChart('chart-demog-age', 'doughnut',
    ageLabels,
    [dOpts.datasetConfig(data.age_groups.values)],
    dOpts.options
  );

  const urbanLabels = lang === 'ar' ? data.urban_rural.labels_ar
                    : lang === 'en' ? (data.urban_rural.labels_en || data.urban_rural.labels_fr)
                    : data.urban_rural.labels_fr;
  const urbanOpts = doughnutOptions();
  buildChart('chart-demog-urban', 'doughnut',
    urbanLabels,
    [{
      data: data.urban_rural.values,
      backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(34, 197, 94, 0.8)'],
      borderColor: ['#3b82f6', '#22c55e'],
      borderWidth: 1,
      hoverOffset: 4
    }],
    urbanOpts.options
  );
}

/* ─── 8. Render Trade ─────────────────────────────────────── */
async function renderTrade(data) {
  renderKPIs('kpis-trade', data.kpis, lang);
  const T = i18n[lang];
  const years = data.exports.years.map(String);

  // Stacked / grouped bar for exports + imports + balance line
  if (chartInstances['chart-trade-balance']) chartInstances['chart-trade-balance'].destroy();
  const canvas = document.getElementById('chart-trade-balance');
  if (canvas) {
    chartInstances['chart-trade-balance'] = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: years,
        datasets: [
          { label: T.label_exports, data: data.exports.values, backgroundColor: CHART_COLORS.green, borderRadius: 4, order: 2 },
          { label: T.label_imports, data: data.imports.values, backgroundColor: CHART_COLORS.red, borderRadius: 4, order: 2 },
          {
            label: T.label_balance, data: data.balance.values,
            type: 'line', borderColor: CHART_COLORS.gold, backgroundColor: 'transparent',
            borderWidth: 2.5, pointRadius: 4, tension: 0.4, order: 1,
            yAxisID: 'y'
          }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { color: '#7a8ba5', font: { size: 11 } } },
          tooltip: { backgroundColor: '#0d1826', borderColor: CHART_COLORS.gold, borderWidth: 1 }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 10 }, maxRotation: 45 } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' } }
        }
      }
    });
  }

  // Partners doughnut
  const partnerLabels = lang === 'ar' ? data.partners_export.labels_ar
                      : lang === 'en' ? (data.partners_export.labels_en || data.partners_export.labels_fr)
                      : data.partners_export.labels_fr;
  const dOpts = doughnutOptions();
  buildChart('chart-trade-partners', 'doughnut',
    partnerLabels,
    [dOpts.datasetConfig(data.partners_export.values)],
    dOpts.options
  );

  // Coverage rate line
  buildChart('chart-trade-coverage', 'line',
    years,
    [lineOptions(null, CHART_COLORS.blue, CHART_COLORS.blueAlpha).datasetConfig(data.coverage_rate.values, T.label_coverage)],
    { ...lineOptions(null, CHART_COLORS.blue, CHART_COLORS.blueAlpha).options, plugins: { legend: { display: false }, tooltip: { backgroundColor: '#0d1826', borderColor: CHART_COLORS.blue, borderWidth: 1 } } }
  );
}

/* ─── 7. Render KPIs ──────────────────────────────────────── */
function renderKPIs(containerId, kpis, currentLang) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-icon">${k.icon}</div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-label">${currentLang === 'ar' ? k.label_ar : currentLang === 'en' ? (k.label_en || k.label_fr) : k.label_fr}</div>
    </div>
  `).join('');
}

/* ─── 8. Section switch ───────────────────────────────────── */
const sectionData = {};

async function switchSection(sectionId) {
  currentSection = sectionId;

  // Track section navigation
  Analytics.track('section_view', { section_name: sectionId, language: lang });

  // Update active tab
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.section === sectionId));
  document.querySelectorAll('.mobile-nav-item').forEach(t => t.classList.toggle('active', t.dataset.section === sectionId));
  document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === 'section-' + sectionId));

  // Update mobile btn label
  const activeTab = document.querySelector(`.nav-tab[data-section="${sectionId}"]`);
  if (activeTab) document.getElementById('mobile-nav-btn').textContent = activeTab.textContent.trim();

  // Load & render if not already cached
  if (!sectionData[sectionId]) {
    sectionData[sectionId] = await loadJSON(`data/${sectionId === 'trade' ? 'trade' : sectionId}.json`);
  }

  applyTranslations();

  const d = sectionData[sectionId];
  if (sectionId === 'agriculture')  await renderAgriculture(d);
  if (sectionId === 'tourism')      await renderTourism(d);
  if (sectionId === 'industry')     await renderIndustry(d);
  if (sectionId === 'traditional')  await renderTraditional(d);
  if (sectionId === 'demographics') await renderDemographics(d);
  if (sectionId === 'trade')        await renderTrade(d);
}

/* ─── 9. Language toggle ──────────────────────────────────── */
function applyTranslations() {
  const T = i18n[lang];
  document.querySelectorAll('[data-key]').forEach(el => {
    const key = el.dataset.key;
    if (T[key] !== undefined) el.innerHTML = T[key];
  });
  document.getElementById('logo-text').textContent = T.logo;
  // English and French are both LTR; only Arabic is RTL
  document.body.classList.toggle('rtl', lang === 'ar');
  document.documentElement.lang = lang;
  // Button shows the NEXT language in the cycle: AR → FR → EN → AR
  const nextLangLabel = lang === 'ar' ? 'FR' : lang === 'fr' ? 'EN' : 'AR';
  document.getElementById('lang-btn').textContent = nextLangLabel;
}

/* ─── 10. Agriculture chart sub-tabs ─────────────────────── */
function initChartTabs() {
  document.querySelectorAll('.chart-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const chartId = btn.dataset.chart;
      // Find parent section
      const section = btn.closest('.section');
      section.querySelectorAll('.chart-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Show/hide chart cards in agriculture
      ['ag-cereals','ag-olive','ag-dates','ag-fish'].forEach(id => {
        const card = document.getElementById(id);
        if (card) card.style.display = id === chartId ? '' : 'none';
      });
    });
  });
}

/* ─── 11. Mobile & Export nav ─────────────────────────────── */
function initMobileNav() {
  const btn = document.getElementById('mobile-nav-btn');
  const menu = document.getElementById('mobile-nav-menu');
  if (btn) btn.addEventListener('click', (e) => { e.stopPropagation(); menu.classList.toggle('open'); });
  
  const exportBtn = document.getElementById('export-btn');
  const exportMenu = document.getElementById('export-menu');
  if (exportBtn) exportBtn.addEventListener('click', (e) => { e.stopPropagation(); exportMenu.classList.toggle('open'); });

  document.addEventListener('click', () => {
    if (menu) menu.classList.remove('open');
    if (exportMenu) exportMenu.classList.remove('open');
  });

  if (menu) {
    menu.querySelectorAll('.mobile-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        menu.classList.remove('open');
        switchSection(item.dataset.section);
      });
    });
  }

  if (exportMenu) {
    exportMenu.querySelectorAll('.export-item').forEach(item => {
      item.addEventListener('click', () => {
        const format = item.dataset.format;
        const currentData = sectionData[currentSection];

        if (format === 'preview') {
          Analytics.track('preview_open', { section: currentSection, language: lang });
          showPreviewModal(currentSection, currentData, lang);
        } else if (format === 'print') {
          Analytics.track('export', { format: 'print', section: currentSection });
          Exporter.printData(currentSection, currentData, lang);
        } else {
          Analytics.track('export', { format, section: currentSection, language: lang });
          Exporter.exportData(format, currentSection, currentData, lang);
        }
        exportMenu.classList.remove('open');
      });
    });
  }

  // Modal logic
  const modal = document.getElementById('preview-modal');
  const closeBtn = document.getElementById('close-modal');
  if (closeBtn) {
    closeBtn.onclick = () => modal.style.display = 'none';
  }
  window.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
  };

  // History button
  const historyBtn = document.getElementById('history-btn');
  if (historyBtn) {
    historyBtn.onclick = () => showHistory(lang);
  }

  // Clear History button
  const clearHistoryBtn = document.getElementById('clear-history-btn');
  if (clearHistoryBtn) {
    clearHistoryBtn.onclick = () => {
      if (confirm(lang === 'ar' ? 'هل أنت متأكد من حذف السجل؟' : lang === 'en' ? 'Clear all history?' : 'Effacer tout l\'historique ?')) {
        CacheManager.clearHistory();
        showHistory(lang);
      }
    };
  }
}

function showPreviewModal(sectionId, data, lang, skipCache = false) {
  const modal = document.getElementById('preview-modal');
  const body = document.getElementById('modal-body');
  const title = document.getElementById('modal-title');
  const downloadBtn = document.getElementById('download-preview-btn');
  const historySec = document.getElementById('history-section');

  historySec.style.display = 'none'; // Hide history section in preview mode
  const previewPrefix = lang === 'ar' ? 'معاينة: ' : lang === 'en' ? 'Preview: ' : 'Aperçu: ';
  title.textContent = previewPrefix + sectionId.toUpperCase();
  body.innerHTML = Exporter.getPreviewHTML(sectionId, data, lang);
  
  // Save to history if not viewing from history already
  if (!skipCache) {
    CacheManager.saveToHistory(sectionId, data, lang);
  }

  // Default to JSON for the modal download button for now
  downloadBtn.onclick = () => {
    Exporter.exportData('json', sectionId, data, lang);
    modal.style.display = 'none';
  };

  modal.style.display = 'block';
}

function showHistory(lang) {
  const modal = document.getElementById('preview-modal');
  const body = document.getElementById('modal-body');
  const title = document.getElementById('modal-title');
  const historySec = document.getElementById('history-section');
  const historyList = document.getElementById('history-list');
  const downloadBtn = document.getElementById('download-preview-btn');

  title.textContent = lang === 'ar' ? 'السجلات السابقة' : lang === 'en' ? 'Recent History' : 'Historique Recent';
  body.innerHTML = '';
  historySec.style.display = 'block';
  downloadBtn.style.display = 'none';

  const history = CacheManager.getHistory();
  if (history.length === 0) {
    historyList.innerHTML = `<p style="text-align:center; padding:2rem; color:var(--text-muted)">${lang === 'ar' ? 'لا يوجد سجلات' : 'No history found'}</p>`;
  } else {
    historyList.innerHTML = history.map(item => `
      <div class="history-item" onclick="viewHistoryItem(${item.id})">
        <div class="info">
          <span class="title">${item.label}</span>
          <span class="time">${new Date(item.timestamp).toLocaleString(lang === 'ar' ? 'ar-TN' : lang === 'en' ? 'en-GB' : 'fr-TN')}</span>
        </div>
        <div class="actions">
           <button class="download-btn" style="padding: 0.3rem 0.8rem; font-size: 0.75rem;">🔍</button>
        </div>
      </div>
    `).join('');
  }

  modal.style.display = 'block';

  // Make viewHistoryItem global for onclick
  window.viewHistoryItem = (id) => {
    const item = CacheManager.getHistory().find(h => h.id === id);
    if (item) {
      showPreviewModal(item.sectionId, item.data, item.lang, true);
      downloadBtn.style.display = 'inline-block';
    }
  };
}

/* ─── 9. Random Insights ──────────────────────────────────── */
const RANDOM_CONFIG = {
  "11921516": { ar: "معدل نمو الناتج المحلي الإجمالي", fr: "Taux de croissance du PIB", en: "GDP Growth Rate", suffix: "%", factor: 1 },
  "22911016": { ar: "عدد السكان التقديري", fr: "Population estimée", en: "Estimated Population", suffix: "M", factor: 1000000 },
  "64110016": { ar: "عدد الوافدين السياحيين", fr: "Arrivées touristiques", en: "Tourist Arrivals", suffix: "M", factor: 1000000 },
  "41100016": { ar: "مؤشر الإنتاج الصناعي", fr: "Indice de production industrielle", en: "Industrial Production Index", suffix: "", factor: 1 },
  "31121016": { ar: "إنتاج زيت الزيتون", fr: "Production d'huile d'olive", en: "Olive Oil Production", suffix: "kT", factor: 1 }
};

async function fetchRandomInsight() {
  const container = document.getElementById('random-insight-card');
  if (!container) return;
  
  container.innerHTML = `<div class="loading-insight">${i18n[lang].loading}</div>`;
  
  const ids = Object.keys(RANDOM_CONFIG);
  const randomId = ids[Math.floor(Math.random() * ids.length)];
  const config = RANDOM_CONFIG[randomId];
  
  // Custom XML Query for the proxy
  const queryXml = `<QueryMessage SourceId='C_NSO'>
   <Period>
      <Year>2018</Year><Year>2019</Year><Year>2020</Year><Year>2021</Year><Year>2022</Year><Year>2023</Year>
   </Period>
   <Pools>
      <Pool Id='P1'>
         <Indicator>
            <Element>${randomId}</Element>
         </Indicator>
         <Region>
            <Element>0</Element>
         </Region>
      </Pool>
   </Pools>
</QueryMessage>`;

  try {
    const res = await fetch('/api/ins', {
      method: 'POST',
      headers: { 'Content-Type': 'text/xml' },
      body: queryXml
    });
    
    const xmlText = await res.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Simplistic parsing of the INS response
    const observations = Array.from(xmlDoc.getElementsByTagName('Observation'));
    if (observations.length === 0) throw new Error("No data found");
    
    const years = observations.map(obs => obs.getAttribute('Year'));
    const values = observations.map(obs => parseFloat(obs.getAttribute('Value')));
    
    renderRandomInsight(randomId, years, values);
  } catch (err) {
    console.error("Random Insight Error:", err);
    container.innerHTML = `<div style="color:var(--red)">Failed to load data. Please try again.</div>`;
  }
}

function renderRandomInsight(id, years, values) {
  const container = document.getElementById('random-insight-card');
  const config = RANDOM_CONFIG[id];
  const lastVal = values[values.length - 1];
  const lastYear = years[years.length - 1];
  
  // Format value
  let displayVal = lastVal;
  if (config.factor > 1) displayVal = (lastVal / config.factor).toFixed(1);
  else displayVal = lastVal.toLocaleString();
  
  const title = i18n[lang].did_you_know;
  const label = config[lang];
  
  container.innerHTML = `
    <div class="insight-card">
      <div class="insight-content">
        <h3 class="animate-pulse">${title}</h3>
        <div class="value-large">${displayVal}${config.suffix}</div>
        <div class="description">${label} (${lastYear})</div>
      </div>
      <div class="insight-chart">
        <canvas id="canvas-random-insight"></canvas>
      </div>
    </div>
  `;
  
  // Render small chart
  const ctx = document.getElementById('canvas-random-insight').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        data: values,
        borderColor: CHART_COLORS.gold,
        backgroundColor: CHART_COLORS.goldAlpha,
        fill: true,
        tension: 0.4,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  });
}

function initRandomInsights() {
  const refreshBtn = document.getElementById('refresh-random');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      Analytics.track('refresh_random_insight');
      fetchRandomInsight();
    });
  }
  fetchRandomInsight();
}

/* ─── 10. Custom Data Request ────────────────────────────── */
const DOMAIN_INDICATORS = {
  agriculture: [
    { id: "31110116", ar: "إنتاج الحبوب", fr: "Production de céréales", en: "Cereal Production" },
    { id: "31121016", ar: "إنتاج زيت الزيتون", fr: "Production d'huile d'olive", en: "Olive Oil Production" },
    { id: "31122016", ar: "إنتاج التمور", fr: "Production de dattes", en: "Date Production" }
  ],
  tourism: [
    { id: "64110016", ar: "الوافدون السياحيون", fr: "Arrivées touristiques", en: "Tourist Arrivals" },
    { id: "64130016", ar: "عائدات السياحة", fr: "Recettes touristiques", en: "Tourism Receipts" }
  ],
  industry: [
    { id: "41100016", ar: "مؤشر الإنتاج الصناعي", fr: "Indice de production industrielle", en: "Industrial Index" }
  ],
  demographics: [
    { id: "22911016", ar: "عدد السكان", fr: "Population", en: "Population" }
  ],
  trade: [
    { id: "52110016", ar: "الصادرات (F.O.B)", fr: "Exportations (FOB)", en: "Exports (FOB)" },
    { id: "52120016", ar: "الواردات (C.I.F)", fr: "Importations (CAF)", en: "Imports (CIF)" }
  ]
};

function initRequestPage() {
  const domainSelect = document.getElementById('request-domain');
  const indicatorSelect = document.getElementById('request-indicator');
  const submitBtn = document.getElementById('submit-request');

  if (!domainSelect || !indicatorSelect) return;

  const updateIndicators = () => {
    const domain = domainSelect.value;
    const indicators = DOMAIN_INDICATORS[domain] || [];
    indicatorSelect.innerHTML = indicators.map(ind => 
      `<option value="${ind.id}">${lang === 'ar' ? ind.ar : lang === 'en' ? ind.en : ind.fr}</option>`
    ).join('');
  };

  domainSelect.addEventListener('change', updateIndicators);
  updateIndicators();

  submitBtn.addEventListener('click', async () => {
    const indicatorId = indicatorSelect.value;
    const yearFrom = parseInt(document.getElementById('request-year-from').value);
    const yearTo = parseInt(document.getElementById('request-year-to').value);
    
    if (yearTo < yearFrom) {
       alert(lang === 'ar' ? 'سنة النهاية يجب أن تكون أكبر من سنة البداية' : 'End year must be >= start year');
       return;
    }

    const loader = document.getElementById('request-loader');
    const results = document.getElementById('request-results');
    loader.style.display = 'block';
    results.style.display = 'none';

    // Build years array
    const yearsArr = [];
    for(let y=yearFrom; y<=yearTo; y++) yearsArr.push(y);

    const queryXml = `<QueryMessage SourceId='C_NSO'>
   <Period>
      ${yearsArr.map(y => `<Year>${y}</Year>`).join('')}
   </Period>
   <Pools>
      <Pool Id='P1'>
         <Indicator><Element>${indicatorId}</Element></Indicator>
         <Region><Element>0</Element></Region>
      </Pool>
   </Pools>
</QueryMessage>`;

    try {
      const res = await fetch('/api/ins', {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml' },
        body: queryXml
      });
      
      const xmlText = await res.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      const observations = Array.from(xmlDoc.getElementsByTagName('Observation'));
      
      if (observations.length === 0) throw new Error("No data");

      const yearsArrOut = observations.map(obs => obs.getAttribute('Year'));
      const valuesArrOut = observations.map(obs => parseFloat(obs.getAttribute('Value')));
      
      renderRequestResults(indicatorSelect.options[indicatorSelect.selectedIndex].text, yearsArrOut, valuesArrOut);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      loader.style.display = 'none';
    }
  });
}

function renderRequestResults(title, years, values) {
  const results = document.getElementById('request-results');
  results.style.display = 'block';
  document.getElementById('request-chart-title').textContent = title;

  const canvas = document.getElementById('chart-request-result');
  if (chartInstances['chart-request-result']) chartInstances['chart-request-result'].destroy();
  
  chartInstances['chart-request-result'] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: years,
      datasets: [{
        label: title,
        data: values,
        backgroundColor: CHART_COLORS.blue,
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: false, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { grid: { display: false } }
      }
    }
  });

  // Table
  const tableContainer = document.getElementById('request-table-container');
  tableContainer.innerHTML = `
    <table class="preview-table">
      <thead>
        <tr>
          <th>${lang === 'ar' ? 'السنة' : 'Year'}</th>
          <th>${lang === 'ar' ? 'القيمة' : 'Value'}</th>
        </tr>
      </thead>
      <tbody>
        ${years.map((y, i) => `<tr><td>${y}</td><td>${values[i].toLocaleString()}</td></tr>`).join('')}
      </tbody>
    </table>
  `;
}

/* ─── 11. AI Assistant Logic ─────────────────────────────── */
let aiHistory = [];

function initAI() {
  const toggle = document.getElementById('ai-toggle');
  const panel = document.getElementById('ai-panel');
  const close = document.getElementById('ai-close');
  const sendBtn = document.getElementById('ai-send');
  const input = document.getElementById('ai-input');
  const tabs = document.querySelectorAll('.ai-tab');

  if (!toggle) return;

  toggle.addEventListener('click', () => panel.classList.toggle('show'));
  close.addEventListener('click', () => panel.classList.remove('show'));

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.ai-tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(`ai-tab-${tab.dataset.tab}`).classList.add('active');
      
      if (tab.dataset.tab === 'research' && aiHistory.length > 0) {
        performResearch(aiHistory[aiHistory.length - 1].content);
      }
    });
  });

  const sendMessage = async () => {
    const text = input.value.trim();
    if (!text) return;

    appendMsg('user', text);
    input.value = '';
    
    // Loading state
    const botMsgDiv = appendMsg('bot', '...', true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: aiHistory.slice(-5), // Last 5 msgs
          context: { section: currentSection, data: sectionData[currentSection] }
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Parse bot response for [CHART] command
      let botText = data.text;
      const chartMatch = botText.match(/\[CHART\]\s*(\{.*?\})/s);
      
      if (chartMatch) {
         try {
           const chartConfig = JSON.parse(chartMatch[1]);
           renderAICart(chartConfig);
           botText = botText.replace(chartMatch[0], '(Generated a chart in the "Data Viz" tab)');
         } catch(e) { console.error("AI Chart Parse Error", e); }
      }

      botMsgDiv.innerHTML = `<p>${botText}</p>`;
      aiHistory.push({ role: 'assistant', content: botText });
    } catch (err) {
      botMsgDiv.innerHTML = `<p style="color:var(--red)">${err.message}</p>`;
    }
  };

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMessage(); });
}

function appendMsg(role, text, isWaiting = false) {
  const historyDiv = document.getElementById('ai-chat-history');
  const div = document.createElement('div');
  div.className = `ai-msg ${role}`;
  div.innerHTML = `<p>${text}</p>`;
  historyDiv.appendChild(div);
  historyDiv.scrollTop = historyDiv.scrollHeight;
  
  if (role === 'user') aiHistory.push({ role: 'user', content: text });
  return div;
}

async function performResearch(query) {
  const container = document.getElementById('ai-research-results');
  const status = document.querySelector('.research-status');
  status.style.display = 'block';
  container.innerHTML = '';

  try {
    const res = await fetch(`/api/research?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    
    container.innerHTML = data.results.map(r => `
      <div class="history-item">
        <div class="info">
          <span class="title">${r.title}</span>
          <span class="description" style="font-size: 0.7rem">${r.snippet}</span>
        </div>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = "Web research failed.";
  } finally {
    status.style.display = 'none';
  }
}

function renderAICart(config) {
  // Switch to viz tab
  document.querySelector('[data-tab="viz"]').click();
  const canvas = document.getElementById('ai-viz-canvas');
  const ctx = canvas.getContext('2d');
  
  if (chartInstances['ai-viz']) chartInstances['ai-viz'].destroy();

  chartInstances['ai-viz'] = new Chart(ctx, {
    type: config.type || 'line',
    data: {
      labels: config.labels,
      datasets: [{
        label: config.label || 'AI Analysis',
        data: config.data,
        borderColor: CHART_COLORS.gold,
        backgroundColor: CHART_COLORS.goldAlpha,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true, labels: { color: 'white' } } },
      scales: {
        y: { ticks: { color: 'rgba(255,255,255,0.5)' } },
        x: { ticks: { color: 'rgba(255,255,255,0.5)' } }
      }
    }
  });
  
  document.getElementById('ai-viz-desc').textContent = config.label || "AI Visualization";
}

/* ─── 13. Admin & Persistence ────────────────────────────── */
let adminToken = sessionStorage.getItem('ins_admin_token');
let remoteSettings = { overrides: {}, config: {} };

async function loadRemoteSettings() {
  try {
    const res = await fetch('/api/settings');
    remoteSettings = await res.json();
    
    // Merge overrides into i18n
    for (const langKey in remoteSettings.overrides) {
      if (i18n[langKey]) {
        Object.assign(i18n[langKey], remoteSettings.overrides[langKey]);
      }
    }
    
    // Apply global configs
    if (remoteSettings.config.aiEnabled === false) {
       document.getElementById('ai-toggle').style.display = 'none';
    }
  } catch(e) { console.error("Settings load failed", e); }
}

function initAdminPanel() {
  const trigger = document.getElementById('trigger-admin');
  const loginModal = document.getElementById('admin-login-modal');
  const passInput = document.getElementById('admin-password');
  const btnLogin = document.getElementById('btn-do-login');

  if (!trigger) return;

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    if (adminToken) switchSection('admin');
    else loginModal.style.display = 'block';
  });

  btnLogin.addEventListener('click', async () => {
    const res = await fetch('/api/admin/login', {
       method: 'POST',
       headers: {'Content-Type': 'application/json'},
       body: JSON.stringify({ password: passInput.value })
    });
    const data = await res.json();
    if (data.success) {
       adminToken = data.token;
       sessionStorage.setItem('ins_admin_token', adminToken);
       loginModal.style.display = 'none';
       switchSection('admin');
       renderTagManager();
    } else {
       alert("Invalid credentials");
    }
  });

  document.getElementById('btn-save-settings').addEventListener('click', saveAdminSettings);
}

function renderTagManager() {
  const container = document.getElementById('tag-editor-list');
  const search = document.getElementById('tag-search-input').value.toLowerCase();
  
  // Get all unique keys from i18n
  const keys = Object.keys(i18n.ar); 
  
  container.innerHTML = keys.filter(k => k.includes(search) || i18n.ar[k].toLowerCase().includes(search))
    .map(key => `
      <div class="tag-row">
        <span class="key">${key}</span>
        <div class="tag-inputs">
          <input type="text" value="${i18n.ar[key]}" placeholder="AR" onchange="updateTag('${key}', 'ar', this.value)">
          <input type="text" value="${i18n.fr[key]}" placeholder="FR" onchange="updateTag('${key}', 'fr', this.value)">
          <input type="text" value="${i18n.en[key]}" placeholder="EN" onchange="updateTag('${key}', 'en', this.value)">
        </div>
      </div>
    `).join('');
}

window.updateTag = (key, l, val) => {
  if (!remoteSettings.overrides[l]) remoteSettings.overrides[l] = {};
  remoteSettings.overrides[l][key] = val;
  i18n[l][key] = val; // Live preview
};

async function saveAdminSettings() {
  remoteSettings.config.liveMode = document.getElementById('setting-live-mode').checked;
  remoteSettings.config.aiEnabled = document.getElementById('setting-ai-enabled').checked;

  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Admin-Token': adminToken
    },
    body: JSON.stringify(remoteSettings)
  });
  
  if (res.ok) {
    alert("Saved successfully! Refreshing portal...");
    location.reload();
  } else {
    alert("Saving failed (check session)");
  }
}

/* ─── 12. Init ────────────────────────────────────────────── */
async function init() {
  await loadRemoteSettings();
  
  // ── Cookie Consent Logic ────────────────────────────────────
  const cookieBanner = document.getElementById('cookie-banner');
  const btnAccept = document.getElementById('cookie-accept');
  const btnReject = document.getElementById('cookie-reject');

  const savedConsent = localStorage.getItem('ins_cookie_consent');
  if (!savedConsent && cookieBanner) {
    setTimeout(() => {
      cookieBanner.style.display = 'flex';
      requestAnimationFrame(() => cookieBanner.classList.add('show'));
    }, 1500);
  } else if (savedConsent === 'granted') {
    Analytics.trackConsent('granted');
  }

  const handleConsent = (status) => {
    localStorage.setItem('ins_cookie_consent', status);
    if (cookieBanner) {
      cookieBanner.classList.remove('show');
      setTimeout(() => { cookieBanner.style.display = 'none'; }, 600);
    }
    Analytics.trackConsent(status);
  };

  if (btnAccept) btnAccept.addEventListener('click', () => handleConsent('granted'));
  if (btnReject) btnReject.addEventListener('click', () => handleConsent('denied'));

  // Nav tab clicks
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => switchSection(tab.dataset.section));
  });

  // Language toggle — cycles AR → FR → EN → AR
  document.getElementById('lang-btn').addEventListener('click', () => {
    lang = lang === 'ar' ? 'fr' : lang === 'fr' ? 'en' : 'ar';
    // Persist explicit user choice so geo-adapter doesn't override it next time
    sessionStorage.setItem('ins_lang_explicit', lang);
    Analytics.track('language_switch', { new_language: lang });
    applyTranslations();
    // Re-render current section with new lang
    const cached = sectionData[currentSection];
    if (cached) {
      if (currentSection === 'agriculture')  renderAgriculture(cached);
      if (currentSection === 'tourism')      renderTourism(cached);
      if (currentSection === 'industry')     renderIndustry(cached);
      if (currentSection === 'traditional')  renderTraditional(cached);
      if (currentSection === 'demographics') renderDemographics(cached);
      if (currentSection === 'trade')        renderTrade(cached);
    }
  });

  initChartTabs();
  initMobileNav();

  // ── Geo Personalisation ──────────────────────────────────────
  // Run geo detection before first render so the theme + banner
  // are already in place when content appears.
  // Non-blocking: any error is silently caught inside GeoAdapter.
  // If geo suggests a language and the user has NOT set an explicit
  // preference yet, we honour the suggestion (e.g. French for EU visitors).
  try {
    const geoMeta = await GeoAdapter.init(lang);
    if (geoMeta && geoMeta.suggestedLang && !sessionStorage.getItem('ins_lang_explicit')) {
      // Only adopt suggestion if it's different and the visitor isn't Tunisian
      // (Tunisian visitors already default to Arabic which is correct)
      if (geoMeta.suggestedLang !== lang && !geoMeta.isLocal && geoMeta.countryCode !== 'TN') {
        lang = geoMeta.suggestedLang;
      }
    }
    // Enrich all subsequent GA4 events with country/theme dimensions
    Analytics.setGeoContext(geoMeta);
  } catch (_) {
    // GeoAdapter already handles errors internally; this is an extra safety net
  }
  // ────────────────────────────────────────────────────────────

  applyTranslations();
  await switchSection('agriculture');
  initRandomInsights();
  initRequestPage();
  initAI();
  initAdminPanel();
}

document.addEventListener('DOMContentLoaded', init);

