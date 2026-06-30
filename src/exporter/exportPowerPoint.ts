import { getExportPayload } from './exportUtils.js';
import type { SectionData } from './types.js';

export function exportPPTX(data: SectionData, sectionId: string, lang: string, fileName: string) {
  const payload = getExportPayload(sectionId, data, lang);
  const div = document.createElement('div');
  div.innerHTML = payload.pureHTMLTable;
  document.body.appendChild(div);

  const PptxGenJS = (window as any).PptxGenJS;
  if (!PptxGenJS) {
    alert('PptxGenJS library missing.');
    return;
  }
  
  const pptx = new PptxGenJS();
  let slide1 = pptx.addSlide();
  slide1.addText(`Tunisia Statistics: ${sectionId.toUpperCase()}`, { x: 1, y: 1, w: 8, h: 1.5, fontSize: 32, color: 'DC0A26', bold: true });
  
  if (payload.images.length > 0) {
    let slideImg = pptx.addSlide();
    slideImg.addText(lang === 'ar' ? 'الرسوم البيانية' : 'Diagrams', { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: 'DC0A26' });
    payload.images.forEach((img: string, i: number) => {
      const xPos = 0.5 + (i % 2) * 4.5;
      const yPos = 1.2 + Math.floor(i / 2) * 2.5;
      slideImg.addImage({ data: img, x: xPos, y: yPos, w: 4, h: 2.2 });
    });
  }
  
  const tables = div.querySelectorAll('table');
  tables.forEach((tbl, idx) => {
    const tableId = `pptx-table-${Date.now()}-${idx}`;
    tbl.id = tableId;
    pptx.addSlidesForTable(tableId);
  });

  pptx.writeFile({ fileName });
  document.body.removeChild(div);
}
