/**
 * backend.js
 * ──────────────────────────────────────────────────────────────
 * Node.js Express server to parse the large INS SDMX XML file
 * ("e426de42-8f6e-4e74-a23f-65a314f8c426.xml") and serve it as
 * a clean JSON API for the React Native mobile app.
 *
 * Install dependencies: npm install express cors fast-xml-parser
 * Run: node backend.js
 * ──────────────────────────────────────────────────────────────
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { XMLParser } = require('fast-xml-parser');

const app = express();
const PORT = 4000;

app.use(cors()); // Allow React Native app to fetch data

// Path to the large XML file provided by the user
const XML_FILE_PATH = path.join(__dirname, 'e426de42-8f6e-4e74-a23f-65a314f8c426.xml');

/**
 * Parses the INS SDMX Structure XML file.
 * Returns an array of "Sources" (datasets) with their dimensions and available periods.
 */
function parseMetadataXML() {
  if (!fs.existsSync(XML_FILE_PATH)) {
    throw new Error('XML file not found at ' + XML_FILE_PATH);
  }

  const xmlData = fs.readFileSync(XML_FILE_PATH, 'utf8');

  // Configure parser to handle attributes (like ID, Name, Key)
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (name) => ['Source', 'Dimension'].indexOf(name) !== -1,
  });

  const parsed = parser.parse(xmlData);

  // Extract the <Source> array containing the dataset definitions
  const sources = parsed?.Structure?.Sources?.Source || [];

  return sources.map(source => {
    // Extract Dimensions (e.g. Regions, Indicators, Age, Gender)
    const rawDimensions = source.Dimensions?.Dimension || [];
    const dimensions = rawDimensions.map(dim => ({
      id: dim['@_Id'],
      name: dim['@_Name'],
      type: dim['@_DimensionType']
    }));

    // Extract time period available
    const period = source.Period || {};

    return {
      id: source['@_Id'],
      key: source['@_Key'],
      name: source['@_Name'],
      description: source.Description || 'No description available.',
      period: {
        start: period.StartYear || null,
        end: period.FinishYear || null
      },
      dimensions: dimensions
    };
  });
}

// ── API ROUTES ────────────────────────────────────────────────

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', source: 'INS Statistics Backend' });
});

// 2. Get all parsed datasets from the XML
app.get('/api/datasets', (req, res) => {
  try {
    const data = parseMetadataXML();
    res.json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (err) {
    console.error('Error parsing XML:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Get single dataset by ID
app.get('/api/datasets/:id', (req, res) => {
  try {
    const data = parseMetadataXML();
    const dataset = data.find(d => d.id === req.params.id);
    if (!dataset) {
      return res.status(404).json({ success: false, error: 'Dataset not found' });
    }
    res.json({ success: true, data: dataset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 [INS Backend] API running on http://localhost:${PORT}`);
  console.log(`   Get all datasets: http://localhost:${PORT}/api/datasets`);
});
