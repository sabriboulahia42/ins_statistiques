import { downloadFile, getExportPayload } from './exportUtils.js';
import type { SectionData } from './types.js';

export function exportXLSX(data: SectionData, sectionId: string, lang: string, fileName: string) {
  const XLSXLib = (window as any).XLSX;
  if (!XLSXLib) {
    alert(lang === 'ar' ? 'جاري تحميل مكتبة XLSX...' : 'Loading XLSX library...'); return;
  }
  const payload = getExportPayload(sectionId, data, lang);
  const div = document.createElement('div');
  div.innerHTML = payload.pureHTMLTable;
  const table = div.querySelector('table');
  if (table) {
    const wb = XLSXLib.utils.table_to_book(table, {sheet: sectionId.toUpperCase()});
    XLSXLib.writeFile(wb, fileName);
  }
}
