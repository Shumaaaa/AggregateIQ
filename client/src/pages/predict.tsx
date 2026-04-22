/**
 * Predict Page — Main adhesivity predictor
 * User enters aggregate properties → gets RC%, grade, project suitability, factor breakdown
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, FlaskConical, Info } from "lucide-react";

import { BackHomeButtons } from "@/components/ui-custom/back-home-buttons";
import { GaugeMeter } from "@/components/ui-custom/gauge-meter";
import { ContribBar } from "@/components/ui-custom/contrib-bar";
import { GradeBadge } from "@/components/ui-custom/grade-badge";
import { RiskFlags } from "@/components/ui-custom/risk-flags";
import { SectionHeader } from "@/components/ui-custom/section-header";
import { predictAdhesivity, getProjectSuitability, type AggregateInput } from "@/lib/adhesivity-model";

// Quick-load presets from experimental data
const PRESETS = [
  {
    label: "Basalt (Tanga)",
    values: { porosity: 0.49, moistureContent: 0.025, sio2: 47.4, cao: 7.28, aggregateType: "basalt" },
  },
  {
    label: "Granite (Tanga)",
    values: { porosity: 1.36, moistureContent: 0.153, sio2: 68.88, cao: 1.71, aggregateType: "granite" },
  },
  {
    label: "Limestone (Tanga Cement)",
    values: { porosity: 20.2, moistureContent: 9.848, sio2: 5.01, cao: 51.9, aggregateType: "limestone" },
  },
];

type FormState = AggregateInput & { projectType: string };

const EMPTY_FORM: FormState = {
  porosity: undefined,
  waterAbsorption: undefined,
  moistureContent: undefined,
  sio2: undefined,
  cao: undefined,
  aggregateType: "basalt",
  projectType: "highway",
};

export default function Predict() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [result, setResult] = useState<ReturnType<typeof predictAdhesivity> | null>(null);

  function loadPreset(idx: number) {
    setForm({ ...EMPTY_FORM, ...PRESETS[idx].values });
    setResult(null);
  }

  function handleAnalyze() {
    setResult(predictAdhesivity(form));
  }

  function handleReset() {
    setForm(EMPTY_FORM);
    setResult(null);
  }

  const suitability = result ? getProjectSuitability(result.predictedRC, form.projectType) : null;

  return (
    <div className="space-y-6">
      <BackHomeButtons backHref="/home" backLabel="Home" />
      <SectionHeader
        title="Adhesivity Predictor"
        subtitle="Enter aggregate properties to predict Retained Coating (%) and adhesivity grade."
      />

      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── Input Panel ─────────────────────────────────────────── */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary" />
                Aggregate Properties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Quick presets */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Quick Load — Experimental Data
                </Label>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((p, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => loadPreset(i)}
                      data-testid={`button-preset-${i}`}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Type + Project */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs" htmlFor="agg-type">Aggregate Type</Label>
                  <Select
                    value={form.aggregateType}
                    onValueChange={v => setForm(f => ({ ...f, aggregateType: v }))}
                  >
                    <SelectTrigger id="agg-type" className="mt-1 h-8 text-sm" data-testid="select-aggregate-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basalt">Basalt</SelectItem>
                      <SelectItem value="granite">Granite</SelectItem>
                      <SelectItem value="limestone">Limestone</SelectItem>
                      <SelectItem value="quartzite">Quartzite</SelectItem>
                      <SelectItem value="dolerite">Dolerite</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs" htmlFor="proj-type">Project Type</Label>
                  <Select
                    value={form.projectType}
                    onValueChange={v => setForm(f => ({ ...f, projectType: v }))}
                  >
                    <SelectTrigger id="proj-type" className="mt-1 h-8 text-sm" data-testid="select-project-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="highway">National Highway</SelectItem>
                      <SelectItem value="urban">Urban Road</SelectItem>
                      <SelectItem value="rural">Rural / Feeder Road</SelectItem>
                      <SelectItem value="coastal">Coastal Road</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Physical properties */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wide">
                  Physical Properties
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs" htmlFor="porosity">Porosity (%)</Label>
                    <Input
                      id="porosity"
                      type="number"
                      step="0.01"
                      className="mt-1 h-8 text-sm"
                      value={form.porosity ?? ""}
                      onChange={e => setForm(f => ({ ...f, porosity: e.target.value ? +e.target.value : undefined }))}
                      data-testid="input-porosity"
                    />
                  </div>
                  <div>
                    <Label className="text-xs" htmlFor="wa">
                      Water Absorption (%)
                      <span className="text-muted-foreground ml-1 font-normal">if no porosity</span>
                    </Label>
                    <Input
                      id="wa"
                      type="number"
                      step="0.001"
                      className="mt-1 h-8 text-sm"
                      value={form.waterAbsorption ?? ""}
                      onChange={e => setForm(f => ({ ...f, waterAbsorption: e.target.value ? +e.target.value : undefined }))}
                      data-testid="input-water-absorption"
                    />
                  </div>
                  <div>
                    <Label className="text-xs" htmlFor="mc">Moisture Content (%)</Label>
                    <Input
                      id="mc"
                      type="number"
                      step="0.001"
                      className="mt-1 h-8 text-sm"
                      value={form.moistureContent ?? ""}
                      onChange={e => setForm(f => ({ ...f, moistureContent: e.target.value ? +e.target.value : undefined }))}
                      data-testid="input-moisture-content"
                    />
                  </div>
                </div>
              </div>

              {/* Chemical properties */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wide">
                  Chemical Properties (XRF)
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs" htmlFor="sio2">SiO₂ (%)</Label>
                    <Input
                      id="sio2"
                      type="number"
                      step="0.01"
                      className="mt-1 h-8 text-sm"
                      value={form.sio2 ?? ""}
                      onChange={e => setForm(f => ({ ...f, sio2: e.target.value ? +e.target.value : undefined }))}
                      data-testid="input-sio2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs" htmlFor="cao">CaO (%)</Label>
                    <Input
                      id="cao"
                      type="number"
                      step="0.01"
                      className="mt-1 h-8 text-sm"
                      value={form.cao ?? ""}
                      onChange={e => setForm(f => ({ ...f, cao: e.target.value ? +e.target.value : undefined }))}
                      data-testid="input-cao"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={handleAnalyze} className="flex-1" data-testid="button-analyze">
                  Analyse Aggregate
                </Button>
                <Button variant="outline" onClick={handleReset} data-testid="button-reset">
                  Reset
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* ── Results Panel ────────────────────────────────────────── */}
        <div className="space-y-4">
          {!result ? (
            <Card className="flex items-center justify-center min-h-[320px]">
              <div className="text-center p-8">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <FlaskConical className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter aggregate properties and click<br />
                  <strong>Analyse Aggregate</strong> to see results.
                </p>
              </div>
            </Card>
          ) : (
            <>
              {/* Grade + gauge */}
              <Card>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Predicted Result
                      </div>
                      <GradeBadge grade={result.grade} size="md" />
                      <div className="text-xs text-muted-foreground mt-1">per ASTM D1664</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {result.confidence === "experimental" ? "✓ Exp. validated" : "Index-based"}
                    </Badge>
                  </div>
                  <GaugeMeter value={result.predictedRC} />
                </CardContent>
              </Card>

              {/* Project suitability */}
              {suitability && (
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      {suitability.suitable
                        ? <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                        : <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      }
                      <div>
                        <div className="text-sm font-medium">
                          {suitability.suitable ? "Suitable" : "Not Suitable"} —{" "}
                          {{ highway: "National Highway", urban: "Urban Road", rural: "Rural Road", coastal: "Coastal Road" }[form.projectType]}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{suitability.note}</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground leading-relaxed">
                      {result.recommendation}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Factor breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Factor Contributions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <ContribBar label="Porosity (40%)"  contribution={result.breakdown.porosity.contribution}        impact={result.breakdown.porosity.impact} />
                  <ContribBar label="Moisture (25%)"  contribution={result.breakdown.moistureContent.contribution} impact={result.breakdown.moistureContent.impact} />
                  <ContribBar label="SiO₂ (20%)"      contribution={result.breakdown.sio2.contribution}            impact={result.breakdown.sio2.impact} />
                  <ContribBar label="CaO (15%)"        contribution={result.breakdown.cao.contribution}             impact={result.breakdown.cao.impact} />
                  <div className="text-xs text-muted-foreground pt-1 border-t border-border">
                    Weights calibrated from experimental data + literature consensus
                  </div>
                </CardContent>
              </Card>

              {/* Risk flags */}
              <RiskFlags flags={result.riskFlags} />
            </>
          )}
        </div>
      </div>

      {/* Model disclaimer */}
      <Card className="bg-muted/40 border-dashed">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Model basis:</strong> Weighted index scoring calibrated from 3 experimental data points
              (Basalt, Granite, Limestone — Dar es Salaam, 2026) and literature consensus
              (Kim et al. 2023; Apeagyei et al. 2017; Zhang et al. 2015). Results marked
              "Index-based" are indicative estimates only.
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
