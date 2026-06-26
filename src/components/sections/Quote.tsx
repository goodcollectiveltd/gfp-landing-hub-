import type { QuoteSection } from "@/types/page";
import SlotImage from "@/components/ui/SlotImage";

// Authority / testimonial quote with an optional portrait (e.g. the vet).
export default function Quote({ data }: { data: QuoteSection["data"] }) {
  return (
    <section className="px-6 py-8">
      <div className="mx-auto flex max-w-3xl items-center gap-6 rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
        {data.image && (
          <SlotImage
            slot={data.image}
            className="h-20 w-20 shrink-0 rounded-full sm:h-24 sm:w-24"
          />
        )}
        <div>
          <blockquote className="lp-heading text-lg italic leading-relaxed sm:text-xl">
            “{data.quote}”
          </blockquote>
          {data.attribution && (
            <p className="lp-muted mt-3 text-sm font-semibold">{data.attribution}</p>
          )}
        </div>
      </div>
    </section>
  );
}
