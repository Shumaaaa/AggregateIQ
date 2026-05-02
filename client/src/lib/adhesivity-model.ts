/**
 * AggregateIQ — Adhesivity Model Engine v3
 *
 * Based on experimental data (Basalt — Ntyuka Quarry Dodoma, Granite — Chinangali Quarry Dodoma,
 * Limestone — Dar es Salaam, 2026) calibrated against Eng. Mwajabu A. Senzota dissertation.
 *
 * Model: Composite Weighted Index Scoring (57% Physical / 43% Chemical)
 *
 * Final weights — derived from standalone regression R² hierarchy + literature (Ignatavicius et al. 2021;
 * Zhang et al. 2015; Fei et al. 2023):
 *   MC       : 0.33  — strongest single predictor (R²=0.9819); direct moisture stripping mechanism
 *   Porosity : 0.24  — second strongest (R²=0.9785); water ingress pathway
 *   Al₂O₃   : 0.18  — best chemical predictor (R²=0.9362); surface polarity + base character
 *   CaO      : 0.14  — second chemical predictor (R²=0.9196); hydrophilicity marker (Lesueur et al. 2013)
 *   SiO₂    : 0.07  — moderate predictor (R²=0.7506); secondary role (Moraes et al. 2004)
 *   Fe₂O₃   : 0.04  — weakest predictor (R²=0.5911); limited generalisability (Plancher et al. 1977)
 *
 * Normalization: calibration dataset min/max (Table 4.12 of dissertation)
 * MAE on calibration dataset (n=3): 6.65%
 *
 * Regression equations (single-predictor, operational):
 *   Porosity model : A = 93.31 − 2.40 × P        (R²=0.9785, F=45.60)
 *   MC model       : A = 93.00 − 21.40 × MC       (R²=0.9819, F=54.30)
 *
 * Confidence interval: ±10% (90% confidence) based on calibration dataset spread.
 */

export interface AggregateInput {
  porosity?: number;        // % — REQUIRED for full prediction
  moistureContent?: number; // % — REQUIRED for full prediction
  waterAbsorption?: number; // % (proxy if no porosity)
  sio2?: number;            // %
  cao?: number;             // %
  fe2o3?: number;           // %
  al2o3?: number;           // %
  aggregateType?: string;
}

export interface AdhesivityResult {
  predictedRC: number;
  rcLow: number;           // 90% confidence lower bound
  rcHigh: number;          // 90% confidence upper bound
  grade: string;
  gradeColor: string;
  score: number;
  confidence: "experimental" | "index-based";
  incomplete: boolean;     // true if porosity or MC are missing
  missingVars: string[];   // list of missing critical variables
  stoneType: string;       // recognised stone type or "Undefined"
  breakdown: {
    porosity:       { value: number; contribution: number; impact: "positive" | "negative" | "neutral" };
    moistureContent:{ value: number; contribution: number; impact: "positive" | "negative" | "neutral" };
    sio2:           { value: number; contribution: number; impact: "positive" | "negative" | "neutral" };
    cao:            { value: number; contribution: number; impact: "positive" | "negative" | "neutral" };
    fe2o3:          { value: number; contribution: number; impact: "positive" | "negative" | "neutral" };
    al2o3:          { value: number; contribution: number; impact: "positive" | "negative" | "neutral" };
  };
  riskFlags: string[];
  recommendation: string;
}

// ── Calibration dataset (normalization bounds — Table 4.12) ────────────────
// These are the EXACT min/max from the three experimental aggregates.
const CALIB = {
  mc:    { min: 0.0245,  max: 2.2531  },   // Basalt=min, Limestone=max
  p:     { min: 0.490,   max: 20.200  },   // Basalt=min, Limestone=max
  al2o3: { min: 1.39,    max: 8.91    },   // Limestone=min, Granite=max
  cao:   { min: 1.71,    max: 51.90   },   // Granite=min, Limestone=max
  sio2:  { min: 5.01,    max: 68.88   },   // Limestone=min, Granite=max
  fe2o3: { min: 0.27,    max: 16.70   },   // Limestone=min, Basalt=max
};

