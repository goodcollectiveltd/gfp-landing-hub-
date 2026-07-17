import { useEffect, useMemo, useState } from "react";

// THE GOLDEN PAGE — bespoke advertorial that visually clones the live Replo
// page (goodforpets.co/pages/5strainprobioticcomplex) section-for-section,
// rebuilt for 5 Strain Probiotic+ sprinkle capsules with upgraded copy and the
// heat + moisture double mechanism. Copy grounding: see
// src/data/probioticPlusPage.ts (same banks, same testimonial IDs).
//
// Live Shopify data (pulled 10 Jul 2026):
//   variants: 1 tub 57197308674392 £44.99 · 2 tubs 57197308707160 £76.49 ·
//             3 tubs 57197308739928 £107.97
//   Subscribe & Save: 30% off first order, 20% ongoing.

const RED = "#EF3824";
const RED_DEEP = "#C02A18";
const RED_CARD = "#E85341";
const INK = "#1C1C2E";

const VARIANTS = [
  { id: "57197308674392", label: "1 Tub", price: 44.99, compare: null as number | null, badge: null as string | null },
  { id: "57197308707160", label: "2 Tubs", price: 76.49, compare: 89.98, badge: "MOST POPULAR · SAVE 15%" },
  { id: "57197308739928", label: "3 Tubs", price: 107.97, compare: 134.97, badge: "BEST VALUE · SAVE 20%" },
];
const PLANS = [
  { id: "693194850648", label: "Deliver every 30 days" },
  { id: "693194883416", label: "Deliver every 45 days" },
  { id: "693194916184", label: "Deliver every 60 days" },
  { id: "693194785112", label: "Deliver every 90 days" },
  { id: "693275427160", label: "Deliver every 120 days" },
  { id: "693275361624", label: "Deliver every 180 days" },
  { id: "693275394392", label: "Deliver every 270 days" },
];
const gbp = (n: number) => `£${n.toFixed(2)}`;

/* ---------- shared bits ---------- */

function Stars({ size = 18, color = RED }: { size?: number; color?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={color}>
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.8z" />
        </svg>
      ))}
    </span>
  );
}

function Cta({
  label = "START MY DOG'S RELIEF",
  invert = false,
  href = "#buy",
}: {
  label?: string;
  invert?: boolean;
  href?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <a
        href={href}
        className="adv-heading rounded-full px-10 py-4 text-sm font-bold uppercase tracking-wide shadow-lg transition-transform hover:scale-[1.03] sm:text-base"
        style={
          invert
            ? { background: "#fff", color: RED }
            : { background: RED, color: "#fff" }
        }
      >
        {label}
      </a>
      <span
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide"
        style={{ color: invert ? "#fff" : INK }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill={invert ? "#fff" : RED} aria-hidden>
          <path d="M8 0l6 2.5v4.2c0 4-2.6 7.6-6 9.3-3.4-1.7-6-5.3-6-9.3V2.5z" />
        </svg>
        51% of profits go to animal welfare
      </span>
    </div>
  );
}

function Wave({ fill, flip = false }: { fill: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 90"
      preserveAspectRatio="none"
      className="block h-[50px] w-full sm:h-[70px]"
      style={flip ? { transform: "scaleY(-1)" } : undefined}
      aria-hidden
    >
      <path d="M0,60 C280,110 520,-10 760,25 C1000,60 1220,80 1440,35 L1440,90 L0,90 Z" fill={fill} />
    </svg>
  );
}

function Accordion({ q, a, light = false }: { q: string; a: string; light?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: light ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.1)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="adv-heading text-base font-bold sm:text-lg" style={{ color: light ? "#fff" : INK }}>
          {q}
        </span>
        <span
          className="shrink-0 text-2xl font-light leading-none transition-transform"
          style={{ color: RED, transform: open ? "rotate(45deg)" : "none" }}
        >
          +
        </span>
      </button>
      {open && (
        <p className="pb-5 text-[15px] leading-relaxed" style={{ color: light ? "rgba(255,255,255,0.9)" : "#4B4B4B" }}>
          {a}
        </p>
      )}
    </div>
  );
}

/* ---------- the page ---------- */

