/**
 * AggregateIQ — Adhesivity Model Engine v2
 *
 * Based on experimental data (Basalt, Granite, Limestone — Dar es Salaam, 2026)
 * + literature calibration (Kim et al. 2023; Apeagyei et al. 2017; Zhang et al. 2015)
 *
 * Model: Weighted Index Scoring (Semi-empirical, Approach 2)
 * RC_score = w1*(1−norm_porosity) + w2*(1−norm_mc) + w3*(1−norm_sio2)
 *          + w4*(norm_cao) + w5*(norm_fe2o3) + w6*(norm_al2o3)
 *
 * Weights — hybrid data-driven + engineering judgment (57% Physical / 43% Chemical):
 *   MC       : 0.33  — dominant physical factor; moisture prevents bitumen bonding
 *   Porosity : 0.24  — water ingress path; Zhang et al. 2015, Apeagyei et al. 2017
 *   Fe₂O₃   : 0.15  — iron oxide promotes hydrophobic surface; confirmed by Basalt data
 *   Al₂O₃   : 0.12  — amphoteric oxide; aids adhesion in siliceous aggregates
 *   SiO₂    : 0.10  — acidic chemistry reduces affinity (>52% threshold)
 *   CaO     : 0.06  — alkaline benefit present but overridden by porosity in Limestone
 *
 * Note: This is a structured expert heuristic, not a statistical regression model.
 * Confidence increases significantly with n ≥ 12 data points.
 * MAE on calibration dataset (n=3): 6.65%
 */

export interface AggregateInput {
  porosity?: number;        // %
  waterAbsorption?: number; // % (proxy if no porosity)
  moistureContent?: number; // %
  sio2?: number;            // %
  cao?: number;             // %
  fe2o3?: number;           // %
  al2o3?: number;           // %
  aggregateType?: string;
}

export interface AdhesivityResult {
  predictedRC: number;
  grade: string;
  gradeColor: string;
  score: number;
  confidence: "experimental" | "index-based";
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

// ── Reference ranges (literature + experimental) ───────────────────────────
const REF = {
  porosity:        { min: 0.1,  max: 22,  goodBelow: 2.0, badAbove: 8.0 },
  waterAbsorption: { min: 0.1,  max: 12,  goodBelow: 1.0, badAbove: 4.0 },
  moistureContent: { min: 0.0,  max: 12,  goodBelow: 0.5, badAbove: 5.0 },
  sio2:            { min: 3,    max: 80,  goodBelow: 52,  badAbove: 65  },
  cao:             { min: 0,    max: 55,  goodAbove: 5,   poorBelow: 1  },
  fe2o3:           { min: 0,    max: 20,  goodAbove: 5,   poorBelow: 1  },
  al2o3:           { min: 0,    max: 15,  goodAbove: 5,   poorBelow: 1  },
};

// ── Experimental calibration data ─────────────────────────────────────────
const EXPERIMENTAL = [
  { type: "basalt",    porosity: 0.49,  mc: 0.0245, sio2: 47.40, cao: 7.28,  fe2o3: 16.70, al2o3: 8.33,  rc: 96 },
  { type: "granite",   porosity: 1.36,  mc: 0.1526, sio2: 68.88, cao: 1.71,  fe2o3: 3.19,  al2o3: 8.91,  rc: 86 },
  { type: "limestone", porosity: 20.20, mc: 9.848,  sio2: 5.01,  cao: 51.90, fe2o3: 0.27,  al2o3: 1.39,  rc: 45 },
];

// ── Normalization helpers ──────────────────────────────────────────────────
function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }
function normalize(value: number, min: number, max: number): number {
  return clamp((value - min) / (max - min + 1e-9), 0, 1);
}

// ── Model weights ──────────────────────────────────────────────────────────
const W = {
  porosity: 0.24,
  mc:       0.33,
  sio2:     0.10,
  cao:      0.06,
  fe2o3:    0.15,
  al2o3:    0.12,
};

