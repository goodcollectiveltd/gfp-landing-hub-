// Conversion furniture: a polished testimonial card — stars, quote, optional
// real customer photo, name, and a "Verified Customer" mark.
import SlotImage from "@/components/ui/SlotImage";
import type { ImageSlot } from "@/types/page";

export interface ReviewCardProps {
  quote: string;
  name: string;
  rating?: number;
  image?: ImageSlot;
  verified?: boolean;
}

export default function ReviewCard({
  quote,
  name,
  rating = 5,
  image,
  verified = true,
}: ReviewCardProps) {
  return (
    <section className="px-6 py-6">
      <figure className="mx-auto flex max-w-2xl gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        {image && (
          <SlotImage slot={image} className="h-20 w-20 shrink-0 rounded-xl sm:h-24 sm:w-24" />
        )}
        <div className="min-w-0">
          <div className="text-base leading-none" style={{ color: "#F5A623" }}>
            {"★".repeat(rating)}
            <span className="text-black/15">{"★".repeat(5 - rating)}</span>
          </div>
          <blockquote className="mt-2 text-[15px] leading-relaxed">“{quote}”</blockquote>
          <figcaption className="mt-2 flex items-center gap-2 text-sm">
            <span className="lp-heading font-bold">{name}</span>
            {verified && (
              <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--brand-primary)" }}>
                <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden>
                  <circle cx="8" cy="8" r="8" fill="var(--brand-primary)" />
                  <path d="M4.5 8.2l2.2 2.2L11.5 5.6" stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Verified Customer
              </span>
            )}
          </figcaption>
        </div>
      </figure>
    </section>
  );
}
