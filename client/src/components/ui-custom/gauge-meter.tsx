/**
 * GaugeMeter — Semicircle gauge showing Retained Coating %
 * Color changes based on grade thresholds (ASTM D1664)
 */
interface GaugeMeterProps {
  value: number; // 0–100
}

function getGaugeColor(pct: number): string {
  if (pct >= 95) return "#437A22";
  if (pct >= 80) return "#1B474D";
  if (pct >= 60) return "#D19900";
  return "#964219";
}

export function GaugeMeter({ value }: GaugeMeterProps) {
  const pct = Math.min(100, Math.max(0, value));
  const color = getGaugeColor(pct);
  const r = 52, cx = 64, cy = 64;
  const circumference = Math.PI * r;
  const dash = (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 128 80" className="w-44 h-28" aria-label={`Retained Coating: ${value}%`}>
        {/* Background track */}
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={10}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
        {/* Value text */}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fontWeight="700" fill={color}>
          {value}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">
          Retained Coating
        </text>
      </svg>
    </div>
  );
}
