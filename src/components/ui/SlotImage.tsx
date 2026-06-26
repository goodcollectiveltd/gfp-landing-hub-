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
      <img src={slot.url} alt={slot.role ?? ""} className={`object-cover ${className}`} />
    );
  }
  // Clean, intentional placeholder — a subtly tinted frame with a label and, when
  // present, the generation brief (so the empty slot doubles as a worklist).
  const brief = slot?.brief;
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center ${className}`}
      style={{ borderColor: "rgba(0,0,0,0.12)", background: "var(--brand-surface-tint, #FCEAE6)" }}
    >
      <span className="text-2xl opacity-30" aria-hidden>
        🖼
      </span>
      <span className="lp-muted mt-1 text-xs font-semibold">
        {brief?.subject || slot?.role || "Image"}
      </span>
      <span className="lp-muted text-[10px] opacity-70">
        {brief ? `${brief.aspectRatio} · add image` : "add image"}
      </span>
    </div>
  );
}
