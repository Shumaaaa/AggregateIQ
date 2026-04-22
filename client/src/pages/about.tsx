/**
 * About Page — Model methodology, data sources, limitations, references
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, BookOpen, Layers, Target } from "lucide-react";
import { BackHomeButtons } from "@/components/ui-custom/back-home-buttons";
import { SectionHeader } from "@/components/ui-custom/section-header";

export default function About() {
  return (
    <div className="space-y-6 max-w-2xl">
      <BackHomeButtons backHref="/home" backLabel="Home" />
      <SectionHeader
        title="About AggregateIQ"
        subtitle="Methodology, data sources, and model limitations."
      />

      {/* Experimental basis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-primary" />
            Experimental Basis
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
          <p>
            This tool is calibrated from laboratory experiments conducted in Dar es Salaam,
            Tanzania (2026), testing three aggregate specimens under the ASTM D1664 Retained
            Coating test (static immersion, 24-hour water exposure).
          </p>
          <p>
            Chemical characterisation was performed via X-Ray Fluorescence (XRF) analysis.
            Physical properties were determined per ASTM C642 (Porosity), BS 812 (Water
            Absorption), and ASTM D2216 (Moisture Content).
          </p>
          <div className="rounded-lg border border-border overflow-hidden mt-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-3 py-1.5 font-medium text-muted-foreground">Aggregate</th>
                  <th className="text-right px-3 py-1.5 font-medium text-muted-foreground">Porosity</th>
                  <th className="text-right px-3 py-1.5 font-medium text-muted-foreground">SiO₂</th>
                  <th className="text-right px-3 py-1.5 font-medium text-muted-foreground">CaO</th>
                  <th className="text-right px-3 py-1.5 font-medium text-muted-foreground">RC %</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Basalt",      por: "0.49%",  sio2: "47.40%", cao: "7.28%",  rc: "96%",  color: "#437A22" },
                  { name: "Granite",     por: "1.36%",  sio2: "68.88%", cao: "1.71%",  rc: "86%",  color: "#1B474D" },
                  { name: "Limestone",   por: "20.20%", sio2: "5.01%",  cao: "51.90%", rc: "45%",  color: "#964219" },
                ].map((r, i) => (
                  <tr key={r.name} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                    <td className="px-3 py-1.5 font-medium text-foreground">{r.name}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{r.por}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{r.sio2}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{r.cao}</td>
                    <td className="px-3 py-1.5 text-right font-semibold tabular-nums" style={{ color: r.color }}>{r.rc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Model architecture */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Model Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-3">
          <p>
            The prediction engine uses a{" "}
            <strong className="text-foreground">Weighted Index Scoring</strong> approach —
            a structured expert heuristic combining experimental data with literature-calibrated
            weights. This is not a statistical regression model.
          </p>
          <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs">
            Score = 0.40×(1−norm_porosity) + 0.25×(1−norm_MC) + 0.20×(1−norm_SiO₂) + 0.15×norm_CaO
          </div>
          <div className="space-y-1.5 mt-2">
            {[
              { prop: "Porosity / WA",    weight: "40%", rationale: "Dominant factor — Zhang et al. (2015), Apeagyei et al. (2017)" },
              { prop: "Moisture Content", weight: "25%", rationale: "Reflects surface dryness at time of bitumen application" },
              { prop: "SiO₂",            weight: "20%", rationale: "Acidic chemistry (SiO₂ > 52%) reduces bitumen affinity" },
              { prop: "CaO",             weight: "15%", rationale: "Alkaline chemistry promotes adhesion — can be overridden by porosity" },
            ].map(({ prop, weight, rationale }) => (
              <div key={prop} className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs h-5 shrink-0 font-mono">{weight}</Badge>
                <div>
                  <span className="font-medium text-foreground">{prop}</span>
                  <span className="text-muted-foreground"> — {rationale}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Limitations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Limitations & Confidence
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground leading-relaxed space-y-2">
          <p>
            The current calibration dataset has{" "}
            <strong className="text-foreground">n = 3</strong> experimental points. For a
            statistically robust multi-variable regression model, a minimum of{" "}
            <strong className="text-foreground">n = 12</strong> independent data points is required.
          </p>
          <p>
            Results marked{" "}
            <strong className="text-foreground">"Index-based"</strong> are indicative estimates
            and should not replace laboratory testing for final aggregate selection decisions.
            Results marked{" "}
            <strong className="text-foreground">"Exp. validated"</strong> are close to
            experimentally tested values and carry higher confidence.
          </p>
          <p>
            The model is calibrated for Tanzania aggregate types and conditions. Application to
            aggregates from significantly different geological settings should be treated with
            additional caution.
          </p>
        </CardContent>
      </Card>

      {/* References */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            References
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2 leading-relaxed">
          {[
            "Zhang, J. et al. (2015). Effect of Aggregate Porosity on Bitumen Adhesivity. Construction and Building Materials.",
            "Apeagyei, A. K. et al. (2017). Bitumen-Aggregate Adhesion and Stripping. International Journal of Pavement Engineering.",
            "Kim, J. et al. (2023). Adhesion Properties of Basalt and Granite Aggregates, Jeju Island. Semantic Scholar.",
            "Yilmaz, M. et al. (2012). Stripping Resistance of Turkish Aggregates. Croatian Association for Road Technology.",
            "ASTM D1664 — Coating and Stripping of Bitumen-Aggregate Mixtures.",
            "ASTM C642 — Density, Absorption, and Voids in Hardened Concrete.",
            "BS 812 — Testing Aggregates — Water Absorption.",
          ].map((ref, i) => (
            <p key={i} className="flex items-start gap-2">
              <span className="text-primary font-medium shrink-0">{i + 1}.</span>
              {ref}
            </p>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
