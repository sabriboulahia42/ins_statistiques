/**
 * ins-api.js
 * ──────────────────────────────────────────────────────────────
 * INS Tunisia Data Portal – API Client
 * Source : http://dataportal.ins.tn/en/API
 *
 * The INS API uses a custom XML query format (SDMX-like).
 * Requests are sent via HTTP POST with Content-Type text/xml.
 *
 * ⚠️  CORS NOTE:
 *   The INS server does not send CORS headers, so browser-side
 *   fetch() will be blocked. Use this file in:
 *     • Node.js scripts    → works directly
 *     • A server-side proxy (Express, Next.js API route, etc.)
 *     • Browser DevTools   → may work if the site is same-origin
 * ──────────────────────────────────────────────────────────────
 */

// ── Endpoint ───────────────────────────────────────────────────
/**
 * Use the LOCAL PROXY (proxy.js) to avoid CORS errors.
 * The proxy forwards the request server-side to the real INS API.
 *
 * When running proxy.js:  http://localhost:3000/api/ins
 * Direct (Node.js only):  http://dataportal.ins.tn/{lang}/api/getdata
 */
const PROXY_URL = "http://localhost:3000/api/ins"; // ← change port if needed

// ── Known indicator IDs (RDS_DICT_INDICATORS_NSO) ─────────────
/**
 * These IDs come directly from Request.xml and the INS portal.
 * Add more by inspecting network requests on dataportal.ins.tn.
 */
export const INDICATORS = {
  // Macro-economic
  GDP_CURRENT:          "11920516",
  GDP_GROWTH_RATE:      "11921516",
  GDP_PER_CAPITA:       "11920616",
  POPULATION:           "22911016",

  // Agriculture (examples – verify on the portal)
  CEREAL_PRODUCTION:    "31110116",
  OLIVE_OIL_PRODUCTION: "31121016",
  DATE_PRODUCTION:      "31122016",
  FISHING_PRODUCTION:   "31410016",

  // Tourism
  TOURIST_ARRIVALS:     "64110016",
  HOTEL_NIGHTS:         "64120016",
  TOURISM_RECEIPTS:     "64130016",

  // Industry
  INDUSTRIAL_PROD_IDX:  "41100016",

  // External trade
  EXPORTS_FOB:          "52110016",
  IMPORTS_CIF:          "52120016",
};

// Region codes (RDS_DICT_REGIONS_NSO)
export const REGIONS = {
  NATIONAL: "0",   // Whole country
  TUNIS:    "1",
  SOUSSE:   "5",
  SFAX:     "8",
};

// ── Query builder ──────────────────────────────────────────────

/**
 * Build the XML body exactly as the INS portal expects it,
 * matching the structure in Request.xml.
 *
 * @param {object} options
 * @param {string[]}  options.indicators  - Array of indicator element IDs
 * @param {string[]}  options.regions     - Array of region element IDs (default: ["0"] = national)
 * @param {number}    options.yearFrom    - First year (inclusive)
 * @param {number}    options.yearTo      - Last year  (inclusive)
 * @returns {string}  XML string ready to POST
 */
export function buildQueryXML({ indicators, regions = ["0"], yearFrom = 2000, yearTo = 2023 }) {
  // Year list
  const yearTags = [];
  for (let y = yearFrom; y <= yearTo; y++) {
    yearTags.push(`      <Year>${y}</Year>`);
  }

  // Indicator elements
  const indicatorTags = indicators
    .map((id) => `         <Element>${id}</Element>`)
    .join("\n");

  // Region elements
  const regionTags = regions
    .map((id) => `         <Element>${id}</Element>`)
    .join("\n");

  return `<QueryMessage SourceId='C_NSO'>
   <Period>
${yearTags.join("\n")}
   </Period>
   <DataWhere>
      <Dimension Id='RDS_DICT_INDICATORS_NSO'>
${indicatorTags}
      </Dimension>
      <Dimension Id='RDS_DICT_REGIONS_NSO'>
${regionTags}
      </Dimension>
   </DataWhere>
</QueryMessage>`;
}

// ── Core fetch function ────────────────────────────────────────

/**
 * Send an XML query to the INS API and return the raw XML response text.
 *
 * @param {string} xmlBody    - The XML string from buildQueryXML()
 * @param {string} [lang]     - Language: "en" | "fr" | "ar"  (default "fr")
 * @returns {Promise<string>} Raw XML response from the server
 */
