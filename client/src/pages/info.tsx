/**
 * Raw Information Page — Encyclopedia of the adhesivity study
 * Sidebar navigation + content area. Click a topic → jump to section.
 */
import { useState, useRef } from "react";
import { BackHomeButtons } from "@/components/ui-custom/back-home-buttons";
import { SectionHeader } from "@/components/ui-custom/section-header";
import { ChevronRight } from "lucide-react";

// ── Topic definitions ────────────────────────────────────────────────────────
const TOPICS = [
  { id: "adhesivity",    label: "What is Adhesivity?"        },
  { id: "experiment",    label: "The Experiments"            },
  { id: "porosity",      label: "Porosity"                   },
  { id: "wa",            label: "Water Absorption"           },
  { id: "mc",            label: "Moisture Content"           },
  { id: "sio2",          label: "SiO₂ — Silica"              },
  { id: "cao",           label: "CaO — Calcium Oxide"        },
  { id: "fe2o3",         label: "Fe₂O₃ & Al₂O₃"             },
  { id: "basalt",        label: "Basalt — Our Results"       },
  { id: "granite",       label: "Granite — Our Results"      },
  { id: "limestone",     label: "Limestone — Our Results"    },
  { id: "model",         label: "The Model"                  },
  { id: "grades",        label: "ASTM Grade Reference"       },
  { id: "references",    label: "References"                 },
];

// ── Section content components ───────────────────────────────────────────────

function InfoSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 space-y-3">
      <h2 className="text-base font-bold text-foreground border-b border-border pb-2">{title}</h2>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function Prop({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex gap-2 items-baseline">
      <span className="font-semibold text-foreground w-36 shrink-0">{name}</span>
      <span>{value}</span>
    </div>
  );
}

