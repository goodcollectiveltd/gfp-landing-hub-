// Conversion furniture: the money-back guarantee, as a designed seal + line.
export interface GuaranteeBlockProps {
  days?: number;
  text?: string;
}

export default function GuaranteeBlock({
  days = 90,
  text = "Try it for 90 nights. If your dog isn't more comfortable, send it back for a full refund — the risk is on us, not you.",
}: GuaranteeBlockProps) {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-2xl border border-black/5 bg-white p-7 text-center shadow-sm sm:flex-row sm:text-left">
        {/* seal */}
        <svg width="76" height="76" viewBox="0 0 76 76" aria-hidden className="shrink-0">
          <path
            d="M38 4l8 5 9-1 4 8 8 4-1 9 5 8-5 8 1 9-8 4-4 8-9-1-8 5-8-5-9 1-4-8-8-4 1-9-5-8 5-8-1-9 8-4 4-8 9 1z"
            fill="var(--brand-primary)"
          />
          <text x="38" y="34" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="800" fontFamily="var(--font-heading)">
            {days}
          </text>
          <text x="38" y="50" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" letterSpacing="1">
            DAY
          </text>
        </svg>
        <div>
          <h3 className="lp-heading text-lg font-extrabold">{days}-day money-back guarantee</h3>
          <p className="lp-muted mt-1 text-sm leading-relaxed">{text}</p>
        </div>
      </div>
    </section>
  );
}
