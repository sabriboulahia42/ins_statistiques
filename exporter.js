(() => {
  // exporter/exportUtils.ts
  function downloadFile(content, fileName, mimeType) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(a.href), 100);
  }
  function getPreviewHTML(sectionId, data, lang) {
    const isAr = lang === "ar";
    const T = {
      year: isAr ? "\u0627\u0644\u0633\u0646\u0629" : "Ann\xE9e",
      value: isAr ? "\u0627\u0644\u0642\u064A\u0645\u0629" : "Valeur",
      label: isAr ? "\u0627\u0644\u0639\u0646\u0635\u0631" : "Libell\xE9"
    };
    let html = `<h3>${sectionId.toUpperCase()} - Data Summary</h3>`;
    html += `<table class="preview-table" style="width:100%; border-collapse:collapse; margin-top:20px; text-align:${isAr ? "right" : "left"}"><thead><tr><th style="border:1px solid #ccc; padding:8px">${T.year}</th><th style="border:1px solid #ccc; padding:8px">${T.label}</th><th style="border:1px solid #ccc; padding:8px">${T.value}</th></tr></thead><tbody>`;
    const addRows = (series, label) => {
      if (!series || !series.years) return "";
      let rows = "";
      series.years.slice(-5).forEach((y, i) => {
        rows += `<tr><td style="border:1px solid #ccc; padding:8px">${y}</td><td style="border:1px solid #ccc; padding:8px">${label}</td><td style="border:1px solid #ccc; padding:8px">${series.values[i]}</td></tr>`;
      });
      return rows;
    };
    if (sectionId === "agriculture") {
      html += addRows(data.cereals, isAr ? "\u0627\u0644\u062D\u0628\u0648\u0628" : "C\xE9r\xE9ales");
      html += addRows(data.olive_oil, isAr ? "\u0632\u064A\u062A \u0627\u0644\u0632\u064A\u062A\u0648\u0646" : "Huile d'olive");
    } else if (sectionId === "tourism") {
      html += addRows(data.arrivals, isAr ? "\u0627\u0644\u0648\u0627\u0641\u062F\u0648\u0646" : "Arriv\xE9es");
      html += addRows(data.receipts, isAr ? "\u0627\u0644\u0639\u0627\u0626\u062F\u0627\u062A" : "Recettes");
    } else if (sectionId === "industry") {
      html += addRows(data.production_index, isAr ? "\u0645\u0624\u0634\u0631 \u0627\u0644\u0625\u0646\u062A\u0627\u062C" : "Indice Prod.");
    } else if (sectionId === "traditional") {
      html += addRows(data.exports, isAr ? "\u0627\u0644\u0635\u0627\u062F\u0631\u0627\u062A" : "Exportations");
    } else if (sectionId === "trade") {
      html += addRows(data.exports, isAr ? "\u0627\u0644\u0635\u0627\u062F\u0631\u0627\u062A" : "Exportations");
      html += addRows(data.imports, isAr ? "\u0627\u0644\u0648\u0627\u0631\u062F\u0627\u062A" : "Importations");
    }
    html += "</tbody></table>";
    return html;
  }
  function getExportPayload(sectionId, data, lang) {
    const rawHtmlTable = getPreviewHTML(sectionId, data, lang);
    const canvases = document.querySelectorAll('.section:not([style*="display: none"]) canvas');
    const base64Images = Array.from(canvases).map((c) => c.toDataURL("image/png", 1));
    let imagesHTML = "";
    if (base64Images.length > 0) {
      imagesHTML = '<div class="export-charts" style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom: 2rem;">' + base64Images.map((img) => `<img src="${img}" style="max-height: 250px; width: auto; border: 1px solid #ccc; padding: 5px;" />`).join("") + "</div>";
    }
    return {
      pureHTMLTable: rawHtmlTable,
      combinedHtmlWithImages: imagesHTML + rawHtmlTable,
      images: base64Images
    };
  }

  // exporter/exportJSON.ts
  function exportJSON(data, sectionId, fileName) {
    const jsonStr = JSON.stringify(data, null, 2);
    downloadFile(jsonStr, fileName, "application/json");
  }
  function exportXML(data, sectionId, fileName) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<TunisiaStatistics section="${sectionId}">
