import type { ImageTextSection } from "@/types/page";
import SlotImage from "@/components/ui/SlotImage";

// Image beside text. `imagePosition` flips which side the image sits on.
export default function ImageText({ data }: { data: ImageTextSection["data"] }) {
  const imageLeft = data.imagePosition !== "right";
  return (
    <section className="px-6 py-12">
      <div className="mx-auto grid max-w-4xl items-center gap-8 sm:grid-cols-2">
        <SlotImage
          slot={data.image}
          className={`h-64 w-full rounded-2xl ${imageLeft ? "" : "sm:order-2"}`}
        />
        <div className={imageLeft ? "" : "sm:order-1"}>
          {data.heading && (
            <h2 className="lp-heading text-2xl font-bold">{data.heading}</h2>
          )}
          <p className="mt-3 text-base leading-relaxed">{data.body}</p>
        </div>
      </div>
    </section>
  );
}
