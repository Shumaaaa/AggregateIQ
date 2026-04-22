/**
 * Compare Page — Side-by-side comparison of up to 3 aggregates
 * User can enter custom aggregate name + all properties
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, BarChart3, Trophy, AlertTriangle } from "lucide-react";

import { BackHomeButtons } from "@/components/ui-custom/back-home-buttons";
import { GradeBadge } from "@/components/ui-custom/grade-badge";
import { SectionHeader } from "@/components/ui-custom/section-header";
import { predictAdhesivity, type AggregateInput } from "@/lib/adhesivity-model";

// Each aggregate entry in the comparison form
interface AggEntry {
  id: number;
  customName: string;       // user-typed name — can be anything
  aggregateType: string;
  porosity: string;
  moistureContent: string;
  sio2: string;
  cao: string;
}

const CARD_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
];

let nextId = 3;

function entryToInput(e: AggEntry): AggregateInput {
  return {
    porosity:       e.porosity       ? +e.porosity       : undefined,
    moistureContent: e.moistureContent ? +e.moistureContent : undefined,
    sio2:           e.sio2           ? +e.sio2           : undefined,
    cao:            e.cao            ? +e.cao            : undefined,
    aggregateType:  e.aggregateType,
  };
}

function emptyEntry(id: number, defaultType: string, defaultName: string): AggEntry {
  return { id, customName: defaultName, aggregateType: defaultType, porosity: "", moistureContent: "", sio2: "", cao: "" };
}

export default function Compare() {
  const [entries, setEntries] = useState<AggEntry[]>([
    emptyEntry(1, "basalt",  "Aggregate A"),
    emptyEntry(2, "granite", "Aggregate B"),
  ]);
  const [results, setResults] = useState<Array<ReturnType<typeof predictAdhesivity>> | null>(null);

  function updateEntry(id: number, field: keyof AggEntry, value: string) {
    setEntries(es => es.map(e => e.id === id ? { ...e, [field]: value } : e));
    setResults(null);
  }

  function addEntry() {
    if (entries.length >= 3) return;
    setEntries(es => [...es, emptyEntry(nextId++, "basalt", `Aggregate ${String.fromCharCode(64 + nextId - 1)}`)]);
  }

  function removeEntry(id: number) {
    if (entries.length <= 2) return;
    setEntries(es => es.filter(e => e.id !== id));
    setResults(null);
  }

  function handleCompare() {
    setResults(entries.map(e => predictAdhesivity(entryToInput(e))));
  }

  function handleReset() {
    setEntries([
      emptyEntry(1, "basalt",  "Aggregate A"),
      emptyEntry(2, "granite", "Aggregate B"),
    ]);
    setResults(null);
  }

  // Sort by best RC first
  const ranked = results
    ? [...results.map((r, i) => ({ ...r, idx: i, label: entries[i].customName || `Aggregate ${i + 1}` }))]
        .sort((a, b) => b.predictedRC - a.predictedRC)
    : null;

  return (
    <div className="space-y-6">
      <BackHomeButtons backHref="/home" backLabel="Home" />
      <SectionHeader
        title="Aggregate Comparison"
        subtitle="Compare up to 3 aggregates side by side to identify the best performer."
      />

      {/* Entry cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map((entry, idx) => (
          <Card key={entry.id} style={{ borderTop: `3px solid ${CARD_COLORS[idx]}` }}>
            <CardHeader className="pb-2 pt-4">
              <div className="flex items-center justify-between gap-2">
                {/* Custom name — editable */}
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <Input
                    value={entry.customName}
                    onChange={e => updateEntry(entry.id, "customName", e.target.value)}
                    className="mt-1 h-7 text-sm font-medium"
                    placeholder="Enter a name"
                    data-testid={`input-label-${idx}`}
                  />
                </div>
                {entries.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground mt-4 shrink-0"
                    onClick={() => removeEntry(entry.id)}
                    data-testid={`button-remove-${idx}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-2.5">
              {/* Aggregate type */}
              <div>
                <Label className="text-xs">Type</Label>
                <Select
                  value={entry.aggregateType}
                  onValueChange={v => updateEntry(entry.id, "aggregateType", v)}
                >
                  <SelectTrigger className="mt-1 h-7 text-xs" data-testid={`select-type-${idx}`}>
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

              {/* Property inputs — no placeholder text */}
              {([
                { field: "porosity"        as const, label: "Porosity (%)"         },
                { field: "moistureContent" as const, label: "Moisture Content (%)"  },
                { field: "sio2"            as const, label: "SiO₂ (%)"             },
                { field: "cao"             as const, label: "CaO (%)"              },
              ] as const).map(({ field, label }) => (
                <div key={field}>
                  <Label className="text-xs">{label}</Label>
                  <Input
                    type="number"
                    step="0.001"
                    className="mt-1 h-7 text-xs"
                    value={entry[field]}
                    onChange={e => updateEntry(entry.id, field, e.target.value)}
                    data-testid={`input-${field}-${idx}`}
                  />
                </div>
              ))}

              {/* Inline result after compare */}
              {results && results[idx] && (
                <div className="pt-2 mt-1 border-t border-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Predicted RC</span>
                    <span className="text-sm font-bold" style={{ color: results[idx].gradeColor }}>
                      {results[idx].predictedRC}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Grade</span>
                    <GradeBadge grade={results[idx].grade} />
                  </div>
                  <div className="mt-1.5 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${results[idx].predictedRC}%`, background: CARD_COLORS[idx] }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Add third aggregate */}
        {entries.length < 3 && (
          <button
            onClick={addEntry}
            className="border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 p-6 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors min-h-[240px]"
            data-testid="button-add-aggregate"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs">Add Aggregate</span>
          </button>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button onClick={handleCompare} data-testid="button-compare">
          <BarChart3 className="w-4 h-4 mr-2" />
          Compare All
        </Button>
        <Button variant="outline" onClick={handleReset} data-testid="button-reset">
          Reset
        </Button>
      </div>

      {/* Ranking results */}
      {ranked && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Ranking — Best Performer First</h2>

          <div className="space-y-3">
            {ranked.map((r, i) => (
              <Card key={r.idx} className={i === 0 ? "border-primary/40" : ""}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {i === 0 && <Trophy className="w-4 h-4 text-yellow-500 shrink-0" />}
                      <span className="text-sm font-semibold">{i + 1}. {r.label}</span>
                      <GradeBadge grade={r.grade} />
                    </div>
                    <span className="text-lg font-bold ml-2 shrink-0" style={{ color: r.gradeColor }}>
                      {r.predictedRC}%
                    </span>
                  </div>

                  {/* RC bar */}
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${r.predictedRC}%`, background: CARD_COLORS[r.idx] }}
                    />
                  </div>

                  {/* Factor mini grid */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: "Porosity", val: r.breakdown.porosity.contribution,        impact: r.breakdown.porosity.impact },
                      { label: "MC",       val: r.breakdown.moistureContent.contribution, impact: r.breakdown.moistureContent.impact },
                      { label: "SiO₂",     val: r.breakdown.sio2.contribution,            impact: r.breakdown.sio2.impact },
                      { label: "CaO",      val: r.breakdown.cao.contribution,             impact: r.breakdown.cao.impact },
                    ].map(({ label, val, impact }) => (
                      <div key={label} className="bg-muted/50 rounded p-1.5">
                        <div className="text-xs text-muted-foreground">{label}</div>
                        <div
                          className="text-xs font-semibold mt-0.5"
                          style={{ color: impact === "positive" ? "#437A22" : impact === "negative" ? "#964219" : "#D19900" }}
                        >
                          {val.toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Risk flags (first 2) */}
                  {r.riskFlags.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border">
                      {r.riskFlags.slice(0, 2).map((flag, fi) => (
                        <div key={fi} className="flex items-start gap-1.5 mt-1">
                          <AlertTriangle className="w-3 h-3 text-destructive mt-0.5 shrink-0" />
                          <span className="text-xs text-muted-foreground">{flag}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-4 pb-4">
              <div className="text-xs font-semibold text-primary mb-1">Summary Recommendation</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>{ranked[0].label}</strong> is the best performing aggregate with a
                predicted Retained Coating of {ranked[0].predictedRC}% ({ranked[0].grade}).
                {ranked[0].riskFlags.length === 0
                  ? " No significant risk flags identified."
                  : ` ${ranked[0].riskFlags.length} risk flag(s) noted — review before final selection.`}
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
