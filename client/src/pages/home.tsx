/**
 * Home Page — Landing page with feature overview and experimental data table
 */
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, GitCompare, BookOpen, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Predict Adhesivity",
    desc: "Enter porosity, moisture content, SiO₂, and CaO — get predicted Retained Coating (%) and ASTM grade instantly.",
    href: "/predict",
    cta: "Open Predictor",
    testId: "button-open-predictor",
  },
  {
    icon: GitCompare,
    title: "Compare Aggregates",
    desc: "Input two or three aggregates side by side. See which performs best and why — broken down by factor.",
    href: "/compare",
    cta: "Open Comparison",
    testId: "button-open-comparison",
  },
  {
    icon: BookOpen,
    title: "Raw Information",
    desc: "Learn everything — from what porosity means to how experiments are performed and how the model works.",
    href: "/info",
    cta: "Open Library",
    testId: "button-open-info",
  },
];

const GRADES = [
  { grade: "Very Good",    range: "≥ 95%",     color: "#437A22" },
  { grade: "Good",         range: "85 – 94%",  color: "#1B474D" },
  { grade: "Acceptable",   range: "70 – 84%",  color: "#20808D" },
  { grade: "Borderline",   range: "50 – 69%",  color: "#D19900" },
  { grade: "Unacceptable", range: "< 50%",     color: "#964219" },
];

const EXPERIMENTAL_DATA = [
  { name: "Basalt",     porosity: "0.49",  mc: "0.0245", sio2: "47.40", cao: "7.28",  fe2o3: "16.70", al2o3: "8.33", rc: 96, grade: "Very Good",    color: "#437A22" },
  { name: "Granite",   porosity: "1.36",  mc: "0.1526", sio2: "68.88", cao: "1.71",  fe2o3: "3.19",  al2o3: "8.91", rc: 86, grade: "Good",         color: "#1B474D" },
  { name: "Limestone*",porosity: "20.20", mc: "2.2531", sio2: "5.01",  cao: "51.90", fe2o3: "0.27",  al2o3: "1.39", rc: 45, grade: "Unacceptable", color: "#964219" },
];

export default function Home() {
  return (
    <div className="space-y-10">

      {/* Hero */}
      <div className="space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          Civil Works · 2026
        </div>
        <h1 className="text-xl font-bold tracking-tight leading-snug">
          Aggregate Selection Companion
          <br />
          <span className="text-muted-foreground font-normal text-base">
            for Bituminous Pavement Engineering
          </span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          AggregateIQ helps civil engineers assess and select aggregates for bituminous
          road construction based on adhesivity performance — predicted from physical
          and chemical properties.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Button asChild data-testid="button-start-predict">
            <Link href="/predict">
              Start Predicting <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
          <Button variant="outline" asChild data-testid="button-start-compare">
            <Link href="/compare">Compare Aggregates</Link>
          </Button>
          <Button variant="outline" asChild data-testid="button-start-info">
            <Link href="/info">Raw Information</Link>
          </Button>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {FEATURES.map(({ icon: Icon, title, desc, href, cta, testId }) => (
          <Card key={title} className="group hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-semibold text-sm mb-1.5">{title}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{desc}</p>
              <Button variant="outline" size="sm" asChild className="text-xs h-7">
                <Link href={href} data-testid={testId}>
                  {cta} <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ASTM grade reference */}
      <div>
        <h2 className="text-sm font-semibold mb-3">ASTM D1664 — Adhesion Grade Reference</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {GRADES.map(({ grade, range, color }) => (
            <div
              key={grade}
              className="rounded-lg p-3 border"
              style={{ borderColor: color + "40", background: color + "12" }}
            >
              <div className="text-xs font-semibold" style={{ color }}>{grade}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{range}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Experimental data table */}
      <div>
        <h2 className="text-sm font-semibold mb-3">
          Calibration Dataset — Dodoma / Dar es Salaam (2026)
        </h2>
        <div className="rounded-lg border border-border overflow-hidden text-xs">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground">
                <th className="text-left px-3 py-2 font-medium">Aggregate</th>
                <th className="text-right px-3 py-2 font-medium">Porosity</th>
                <th className="text-right px-3 py-2 font-medium">MC</th>
                <th className="text-right px-3 py-2 font-medium">SiO₂</th>
                <th className="text-right px-3 py-2 font-medium">CaO</th>
                <th className="text-right px-3 py-2 font-medium">Fe₂O₃</th>
                <th className="text-right px-3 py-2 font-medium">Al₂O₃</th>
                <th className="text-right px-3 py-2 font-medium">RC (%)</th>
                <th className="text-right px-3 py-2 font-medium">Grade</th>
              </tr>
            </thead>
            <tbody>
              {EXPERIMENTAL_DATA.map((row, i) => (
                <tr key={row.name} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                  <td className="px-3 py-2 font-medium">{row.name}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.porosity}%</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.mc}%</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.sio2}%</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.cao}%</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.fe2o3}%</td>
                  <td className="px-3 py-2 text-right tabular-nums">{row.al2o3}%</td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums" style={{ color: row.color }}>
                    {row.rc}%
                  </td>
                  <td className="px-3 py-2 text-right" style={{ color: row.color }}>
                    {row.grade}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          * Limestone is Dar es Salaam quarry source (Tanga Cement) — high-grade CaO (51.9%) but extreme
          porosity (20.2%) overrides adhesion chemistry. Basalt and Granite from Dodoma quarries. Result is scientifically valid.
        </p>
      </div>

    </div>
  );
}
