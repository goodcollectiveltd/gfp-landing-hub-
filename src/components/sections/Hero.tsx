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
    <section className="px-6 pt-8 pb-10 sm:pt-10 sm:pb-12">
      <div className="mx-auto max-w-2xl text-center">
        {data.eyebrow && (
          <p className="lp-eyebrow mb-3 text-xs font-semibold">{data.eyebrow}</p>
        )}
        <h1 className="lp-heading text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl">
          {data.headline}
        </h1>
        <p className="lp-muted mx-auto mt-3 max-w-xl text-base leading-relaxed sm:text-lg">
          {data.subheadline}
        </p>

        {/* Hero visual: real scraped product image if we have one, else a
            branded gradient placeholder. */}
        {data.image ? (
          <img
            src={data.image}
            alt=""
            className="mx-auto mt-7 max-h-64 w-auto rounded-2xl object-contain"
          />
        ) : (
          <div
            className="mx-auto mt-7 flex h-48 max-w-sm items-center justify-center rounded-2xl sm:h-56"
            style={{
              background:
                "linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-accent) 100%)",
            }}
          >
            <span className="text-sm font-medium uppercase tracking-wide text-white/80">
              Product image
            </span>
          </div>
        )}

        <div className="mt-7">
          <CtaButton label={data.ctaLabel} href={productUrl} />
          {data.trustLine && (
            <p className="lp-muted mt-3 text-sm">{data.trustLine}</p>
          )}
        </div>
      </div>
    </section>
  );
}
