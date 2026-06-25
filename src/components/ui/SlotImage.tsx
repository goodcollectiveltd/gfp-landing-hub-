import type { ImageSlot } from "@/types/page";

// Renders an image slot: the real image if present, otherwise a labelled dashed
// placeholder telling the owner what to upload there (e.g. "Vet photo").
export default function SlotImage({
  slot,
  className = "",
}: {
  slot: ImageSlot | undefined;
  className?: string;
}) {
  if (slot?.url) {
    return (
      <img src={slot.url} alt={slot.role ?? ""} className={`object-contain ${className}`} />
    );
  }
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/15 bg-black/[0.02] p-4 text-center ${className}`}
    >
      <span className="text-2xl opacity-40" aria-hidden>
        🖼
      </span>
      <span className="lp-muted mt-1 text-xs font-medium">
        {slot?.role || "Image"}
      </span>
      <span className="lp-muted text-[10px] opacity-70">upload here</span>
    </div>
  );
}
