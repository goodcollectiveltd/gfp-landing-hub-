// Conversion furniture: vet credibility panel — portrait, name, credential, and
// an on-record quote. The photo is an optional real image (else a placeholder).
import SlotImage from "@/components/ui/SlotImage";
import type { ImageSlot } from "@/types/page";

export interface VetPanelProps {
  name: string;
  credential: string;
  quote: string;
  image?: ImageSlot;
}

export default function VetPanel({ name, credential, quote, image }: VetPanelProps) {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <div className="grid sm:grid-cols-[200px_1fr]">
          <SlotImage
            slot={image ?? { role: "Vet portrait" }}
            className="aspect-square w-full sm:h-full"
          />
          <div className="p-6 sm:p-7">
            <div
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{ background: "var(--brand-primary)", color: "var(--brand-on-primary)" }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden>
                <path d="M8 1l2 4 4 .5-3 3 .8 4L8 14.5 4.2 16.5 5 12 2 9l4-.5z" fill="#fff" opacity="0.95" transform="scale(0.9) translate(1 0)" />
              </svg>
              Vet co-developed
            </div>
            <blockquote className="lp-heading mt-3 text-lg font-bold italic leading-snug sm:text-xl">
              “{quote}”
            </blockquote>
            <div className="mt-3">
              <div className="lp-heading text-sm font-bold">{name}</div>
              <div className="lp-muted text-xs">{credential}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
