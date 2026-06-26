// Signature visual: the top symptoms owners see, connected back to the gut.
// Strictly associative ("often starts in the gut") — never a cure claim.

function GutIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="30" fill="var(--brand-primary)" opacity="0.1" />
      <path
        d="M20 18c8 0 8 8 0 8s-8 8 0 8 8 8 0 8M30 18c8 0 8 8 0 8s-8 8 0 8 8 8 0 8"
        fill="none"
        stroke="var(--brand-primary)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export interface SymptomToGutProps {
  heading?: string;
  symptoms?: string[];
  caption?: string;
}

export default function SymptomToGut({
  heading = "It often starts in the gut, not the skin",
  symptoms = ["Paw licking", "Itchy skin", "Gunky ears", "Loose stools", "Scooting"],
  caption = "The gut and skin are linked. When the gut is out of balance, the signs often show up on the outside — so that's where to start.",
}: SymptomToGutProps) {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h2 className="lp-heading text-center text-xl font-extrabold tracking-tight sm:text-2xl">
          {heading}
        </h2>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {symptoms.map((s, i) => (
            <span
              key={i}
              className="rounded-full border border-black/5 bg-white px-3 py-1.5 text-sm font-medium shadow-sm"
            >
              {s}
            </span>
          ))}
        </div>

        {/* converging arrows */}
        <div className="my-3 flex justify-center">
          <svg width="160" height="40" viewBox="0 0 160 40" aria-hidden>
            <path d="M20 4 Q80 30 80 38M80 4v34M140 4 Q80 30 80 38" fill="none" stroke="var(--brand-primary)" strokeWidth="2" opacity="0.4" />
          </svg>
        </div>

        <div className="flex flex-col items-center gap-2">
          <GutIcon />
          <span className="lp-heading text-base font-bold">The gut</span>
        </div>

        <p className="lp-muted mx-auto mt-5 max-w-xl text-center text-sm leading-relaxed">
          {caption}
        </p>
      </div>
    </section>
  );
}
