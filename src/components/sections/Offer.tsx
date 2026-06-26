import type { OfferSection, BuyBoxConfig } from "@/types/page";
import CtaButton from "@/components/ui/CtaButton";

export default function Offer({
  data,
  buyBox,
}: {
  data: OfferSection["data"];
  buyBox: BuyBoxConfig;
}) {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-md sm:p-8">
          {data.image && (
            <img
              src={data.image}
              alt=""
              className="mx-auto mb-6 max-h-56 w-auto rounded-xl object-contain"
            />
          )}
          <h2 className="lp-heading text-center text-2xl font-bold sm:text-3xl">
            {data.headline}
          </h2>
          {data.subheadline && (
            <p className="lp-muted mt-2 text-center">{data.subheadline}</p>
          )}

          <ul className="mt-8 space-y-3">
            {(data.bullets ?? []).map((bullet, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="lp-accent-text mt-0.5 text-lg font-bold leading-none"
                  aria-hidden
                >
                  ✓
                </span>
                <span className="text-sm leading-relaxed sm:text-base">
                  {bullet}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex items-baseline justify-center gap-3">
            <span className="lp-heading text-4xl font-bold">{buyBox.price}</span>
            {buyBox.compareAtPrice && (
              <span className="lp-muted text-xl line-through">
                {buyBox.compareAtPrice}
              </span>
            )}
          </div>

          <div className="mt-6 text-center">
            <CtaButton label={buyBox.ctaLabel} href={buyBox.productUrl} />
          </div>

          {data.guarantee && (
            <p className="lp-muted mx-auto mt-6 max-w-md text-center text-sm leading-relaxed">
              {data.guarantee}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
