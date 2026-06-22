import { getExportPayload } from './exportUtils.js';
import type { SectionData } from './types.js';

export async function exportPDF(data: SectionData, sectionId: string, lang: string, fileName: string) {
  const h2c = (window as any).html2canvas;
  if (!h2c) {
    alert(lang === 'ar' ? 'جاري تحميل مكتبة PDF...' : 'Loading PDF library...');
    return;
  }
  const payload = getExportPayload(sectionId, data, lang);
  const div = document.createElement('div');
  div.innerHTML = payload.combinedHtmlWithImages;
  div.style.width = '800px';
  div.style.padding = '20px';
  div.style.background = '#fff';
  div.style.color = '#000';
  div.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.appendChild(div);

  const jsPDFLib = (window as any).jspdf ? (window as any).jspdf.jsPDF : null;
  if (!jsPDFLib) return;
  const doc = new jsPDFLib('p', 'pt', 'a4');
  
  await doc.html(div, {
    callback: function (docInstance: any) {
      docInstance.save(fileName);
      document.body.removeChild(div);
    },
    x: 15,
    y: 15,
    width: 550,
    windowWidth: 800
  });
}
