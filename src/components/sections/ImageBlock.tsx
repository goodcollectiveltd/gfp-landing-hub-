import type { ImageSection } from "@/types/page";
import SlotImage from "@/components/ui/SlotImage";

// A standalone image (or placeholder) with an optional caption.
export default function ImageBlock({ data }: { data: ImageSection["data"] }) {
  return (
    <section className="px-6 py-8">
      <div className="mx-auto max-w-3xl">
        <SlotImage slot={data.image} className="h-72 w-full rounded-2xl" />
        {data.caption && (
          <p className="lp-muted mt-3 text-center text-sm">{data.caption}</p>
        )}
      </div>
    </section>
  );
}
