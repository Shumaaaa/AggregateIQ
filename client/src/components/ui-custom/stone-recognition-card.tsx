/**
 * StoneRecognitionCard — Displays detailed stone type recognition result
 * Shows matched stone type, confidence, per-variable analysis with reasons.
 * Positioned below Grade/Gauge card in predict results panel.
 */
import { CheckCircle2, XCircle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type StoneRecognitionResult } from "@/lib/adhesivity-model";

interface StoneRecognitionCardProps {
  recognition: StoneRecognitionResult;
}

// Stone type accent colours — consistent with calibration data table
const STONE_COLORS: Record<string, string> = {
  Basalt:    "#20808D",
  Granite:   "#437A22",
  Limestone: "#D19900",
  Undefined: "#7A7974",
};

export function StoneRecognitionCard({ recognition }: StoneRecognitionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const {
    stoneType,
    matched,
    checksTotal,
    checksMatched,
    summary,
    detail,
    variableChecks,
  } = recognition;

  const accentColor = STONE_COLORS[stoneType] ?? "#7A7974";
  const outOfBounds = variableChecks.filter(v => !v.inBounds);

  return (
    <Card style={{ borderLeft: `3px solid ${accentColor}` }}>
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center justify-between">
          Stone Recognition
          <Badge
            variant="outline"
            className="text-xs font-normal normal-case tracking-normal"
            style={{ color: accentColor, borderColor: accentColor + "60", background: accentColor + "12" }}
          >
            90% confidence
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">

        {/* Stone name + match status */}
        <div className="flex items-center gap-2.5">
          {matched ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: accentColor }} />
          ) : (
            <HelpCircle className="w-5 h-5 shrink-0 text-muted-foreground" />
          )}
          <div>
            <span
              className="text-base font-bold"
              style={{ color: matched ? accentColor : "hsl(var(--foreground))" }}
            >
              {stoneType}
            </span>
            {matched && (
              <span className="text-xs text-muted-foreground ml-2">
                {checksMatched}/{checksTotal} variables matched
              </span>
            )}
          </div>
        </div>

        {/* Summary sentence */}
        <p className="text-xs text-muted-foreground leading-relaxed">{summary}</p>

        {/* Variable check rows — always visible */}
        {variableChecks.length > 0 && (
          <div className="rounded-lg border border-border overflow-hidden">
            {variableChecks.map((v, i) => (
              <div
                key={v.label}
                className={`flex items-start gap-2.5 px-3 py-2 ${i > 0 ? "border-t border-border" : ""} ${i % 2 === 0 ? "" : "bg-muted/20"}`}
              >
                {v.inBounds ? (
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#437A22]" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#D19900]" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium">{v.label}</span>
                    <div className="text-xs tabular-nums text-muted-foreground shrink-0">
                      <span
                        className="font-semibold"
                        style={{ color: v.inBounds ? "#437A22" : "#D19900" }}
                      >
                        {v.userValue < 0.1 ? v.userValue.toFixed(4) : v.userValue.toFixed(2)}%
                      </span>
                      <span className="mx-1 opacity-50">vs</span>
                      <span>{v.refValue < 0.1 ? v.refValue.toFixed(4) : v.refValue.toFixed(2)}%</span>
                    </div>
                  </div>
                  {/* Show reason only if out of bounds, or if expanded */}
                  {(!v.inBounds || expanded) && (
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {v.reason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail / expand section */}
        {(detail || outOfBounds.length > 0) && (
          <div>
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              {expanded ? (
                <><ChevronUp className="w-3 h-3" /> Hide detail</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> {outOfBounds.length > 0 ? `See explanation for ${outOfBounds.length} deviation${outOfBounds.length > 1 ? "s" : ""}` : "See full detail"}</>
              )}
            </button>
            {expanded && (
              <p className="text-xs text-muted-foreground leading-relaxed mt-2 p-3 rounded-lg bg-muted/40 border border-border">
                {detail}
              </p>
            )}
          </div>
        )}

        {/* Undefined extra note */}
        {!matched && (
          <div className="rounded-lg bg-muted/40 border border-border p-3 text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Note:</strong> The adhesivity prediction is still
            calculated using the index model. Stone recognition affects the confidence label only
            (Experimental vs Index-based), not the RC% prediction itself.
          </div>
        )}

      </CardContent>
    </Card>
  );
}
