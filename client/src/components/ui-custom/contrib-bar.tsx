/**
 * ContribBar — Horizontal bar showing factor contribution to adhesivity score
 * Color: green = positive impact, red = negative, amber = neutral
 */
interface ContribBarProps {
  label: string;
  contribution: number;
  max?: number;
  impact: "positive" | "negative" | "neutral";
}

function getImpactColor(impact: string): string {
  if (impact === "positive") return "hsl(var(--chart-1))";
  if (impact === "negative") return "hsl(var(--destructive))";
  return "hsl(var(--chart-4))";
}

export function ContribBar({ label, contribution, max = 40, impact }: ContribBarProps) {
  const pct = Math.min(100, (contribution / max) * 100);
  const color = getImpactColor(impact);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-mono w-10 text-right" style={{ color }}>
        {contribution.toFixed(1)}
      </span>
    </div>
  );
}
