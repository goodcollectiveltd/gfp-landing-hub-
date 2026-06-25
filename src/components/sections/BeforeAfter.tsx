import type { BeforeAfterSection } from "@/types/page";
import SlotImage from "@/components/ui/SlotImage";

// Before / after with two image slots.
export default function BeforeAfter({ data }: { data: BeforeAfterSection["data"] }) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-3xl">
        {data.heading && (
          <h2 className="lp-heading mb-6 text-center text-2xl font-bold sm:text-3xl">
            {data.heading}
          </h2>
        )}
        <div className="grid grid-cols-2 gap-4">
          <figure>
            <SlotImage slot={data.before} className="aspect-square w-full rounded-xl" />
            <figcaption className="lp-muted mt-2 text-center text-xs font-semibold uppercase tracking-wide">
              Before
            </figcaption>
          </figure>
          <figure>
            <SlotImage slot={data.after} className="aspect-square w-full rounded-xl" />
            <figcaption className="lp-accent-text mt-2 text-center text-xs font-semibold uppercase tracking-wide">
              After
            </figcaption>
          </figure>
        </div>
        {data.caption && (
          <p className="lp-muted mt-4 text-center text-sm">{data.caption}</p>
        )}
      </div>
    </section>
  );
}
