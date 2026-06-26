import type { FinalCtaSection } from "@/types/page";
import CtaButton from "@/components/ui/CtaButton";

export default function FinalCTA({
  data,
  productUrl,
}: {
  data: FinalCtaSection["data"];
  productUrl: string;
}) {
  return (
    <section className="lp-accent-bg relative overflow-hidden px-6 pb-14 pt-16">
      {/* Curved wave edge so the feature block reads as an event, not a flat bar. */}
      <svg
        className="absolute inset-x-0 top-0 h-9 w-full"
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0,0 L1440,0 L1440,22 C1080,58 360,58 0,22 Z"
          fill="var(--brand-base, #ffffff)"
        />
      </svg>
      <div className="relative mx-auto max-w-2xl text-center">
        <h2
          className="lp-heading text-2xl font-extrabold tracking-tight sm:text-3xl"
          style={{ color: "var(--brand-on-primary)" }}
        >
          {data.headline}
        </h2>
        {data.subheadline && (
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/90">
            {data.subheadline}
          </p>
        )}
        <div className="mt-8">
          <CtaButton
            label={data.ctaLabel}
            href={productUrl}
            className="!bg-white !text-black shadow-lg"
          />
          {data.trustLine && (
            <p className="mt-4 text-sm text-white/80">{data.trustLine}</p>
          )}
        </div>
      </div>
    </section>
  );
}
