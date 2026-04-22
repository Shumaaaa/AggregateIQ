/**
 * RiskFlags — Displays a list of risk warnings for an aggregate
 */
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RiskFlagsProps {
  flags: string[];
}

export function RiskFlags({ flags }: RiskFlagsProps) {
  if (flags.length === 0) return null;

  return (
    <Card className="border-destructive/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-destructive">
          <AlertTriangle className="w-3.5 h-3.5" />
          Risk Flags
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1.5">
          {flags.map((flag, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
              <span className="text-destructive mt-0.5 shrink-0">•</span>
              {flag}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
