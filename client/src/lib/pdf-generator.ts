/**
 * pdf-generator.ts — Generates 2-page PDF report from AggregateIQ analysis results
 *
 * Strategy:
 *  - Uses jsPDF for layout, text, lines
 *  - Renders SVG score meter and charts via hidden DOM nodes + html2canvas
 *  - Page 1: Header, engineer info, score meter, grade, stone recognition summary
 *  - Page 2: Factor contribution chart, stone variable chart, risk flags, disclaimer
 */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { type AdhesivityResult } from "./adhesivity-model";
import { type EngineerInfo } from "../components/pdf/pdf-engineer-modal";

// ── Colours ──────────────────────────────────────────────────────────────────
const C = {
  primary:    [1,   105, 111] as [number,number,number],   // #01696F teal
  text:       [40,  37,  29]  as [number,number,number],   // #28251D
  muted:      [122, 121, 116] as [number,number,number],   // #7A7974
  border:     [212, 209, 202] as [number,number,number],   // #D4D1CA
  bg:         [247, 246, 242] as [number,number,number],   // #F7F6F2
  white:      [255, 255, 255] as [number,number,number],
  amber:      [209, 153,   0] as [number,number,number],   // #D19900
};

function hexToRgb(hex: string): [number,number,number] {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}

// ── Capture SVG element to PNG dataURL ───────────────────────────────────────
async function captureSvgElement(el: SVGSVGElement): Promise<string> {
  // Wrap SVG in div for html2canvas
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "position:fixed;left:-9999px;top:-9999px;background:white;padding:8px;";
  wrapper.appendChild(el.cloneNode(true));
  document.body.appendChild(wrapper);

  await new Promise(r => setTimeout(r, 80));

  const canvas = await html2canvas(wrapper, {
    scale: 2.5,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });

  document.body.removeChild(wrapper);
  return canvas.toDataURL("image/png");
}

// ── Helper: render React SVG component to DOM element ────────────────────────
async function renderSvgComponent(
  createEl: () => SVGSVGElement
): Promise<string> {
  const el = createEl();
  return captureSvgElement(el);
}

// ── Helper: create inline SVG element from React component ──────────────────
// We create the SVG markup as a string, parse it, capture it
async function svgStringToImg(svgString: string): Promise<string> {
  const parser = new DOMParser();
  const doc    = parser.parseFromString(svgString, "image/svg+xml");
  const svgEl  = doc.documentElement as unknown as SVGSVGElement;

  const wrapper = document.createElement("div");
  wrapper.style.cssText = "position:fixed;left:-9999px;top:-9999px;background:white;padding:12px;";
  wrapper.appendChild(svgEl.cloneNode(true));
  document.body.appendChild(wrapper);

  await new Promise(r => setTimeout(r, 100));

  const canvas = await html2canvas(wrapper, {
    scale: 2.5,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });

  document.body.removeChild(wrapper);
  return canvas.toDataURL("image/png");
}

// ── Page header ──────────────────────────────────────────────────────────────
function drawHeader(pdf: jsPDF, pageNum: number, totalPages: number) {
  const W = pdf.internal.pageSize.getWidth();

  // Top bar
  pdf.setFillColor(...C.primary);
  pdf.rect(0, 0, W, 14, "F");

  // App name
  pdf.setTextColor(...C.white);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("AggregateIQ", 14, 9.5);

  // Subtitle
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.text("Aggregate Selection Companion — Bituminous Pavement Engineering", 50, 9.5);

  // Page number
  pdf.text(`Page ${pageNum} of ${totalPages}`, W - 14, 9.5, { align: "right" });

  // Reset colour
  pdf.setTextColor(...C.text);
}

// ── Section heading ──────────────────────────────────────────────────────────
function sectionHeading(pdf: jsPDF, text: string, y: number) {
  const W = pdf.internal.pageSize.getWidth();
  pdf.setFillColor(...C.bg);
  pdf.roundedRect(14, y - 5, W - 28, 10, 2, 2, "F");
  pdf.setDrawColor(...C.border);
  pdf.roundedRect(14, y - 5, W - 28, 10, 2, 2, "S");
  pdf.setFontSize(8.5);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.primary);
  pdf.text(text.toUpperCase(), 20, y + 1.5);
  pdf.setTextColor(...C.text);
  return y + 9;
}

// ── Divider line ─────────────────────────────────────────────────────────────
function divider(pdf: jsPDF, y: number) {
  const W = pdf.internal.pageSize.getWidth();
  pdf.setDrawColor(...C.border);
  pdf.setLineWidth(0.3);
  pdf.line(14, y, W - 14, y);
}

