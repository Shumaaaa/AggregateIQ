/**
 * pdf-svg-builders.ts — Builds raw SVG strings for PDF chart capture
 * Pure string functions — no React, no DOM at call time.
 *
 * Exports:
 *   buildScoreMeterSvg   — speedometer or arc gauge
 *   buildStoneChartSvg   — single stone comparison (Case A: stone specified)
 *   buildTripleChartSvg  — triple comparison vs all 3 references (Case B: "Other")
 */

import { type AdhesivityResult } from "./adhesivity-model";
import { type MeterStyle } from "../components/pdf/pdf-engineer-modal";

// ── Reference data (same as adhesivity-model) ───────────────────────────────
const REFERENCES: Record<string, Record<string, number>> = {
  basalt: {
    porosity: 0.49, moistureContent: 0.0245,
    sio2: 47.40, al2o3: 8.33, fe2o3: 16.70, cao: 7.28,
  },
  granite: {
    porosity: 1.36, moistureContent: 0.1526,
    sio2: 68.88, al2o3: 8.91, fe2o3: 3.19, cao: 1.71,
  },
  limestone: {
    porosity: 20.20, moistureContent: 2.2531,
    sio2: 5.01, al2o3: 1.39, fe2o3: 0.27, cao: 51.90,
  },
};

const REF_LABELS: Record<string, string> = {
  porosity: "Porosity (%)",
  moistureContent: "MC (%)",
  sio2: "SiO\u2082 (%)",
  al2o3: "Al\u2082O\u2083 (%)",
  fe2o3: "Fe\u2082O\u2083 (%)",
  cao: "CaO (%)",
};

// ── Dial helpers ─────────────────────────────────────────────────────────────
const DIAL_START = 135;
const DIAL_SPAN  = 270;

function valToAngle(v: number) { return DIAL_START + (v / 100) * DIAL_SPAN; }

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const s = polar(cx, cy, r, startDeg);
  const e = polar(cx, cy, r, endDeg);
  const large = (endDeg - startDeg) > 180 ? 1 : 0;
  return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
}

const ZONES = [
  { from: 0,  to: 50,  color: "#964219" },
  { from: 50, to: 70,  color: "#D19900" },
  { from: 70, to: 85,  color: "#20808D" },
  { from: 85, to: 95,  color: "#1B474D" },
  { from: 95, to: 100, color: "#437A22" },
];

