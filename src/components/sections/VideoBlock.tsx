import SlotImage from "@/components/ui/SlotImage";
import type { VideoSection } from "@/types/page";

// A video block: autoplay/muted/looped inline video when we have a file, else a
// clean poster placeholder (same intentional frame as an image slot) carrying
// the generation brief. Muted+playsInline is required for mobile autoplay.
export default function VideoBlock({ data }: { data: VideoSection["data"] }) {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-2xl">
        {data.src ? (
          <video
            className="aspect-video w-full rounded-2xl object-cover shadow-sm"
            src={data.src}
            poster={data.poster}
            autoPlay
            muted
            loop
            playsInline
            controls={false}
          />
        ) : (
          <SlotImage
            slot={{ role: data.role ?? "Video", brief: data.brief }}
            className="aspect-video w-full"
          />
        )}
        {data.caption && (
          <p className="lp-muted mt-3 text-center text-sm">{data.caption}</p>
        )}
      </div>
    </section>
  );
}
