// Signature SVG diagram: the "potency paradox". Most chews are baked (heat kills
// the live bacteria) and sit in a moist tub (waking survivors early), so many are
// gone before the dog eats them. Cold-filled capsules keep cultures dormant and
// alive to the gut. Locked bacteria colour code: red = dead/bad, green = alive/good.

const DEAD = "#C9433A";
const ALIVE = "#2BA84A";

function Dots({ colors }: { colors: string[] }) {
  // A small cluster of bacteria glyphs.
  const pos = [
    [14, 16], [34, 12], [54, 18], [22, 34], [44, 36], [64, 30],
    [12, 50], [34, 52], [56, 50], [74, 44],
  ];
  return (
    <svg width="92" height="66" viewBox="0 0 92 66" aria-hidden>
      {pos.map(([x, y], i) => {
        const c = colors[i % colors.length];
        return (
          <g key={i} fill={c}>
            <ellipse cx={x} cy={y} rx="5.5" ry="4" />
            <line x1={x + 5} y1={y} x2={x + 9} y2={y - 2} stroke={c} strokeWidth="1.2" />
          </g>
        );
      })}
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2c1 3-2 4-2 7a2 2 0 104 0c0-1 .5-1.5 1-2 1 2 3 3.5 3 7a6 6 0 11-12 0c0-3.5 4-5 6-12z" fill={DEAD} />
    </svg>
  );
}
function SnowIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden stroke="var(--brand-primary)" strokeWidth="1.6" strokeLinecap="round">
      <path d="M12 2v20M3.5 7l17 10M20.5 7l-17 10" />
    </svg>
  );
}

function Card({
  icon,
  label,
  dots,
  caption,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  dots: string[];
  caption: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border bg-white p-5 shadow-sm"
      style={{ borderColor: highlight ? "var(--brand-primary)" : "rgba(0,0,0,0.08)", borderWidth: highlight ? 2 : 1 }}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className="lp-heading text-sm font-bold">{label}</span>
      </div>
      <div className="my-4 flex justify-center rounded-xl bg-black/[0.03] py-3">
        <Dots colors={dots} />
      </div>
      <p className="lp-muted text-sm leading-relaxed">{caption}</p>
    </div>
  );
}

export interface MechanismDiagramProps {
  heading?: string;
  subhead?: string;
}

export default function MechanismDiagram({
  heading = "Why most dog probiotics quietly fail",
  subhead = "Probiotics are live. Live bacteria are fragile — and most are dead before your dog ever eats them.",
}: MechanismDiagramProps) {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <h2 className="lp-heading text-center text-xl font-extrabold tracking-tight sm:text-2xl">
          {heading}
        </h2>
        <p className="lp-muted mx-auto mt-2 max-w-xl text-center text-sm leading-relaxed">
          {subhead}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card
            icon={<FlameIcon />}
            label="Most baked chews"
            dots={[DEAD, DEAD, "#9aa0a6", DEAD, "#9aa0a6", DEAD, DEAD, "#9aa0a6", DEAD, ALIVE]}
            caption="Baking cooks the bacteria. Moisture in the tub wakes the few survivors early. Many are gone before the bowl."
          />
          <Card
            highlight
            icon={<SnowIcon />}
            label="5 Strain Probiotic+"
            dots={[ALIVE, ALIVE, ALIVE, ALIVE, ALIVE, ALIVE, ALIVE, ALIVE, ALIVE, ALIVE]}
            caption="Cold-filled and sealed, heat and moisture free. The live cultures stay dormant and reach your dog's gut alive."
          />
        </div>
      </div>
    </section>
  );
}