function DataRow({ label, basalt, granite, limestone }: { label: string; basalt: string; granite: string; limestone: string }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-1.5 pr-4 font-medium text-foreground text-xs">{label}</td>
      <td className="py-1.5 pr-4 text-xs text-center">{basalt}</td>
      <td className="py-1.5 pr-4 text-xs text-center">{granite}</td>
      <td className="py-1.5 text-xs text-center">{limestone}</td>
    </tr>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function Info() {
  const [activeId, setActiveId] = useState("adhesivity");
  const contentRef = useRef<HTMLDivElement>(null);

  function scrollTo(id: string) {
    setActiveId(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-4">
      <BackHomeButtons backHref="/" backLabel="Home" />
      <SectionHeader
        title="Raw Information"
        subtitle="Everything you need to know — from what porosity means to how the model works."
      />

      <div className="flex gap-6 items-start">

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside className="hidden md:block w-52 shrink-0 sticky top-20">
          <nav className="space-y-0.5">
            {TOPICS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                data-testid={`nav-info-${id}`}
                className={`w-full text-left px-3 py-2 rounded-md text-xs flex items-center gap-2 transition-colors ${
                  activeId === id
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {activeId === id && <ChevronRight className="w-3 h-3 shrink-0" />}
                {activeId !== id && <span className="w-3 h-3 shrink-0" />}
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Content ─────────────────────────────────────────────── */}
        <div ref={contentRef} className="flex-1 min-w-0 space-y-10">

          <InfoSection id="adhesivity" title="What is Adhesivity?">
            <p>
              <strong className="text-foreground">Adhesivity</strong> refers to the ability of a bituminous binder (bitumen / asphalt) to stick firmly to the surface of aggregate particles in a road pavement — and, critically, to maintain that bond when water is present.
            </p>
            <p>
              In pavement engineering, poor adhesivity leads to a failure mode called <strong className="text-foreground">stripping</strong> — where water penetrates between the bitumen film and the aggregate surface, breaking the bond and causing the bitumen to peel away. This results in potholes, rutting, and premature road failure.
            </p>
            <p>
              Adhesivity is influenced by <strong className="text-foreground">two main groups of factors</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-foreground">Physical factors</strong> — Porosity, Water Absorption, Moisture Content</li>
              <li><strong className="text-foreground">Chemical factors</strong> — SiO₂ (silica), CaO (calcium oxide), Fe₂O₃ (iron oxide)</li>
            </ul>
            <p>
              The standard measure of adhesivity in this study is <strong className="text-foreground">Retained Coating (%)</strong> — the percentage of aggregate surface area that retains its bitumen coating after 24-hour water immersion (ASTM D1664).
            </p>
          </InfoSection>

          <InfoSection id="experiment" title="The Experiments">
            <p>
              Three experiments were performed on each aggregate specimen. All testing was conducted in Dar es Salaam, Tanzania (2026).
            </p>
            <h3 className="font-semibold text-foreground mt-3">1. Retained Coating Test (ASTM D1664)</h3>
            <p>
              The primary adhesivity test. Aggregate particles are coated with bitumen at a controlled temperature, then submerged in water for 24 hours at room temperature. After immersion, the percentage of aggregate surface area still retaining its bitumen coating is visually estimated.
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>RC ≥ 95% → Very Good</li>
              <li>RC 80–94% → Acceptable</li>
              <li>RC 60–79% → Marginal</li>
              <li>RC &lt; 60% → Unacceptable</li>
            </ul>

            <h3 className="font-semibold text-foreground mt-3">2. Physical Property Tests</h3>
            <Prop name="Porosity (ASTM C642)" value="Measures the ratio of void volume to total volume. Higher porosity = more pathways for water entry." />
            <Prop name="Water Absorption (BS 812)" value="Measures how much water the aggregate absorbs when fully submerged. Directly related to porosity." />
            <Prop name="Moisture Content (ASTM D2216)" value="Measures the amount of water present in the aggregate at the time of testing — before any soaking." />

            <h3 className="font-semibold text-foreground mt-3">3. X-Ray Fluorescence (XRF) Chemical Analysis</h3>
            <p>
              XRF is a non-destructive technique that identifies and quantifies the chemical elements present in a material. A crushed aggregate sample is exposed to X-rays, and the emitted fluorescent radiation is analysed to determine the percentage composition of oxides: SiO₂, CaO, Fe₂O₃, Al₂O₃, MgO, K₂O, TiO₂.
            </p>
          </InfoSection>

          <InfoSection id="porosity" title="Porosity">
            <p>
              <strong className="text-foreground">Porosity (%)</strong> is the ratio of the volume of voids (empty spaces / pores) within a rock to its total volume, expressed as a percentage.
            </p>
            <p>
              In the context of bitumen-aggregate adhesivity, porosity is the <strong className="text-foreground">single most important physical property</strong>. High porosity means:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>More internal surface area exposed to water</li>
              <li>Water penetrates deeper into the aggregate</li>
              <li>The bitumen film is displaced from the inside out</li>
              <li>Stripping occurs even if the surface chemistry is favourable</li>
            </ul>
            <p>
              Our study confirms this — Limestone has CaO = 51.9% (which should improve adhesivity) but its porosity of 20.2% completely overrides the chemical benefit, resulting in Retained Coating of only 45%.
            </p>
            <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono">
              <Prop name="Basalt"    value="0.49% → Very low → Excellent" />
              <Prop name="Granite"   value="1.36% → Low → Good" />
              <Prop name="Limestone" value="20.20% → Very high → Failure" />
            </div>
            <p className="text-xs italic">
              Literature consensus (Zhang et al. 2015; Apeagyei et al. 2017): porosity above ~5–8% becomes the dominant stripping driver, overriding chemical composition.
            </p>
          </InfoSection>

          <InfoSection id="wa" title="Water Absorption">
            <p>
              <strong className="text-foreground">Water Absorption (%)</strong> measures the mass of water absorbed by a dry aggregate specimen when fully submerged in water for a standard period (usually 24 hours), expressed as a percentage of the dry mass.
            </p>
            <p>
              Water absorption is closely related to porosity — a high-porosity aggregate will also have high water absorption. In ASTM D1664 testing, water absorption directly affects stripping because:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Absorbed water weakens the bitumen-aggregate interface from within</li>
              <li>Repeated wetting/drying cycles cause progressive debonding</li>
            </ul>
            <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono">
              <Prop name="Basalt"    value="0.168%" />
              <Prop name="Granite"   value="0.517%" />
              <Prop name="Limestone" value="9.995%" />
            </div>
          </InfoSection>

          <InfoSection id="mc" title="Moisture Content">
            <p>
              <strong className="text-foreground">Moisture Content (%)</strong> is the mass of water present in an aggregate sample relative to its dry mass, expressed as a percentage. Unlike water absorption (which measures how much water an aggregate can take in), moisture content measures how much water is already present at the time of bitumen application or testing.
            </p>
            <p>
              High moisture content at the time of bitumen coating is problematic because:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Water on the aggregate surface prevents direct bitumen-aggregate contact</li>
              <li>Steam can be generated during hot mix asphalt production, causing bubbling</li>
              <li>Adhesive bond strength is reduced from the start</li>
            </ul>
            <p>
              In practice, aggregates should be dried before bitumen application if moisture content exceeds acceptable limits.
            </p>
            <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono">
              <Prop name="Basalt"    value="0.025% — negligible" />
              <Prop name="Granite"   value="0.153% — very low" />
              <Prop name="Limestone" value="9.848% — very high (drying required)" />
            </div>
          </InfoSection>

          <InfoSection id="sio2" title="SiO₂ — Silica (Silicon Dioxide)">
            <p>
              <strong className="text-foreground">SiO₂</strong> is the most abundant oxide in most igneous and metamorphic rocks. Its content determines whether a rock is classified as <em>acidic</em> or <em>alkaline (basic)</em>:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-foreground">SiO₂ &lt; 52%</strong> → Alkaline (basic) rock → better adhesivity</li>
              <li><strong className="text-foreground">SiO₂ 52–65%</strong> → Intermediate</li>
              <li><strong className="text-foreground">SiO₂ &gt; 65%</strong> → Acidic rock → poor adhesivity</li>
            </ul>
            <p>
              Bitumen is slightly acidic in nature. Acidic aggregates (high SiO₂, like granite) have low chemical affinity for bitumen — the two repel each other slightly. Alkaline aggregates (low SiO₂, like basalt) attract bitumen more readily, forming a stronger bond.
            </p>
            <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono">
              <Prop name="Basalt"    value="47.4% → Alkaline → Good affinity" />
              <Prop name="Granite"   value="68.88% → Acidic → Reduced affinity" />
              <Prop name="Limestone" value="5.01% → Very alkaline (but overridden by porosity)" />
            </div>
          </InfoSection>

          <InfoSection id="cao" title="CaO — Calcium Oxide">
            <p>
              <strong className="text-foreground">CaO</strong> (calcium oxide, also called lime) is the primary oxide in carbonate rocks (limestone, marble) and is also present in basalt. It has a strongly <strong className="text-foreground">positive effect on adhesivity</strong> because:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>CaO creates an alkaline surface environment on the aggregate</li>
              <li>Alkaline surfaces chemically attract the acidic components of bitumen</li>
              <li>The resulting ionic bond is stronger than the purely physical adhesion of neutral surfaces</li>
            </ul>
            <p>
              <strong className="text-foreground">Important caveat (Tanga Limestone case):</strong> High CaO does NOT guarantee good adhesivity. In our Limestone specimen, CaO = 51.9% (excellent chemistry) — but porosity = 20.2% (catastrophic for adhesion). The porosity effect is stronger than the CaO benefit. This is a critical finding of this study.
            </p>
            <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono">
              <Prop name="Basalt"    value="7.28% — moderate, beneficial" />
              <Prop name="Granite"   value="1.71% — low, minimal benefit" />
              <Prop name="Limestone" value="51.90% — very high (cement-grade), but overridden" />
            </div>
          </InfoSection>

          <InfoSection id="fe2o3" title="Fe₂O₃ and Al₂O₃">
            <h3 className="font-semibold text-foreground">Fe₂O₃ — Iron(III) Oxide</h3>
            <p>
              High Fe₂O₃ content is characteristic of mafic rocks like basalt and dolerite. Iron oxides contribute to adhesivity by:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Increasing surface polarity — improving bitumen-aggregate wetting</li>
              <li>Contributing to the alkaline character of the aggregate surface</li>
            </ul>
            <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono mb-3">
              <Prop name="Basalt"    value="16.70% — very high (iron-rich volcanic)" />
              <Prop name="Granite"   value="3.19% — low" />
              <Prop name="Limestone" value="0.27% — negligible" />
            </div>

            <h3 className="font-semibold text-foreground">Al₂O₃ — Aluminium Oxide</h3>
            <p>
              Al₂O₃ (alumina) is present in most silicate rocks. It has a mild positive effect on adhesivity — aluminate surfaces tend to be slightly alkaline and can interact with bitumen carboxyl groups. However, its contribution is generally secondary compared to SiO₂, CaO, and Fe₂O₃.
            </p>
            <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono">
              <Prop name="Basalt"    value="8.33%" />
              <Prop name="Granite"   value="8.91%" />
              <Prop name="Limestone" value="1.39%" />
            </div>
          </InfoSection>

          <InfoSection id="basalt" title="Basalt — Our Results">
            <p>
              Basalt is a <strong className="text-foreground">fine-grained, dark-coloured volcanic (igneous) rock</strong> formed from the rapid cooling of lava. It is the most common volcanic rock on Earth and is widely used in road construction due to its high strength and hardness.
            </p>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-xs">
                <tbody>
                  <DataRow label="Porosity"         basalt="0.49%"  granite="—" limestone="—" />
                  <DataRow label="Water Absorption" basalt="0.168%" granite="—" limestone="—" />
                  <DataRow label="Moisture Content" basalt="0.025%" granite="—" limestone="—" />
                  <DataRow label="SiO₂"             basalt="47.40%" granite="—" limestone="—" />
                  <DataRow label="CaO"              basalt="7.28%"  granite="—" limestone="—" />
                  <DataRow label="Fe₂O₃"            basalt="16.70%" granite="—" limestone="—" />
                  <DataRow label="Retained Coating" basalt="96%"    granite="—" limestone="—" />
                  <DataRow label="Grade"            basalt="Very Good" granite="—" limestone="—" />
                </tbody>
              </table>
            </div>
            <p>
              Basalt achieved <strong className="text-foreground">96% Retained Coating</strong> — classifying as Very Good. This is explained by: very low porosity (0.49%), alkaline chemistry (SiO₂ = 47.4%, below the 52% threshold), high Fe₂O₃ (16.7%), and moderate CaO (7.28%). All factors work together positively. This basalt is suitable for all road pavement applications without modification.
            </p>
          </InfoSection>

          <InfoSection id="granite" title="Granite — Our Results">
            <p>
              Granite is a <strong className="text-foreground">coarse-grained intrusive igneous rock</strong>, formed from the slow cooling of magma deep underground. It is characterised by large visible crystals of quartz, feldspar, and mica.
            </p>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-xs">
                <tbody>
                  <DataRow label="Porosity"         basalt="—" granite="1.36%"  limestone="—" />
                  <DataRow label="Water Absorption" basalt="—" granite="0.517%" limestone="—" />
                  <DataRow label="Moisture Content" basalt="—" granite="0.153%" limestone="—" />
                  <DataRow label="SiO₂"             basalt="—" granite="68.88%" limestone="—" />
                  <DataRow label="CaO"              basalt="—" granite="1.71%"  limestone="—" />
                  <DataRow label="Fe₂O₃"            basalt="—" granite="3.19%"  limestone="—" />
                  <DataRow label="Retained Coating" basalt="—" granite="86%"    limestone="—" />
                  <DataRow label="Grade"            basalt="—" granite="Acceptable" limestone="—" />
                </tbody>
              </table>
            </div>
            <p>
              Granite achieved <strong className="text-foreground">86% Retained Coating</strong> — Acceptable. The high SiO₂ (68.88%) places it in the acidic category, which reduces bitumen affinity. However, low porosity (1.36%) prevents significant water ingress, keeping stripping within acceptable limits. Anti-stripping additives are recommended for high-rainfall or submerged pavement environments.
            </p>
          </InfoSection>

          <InfoSection id="limestone" title="Limestone — Our Results">
            <p>
              Limestone is a <strong className="text-foreground">sedimentary rock</strong> composed primarily of calcium carbonate (CaCO₃). The specimen tested in this study originates from the <strong className="text-foreground">Tanga Cement quarry</strong> — a high-grade, cement-quality limestone.
            </p>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-xs">
                <tbody>
                  <DataRow label="Porosity"         basalt="—" granite="—" limestone="20.20%" />
                  <DataRow label="Water Absorption" basalt="—" granite="—" limestone="9.995%" />
                  <DataRow label="Moisture Content" basalt="—" granite="—" limestone="9.848%" />
                  <DataRow label="SiO₂"             basalt="—" granite="—" limestone="5.01%"  />
                  <DataRow label="CaO"              basalt="—" granite="—" limestone="51.90%" />
                  <DataRow label="Fe₂O₃"            basalt="—" granite="—" limestone="0.27%"  />
                  <DataRow label="Retained Coating" basalt="—" granite="—" limestone="45%"    />
                  <DataRow label="Grade"            basalt="—" granite="—" limestone="Unacceptable" />
                </tbody>
              </table>
            </div>
            <p>
              Limestone achieved only <strong className="text-foreground">45% Retained Coating</strong> — Unacceptable. The result is <strong className="text-foreground">NOT experimental error</strong>. It is a genuine physical characteristic:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>CaO = 51.9% is chemically correct — this is cement-grade limestone, and its CaO content validates the specimen identity</li>
              <li>Normally, high CaO improves adhesivity — but porosity of 20.2% completely overrides this benefit</li>
              <li>At this porosity level, water floods the aggregate during immersion, displacing bitumen from within</li>
              <li>Validated against literature: Zhang et al. (2015), Apeagyei et al. (2017)</li>
            </ul>
            <p className="font-medium text-foreground">
              Key lesson: porosity &gt; chemistry when porosity is extreme. This limestone should not be used as a pavement aggregate without significant treatment.
            </p>
          </InfoSection>

          <InfoSection id="model" title="The Model">
            <p>
              The AggregateIQ prediction engine uses a <strong className="text-foreground">Weighted Index Scoring</strong> approach — a structured expert heuristic. It is not a statistical regression model (which would require n ≥ 12 data points).
            </p>
            <h3 className="font-semibold text-foreground mt-3">Formula</h3>
            <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs">
              Score = 0.40×(1 − norm_Porosity) + 0.25×(1 − norm_MC) + 0.20×(1 − norm_SiO₂) + 0.15×norm_CaO
            </div>
            <h3 className="font-semibold text-foreground mt-3">Why these weights?</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-foreground">Porosity — 40%:</strong> Dominant factor per Zhang et al. (2015) and Apeagyei et al. (2017). Confirmed by our Limestone result.</li>
              <li><strong className="text-foreground">Moisture Content — 25%:</strong> Second strongest physical factor. Pre-existing water directly weakens adhesion.</li>
              <li><strong className="text-foreground">SiO₂ — 20%:</strong> Acidic chemistry (high SiO₂) reduces bitumen affinity. Negative relationship.</li>
              <li><strong className="text-foreground">CaO — 15%:</strong> Alkaline chemistry improves adhesion. Positive relationship. Lower weight because it can be overridden by porosity.</li>
            </ul>
            <h3 className="font-semibold text-foreground mt-3">Limitations</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Calibrated from n = 3 experimental data points — expanding to n ≥ 12 will allow proper regression</li>
              <li>Results marked "Index-based" are indicative, not statistically proven</li>
              <li>Calibrated for Tanzania aggregate types — use with caution for aggregates from very different geological settings</li>
            </ul>
          </InfoSection>

          <InfoSection id="grades" title="ASTM Grade Reference">
            <p>
              Adhesivity grades are classified per <strong className="text-foreground">ASTM D1664</strong> — Standard Test Method for Coating and Stripping of Bitumen-Aggregate Mixtures.
            </p>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Grade</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Retained Coating</th>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Implication</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { grade: "Very Good",    range: "≥ 95%",    color: "#437A22", note: "Suitable for all applications. No additive needed." },
                    { grade: "Acceptable",   range: "80–94%",   color: "#1B474D", note: "Suitable for most applications. Additive recommended in wet environments." },
                    { grade: "Marginal",     range: "60–79%",   color: "#D19900", note: "Use with caution. Anti-stripping additive required." },
                    { grade: "Unacceptable", range: "< 60%",    color: "#964219", note: "Not suitable without significant treatment." },
                  ].map(({ grade, range, color, note }) => (
                    <tr key={grade} className="border-t border-border">
                      <td className="px-3 py-2 font-semibold text-xs" style={{ color }}>{grade}</td>
                      <td className="px-3 py-2 text-xs tabular-nums">{range}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </InfoSection>

          <InfoSection id="references" title="References">
            {[
              { num: 1, text: "Zhang, J. et al. (2015). Effect of Aggregate Porosity on Bitumen Adhesivity. Construction and Building Materials.", url: null },
              { num: 2, text: "Apeagyei, A. K. et al. (2017). Bitumen-Aggregate Adhesion and Stripping. International Journal of Pavement Engineering.", url: null },
              { num: 3, text: "Kim, J. et al. (2023). Adhesion Properties of Basalt and Granite Aggregates, Jeju Island.", url: "https://pdfs.semanticscholar.org/39f1/98b339e9c36ad96876a335560f4d47d12657.pdf" },
              { num: 4, text: "Yilmaz, M. et al. (2012). Stripping Resistance of Turkish Aggregates. Croatian Association for Road Technology.", url: "https://www.h-a-d.hr/pubfile.php?id=1127" },
              { num: 5, text: "ASTM D1664 — Coating and Stripping of Bitumen-Aggregate Mixtures.", url: null },
              { num: 6, text: "ASTM C642 — Density, Absorption, and Voids in Hardened Concrete.", url: null },
              { num: 7, text: "BS 812 — Testing Aggregates — Water Absorption.", url: null },
            ].map(({ num, text, url }) => (
              <div key={num} className="flex gap-2 items-baseline">
                <span className="text-primary font-semibold shrink-0 text-xs">{num}.</span>
                <span className="text-xs">
                  {text}{" "}
                  {url && (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      [PDF]
                    </a>
                  )}
                </span>
              </div>
            ))}
          </InfoSection>

        </div>
      </div>
    </div>
  );
}
