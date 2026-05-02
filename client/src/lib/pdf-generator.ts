/**
 * pdf-generator.ts — Generates PDF report from AggregateIQ analysis results
 *
 * Typography : Georgia serif throughout (12pt body, 14pt h1, 13pt h2, 10pt labels)
 * Layout     : A4 portrait, 25.4 mm margins on all four sides
 * Pages      : Dynamic — new pages added automatically as content grows
 * Charts     : Score meter (page 1) + Stone variable chart (page 2 or beyond)
 *              Factor contributions are rendered as a clean table (no bar chart)
 * Stone logic:
 *   Case A (stone specified)  : single comparison table + smart conclusion
 *   Case B (stone = "Other")  : three SVG charts (vs Basalt/Granite/Limestone) + conclusion
 */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { type AdhesivityResult } from "./adhesivity-model";
import { type EngineerInfo } from "../components/pdf/pdf-engineer-modal";

// ── Colour palette ────────────────────────────────────────────────────────────
const C = {
  primary : [1,   105, 111] as [number,number,number],   // #01696F
  text    : [40,   37,  29] as [number,number,number],   // #28251D
  muted   : [122, 121, 116] as [number,number,number],   // #7A7974
  border  : [212, 209, 202] as [number,number,number],   // #D4D1CA
  bg      : [247, 246, 242] as [number,number,number],   // #F7F6F2
  white   : [255, 255, 255] as [number,number,number],
  amber   : [209, 153,   0] as [number,number,number],   // #D19900
  green   : [67,  122,  34] as [number,number,number],   // #437A22
  red     : [150,  66,  25] as [number,number,number],   // #964219
};

function hexToRgb(hex: string): [number,number,number] {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

// ── Page geometry (mm) ────────────────────────────────────────────────────────
const MARGIN     = 25.4;   // 2.54 cm on all sides
const PAGE_W     = 210;
const PAGE_H     = 297;
const CONTENT_W  = PAGE_W - MARGIN * 2;   // 159.2 mm
const HEADER_H   = 16;                    // top bar height
const FOOTER_H   = 16;                    // reserved at bottom for footer
const BODY_TOP   = MARGIN + HEADER_H + 4; // first usable y after header
const BODY_BOTTOM= PAGE_H - MARGIN - FOOTER_H;

// ── Font helpers ──────────────────────────────────────────────────────────────
// jsPDF built-in "times" = Times New Roman (closest to Georgia available without embedding)
// We use it for all body and heading text to approximate Georgia rendering.
const F = "times";   // serif built-in

function setBody(pdf: jsPDF)    { pdf.setFont(F, "normal"); pdf.setFontSize(12); }
function setBodyBold(pdf: jsPDF){ pdf.setFont(F, "bold");   pdf.setFontSize(12); }
function setLabel(pdf: jsPDF)   { pdf.setFont(F, "normal"); pdf.setFontSize(10); }
function setH1(pdf: jsPDF)      { pdf.setFont(F, "bold");   pdf.setFontSize(14); }
function setH2(pdf: jsPDF)      { pdf.setFont(F, "bold");   pdf.setFontSize(13); }

// ── SVG → PNG dataURL ─────────────────────────────────────────────────────────
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

// ── Page cursor — tracks current Y, auto-adds pages ──────────────────────────
class PageCursor {
  pdf: jsPDF;
  y: number;
  pageNum: number;
  totalPagesRef: { n: number };

  constructor(pdf: jsPDF) {
    this.pdf           = pdf;
    this.y             = BODY_TOP;
    this.pageNum       = 1;
    this.totalPagesRef = { n: 1 };
  }

  // Ensure at least `needed` mm of space remains; if not, break to new page.
  need(needed: number) {
    if (this.y + needed > BODY_BOTTOM) {
      this.newPage();
    }
  }

  newPage() {
    drawFooter(this.pdf, this.pageNum);
    this.pdf.addPage();
    this.pageNum++;
    this.totalPagesRef.n = this.pageNum;
    drawHeader(this.pdf);
    this.y = BODY_TOP;
  }

  // Advance y by delta mm
  advance(delta: number) { this.y += delta; }
}

// ── Page header ───────────────────────────────────────────────────────────────
function drawHeader(pdf: jsPDF) {
  pdf.setFillColor(...C.primary);
  pdf.rect(0, 0, PAGE_W, HEADER_H, "F");

  pdf.setTextColor(...C.white);
  pdf.setFont(F, "bold");
  pdf.setFontSize(11);
  pdf.text("AggregateIQ", MARGIN, 10.5);

  pdf.setFont(F, "normal");
  pdf.setFontSize(8.5);
  pdf.text("Aggregate Selection Companion \u2014 Bituminous Pavement Engineering", MARGIN + 32, 10.5);

  pdf.setTextColor(...C.text);
}

// ── Page footer ───────────────────────────────────────────────────────────────
function drawFooter(pdf: jsPDF, pageNum: number) {
  const footerY = PAGE_H - MARGIN - 8;
  pdf.setDrawColor(...C.border);
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN, footerY, PAGE_W - MARGIN, footerY);

  pdf.setFont(F, "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(...C.muted);
  pdf.text(
    "Generated by AggregateIQ \u2014 For engineering assessment purposes only. Verify with laboratory testing before final specification.",
    MARGIN, footerY + 5
  );
  pdf.text(`Page ${pageNum}`, PAGE_W - MARGIN, footerY + 5, { align: "right" });
}

// ── Divider line ──────────────────────────────────────────────────────────────
function divider(pdf: jsPDF, y: number) {
  pdf.setDrawColor(...C.border);
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN, y, PAGE_W - MARGIN, y);
}