// ── Score Meter ──────────────────────────────────────────────────────────────
export function buildScoreMeterSvg(result: AdhesivityResult, style: MeterStyle): string {
  const { predictedRC: val, rcLow: low, rcHigh: high, grade, gradeColor: gc } = result;
  const cx = 160, cy = 155, r = 110;

  const zoneArcs = ZONES.map(z =>
    `<path d="${arc(cx, cy, r, valToAngle(z.from), valToAngle(z.to))}" fill="none" stroke="${z.color}" stroke-width="22" stroke-opacity="0.30"/>`
  ).join("");

  const track  = `<path d="${arc(cx, cy, r, DIAL_START, DIAL_START + DIAL_SPAN)}" fill="none" stroke="#E5E4E0" stroke-width="${style === "arc" ? 22 : 3}"/>`;
  const ciArc  = `<path d="${arc(cx, cy, r, valToAngle(low), valToAngle(high))}" fill="none" stroke="${gc}" stroke-width="${style === "arc" ? 22 : 6}" stroke-opacity="0.22"/>`;
  const valArc = `<path d="${arc(cx, cy, r, DIAL_START, valToAngle(val))}" fill="none" stroke="${gc}" stroke-width="${style === "arc" ? 22 : 4}" stroke-linecap="round"/>`;

  const labels = [0, 50, 100].map(v => {
    const pos = polar(cx, cy, r + (style === "arc" ? 20 : -30), valToAngle(v));
    return `<text x="${pos.x.toFixed(1)}" y="${(pos.y + 4).toFixed(1)}" text-anchor="middle" font-size="11" fill="#9A9996" font-family="Georgia,serif">${v}</text>`;
  }).join("");

  let needle = "";
  if (style === "speedometer") {
    const na  = valToAngle(val);
    const tip = polar(cx, cy, r - 10, na);
    const b1  = polar(cx, cy, 14, na + 90);
    const b2  = polar(cx, cy, 14, na - 90);
    needle = `
      <polygon points="${tip.x.toFixed(1)},${tip.y.toFixed(1)} ${b1.x.toFixed(1)},${b1.y.toFixed(1)} ${b2.x.toFixed(1)},${b2.y.toFixed(1)}" fill="${gc}" opacity="0.9"/>
      <circle cx="${cx}" cy="${cy}" r="12" fill="${gc}"/>
      <circle cx="${cx}" cy="${cy}" r="6"  fill="white"/>
    `;
    needle += [0,25,50,75,100].map(v => {
      const a     = valToAngle(v);
      const inner = polar(cx, cy, r - 16, a);
      const outer = polar(cx, cy, r + 3,  a);
      return `<line x1="${inner.x.toFixed(1)}" y1="${inner.y.toFixed(1)}" x2="${outer.x.toFixed(1)}" y2="${outer.y.toFixed(1)}" stroke="#9A9996" stroke-width="1.5"/>`;
    }).join("");
  }

  const rcY  = style === "arc" ? cy + 22 : cy + 40;
  const grdY = style === "arc" ? cy - 6  : cy + 58;

  const centerText = `
    <text x="${cx}" y="${grdY}" text-anchor="middle" font-size="13" fill="${gc}" font-family="Georgia,serif" font-weight="bold">${grade}</text>
    <text x="${cx}" y="${rcY}"  text-anchor="middle" font-size="40" fill="${gc}" font-family="Georgia,serif" font-weight="bold">${val}%</text>
    <text x="${cx}" y="${rcY + 20}" text-anchor="middle" font-size="10" fill="#9A9996" font-family="Georgia,serif">90% CI: ${low}% \u2013 ${high}%</text>
  `;

  return `<svg width="320" height="265" viewBox="0 0 320 265" xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="265" fill="white"/>
    ${zoneArcs}
    ${track}
    ${ciArc}
    ${valArc}
    ${needle}
    ${labels}
    ${centerText}
  </svg>`;
}

// ── Stone Variable Chart (Case A — stone specified) ──────────────────────────
// Single bar chart: Entered value vs Reference value for each variable
type VarChecks = AdhesivityResult["stoneRecognition"]["variableChecks"];