`;
    if (data.kpis) {
      xml += "  <KPIs>\n";
      data.kpis.forEach((k) => {
        xml += `    <KPI label_ar="${k.label_ar}" label_fr="${k.label_fr}" value="${k.value}" icon="${k.icon}" />
`;
      });
      xml += "  </KPIs>\n";
    }
    const seriesToXML = (obj, name) => {
      if (!obj || !obj.years || !obj.values) return "";
      let s = `  <${name}>
`;
      obj.years.forEach((y, i) => {
        s += `    <Data year="${y}" value="${obj.values[i]}" />
`;
      });
      s += `  </${name}>
`;
      return s;
    };
    if (sectionId === "agriculture") {
      xml += seriesToXML(data.cereals, "Cereals");
      xml += seriesToXML(data.olive_oil, "OliveOil");
      xml += seriesToXML(data.dates, "Dates");
      xml += seriesToXML(data.fishing, "Fishing");
    } else if (sectionId === "tourism") {
      xml += seriesToXML(data.arrivals, "Arrivals");
      xml += seriesToXML(data.receipts, "Receipts");
    } else if (sectionId === "industry") {
      xml += seriesToXML(data.production_index, "ProductionIndex");
      if (data.sectors) {
        xml += "  <Sectors>\n";
        data.sectors.values.forEach((v, i) => {
          xml += `    <Sector name_ar="${data.sectors.labels_ar[i]}" name_fr="${data.sectors.labels_fr[i]}" value="${v}" />
`;
        });
        xml += "  </Sectors>\n";
      }
    } else if (sectionId === "traditional") {
      xml += seriesToXML(data.exports, "Exports");
      if (data.crafts_categories) {
        xml += "  <Categories>\n";
        data.crafts_categories.labels_ar.forEach((lbl, i) => {
          xml += `    <Category name_ar="${lbl}" name_fr="${data.crafts_categories.labels_fr[i]}" value="${data.crafts_categories.values[i]}" />
`;
        });
        xml += "  </Categories>\n";
      }
    } else if (sectionId === "trade") {
      xml += seriesToXML(data.exports, "Exports");
      xml += seriesToXML(data.imports, "Imports");
      xml += seriesToXML(data.balance, "Balance");
      xml += seriesToXML(data.coverage_rate, "CoverageRate");
      if (data.partners_export) {
        xml += "  <Partners>\n";
        data.partners_export.labels_ar.forEach((lbl, i) => {
          xml += `    <Partner name_ar="${lbl}" name_fr="${data.partners_export.labels_fr[i]}" value="${data.partners_export.values[i]}" />
`;
        });
        xml += "  </Partners>\n";
      }
    }
    xml += "</TunisiaStatistics>";
    downloadFile(xml, fileName, "application/xml");
  }
  async function exportODT(data, sectionId, lang, fileName) {
    const JSZipLib = window.JSZip;
    if (!JSZipLib) return;
    const zip = new JSZipLib();
    zip.file("mimetype", "application/vnd.oasis.opendocument.text", { compression: "STORE" });
    const manifestXml = `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">