// ── Experimental calibration data (Table 4.1) ──────────────────────────────
const EXPERIMENTAL = [
  { type: "Basalt",    porosity: 0.49,  mc: 0.0245, sio2: 47.40, cao: 7.28,  fe2o3: 16.70, al2o3: 8.33, rc: 96 },
  { type: "Granite",  porosity: 1.36,  mc: 0.1526, sio2: 68.88, cao: 1.71,  fe2o3: 3.19,  al2o3: 8.91, rc: 86 },
  { type: "Limestone",porosity: 20.20, mc: 2.2531, sio2: 5.01,  cao: 51.90, fe2o3: 0.27,  al2o3: 1.39, rc: 45 },
];

// ── Model weights (Table 4.11) ─────────────────────────────────────────────
const W = {
  mc:    0.33,
  p:     0.24,
  al2o3: 0.18,
  cao:   0.14,
  sio2:  0.07,
  fe2o3: 0.04,
};

// ── Confidence interval half-width (90% confidence = ±10pp) ───────────────
const CI_HALF = 10;

// ── Helpers ────────────────────────────────────────────────────────────────
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

/** Inverse normalizer: higher value → lower adhesivity score → N = 0 at max */
function normInverse(x: number, min: number, max: number): number {
  return clamp((max - x) / (max - min + 1e-9), 0, 1);
}

/** Direct normalizer: higher value → higher adhesivity score → N = 0 at min */
function normDirect(x: number, min: number, max: number): number {
  return clamp((x - min) / (max - min + 1e-9), 0, 1);
}

// ── Stone recognition ──────────────────────────────────────────────────────
/**
 * Identifies aggregate type based on 10% tolerance window around calibration values.
 * Returns "Basalt", "Granite", "Limestone", or "Undefined".
 */
export function recogniseStone(input: AggregateInput): string {
  const tol = 0.10; // 10% tolerance each side = 90% confidence window

  for (const exp of EXPERIMENTAL) {
    const checks: boolean[] = [];

    if (input.porosity !== undefined)
      checks.push(Math.abs(input.porosity - exp.porosity) / (exp.porosity + 0.01) <= tol);
    if (input.moistureContent !== undefined)
      checks.push(Math.abs(input.moistureContent - exp.mc) / (exp.mc + 0.01) <= tol);
    if (input.sio2 !== undefined)
      checks.push(Math.abs(input.sio2 - exp.sio2) / (exp.sio2 + 0.01) <= tol);
    if (input.cao !== undefined)
      checks.push(Math.abs(input.cao - exp.cao) / (exp.cao + 0.1) <= tol);
    if (input.fe2o3 !== undefined)
      checks.push(Math.abs(input.fe2o3 - exp.fe2o3) / (exp.fe2o3 + 0.1) <= tol);
    if (input.al2o3 !== undefined)
      checks.push(Math.abs(input.al2o3 - exp.al2o3) / (exp.al2o3 + 0.1) <= tol);

    // Need at least 3 variables checked, and ≥70% of them within tolerance
    if (checks.length >= 3 && checks.filter(Boolean).length / checks.length >= 0.70) {
      return exp.type;
    }
  }
  return "Undefined";
}

// ── Grade assignment (5-level ASTM D3625-based — Table 4.15) ──────────────
export function getGrade(rc: number): { grade: string; gradeColor: string } {
  if      (rc >= 95) return { grade: "Very Good",    gradeColor: "#437A22" };
  else if (rc >= 85) return { grade: "Good",         gradeColor: "#1B474D" };
  else if (rc >= 70) return { grade: "Acceptable",   gradeColor: "#20808D" };
  else if (rc >= 50) return { grade: "Borderline",   gradeColor: "#D19900" };
  else               return { grade: "Unacceptable", gradeColor: "#964219" };
}