export function buildStoneChartSvg(recognition: AdhesivityResult["stoneRecognition"]): string {
  const { variableChecks: checks, stoneType } = recognition;
  if (checks.length === 0) {
    return `<svg width="200" height="50" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="50" fill="white"/>
      <text x="10" y="28" font-size="11" fill="#9A9996" font-family="Georgia,serif">No variable data available.</text>
    </svg>`;
  }

  const BAR_H = 22, GAP = 8, LEFT = 110, RIGHT_W = 360;
  const ROW_H  = BAR_H * 2 + GAP + 10;
  const HEIGHT = checks.length * ROW_H + 60;
  const W      = LEFT + RIGHT_W + 80;
  const maxVal = Math.max(...checks.flatMap(v => [v.userValue, v.refValue]), 1);

  const rows = checks.map((v, i) => {
    const ub    = Math.max(4, (v.userValue / maxVal) * RIGHT_W);
    const rb    = Math.max(4, (v.refValue  / maxVal) * RIGHT_W);
    const color = v.inBounds ? "#437A22" : "#D19900";
    const y     = 42 + i * ROW_H;
    const fmt   = (n: number) => n < 0.1 ? n.toFixed(4) : n.toFixed(2);
    return `
      <text x="${LEFT - 8}" y="${y + BAR_H - 3}"    text-anchor="end" font-size="11" fill="#28251D" font-family="Georgia,serif" font-weight="bold">${v.label}</text>
      <text x="${LEFT - 8}" y="${y + BAR_H + 8}"    text-anchor="end" font-size="9"  fill="${color}" font-family="Georgia,serif">${v.inBounds ? "\u2713 in range" : "\u26a0 deviation"}</text>
      <rect x="${LEFT}" y="${y}"             width="${RIGHT_W}" height="${BAR_H}" rx="3" fill="#F0EFEB"/>
      <rect x="${LEFT}" y="${y}"             width="${ub.toFixed(1)}" height="${BAR_H}" rx="3" fill="${color}" opacity="0.80"/>
      <text x="${LEFT + ub + 6}" y="${y + BAR_H - 5}" font-size="10" fill="${color}" font-family="Georgia,serif" font-weight="bold">${fmt(v.userValue)}%</text>
      <rect x="${LEFT}" y="${y + BAR_H + 4}" width="${RIGHT_W}" height="${BAR_H}" rx="3" fill="#F0EFEB"/>
      <rect x="${LEFT}" y="${y + BAR_H + 4}" width="${rb.toFixed(1)}" height="${BAR_H}" rx="3" fill="#9A9996" opacity="0.45"/>
      <text x="${LEFT + rb + 6}" y="${y + BAR_H * 2 + 1}" font-size="10" fill="#7A7974" font-family="Georgia,serif">${fmt(v.refValue)}%</text>
    `;
  }).join("");

  const legend = `
    <rect x="${LEFT}"       y="${HEIGHT - 14}" width="12" height="12" rx="2" fill="#437A22" opacity="0.80"/>
    <text x="${LEFT + 16}" y="${HEIGHT - 3}"  font-size="10" fill="#7A7974" font-family="Georgia,serif">Entered (in range)</text>
    <rect x="${LEFT + 140}" y="${HEIGHT - 14}" width="12" height="12" rx="2" fill="#D19900" opacity="0.80"/>
    <text x="${LEFT + 156}" y="${HEIGHT - 3}"  font-size="10" fill="#7A7974" font-family="Georgia,serif">Entered (deviation)</text>
    <rect x="${LEFT + 290}" y="${HEIGHT - 14}" width="12" height="12" rx="2" fill="#9A9996" opacity="0.45"/>
    <text x="${LEFT + 306}" y="${HEIGHT - 3}"  font-size="10" fill="#7A7974" font-family="Georgia,serif">Reference (${stoneType})</text>
  `;

  const title = `<text x="0" y="20" font-size="13" font-weight="bold" fill="#28251D" font-family="Georgia,serif">Variable Comparison \u2014 Entered vs ${stoneType} Reference</text>`;

  return `<svg width="${W}" height="${HEIGHT}" viewBox="0 0 ${W} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${HEIGHT}" fill="white"/>
    ${title}
    ${rows}
    ${legend}
  </svg>`;
}

