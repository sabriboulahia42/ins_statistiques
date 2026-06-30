import { downloadFile, getExportPayload } from './exportUtils.js';
import type { SectionData } from './types.js';

export function exportDOCX(data: SectionData, sectionId: string, lang: string, fileName: string) {
  const payload = getExportPayload(sectionId, data, lang);
  const meta = '<meta charset="utf-8">';
  const direction = lang === 'ar' ? 'rtl' : 'ltr';
  const content = `<!DOCTYPE html><html dir="${direction}"><head>${meta}</head><body>${payload.combinedHtmlWithImages}</body></html>`;
  
  downloadFile(content, fileName.replace('.docx', '.doc'), 'application/msword');
}