// ── Main prediction function ───────────────────────────────────────────────
export function predictAdhesivity(input: AggregateInput): AdhesivityResult {

  // ── 1. Missing variable detection ──────────────────────────────────────
  const missingVars: string[] = [];
  if (input.porosity === undefined && input.waterAbsorption === undefined)
    missingVars.push("Porosity (%)");
  if (input.moistureContent === undefined)
    missingVars.push("Moisture Content (%)");

  const incomplete = missingVars.length > 0;

  // ── 2. Resolve values (WA proxy for porosity if needed) ────────────────
  const rawP    = input.porosity ?? (input.waterAbsorption !== undefined ? input.waterAbsorption * 2.5 : undefined);
  const rawMC   = input.moistureContent ?? 0;
  const rawSio2 = input.sio2   ?? 50;
  const rawCao  = input.cao    ?? 3;
  const rawFe   = input.fe2o3  ?? 5;
  const rawAl   = input.al2o3  ?? 5;

  // ── 3. Stone recognition ────────────────────────────────────────────────
  const stoneType = recogniseStone(input);

  // ── 4. Experimental confidence check ───────────────────────────────────
  let isExperimental = false;
  if (stoneType !== "Undefined") {
    isExperimental = true;
  }

  // ── 5. Normalized scores (0=worst, 1=best for adhesion) ────────────────
  const pNorm    = rawP !== undefined ? normInverse(rawP,   CALIB.p.min,    CALIB.p.max)    : 0.8;
  const mcNorm   = normInverse(rawMC,   CALIB.mc.min,   CALIB.mc.max);
  const al2o3N   = normDirect (rawAl,   CALIB.al2o3.min, CALIB.al2o3.max);
  const caoN     = normInverse(rawCao,  CALIB.cao.min,  CALIB.cao.max);
  const sio2N    = normDirect (rawSio2, CALIB.sio2.min, CALIB.sio2.max);
  const fe2o3N   = normDirect (rawFe,   CALIB.fe2o3.min, CALIB.fe2o3.max);

  // ── 6. Weighted composite score (0–100) ────────────────────────────────
  const score = clamp((
    W.mc    * mcNorm  +
    W.p     * pNorm   +
    W.al2o3 * al2o3N  +
    W.cao   * caoN    +
    W.sio2  * sio2N   +
    W.fe2o3 * fe2o3N
  ) * 100, 0, 100);

  // Map composite score → RC% anchored to calibration range (45–96%)
  const predictedRC = clamp(Math.round(45 + (score / 100) * 51), 0, 100);

  // ── 7. Confidence interval (±10pp at 90% confidence) ───────────────────
  const rcLow  = clamp(predictedRC - CI_HALF, 0, 100);
  const rcHigh = clamp(predictedRC + CI_HALF, 0, 100);

  // ── 8. Grade ────────────────────────────────────────────────────────────
  const { grade, gradeColor } = getGrade(predictedRC);

  // ── 9. Risk flags ───────────────────────────────────────────────────────
  const riskFlags: string[] = [];

  if (incomplete) {
    riskFlags.push(`⚠ Incomplete input: ${missingVars.join(", ")} ${missingVars.length > 1 ? "are" : "is"} missing — prediction accuracy is reduced.`);
  }
  if (rawP !== undefined && rawP > 8)
    riskFlags.push(`High porosity (${rawP.toFixed(1)}%) — severe water penetration risk; bitumen film prone to displacement during immersion.`);
  if (rawMC > 1.5)
    riskFlags.push(`Elevated moisture content (${rawMC.toFixed(3)}%) — pre-drying strongly recommended before prime coat application.`);
  if (rawSio2 > 65)
    riskFlags.push(`High SiO₂ (${rawSio2.toFixed(1)}%) — electronegative acidic surface; anti-stripping additive strongly recommended.`);
  if (rawCao < 1.5)
    riskFlags.push(`Very low CaO (${rawCao.toFixed(1)}%) — limited alkaline surface chemistry for bitumen bonding.`);
  if (rawFe < 1.0)
    riskFlags.push(`Very low Fe₂O₃ (${rawFe.toFixed(2)}%) — reduced surface reactivity with bitumen polar compounds.`);
  if (rawP !== undefined && rawP > 5 && rawCao > 30)
    riskFlags.push("High CaO but extreme porosity — chemical advantage overridden by moisture ingress (consistent with Dar es Salaam limestone, Senzota 2026 study).");

  // ── 10. Recommendation ──────────────────────────────────────────────────
  let recommendation: string;
  if      (predictedRC >= 95) recommendation = "Excellent prime coat compatibility. Suitable for all pavement layers without modification. Very low stripping risk under tropical conditions.";
  else if (predictedRC >= 85) recommendation = "Good adhesivity. Suitable for national highways and urban roads. Consider anti-stripping additive for coastal or high-rainfall corridors.";
  else if (predictedRC >= 70) recommendation = "Acceptable adhesivity for standard road applications. Anti-stripping additive recommended. Monitor performance under heavy rainfall cycles.";
  else if (predictedRC >= 50) recommendation = "Borderline adhesivity. Anti-stripping additive is mandatory. Not recommended for national highways or high-traffic routes without pre-treatment and re-testing.";
  else                         recommendation = "Unacceptable adhesivity. This aggregate is incompatible with C55 bitumen emulsion prime coat in its natural state. Investigate anti-stripping treatment, aggregate pre-treatment, or select an alternative aggregate source.";

  // ── 11. Breakdown ───────────────────────────────────────────────────────
  const impact = (n: number): "positive" | "negative" | "neutral" =>
    n > 0.6 ? "positive" : n > 0.3 ? "neutral" : "negative";

  const breakdown = {
    porosity:        { value: rawP ?? 0,  contribution: W.p     * pNorm   * 100, impact: impact(pNorm)    },
    moistureContent: { value: rawMC,      contribution: W.mc    * mcNorm  * 100, impact: impact(mcNorm)   },
    sio2:            { value: rawSio2,    contribution: W.sio2  * sio2N   * 100, impact: impact(sio2N)    },
    cao:             { value: rawCao,     contribution: W.cao   * caoN    * 100, impact: impact(caoN)     },
    fe2o3:           { value: rawFe,      contribution: W.fe2o3 * fe2o3N  * 100, impact: impact(fe2o3N)   },
    al2o3:           { value: rawAl,      contribution: W.al2o3 * al2o3N  * 100, impact: impact(al2o3N)   },
  };

  return {
    predictedRC,
    rcLow,
    rcHigh,
    grade,
    gradeColor,
    score: Math.round(score),
    confidence: isExperimental ? "experimental" : "index-based",
    incomplete,
    missingVars,
    stoneType,
    breakdown,
    riskFlags,
    recommendation,
  };
}

// ── Project suitability helper ─────────────────────────────────────────────
export function getProjectSuitability(rc: number, projectType: string): { suitable: boolean; note: string } {
  const thresholds: Record<string, number> = { highway: 90, urban: 80, rural: 70, coastal: 85 };
  const t = thresholds[projectType] ?? 80;
  const notes: Record<string, string> = {
    highway: "National highways require RC ≥ 90% due to high traffic loads and long design life.",
    urban:   "Urban roads: RC ≥ 80% acceptable. Anti-stripping agents extend performance.",
    rural:   "Rural/feeder roads: RC ≥ 70% may be acceptable with periodic maintenance.",
    coastal: "Coastal roads: RC ≥ 85% recommended — saltwater + humidity accelerate stripping.",
  };
  return { suitable: rc >= t, note: notes[projectType] ?? "" };
}
