/**
 * PdfCharts — Charts rendered for PDF capture
 * 1. FactorContributionChart — horizontal bar chart, 6 factors
 * 2. StoneVariableChart     — grouped bar: user value vs reference
 * Pure SVG — no recharts dependency, renders perfectly for html2canvas
 */

import { type AdhesivityResult } from "@/lib/adhesivity-model";

// ── Factor Contribution Chart ────────────────────────────────────────────────
interface FactorContributionChartProps {
  breakdown: AdhesivityResult["breakdown"];
}

const FACTOR_LABELS: { key: keyof AdhesivityResult["breakdown"]; label: string; weight: string }[] = [
  { key: "moistureContent", label: "Moisture Content (MC)", weight: "33%" },
  { key: "porosity",        label: "Porosity",              weight: "24%" },
  { key: "al2o3",           label: "Al₂O₃",                weight: "18%" },
  { key: "cao",             label: "CaO",                   weight: "14%" },
  { key: "sio2",            label: "SiO₂",                 weight: "7%"  },
  { key: "fe2o3",           label: "Fe₂O₃",                weight: "4%"  },
];

const IMPACT_COLORS: Record<string, string> = {
  positive: "#437A22",
  neutral:  "#20808D",
  negative: "#964219",
};

export function FactorContributionChart({ breakdown }: FactorContributionChartProps) {
  const maxContrib = 33; // MC at 100% score = 33pts
  const BAR_H = 22;
  const GAP   = 10;
  const LEFT  = 170;
  const RIGHT_W = 260;
  const HEIGHT = FACTOR_LABELS.length * (BAR_H + GAP) + 40;

  return (
    <svg
      width={LEFT + RIGHT_W + 20}
      height={HEIGHT}
      viewBox={`0 0 ${LEFT + RIGHT_W + 20} ${HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Title */}
      <text x={0} y={16} fontSize={11} fontWeight="600" fill="#28251D" fontFamily="Arial, sans-serif">
        Factor Contributions to Score
      </text>

      {FACTOR_LABELS.map(({ key, label, weight }, i) => {
        const item       = breakdown[key];
        const contrib    = item.contribution;
        const barWidth   = Math.max(2, (contrib / maxContrib) * RIGHT_W);
        const color      = IMPACT_COLORS[item.impact] ?? "#20808D";
        const y          = 28 + i * (BAR_H + GAP);

        return (
          <g key={key}>
            {/* Label */}
            <text
              x={LEFT - 6}
              y={y + BAR_H / 2 + 4}
              textAnchor="end"
              fontSize={9}
              fill="#28251D"
              fontFamily="Arial, sans-serif"
            >
              {label}
            </text>

            {/* Weight tag */}
            <text
              x={LEFT - 6}
              y={y + BAR_H / 2 - 5}
              textAnchor="end"
              fontSize={7.5}
              fill="#7A7974"
              fontFamily="Arial, sans-serif"
            >
              {weight}
            </text>

            {/* Background track */}
            <rect
              x={LEFT} y={y}
              width={RIGHT_W} height={BAR_H}
              rx={4} fill="#F0EFEB"
            />

            {/* Value bar */}
            <rect
              x={LEFT} y={y}
              width={barWidth} height={BAR_H}
              rx={4}
              fill={color}
              opacity={0.85}
            />

            {/* Value label */}
            <text
              x={LEFT + barWidth + 5}
              y={y + BAR_H / 2 + 4}
              fontSize={9}
              fill={color}
              fontFamily="Arial, sans-serif"
              fontWeight="600"
            >
              {contrib.toFixed(1)}
            </text>
          </g>
        );
      })}

      {/* Legend */}
      {[
        { label: "Positive impact", color: "#437A22" },
        { label: "Neutral",         color: "#20808D" },
        { label: "Negative impact", color: "#964219" },
      ].map(({ label, color }, i) => (
        <g key={label} transform={`translate(${LEFT + i * 145}, ${HEIGHT - 10})`}>
          <rect x={0} y={-8} width={10} height={10} rx={2} fill={color} opacity={0.85} />
          <text x={14} y={0} fontSize={7.5} fill="#7A7974" fontFamily="Arial, sans-serif">{label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Stone Variable Chart ─────────────────────────────────────────────────────
interface StoneVariableChartProps {
  variableChecks: AdhesivityResult["stoneRecognition"]["variableChecks"];
  stoneType: string;
}

export function StoneVariableChart({ variableChecks, stoneType }: StoneVariableChartProps) {
  if (variableChecks.length === 0) return null;

  const BAR_H  = 20;
  const GAP    = 8;
  const LEFT   = 70;
  const RIGHT_W = 360;
  const HEIGHT = variableChecks.length * (BAR_H * 2 + GAP + 6) + 50;

  // Find max value across all vars for normalisation
  const maxVal = Math.max(...variableChecks.flatMap(v => [v.userValue, v.refValue]), 1);

  return (
    <svg
      width={LEFT + RIGHT_W + 60}
      height={HEIGHT}
      viewBox={`0 0 ${LEFT + RIGHT_W + 60} ${HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Title */}
      <text x={0} y={16} fontSize={11} fontWeight="600" fill="#28251D" fontFamily="Arial, sans-serif">
        Stone Recognition — Variable Comparison vs {stoneType} Reference
      </text>

      {variableChecks.map((v, i) => {
        const userBar = Math.max(2, (v.userValue / maxVal) * RIGHT_W);
        const refBar  = Math.max(2, (v.refValue  / maxVal) * RIGHT_W);
        const color   = v.inBounds ? "#437A22" : "#D19900";
        const y       = 28 + i * (BAR_H * 2 + GAP + 6);

        const fmt = (n: number) => n < 0.1 ? n.toFixed(4) : n.toFixed(2);

        return (
          <g key={v.label}>
            {/* Variable label */}
            <text x={LEFT - 4} y={y + BAR_H - 2} textAnchor="end" fontSize={9} fill="#28251D" fontFamily="Arial, sans-serif">
              {v.label}
            </text>

            {/* In/out badge */}
            <text
              x={LEFT - 4} y={y + 8}
              textAnchor="end"
              fontSize={7.5}
              fill={color}
              fontFamily="Arial, sans-serif"
            >
              {v.inBounds ? "✓ in range" : "⚠ deviation"}
            </text>

            {/* User bar (top) */}
            <rect x={LEFT} y={y} width={RIGHT_W} height={BAR_H} rx={3} fill="#F0EFEB" />
            <rect x={LEFT} y={y} width={userBar} height={BAR_H} rx={3} fill={color} opacity={0.75} />
            <text x={LEFT + userBar + 4} y={y + BAR_H - 5} fontSize={8} fill={color} fontFamily="Arial, sans-serif" fontWeight="600">
              {fmt(v.userValue)}%
            </text>
            <text x={LEFT - 4} y={y + BAR_H - 5} textAnchor="end" fontSize={7} fill="#9A9996" fontFamily="Arial, sans-serif">entered</text>

            {/* Reference bar (bottom) */}
            <rect x={LEFT} y={y + BAR_H + 3} width={RIGHT_W} height={BAR_H} rx={3} fill="#F0EFEB" />
            <rect x={LEFT} y={y + BAR_H + 3} width={refBar} height={BAR_H} rx={3} fill="#9A9996" opacity={0.5} />
            <text x={LEFT + refBar + 4} y={y + BAR_H * 2 - 2} fontSize={8} fill="#7A7974" fontFamily="Arial, sans-serif">
              {fmt(v.refValue)}%
            </text>
            <text x={LEFT - 4} y={y + BAR_H * 2 - 2} textAnchor="end" fontSize={7} fill="#9A9996" fontFamily="Arial, sans-serif">ref</text>
          </g>
        );
      })}

      {/* Legend */}
      <g transform={`translate(${LEFT}, ${HEIGHT - 10})`}>
        <rect x={0} y={-8} width={10} height={10} rx={2} fill="#437A22" opacity={0.75} />
        <text x={14} y={0} fontSize={7.5} fill="#7A7974" fontFamily="Arial, sans-serif">Entered value (in range)</text>
        <rect x={110} y={-8} width={10} height={10} rx={2} fill="#D19900" opacity={0.75} />
        <text x={124} y={0} fontSize={7.5} fill="#7A7974" fontFamily="Arial, sans-serif">Entered value (deviation)</text>
        <rect x={230} y={-8} width={10} height={10} rx={2} fill="#9A9996" opacity={0.5} />
        <text x={244} y={0} fontSize={7.5} fill="#7A7974" fontFamily="Arial, sans-serif">Reference value</text>
      </g>
    </svg>
  );
}
