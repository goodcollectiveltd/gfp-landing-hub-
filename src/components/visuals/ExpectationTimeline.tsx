// Signature visual: "what to expect" timeline (week 1, 2-3, 4+). A designed
// progression on a brand-coloured line, calm and legible.

export interface ExpectationTimelineProps {
  heading?: string;
  steps: { when: string; title: string; body: string }[];
}

export default function ExpectationTimeline({
  heading = "What to expect",
  steps = [],
}: ExpectationTimelineProps) {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h2 className="lp-heading mb-8 text-center text-xl font-extrabold tracking-tight sm:text-2xl">
          {heading}
        </h2>
        <div className="relative grid gap-8 sm:grid-cols-3 sm:gap-6">
          {/* connecting line (desktop) */}
          <div
            className="absolute left-0 right-0 top-4 hidden h-0.5 sm:block"
            style={{ background: "var(--brand-primary)", opacity: 0.25 }}
          />
          {steps.map((s, i) => (
            <div key={i} className="relative">
              <div
                className="lp-heading mb-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                style={{ background: "var(--brand-primary)", color: "var(--brand-on-primary)" }}
              >
                {i + 1}
              </div>
              <div className="lp-accent-text text-xs font-bold uppercase tracking-wide">
                {s.when}
              </div>
              <div className="lp-heading mt-1 text-base font-bold">{s.title}</div>
              <p className="lp-muted mt-1 text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
