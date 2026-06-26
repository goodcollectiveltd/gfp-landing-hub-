// Signature visual: a row of large, legible stat figures (big number + label).
// Calm and credible — no motion. Brand-themed.

export interface StatPanelProps {
  heading?: string;
  stats: { value: string; label: string }[];
}

export default function StatPanel({ heading, stats }: StatPanelProps) {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        {heading && (
          <h2 className="lp-heading mb-6 text-center text-xl font-extrabold tracking-tight sm:text-2xl">
            {heading}
          </h2>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm"
            >
              <div
                className="lp-heading text-4xl font-extrabold leading-none sm:text-5xl"
                style={{ color: "var(--brand-primary)" }}
              >
                {s.value}
              </div>
              <div className="lp-muted mt-2 text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
