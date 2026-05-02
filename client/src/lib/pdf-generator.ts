/**
 * pdf-generator.ts — Fixed 5-page PDF report
 *
 * Page 1 : Engineer Info + Score Meter + Grade
 * Page 2 : Factor Contributions Table + Project Suitability
 * Page 3 : Stone Recognition — summary + variable table + deviation notes
 * Page 4 : Graphical comparison + Identity Conclusion
 * Page 5 : Model Basis & Limitations
 *
 * Typography : Times (serif built-in ≈ Georgia), 12pt body / 14pt H1 / 13pt H2 / 10pt label
 * Layout     : A4 portrait, 25.4 mm margins on all four sides
 * Pages      : Within each page, content auto-wraps with a cursor.
 *              If a page's content overflows, it spills onto the next page automatically
 *              but section boundaries always force a new page.
 */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { type AdhesivityResult } from "./adhesivity-model";
import { type EngineerInfo } from "../components/pdf/pdf-engineer-modal";

// ── Colour palette ────────────────────────────────────────────────────────────
const C = {
  primary : [1,   105, 111] as [number,number,number],
  text    : [40,   37,  29] as [number,number,number],
  muted   : [122, 121, 116] as [number,number,number],
  border  : [212, 209, 202] as [number,number,number],
  bg      : [247, 246, 242] as [number,number,number],
  white   : [255, 255, 255] as [number,number,number],
  amber   : [209, 153,   0] as [number,number,number],
  green   : [67,  122,  34] as [number,number,number],
  red     : [150,  66,  25] as [number,number,number],
};

function hexToRgb(hex: string): [number,number,number] {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

// ── Page geometry (mm) ────────────────────────────────────────────────────────
const MARGIN      = 25.4;
const PAGE_W      = 210;
const PAGE_H      = 297;
const CONTENT_W   = PAGE_W - MARGIN * 2;   // 159.2 mm
const HEADER_H    = 16;
const FOOTER_H    = 28;      // generous reserve — prevents last line overflowing onto next page
const BODY_TOP    = MARGIN + HEADER_H + 6;
const BODY_BOTTOM = PAGE_H - MARGIN - FOOTER_H;

// ── Font helpers ──────────────────────────────────────────────────────────────
const F = "times";
function setBody(pdf: jsPDF)     { pdf.setFont(F, "normal"); pdf.setFontSize(12); }
function setBodyBold(pdf: jsPDF) { pdf.setFont(F, "bold");   pdf.setFontSize(12); }
function setLabel(pdf: jsPDF)    { pdf.setFont(F, "normal"); pdf.setFontSize(10); }
function setH1(pdf: jsPDF)       { pdf.setFont(F, "bold");   pdf.setFontSize(14); }
function setH2(pdf: jsPDF)       { pdf.setFont(F, "bold");   pdf.setFontSize(13); }

// ── SVG → PNG ─────────────────────────────────────────────────────────────────
async function svgStringToImg(svgString: string): Promise<string> {
  const parser  = new DOMParser();
  const doc     = parser.parseFromString(svgString, "image/svg+xml");
  const svgEl   = doc.documentElement as unknown as SVGSVGElement;
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "position:fixed;left:-9999px;top:-9999px;background:white;padding:10px;";
  wrapper.appendChild(svgEl.cloneNode(true));
  document.body.appendChild(wrapper);
  await new Promise(r => setTimeout(r, 100));
  const canvas = await html2canvas(wrapper, {
    scale: 2.5, backgroundColor: "#ffffff", useCORS: true, logging: false,
  });
  document.body.removeChild(wrapper);
  return canvas.toDataURL("image/png");
}

// ── Page cursor — tracks Y within a page, auto-adds pages on overflow ─────────
class PageCursor {
  pdf: jsPDF;
  y: number;
  pageNum: number;

  constructor(pdf: jsPDF, startY = BODY_TOP) {
    this.pdf     = pdf;
    this.y       = startY;
    this.pageNum = 1;
  }

  need(mm: number) {
    if (this.y + mm > BODY_BOTTOM) {
      this._overflow();
    }
  }

  _overflow() {
    drawFooter(this.pdf, this.pageNum);
    this.pdf.addPage();
    this.pageNum++;
    drawHeader(this.pdf, this.pageNum);
    this.y = BODY_TOP + 2;   // small top gap after auto page break
  }

  /** Force a hard page break regardless of position */
  forcePage(targetPageNum: number) {
    // Always force a new page — sections should never share a page unless intended
    // Close current page footer
    drawFooter(this.pdf, this.pageNum);
    // Add pages until we reach target page number
    while (this.pageNum < targetPageNum) {
      this.pdf.addPage();
      this.pageNum++;
      drawHeader(this.pdf, this.pageNum);
    }
    this.y = BODY_TOP;
  }

  advance(mm: number) { this.y += mm; }
}

// ── Header ────────────────────────────────────────────────────────────────────
function drawHeader(pdf: jsPDF, pageNum: number) {
  pdf.setFillColor(...C.primary);
  pdf.rect(0, 0, PAGE_W, HEADER_H, "F");
  pdf.setTextColor(...C.white);
  pdf.setFont(F, "bold");
  pdf.setFontSize(11);
  pdf.text("AggregateIQ", MARGIN, 10.5);
  pdf.setFont(F, "normal");
  pdf.setFontSize(8.5);
  pdf.text(
    "Aggregate Selection Companion \u2014 Bituminous Pavement Engineering",
    MARGIN + 32, 10.5
  );
  pdf.text(`Page ${pageNum}`, PAGE_W - MARGIN, 10.5, { align: "right" });
  pdf.setTextColor(...C.text);
}

// ── Footer ────────────────────────────────────────────────────────────────────
function drawFooter(pdf: jsPDF, pageNum: number) {
  const fy = PAGE_H - MARGIN - 10;
  pdf.setDrawColor(...C.border);
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN, fy, PAGE_W - MARGIN, fy);
  pdf.setFont(F, "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...C.muted);
  pdf.text(
    "AggregateIQ \u2014 For engineering assessment purposes only. Verify with laboratory testing before final specification.",
    MARGIN, fy + 5
  );
  pdf.text(`\u2014 ${pageNum} \u2014`, PAGE_W / 2, fy + 5, { align: "center" });
  pdf.setTextColor(...C.text);
}

// ── Divider ───────────────────────────────────────────────────────────────────
function divider(pdf: jsPDF, y: number) {
  pdf.setDrawColor(...C.border);
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN, y, PAGE_W - MARGIN, y);
}

