/**
 * PdfScoreMeter — SVG score meter for PDF report
 * Two styles: "speedometer" (needle dial) and "arc" (filled arc gauge)
 * Pure SVG — no canvas, renders perfectly for html2canvas capture
 */

import { type MeterStyle } from "./pdf-engineer-modal";

interface PdfScoreMeterProps {
  value: number;       // RC% 0–100
  low: number;         // confidence lower bound
  high: number;        // confidence upper bound
  grade: string;
  gradeColor: string;
  style: MeterStyle;
}

// Grade colour zones for the dial background (arcs)
const ZONES = [
  { from: 0,  to: 50,  color: "#96421930" },  // Unacceptable — brown
  { from: 50, to: 70,  color: "#D1990030" },  // Borderline — amber
  { from: 70, to: 85,  color: "#20808D30" },  // Acceptable — teal
  { from: 85, to: 95,  color: "#1B474D30" },  // Good — dark teal
  { from: 95, to: 100, color: "#437A2230" },  // Very Good — green
];

// Convert polar (angle, radius) to cartesian (cx, cy = center)
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// Build SVG arc path between two angles
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const s = polar(cx, cy, r, startDeg);
  const e = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

// Map RC value (0–100) to angle on a 220° arc (from -110° to +110° relative to bottom)
// Start = 135° (bottom-left), End = 405° = 45° (bottom-right), span = 270°
const DIAL_START = 135;
const DIAL_END   = 405;
const DIAL_SPAN  = DIAL_END - DIAL_START; // 270°

function valToAngle(val: number): number {
  return DIAL_START + (val / 100) * DIAL_SPAN;
}

// ── Speedometer ─────────────────────────────────────────────────────────────
function Speedometer({ value, low, high, grade, gradeColor }: Omit<PdfScoreMeterProps, "style">) {
  const cx = 150, cy = 150, r = 100;
  const needleAngle = valToAngle(value);
  const needleTip = polar(cx, cy, r - 8, needleAngle);
  const needleBase1 = polar(cx, cy, 12, needleAngle + 90);
  const needleBase2 = polar(cx, cy, 12, needleAngle - 90);

  return (
    <svg width="300" height="220" viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg">
      {/* Zone arcs */}
      {ZONES.map(z => (
        <path
          key={z.from}
          d={arcPath(cx, cy, r, valToAngle(z.from), valToAngle(z.to))}
          fill="none"
          stroke={z.color.slice(0, 7)}
          strokeWidth={18}
          strokeOpacity={0.4}
        />
      ))}

      {/* Track arc (background) */}
      <path
        d={arcPath(cx, cy, r, DIAL_START, DIAL_END)}
        fill="none"
        stroke="#E5E4E0"
        strokeWidth={3}
      />

      {/* Confidence interval arc */}
      <path
        d={arcPath(cx, cy, r, valToAngle(low), valToAngle(high))}
        fill="none"
        stroke={gradeColor}
        strokeWidth={6}
        strokeOpacity={0.3}
      />

      {/* Value arc */}
      <path
        d={arcPath(cx, cy, r, DIAL_START, valToAngle(value))}
        fill="none"
        stroke={gradeColor}
        strokeWidth={4}
      />

      {/* Tick marks */}
      {[0, 25, 50, 75, 100].map(v => {
        const a = valToAngle(v);
        const inner = polar(cx, cy, r - 14, a);
        const outer = polar(cx, cy, r + 2, a);
        return (
          <line
            key={v}
            x1={inner.x} y1={inner.y}
            x2={outer.x} y2={outer.y}
            stroke="#9A9996" strokeWidth={1.5}
          />
        );
      })}

      {/* Tick labels */}
      {[0, 50, 100].map(v => {
        const a = valToAngle(v);
        const pos = polar(cx, cy, r - 26, a);
        return (
          <text
            key={v}
            x={pos.x} y={pos.y + 4}
            textAnchor="middle"
            fontSize={9}
            fill="#9A9996"
            fontFamily="Arial, sans-serif"
          >
            {v}
          </text>
        );
      })}

      {/* Needle */}
      <polygon
        points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
        fill={gradeColor}
        opacity={0.9}
      />

      {/* Center cap */}
      <circle cx={cx} cy={cy} r={10} fill={gradeColor} />
      <circle cx={cx} cy={cy} r={5}  fill="white" />

      {/* RC value text */}
      <text
        x={cx} y={cy + 38}
        textAnchor="middle"
        fontSize={28}
        fontWeight="bold"
        fill={gradeColor}
        fontFamily="Arial, sans-serif"
      >
        {value}%
      </text>

      {/* Grade label */}
      <text
        x={cx} y={cy + 56}
        textAnchor="middle"
        fontSize={11}
        fill={gradeColor}
        fontFamily="Arial, sans-serif"
      >
        {grade}
      </text>

      {/* CI label */}
      <text
        x={cx} y={cy + 70}
        textAnchor="middle"
        fontSize={8}
        fill="#9A9996"
        fontFamily="Arial, sans-serif"
      >
        90% CI: {low}% – {high}%
      </text>
    </svg>
  );
}

