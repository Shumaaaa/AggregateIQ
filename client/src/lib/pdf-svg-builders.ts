/**
 * pdf-svg-builders.ts — Builds raw SVG strings for PDF chart capture
 * These are pure string functions — no React, no DOM at call time.
 */

import { type AdhesivityResult } from "./adhesivity-model";
import { type MeterStyle } from "../components/pdf/pdf-engineer-modal";

// ── Helpers ──────────────────────────────────────────────────────────────────
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

  const track = `<path d="${arc(cx, cy, r, DIAL_START, DIAL_START + DIAL_SPAN)}" fill="none" stroke="#E5E4E0" stroke-width="${style === "arc" ? 22 : 3}"/>`;
  const ciArc = `<path d="${arc(cx, cy, r, valToAngle(low), valToAngle(high))}" fill="none" stroke="${gc}" stroke-width="${style === "arc" ? 22 : 6}" stroke-opacity="0.22"/>`;
  const valArc = `<path d="${arc(cx, cy, r, DIAL_START, valToAngle(val))}" fill="none" stroke="${gc}" stroke-width="${style === "arc" ? 22 : 4}" stroke-linecap="round"/>`;

  const labels = [0, 50, 100].map(v => {
    const pos = polar(cx, cy, r + (style === "arc" ? 20 : -30), valToAngle(v));
    return `<text x="${pos.x.toFixed(1)}" y="${(pos.y + 4).toFixed(1)}" text-anchor="middle" font-size="10" fill="#9A9996" font-family="Arial,sans-serif">${v}</text>`;
  }).join("");

  let needle = "";
  if (style === "speedometer") {
    const na = valToAngle(val);
    const tip = polar(cx, cy, r - 10, na);
    const b1  = polar(cx, cy, 14, na + 90);
    const b2  = polar(cx, cy, 14, na - 90);
    needle = `
      <polygon points="${tip.x.toFixed(1)},${tip.y.toFixed(1)} ${b1.x.toFixed(1)},${b1.y.toFixed(1)} ${b2.x.toFixed(1)},${b2.y.toFixed(1)}" fill="${gc}" opacity="0.9"/>
      <circle cx="${cx}" cy="${cy}" r="12" fill="${gc}"/>
      <circle cx="${cx}" cy="${cy}" r="6"  fill="white"/>
    `;
    // Tick marks for speedometer
    needle += [0,25,50,75,100].map(v => {
      const a = valToAngle(v);
      const inner = polar(cx, cy, r - 16, a);
      const outer = polar(cx, cy, r + 3,  a);
      return `<line x1="${inner.x.toFixed(1)}" y1="${inner.y.toFixed(1)}" x2="${outer.x.toFixed(1)}" y2="${outer.y.toFixed(1)}" stroke="#9A9996" stroke-width="1.5"/>`;
    }).join("");
  }

  const rcY  = style === "arc" ? cy + 22 : cy + 40;
  const grdY = style === "arc" ? cy - 6  : cy + 58;

  const centerText = `
    <text x="${cx}" y="${grdY}" text-anchor="middle" font-size="12" fill="${gc}" font-family="Arial,sans-serif" font-weight="600">${grade}</text>
    <text x="${cx}" y="${rcY}"  text-anchor="middle" font-size="38" fill="${gc}" font-family="Arial,sans-serif" font-weight="700">${val}%</text>
    <text x="${cx}" y="${rcY + 18}" text-anchor="middle" font-size="9" fill="#9A9996" font-family="Arial,sans-serif">90% CI: ${low}% – ${high}%</text>
  `;

  return `<svg width="320" height="260" viewBox="0 0 320 260" xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="260" fill="white"/>
    ${zoneArcs}
    ${track}
    ${ciArc}
    ${valArc}
    ${needle}
    ${labels}
    ${centerText}
  </svg>`;
}

// ── Factor Contribution Chart ────────────────────────────────────────────────
type Breakdown = AdhesivityResult["breakdown"];

const FACTORS: { key: keyof Breakdown; label: string; weight: string }[] = [
  { key: "moistureContent", label: "Moisture Content (MC)", weight: "33%" },
  { key: "porosity",        label: "Porosity",              weight: "24%" },
  { key: "al2o3",           label: "Al\u2082O\u2083",       weight: "18%" },
  { key: "cao",             label: "CaO",                   weight: "14%" },
  { key: "sio2",            label: "SiO\u2082",             weight: "7%"  },
  { key: "fe2o3",           label: "Fe\u2082O\u2083",       weight: "4%"  },
];

const IMPACT_C: Record<string,string> = {
  positive: "#437A22",
  neutral:  "#20808D",
  negative: "#964219",
};

