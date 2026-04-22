/**
 * AboutPanel — Overlay panel that slides over the home page
 * Contains info about the app, the team, and what AggregateIQ is
 * Triggered from the "About" nav button
 */
import { X, Github, Beaker, Cpu, MapPin, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AboutPanelProps {
  open: boolean;
  onClose: () => void;
}

export function AboutPanel({ open, onClose }: AboutPanelProps) {
  if (!open) return null;

  return (
    <>
      {/* ── Backdrop ───────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        data-testid="about-panel-backdrop"
      />

      {/* ── Panel ──────────────────────────────────────────────── */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-background border-l border-border
          shadow-2xl flex flex-col overflow-hidden"
        data-testid="about-panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <svg aria-label="AggregateIQ logo" viewBox="0 0 32 32" className="w-7 h-7 shrink-0">
              <circle cx="16" cy="16" r="14" fill="hsl(var(--primary))" opacity="0.15" />
              <polygon points="16,4 28,12 28,20 16,28 4,20 4,12" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
              <circle cx="16" cy="16" r="4" fill="hsl(var(--primary))" />
              <line x1="16" y1="4"  x2="16" y2="12" stroke="hsl(var(--primary))" strokeWidth="1.5" />
              <line x1="28" y1="12" x2="22" y2="14" stroke="hsl(var(--primary))" strokeWidth="1.5" />
              <line x1="28" y1="20" x2="22" y2="18" stroke="hsl(var(--primary))" strokeWidth="1.5" />
              <line x1="16" y1="28" x2="16" y2="20" stroke="hsl(var(--primary))" strokeWidth="1.5" />
              <line x1="4"  y1="20" x2="10" y2="18" stroke="hsl(var(--primary))" strokeWidth="1.5" />
              <line x1="4"  y1="12" x2="10" y2="14" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            </svg>
            <div>
              <h2 className="font-semibold text-sm text-foreground">AggregateIQ</h2>
              <p className="text-xs text-muted-foreground">About this application</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            data-testid="button-about-close"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* What is AggregateIQ */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              What is AggregateIQ?
            </h3>
            <p className="text-sm text-foreground leading-relaxed mb-3">
              AggregateIQ is a web-based tool for civil engineers to assess and select
              aggregates for bituminous road construction in Tanzania. It predicts
              bitumen-aggregate adhesivity (Retained Coating %) from physical and
              chemical properties of the aggregate.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">Adhesivity Prediction</Badge>
              <Badge variant="secondary" className="text-xs">Aggregate Comparison</Badge>
              <Badge variant="secondary" className="text-xs">Risk Flagging</Badge>
              <Badge variant="secondary" className="text-xs">Reference Library</Badge>
            </div>
          </section>

          {/* The Research */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              The Research
            </h3>
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm">
              <div className="flex items-start gap-2.5">
                <Beaker className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-xs">Laboratory Study</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Experiments conducted in Dar es Salaam, Tanzania (2026). Three aggregate
                    types tested under ASTM D1664 Retained Coating test (24-hour static immersion).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-xs">Aggregate Sources</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Basalt (Dar es Salaam quarry), Granite (Dar es Salaam quarry),
                    Limestone (Tanga Cement — Tanga region).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Cpu className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-xs">Prediction Model</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Semi-empirical Weighted Index Scoring (6 factors) — MC (33%), Porosity (24%),
                    Fe₂O₃ (15%), Al₂O₃ (12%), SiO₂ (10%), CaO (6%).
                    57% Physical · 43% Chemical. Hybrid data-driven + engineering judgment.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Built by */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Built By
            </h3>
            <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Fadhil Shuma</p>
                <p className="text-xs text-muted-foreground">
                  Civil Engineering Researcher · Tanzania · 2026
                </p>
                <a
                  href="https://github.com/Shumaaaa/AggregateIQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline mt-1"
                  data-testid="link-github"
                >
                  <Github className="w-3 h-3" />
                  github.com/Shumaaaa/AggregateIQ
                </a>
              </div>
            </div>
          </section>

          {/* Supervised by */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Supervised By
            </h3>
            <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Eng. Mwajabu Senzota</p>
                <p className="text-xs text-muted-foreground">
                  Supervisor · Pavement Engineering · Tanzania
                </p>
              </div>
            </div>
          </section>

          {/* Tech stack */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Technology
            </h3>
            <div className="flex flex-wrap gap-2">
              {["React", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "Express", "Wouter"].map((t) => (
                <Badge key={t} variant="outline" className="text-xs font-mono">
                  {t}
                </Badge>
              ))}
            </div>
          </section>

          {/* Version */}
          <section className="pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>AggregateIQ v2.0</span>
              <span>Tanzania Pavement Engineering Research · 2026</span>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
