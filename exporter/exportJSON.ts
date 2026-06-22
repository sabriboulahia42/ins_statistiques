import { downloadFile } from './exportUtils.js';
import type { SectionData, KPI } from './types.js';

export function exportJSON(data: SectionData, sectionId: string, fileName: string) {
  const jsonStr = JSON.stringify(data, null, 2);
  downloadFile(jsonStr, fileName, 'application/json');
}

export function exportXML(data: any, sectionId: string, fileName: string) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<TunisiaStatistics section="${sectionId}">\n`;
  
  if (data.kpis) {
    xml += '  <KPIs>\n';
    data.kpis.forEach((k: any) => {
      xml += `    <KPI label_ar="${k.label_ar}" label_fr="${k.label_fr}" value="${k.value}" icon="${k.icon}" />\n`;
    });
    xml += '  </KPIs>\n';
  }

  const seriesToXML = (obj: any, name: string) => {
    if (!obj || !obj.years || !obj.values) return '';
    let s = `  <${name}>\n`;
    obj.years.forEach((y: string, i: number) => {
      s += `    <Data year="${y}" value="${obj.values[i]}" />\n`;
    });
    s += `  </${name}>\n`;
    return s;
  };

  if (sectionId === 'agriculture') {
    xml += seriesToXML(data.cereals, 'Cereals');
    xml += seriesToXML(data.olive_oil, 'OliveOil');
    xml += seriesToXML(data.dates, 'Dates');
    xml += seriesToXML(data.fishing, 'Fishing');
  } else if (sectionId === 'tourism') {
    xml += seriesToXML(data.arrivals, 'Arrivals');
    xml += seriesToXML(data.receipts, 'Receipts');
  } else if (sectionId === 'industry') {
    xml += seriesToXML(data.production_index, 'ProductionIndex');
    if (data.sectors) {
      xml += '  <Sectors>\n';
      data.sectors.values.forEach((v: number, i: number) => {
        xml += `    <Sector name_ar="${data.sectors.labels_ar[i]}" name_fr="${data.sectors.labels_fr[i]}" value="${v}" />\n`;
      });
      xml += '  </Sectors>\n';
    }
  } else if (sectionId === 'traditional') {
    xml += seriesToXML(data.exports, 'Exports');
    if (data.crafts_categories) {
      xml += '  <Categories>\n';
      data.crafts_categories.labels_ar.forEach((lbl: string, i: number) => {
        xml += `    <Category name_ar="${lbl}" name_fr="${data.crafts_categories.labels_fr[i]}" value="${data.crafts_categories.values[i]}" />\n`;
      });
      xml += '  </Categories>\n';
    }
  } else if (sectionId === 'trade') {
    xml += seriesToXML(data.exports, 'Exports');
    xml += seriesToXML(data.imports, 'Imports');
    xml += seriesToXML(data.balance, 'Balance');
    xml += seriesToXML(data.coverage_rate, 'CoverageRate');
    if (data.partners_export) {
      xml += '  <Partners>\n';
      data.partners_export.labels_ar.forEach((lbl: string, i: number) => {
        xml += `    <Partner name_ar="${lbl}" name_fr="${data.partners_export.labels_fr[i]}" value="${data.partners_export.values[i]}" />\n`;
      });
      xml += '  </Partners>\n';
    }
  }

  xml += '</TunisiaStatistics>';
  downloadFile(xml, fileName, 'application/xml');
}

export async function exportODT(data: SectionData, sectionId: string, lang: string, fileName: string) {
  const JSZipLib = (window as any).JSZip;
  if (!JSZipLib) return;
  const zip = new JSZipLib();
  
  zip.file('mimetype', 'application/vnd.oasis.opendocument.text', { compression: 'STORE' });
  
  const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
<manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.text"/>
<manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`;
  zip.folder('META-INF')?.file('manifest.xml', manifestXml);

  let contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" 
                       xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" 
                       office:version="1.2">
<office:body>
  <office:text>
    <text:h text:outline-level="1">Tunisia Statistics - ${sectionId.toUpperCase()}</text:h>
    <text:p>Section: ${sectionId}</text:p>\n`;

  if (data.kpis) {
    contentXml += '      <text:h text:outline-level="2">Key Indicators</text:h>\n';
    data.kpis.forEach((k: KPI) => {
      contentXml += `      <text:p>${lang === 'ar' ? k.label_ar : k.label_fr}: ${k.value}</text:p>\n`;
    });
  }

  contentXml += `    </office:text>
</office:body>
</office:document-content>`;
  zip.file('content.xml', contentXml);

  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.oasis.opendocument.text' });
  downloadFile(blob, fileName, 'application/vnd.oasis.opendocument.text');
}