// ── Section heading H1 (teal pill bar) ───────────────────────────────────────
function sectionH1(cur: PageCursor, text: string) {
  cur.need(16);
  const pdf  = cur.pdf;
  const boxY = cur.y;          // rect starts exactly at cur.y — no negative offset
  pdf.setFillColor(...C.bg);
  pdf.setDrawColor(...C.border);
  pdf.roundedRect(MARGIN, boxY, CONTENT_W, 12, 2, 2, "FD");
  setH1(pdf);
  pdf.setTextColor(...C.primary);
  pdf.text(text.toUpperCase(), MARGIN + 5, boxY + 8.5);   // baseline 8.5mm into box
  pdf.setTextColor(...C.text);
  cur.advance(16);
}

// ── Sub-heading H2 ────────────────────────────────────────────────────────────
function sectionH2(cur: PageCursor, text: string) {
  cur.need(12);
  setH2(cur.pdf);
  cur.pdf.setTextColor(...C.primary);
  cur.pdf.text(text, MARGIN, cur.y + 7);   // +7 so text baseline is below cur.y
  cur.pdf.setTextColor(...C.text);
  cur.advance(10);
}

// ── Body paragraph — with justified alignment ────────────────────────────────
function bodyText(cur: PageCursor, text: string, color?: [number,number,number]) {
  const pdf   = cur.pdf;
  setBody(pdf);
  pdf.setTextColor(...(color ?? C.text));
  const lines = pdf.splitTextToSize(text, CONTENT_W) as string[];
  for (let i = 0; i < lines.length; i++) {
    cur.need(6.5);
    const line     = lines[i];
    const isLast   = i === lines.length - 1;
    const trimmed  = line.trim();
    // Last line of paragraph: left-align (standard justified behaviour)
    if (isLast || trimmed === "") {
      pdf.text(trimmed, MARGIN, cur.y);
    } else {
      // Justify: spread words evenly across CONTENT_W
      const words = trimmed.split(" ").filter(w => w.length > 0);
      if (words.length <= 1) {
        pdf.text(trimmed, MARGIN, cur.y);
      } else {
        const lineWidth   = pdf.getTextWidth(trimmed.replace(/ +/g, " "));
        const spaceCount  = words.length - 1;
        const naturalSpace = pdf.getTextWidth(" ");
        const extraSpace  = (CONTENT_W - lineWidth) / spaceCount + naturalSpace;
        let xPos = MARGIN;
        for (let wi = 0; wi < words.length; wi++) {
          pdf.text(words[wi], xPos, cur.y);
          if (wi < words.length - 1) {
            xPos += pdf.getTextWidth(words[wi]) + extraSpace;
          }
        }
      }
    }
    cur.advance(6.5);
  }
  pdf.setTextColor(...C.text);
}

// ── Label text (10pt muted) ───────────────────────────────────────────────────
function labelText(cur: PageCursor, text: string, color?: [number,number,number]) {
  const pdf = cur.pdf;
  setLabel(pdf);
  pdf.setTextColor(...(color ?? C.muted));
  const lines = pdf.splitTextToSize(text, CONTENT_W);
  for (const line of lines) {
    cur.need(5.5);
    pdf.text(line, MARGIN, cur.y);
    cur.advance(5.5);
  }
  pdf.setTextColor(...C.text);
}

// ── Table ─────────────────────────────────────────────────────────────────────
// Layout model (all Y values are absolute page coordinates):
//   rowTop  = cur.y               ← top edge of current row
//   textY   = cur.y + ROW_H - PAD_B  ← baseline of text (near bottom of row)
//   rowTop advances by ROW_H after each row
//
// This keeps rect(), text(), and line() all anchored to rowTop, eliminating
// the off-by-one drift that was causing text to overlap row borders.

