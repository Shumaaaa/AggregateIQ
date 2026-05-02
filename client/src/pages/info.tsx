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
      <BackHomeButtons backHref="/home" backLabel="Home" />
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
              Three experiments were performed on each aggregate specimen. Physical testing (MC, Porosity) was conducted at TANROADS and GST laboratories in Dodoma; XRF chemical analysis at TIRDO, Dar es Salaam; Adhesivity tests at TANROADS Dodoma (2026).
            </p>
            <h3 className="font-semibold text-foreground mt-3">1. Retained Coating Test (ASTM D1664)</h3>
            <p>
              The primary adhesivity test. Aggregate particles are coated with bitumen at a controlled temperature, then submerged in water for 24 hours at room temperature. After immersion, the percentage of aggregate surface area still retaining its bitumen coating is visually estimated.
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>RC ≥ 95% → Very Good</li>
              <li>RC 85–94% → Good</li>
              <li>RC 70–84% → Acceptable</li>
              <li>RC 50–69% → Borderline</li>
              <li>RC &lt; 50% → Unacceptable</li>
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
              <Prop name="Basalt"    value="0.0245% — negligible" />
              <Prop name="Granite"   value="0.1526% — very low" />
              <Prop name="Limestone" value="2.2531% — elevated (pre-drying recommended)" />
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
              <strong className="text-foreground">Important caveat (Dar es Salaam Limestone case):</strong> High CaO does NOT guarantee good adhesivity. In our Limestone specimen, CaO = 51.9% (excellent chemistry) — but porosity = 20.2% (catastrophic for adhesion). The porosity effect is stronger than the CaO benefit. This is a critical finding of this study.
            </p>
            <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono">
              <Prop name="Basalt"    value="7.28% — moderate, beneficial" />
              <Prop name="Granite"   value="1.71% — low, minimal benefit" />
              <Prop name="Limestone" value="51.90% — very high (cement-grade), but overridden" />
            </div>
          </InfoSection>

          <InfoSection id="fe2o3" title="Fe₂O₃ and Al₂O₃">
            <h3 className="font-semibold text-foreground">Fe₂O₃ — Iron(III) Oxide · Model Weight: 4%</h3>
            <p>
              Fe₂O₃ is the weakest chemical predictor in the AggregateIQ model (R² = 0.5911, weight 4%). High iron oxide content is characteristic of mafic rocks like basalt and dolerite. It contributes to adhesivity by:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Increasing surface polarity — improving bitumen-aggregate wetting and film formation</li>
              <li>Contributing hydrophobic character to the aggregate surface</li>
              <li>Raising the surface free energy, which promotes stronger bitumen bonding</li>
            </ul>
            <p>
              Our experimental data provides clear evidence: Basalt (Fe₂O₃ = 16.70%) achieved RC = 96%, while Limestone (Fe₂O₃ = 0.27%) achieved only RC = 45%. This 16-point difference in iron oxide is one of the clearest chemical signals in our dataset.
            </p>
            <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono mb-3">
              <Prop name="Basalt"    value="16.70% — very high → strong hydrophobic surface" />
              <Prop name="Granite"   value="3.19%  — low → limited iron contribution" />
              <Prop name="Limestone" value="0.27%  — negligible → risk flag triggered" />
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs">
              <span className="font-semibold text-primary">Threshold:</span> Fe₂O₃ &lt; 1% triggers a risk flag in the model. Values above 5% are considered good for adhesivity.
            </div>

            <h3 className="font-semibold text-foreground mt-4">Al₂O₃ — Aluminium Oxide · Model Weight: 18%</h3>
            <p>
              Al₂O₃ (alumina) is the strongest chemical predictor (R² = 0.9362, weight 18%). Aluminate surfaces are amphoteric — they can act as either acid or base depending on pH conditions. In bituminous systems, alumina-rich surfaces tend to interact favourably with bitumen carboxyl groups at neutral to slightly alkaline pH.
            </p>
            <p>
              Notably, both Basalt and Granite have similar Al₂O₃ values (8.33% vs 8.91%), while Limestone is much lower (1.39%). This means Al₂O₃ contributes significantly to separating the two good performers from the poor one.
            </p>
            <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono">
              <Prop name="Basalt"    value="8.33% — moderate-high" />
              <Prop name="Granite"   value="8.91% — moderate-high (highest of three)" />
              <Prop name="Limestone" value="1.39% — low" />
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-xs mt-3">
              <p className="font-semibold text-foreground mb-1">Why 18% weight for Al₂O₃?</p>
              <p>Al₂O₃ achieved the highest R² among chemical predictors (R² = 0.9362) in standalone regression analysis. Its strong correlation with retained coating — driven by surface polarity and base character — justifies the leading 18% chemical weight, consistent with Ignatavicius et al. (2021) and Zhang et al. (2015).</p>
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
                  <DataRow label="Moisture Content" basalt="0.0245%" granite="—" limestone="—" />
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
                  <DataRow label="Moisture Content" basalt="—" granite="0.1526%" limestone="—" />
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
              Limestone is a <strong className="text-foreground">sedimentary rock</strong> composed primarily of calcium carbonate (CaCO₃). The specimen tested in this study originates from the <strong className="text-foreground">Tanga Cement quarry (Dar es Salaam)</strong> — a high-grade, cement-quality limestone.
            </p>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-xs">
                <tbody>
                  <DataRow label="Porosity"         basalt="—" granite="—" limestone="20.20%" />
                  <DataRow label="Water Absorption" basalt="—" granite="—" limestone="9.995%" />
                  <DataRow label="Moisture Content" basalt="0.0245%" granite="0.1526%" limestone="2.2531%" />
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
            <h3 className="font-semibold text-foreground mt-3">Formula (v2 — 6 factors)</h3>
            <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs leading-relaxed">
              Score = 0.33×(1−norm_MC) + 0.24×(1−norm_Porosity)<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; + 0.18×norm_Al₂O₃ + 0.14×norm_CaO<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; + 0.07×(1−norm_SiO₂) + 0.04×norm_Fe₂O₃
            </div>
            <div className="flex gap-4 mt-2 text-xs">
              <span className="text-muted-foreground">Physical total: <strong className="text-foreground">57%</strong> (MC + Porosity)</span>
              <span className="text-muted-foreground">Chemical total: <strong className="text-foreground">43%</strong> (Al₂O₃ + CaO + SiO₂ + Fe₂O₃)</span>
            </div>
            <h3 className="font-semibold text-foreground mt-3">Why these weights?</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-foreground">MC — 33%:</strong> Pre-existing moisture directly prevents bitumen from bonding to the surface. Strongest single predictor in our data.</li>
              <li><strong className="text-foreground">Porosity — 24%:</strong> High porosity creates water ingress pathways. Confirmed dominant factor (Zhang et al. 2015, Apeagyei et al. 2017).</li>
              <li><strong className="text-foreground">Al₂O₃ — 18%:</strong> Best chemical predictor (R² = 0.9362). Surface polarity and base character strongly correlate with bitumen bonding. Highest chemical weight based on data-driven regression.</li>
              <li><strong className="text-foreground">CaO — 14%:</strong> Alkaline surface chemistry promotes bitumen-aggregate affinity. Strong predictor (R² = 0.9196) — though Limestone case shows porosity can override even high CaO.</li>
              <li><strong className="text-foreground">SiO₂ — 7%:</strong> Acidic chemistry reduces bitumen affinity. Moderate predictor (R² = 0.7506). Granite (68.88%) shows this effect clearly vs Basalt (47.4%).</li>
              <li><strong className="text-foreground">Fe₂O₃ — 4%:</strong> Weakest predictor (R² = 0.5911). Some surface hydrophobic benefit — but limited generalisability. Reduced weight reflects weak standalone correlation.</li>
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
                    { grade: "Good",         range: "85–94%",   color: "#1B474D", note: "Suitable for national highways and urban roads. Additive recommended for coastal corridors." },
                    { grade: "Acceptable",   range: "70–84%",   color: "#20808D", note: "Suitable for standard road applications. Anti-stripping additive recommended." },
                    { grade: "Borderline",   range: "50–69%",   color: "#D19900", note: "Anti-stripping additive mandatory. Not recommended for highways without pre-treatment." },
                    { grade: "Unacceptable", range: "< 50%",    color: "#964219", note: "Incompatible with C55 emulsion in natural state. Requires aggregate pre-treatment or source change." },
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