// ── Section heading (h1 style — teal bar) ─────────────────────────────────────
function sectionH1(cur: PageCursor, text: string) {
  cur.need(14);
  const pdf = cur.pdf;
  pdf.setFillColor(...C.bg);
  pdf.setDrawColor(...C.border);
  pdf.roundedRect(MARGIN, cur.y - 5, CONTENT_W, 12, 2, 2, "FD");
  setH1(pdf);
  pdf.setTextColor(...C.primary);
  pdf.text(text.toUpperCase(), MARGIN + 5, cur.y + 3.5);
  pdf.setTextColor(...C.text);
  cur.advance(14);
}

// ── Sub-heading (h2 style) ────────────────────────────────────────────────────
function sectionH2(cur: PageCursor, text: string) {
  cur.need(10);
  const pdf = cur.pdf;
  setH2(pdf);
  pdf.setTextColor(...C.primary);
  pdf.text(text, MARGIN, cur.y);
  pdf.setTextColor(...C.text);
  cur.advance(7);
}

// ── Body paragraph (auto-wrap, auto-page) ─────────────────────────────────────
function bodyText(cur: PageCursor, text: string, color?: [number,number,number]) {
  const pdf   = cur.pdf;
  setBody(pdf);
  if (color) pdf.setTextColor(...color); else pdf.setTextColor(...C.text);
  const lines = pdf.splitTextToSize(text, CONTENT_W);
  for (const line of lines) {
    cur.need(6);
    pdf.text(line, MARGIN, cur.y);
    cur.advance(6.5);
  }
  pdf.setTextColor(...C.text);
}

// ── Label text (small, muted) ─────────────────────────────────────────────────
function labelText(cur: PageCursor, text: string) {
  const pdf = cur.pdf;
  setLabel(pdf);
  pdf.setTextColor(...C.muted);
  const lines = pdf.splitTextToSize(text, CONTENT_W);
  for (const line of lines) {
    cur.need(5);
    pdf.text(line, MARGIN, cur.y);
    cur.advance(5.5);
  }
  pdf.setTextColor(...C.text);
}

// ── Simple table ──────────────────────────────────────────────────────────────
interface TableCol { header: string; width: number; align?: "left"|"center"|"right" }

