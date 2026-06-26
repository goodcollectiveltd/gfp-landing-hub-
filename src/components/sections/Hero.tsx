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

        {/* Hero visual: real scraped product image if we have one, else a clean
            labelled placeholder (a frame the owner fills — never a saturated
            box that reads like a rendering error). */}
        {data.image ? (
          <img
            src={data.image}
            alt=""
            className="mx-auto mt-7 max-h-64 w-auto rounded-2xl object-contain"
          />
        ) : (
          <div
            className="mx-auto mt-7 flex h-48 max-w-sm flex-col items-center justify-center rounded-2xl border-2 border-dashed sm:h-56"
            style={{
              borderColor: "rgba(0,0,0,0.12)",
              background: "var(--brand-surface-tint, #FCEAE6)",
            }}
          >
            <span className="text-2xl opacity-30" aria-hidden>
              🖼
            </span>
            <span className="lp-muted mt-1 text-xs font-medium">Product image</span>
            <span className="lp-muted text-[10px] opacity-70">add a hero image</span>
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