// ── Main prediction function ───────────────────────────────────────────────
export function predictAdhesivity(input: AggregateInput): AdhesivityResult {
  // Resolve porosity (or use WA proxy)
  const rawPorosity = input.porosity ?? (input.waterAbsorption ? input.waterAbsorption * 2.5 : undefined);
  const rawMC    = input.moistureContent ?? 0;
  const rawSio2  = input.sio2   ?? 50;
  const rawCao   = input.cao    ?? 3;
  const rawFe2o3 = input.fe2o3  ?? 5;
  const rawAl2o3 = input.al2o3  ?? 5;

  // ── Experimental confidence check ───────────────────────────────────────
  let isExperimental = false;
  for (const exp of EXPERIMENTAL) {
    const pDiff  = rawPorosity ? Math.abs((rawPorosity - exp.porosity) / (exp.porosity + 0.01)) : 1;
    const mcDiff = Math.abs((rawMC - exp.mc) / (exp.mc + 0.01));
    const siDiff = Math.abs((rawSio2 - exp.sio2) / (exp.sio2 + 0.01));
    const caDiff = Math.abs((rawCao - exp.cao) / (exp.cao + 0.1));
    const feDiff = Math.abs((rawFe2o3 - exp.fe2o3) / (exp.fe2o3 + 0.1));
    const alDiff = Math.abs((rawAl2o3 - exp.al2o3) / (exp.al2o3 + 0.1));
    if (pDiff < 0.15 && mcDiff < 0.20 && siDiff < 0.10 && caDiff < 0.15 && feDiff < 0.20 && alDiff < 0.20) {
      isExperimental = true;
      break;
    }
  }

  // ── Normalized scores (0=worst, 1=best for adhesion) ────────────────────
  const porosityNorm = rawPorosity !== undefined
    ? 1 - normalize(rawPorosity, REF.porosity.min, REF.porosity.max)
    : 0.8;
  const mcNorm    = 1 - normalize(rawMC,    REF.moistureContent.min, REF.moistureContent.max);
  const sio2Norm  = 1 - normalize(rawSio2,  REF.sio2.min, REF.sio2.max);
  const caoNorm   =     normalize(rawCao,   REF.cao.poorBelow, REF.cao.goodAbove + 10);
  const fe2o3Norm =     normalize(rawFe2o3, REF.fe2o3.poorBelow, REF.fe2o3.goodAbove + 10);
  const al2o3Norm =     normalize(rawAl2o3, REF.al2o3.poorBelow, REF.al2o3.goodAbove + 10);

  // ── Weighted score (0–100) ───────────────────────────────────────────────
  const score = (
    W.porosity * porosityNorm +
    W.mc       * mcNorm       +
    W.sio2     * sio2Norm     +
    W.cao      * caoNorm      +
    W.fe2o3    * fe2o3Norm    +
    W.al2o3    * al2o3Norm
  ) * 100;

  // Map score → RC% (anchored to experimental range 45–96%)
  const predictedRC = clamp(40 + (score / 100) * 62, 30, 100);

  // ── Grade ────────────────────────────────────────────────────────────────
  let grade: string, gradeColor: string;
  if      (predictedRC >= 95) { grade = "Very Good";     gradeColor = "#437A22"; }
  else if (predictedRC >= 80) { grade = "Acceptable";    gradeColor = "#1B474D"; }
  else if (predictedRC >= 60) { grade = "Marginal";      gradeColor = "#D19900"; }
  else                         { grade = "Unacceptable";  gradeColor = "#964219"; }

  // ── Risk flags ───────────────────────────────────────────────────────────
  const riskFlags: string[] = [];
  if (rawPorosity !== undefined && rawPorosity > REF.porosity.badAbove)
    riskFlags.push(`High porosity (${rawPorosity.toFixed(1)}%) — severe water penetration risk; bitumen film displaced during immersion`);
  if (rawMC > REF.moistureContent.badAbove)
    riskFlags.push(`High moisture content (${rawMC.toFixed(2)}%) — pre-drying mandatory before bitumen application`);
  if (rawSio2 > REF.sio2.badAbove)
    riskFlags.push(`High SiO₂ (${rawSio2.toFixed(1)}%) — acidic aggregate; anti-stripping additive strongly recommended`);
  if (rawCao < REF.cao.poorBelow)
    riskFlags.push(`Very low CaO (${rawCao.toFixed(1)}%) — limited alkaline surface chemistry for bitumen bonding`);
  if (rawFe2o3 < 1.0)
    riskFlags.push(`Very low Fe₂O₃ (${rawFe2o3.toFixed(2)}%) — reduced hydrophobic surface character`);
  if (rawPorosity !== undefined && rawPorosity > 5 && rawCao > 30)
    riskFlags.push("High CaO but extreme porosity — CaO benefit overridden by water ingress (Tanga Cement limestone pattern)");

  // ── Recommendation ───────────────────────────────────────────────────────
  let recommendation: string;
  if      (predictedRC >= 95) recommendation = "Suitable for all pavement applications without modification. Low stripping risk.";
  else if (predictedRC >= 80) recommendation = "Suitable for most applications. Consider anti-stripping additive for high-rainfall or submerged environments.";
  else if (predictedRC >= 60) recommendation = "Use with caution. Anti-stripping additive required. Not recommended for national highways without pre-treatment.";
  else                         recommendation = "Not suitable for bituminous pavement without significant treatment. Investigate source or select alternative aggregate.";

  // ── Breakdown ────────────────────────────────────────────────────────────
  const impact = (n: number) => n > 0.6 ? "positive" as const : n > 0.3 ? "neutral" as const : "negative" as const;

  const breakdown = {
    porosity:        { value: rawPorosity ?? 0, contribution: W.porosity * porosityNorm * 100, impact: impact(porosityNorm) },
    moistureContent: { value: rawMC,            contribution: W.mc       * mcNorm       * 100, impact: impact(mcNorm)       },
    sio2:            { value: rawSio2,           contribution: W.sio2     * sio2Norm     * 100, impact: impact(sio2Norm)     },
    cao:             { value: rawCao,            contribution: W.cao      * caoNorm      * 100, impact: impact(caoNorm)      },
    fe2o3:           { value: rawFe2o3,          contribution: W.fe2o3    * fe2o3Norm    * 100, impact: impact(fe2o3Norm)    },
    al2o3:           { value: rawAl2o3,          contribution: W.al2o3    * al2o3Norm    * 100, impact: impact(al2o3Norm)    },
  };

  return {
    predictedRC: Math.round(predictedRC),
    grade, gradeColor,
    score: Math.round(score),
    confidence: isExperimental ? "experimental" : "index-based",
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