// ── Main generator ───────────────────────────────────────────────────────────
export async function generatePdfReport(
  result: AdhesivityResult,
  engineerInfo: EngineerInfo,
  aggregateName?: string,
): Promise<void> {

  // ── Dynamically import SVG builders (avoid circular deps at top level) ─────
  const { buildScoreMeterSvg  } = await import("./pdf-svg-builders");
  const { buildFactorChartSvg } = await import("./pdf-svg-builders");
  const { buildStoneChartSvg  } = await import("./pdf-svg-builders");

  // ── Render meter + charts to images ──────────────────────────────────────
  const meterSvg  = buildScoreMeterSvg(result, engineerInfo.meterStyle);
  const factorSvg = buildFactorChartSvg(result.breakdown);
  const stoneSvg  = buildStoneChartSvg(result.stoneRecognition);

  const [meterImg, factorImg, stoneImg] = await Promise.all([
    svgStringToImg(meterSvg),
    svgStringToImg(factorSvg),
    svgStringToImg(stoneSvg),
  ]);

  // ── Create PDF ────────────────────────────────────────────────────────────
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = pdf.internal.pageSize.getWidth();   // 210
  // const H = pdf.internal.pageSize.getHeight();  // 297

  const gradeRgb = hexToRgb(result.gradeColor);

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 1
  // ════════════════════════════════════════════════════════════════════════
  drawHeader(pdf, 1, 2);

  let y = 20;

  // ── Engineer info block ──────────────────────────────────────────────────
  pdf.setFillColor(...C.bg);
  pdf.roundedRect(14, y, W - 28, 24, 2, 2, "F");
  pdf.setDrawColor(...C.border);
  pdf.roundedRect(14, y, W - 28, 24, 2, 2, "S");

  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.muted);
  pdf.text("PREPARED BY",      20, y + 7);
  pdf.text("ORGANIZATION",     80, y + 7);
  pdf.text("DATE",            150, y + 7);

  pdf.setFontSize(9.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.text);
  pdf.text(engineerInfo.name    || "—", 20, y + 16);
  pdf.text(engineerInfo.company || "—", 80, y + 16);
  pdf.text(engineerInfo.date    || "—",150, y + 16);

  y += 30;

  // ── Report title ─────────────────────────────────────────────────────────
  pdf.setFontSize(15);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...C.text);
  pdf.text("Aggregate Adhesivity Assessment Report", W / 2, y, { align: "center" });
  y += 5;

  if (aggregateName) {
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...C.muted);
    pdf.text(`Aggregate: ${aggregateName}`, W / 2, y + 4, { align: "center" });
    y += 8;
  }

  y += 4;
  divider(pdf, y);
  y += 8;

  // ── Score meter ──────────────────────────────────────────────────────────
  y = sectionHeading(pdf, "Predicted Retained Coating", y);
  y += 4;

  // Center the meter image
  const meterW = 90, meterH = 68;
  pdf.addImage(meterImg, "PNG", (W - meterW) / 2, y, meterW, meterH);
  y += meterH + 4;

  // Grade pill
  pdf.setFillColor(gradeRgb[0], gradeRgb[1], gradeRgb[2]);
  pdf.setGState(new (pdf as any).GState({ opacity: 0.12 }));
  pdf.roundedRect((W - 60) / 2, y, 60, 10, 5, 5, "F");
  pdf.setGState(new (pdf as any).GState({ opacity: 1.0 }));
  pdf.setDrawColor(...gradeRgb);
  pdf.setLineWidth(0.5);
  pdf.roundedRect((W - 60) / 2, y, 60, 10, 5, 5, "S");
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...gradeRgb);
  pdf.text(result.grade, W / 2, y + 6.8, { align: "center" });
  y += 14;

  // Confidence badge
  pdf.setFontSize(7.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.muted);
  pdf.text(
    `Confidence interval: ±10% (90%)  ·  ${result.confidence === "experimental" ? "Experimentally validated" : "Index-based estimate"}`,
    W / 2, y, { align: "center" }
  );
  y += 8;

  // Incomplete warning
  if (result.incomplete) {
    pdf.setFillColor(209, 153, 0);
    pdf.setGState(new (pdf as any).GState({ opacity: 0.10 }));
    pdf.roundedRect(14, y, W - 28, 12, 2, 2, "F");
    pdf.setGState(new (pdf as any).GState({ opacity: 1.0 }));
    pdf.setDrawColor(...C.amber);
    pdf.roundedRect(14, y, W - 28, 12, 2, 2, "S");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...C.amber);
    pdf.setFont("helvetica", "bold");
    pdf.text("⚠  REDUCED ACCURACY", 20, y + 5);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${result.missingVars.join(" and ")} not provided. Results are indicative only.`, 20, y + 9.5);
    y += 16;
  }

  divider(pdf, y);
  y += 8;

  // ── Stone recognition summary ────────────────────────────────────────────
  y = sectionHeading(pdf, "Stone Recognition", y);
  y += 5;

  const sr = result.stoneRecognition;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(sr.matched ? gradeRgb[0] : C.muted[0], sr.matched ? gradeRgb[1] : C.muted[1], sr.matched ? gradeRgb[2] : C.muted[2]);
  pdf.text(sr.stoneType, 20, y);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(...C.muted);
  pdf.text(`${sr.checksMatched}/${sr.checksTotal} variables within range  ·  ${sr.confidenceLabel}`, 20, y + 5);
  y += 9;

  // Summary sentence
  pdf.setFontSize(8);
  pdf.setTextColor(...C.text);
  const summaryLines = pdf.splitTextToSize(sr.summary, W - 40);
  pdf.text(summaryLines, 20, y);
  y += summaryLines.length * 4.5 + 2;

  // Detail sentence
  const detailLines = pdf.splitTextToSize(sr.detail, W - 40);
  pdf.setFontSize(7.5);
  pdf.setTextColor(...C.muted);
  pdf.text(detailLines, 20, y);
  y += detailLines.length * 4 + 3;

  // Variable check rows
  const rowH = 8;
  for (const v of sr.variableChecks) {
    const checkColor = v.inBounds ? "#437A22" : "#D19900";
    const checkRgb   = hexToRgb(checkColor);

    pdf.setFontSize(7.5);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...checkRgb);
    pdf.text(v.inBounds ? "✓" : "⚠", 20, y + rowH / 2);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...C.text);
    pdf.text(v.label, 27, y + rowH / 2);

    pdf.setTextColor(...C.muted);
    const enteredFmt = v.userValue < 0.1 ? v.userValue.toFixed(4) : v.userValue.toFixed(2);
    const refFmt     = v.refValue  < 0.1 ? v.refValue.toFixed(4)  : v.refValue.toFixed(2);
    pdf.text(`Entered: ${enteredFmt}%   Ref: ${refFmt}%   Dev: ${v.deviation.toFixed(1)}%`, 75, y + rowH / 2);

    y += rowH;

    if (!v.inBounds) {
      const reasonLines = pdf.splitTextToSize(v.reason, W - 55);
      pdf.setFontSize(7);
      pdf.setTextColor(...C.muted);
      pdf.text(reasonLines, 27, y);
      y += reasonLines.length * 3.8 + 1;
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 2
  // ════════════════════════════════════════════════════════════════════════
  pdf.addPage();
  drawHeader(pdf, 2, 2);
  y = 20;

  // ── Factor contributions chart ───────────────────────────────────────────
  y = sectionHeading(pdf, "Factor Contributions", y);
  y += 4;

  const fcW = W - 28, fcH = 68;
  pdf.addImage(factorImg, "PNG", 14, y, fcW, fcH);
  y += fcH + 8;

  divider(pdf, y);
  y += 8;

  // ── Stone variable chart ─────────────────────────────────────────────────
  y = sectionHeading(pdf, `Stone Variable Analysis — vs ${sr.stoneType} Reference`, y);
  y += 4;

  if (sr.variableChecks.length > 0) {
    const svW = W - 28;
    const svH = Math.min(80, sr.variableChecks.length * 16 + 20);
    pdf.addImage(stoneImg, "PNG", 14, y, svW, svH);
    y += svH + 8;
  }

  divider(pdf, y);
  y += 8;

  // ── Risk flags ───────────────────────────────────────────────────────────
  if (result.riskFlags.length > 0) {
    y = sectionHeading(pdf, "Risk Flags", y);
    y += 5;

    for (const flag of result.riskFlags) {
      pdf.setFontSize(7.5);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(150, 66, 25); // #964219
      pdf.text("▲", 20, y);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...C.text);
      const flagLines = pdf.splitTextToSize(flag.replace(/^⚠ /, ""), W - 45);
      pdf.text(flagLines, 27, y);
      y += flagLines.length * 4.2 + 3;
    }

    y += 3;
    divider(pdf, y);
    y += 8;
  }

  // ── Recommendation ───────────────────────────────────────────────────────
  y = sectionHeading(pdf, "Recommendation", y);
  y += 5;

  pdf.setFillColor(...C.bg);
  const recLines = pdf.splitTextToSize(result.recommendation, W - 40);
  pdf.roundedRect(14, y - 3, W - 28, recLines.length * 4.5 + 8, 2, 2, "F");
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.text);
  pdf.text(recLines, 20, y + 2);
  y += recLines.length * 4.5 + 12;

  // ── Footer disclaimer ────────────────────────────────────────────────────
  const footerY = 275;
  divider(pdf, footerY);

  pdf.setFontSize(6.5);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...C.muted);
  const disclaimer =
    "This report is generated by AggregateIQ based on the adhesivity model calibrated from experimental data (Senzota 2026 — Dodoma/Dar es Salaam). " +
    "Results are for engineering assessment purposes only. Index-based results are indicative estimates. Always verify with laboratory testing before final specification.";
  const disclaimerLines = pdf.splitTextToSize(disclaimer, W - 28);
  pdf.text(disclaimerLines, 14, footerY + 4);

  // ── Save ─────────────────────────────────────────────────────────────────
  const safeName = (aggregateName ?? "aggregate").replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const dateStr  = engineerInfo.date.replace(/-/g, "");
  pdf.save(`AggregateIQ_Report_${safeName}_${dateStr}.pdf`);
}