function drawTable(cur: PageCursor, cols: TableCol[], rows: string[][], headerBg?: [number,number,number]) {
  const pdf    = cur.pdf;
  const ROW_H  = 8;
  const PAD    = 3;
  const hbg    = headerBg ?? C.primary;

  // Header row
  cur.need(ROW_H + 2);
  let x = MARGIN;
  pdf.setFillColor(...hbg);
  pdf.rect(MARGIN, cur.y - ROW_H + 2, CONTENT_W, ROW_H, "F");
  setLabel(pdf);
  pdf.setTextColor(...C.white);
  for (const col of cols) {
    const tx = col.align === "right" ? x + col.width - PAD
             : col.align === "center" ? x + col.width / 2
             : x + PAD;
    pdf.text(col.header, tx, cur.y, { align: col.align === "center" ? "center" : col.align === "right" ? "right" : "left" });
    x += col.width;
  }
  pdf.setTextColor(...C.text);
  cur.advance(ROW_H);

  // Data rows
  let shade = false;
  for (const row of rows) {
    cur.need(ROW_H);
    if (shade) {
      pdf.setFillColor(...C.bg);
      pdf.rect(MARGIN, cur.y - ROW_H + 2, CONTENT_W, ROW_H, "F");
    }
    // Row border
    pdf.setDrawColor(...C.border);
    pdf.setLineWidth(0.2);
    pdf.line(MARGIN, cur.y - ROW_H + 2 + ROW_H, PAGE_W - MARGIN, cur.y - ROW_H + 2 + ROW_H);

    x = MARGIN;
    setBody(pdf);
    pdf.setFontSize(11);
    for (let ci = 0; ci < cols.length; ci++) {
      const col  = cols[ci];
      const cell = row[ci] ?? "";
      const tx   = col.align === "right" ? x + col.width - PAD
                 : col.align === "center" ? x + col.width / 2
                 : x + PAD;
      pdf.text(cell, tx, cur.y, { align: col.align === "center" ? "center" : col.align === "right" ? "right" : "left" });
      x += col.width;
    }
    cur.advance(ROW_H);
    shade = !shade;
  }

  // Outer border
  pdf.setDrawColor(...C.border);
  pdf.setLineWidth(0.4);
  const tableH = (rows.length + 1) * ROW_H;
  pdf.rect(MARGIN, cur.y - tableH - 2, CONTENT_W, tableH + 2, "S");

  cur.advance(5);
}

// ── Image helper — centres image, adds new page if needed ─────────────────────
function addImage(cur: PageCursor, imgData: string, imgW: number, imgH: number) {
  if (imgH > BODY_BOTTOM - BODY_TOP - 10) {
    // Image taller than a full page — scale it to fit
    const scale = (BODY_BOTTOM - BODY_TOP - 10) / imgH;
    imgW = imgW * scale;
    imgH = imgH * scale;
  }
  cur.need(imgH + 4);
  const x = MARGIN + (CONTENT_W - imgW) / 2;
  cur.pdf.addImage(imgData, "PNG", x, cur.y, imgW, imgH);
  cur.advance(imgH + 6);
}

// ── Impact label ──────────────────────────────────────────────────────────────
function impactLabel(impact: string): string {
  if (impact === "positive") return "Positive (+)";
  if (impact === "negative") return "Negative (-)";
  return "Neutral (~)";
}

// ── Grade pill (inline colored text) ─────────────────────────────────────────
function gradePill(cur: PageCursor, grade: string, gradeColor: string) {
  const pdf   = cur.pdf;
  const rgb   = hexToRgb(gradeColor);
  const W_pill = 60, H_pill = 11;
  const x     = MARGIN + (CONTENT_W - W_pill) / 2;

  pdf.setFillColor(rgb[0], rgb[1], rgb[2]);
  pdf.setGState(new (pdf as any).GState({ opacity: 0.12 }));
  pdf.roundedRect(x, cur.y, W_pill, H_pill, 5, 5, "F");
  pdf.setGState(new (pdf as any).GState({ opacity: 1.0 }));
  pdf.setDrawColor(...rgb);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(x, cur.y, W_pill, H_pill, 5, 5, "S");

  setBodyBold(pdf);
  pdf.setTextColor(...rgb);
  pdf.text(grade, MARGIN + CONTENT_W / 2, cur.y + 7.5, { align: "center" });
  pdf.setTextColor(...C.text);
  cur.advance(H_pill + 5);
}