export default function ProbioticPlusAdvertorial() {
  // Real brand fonts, verified against the live Replo page's own CSS:
  // Poppins (100–950) for headings/display, Inter for body copy.
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    document.title = "5 Strain Probiotic+ — Good For Pets";
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const [bundle, setBundle] = useState(1); // index into VARIANTS (default: 2 tubs)
  const [mode, setMode] = useState<"sub" | "once">("sub");
  const [plan, setPlan] = useState(PLANS[3].id); // 90 days

  const cartUrl = useMemo(() => {
    const v = VARIANTS[bundle];
    const base = `https://goodforpets.co/cart/${v.id}:1`;
    return mode === "sub" ? `${base}?selling_plan=${plan}` : base;
  }, [bundle, mode, plan]);

  const price = (i: number) =>
    mode === "sub" ? VARIANTS[i].price * 0.7 : VARIANTS[i].price;
  const compare = (i: number) =>
    mode === "sub" ? VARIANTS[i].price : VARIANTS[i].compare;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif", color: INK }}>
      <style>{`
        .adv-heading { font-family: 'Poppins', system-ui, sans-serif; }
        .adv-display { font-family: 'Poppins', system-ui, sans-serif; font-weight: 800; }
      `}</style>

      {/* ===== header ===== */}
      <header className="flex items-center justify-center bg-white px-6 py-3">
        <img src="/lp/logo-red.svg" alt="Good For Pets" className="h-12 w-auto" />
      </header>

      {/* ===== 1 · HERO ===== */}
      <section style={{ background: "linear-gradient(180deg,#F4F4F4 0%,#E9E9E9 100%)" }}>
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 pt-10 lg:grid-cols-2">
          {/* left: Day 1 / Day 21 + tub */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-6">
              {[
                { tag: "Day 1", img: "/lp/ear-before.jpg" },
                { tag: "Day 21", img: "/lp/ear-after.jpg" },
              ].map((c) => (
                <figure key={c.tag} className="overflow-hidden rounded-2xl border-2 shadow-md" style={{ borderColor: RED_DEEP, background: RED_DEEP }}>
                  <figcaption className="adv-display py-2 text-center text-2xl font-bold text-white">{c.tag}</figcaption>
                  <img src={c.img} alt="" className="aspect-[3/4] w-full object-cover" />
                </figure>
              ))}
            </div>
            <div className="relative z-10 mx-auto -mb-16 mt-4 hidden w-fit lg:block">
              <img src="/lp/tub-cutout.png" alt="" className="w-52 rotate-[-10deg] drop-shadow-2xl" />
              {[
                "left-[-40px] top-[38%] rotate-[25deg]",
                "left-[-70px] top-[62%] rotate-[80deg]",
                "right-[-45px] top-[30%] rotate-[-30deg]",
                "right-[-70px] top-[58%] rotate-[60deg]",
                "left-[30%] bottom-[-26px] rotate-[15deg]",
              ].map((pos, i) => (
                <img key={i} src="/lp/capsule-cutout.png" alt="" className={`absolute w-11 drop-shadow-lg ${pos}`} />
              ))}
            </div>
          </div>

          {/* right: headline block */}
          <div className="pb-10 text-center lg:text-left">
            <p className="flex items-center justify-center gap-2 text-xl lg:justify-start">
              <Stars />
              <span className="font-bold">20,000+</span>
              <span className="font-light">Dogs Helped in 12 Months</span>
            </p>
            <h1 className="adv-display mt-4 text-4xl font-extrabold leading-[1.05] sm:text-5xl" style={{ color: RED }}>
              Still Licking His Paws? It's Not His Skin — It's His Gut.
            </h1>
            <p className="mt-3 text-base font-medium text-black/60">
              The itching, the paw licking, the gunky ears usually start in the gut. 5 billion live bacteria, sprinkled on dinner — never baked, never wasted.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                {
                  label: <><b>Improves</b> digestion</>,
                  icon: <path d="M14 4c6 0 10 4 10 9s-3 8-7 8c-3 0-4-2-4-4s1-3 3-3c3 0 3-4 0-4-4 0-7 3-7 8" fill="none" stroke={RED} strokeWidth="2.4" strokeLinecap="round" />,
                },
                {
                  label: <><b>Clear</b> gunky ears</>,
                  icon: <path d="M8 24c0-9 2-17 8-17 5 0 8 5 8 10M16 24c-2-3-2-7 1-8" fill="none" stroke={RED} strokeWidth="2.4" strokeLinecap="round" />,
                },
                {
                  label: <><b>Reduces</b> itching &amp; paw licking</>,
                  icon: (
                    <>
                      <path d="M16 4l10 4v6c0 6-4 11-10 14C10 25 6 20 6 14V8z" fill="none" stroke={RED} strokeWidth="2.4" strokeLinejoin="round" />
                      <circle cx="13" cy="13" r="1.6" fill={RED} />
                      <circle cx="19" cy="13" r="1.6" fill={RED} />
                      <path d="M16 21c-2 0-3-1.4-3-2.6 0-2.4 6-2.4 6 0 0 1.2-1 2.6-3 2.6z" fill={RED} />
                    </>
                  ),
                },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-5 text-center text-sm leading-tight shadow-sm">
                  <svg width="42" height="38" viewBox="0 0 32 28" aria-hidden>{b.icon}</svg>
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-7">
              <Cta />
            </div>
          </div>
        </div>

        {/* The scene — create the emotion, don't ask about it (Nick #1: a scene
            that induces the feeling; #2: stack guilt → vindication; #8: make
            her feel exactly understood). */}
        <div className="mx-auto mt-14 grid max-w-5xl items-center gap-8 px-6 pb-6 sm:grid-cols-[1fr_1.1fr]">
          <img
            src="/lp/scene-sofa.jpg"
            alt=""
            className="w-full rounded-2xl object-cover shadow-lg"
          />
          <div>
            <h2 className="adv-display text-3xl font-extrabold sm:text-4xl" style={{ color: RED }}>
              You know the sound.
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-black/70">
              It's 9pm. The telly's on — and underneath it, that wet, rhythmic{" "}
              <em className="font-semibold not-italic" style={{ color: INK }}>lick&#8209;lick&#8209;lick</em>{" "}
              again. You've tried the sprays, the shampoos, the vet visits, the chews that promised the world. And somewhere along the way, you started feeling like you're letting him down.
            </p>
            <p className="adv-heading mt-4 text-[17px] font-bold leading-relaxed" style={{ color: INK }}>
              You're not. Nothing you've tried was built to survive the journey to his gut — and that's not your fault. Here's what nobody tells you.
            </p>
          </div>
        </div>
        <Wave fill={RED} />
      </section>

      {/* ===== 2 · WHY CHEWS DON'T WORK (heat + moisture) ===== */}
      <section className="px-6 pb-14 pt-4" style={{ background: RED }}>
        <h2 className="adv-display mx-auto max-w-4xl text-center text-4xl font-extrabold text-white sm:text-5xl">
          Why <span className="font-extrabold">Probiotic Dog Chews</span>{" "}
          <span className="font-bold opacity-95">Don't Work</span>
        </h2>
        <div className="mx-auto mt-10 grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {[
            { img: "/lp/circle-oven.jpg", text: <>Chews are <b>baked in ovens</b> — heat destroys up to 90% of the &quot;live bacteria&quot;</> },
            { img: "/lp/moist-chews.jpg", text: <>Chews are <b>moist</b> — moisture wakes the survivors up in the tub, where they quietly die</> },
            { img: "/lp/circle-conveyor.jpg", text: <>So you're left with an <b>expensive treat</b>, not a real probiotic</> },
            { img: "/lp/circle-fillers.jpg", pos: "18% center", text: <>Padded with <b>fillers, flavourings &amp; grains</b> dogs don't need</> },
          ].map((c, i) => (
            <div key={i} className="flex flex-col items-center gap-4 text-center">
              <div className="aspect-square w-full max-w-[240px] overflow-hidden rounded-full border-[3px] border-white/80 shadow-lg">
                <img src={c.img} alt="" className="h-full w-full object-cover" style={"pos" in c && c.pos ? { objectPosition: c.pos } : undefined} />
              </div>
              <p className="max-w-[260px] text-base font-bold leading-snug text-white">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 3 · THE ONLY CAPSULE ===== */}
      <section className="relative overflow-hidden bg-white pt-14">
        <h2 className="adv-display mx-auto max-w-5xl px-6 text-center text-4xl font-extrabold sm:text-5xl">
          <span style={{ color: RED }}>The Only Probiotic Capsule</span>{" "}
          <span className="font-semibold" style={{ color: INK }}>Built to Dodge Both Heat &amp; Moisture</span>
        </h2>
        <div className="mx-auto mt-10 grid max-w-6xl items-center gap-6 px-6 lg:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-col items-stretch gap-4">
            {["Meat-free chicken flavour dogs love", "90 sprinkle capsules (up to 3 months)", "Calms itching & yeast flare-ups"].map((t) => (
              <div key={t} className="rounded-full border-2 bg-white px-6 py-3.5 text-center text-[15px] font-bold shadow-sm" style={{ borderColor: RED }}>
                {t}
              </div>
            ))}
          </div>
          <div className="relative mx-auto flex flex-col items-center">
            <img src="/lp/tub-cutout.png" alt="5 Strain Probiotic+" className="relative z-10 w-56 drop-shadow-2xl sm:w-64" />
            <div className="z-0 -mt-6 h-14 w-64 rounded-[50%] bg-[#F3E2DE] shadow-[0_18px_30px_rgba(0,0,0,0.25)]" />
          </div>
          <div className="flex flex-col items-stretch gap-4">
            {["Cold-processed so it actually works", "5 billion live cultures per capsule — 5× a typical chew", "Vet co-developed & easy to give"].map((t) => (
              <div key={t} className="rounded-full border-2 bg-white px-6 py-3.5 text-center text-[15px] font-bold shadow-sm" style={{ borderColor: RED }}>
                {t}
              </div>
            ))}
          </div>
        </div>
        <div className="-mt-10">
          <Wave fill={RED} />
        </div>
        <div className="px-6 pb-12 pt-2" style={{ background: RED }}>
          <Cta invert={false} label="START MY DOG'S RELIEF TODAY" />
        </div>
      </section>

      {/* ===== 4 · UGC STRIP + BENEFITS ===== */}
      <section className="px-6 pb-14" style={{ background: RED }}>
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <img key={n} src={`/lp/ugc-${n}.jpg`} alt="" className={`aspect-square w-full rounded-xl object-cover shadow-md ${n === 5 ? "hidden sm:block" : ""}`} />
          ))}
        </div>
        <h2 className="adv-display mx-auto mt-12 max-w-5xl text-center text-4xl font-extrabold leading-tight text-white sm:text-5xl">
          Real Relief For Your Dog's{" "}
          <span className="text-3xl font-semibold sm:text-4xl">Digestion, Skin &amp; Daily Comfort</span>
        </h2>
        <div className="mx-auto mt-8 grid max-w-6xl gap-4 sm:grid-cols-3">
          {[
            { t: "Smoother Digestion & Regular Bowls", b: "Helps reduce sloppy poos, gas and bloating — usually the first change owners notice, within a couple of weeks." },
            { t: "Supports Healthy Yeast Balance", b: "Works on the yeast imbalance behind the itching, the licking and the black gunk in the ears — the stuff creams and drops never touch." },
            { t: "Healthier Skin & Fewer Flare-Ups", b: "Supports the gut balance that helps calm redness and irritation. One owner watched her staffie's white socks come back white again." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl p-6 text-center text-white" style={{ background: RED_CARD }}>
              <h3 className="adv-heading text-lg font-bold leading-snug">{c.t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-white/95">{c.b}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-4 grid max-w-4xl gap-4 sm:grid-cols-2">
          {[
            { t: "Stronger Natural Defences", b: "A balanced gut supports your dog's immune system, helping them cope when flare-up season arrives." },
            { t: "Fresher Breath & a Brighter Dog", b: "Addresses the gut imbalances behind bad breath — owners report clearer eyes and a happier dog all round." },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl p-6 text-center text-white" style={{ background: RED_CARD }}>
              <h3 className="adv-heading text-lg font-bold leading-snug">{c.t}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-white/95">{c.b}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Cta invert label="START MY DOG'S RELIEF TODAY" />
        </div>
      </section>

      {/* ===== 5 · VET ===== */}
      <section className="relative" style={{ background: "linear-gradient(180deg,#EFEFEF 0%,#E6E6E6 60%, #EFEFEF 100%)" }}>
        <div className="mx-auto grid max-w-5xl items-center gap-8 px-6 py-16 sm:grid-cols-[300px_1fr]">
          <div className="mx-auto aspect-square w-64 overflow-hidden rounded-full border-8 shadow-xl sm:w-72" style={{ borderColor: RED }}>
            <img src="/lp/vet-kishan.jpg" alt="Dr Kishan Vara MRCVS" className="h-full w-full object-cover" />
          </div>
          <div className="rounded-2xl bg-white p-7 shadow-md sm:p-9">
            <h2 className="adv-display text-3xl font-extrabold" style={{ color: RED }}>Kishan Vara</h2>
            <p className="mt-1 text-lg font-medium text-black/70">Veterinary Surgeon MRCVS</p>
            <p className="adv-heading mt-4 text-xl font-bold leading-snug sm:text-2xl" style={{ color: RED }}>
              “Daily probiotics and enzymes make a meaningful difference to a dog's digestion.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-black/70">
              This formula pairs beneficial Lactobacillus and Bifidobacterium strains with prebiotic chicory root, helping good bacteria flourish. Together they support digestion, immunity and overall wellbeing. It's an excellent proactive choice for dogs with sensitive stomachs, inflamed ears, or recurring digestive upset.”
            </p>
          </div>
        </div>
        <Wave fill={RED} />
      </section>

      {/* ===== 6 · HOW TO USE ===== */}
      <section style={{ background: RED }}>
        <div style={{ background: "#F0F0F0" }}>
          <Wave fill={RED} flip />
          <div className="mx-auto max-w-6xl px-6 pb-14 pt-4">
            <h2 className="adv-display text-center text-4xl font-extrabold sm:text-5xl">
              <span style={{ color: RED }}>How To Use</span>{" "}
              <span className="font-semibold" style={{ color: INK }}>Our Sprinkle Capsules</span>
            </h2>
            <p className="mt-2 text-center text-2xl font-light text-black/70">To Give Your Dog Comfort &amp; Relief</p>
            <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
              {[
                { tag: "twist", img: "/lp/how-twist.jpg" },
                { tag: "sprinkle", img: "/lp/how-serve.jpg" },
                { tag: "gobble", img: "/lp/how-gobble.jpg" },
                { tag: "smile", img: "/lp/how-smile.jpg" },
              ].map((c) => (
                <div key={c.tag} className="relative overflow-hidden rounded-xl shadow-md">
                  <img src={c.img} alt="" className="aspect-[4/5] w-full object-cover" />
                  <span className="adv-display absolute left-1/2 top-4 -translate-x-1/2 rounded-lg px-7 py-1.5 text-xl font-bold lowercase text-white shadow" style={{ background: RED }}>
                    {c.tag}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Cta label="START MY DOG'S RELIEF TODAY" />
            </div>
          </div>
        </div>

        {/* ===== 7 · COMPARISON ===== */}
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-[1fr_1.2fr]" style={{ background: `linear-gradient(160deg, ${RED} 0%, ${RED_DEEP} 100%)` }}>
          <div className="text-center">
            <h2 className="adv-display text-4xl font-extrabold leading-tight text-white sm:text-5xl">
              Why Our Capsules Outperform Probiotic Chews Every Time
            </h2>
            <p className="mt-4 text-lg font-light text-white/90">
              One format keeps live bacteria alive until the gut. The other cooks them, then drowns them.
            </p>
            <div className="mt-7">
              <Cta invert label="START MY DOG'S RELIEF TODAY" />
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <div className="grid grid-cols-[1.2fr_1fr_1fr] text-center">
              <div className="adv-heading flex items-end p-4 pb-3 text-lg font-bold text-white" style={{ background: RED_CARD }}>Feature / Benefit</div>
              <div className="flex items-end justify-center bg-white p-4 pb-3">
                <img src="/lp/logo-red.svg" alt="Good For Pets" className="h-12 w-auto" />
              </div>
              <div className="adv-heading flex items-end justify-center p-4 pb-3 text-lg font-bold leading-tight text-white" style={{ background: RED_CARD }}>Probiotic Chews</div>
              {[
                ["Cold-processed formula", "Cold-crafted to keep probiotics alive", "Heat kills good bacteria"],
                ["Dry sealed capsule", "Cultures stay dormant until the gut", "Moisture kills them in the tub"],
                ["Real digestive support", "Helps ease gas & bloating", "Barely helps digestion"],
                ["Skin & coat relief", "Soothes itch & dryness", "Little to no results"],
                ["Natural ingredients", "Pure, grain-free, clean", "Filled with additives"],
                ["Value for money", "Around 40p a day", "Paying for packaging"],
              ].map(([f, us, them], i) => (
                <div key={i} className="contents">
                  <div className="border-t border-white/20 p-4 text-left text-[15px] font-semibold text-white" style={{ background: RED_CARD }}>{f}</div>
                  <div className="flex items-start gap-2 border-t border-black/5 bg-white p-4 text-left text-sm font-medium" style={{ color: RED_DEEP }}>
                    <svg className="mt-0.5 shrink-0" width="17" height="17" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill={RED} /><path d="M5 9.2l2.6 2.6L13 6.4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {us}
                  </div>
                  <div className="flex items-start gap-2 border-t border-white/20 p-4 text-left text-sm text-white/90" style={{ background: RED_CARD }}>
                    <svg className="mt-0.5 shrink-0" width="17" height="17" viewBox="0 0 18 18"><circle cx="9" cy="9" r="8.2" fill="none" stroke="#fff" strokeWidth="1.6" opacity="0.8" /><path d="M6 6l6 6M12 6l-6 6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" /></svg>
                    {them}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 8 · STRAIN GRID ===== */}
      <section className="bg-white px-6 py-16">
        <h2 className="text-center text-3xl font-light" style={{ color: INK }}>
          A Natural, Research-Backed Blend Proven to
        </h2>
        <p className="adv-display mt-1 text-center text-5xl font-extrabold sm:text-6xl" style={{ color: RED }}>
          Support Gut &amp; Skin Health
        </p>
        <div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-2">
          {[
            { img: "/lp/bact-blue.png", name: "Lactobacillus acidophilus", pts: ["Smoother digestion", "Reduces gas", "Supports regularity"] },
            { img: "/lp/bact-green.png", name: "Lactobacillus rhamnosus", pts: ["Eases upsets", "Supports yeast balance", "Reduces licking"] },
            { img: "/lp/bact-pink.png", name: "Lactobacillus brevis", pts: ["Calms inflammation", "Boosts defences", "Soothes skin"] },
            { img: "/lp/bact-purple.png", name: "Lactobacillus plantarum", pts: ["Aids absorption", "Calms stomach", "Supports digestion"] },
            { img: "/lp/bact-red.png", name: "Bifidobacterium lactis", pts: ["Strengthens immunity", "Balances flora", "Daily comfort"] },
            { img: "/lp/inulin.png", name: "Inulin from Chicory Root", pts: ["Natural prebiotic", "Feeds good bacteria", "Boosts effectiveness"] },
          ].map((s) => (
            <div key={s.name} className="grid grid-cols-[110px_1fr_1.1fr] overflow-hidden rounded-2xl shadow-md sm:grid-cols-[130px_1fr_1.2fr]">
              <img src={s.img} alt="" className="h-full w-full object-cover" />
              <div className="adv-heading flex items-center justify-center p-4 text-center text-lg font-bold leading-tight text-white" style={{ background: RED_DEEP }}>
                {s.name}
              </div>
              <ul className="flex flex-col justify-center gap-1.5 p-4 text-[15px] font-medium text-white" style={{ background: RED }}>
                {s.pts.map((p) => (
                  <li key={p} className="flex items-start gap-2"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-white" />{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-sm text-black/60">
          Plus a <b>6-enzyme digestive complex (150mg)</b> — so your dog actually absorbs the goodness you're paying for in their food.
        </p>
        <div className="mt-10">
          <Cta label="START MY DOG'S RELIEF TODAY" />
        </div>
      </section>

      {/* ===== 9 · REVIEWS ===== */}
      <section className="px-6 py-16" style={{ background: RED }}>
        <h2 className="adv-display text-center text-4xl font-extrabold text-white sm:text-5xl">
          Hear What <span className="opacity-95">Others Are Saying</span>
        </h2>
        <div className="mx-auto mt-10 grid max-w-6xl gap-5 lg:grid-cols-3">
          {[
            {
              title: "Stopped monthly allergy injections!",
              body: "He had monthly injections at the vets for so-called allergies at £120 a month. Two months on Good For Pets probiotic and the change is amazing — if your dog has been licking or scratching, you won't regret it.",
              name: "Shaun M.",
              avatar: null,
            },
            {
              title: "Way better than baked chews!",
              body: "I had my boy on the baked alternative prior to seeing these and they slightly helped his ear problems. These are another level completely. What a difference they have made — and a wee save for my pocket too. Win, win!",
              name: "Tanya S.",
              avatar: "/lp/avatar-tanya.webp",
            },
            {
              title: "£140 vet visits down to £33!",
              body: "My bulldog licked her paws bald and raw every summer for two and a half years. Within a week it started working, three weeks later there's no paw licking at all. The vet was £140 every two weeks — this lasts two months. I don't work for these guys, I just wanted people to know.",
              name: "Chris B.",
              avatar: "/lp/review-chris-b.jpeg",
            },
          ].map((r) => (
            <div key={r.name} className="flex flex-col rounded-2xl bg-white p-6 shadow-lg">
              <h3 className="adv-heading text-lg font-bold" style={{ color: RED }}>{r.title}</h3>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-black/75">{r.body}</p>
              <div className="mt-5 flex items-center gap-3">
                {r.avatar ? (
                  <img src={r.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <span className="adv-heading flex h-11 w-11 items-center justify-center rounded-full text-base font-bold text-white" style={{ background: RED_DEEP }}>
                    {r.name[0]}
                  </span>
                )}
                <div className="flex-1">
                  <p className="adv-heading text-lg font-bold" style={{ color: RED }}>- {r.name}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-black/50">Verified Customer</p>
                </div>
                <Stars size={15} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 10 · BUY BOX ===== */}
      <section id="buy" className="bg-white px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <img src="/lp/hero-tub.jpg" alt="5 Strain Probiotic+" className="w-full rounded-2xl object-cover" />
            <div className="mt-4 grid grid-cols-4 gap-3">
              {["/lp/tub-white.jpg", "/lp/tub-capsules-spill.jpg", "/lp/sprinkle-on-food.jpg", "/lp/ugc-1.jpg"].map((t) => (
                <img key={t} src={t} alt="" className="aspect-square w-full rounded-lg border border-black/10 object-cover" />
              ))}
            </div>
          </div>
          <div>
            <p className="flex items-center gap-2"><Stars size={16} /><span className="text-sm font-semibold" style={{ color: RED }}>4,537 Reviews</span></p>
            <h2 className="adv-heading mt-2 text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">5 Strain Probiotic+ — Sprinkle Capsules</h2>
            <ul className="mt-4 space-y-2">
              {["Reduces itching & paw licking", "Improves digestion", "Clear gunky ears"].map((b) => (
                <li key={b} className="flex items-center gap-2 text-[15px] font-semibold">
                  <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill={RED} /><path d="M5 9.2l2.6 2.6L13 6.4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {b}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-black/20" />
              <span className="adv-heading text-lg font-bold">BUNDLE &amp; SAVE</span>
              <span className="h-px flex-1 bg-black/20" />
            </div>

            {/* bundle options */}
            <div className="mt-4 space-y-3">
              {VARIANTS.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => setBundle(i)}
                  className="relative flex w-full items-center gap-3 rounded-xl border-2 bg-white p-4 text-left transition-colors"
                  style={{ borderColor: bundle === i ? INK : "rgba(0,0,0,0.15)" }}
                >
                  {v.badge && (
                    <span className="adv-heading absolute -top-3 right-3 rounded px-2.5 py-0.5 text-[11px] font-bold uppercase text-white" style={{ background: RED }}>
                      {v.badge}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    {[...Array(i + 1)].map((_, k) => (
                      <img key={k} src="/lp/tub-cutout.png" alt="" className="h-10 w-auto" />
                    ))}
                  </span>
                  <span className="adv-heading flex-1 text-lg font-bold">{v.label}</span>
                  <span className="text-right">
                    <span className="adv-heading block text-xl font-extrabold">{gbp(price(i))}</span>
                    {compare(i) && <span className="text-sm text-black/40 line-through">{gbp(compare(i)!)}</span>}
                  </span>
                </button>
              ))}
            </div>

            {/* subscribe & save */}
            <div
              className="mt-5 rounded-xl border-2 p-5"
              style={{ borderColor: mode === "sub" ? INK : "rgba(0,0,0,0.15)" }}
              onClick={() => setMode("sub")}
              role="button"
            >
              <label className="flex cursor-pointer items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border-2" style={{ borderColor: INK }}>
                  {mode === "sub" && <span className="h-3.5 w-3.5 rounded-full" style={{ background: INK }} />}
                </span>
                <span className="adv-heading text-lg font-bold">Subscribe &amp; Save Extra 30%</span>
              </label>
              <ul className="mt-3 space-y-1.5 pl-9 text-sm text-black/70">
                <li>• 30% off your first order, 20% off every order after — for life</li>
                <li>• Free Royal Mail 48hr shipping</li>
                <li>• Pause or cancel anytime, no hoops</li>
              </ul>
              {mode === "sub" && (
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="mt-4 w-full rounded-lg border border-black/20 bg-[#FAFAFA] px-4 py-3 text-sm font-medium"
                >
                  {PLANS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              )}
            </div>

            {/* one-time */}
            <div
              className="mt-3 rounded-xl border-2 p-5"
              style={{ borderColor: mode === "once" ? INK : "rgba(0,0,0,0.15)" }}
              onClick={() => setMode("once")}
              role="button"
            >
              <label className="flex cursor-pointer items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border-2" style={{ borderColor: INK }}>
                  {mode === "once" && <span className="h-3.5 w-3.5 rounded-full" style={{ background: INK }} />}
                </span>
                <span className="adv-heading text-lg font-bold">One-time purchase</span>
              </label>
            </div>

            <a
              href={cartUrl}
              className="adv-heading mt-5 block w-full rounded-full py-4 text-center text-lg font-bold text-white shadow-lg transition-transform hover:scale-[1.01]"
              style={{ background: RED }}
            >
              Add To Cart — {gbp(price(bundle))}
            </a>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wide">
              <svg width="14" height="14" viewBox="0 0 16 16" fill={RED}><path d="M8 0l6 2.5v4.2c0 4-2.6 7.6-6 9.3-3.4-1.7-6-5.3-6-9.3V2.5z" /></svg>
              51% of profits go to animal welfare
            </p>

            <div className="mt-6">
              <Accordion q="Benefits" a="Supports calmer skin and healthy yeast balance (the driver behind itching, paw licking and gunky ears), smoother digestion with firmer poos, stronger natural defences, and fresher breath — from one sprinkle a day." />
              <Accordion q="Ingredients" a="5 billion live cultures per capsule across five research-backed strains (L. acidophilus, L. rhamnosus, L. plantarum, L. brevis, B. lactis), 250mg prebiotic inulin from chicory root, and a 150mg six-enzyme digestive complex. No fillers, grains or meat — vegan capsule shell, made in the UK to GMP standards." />
              <Accordion q="How It Works" a="Weeks 1–2: the gut settles first — firmer poos, less wind (start on a half dose for the first week). Weeks 3–6: less paw licking and scratching, ears staying cleaner. Weeks 6–12: calmer skin, comfy ears, a brighter dog. Give it the full 90 days — you're covered by the guarantee either way." />
              <Accordion q="Shipping" a="Orders are packed within 24 hours on weekdays and sent Royal Mail Tracked 48 across the UK — most arrive in 2–3 working days. Shipping is free on all subscriptions and one-off orders over £50, and you'll get a tracking link by email. 🐾" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== 11 · FAQ ===== */}
      <section className="bg-white px-6 pb-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 className="adv-display text-5xl font-extrabold" style={{ color: RED }}>Got Questions?</h2>
            <p className="mt-2 text-3xl font-light tracking-wide" style={{ color: INK }}>WE'VE GOT ANSWERS.</p>
          </div>
          <div>
            {[
              ["Will this actually help my dog's itching, paw licking or tummy issues?", "These symptoms are often driven by the gut, which is why creams and sprays keep failing — they never touch the cause. The cold-processed capsule works on gut and yeast balance, which is closely tied to skin and ears. It's not a magic cure and won't suit every case, but for a lot of dogs it's the missing piece — and the 90-day money-back guarantee means you find out risk-free."],
              ["How is this different from the chews I've already tried?", "Chews fail twice: they're baked (heat destroys up to 90% of the live bacteria before the tub is sealed), and they're moist (moisture wakes the survivors so they burn out on the shelf). Our capsule is cold-processed and bone dry — all 5 billion cultures stay dormant until the gut. That's around 5× what a typical chew delivers."],
              ["How long does it take to see results?", "We'd rather be honest than overpromise: most owners notice firmer stools and more energy in the first couple of weeks. Itchy skin and ears take longer — often 6 to 8 weeks. Give it the full 90 days; you're covered by the guarantee the whole time."],
              ["Will my dog like the taste?", "Nearly all dogs love the natural meat-free chicken flavour. It's a sprinkle, not a pill — twist the capsule open and mix the powder into their food. No crushing, no pill pockets, no wrestling."],
              ["Are the ingredients natural and safe?", "Yes — no fillers, grains, meat or artificial additives, in a vegan capsule shell, made in the UK to GMP standards on a human-supplement line and co-developed with vet Dr Kishan Vara MRCVS. Not for puppies under 12 weeks or pregnant dogs — and if your dog is under vet treatment, it's worth a quick word with them first."],
              ["Is it suitable for all breeds and sizes?", "Yes — dogs up to 25kg need one capsule a day, 25–40kg two, and over 40kg three. Start on a half dose for the first week while the gut adjusts."],
              ["How long does one tub last?", "Each tub has 90 sprinkle capsules — around three months for a dog up to 25kg, six weeks for a 25–40kg dog, and a month for the giants."],
            ].map(([q, a]) => (
              <Accordion key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== 12 · FINAL CTA ===== */}
      <section className="overflow-hidden px-6 pb-20 pt-16" style={{ background: `linear-gradient(180deg, ${RED_DEEP} 0%, ${RED} 55%)` }}>
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div className="relative mx-auto flex flex-col items-center">
            <img src="/lp/tub-cutout.png" alt="" className="relative z-10 w-64 drop-shadow-2xl sm:w-72" />
            <div className="z-0 -mt-7 h-16 w-72 rounded-[50%] bg-[#F3E2DE] shadow-[0_20px_35px_rgba(0,0,0,0.35)]" />
          </div>
          <div className="text-center lg:text-left">
            <p className="flex items-center justify-center gap-3 lg:justify-start">
              <span className="flex -space-x-2">
                {[2, 3, 4, 5, 1].map((n) => (
                  <img key={n} src={`/lp/ugc-${n}.jpg`} alt="" className="h-9 w-9 rounded-full border-2 border-white object-cover" />
                ))}
              </span>
              <span className="text-lg text-white"><b>20,000+</b> Dogs Helped In 12 Months</span>
            </p>
            <h2 className="adv-display mt-4 text-6xl font-extrabold leading-none text-white">Help Your Dog</h2>
            <p className="mt-1 text-4xl font-light text-white">Finally Feel Comfortable Again</p>
            <p className="mx-auto mt-4 max-w-md text-lg text-white/90 lg:mx-0">
              Calmer skin, cleaner ears and a settled tummy — from one ten-second sprinkle a day. And the quiet peace of mind that you're finally doing the very best by him.
            </p>
            <div className="mt-7">
              <Cta invert />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
