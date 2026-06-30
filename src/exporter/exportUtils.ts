import type { SectionData, ExportPayload } from './types.js'; // type definitions

export function downloadFile(content: any, fileName: string, mimeType: string) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 100);
}

export function getPreviewHTML(sectionId: string, data: SectionData, lang: string): string {
  const isAr = lang === 'ar';
  const T = {
    year: isAr ? 'السنة' : 'Année',
    value: isAr ? 'القيمة' : 'Valeur',
    label: isAr ? 'العنصر' : 'Libellé'
  };

  let html = `<h3>${sectionId.toUpperCase()} - Data Summary</h3>`;
  html += `<table class="preview-table" style="width:100%; border-collapse:collapse; margin-top:20px; text-align:${isAr ? 'right' : 'left'}"><thead><tr><th style="border:1px solid #ccc; padding:8px">${T.year}</th><th style="border:1px solid #ccc; padding:8px">${T.label}</th><th style="border:1px solid #ccc; padding:8px">${T.value}</th></tr></thead><tbody>`;

  const addRows = (series: any, label: string) => {
    if (!series || !series.years) return '';
    let rows = '';
    series.years.slice(-5).forEach((y: string, i: number) => {
      rows += `<tr><td style="border:1px solid #ccc; padding:8px">${y}</td><td style="border:1px solid #ccc; padding:8px">${label}</td><td style="border:1px solid #ccc; padding:8px">${series.values[i]}</td></tr>`;
    });
    return rows;
  };

  if (sectionId === 'agriculture') {
    html += addRows((data as any).cereals, isAr ? 'الحبوب' : 'Céréales');
    html += addRows((data as any).olive_oil, isAr ? 'زيت الزيتون' : 'Huile d\'olive');
  } else if (sectionId === 'tourism') {
    html += addRows((data as any).arrivals, isAr ? 'الوافدون' : 'Arrivées');
    html += addRows((data as any).receipts, isAr ? 'العائدات' : 'Recettes');
  } else if (sectionId === 'industry') {
    html += addRows((data as any).production_index, isAr ? 'مؤشر الإنتاج' : 'Indice Prod.');
  } else if (sectionId === 'traditional') {
    html += addRows((data as any).exports, isAr ? 'الصادرات' : 'Exportations');
  } else if (sectionId === 'trade') {
    html += addRows((data as any).exports, isAr ? 'الصادرات' : 'Exportations');
    html += addRows((data as any).imports, isAr ? 'الواردات' : 'Importations');
  }

  html += '</tbody></table>';
  return html;
}

export function getExportPayload(sectionId: string, data: SectionData, lang: string): ExportPayload {
  const rawHtmlTable = getPreviewHTML(sectionId, data, lang);
  const canvases = document.querySelectorAll('.section:not([style*="display: none"]) canvas');
  const base64Images = Array.from(canvases).map(c => (c as HTMLCanvasElement).toDataURL('image/png', 1.0));
  
  let imagesHTML = '';
  if (base64Images.length > 0) {
    imagesHTML = '<div class="export-charts" style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom: 2rem;">' + 
                 base64Images.map(img => `<img src="${img}" style="max-height: 250px; width: auto; border: 1px solid #ccc; padding: 5px;" />`).join('') +
                 '</div>';
  }
  
  return {
    pureHTMLTable: rawHtmlTable,
    combinedHtmlWithImages: imagesHTML + rawHtmlTable,
    images: base64Images
  };
}
