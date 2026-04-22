/**
 * GradeBadge — Colored badge showing ASTM D1664 adhesion grade
 */
interface GradeBadgeProps {
  grade: string;
  size?: "sm" | "md";
}

const GRADE_COLORS: Record<string, string> = {
  "Very Good":    "#437A22",
  "Acceptable":   "#1B474D",
  "Marginal":     "#D19900",
  "Unacceptable": "#964219",
};

export function GradeBadge({ grade, size = "sm" }: GradeBadgeProps) {
  const color = GRADE_COLORS[grade] ?? "#7A7974";
  const padding = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border ${padding}`}
      style={{ color, borderColor: color + "50", background: color + "12" }}
    >
      {grade}
    </span>
  );
}