export async function fetchRawXML(xmlBody, lang = "fr") {
  const url = `${INS_BASE_URL}/${lang}/api/getdata`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      Accept: "text/xml, application/xml",
    },
    body: xmlBody,
  });

  if (!response.ok) {
    throw new Error(`INS API error: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

// ── XML → JSON parser ──────────────────────────────────────────

/**
 * Parse the INS XML response into a simple array of observations.
 * The INS response typically looks like:
 *
 *   <DataSet>
 *     <Series>
 *       <SeriesKey>
 *         <Value concept="RDS_DICT_INDICATORS_NSO" value="11920516"/>
 *         <Value concept="RDS_DICT_REGIONS_NSO" value="0"/>
 *       </SeriesKey>
 *       <Obs><Time>2020</Time><ObsValue value="93622"/></Obs>
 *       <Obs><Time>2021</Time><ObsValue value="98150"/></Obs>
 *       ...
 *     </Series>
 *   </DataSet>
 *
 * @param {string} xmlText - Raw XML string from fetchRawXML()
 * @returns {{ indicator: string, region: string, observations: {year: number, value: number}[] }[]}
 */
export function parseResponse(xmlText) {
  const parser = new DOMParser(); // browser; use 'fast-xml-parser' in Node
  const doc = parser.parseFromString(xmlText, "application/xml");

  const series = [...doc.querySelectorAll("Series")];

  return series.map((s) => {
    // Extract dimension values
    const indicator = s.querySelector(
      "SeriesKey Value[concept='RDS_DICT_INDICATORS_NSO']"
    )?.getAttribute("value") ?? "";

    const region = s.querySelector(
      "SeriesKey Value[concept='RDS_DICT_REGIONS_NSO']"
    )?.getAttribute("value") ?? "";

    // Extract observations
    const observations = [...s.querySelectorAll("Obs")].map((obs) => ({
      year: Number(obs.querySelector("Time")?.textContent),
      value: Number(obs.querySelector("ObsValue")?.getAttribute("value")),
    }));

    return { indicator, region, observations };
  });
}

// ── High-level convenience function ───────────────────────────

/**
 * One-shot: build query → fetch → parse → return structured data.
 *
 * @param {object} options - Same as buildQueryXML options
 * @param {string} [lang]  - "en" | "fr" | "ar"
 * @returns {Promise<ReturnType<parseResponse>>}
 *
 * @example
 * import { fetchIndicators, INDICATORS, REGIONS } from "./ins-api.js";
 *
 * const data = await fetchIndicators({
 *   indicators: [INDICATORS.TOURIST_ARRIVALS, INDICATORS.TOURISM_RECEIPTS],
 *   regions: [REGIONS.NATIONAL],
 *   yearFrom: 2010,
 *   yearTo: 2023,
 * });
 *
 * console.log(data);
 * // [
 * //   { indicator: "64110016", region: "0", observations: [{year: 2010, value: 6900000}, ...] },
 * //   { indicator: "64130016", region: "0", observations: [{year: 2010, value: 3065},   ...] },
 * // ]
 */
export async function fetchIndicators(options, lang = "fr") {
  const xml = buildQueryXML(options);
  const rawXML = await fetchRawXML(xml, lang);
  return parseResponse(rawXML);
}

// ── Node.js helper (no DOMParser) ─────────────────────────────
// If you are using this in Node.js, replace parseResponse with this:
//
// import { XMLParser } from "fast-xml-parser";   // npm i fast-xml-parser
// export function parseResponseNode(xmlText) {
//   const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
//   const result = parser.parse(xmlText);
//   const series = [].concat(result?.DataSet?.Series ?? []);
//   return series.map((s) => {
//     const keys = [].concat(s.SeriesKey?.Value ?? []);
//     const indicator = keys.find((v) => v["@_concept"] === "RDS_DICT_INDICATORS_NSO")?.["@_value"] ?? "";
//     const region    = keys.find((v) => v["@_concept"] === "RDS_DICT_REGIONS_NSO")?.["@_value"]    ?? "";
//     const observations = [].concat(s.Obs ?? []).map((o) => ({
//       year: Number(o.Time),
//       value: Number(o.ObsValue?.["@_value"]),
//     }));
//     return { indicator, region, observations };
//   });
// }

// ── Node.js fetch (Node 18+ has fetch built-in) ───────────────
// For older Node, add:  import fetch from "node-fetch";  // npm i node-fetch