interface TableCol { header: string; width: number; align?: "left"|"center"|"right" }

function drawTable(cur: PageCursor, cols: TableCol[], rows: string[][], headerBg?: [number,number,number]) {
  const pdf    = cur.pdf;
  const ROW_H  = 9;      // total row height in mm
  const PAD_L  = 3;      // left padding inside cell
  const PAD_R  = 3;      // right padding inside cell
  const PAD_B  = 3;      // baseline offset from row bottom (text sits near bottom)
  const hbg    = headerBg ?? C.primary;

  // ── Header row ──────────────────────────────────────────────────────────────
  cur.need(ROW_H + 2);
  const headerTop = cur.y;
  pdf.setFillColor(...hbg);
  pdf.rect(MARGIN, headerTop, CONTENT_W, ROW_H, "F");
  setLabel(pdf);
  pdf.setFontSize(10);
  pdf.setTextColor(...C.white);
  let x = MARGIN;
  const textBaseline = headerTop + ROW_H - PAD_B;
  for (const col of cols) {
    const tx = col.align === "right"  ? x + col.width - PAD_R
             : col.align === "center" ? x + col.width / 2
             : x + PAD_L;
    pdf.text(col.header, tx, textBaseline, {
      align: col.align === "center" ? "center" : col.align === "right" ? "right" : "left"
    });
    x += col.width;
  }
  pdf.setTextColor(...C.text);
  cur.advance(ROW_H);

  // ── Data rows ────────────────────────────────────────────────────────────────
  let shade = false;
  for (const row of rows) {
    cur.need(ROW_H);
    const rowTop     = cur.y;
    const rowBaseline = rowTop + ROW_H - PAD_B;

    // Alternating shade
    if (shade) {
      pdf.setFillColor(...C.bg);
      pdf.rect(MARGIN, rowTop, CONTENT_W, ROW_H, "F");
    }

    // Bottom border of this row
    pdf.setDrawColor(...C.border);
    pdf.setLineWidth(0.2);
    pdf.line(MARGIN, rowTop + ROW_H, PAGE_W - MARGIN, rowTop + ROW_H);

    // Cell text
    x = MARGIN;
    pdf.setFont("times", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(...C.text);
    for (let ci = 0; ci < cols.length; ci++) {
      const col  = cols[ci];
      const cell = row[ci] ?? "";
      const tx   = col.align === "right"  ? x + col.width - PAD_R
                 : col.align === "center" ? x + col.width / 2
                 : x + PAD_L;
      pdf.text(cell, tx, rowBaseline, {
        align: col.align === "center" ? "center" : col.align === "right" ? "right" : "left"
      });
      x += col.width;
    }
    cur.advance(ROW_H);
    shade = !shade;
  }

  // ── Outer border ─────────────────────────────────────────────────────────────
  const totalH = (rows.length + 1) * ROW_H;
  pdf.setDrawColor(...C.border);
  pdf.setLineWidth(0.5);
  pdf.rect(MARGIN, cur.y - totalH, CONTENT_W, totalH, "S");

  // Vertical column dividers
  pdf.setLineWidth(0.2);
  let cx = MARGIN;
  for (let ci = 0; ci < cols.length - 1; ci++) {
    cx += cols[ci].width;
    pdf.line(cx, cur.y - totalH, cx, cur.y);
  }

  cur.advance(6);
}

// ── Image (centred, with overflow protection) ─────────────────────────────────
function addImage(cur: PageCursor, imgData: string, imgW: number, imgH: number) {
  const maxH = BODY_BOTTOM - BODY_TOP - 10;
  if (imgH > maxH) {
    const scale = maxH / imgH;
    imgW *= scale;
    imgH *= scale;
  }
  cur.need(imgH + 4);
  const x = MARGIN + (CONTENT_W - imgW) / 2;
  cur.pdf.addImage(imgData, "PNG", x, cur.y, imgW, imgH);
  cur.advance(imgH + 6);
}

// ── Grade pill ────────────────────────────────────────────────────────────────
function gradePill(cur: PageCursor, grade: string, gradeColor: string) {
  const pdf    = cur.pdf;
  const rgb    = hexToRgb(gradeColor);
  const W_pill = 65, H_pill = 12;
  const x      = MARGIN + (CONTENT_W - W_pill) / 2;
  cur.need(H_pill + 6);

  pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
  pdf.setGState(new (pdf as any).GState({ opacity: 0.13 }));
  pdf.roundedRect(x, cur.y, W_pill, H_pill, 6, 6, "F");
  pdf.setGState(new (pdf as any).GState({ opacity: 1.0 }));
  pdf.setDrawColor(...rgb);
  pdf.setLineWidth(0.6);
  pdf.roundedRect(x, cur.y, W_pill, H_pill, 6, 6, "S");
  setBodyBold(pdf);
  pdf.setTextColor(...rgb);
  pdf.text(grade, MARGIN + CONTENT_W / 2, cur.y + 8.5, { align: "center" });
  pdf.setTextColor(...C.text);
  cur.advance(H_pill + 6);
}

// ── Impact label helper ───────────────────────────────────────────────────────
function impactLabel(impact: string): string {
  if (impact === "positive") return "Positive (+)";
  if (impact === "negative") return "Negative (\u2212)";
  return "Neutral (\u223c)";
}

// ── Entered values map (for Case B triple charts) ─────────────────────────────
function buildEnteredValuesMap(result: AdhesivityResult): Record<string, number> {
  return {
    porosity       : result.breakdown.porosity.value        ?? 0,
    moistureContent: result.breakdown.moistureContent.value ?? 0,
    sio2           : result.breakdown.sio2.value            ?? 0,
    al2o3          : result.breakdown.al2o3.value           ?? 0,
    fe2o3          : result.breakdown.fe2o3.value           ?? 0,
    cao            : result.breakdown.cao.value             ?? 0,
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN GENERATOR
// ════════════════════════════════════════════════════════════════════════════════
export async function generatePdfReport(
  result: AdhesivityResult,
  engineerInfo: EngineerInfo,
  aggregateName?: string,
): Promise<void> {

  const { buildScoreMeterSvg, buildStoneChartSvg, buildTripleChartSvg, calcSimilarityScore } =
    await import("./pdf-svg-builders");

  const isOther = !result.stoneRecognition.stoneType ||
                  result.stoneRecognition.stoneType.toLowerCase() === "other";
  const sr      = result.stoneRecognition;

  // Pre-render all images before creating PDF
  const meterSvg = buildScoreMeterSvg(result, engineerInfo.meterStyle);
  const meterImg = await svgStringToImg(meterSvg);

  let stoneImg: string | null = null;
  let basaltImg: string | null = null;
  let graniteImg: string | null = null;
  let limestoneImg: string | null = null;

  if (!isOther) {
    stoneImg = await svgStringToImg(buildStoneChartSvg(sr));
  } else {
    const ev = buildEnteredValuesMap(result);
    [basaltImg, graniteImg, limestoneImg] = await Promise.all([
      svgStringToImg(buildTripleChartSvg(ev, "basalt")),
      svgStringToImg(buildTripleChartSvg(ev, "granite")),
      svgStringToImg(buildTripleChartSvg(ev, "limestone")),
    ]);
  }

  // Create PDF — page 1 header drawn immediately
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  drawHeader(pdf, 1);
  const cur = new PageCursor(pdf);
  const gradeRgb = hexToRgb(result.gradeColor);

  // ══════════════════════════════════════════════════════════════════════════════
  // PAGE 1 — Engineer Info + Score Meter + Grade
  // ══════════════════════════════════════════════════════════════════════════════

  // ── Report title ─────────────────────────────────────────────────────────────
  cur.need(20);
  pdf.setFillColor(...C.primary);
  pdf.setGState(new (pdf as any).GState({ opacity: 0.07 }));
  pdf.rect(MARGIN, cur.y, CONTENT_W, 18, "F");
  pdf.setGState(new (pdf as any).GState({ opacity: 1.0 }));
  setH1(pdf);
  pdf.setTextColor(...C.primary);
  pdf.text("Aggregate Adhesivity Assessment Report", MARGIN + CONTENT_W / 2, cur.y + 8, { align: "center" });
  setLabel(pdf);
  pdf.setTextColor(...C.muted);
  pdf.text(
    aggregateName ? `Aggregate: ${aggregateName}` : "AggregateIQ — Adhesivity Model v1.0",
    MARGIN + CONTENT_W / 2, cur.y + 14.5, { align: "center" }
  );
  pdf.setTextColor(...C.text);
  cur.advance(24);

  // ── Engineer info block ───────────────────────────────────────────────────────
  const iW = CONTENT_W / 3;
  const fields = [
    { label: "Prepared By",  value: engineerInfo.name    || "\u2014" },
    { label: "Organization", value: engineerInfo.company || "\u2014" },
    { label: "Date",         value: engineerInfo.date    || "\u2014" },
  ];
  cur.need(26);
  pdf.setFillColor(...C.bg);
  pdf.setDrawColor(...C.border);
  pdf.roundedRect(MARGIN, cur.y, CONTENT_W, 24, 2, 2, "FD");
  for (let fi = 0; fi < fields.length; fi++) {
    const fx = MARGIN + fi * iW + 5;
    setLabel(pdf);
    pdf.setTextColor(...C.muted);
    pdf.text(fields[fi].label.toUpperCase(), fx, cur.y + 8);
    setBodyBold(pdf);
    pdf.setTextColor(...C.text);
    pdf.text(fields[fi].value, fx, cur.y + 18);
  }
  cur.advance(30);

  divider(pdf, cur.y);
  cur.advance(7);

  // ── Score meter (centred) ─────────────────────────────────────────────────────
  sectionH1(cur, "Predicted Retained Coating (RC)");
  addImage(cur, meterImg, 95, 72);

  // ── Grade pill ────────────────────────────────────────────────────────────────
  gradePill(cur, result.grade, result.gradeColor);

  // ── Confidence note ───────────────────────────────────────────────────────────
  cur.need(7);
  setLabel(pdf);
  pdf.setTextColor(...C.muted);
  pdf.text(
    `Confidence Interval: \u00b110% (90%)   \u00b7   ${result.confidence === "experimental" ? "Experimentally validated" : "Index-based estimate"}`,
    MARGIN + CONTENT_W / 2, cur.y, { align: "center" }
  );
  pdf.setTextColor(...C.text);
  cur.advance(8);

  // ── Incomplete warning (if any) ───────────────────────────────────────────────
  if (result.incomplete) {
    cur.need(18);
    pdf.setFillColor(209, 153, 0);
    pdf.setGState(new (pdf as any).GState({ opacity: 0.10 }));
    pdf.roundedRect(MARGIN, cur.y, CONTENT_W, 16, 2, 2, "F");
    pdf.setGState(new (pdf as any).GState({ opacity: 1.0 }));
    pdf.setDrawColor(...C.amber);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(MARGIN, cur.y, CONTENT_W, 16, 2, 2, "S");
    setBodyBold(pdf);
    pdf.setTextColor(...C.amber);
    pdf.text("\u26a0  REDUCED ACCURACY \u2014 Incomplete Data", MARGIN + 5, cur.y + 6.5);
    setLabel(pdf);
    pdf.text(
      `${result.missingVars.join(" and ")} not provided. Results are indicative only.`,
      MARGIN + 5, cur.y + 12.5
    );
    pdf.setTextColor(...C.text);
    cur.advance(20);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PAGE 2 — Factor Contributions + Project Suitability
  // ══════════════════════════════════════════════════════════════════════════════
  drawFooter(pdf, 1);
  cur.forcePage(2);

  sectionH1(cur, "Factor Contributions to Adhesivity Score");

  const factorCols: TableCol[] = [
    { header: "Factor",          width: 52 },
    { header: "Weight",          width: 24, align: "center" },
    { header: "Score (pts)",     width: 30, align: "center" },
    { header: "Normalised",      width: 28, align: "center" },
    { header: "Impact",          width: CONTENT_W - 134, align: "center" },
  ];
  const factorDefs = [
    { key: "moistureContent" as const, label: "Moisture Content (MC)", weight: "33%" },
    { key: "porosity"        as const, label: "Porosity",               weight: "24%" },
    { key: "al2o3"           as const, label: "Al\u2082O\u2083",        weight: "18%" },
    { key: "cao"             as const, label: "CaO",                    weight: "14%" },
    { key: "sio2"            as const, label: "SiO\u2082",              weight: "7%"  },
    { key: "fe2o3"           as const, label: "Fe\u2082O\u2083",        weight: "4%"  },
  ];
  const factorRows = factorDefs.map(f => {
    const item = result.breakdown[f.key];
    return [
      f.label,
      f.weight,
      item.contribution.toFixed(2),
      ((item.contribution / result.predictedRC) * 100).toFixed(1) + "%",
      impactLabel(item.impact),
    ];
  });
  drawTable(cur, factorCols, factorRows);

  cur.advance(2);
  labelText(cur,
    "Score (pts) is the absolute contribution of each factor to the predicted RC score. " +
    "Normalised shows each factor\u2019s share of the total score. " +
    "57% of the model weight is physical (MC + Porosity); 43% is chemical (Al\u2082O\u2083 + CaO + SiO\u2082 + Fe\u2082O\u2083)."
  );
  cur.advance(6);
  divider(pdf, cur.y);
  cur.advance(8);

  // ── Project Suitability ───────────────────────────────────────────────────────
  sectionH1(cur, "Project Suitability Assessment");
  bodyText(cur, result.recommendation);
  cur.advance(5);

  // Risk flags (on same page if space allows)
  if (result.riskFlags.length > 0) {
    cur.advance(2);
    divider(pdf, cur.y);
    cur.advance(8);
    sectionH1(cur, "Risk Flags");
    for (const flag of result.riskFlags) {
      cur.need(10);
      setBodyBold(pdf);
      pdf.setTextColor(...C.red);
      pdf.text("\u25b2", MARGIN, cur.y);
      setBody(pdf);
      pdf.setTextColor(...C.text);
      const cleaned = flag.replace(/^[\u26a0\u25b2] ?/, "");
      const fLines  = pdf.splitTextToSize(cleaned, CONTENT_W - 8);
      for (const fl of fLines) {
        cur.need(6.5);
        pdf.text(fl, MARGIN + 7, cur.y);
        cur.advance(6.5);
      }
      cur.advance(3);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PAGE 3 — Stone Recognition (summary + variable table + deviation notes)
  // ══════════════════════════════════════════════════════════════════════════════
  drawFooter(pdf, cur.pageNum);
  cur.forcePage(3);

  sectionH1(cur, "Stone Recognition Analysis");

  // Stone identity line
  cur.need(18);
  const stoneNameY = cur.y + 7;
  setH2(pdf);
  pdf.setTextColor(...gradeRgb);
  pdf.text(sr.stoneType, MARGIN, stoneNameY);
  setLabel(pdf);
  pdf.setTextColor(...C.muted);
  pdf.text(
    `${sr.checksMatched} / ${sr.checksTotal} variables within reference range   \u00b7   ${sr.confidenceLabel}`,
    MARGIN, stoneNameY + 8
  );
  pdf.setTextColor(...C.text);
  cur.advance(20);

  // Summary paragraph
  bodyText(cur, sr.summary);
  cur.advance(3);
  bodyText(cur, sr.detail);
  cur.advance(6);
  divider(pdf, cur.y);
  cur.advance(8);

  // Variable-by-variable comparison table
  sectionH2(cur, "Variable-by-Variable Comparison");
  const stoneCols: TableCol[] = [
    { header: "Variable",      width: 38 },
    { header: "Entered (%)",   width: 30, align: "center" },
    { header: "Reference (%)", width: 32, align: "center" },
    { header: "Deviation (%)", width: 30, align: "center" },
    { header: "Status",        width: CONTENT_W - 130, align: "center" },
  ];
  const stoneRows = sr.variableChecks.map(v => [
    v.label,
    v.userValue < 0.1 ? v.userValue.toFixed(4) : v.userValue.toFixed(2),
    v.refValue  < 0.1 ? v.refValue.toFixed(4)  : v.refValue.toFixed(2),
    v.deviation.toFixed(1),
    v.inBounds ? "Within range" : "Out of bounds",
  ]);
  drawTable(cur, stoneCols, stoneRows);
  cur.advance(4);

  // Deviation detail notes (out-of-bounds only)
  const outVars = sr.variableChecks.filter(v => !v.inBounds);
  if (outVars.length > 0) {
    divider(pdf, cur.y);
    cur.advance(8);
    sectionH2(cur, "Deviation Notes");
    for (const v of outVars) {
      cur.need(8);
      setBodyBold(pdf);
      pdf.setTextColor(...C.amber);
      pdf.text(`\u26a0  ${v.label}:`, MARGIN, cur.y);
      cur.advance(6.5);
      bodyText(cur, v.reason);
      cur.advance(3);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PAGE 4 — Graphical Comparison + Identity Conclusion
  // ══════════════════════════════════════════════════════════════════════════════
  drawFooter(pdf, cur.pageNum);
  cur.forcePage(4);

  sectionH1(cur, "Graphical Comparison & Identity Conclusion");

  // ── Case A: stone specified ──────────────────────────────────────────────────
  if (!isOther) {
    sectionH2(cur, `Entered Values vs ${sr.stoneType} Reference`);
    if (stoneImg) {
      const chartH = Math.min(88, sr.variableChecks.length * 16 + 32);
      addImage(cur, stoneImg, CONTENT_W, chartH);
    }
    cur.advance(4);
    divider(pdf, cur.y);
    cur.advance(8);

    sectionH2(cur, "Stone Identity Conclusion");
    const heavyVarNames = ["mc", "moisture", "porosity", "al2o3", "al\u2082o\u2083", "cao"];
    const heavyOut      = outVars.filter(v =>
      heavyVarNames.some(h => v.label.toLowerCase().includes(h))
    );
    const outRatio = sr.checksTotal > 0 ? outVars.length / sr.checksTotal : 0;

    if (outVars.length === 0) {
      bodyText(cur,
        `All ${sr.checksTotal} measured variables fall within the expected reference range for ${sr.stoneType}. ` +
        `This provides strong evidence that the aggregate under assessment is consistent with ${sr.stoneType} ` +
        `as typically sourced and characterised in the Tanzanian context. The chemical composition and physical ` +
        `properties align well with the literature values and experimental benchmarks used to calibrate this model. ` +
        `No further re-identification is warranted based on available data. Nonetheless, standard laboratory verification ` +
        `per applicable ASTM or BS standards is recommended before the aggregate is accepted for final engineering specification.`
      );
    } else if (heavyOut.length >= 1 || outRatio >= 0.25) {
      const outNames = heavyOut.length > 0
        ? heavyOut.map(v => v.label).join(", ")
        : outVars.map(v => v.label).join(", ");
      bodyText(cur,
        `The analysis reveals that ${outNames} — ${heavyOut.length > 0 ? "a high-weight variable carrying significant influence within the adhesivity model" : "one or more key variables"} — ` +
        `falls outside the expected bounds for ${sr.stoneType}. ` +
        `This level of deviation warrants serious engineering consideration. Two primary explanations must be investigated. ` +
        `First, laboratory measurement errors or sampling inconsistencies may have affected the recorded values, ` +
        `in which case it is recommended that the relevant tests be repeated under controlled conditions using ` +
        `fresh representative samples and calibrated instruments. ` +
        `Second, and equally important, the aggregate may not in fact be the ${sr.stoneType} it was identified as. ` +
        `Misidentification is not uncommon in field practice, particularly when aggregates originate from quarries ` +
        `with transitional or heterogeneous geology. ` +
        `It is therefore strongly recommended that the stone be re-examined using petrographic analysis ` +
        `or X-ray fluorescence (XRF) confirmation before it is accepted for use in bituminous pavement construction. ` +
        `Proceeding with unverified aggregate identity and anomalous chemical properties carries a meaningful risk ` +
        `of premature pavement failure, particularly in respect of bitumen adhesion and moisture susceptibility.`
      );
    } else {
      bodyText(cur,
        `${outVars.length} out of ${sr.checksTotal} variables (${(outRatio * 100).toFixed(0)}%) fall outside the reference range for ${sr.stoneType}. ` +
        `This is within an acceptable margin of variation that may arise from natural geological heterogeneity, ` +
        `minor differences in quarry location, or slight variations in sample preparation and testing methodology. ` +
        `The aggregate is broadly consistent with ${sr.stoneType}, though the deviating variable${outVars.length > 1 ? "s" : ""} — ` +
        `${outVars.map(v => v.label).join(", ")} — should be clearly noted in the engineering record. ` +
        `Where these deviations coincide with properties that directly influence bitumen adhesion, ` +
        `such as surface chemistry or moisture uptake capacity, additional adhesivity testing per ASTM D1664 ` +
        `is advisable prior to final aggregate approval for the intended project type.`
      );
    }

  // ── Case B: stone is "Other" ─────────────────────────────────────────────────
  } else {
    bodyText(cur,
      "Since the aggregate type was not specified, the entered values are compared against all three reference " +
      "aggregates characterised in this study: Basalt (Ntyuka, Dodoma), Granite (Chinangali, Dodoma), and " +
      "Limestone (Dar es Salaam). Deviations are colour-coded: green (\u226430%), amber (31\u201360%), red (>60%)."
    );
    cur.advance(4);

    const chartH = 88;
    if (basaltImg) {
      sectionH2(cur, "Comparison vs Basalt (Ntyuka, Dodoma)");
      addImage(cur, basaltImg, CONTENT_W, chartH);
    }
    if (graniteImg) {
      sectionH2(cur, "Comparison vs Granite (Chinangali, Dodoma)");
      addImage(cur, graniteImg, CONTENT_W, chartH);
    }
    if (limestoneImg) {
      sectionH2(cur, "Comparison vs Limestone (Dar es Salaam)");
      addImage(cur, limestoneImg, CONTENT_W, chartH);
    }

    // Similarity scores + conclusion
    const ev     = buildEnteredValuesMap(result);
    const scores = [
      { stone: "Basalt",    score: calcSimilarityScore(ev, "basalt")    },
      { stone: "Granite",   score: calcSimilarityScore(ev, "granite")   },
      { stone: "Limestone", score: calcSimilarityScore(ev, "limestone") },
    ].sort((a, b) => a.score - b.score);

    const best   = scores[0];
    const second = scores[1];
    const third  = scores[2];
    const margin = second.score - best.score;

    divider(pdf, cur.y);
    cur.advance(8);
    sectionH2(cur, "Stone Identity Conclusion");

    if (best.score < 30) {
      bodyText(cur,
        `Based on a systematic comparison of the entered physical and chemical properties against all three reference ` +
        `aggregates, the unspecified sample most closely resembles ${best.stone}, with a mean variable deviation of ` +
        `${best.score.toFixed(1)}% relative to the ${best.stone} reference dataset (Senzota, 2026). ` +
        `In contrast, deviations from ${second.stone} and ${third.stone} stand at ${second.score.toFixed(1)}% and ` +
        `${third.score.toFixed(1)}% respectively, indicating substantially greater dissimilarity. ` +
        `The relatively low deviation across the majority of key variables — including those carrying the highest ` +
        `model weight, such as Moisture Content and Porosity — lends additional confidence to this identification. ` +
        `It is therefore reasonable to provisionally classify this aggregate as ${best.stone} for the purposes of ` +
        `adhesivity estimation, while acknowledging that formal petrographic or XRF confirmation is required before ` +
        `this classification is used for contractual or construction specification purposes.`
      );
    } else if (margin < 10) {
      bodyText(cur,
        `The comparison analysis reveals a degree of ambiguity in the identification of this aggregate. ` +
        `The closest match is ${best.stone} (mean deviation: ${best.score.toFixed(1)}%), followed closely by ` +
        `${second.stone} (${second.score.toFixed(1)}%), a difference of only ${margin.toFixed(1)} percentage points. ` +
        `This narrow margin indicates that the entered values do not unambiguously align with any single reference ` +
        `aggregate in this study. This situation may arise from the aggregate originating at a transitional geological ` +
        `boundary, or from blending of materials from different sources. ` +
        `Given this uncertainty, formal petrographic analysis and full XRF characterisation are strongly recommended ` +
        `before any adhesivity conclusions are applied to engineering design. In the interim, the prediction should be ` +
        `treated as indicative, and conservative practice dictates that direct adhesivity testing per ASTM D1664 be ` +
        `conducted on representative samples prior to specification.`
      );
    } else {
      bodyText(cur,
        `The entered aggregate properties do not closely correspond to any of the three reference aggregates ` +
        `characterised in this study. The least dissimilar reference is ${best.stone} (mean deviation: ` +
        `${best.score.toFixed(1)}%), yet this deviation — ${best.score >= 60 ? "exceeding 60%" : "between 30% and 60%"} ` +
        `— indicates a materially different chemical and physical profile from all studied references. ` +
        `This may suggest that the aggregate originates from a rock type not represented in this study, ` +
        `such as quartzite, dolerite, tuff, or other volcanic or sedimentary formations. ` +
        `Under these circumstances, the adhesivity prediction carries heightened uncertainty and must be interpreted ` +
        `with considerable caution. Comprehensive XRF analysis, petrographic identification, and direct laboratory ` +
        `adhesivity testing are essential before this aggregate is approved for any bituminous pavement layer.`
      );
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // PAGE 5 — Model Basis & Limitations
  // ══════════════════════════════════════════════════════════════════════════════
  drawFooter(pdf, cur.pageNum);
  cur.forcePage(5);

  sectionH1(cur, "Model Basis & Limitations");
  cur.advance(2);

  sectionH2(cur, "Overview");
  bodyText(cur,
    "The adhesivity prediction is produced by a weighted index-scoring model comprising six input factors: " +
    "Moisture Content (MC, weight 33%), Porosity (24%), Al\u2082O\u2083 (18%), CaO (14%), SiO\u2082 (7%), and Fe\u2082O\u2083 (4%). " +
    "Factor weights were derived through a hybrid approach combining data-driven calibration and engineering judgment, " +
    "informed by the relative sensitivity of bitumen adhesion to each property as established in the literature."
  );
  cur.advance(5);

  sectionH2(cur, "Calibration Data");
  bodyText(cur,
    "The model was calibrated against experimental Retained Coating (RC) data obtained from three aggregate types " +
    "tested with C55 cationic moderate-setting bitumen emulsion as the binder (Senzota, 2026). " +
    "The aggregate sources and their respective properties are summarised in the calibration table below."
  );
  cur.advance(4);

  // Calibration data table
  const calCols: TableCol[] = [
    { header: "Aggregate",          width: 38 },
    { header: "Source / Location",  width: 52 },
    { header: "RC (%)",             width: 20, align: "center" },
    { header: "Porosity (%)",       width: 24, align: "center" },
    { header: "MC (%)",             width: 25, align: "center" },
  ];
  const calRows = [
    ["Basalt",    "Ntyuka Quarry, Dodoma",        "96",  "0.49",  "0.0245"],
    ["Granite",   "Chinangali Quarry, Dodoma",     "86",  "1.36",  "0.1526"],
    ["Limestone", "Dar es Salaam",                 "45",  "20.20", "2.2531"],
  ];
  drawTable(cur, calCols, calRows);
  cur.advance(3);

  sectionH2(cur, "Laboratory Testing");
  bodyText(cur,
    "A total of 120 specimens were prepared and tested (10 replicas per aggregate per test). " +
    "Moisture Content tests were conducted at Tanroads Dodoma; Porosity tests at GST Dodoma; " +
    "X-ray fluorescence (XRF) chemical analysis at TIRDO Dar es Salaam; " +
    "and adhesivity tests per ASTM D1664 at Tanroads Dodoma. " +
    "The model achieves a mean absolute error (MAE) of 6.65% on the calibration dataset, corresponding to a " +
    "90% confidence interval of approximately \u00b110% on all predicted RC values."
  );
  cur.advance(5);

  sectionH2(cur, "Limitations");
  bodyText(cur,
    "The following limitations must be acknowledged when interpreting results from this model:"
  );
  cur.advance(3);

  const limitations = [
    "The model is calibrated on only three data points (Basalt, Granite, Limestone) from Tanzanian sources. " +
    "Extrapolation to aggregates from substantially different geological formations or geographic regions may " +
    "introduce systematic errors that cannot be quantified from available data.",

    "Results labelled \u2018Index-based\u2019 are indicative estimates only. They are produced when the entered " +
    "aggregate properties differ materially from all three reference data points. These results carry greater " +
    "uncertainty and must not be used as the sole basis for engineering decisions.",

    "The adhesivity score reflects the intrinsic properties of the aggregate only. It does not account for " +
    "site-specific variables such as ambient temperature and humidity at time of application, traffic loading, " +
    "bitumen emulsion storage conditions, or surface cleanliness of the aggregate at the time of priming.",

    "This tool is intended to assist engineering assessment and preliminary aggregate screening. It does not " +
    "replace laboratory testing per ASTM D1664, BS 812, or equivalent standards, which remain mandatory " +
    "for final pavement design and specification.",
  ];

  for (let li = 0; li < limitations.length; li++) {
    cur.need(8);
    setBodyBold(pdf);
    pdf.setTextColor(...C.primary);
    pdf.text(`${li + 1}.`, MARGIN, cur.y);
    setBody(pdf);
    pdf.setTextColor(...C.text);
    const lLines = pdf.splitTextToSize(limitations[li], CONTENT_W - 10);
    for (const ll of lLines) {
      cur.need(6.5);
      pdf.text(ll, MARGIN + 8, cur.y);
      cur.advance(6.5);
    }
    cur.advance(4);
  }

  cur.advance(4);

  // Footer on last page
  drawFooter(pdf, cur.pageNum);

  // ── Save ───────────────────────────────────────────────────────────────────────
  const safeName = (aggregateName ?? "aggregate").replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const dateStr  = engineerInfo.date.replace(/-/g, "");
  pdf.save(`AggregateIQ_Report_${safeName}_${dateStr}.pdf`);
}
