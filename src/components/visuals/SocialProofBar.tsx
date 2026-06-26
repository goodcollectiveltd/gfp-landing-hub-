// Conversion furniture: a compact trust strip — stars, rating, review count,
// and an optional second proof number. Themed via brand CSS variables.

export interface SocialProofBarProps {
  rating?: number; // e.g. 4.8
  reviewCount?: string; // e.g. "4,537+"
  extraValue?: string; // e.g. "20,000+"
  extraLabel?: string; // e.g. "dogs helped"
}

export default function SocialProofBar({
  rating = 4.8,
  reviewCount = "4,537+",
  extraValue,
  extraLabel,
}: SocialProofBarProps) {
  return (
    <div className="px-6 py-4">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl border border-black/5 bg-white px-5 py-3 text-center shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none" style={{ color: "#F5A623" }}>
            ★★★★★
          </span>
          <span className="lp-heading text-sm font-bold">{rating.toFixed(1)}/5</span>
        </div>
        <span className="lp-muted text-sm">
          from <span className="font-semibold text-[color:var(--brand-text)]">{reviewCount}</span>{" "}
          verified reviews
        </span>
        {extraValue && (
          <>
            <span className="hidden h-4 w-px bg-black/10 sm:block" />
            <span className="lp-muted text-sm">
              <span className="font-semibold text-[color:var(--brand-text)]">{extraValue}</span>{" "}
              {extraLabel}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
