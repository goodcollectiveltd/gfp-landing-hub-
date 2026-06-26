import type { ImageTextSection } from "@/types/page";
import SlotImage from "@/components/ui/SlotImage";

// Image beside text. `imagePosition` flips which side the image sits on.
export default function ImageText({ data }: { data: ImageTextSection["data"] }) {
  const imageLeft = data.imagePosition !== "right";
  return (
    <section className="px-6 py-8">
      <div className="mx-auto grid max-w-4xl items-center gap-6 sm:grid-cols-2">
        <SlotImage
          slot={data.image}
          className={`aspect-[4/3] w-full rounded-2xl ${imageLeft ? "" : "sm:order-2"}`}
        />
        <div className={imageLeft ? "" : "sm:order-1"}>
          {data.heading && (
            <h2 className="lp-heading text-xl font-extrabold tracking-tight sm:text-2xl">
              {data.heading}
            </h2>
          )}
          <p className="mt-3 text-[15px] leading-relaxed sm:text-base">{data.body}</p>
        </div>
      </div>
    </section>
  );
}
