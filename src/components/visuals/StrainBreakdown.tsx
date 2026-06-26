// Signature visual: the formula broken down — 5 named probiotic strains (1B CFU
// each, 5B total) plus the prebiotic and enzyme complex. A designed infographic,
// not an image. Capsule-style chips rendered in SVG/CSS, brand-themed.

export interface StrainBreakdownProps {
  heading?: string;
  strains: { name: string; cfu?: string }[];
  total?: string; // e.g. "5 billion live cultures"
  addOns?: { label: string; detail?: string }[]; // prebiotic, enzymes
}

function Capsule({ name, cfu }: { name: string; cfu?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-black/5 bg-white p-2 pr-4 shadow-sm">
      {/* capsule glyph */}
      <svg width="34" height="20" viewBox="0 0 34 20" aria-hidden className="shrink-0">
        <rect x="1" y="1" width="32" height="18" rx="9" fill="var(--brand-primary)" opacity="0.12" />
        <rect x="1" y="1" width="16" height="18" rx="9" fill="var(--brand-primary)" />
        <circle cx="24" cy="10" r="1.6" fill="var(--brand-primary)" />
        <circle cx="28" cy="7" r="1.4" fill="var(--brand-primary)" opacity="0.7" />
        <circle cx="28" cy="13" r="1.4" fill="var(--brand-primary)" opacity="0.7" />
      </svg>
      <div className="min-w-0">
        <div className="lp-heading truncate text-sm font-bold leading-tight">{name}</div>
        {cfu && <div className="lp-muted text-xs">{cfu}</div>}
      </div>
    </div>
  );
}

export default function StrainBreakdown({
  heading = "What's actually in every capsule",
  strains,
  total = "5 billion live cultures",
  addOns = [],
}: StrainBreakdownProps) {
  return (
    <section className="px-6 py-10" style={{ background: "rgba(0,0,0,0.02)" }}>
      <div className="mx-auto max-w-3xl">
        <h2 className="lp-heading mb-6 text-center text-xl font-extrabold tracking-tight sm:text-2xl">
          {heading}
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {strains.map((s, i) => (
            <Capsule key={i} name={s.name} cfu={s.cfu ?? "1 billion CFU"} />
          ))}
        </div>

        {/* total */}
        <div
          className="mt-5 rounded-2xl px-5 py-4 text-center"
          style={{ background: "var(--brand-primary)", color: "var(--brand-on-primary)" }}
        >
          <span className="lp-heading text-lg font-extrabold sm:text-xl">{total}</span>
          <span className="block text-sm opacity-90">across five research-backed strains</span>
        </div>

        {addOns.length > 0 && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {addOns.map((a, i) => (
              <div
                key={i}
                className="rounded-2xl border border-black/5 bg-white p-4 text-center shadow-sm"
              >
                <div className="lp-heading text-sm font-bold">+ {a.label}</div>
                {a.detail && <div className="lp-muted text-xs">{a.detail}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