// ── Main generator ────────────────────────────────────────────────────────────
export async function generatePdfReport(
  result: AdhesivityResult,
  engineerInfo: EngineerInfo,
  aggregateName?: string,
): Promise<void> {

  // Import SVG builders dynamically
  const { buildScoreMeterSvg, buildStoneChartSvg, buildTripleChartSvg, calcSimilarityScore } =
    await import("./pdf-svg-builders");

  // Determine stone type
  const isOther       = !result.stoneRecognition.stoneType ||
                        result.stoneRecognition.stoneType.toLowerCase() === "other";

  // Build meter image
  const meterSvg = buildScoreMeterSvg(result, engineerInfo.meterStyle);
  const meterImg = await svgStringToImg(meterSvg);

  // Build stone chart(s)
  let stoneImg: string | null = null;
  let basaltImg: string | null = null;
  let graniteImg: string | null = null;
  let limestoneImg: string | null = null;

  if (!isOther) {
    const stoneSvg = buildStoneChartSvg(result.stoneRecognition);
    stoneImg = await svgStringToImg(stoneSvg);
  } else {
    // Build entered values map for Case B
    const ev = buildEnteredValuesMap(result);
    const [bSvg, gSvg, lSvg] = [
      buildTripleChartSvg(ev, "basalt"),
      buildTripleChartSvg(ev, "granite"),
      buildTripleChartSvg(ev, "limestone"),
    ];
    [basaltImg, graniteImg, limestoneImg] = await Promise.all([
      svgStringToImg(bSvg),
      svgStringToImg(gSvg),
      svgStringToImg(lSvg),
    ]);
  }

  // ── Create PDF ─────────────────────────────────────────────────────────────
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  drawHeader(pdf);

  const cur = new PageCursor(pdf);

  const gradeRgb = hexToRgb(result.gradeColor);
  const sr       = result.stoneRecognition;

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 1 — Engineer Information
  // ════════════════════════════════════════════════════════════════════════════
  sectionH1(cur, "Engineer Information");

  // Info block (3-column)
  const iW = CONTENT_W / 3;
  const fields = [
    { label: "Prepared By",       value: engineerInfo.name    || "\u2014" },
    { label: "Organization",      value: engineerInfo.company || "\u2014" },
    { label: "Date",              value: engineerInfo.date    || "\u2014" },
  ];
  cur.need(24);
  pdf.setFillColor(...C.bg);
  pdf.setDrawColor(...C.border);
  pdf.roundedRect(MARGIN, cur.y, CONTENT_W, 22, 2, 2, "FD");

  for (let fi = 0; fi < fields.length; fi++) {
    const fx = MARGIN + fi * iW + 5;
    setLabel(pdf);
    pdf.setTextColor(...C.muted);
    pdf.text(fields[fi].label.toUpperCase(), fx, cur.y + 7);
    setBodyBold(pdf);
    pdf.setTextColor(...C.text);
    pdf.text(fields[fi].value, fx, cur.y + 16);
  }
  cur.advance(28);

  if (aggregateName) {
    cur.need(8);
    setBody(pdf);
    pdf.setTextColor(...C.muted);
    pdf.text(`Aggregate: ${aggregateName}`, MARGIN + CONTENT_W / 2, cur.y, { align: "center" });
    pdf.setTextColor(...C.text);
    cur.advance(8);
  }

  divider(pdf, cur.y);
  cur.advance(6);

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 2 — Predicted Retained Coating
  // ════════════════════════════════════════════════════════════════════════════
  sectionH1(cur, "Predicted Retained Coating (RC)");

  // Score meter image — centred, 95x72 mm
  addImage(cur, meterImg, 95, 72);

  // Grade pill
  gradePill(cur, result.grade, result.gradeColor);

  // Confidence + CI note
  cur.need(8);
  setLabel(pdf);
  pdf.setTextColor(...C.muted);
  pdf.text(
    `Confidence Interval: \u00b110% (90%)   \u00b7   ${result.confidence === "experimental" ? "Experimentally validated" : "Index-based estimate"}`,
    MARGIN + CONTENT_W / 2, cur.y, { align: "center" }
  );
  pdf.setTextColor(...C.text);
  cur.advance(8);

  // Incomplete warning banner
  if (result.incomplete) {
    cur.need(16);
    pdf.setFillColor(209, 153, 0);
    pdf.setGState(new (pdf as any).GState({ opacity: 0.10 }));
    pdf.roundedRect(MARGIN, cur.y, CONTENT_W, 14, 2, 2, "F");
    pdf.setGState(new (pdf as any).GState({ opacity: 1.0 }));
    pdf.setDrawColor(...C.amber);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(MARGIN, cur.y, CONTENT_W, 14, 2, 2, "S");
    setBodyBold(pdf);
    pdf.setTextColor(...C.amber);
    pdf.text("\u26a0  REDUCED ACCURACY \u2014 Incomplete Data", MARGIN + 5, cur.y + 6);
    setLabel(pdf);
    pdf.text(
      `${result.missingVars.join(" and ")} not provided. Results are indicative only.`,
      MARGIN + 5, cur.y + 11
    );
    pdf.setTextColor(...C.text);
    cur.advance(18);
  }

  divider(pdf, cur.y);
  cur.advance(6);

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 3 — Factor Contributions (Table)
  // ════════════════════════════════════════════════════════════════════════════
  sectionH1(cur, "Factor Contributions to Adhesivity Score");

  const factorCols: TableCol[] = [
    { header: "Factor",           width: 55 },
    { header: "Weight (%)",       width: 25, align: "center" },
    { header: "Score (pts)",      width: 30, align: "center" },
    { header: "Normalised (%)",   width: 30, align: "center" },
    { header: "Impact",           width: CONTENT_W - 140, align: "center" },
  ];

  const factorDefs = [
    { key: "moistureContent" as const, label: "Moisture Content (MC)", weight: "33" },
    { key: "porosity"        as const, label: "Porosity",               weight: "24" },
    { key: "al2o3"           as const, label: "Al\u2082O\u2083",        weight: "18" },
    { key: "cao"             as const, label: "CaO",                    weight: "14" },
    { key: "sio2"            as const, label: "SiO\u2082",              weight: "7"  },
    { key: "fe2o3"           as const, label: "Fe\u2082O\u2083",        weight: "4"  },
  ];

  const factorRows = factorDefs.map(f => {
    const item = result.breakdown[f.key];
    return [
      f.label,
      f.weight + "%",
      item.contribution.toFixed(2),
      ((item.contribution / result.predictedRC) * 100).toFixed(1) + "%",
      impactLabel(item.impact),
    ];
  });

  drawTable(cur, factorCols, factorRows);

  cur.need(7);
  labelText(cur,
    "Note: Score (pts) is the absolute contribution of each factor to the predicted RC. " +
    "Normalised (%) shows each factor\u2019s share of the total score. " +
    "57% of the model weight is physical (MC + Porosity); 43% is chemical (Al\u2082O\u2083 + CaO + SiO\u2082 + Fe\u2082O\u2083)."
  );

  divider(pdf, cur.y);
  cur.advance(6);

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 4 — Project Suitability
  // ════════════════════════════════════════════════════════════════════════════
  sectionH1(cur, "Project Suitability Assessment");

  bodyText(cur, result.recommendation);
  cur.advance(3);

  divider(pdf, cur.y);
  cur.advance(6);

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 5 — Risk Flags
  // ════════════════════════════════════════════════════════════════════════════
  if (result.riskFlags.length > 0) {
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
        cur.need(6);
        pdf.text(fl, MARGIN + 6, cur.y);
        cur.advance(6.5);
      }
      cur.advance(2);
    }
    divider(pdf, cur.y);
    cur.advance(6);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 6 — Stone Recognition
  // ════════════════════════════════════════════════════════════════════════════
  sectionH1(cur, "Stone Recognition Analysis");

  // Stone identity + confidence
  cur.need(14);
  setH2(pdf);
  pdf.setTextColor(...gradeRgb);
  pdf.text(sr.stoneType, MARGIN, cur.y);
  setLabel(pdf);
  pdf.setTextColor(...C.muted);
  pdf.text(
    `${sr.checksMatched}/${sr.checksTotal} variables within reference range   \u00b7   ${sr.confidenceLabel}`,
    MARGIN, cur.y + 7
  );
  pdf.setTextColor(...C.text);
  cur.advance(14);

  // Summary paragraph
  bodyText(cur, sr.summary);
  cur.advance(2);
  bodyText(cur, sr.detail);
  cur.advance(4);

  // ── Case A: Stone specified — table + conclusion ─────────────────────────
  if (!isOther) {
    sectionH2(cur, "Variable-by-Variable Comparison");

    const stoneCols: TableCol[] = [
      { header: "Variable",          width: 36 },
      { header: "Entered (%)",       width: 28, align: "center" },
      { header: "Reference (%)",     width: 30, align: "center" },
      { header: "Deviation (%)",     width: 30, align: "center" },
      { header: "Status",            width: CONTENT_W - 124, align: "center" },
    ];

    const stoneRows = sr.variableChecks.map(v => [
      v.label,
      v.userValue < 0.1 ? v.userValue.toFixed(4) : v.userValue.toFixed(2),
      v.refValue  < 0.1 ? v.refValue.toFixed(4)  : v.refValue.toFixed(2),
      v.deviation.toFixed(1),
      v.inBounds ? "Within range" : "Out of bounds",
    ]);
    drawTable(cur, stoneCols, stoneRows);

    // Deviation details for out-of-bounds variables
    const outVars = sr.variableChecks.filter(v => !v.inBounds);
    if (outVars.length > 0) {
      sectionH2(cur, "Deviation Notes");
      for (const v of outVars) {
        cur.need(8);
        setBodyBold(pdf);
        pdf.setTextColor(...C.amber);
        pdf.text(`\u26a0  ${v.label}:`, MARGIN, cur.y);
        cur.advance(6.5);
        bodyText(cur, v.reason, C.text);
        cur.advance(2);
      }
    }

    // Stone chart image
    if (stoneImg) {
      sectionH2(cur, "Graphical Comparison \u2014 Entered vs Reference Values");
      addImage(cur, stoneImg, CONTENT_W, Math.min(90, sr.variableChecks.length * 16 + 30));
    }

    // Smart conclusion
    cur.need(10);
    sectionH2(cur, "Stone Identity Conclusion");

    const heavyVars = ["MC", "Moisture Content", "Porosity", "Al\u2082O\u2083", "CaO"];
    const heavyOut  = outVars.filter(v =>
      heavyVars.some(h => v.label.toLowerCase().includes(h.toLowerCase()))
    );
    const outRatio = sr.checksTotal > 0 ? outVars.length / sr.checksTotal : 0;
    const heavyTriggered = heavyOut.length >= 1;

    if (outVars.length === 0) {
      bodyText(cur,
        `All ${sr.checksTotal} measured variables fall within the expected reference range for ${sr.stoneType}. ` +
        `This provides strong evidence that the aggregate under assessment is consistent with ${sr.stoneType} ` +
        `as typically sourced and characterised in the Tanzanian context. The chemical composition and physical ` +
        `properties align well with literature values and the experimental benchmarks used to calibrate this model. ` +
        `No further re-identification is warranted based on available data; however, standard laboratory verification ` +
        `per applicable ASTM or BS standards is recommended before final engineering specification.`
      );
    } else if (heavyTriggered || outRatio >= 0.25) {
      const outNames = heavyOut.length > 0
        ? heavyOut.map(v => v.label).join(", ")
        : outVars.map(v => v.label).join(", ");
      bodyText(cur,
        `The analysis reveals that ${outNames} — ${heavyOut.length > 0 ? "a high-weight variable carrying significant influence within the adhesivity model" : "one or more variables"} ` +
        `— falls outside the expected bounds for ${sr.stoneType}. ` +
        `This level of deviation warrants serious engineering consideration. Two primary explanations should be investigated: ` +
        `first, it is possible that laboratory measurement errors or sampling inconsistencies affected the recorded values, ` +
        `in which case it is recommended that the relevant tests be repeated under controlled conditions, ideally using ` +
        `fresh representative samples and calibrated instruments. ` +
        `Second, and equally important, the aggregate may not in fact be the ${sr.stoneType} it was identified as. ` +
        `Misidentification is not uncommon in field practice, particularly when aggregates are sourced from quarries ` +
        `with transitional or heterogeneous geology. It is therefore strongly recommended that the stone be re-examined ` +
        `using petrographic analysis or X-ray fluorescence (XRF) confirmation before it is accepted for use in bituminous ` +
        `pavement construction. Proceeding with unverified aggregate identity and anomalous chemical properties carries ` +
        `a meaningful risk of premature pavement failure, particularly in respect of bitumen adhesion and moisture susceptibility.`
      );
    } else {
      bodyText(cur,
        `${outVars.length} out of ${sr.checksTotal} variables (${(outRatio * 100).toFixed(0)}%) fall outside the reference range for ${sr.stoneType}. ` +
        `This is within an acceptable margin of variation that may arise from natural geological heterogeneity, ` +
        `minor differences in quarry location, or slight variations in sample preparation. ` +
        `The aggregate is broadly consistent with ${sr.stoneType}, though the deviating variable${outVars.length > 1 ? "s" : ""} — ` +
        `${outVars.map(v => v.label).join(", ")} — should be noted in the engineering record. ` +
        `Where these deviations coincide with properties that directly influence bitumen adhesion, ` +
        `such as surface chemistry or moisture uptake, additional adhesivity testing per ASTM D1664 ` +
        `is advisable to confirm suitability for the intended project type.`
      );
    }

  // ── Case B: Stone is "Other" — triple charts + conclusion ───────────────
  } else {
    sectionH2(cur, "Comparison vs All Reference Aggregates");
    bodyText(cur,
      "Since the aggregate type was not specified, the entered values have been compared against the three " +
      "reference aggregates characterised in this study (Basalt \u2014 Ntyuka, Dodoma; Granite \u2014 Chinangali, Dodoma; " +
      "Limestone \u2014 Dar es Salaam). The charts below show the entered values against each reference, " +
      "allowing a visual assessment of similarity. Deviations are colour-coded: green (\u226430%), amber (30\u201360%), red (>60%)."
    );
    cur.advance(4);

    const imgH = 95;
    const imgW = CONTENT_W;

    if (basaltImg) {
      sectionH2(cur, "Comparison vs Basalt (Ntyuka, Dodoma)");
      addImage(cur, basaltImg, imgW, imgH);
    }
    if (graniteImg) {
      sectionH2(cur, "Comparison vs Granite (Chinangali, Dodoma)");
      addImage(cur, graniteImg, imgW, imgH);
    }
    if (limestoneImg) {
      sectionH2(cur, "Comparison vs Limestone (Dar es Salaam)");
      addImage(cur, limestoneImg, imgW, imgH);
    }

    // Conclusion — similarity scores
    sectionH2(cur, "Stone Identity Conclusion");
    const ev = buildEnteredValuesMap(result);
    const scores: { stone: string; score: number }[] = [
      { stone: "Basalt",    score: calcSimilarityScore(ev, "basalt")    },
      { stone: "Granite",   score: calcSimilarityScore(ev, "granite")   },
      { stone: "Limestone", score: calcSimilarityScore(ev, "limestone") },
    ].sort((a, b) => a.score - b.score);

    const best   = scores[0];
    const second = scores[1];
    const third  = scores[2];
    const margin = second.score - best.score;

    if (best.score < 30) {
      bodyText(cur,
        `Based on a systematic comparison of the entered physical and chemical properties against all three reference aggregates, ` +
        `the unspecified aggregate most closely resembles ${best.stone}, with a mean variable deviation of ${best.score.toFixed(1)}% ` +
        `relative to the ${best.stone} reference dataset (Senzota, 2026). ` +
        `In contrast, deviations from ${second.stone} and ${third.stone} stand at ${second.score.toFixed(1)}% and ${third.score.toFixed(1)}% respectively, ` +
        `indicating a substantially greater dissimilarity. ` +
        `The relatively low deviation across the majority of key variables — including those carrying the highest model weight ` +
        `such as Moisture Content and Porosity — lends additional confidence to this identification. ` +
        `It is therefore reasonable to provisionally classify this aggregate as ${best.stone} for the purposes of adhesivity estimation, ` +
        `while acknowledging that formal petrographic or XRF confirmation is required before this classification is used for ` +
        `contractual or construction specification purposes.`
      );
    } else if (margin < 10) {
      bodyText(cur,
        `The comparison analysis reveals a degree of ambiguity in the identification of this aggregate. ` +
        `The closest match is ${best.stone} (mean deviation: ${best.score.toFixed(1)}%), followed closely by ${second.stone} (${second.score.toFixed(1)}%), ` +
        `a difference of only ${margin.toFixed(1)} percentage points. This narrow margin indicates that the entered values ` +
        `do not unambiguously align with any single reference aggregate in this study. ` +
        `This situation may arise from the aggregate originating at a transitional geological boundary, ` +
        `or from blending of materials from different sources. ` +
        `Given this uncertainty, it is strongly recommended that the aggregate be subjected to formal petrographic analysis ` +
        `and full XRF characterisation before adhesivity conclusions are drawn. ` +
        `In the interim, the adhesivity estimate should be treated as indicative, ` +
        `and the conservative recommendation is to conduct direct adhesivity testing per ASTM D1664 on representative samples.`
      );
    } else {
      bodyText(cur,
        `The aggregate properties entered do not closely correspond to any of the three reference aggregates characterised in this study. ` +
        `The least dissimilar reference is ${best.stone} (mean deviation: ${best.score.toFixed(1)}%), ` +
        `yet this deviation level — ${best.score >= 60 ? "exceeding 60%" : "between 30% and 60%"} — indicates that the aggregate ` +
        `has a materially different chemical and physical profile from all studied references. ` +
        `This may indicate that the aggregate originates from a rock type not covered by this study ` +
        `(e.g., quartzite, dolerite, tuff, or other volcanic or sedimentary rocks). ` +
        `Under these circumstances, the adhesivity prediction carries a higher degree of uncertainty, ` +
        `and the result should be interpreted with considerable caution. ` +
        `Direct laboratory adhesivity testing, accompanied by comprehensive XRF analysis and petrographic identification, ` +
        `is essential before this aggregate is approved for use in any bituminous pavement layer.`
      );
    }
  }

  cur.advance(4);
  divider(pdf, cur.y);
  cur.advance(6);

  // ════════════════════════════════════════════════════════════════════════════
  // SECTION 7 — Model Basis
  // ════════════════════════════════════════════════════════════════════════════
  sectionH1(cur, "Model Basis & Limitations");
  bodyText(cur,
    "The adhesivity prediction is produced by a weighted index-scoring model comprising six input factors: " +
    "Moisture Content (MC, weight 33%), Porosity (24%), Al\u2082O\u2083 (18%), CaO (14%), SiO\u2082 (7%), and Fe\u2082O\u2083 (4%). " +
    "The model was calibrated against experimental Retained Coating (RC) data obtained from three aggregate types " +
    "(Basalt from Ntyuka Quarry, Dodoma; Granite from Chinangali Quarry, Dodoma; Limestone from Dar es Salaam) " +
    "using C55 cationic moderate-setting bitumen emulsion as the binder (Senzota, 2026). " +
    "A total of 120 specimens (10 replicas per aggregate per test) were tested at Tanroads Dodoma, GST Dodoma, " +
    "TIRDO Dar es Salaam, and Tanroads Dodoma laboratories. " +
    "The model achieves a mean absolute error (MAE) of 6.65% on the calibration dataset. " +
    "Results labelled \u2018Index-based\u2019 are indicative estimates extrapolated beyond the calibration data range " +
    "and should be treated accordingly."
  );

  // Finalise last page footer
  drawFooter(pdf, cur.pageNum);

  // ── Save ───────────────────────────────────────────────────────────────────
  const safeName = (aggregateName ?? "aggregate").replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const dateStr  = engineerInfo.date.replace(/-/g, "");
  pdf.save(`AggregateIQ_Report_${safeName}_${dateStr}.pdf`);
}

// ── Helper — extract entered values map from result ──────────────────────────
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