// ── Arc Gauge ────────────────────────────────────────────────────────────────
function ArcGauge({ value, low, high, grade, gradeColor }: Omit<PdfScoreMeterProps, "style">) {
  const cx = 150, cy = 155, r = 110;

  return (
    <svg width="300" height="210" viewBox="0 0 300 210" xmlns="http://www.w3.org/2000/svg">
      {/* Zone fills */}
      {ZONES.map(z => (
        <path
          key={z.from}
          d={arcPath(cx, cy, r, valToAngle(z.from), valToAngle(z.to))}
          fill="none"
          stroke={z.color.slice(0, 7)}
          strokeWidth={22}
          strokeOpacity={0.35}
        />
      ))}

      {/* Background track */}
      <path
        d={arcPath(cx, cy, r, DIAL_START, DIAL_END)}
        fill="none"
        stroke="#E5E4E0"
        strokeWidth={22}
        strokeLinecap="round"
      />

      {/* Confidence interval */}
      <path
        d={arcPath(cx, cy, r, valToAngle(low), valToAngle(high))}
        fill="none"
        stroke={gradeColor}
        strokeWidth={22}
        strokeOpacity={0.2}
      />

      {/* Filled value arc */}
      <path
        d={arcPath(cx, cy, r, DIAL_START, valToAngle(value))}
        fill="none"
        stroke={gradeColor}
        strokeWidth={22}
        strokeLinecap="round"
      />

      {/* Grade label background pill */}
      <rect x={cx - 42} y={cy - 24} width={84} height={22} rx={11} fill={gradeColor} opacity={0.12} />

      {/* Grade text */}
      <text
        x={cx} y={cy - 8}
        textAnchor="middle"
        fontSize={11}
        fontWeight="600"
        fill={gradeColor}
        fontFamily="Arial, sans-serif"
      >
        {grade}
      </text>

      {/* RC% large */}
      <text
        x={cx} y={cy + 26}
        textAnchor="middle"
        fontSize={36}
        fontWeight="bold"
        fill={gradeColor}
        fontFamily="Arial, sans-serif"
      >
        {value}%
      </text>

      {/* CI */}
      <text
        x={cx} y={cy + 44}
        textAnchor="middle"
        fontSize={8}
        fill="#9A9996"
        fontFamily="Arial, sans-serif"
      >
        90% CI: {low}% – {high}%
      </text>

      {/* Scale labels */}
      {[
        { v: 0,   label: "0" },
        { v: 50,  label: "50" },
        { v: 100, label: "100" },
      ].map(({ v, label }) => {
        const pos = polar(cx, cy, r + 18, valToAngle(v));
        return (
          <text
            key={v}
            x={pos.x} y={pos.y + 4}
            textAnchor="middle"
            fontSize={8}
            fill="#9A9996"
            fontFamily="Arial, sans-serif"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

// ── Export ───────────────────────────────────────────────────────────────────
export function PdfScoreMeter(props: PdfScoreMeterProps) {
  return props.style === "speedometer"
    ? <Speedometer {...props} />
    : <ArcGauge    {...props} />;
}