<manifest:file-entry manifest:full-path="/" manifest:version="1.2" manifest:media-type="application/vnd.oasis.opendocument.text"/>
<manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
</manifest:manifest>`;
    zip.folder("META-INF")?.file("manifest.xml", manifestXml);
    let contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" 
                       xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" 
                       office:version="1.2">
<office:body>
  <office:text>
    <text:h text:outline-level="1">Tunisia Statistics - ${sectionId.toUpperCase()}</text:h>
    <text:p>Section: ${sectionId}</text:p>
`;
    if (data.kpis) {
      contentXml += '      <text:h text:outline-level="2">Key Indicators</text:h>\n';
      data.kpis.forEach((k) => {
        contentXml += `      <text:p>${lang === "ar" ? k.label_ar : k.label_fr}: ${k.value}</text:p>
`;
      });
    }
    contentXml += `    </office:text>
</office:body>
</office:document-content>`;
    zip.file("content.xml", contentXml);
    const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.oasis.opendocument.text" });
    downloadFile(blob, fileName, "application/vnd.oasis.opendocument.text");
  }

  // exporter/exportPDF.ts
  async function exportPDF(data, sectionId, lang, fileName) {
    const h2c = window.html2canvas;
    if (!h2c) {
      alert(lang === "ar" ? "\u062C\u0627\u0631\u064A \u062A\u062D\u0645\u064A\u0644 \u0645\u0643\u062A\u0628\u0629 PDF..." : "Loading PDF library...");
      return;
    }
    const payload = getExportPayload(sectionId, data, lang);
    const div = document.createElement("div");
    div.innerHTML = payload.combinedHtmlWithImages;
    div.style.width = "800px";
    div.style.padding = "20px";
    div.style.background = "#fff";
    div.style.color = "#000";
    div.dir = lang === "ar" ? "rtl" : "ltr";
    document.body.appendChild(div);
    const jsPDFLib = window.jspdf ? window.jspdf.jsPDF : null;
    if (!jsPDFLib) return;
    const doc = new jsPDFLib("p", "pt", "a4");
    await doc.html(div, {
      callback: function(docInstance) {
        docInstance.save(fileName);
        document.body.removeChild(div);
      },
      x: 15,
      y: 15,
      width: 550,
      windowWidth: 800
    });
  }

  // exporter/exportPowerPoint.ts
  function exportPPTX(data, sectionId, lang, fileName) {
    const payload = getExportPayload(sectionId, data, lang);
    const div = document.createElement("div");
    div.innerHTML = payload.pureHTMLTable;
    document.body.appendChild(div);
    const PptxGenJS = window.PptxGenJS;
    if (!PptxGenJS) {
      alert("PptxGenJS library missing.");
      return;
    }
    const pptx = new PptxGenJS();
    let slide1 = pptx.addSlide();
    slide1.addText(`Tunisia Statistics: ${sectionId.toUpperCase()}`, { x: 1, y: 1, w: 8, h: 1.5, fontSize: 32, color: "DC0A26", bold: true });
    if (payload.images.length > 0) {
      let slideImg = pptx.addSlide();
      slideImg.addText(lang === "ar" ? "\u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u0628\u064A\u0627\u0646\u064A\u0629" : "Diagrams", { x: 0.5, y: 0.5, fontSize: 24, bold: true, color: "DC0A26" });
      payload.images.forEach((img, i) => {
        const xPos = 0.5 + i % 2 * 4.5;
        const yPos = 1.2 + Math.floor(i / 2) * 2.5;
        slideImg.addImage({ data: img, x: xPos, y: yPos, w: 4, h: 2.2 });
      });
    }
    const tables = div.querySelectorAll("table");
    tables.forEach((tbl, idx) => {
      const tableId = `pptx-table-${Date.now()}-${idx}`;
      tbl.id = tableId;
      pptx.addSlidesForTable(tableId);
    });
    pptx.writeFile({ fileName });
    document.body.removeChild(div);
  }

  // exporter/exportWord.ts
  function exportDOCX(data, sectionId, lang, fileName) {
    const payload = getExportPayload(sectionId, data, lang);
    const meta = '<meta charset="utf-8">';
    const direction = lang === "ar" ? "rtl" : "ltr";
    const content = `<!DOCTYPE html><html dir="${direction}"><head>${meta}</head><body>${payload.combinedHtmlWithImages}</body></html>`;
    downloadFile(content, fileName.replace(".docx", ".doc"), "application/msword");
  }

  // exporter/exportExcel.ts
  function exportXLSX(data, sectionId, lang, fileName) {
    const XLSXLib = window.XLSX;
    if (!XLSXLib) {
      alert(lang === "ar" ? "\u062C\u0627\u0631\u064A \u062A\u062D\u0645\u064A\u0644 \u0645\u0643\u062A\u0628\u0629 XLSX..." : "Loading XLSX library...");
      return;
    }
    const payload = getExportPayload(sectionId, data, lang);
    const div = document.createElement("div");
    div.innerHTML = payload.pureHTMLTable;
    const table = div.querySelector("table");
    if (table) {
      const wb = XLSXLib.utils.table_to_book(table, { sheet: sectionId.toUpperCase() });
      XLSXLib.writeFile(wb, fileName);
    }
  }

  // exporter/exporter.ts
  var Exporter = {
    exportData(format, sectionId, data, lang) {
      const d = (/* @__PURE__ */ new Date()).toISOString().split("T")[0].replace(/-/g, "");
      const fileName = `INS_STAT_${sectionId.toUpperCase()}_${d}.${format}`;
      switch (format) {
        case "json":
          exportJSON(data, sectionId, fileName);
          break;
        case "xml":
          exportXML(data, sectionId, fileName);
          break;
        case "pdf":
          exportPDF(data, sectionId, lang, fileName);
          break;
        case "pptx":
          exportPPTX(data, sectionId, lang, fileName);
          break;
        case "docx":
          exportDOCX(data, sectionId, lang, fileName);
          break;
        case "odt":
          exportODT(data, sectionId, lang, fileName);
          break;
        case "xlsx":
          exportXLSX(data, sectionId, lang, fileName);
          break;
        default:
          console.error("Unknown export format:", format);
      }
    },
    getPreviewHTML,
    printData(sectionId, data, lang) {
      const payload = getExportPayload(sectionId, data, lang);
      const isAr = lang === "ar";
      const direction = isAr ? "rtl" : "ltr";
      const title = isAr ? "\u0637\u0628\u0627\u0639\u0629 - " + sectionId.toUpperCase() : "Print - " + sectionId.toUpperCase();
      const btnText = isAr ? "\u0637\u0628\u0627\u0639\u0629 \u0627\u0644\u0622\u0646" : "Print Now";
      const footerText = isAr ? "\u0623\u064F\u0646\u062A\u062C\u062A \u0647\u0630\u0647 \u0627\u0644\u0648\u062B\u064A\u0642\u0629 \u0639\u0628\u0631 \u0628\u0648\u0627\u0628\u0629 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u062A\u0648\u0646\u0633 \u0627\u0644\u0645\u062F\u0631\u0633\u064A\u0629." : "Generated by the Tunisia Statistics Educational Portal.";
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert(isAr ? "\u064A\u0631\u062C\u0649 \u0627\u0644\u0633\u0645\u0627\u062D \u0628\u0627\u0644\u0646\u0648\u0627\u0641\u0630 \u0627\u0644\u0645\u0646\u0628\u062B\u0642\u0629 \u0644\u0644\u0637\u0628\u0627\u0639\u0629." : "Please allow popups to print.");
        return;
      }
      printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="${lang}" dir="${direction}">
      <head>
        <title>${title}</title>
        <style>
          body { font-family: sans-serif; padding: 2rem; color: #000; background: #fff; max-width: 800px; margin: auto; }
          h3 { color: #dc0a26; border-bottom: 2px solid #ddd; padding-bottom: 0.5rem; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.9rem; }
          th, td { border: 1px solid #ccc; padding: 0.75rem; text-align: ${isAr ? "right" : "left"}; }
          th { background: #f5f5f5; font-weight: bold; }
          .no-print { display: inline-block; margin-bottom: 2rem; padding: 0.6rem 1.2rem; background: #dc0a26; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
          @media print {
            .no-print { display: none !important; }
            @page { margin: 1.5cm; }
          }
        </style>
      </head>
      <body>
        <button class="no-print" onclick="window.print();">${btnText}</button>
        ${payload.combinedHtmlWithImages}
        <p style="margin-top: 3rem; font-size: 0.8rem; color: #666; text-align: center; border-top: 1px solid #ddd; padding-top: 1rem;">
          ${footerText}
        </p>
      </body>
      </html>
    `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  };
  window.Exporter = Exporter;
})();
//# sourceMappingURL=exporter.js.map
