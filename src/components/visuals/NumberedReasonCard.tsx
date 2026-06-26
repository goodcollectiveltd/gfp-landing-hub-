// Conversion furniture: a numbered reason (for "N reasons" listicles). Big number
// badge, heading, body, and an optional real image beside it.
import SlotImage from "@/components/ui/SlotImage";
import type { ImageSlot } from "@/types/page";

export interface NumberedReasonCardProps {
  number: number;
  title: string;
  body: string;
  image?: ImageSlot;
  imagePosition?: "left" | "right";
}

export default function NumberedReasonCard({
  number,
  title,
  body,
  image,
  imagePosition = "right",
}: NumberedReasonCardProps) {
  const imageLeft = imagePosition === "left";
  return (
    <section className="px-6 py-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
        <div className={`grid items-center gap-5 ${image ? "sm:grid-cols-2" : ""}`}>
          {image && (
            <SlotImage
              slot={image}
              className={`aspect-[4/3] w-full rounded-xl ${imageLeft ? "" : "sm:order-2"}`}
            />
          )}
          <div className={imageLeft ? "sm:order-2" : ""}>
            <div className="flex items-center gap-3">
              <span
                className="lp-heading flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-extrabold"
                style={{ background: "var(--brand-primary)", color: "var(--brand-on-primary)" }}
              >
                {number}
              </span>
              <h3 className="lp-heading text-lg font-extrabold leading-tight tracking-tight sm:text-xl">
                {title}
              </h3>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed sm:text-base">{body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
