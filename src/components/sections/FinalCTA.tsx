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
    <section className="lp-accent-bg px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="lp-heading text-3xl font-bold sm:text-4xl">
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