export function buildFactorChartSvg(breakdown: Breakdown): string {
  const BAR_H = 24, GAP = 8, LEFT = 190, RIGHT_W = 280;
  const HEIGHT = FACTORS.length * (BAR_H + GAP) + 50;
  const W = LEFT + RIGHT_W + 20;
  const MAX = 33;

  const rows = FACTORS.map(({ key, label, weight }, i) => {
    const item  = breakdown[key];
    const bw    = Math.max(3, (item.contribution / MAX) * RIGHT_W);
    const color = IMPACT_C[item.impact] ?? "#20808D";
    const y     = 32 + i * (BAR_H + GAP);
    return `
      <text x="${LEFT - 8}" y="${y + BAR_H / 2 - 4}" text-anchor="end" font-size="9" fill="#7A7974" font-family="Arial,sans-serif">${weight}</text>
      <text x="${LEFT - 8}" y="${y + BAR_H / 2 + 7}" text-anchor="end" font-size="10" fill="#28251D" font-family="Arial,sans-serif">${label}</text>
      <rect x="${LEFT}" y="${y}" width="${RIGHT_W}" height="${BAR_H}" rx="4" fill="#F0EFEB"/>
      <rect x="${LEFT}" y="${y}" width="${bw.toFixed(1)}" height="${BAR_H}" rx="4" fill="${color}" opacity="0.85"/>
      <text x="${LEFT + bw + 5}" y="${y + BAR_H / 2 + 4}" font-size="9" fill="${color}" font-family="Arial,sans-serif" font-weight="600">${item.contribution.toFixed(1)}</text>
    `;
  }).join("");

  const legend = [
    { label: "Positive", color: "#437A22" },
    { label: "Neutral",  color: "#20808D" },
    { label: "Negative", color: "#964219" },
  ].map(({ label, color }, i) =>
    `<rect x="${LEFT + i * 130}" y="${HEIGHT - 12}" width="10" height="10" rx="2" fill="${color}" opacity="0.85"/>
     <text x="${LEFT + i * 130 + 14}" y="${HEIGHT - 3}" font-size="8" fill="#7A7974" font-family="Arial,sans-serif">${label}</text>`
  ).join("");

  return `<svg width="${W}" height="${HEIGHT}" viewBox="0 0 ${W} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${HEIGHT}" fill="white"/>
    <text x="0" y="16" font-size="12" font-weight="600" fill="#28251D" font-family="Arial,sans-serif">Factor Contributions to Adhesivity Score</text>
    ${rows}
    ${legend}
  </svg>`;
}

// ── Stone Variable Chart ─────────────────────────────────────────────────────
type VarChecks = AdhesivityResult["stoneRecognition"]["variableChecks"];

export function buildStoneChartSvg(recognition: AdhesivityResult["stoneRecognition"]): string {
  const { variableChecks: checks, stoneType } = recognition;
  if (checks.length === 0) {
    return `<svg width="100" height="40" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="40" fill="white"/><text x="10" y="24" font-size="10" fill="#9A9996" font-family="Arial,sans-serif">No variable data</text></svg>`;
  }

  const BAR_H = 20, GAP = 6, LEFT = 80, RIGHT_W = 380;
  const ROW_H = BAR_H * 2 + GAP + 8;
  const HEIGHT = checks.length * ROW_H + 50;
  const W = LEFT + RIGHT_W + 70;
  const maxVal = Math.max(...checks.flatMap(v => [v.userValue, v.refValue]), 1);

  const rows = checks.map((v, i) => {
    const ub    = Math.max(3, (v.userValue / maxVal) * RIGHT_W);
    const rb    = Math.max(3, (v.refValue  / maxVal) * RIGHT_W);
    const color = v.inBounds ? "#437A22" : "#D19900";
    const y     = 32 + i * ROW_H;
    const fmt = (n: number) => n < 0.1 ? n.toFixed(4) : n.toFixed(2);
    return `
      <text x="${LEFT - 5}" y="${y + BAR_H - 3}"   text-anchor="end" font-size="10" fill="#28251D" font-family="Arial,sans-serif">${v.label}</text>
      <text x="${LEFT - 5}" y="${y + 9}"            text-anchor="end" font-size="8"  fill="${color}" font-family="Arial,sans-serif">${v.inBounds ? "✓ in range" : "⚠ deviation"}</text>
      <rect x="${LEFT}" y="${y}"             width="${RIGHT_W}" height="${BAR_H}" rx="3" fill="#F0EFEB"/>
      <rect x="${LEFT}" y="${y}"             width="${ub.toFixed(1)}" height="${BAR_H}" rx="3" fill="${color}" opacity="0.75"/>
      <text x="${LEFT + ub + 4}" y="${y + BAR_H - 4}" font-size="8" fill="${color}" font-family="Arial,sans-serif" font-weight="600">${fmt(v.userValue)}%</text>
      <rect x="${LEFT}" y="${y + BAR_H + 3}" width="${RIGHT_W}" height="${BAR_H}" rx="3" fill="#F0EFEB"/>
      <rect x="${LEFT}" y="${y + BAR_H + 3}" width="${rb.toFixed(1)}" height="${BAR_H}" rx="3" fill="#9A9996" opacity="0.45"/>
      <text x="${LEFT + rb + 4}" y="${y + BAR_H * 2}" font-size="8" fill="#7A7974" font-family="Arial,sans-serif">${fmt(v.refValue)}%</text>
    `;
  }).join("");

  const legend = `
    <rect x="${LEFT}"       y="${HEIGHT - 12}" width="10" height="10" rx="2" fill="#437A22" opacity="0.75"/>
    <text x="${LEFT + 14}" y="${HEIGHT - 3}" font-size="8" fill="#7A7974" font-family="Arial,sans-serif">Entered (in range)</text>
    <rect x="${LEFT + 120}" y="${HEIGHT - 12}" width="10" height="10" rx="2" fill="#D19900" opacity="0.75"/>
    <text x="${LEFT + 134}" y="${HEIGHT - 3}" font-size="8" fill="#7A7974" font-family="Arial,sans-serif">Entered (deviation)</text>
    <rect x="${LEFT + 250}" y="${HEIGHT - 12}" width="10" height="10" rx="2" fill="#9A9996" opacity="0.45"/>
    <text x="${LEFT + 264}" y="${HEIGHT - 3}" font-size="8" fill="#7A7974" font-family="Arial,sans-serif">Reference (${stoneType})</text>
  `;

  return `<svg width="${W}" height="${HEIGHT}" viewBox="0 0 ${W} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${HEIGHT}" fill="white"/>
    <text x="0" y="16" font-size="12" font-weight="600" fill="#28251D" font-family="Arial,sans-serif">Variable Comparison — Entered vs ${stoneType} Reference</text>
    ${rows}
    ${legend}
  </svg>`;
}
