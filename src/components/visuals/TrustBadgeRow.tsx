// Conversion furniture: a row of trust badges (UK-made, GMP, vegan, charity).
// Small inline icons, brand-themed, calm.

const ICONS: Record<string, React.ReactNode> = {
  flag: (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden fill="none" stroke="var(--brand-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 21V4M5 4h12l-2 4 2 4H5" />
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden fill="none" stroke="var(--brand-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  leaf: (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden fill="none" stroke="var(--brand-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20c0-9 7-15 16-15 0 9-6 16-15 16M4 20c4-5 8-7 12-9" />
    </svg>
  ),
  heart: (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden fill="none" stroke="var(--brand-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21C7 17 3 13.5 3 9a4.5 4.5 0 019-1 4.5 4.5 0 019 1c0 4.5-4 8-9 12z" />
    </svg>
  ),
};

export interface TrustBadgeRowProps {
  badges?: { label: string; icon?: keyof typeof ICONS }[];
}

export default function TrustBadgeRow({
  badges = [
    { label: "Made in the UK", icon: "flag" },
    { label: "GMP-certified", icon: "shield" },
    { label: "Vegan capsule", icon: "leaf" },
    { label: "51% to charity", icon: "heart" },
  ],
}: TrustBadgeRowProps) {
  return (
    <section className="px-6 py-6">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2.5">
        {badges.map((b, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3.5 py-2 text-sm font-semibold shadow-sm"
          >
            {b.icon && ICONS[b.icon]}
            {b.label}
          </span>
        ))}
      </div>
    </section>
  );
}
