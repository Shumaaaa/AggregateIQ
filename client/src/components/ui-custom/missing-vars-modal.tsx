/**
 * MissingVarsModal — Overlay warning when critical variables (Porosity / MC) are missing
 * Appears before results are shown. Background blurs. User must acknowledge before proceeding.
 */
import { AlertTriangle, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MissingVarsModalProps {
  missingVars: string[];       // e.g. ["Porosity (%)", "Moisture Content (%)"]
  onContinue: () => void;      // proceed to results anyway
  onGoBack: () => void;        // close modal, return to form
}

// Per-variable impact descriptions
const VAR_IMPACT: Record<string, { weight: string; effect: string }> = {
  "Porosity (%)": {
    weight: "24% of model",
    effect:
      "Porosity is the second strongest predictor of adhesivity. Without it, the model defaults to a medium estimate (porosity ≈ 5%), which may significantly over- or under-predict Retained Coating for porous aggregates like limestone.",
  },
  "Moisture Content (%)": {
    weight: "33% of model — strongest predictor",
    effect:
      "Moisture Content is the single most important factor. Without it, the model assumes MC ≈ 0%, which will over-predict adhesivity for wet or damp aggregates. Pre-drying assessment is critical before bitumen application.",
  },
};

export function MissingVarsModal({ missingVars, onContinue, onGoBack }: MissingVarsModalProps) {
  return (
    <>
      {/* Backdrop — blurs and dims everything behind */}
      <div
        className="fixed inset-0 z-40 backdrop-blur-sm bg-background/60"
        onClick={onGoBack}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >

          {/* Header bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-[#D19900]/10">
            <div className="w-9 h-9 rounded-full bg-[#D19900]/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-[#D19900]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Incomplete Analysis</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {missingVars.length === 1
                  ? "1 critical variable is missing"
                  : `${missingVars.length} critical variables are missing`}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              The following variable{missingVars.length > 1 ? "s are" : " is"} required for a full
              prediction. Results without {missingVars.length > 1 ? "them" : "it"} will have
              reduced accuracy and will be marked as <strong className="text-foreground">Index-based</strong> only.
            </p>

            {/* Missing variable cards */}
            <div className="space-y-2">
              {missingVars.map(v => {
                const info = VAR_IMPACT[v];
                return (
                  <div
                    key={v}
                    className="rounded-lg border border-[#D19900]/40 bg-[#D19900]/8 p-3 space-y-1"
                    style={{ background: "#D1990010" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">{v}</span>
                      {info && (
                        <span className="text-xs text-[#D19900] font-medium">{info.weight}</span>
                      )}
                    </div>
                    {info && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{info.effect}</p>
                    )}
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
              <strong className="text-foreground">Recommendation:</strong> Go back and enter the
              missing values for the most accurate prediction. If the data is genuinely unavailable,
              you may continue — but interpret results with caution.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 px-5 pb-5">
            <Button
              variant="outline"
              className="flex-1 text-xs h-9"
              onClick={onGoBack}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Go Back &amp; Complete
            </Button>
            <Button
              className="flex-1 text-xs h-9 bg-[#D19900] hover:bg-[#B08500] text-white border-0"
              onClick={onContinue}
            >
              Continue Anyway
              <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>

        </div>
      </div>
    </>
  );
}
