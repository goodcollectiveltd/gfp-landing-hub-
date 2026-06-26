// Signature SVG diagram: supporting a healthier balance of gut bacteria — the
// good (green) crowding out the bad (red) over time. Associative, supports/helps
// language only (never a cure claim).

const BAD = "#C9433A";
const GOOD = "#2BA84A";

function BalanceCircle({ goodPct, label }: { goodPct: number; label: string }) {
  // A ring filled proportionally green (good) vs red (bad).
  const r = 46;
  const c = 2 * Math.PI * r;
  const good = (goodPct / 100) * c;
  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke={BAD} strokeWidth="14" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={GOOD}
          strokeWidth="14"
          strokeDasharray={`${good} ${c - good}`}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="58" textAnchor="middle" className="lp-heading" fontSize="22" fontWeight="800" fill="var(--brand-text)">
          {goodPct}%
        </text>
        <text x="60" y="74" textAnchor="middle" fontSize="9" fill="var(--brand-muted)" letterSpacing="1">
          GOOD
        </text>
      </svg>
      <span className="lp-heading text-sm font-bold">{label}</span>
    </div>
  );
}

export interface GutRebalanceVisualProps {
  heading?: string;
  caption?: string;
}

export default function GutRebalanceVisual({
  heading = "Helping the gut find its balance",
  caption = "Five strains of good bacteria, fed by a prebiotic, help crowd out the unfriendly ones and support a healthier gut balance over time.",
}: GutRebalanceVisualProps) {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h2 className="lp-heading text-center text-xl font-extrabold tracking-tight sm:text-2xl">
          {heading}
        </h2>
        <div className="mt-7 flex items-center justify-center gap-5 sm:gap-10">
          <BalanceCircle goodPct={35} label="Out of balance" />
          <svg width="40" height="24" viewBox="0 0 40 24" aria-hidden className="shrink-0">
            <path d="M2 12h32M26 4l9 8-9 8" fill="none" stroke="var(--brand-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <BalanceCircle goodPct={80} label="Supported balance" />
        </div>
        <p className="lp-muted mx-auto mt-6 max-w-xl text-center text-sm leading-relaxed">
          {caption}
        </p>
      </div>
    </section>
  );
}
