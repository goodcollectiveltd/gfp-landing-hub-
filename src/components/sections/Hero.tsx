import type { HeroSection } from "@/types/page";
import CtaButton from "@/components/ui/CtaButton";

export default function Hero({
  data,
  productUrl,
}: {
  data: HeroSection["data"];
  productUrl: string;
}) {
  return (
    <section className="px-6 pt-14 pb-16 sm:pt-20 sm:pb-20">
      <div className="mx-auto max-w-3xl text-center">
        {data.eyebrow && (
          <p className="lp-eyebrow mb-4 text-sm font-semibold">{data.eyebrow}</p>
        )}
        <h1 className="lp-heading text-3xl font-bold leading-tight sm:text-5xl">
          {data.headline}
        </h1>
        <p className="lp-muted mx-auto mt-6 max-w-2xl text-lg leading-relaxed">
          {data.subheadline}
        </p>

        {/* Sample hero visual — a product image slot. Swap for a real asset. */}
        <div
          className="mx-auto mt-10 flex h-56 max-w-md items-center justify-center rounded-2xl border border-black/5 sm:h-72"
          style={{
            background:
              "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%)",
          }}
        >
          <span className="text-sm font-medium uppercase tracking-wide text-white/80">
            Product image
          </span>
        </div>

        <div className="mt-10">
          <CtaButton label={data.ctaLabel} href={productUrl} />
          {data.trustLine && (
            <p className="lp-muted mt-4 text-sm">{data.trustLine}</p>
          )}
        </div>
      </div>
    </section>
  );
}