// ── Triple Comparison Chart (Case B — stone is "Other") ──────────────────────
// Builds ONE chart comparing entered values vs a single reference stone
// Call 3 times (basalt, granite, limestone) to get 3 charts
export function buildTripleChartSvg(
  enteredValues: Record<string, number>,
  refStone: "basalt" | "granite" | "limestone"
): string {
  const ref    = REFERENCES[refStone];
  const keys   = Object.keys(REF_LABELS);
  const label  = refStone.charAt(0).toUpperCase() + refStone.slice(1);

  const BAR_H  = 22, GAP = 8, LEFT = 110, RIGHT_W = 340;
  const ROW_H  = BAR_H * 2 + GAP + 10;
  const HEIGHT = keys.length * ROW_H + 60;
  const W      = LEFT + RIGHT_W + 80;

  const rows = keys.map((key, i) => {
    const entered = enteredValues[key] ?? 0;
    const refVal  = ref[key] ?? 0;
    const maxVal  = Math.max(entered, refVal, 0.001);
    const ub      = Math.max(4, (entered / maxVal) * RIGHT_W);
    const rb      = Math.max(4, (refVal  / maxVal) * RIGHT_W);

    // deviation %
    const dev     = refVal > 0 ? Math.abs((entered - refVal) / refVal) * 100 : 0;
    const color   = dev <= 30 ? "#437A22" : dev <= 60 ? "#D19900" : "#964219";
    const y       = 42 + i * ROW_H;
    const fmt     = (n: number) => n < 0.1 ? n.toFixed(4) : n.toFixed(2);

    return `
      <text x="${LEFT - 8}" y="${y + BAR_H - 3}"    text-anchor="end" font-size="11" fill="#28251D" font-family="Georgia,serif" font-weight="bold">${REF_LABELS[key]}</text>
      <text x="${LEFT - 8}" y="${y + BAR_H + 8}"    text-anchor="end" font-size="9"  fill="${color}" font-family="Georgia,serif">dev: ${dev.toFixed(1)}%</text>
      <rect x="${LEFT}" y="${y}"             width="${RIGHT_W}" height="${BAR_H}" rx="3" fill="#F0EFEB"/>
      <rect x="${LEFT}" y="${y}"             width="${ub.toFixed(1)}" height="${BAR_H}" rx="3" fill="${color}" opacity="0.80"/>
      <text x="${LEFT + ub + 6}" y="${y + BAR_H - 5}" font-size="10" fill="${color}" font-family="Georgia,serif" font-weight="bold">${fmt(entered)}%</text>
      <rect x="${LEFT}" y="${y + BAR_H + 4}" width="${RIGHT_W}" height="${BAR_H}" rx="3" fill="#F0EFEB"/>
      <rect x="${LEFT}" y="${y + BAR_H + 4}" width="${rb.toFixed(1)}" height="${BAR_H}" rx="3" fill="#20808D" opacity="0.45"/>
      <text x="${LEFT + rb + 6}" y="${y + BAR_H * 2 + 1}" font-size="10" fill="#7A7974" font-family="Georgia,serif">${fmt(refVal)}%</text>
    `;
  }).join("");

  const legend = `
    <rect x="${LEFT}"       y="${HEIGHT - 14}" width="12" height="12" rx="2" fill="#437A22" opacity="0.80"/>
    <text x="${LEFT + 16}" y="${HEIGHT - 3}"  font-size="10" fill="#7A7974" font-family="Georgia,serif">Entered values</text>
    <rect x="${LEFT + 120}" y="${HEIGHT - 14}" width="12" height="12" rx="2" fill="#20808D" opacity="0.45"/>
    <text x="${LEFT + 136}" y="${HEIGHT - 3}"  font-size="10" fill="#7A7974" font-family="Georgia,serif">Reference (${label})</text>
  `;

  const title = `<text x="0" y="20" font-size="13" font-weight="bold" fill="#28251D" font-family="Georgia,serif">Comparison vs ${label} Reference Values</text>`;

  return `<svg width="${W}" height="${HEIGHT}" viewBox="0 0 ${W} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${HEIGHT}" fill="white"/>
    ${title}
    ${rows}
    ${legend}
  </svg>`;
}

// ── Similarity score helper (used by generator for Case B conclusion) ────────
// Returns average deviation % across all 6 variables for a given reference stone
export function calcSimilarityScore(
  enteredValues: Record<string, number>,
  refStone: "basalt" | "granite" | "limestone"
): number {
  const ref  = REFERENCES[refStone];
  const keys = Object.keys(REF_LABELS);
  let total  = 0, count = 0;
  for (const key of keys) {
    const entered = enteredValues[key];
    const refVal  = ref[key];
    if (entered == null || entered === 0) continue;
    const dev = refVal > 0 ? Math.abs((entered - refVal) / refVal) * 100 : 100;
    total += dev;
    count++;
  }
  return count > 0 ? total / count : 999;
}
