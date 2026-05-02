/**
 * PdfEngineerModal — Collects engineer info and meter style before PDF generation
 * Fields: Engineer Name, Company/Organization, Date, Score Meter Style
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileDown, X, Gauge, Activity } from "lucide-react";

export type MeterStyle = "speedometer" | "arc";

export interface EngineerInfo {
  name: string;
  company: string;
  date: string;
  meterStyle: MeterStyle;
}

interface PdfEngineerModalProps {
  onGenerate: (info: EngineerInfo) => void;
  onClose: () => void;
  generating: boolean;
  allFieldsEmpty: boolean;  // true when all input fields are 0 or undefined
}

export function PdfEngineerModal({ onGenerate, onClose, generating, allFieldsEmpty }: PdfEngineerModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [name,    setName]    = useState("");
  const [company, setCompany] = useState("");
  const [date,    setDate]    = useState(today);
  const [meter,   setMeter]   = useState<MeterStyle>("speedometer");

  function handleSubmit() {
    if (!name.trim()) return;
    if (allFieldsEmpty) return;   // blocked — no data entered
    onGenerate({ name: name.trim(), company: company.trim(), date, meterStyle: meter });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 backdrop-blur-sm bg-background/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-sm rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileDown className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Save PDF Report</p>
                <p className="text-xs text-muted-foreground">Fill in engineer details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4">

            {/* No data warning */}
            {allFieldsEmpty && (
              <div
                className="flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-xs"
                style={{ borderColor: "#96421980", background: "#96421910" }}
              >
                <span className="text-[#964219] font-bold mt-0.5">&#9888;</span>
                <div>
                  <span className="font-semibold text-foreground">No aggregate data entered. </span>
                  <span className="text-muted-foreground">
                    Return to the predictor and enter at least one property value before generating a report.
                    A PDF generated without any data will not contain meaningful results.
                  </span>
                </div>
              </div>
            )}

            {/* Engineer name */}
            <div>
              <Label className="text-xs" htmlFor="pdf-name">
                Engineer Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="pdf-name"
                className="mt-1 h-8 text-sm"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Eng. Mwajabu A. Senzota"
                data-testid="input-pdf-name"
              />
            </div>

            {/* Company */}
            <div>
              <Label className="text-xs" htmlFor="pdf-company">
                Company / Organization
              </Label>
              <Input
                id="pdf-company"
                className="mt-1 h-8 text-sm"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="e.g. TANROADS, UDSM"
                data-testid="input-pdf-company"
              />
            </div>

            {/* Date */}
            <div>
              <Label className="text-xs" htmlFor="pdf-date">Date</Label>
              <Input
                id="pdf-date"
                type="date"
                className="mt-1 h-8 text-sm"
                value={date}
                onChange={e => setDate(e.target.value)}
                data-testid="input-pdf-date"
              />
            </div>

            {/* Meter style */}
            <div>
              <Label className="text-xs mb-2 block">Score Meter Style</Label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { id: "speedometer", label: "Speedometer", icon: Gauge,    desc: "Needle dial" },
                  { id: "arc",         label: "Arc Gauge",   icon: Activity, desc: "Filled arc"  },
                ] as const).map(({ id, label, icon: Icon, desc }) => (
                  <button
                    key={id}
                    onClick={() => setMeter(id)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      meter === id
                        ? "border-primary bg-primary/8 text-primary"
                        : "border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                    }`}
                    style={meter === id ? { background: "hsl(var(--primary) / 0.08)" } : {}}
                    data-testid={`button-meter-${id}`}
                  >
                    <Icon className="w-5 h-5 mb-1.5" />
                    <div className="text-xs font-medium">{label}</div>
                    <div className="text-xs opacity-70">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Actions */}
          <div className="flex gap-2 px-5 pb-5">
            <Button variant="outline" className="flex-1 text-xs h-9" onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="flex-1 text-xs h-9"
              onClick={handleSubmit}
              disabled={!name.trim() || generating || allFieldsEmpty}
              data-testid="button-generate-pdf"
            >
              <FileDown className="w-3.5 h-3.5 mr-1.5" />
              {generating ? "Generating…" : "Generate PDF"}
            </Button>
          </div>

        </div>
      </div>
    </>
  );
}
