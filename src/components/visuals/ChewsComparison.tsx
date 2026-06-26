// Signature visual: a designed "us vs typical chews" comparison (not a flat
// table). The brand column is highlighted; rows use check / cross glyphs.

export interface ChewsComparisonProps {
  heading?: string;
  usLabel?: string;
  themLabel?: string;
  rows: { feature: string; us: string; them: string; usWins?: boolean }[];
}

function Tick() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden className="shrink-0">
      <circle cx="9" cy="9" r="9" fill="var(--brand-primary)" />
      <path d="M5 9.2l2.6 2.6L13 6.4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function Cross() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden className="shrink-0">
      <circle cx="9" cy="9" r="9" fill="#000" opacity="0.12" />
      <path d="M6 6l6 6M12 6l-6 6" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function ChewsComparison({
  heading = "Why owners switch from chews",
  usLabel = "5 Strain Probiotic+",
  themLabel = "Typical chews",
  rows,
}: ChewsComparisonProps) {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h2 className="lp-heading mb-6 text-center text-xl font-extrabold tracking-tight sm:text-2xl">
          {heading}
        </h2>
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          {/* header */}
          <div className="grid grid-cols-[1.3fr_1fr_1fr] text-center text-xs font-bold sm:text-sm">
            <div className="p-3" />
            <div
              className="lp-heading p-3"
              style={{ background: "var(--brand-primary)", color: "var(--brand-on-primary)" }}
            >
              {usLabel}
            </div>
            <div className="lp-muted p-3">{themLabel}</div>
          </div>
          {/* rows */}
          {rows.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-[1.3fr_1fr_1fr] items-center border-t border-black/5 text-center"
            >
              <div className="p-3 text-left text-sm font-medium">{r.feature}</div>
              <div className="flex flex-col items-center gap-1 bg-[color:var(--brand-primary)]/[0.04] p-3">
                <Tick />
                <span className="lp-accent-text text-xs font-semibold">{r.us}</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-3">
                <Cross />
                <span className="lp-muted text-xs">{r.them}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
