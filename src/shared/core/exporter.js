/**
 * shared/core/exporter.js
 * ──────────────────────────────────────────────────────────────
 * Unified Export Logic for Web, Desktop (Electron), and Mobile (React Native).
 * Handles converting dataset objects to JSON, XML, and PDF formats.
 * ──────────────────────────────────────────────────────────────
 */

const isNative = typeof window === 'undefined';

/**
 * 1. Export as JSON
 * Converts dataset object array to a formatted JSON string.
 */
export const generateJSON = (data) => {
  return JSON.stringify(data, null, 2);
};

/**
 * 2. Export as XML
 * A simple custom XML builder for our dataset format.
 */
export const generateXML = (data) => {
  let xml = '<?xml version="1.0" encoding="utf-8"?>\n<TunisiaStatistics>\n';
  
  data.forEach(dataset => {
    xml += `  <Dataset id="${dataset.id}" name="${escapeXml(dataset.name)}">\n`;
    xml += `    <Description>${escapeXml(dataset.description)}</Description>\n`;
    
    if (dataset.period) {
      xml += `    <Period>\n`;
      xml += `      <StartYear>${dataset.period.start || ''}</StartYear>\n`;
      xml += `      <EndYear>${dataset.period.end || ''}</EndYear>\n`;
      xml += `    </Period>\n`;
    }

    if (dataset.dimensions && dataset.dimensions.length > 0) {
      xml += `    <Dimensions>\n`;
      dataset.dimensions.forEach(dim => {
        xml += `      <Dimension id="${dim.id}" type="${dim.type || ''}">${escapeXml(dim.name)}</Dimension>\n`;
      });
      xml += `    </Dimensions>\n`;
    }
    
    xml += `  </Dataset>\n`;
  });
  
  xml += '</TunisiaStatistics>';
  return xml;
};

/**
 * 3. Export as PDF (Underlying Html Generator)
 */
export const generatePrintableHTML = (data) => {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Tunisia Statistics Report</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; padding: 40px; }
        h1 { color: #dc0a26; text-align: center; border-bottom: 2px solid #dc0a26; padding-bottom: 10px; }
        .dataset { margin-bottom: 30px; page-break-inside: avoid; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; }
        h2 { color: #1e293b; margin-top: 0; }
        .desc { color: #64748b; font-style: italic; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; background: #fff; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
        th { background-color: #f1f5f9; color: #475569; font-weight: 600; }
        .badge { display: inline-block; padding: 4px 8px; background: #e2e8f0; border-radius: 4px; font-size: 12px; margin-right: 5px; }
      </style>
    </head>
    <body>
      <h1>Tunisia Statistics Data Portal</h1>
      <p style="text-align: center; color: #666;">Generated via Unified Cross-Platform Exporter</p>
  `;

  data.forEach(dataset => {
    html += `
      <div class="dataset">
        <h2>${escapeXml(dataset.name)}</h2>
        <p class="desc">${escapeXml(dataset.description)}</p>
        <p><strong>Period:</strong> ${dataset.period?.start || 'N/A'} - ${dataset.period?.end || 'N/A'}</p>
        
        <h3>Dimensions</h3>
        <table>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
          </tr>
    `;

    if (dataset.dimensions && dataset.dimensions.length > 0) {
      dataset.dimensions.forEach(dim => {
        html += `
          <tr>
            <td><code>${dim.id}</code></td>
            <td>${escapeXml(dim.name)}</td>
            <td><span class="badge">${dim.type || 'Standard'}</span></td>
          </tr>
        `;
      });
    } else {
      html += `<tr><td colspan="3">No dimensions available.</td></tr>`;
    }

    html += `
        </table>
      </div>
    `;
  });

  html += `
    </body>
    </html>
  `;
  
  return html;
};

/**
 * 4. Native Save File
 * Dynamically imports react-native-fs for native environments to avoid Web errors.
 */
export const saveNativeFile = async (content, filename) => {
  if (!isNative) return;
  
  try {
    const RNFS = require('react-native-fs');
    const path = `${RNFS.DownloadDirectoryPath || RNFS.DocumentDirectoryPath}/${filename}`;
    await RNFS.writeFile(path, content, 'utf8');
    return path;
  } catch (err) {
    console.error('Failed to save native file:', err);
    throw err;
  }
};

// Helper: Escape XML/HTML specials
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.toString().replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
    }
  });
}
