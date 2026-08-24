import { useEffect, useRef, useState } from "react";
import { initTracking, track, withAttribution } from "@/lib/tracking";

// "5 REASONS" ALLERGY & ITCH LISTICLE, 5 Strain Probiotic+. Route /p/5-reasons.
//
// Structure replicated from a proven competitor listicle (wuffes.com allergy 5-reasons):
//   dark sale banner → editorial hero (vet byline) → "why this works" mechanism →
//   R1 benefit-pill grid → R2 authority + review slider → R3 ingredient accordion →
//   R4 before/after + Day 7/30/90 timeline → R5 purity/manufacturing → offer card →
//   FAQ → sticky CTA.
// Layout/sequence only is borrowed; ALL copy, proof, specs and claims are GFP's own.
//
// Copy = Nick Theriot craft (copywriting.md): open on the failed solutions + emotion,
// each line earns the next, desired-state specifics over broad claims, cut the fat.
// Urgency is REAL only (no fabricated countdown - Nick: fake timers destroy trust; also
// brand-voice.md). No em dashes anywhere (comms-writing-style). Grounded in
// company-context (ingredient-science.md, testimonials, personas, compliance).
//
// Colour system: ORANGE = CTAs only; NAVY = secondary blocks; cream bg.
// No on-page buy box: every CTA sends to the live Shopify product page (with attribution).

const ORANGE = "#EF3824"; // CTAs ONLY
const NAVY = "#16223C";   // every other coloured block/accent
const INK = "#1C1C2E";    // headings
const BODY = "#4B4B4B";
const MUTE = "#8A8A8A";
const CREAM = "#FBF6F1";
const PRODUCT_URL = "https://goodforpets.co/products/5-strain-probiotic";

function goToProduct(placement: string) {
  track("CTAClick", { placement, content_ids: ["5-strain-probiotic"], content_type: "product" });
  window.location.href = withAttribution(PRODUCT_URL);
}

/* ---------- shared bits ---------- */

function Stars({ size = 16, color = ORANGE }: { size?: number; color?: string }) {
  return (
    <span className="inline-flex gap-0.5 align-middle" aria-hidden>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={color}>
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.8z" />
        </svg>
      ))}
    </span>
  );
}

function Check({ color = NAVY }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" className="shrink-0" aria-hidden>
      <circle cx="8" cy="8" r="8" fill={color} />
      <path d="M4.5 8.2l2.2 2.2L11.5 5.6" stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The one orange CTA + guarantee subline. Links to the Shopify product page. */
function Cta({ label = "SAVE 45% + FREE SHIPPING →", where = "cta" }: { label?: string; where?: string }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <a
        href={PRODUCT_URL}
        onClick={(e) => { e.preventDefault(); goToProduct(where); }}
        className="adv-heading w-full max-w-md rounded-full px-8 py-4 text-center text-base font-extrabold uppercase tracking-wide text-white shadow-lg transition-transform hover:scale-[1.02]"
        style={{ background: ORANGE }}
      >
        {label}
      </a>
      <span className="max-w-md text-center text-xs font-semibold leading-snug" style={{ color: MUTE }}>
        <svg width="12" height="12" viewBox="0 0 16 16" fill={NAVY} aria-hidden className="mr-1 inline-block" style={{ verticalAlign: "-1px" }}>
          <path d="M8 0l6 2.5v4.2c0 4-2.6 7.6-6 9.3-3.4-1.7-6-5.3-6-9.3V2.5z" />
        </svg>
        90-day money-back guarantee · 51% of profits to animal rescue
      </span>
    </div>
  );
}

/** Interactive before/after, drag the handle OR tap left/right to reveal. */
function BeforeAfter({ before, after, beforeAlt, afterAlt, afterLabel = "AFTER", caption }: {
  before: string; after: string; beforeAlt: string; afterAlt: string; afterLabel?: string; caption: string;
}) {
  const [pos, setPos] = useState(52);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const setFromClientX = (clientX: number) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100)));
  };
  useEffect(() => {
    const move = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return;
      const x = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      setFromClientX(x);
    };
    const up = () => (dragging.current = false);
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, []);
  return (
    <div>
      <div ref={ref} className="relative aspect-[4/3] w-full cursor-ew-resize select-none overflow-hidden rounded-2xl shadow-md" onClick={(e) => setFromClientX(e.clientX)}>
        <img src={after} alt={afterAlt} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold" style={{ color: NAVY }}>{afterLabel}</span>
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
          <img src={before} alt={beforeAlt} className="absolute inset-0 h-full w-full object-cover" style={{ width: `${100 / (pos / 100)}%`, maxWidth: "none" }} draggable={false} />
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">BEFORE</span>
        </div>
        <div className="absolute inset-y-0" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
          <div className="h-full w-1 bg-white shadow-[0_0_6px_rgba(0,0,0,0.4)]" />
          <button aria-label="Drag to compare" onMouseDown={() => (dragging.current = true)} onTouchStart={() => (dragging.current = true)}
            className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-white shadow-lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill={NAVY} aria-hidden><path d="M8 7l-5 5 5 5V7zm8 0v10l5-5-5-5z" /></svg>
          </button>
        </div>
      </div>
      <p className="mt-2 text-center text-xs font-semibold" style={{ color: MUTE }}>👆 Drag the slider, {caption}</p>
    </div>
  );
}

/* ---------- content (grounded in company-context) ---------- */

const BENEFITS = [
  "Less Scratching", "Firmer Stools", "Calmer Skin", "Fewer Hot Spots", "Yeast Balance",
  "Cleaner Ears", "Immune Balance", "Shinier Coat", "Less Wind", "Better Digestion",
];

const REVIEWS = [
  { quote: "My bulldog licked her paws bald and raw every summer for two and a half years. I tried everything, including vet medication. Nothing worked. Within a week these started working, three weeks later no paw licking at all. The vet was £140 every two weeks, this is £33 and lasts two months. I don't work for these guys, I just wanted people to know.", name: "Chris B.", img: "/lp/review-chris-b.jpeg" },
  { quote: "My dog was on the baked chews but saw the advert saying non-baked is better. Two and a half weeks on these and the difference is already massive. Since I adopted her in 2018 I've spent so much on steroids, ear drops and vet cleaning. Her ears are now practically clean and there's no itching at all.", name: "Katie S.", img: "/lp/review-katie-s.jpeg" },
  { quote: "A real success for our pug Rolo. He has multiple allergies and we'd tried everything. I was sceptical a probiotic could help, but after a few weeks his skin isn't itchy, his coat looks amazing and he's far more comfortable. After spending hundreds over the years, this has been brilliant.", name: "Caroline L.", img: "/lp/review-caroline.jpg" },
  { quote: "Bought these for my Pomeranian who had Alopecia X from a bad yeast infection. I'd tried many others but nothing helped until Good For Pets. He now has his full coat back. Gave them to my other Pom for tummy upsets and she's had nothing since, it's been a year. Wouldn't give them anything else.", name: "Sherry B.", img: "/lp/review-sherry.jpeg" },
];

// icon + name + dose + expandable role. Actives/doses from ingredient-science.md.
const INGREDIENTS: { icon: string; name: string; dose: string; role: string }[] = [
  { icon: "/lp/bact-red.png", name: "L. plantarum", dose: "Live strain", role: "Reinforces the gut barrier and helps steer an over-active allergic response back toward balance." },
  { icon: "/lp/bact-blue.png", name: "L. acidophilus", dose: "Live strain", role: "Crowds out unwanted bacteria and helps maintain the gut barrier and healthy stools." },
  { icon: "/lp/bact-green.png", name: "L. brevis", dose: "Live strain", role: "A strong immune modulator that helps keep the gut calm and balanced." },
  { icon: "/lp/bact-purple.png", name: "B. lactis", dose: "Live strain", role: "One of the most-studied strains in dogs. Supports digestion, firm stools and a balanced gut-immune response." },
  { icon: "/lp/bact-pink.png", name: "L. rhamnosus", dose: "Live strain", role: "The GG strain. Research links it to healthy allergen-antibody (IgE) balance, skin and digestion." },
  { icon: "/lp/inulin.png", name: "Chicory Prebiotic", dose: "Inulin/FOS · 250mg", role: "A prebiotic fibre that feeds the good bacteria and steadies the gut." },
  { icon: "/lp/capsule-cutout.png", name: "Digestive Enzymes", dose: "6-enzyme blend · 150mg", role: "Amylase, protease, lipase, cellulase, lactase and bromelain help your dog get more from every meal." },
];

const TIMELINE: { day: string; tag: string; body: string; note: string }[] = [
  { day: "Day 7", tag: "Settling in", body: "Digestion starts to steady. Softer stools at first are normal, the gut's just waking up.", note: "Most owners notice less wind in the first week." },
  { day: "Day 30", tag: "First real change", body: "Firmer stools. Less scratching, less paw licking. Skin looks calmer and the coat starts to improve.", note: "Most report less redness, fewer hot spots, less paw chewing." },
  { day: "Day 90", tag: "Full effect", body: "All 5 strains, the prebiotic and the enzymes working together. Calmer skin, cleaner ears, steady digestion.", note: "Most say their dog is settled and back to themselves." },
];

const FAQS: [string, string][] = [
  ["Will this actually help my dog's itching, paw licking or ear issues?", "These symptoms are usually driven by the gut, which is why creams and drops keep failing. They never touch the cause. Because the capsule is cold-processed (not baked like chews), the live cultures stay effective and work on digestion, yeast balance and skin. It won't suit every case, but for a lot of dogs it's the missing piece, and the 90-day guarantee means you find out risk-free."],
  ["How long does it take to see results?", "Most owners notice changes in 3 to 6 weeks. Digestion improves first, then calmer skin, less paw licking and fewer flare-ups. Give it a good 90 days for the full effect."],
  ["Are the ingredients natural and safe?", "Yes. 100% natural, grain-free, gentle and vet co-developed. No fillers, no artificial flavourings, no unnecessary additives, in a vegan capsule shell made in the UK to GMP standards."],
  ["How do I give it to a fussy dog?", "Don't swallow it whole. Twist one capsule open and sprinkle the powder over your dog's food. No pill pockets, no fighting."],
  ["Is it suitable for all breeds and sizes?", "Yes, safe for small, medium, large and giant breeds. Follow the weight-based dosage on the product page (one capsule per 25kg)."],
];

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 py-5 text-left">
        <span className="adv-heading text-base font-bold" style={{ color: INK }}>{q}</span>
        <span className="shrink-0 text-2xl font-light leading-none transition-transform" style={{ color: ORANGE, transform: open ? "rotate(45deg)" : "none" }}>+</span>
      </button>
      {open && <p className="pb-5 text-[15px] leading-relaxed" style={{ color: BODY }}>{a}</p>}
    </div>
  );
}

function IngredientRow({ icon, name, dose, role }: { icon: string; name: string; dose: string; role: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 py-3.5 text-left">
        <img src={icon} alt="" className="h-9 w-9 shrink-0 rounded-full object-contain" />
        <span className="min-w-0 flex-1">
          <span className="adv-heading block text-[15px] font-bold leading-tight" style={{ color: INK }}>{name}</span>
          <span className="block text-xs font-semibold" style={{ color: NAVY }}>{dose}</span>
        </span>
        <span className="shrink-0 text-xl font-light leading-none transition-transform" style={{ color: ORANGE, transform: open ? "rotate(45deg)" : "none" }}>+</span>
      </button>
      {open && <p className="pb-4 pl-12 text-[14px] leading-relaxed" style={{ color: BODY }}>{role}</p>}
    </div>
  );
}

function ReviewSlider() {
  const [i, setI] = useState(0);
  const rv = REVIEWS[i];
  const go = (d: number) => setI((p) => (p + d + REVIEWS.length) % REVIEWS.length);
  return (
    <div className="mt-5">
      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <Stars size={15} />
        <blockquote className="mt-2 text-[15px] leading-relaxed" style={{ color: BODY }}>“{rv.quote}”</blockquote>
        <div className="mt-4 flex items-center gap-3">
          <img src={rv.img} alt="" className="h-11 w-11 rounded-full object-cover" />
          <span className="adv-heading flex items-center gap-1.5 text-sm font-bold" style={{ color: INK }}>
            {rv.name} <Check />
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-4">
        <button aria-label="Previous review" onClick={() => go(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg" style={{ borderColor: NAVY, color: NAVY }}>←</button>
        <span className="text-xs font-semibold" style={{ color: MUTE }}>{i + 1} / {REVIEWS.length}</span>
        <button aria-label="Next review" onClick={() => go(1)} className="flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg" style={{ borderColor: NAVY, color: NAVY }}>→</button>
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function FiveReasonsAllergyAdvertorial() {
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const el = document.getElementById("top-cta");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    document.title = "5 Reasons Your Dog Can't Stop Scratching, Good For Pets";
    initTracking();
    track("ViewContent", { content_name: "5 Reasons Allergy Advertorial", content_ids: ["5-strain-probiotic"], content_type: "product" });
    return () => { document.head.removeChild(link); };
  }, []);

  const Num = ({ n }: { n: number }) => <span style={{ color: ORANGE }}>{n}.</span>;

  return (
    <div className="min-h-screen pb-24" style={{ fontFamily: "'Inter', system-ui, sans-serif", color: INK, background: CREAM }}>
      <style>{`
        .adv-heading { font-family: 'Poppins', system-ui, sans-serif; }
        .adv-display { font-family: 'Poppins', system-ui, sans-serif; font-weight: 800; }
        .pl-13 { padding-left: 3.25rem; }
      `}</style>

      {/* SALE BANNER (honest offer, no fabricated countdown) */}
      <div className="w-full px-4 py-2.5 text-center" style={{ background: NAVY }}>
        <p className="adv-heading text-sm font-extrabold uppercase tracking-wide text-white">
          ☀️ Summer sale: <span style={{ color: "#FFB4A8" }}>save 45% + free shipping</span>
        </p>
      </div>

      {/* logo */}
      <header className="flex items-center justify-center border-b border-black/5 bg-white px-6 py-3">
        <img src="/lp/logo-brand.png" alt="Good For Pets" className="h-9 w-auto sm:h-10" />
      </header>

      {/* HERO - byline + headline + emotional Nick-T opening (failed solutions first) */}
      <section className="mx-auto max-w-2xl px-6 pt-6">
        <div className="flex items-center gap-2.5">
          <img src="/lp/vet-kishan.jpg" alt="Dr Kishan Vara MRCVS" className="h-9 w-9 rounded-full object-cover" />
          <p className="text-xs font-semibold" style={{ color: MUTE }}>By Dr Kishan Vara, MRCVS · Verified ✓ · Updated today</p>
        </div>
        <h1 className="adv-display mt-3 text-[31px] leading-[1.08] sm:text-4xl" style={{ color: INK }}>
          5 Reasons Your Dog <span style={{ color: ORANGE }}>Can't Stop Scratching</span> (and the Gut Fix 20,000+ Owners Swear By)
        </h1>
        <img src="/lp/hero-tub.jpg" alt="5 Strain Probiotic+ tub" className="mt-5 aspect-[4/3] w-full rounded-2xl object-cover shadow-sm" />
        <p className="mt-5 text-[17px] leading-relaxed" style={{ color: BODY }}>
          You've tried the creams. The drops. Maybe the steroids from the vet. They quiet it for a week, then the scratching, licking and head shaking come straight back.
        </p>
        <p className="mt-3 text-[17px] leading-relaxed" style={{ color: BODY }}>
          Here's what most owners are never told: <b style={{ color: INK }}>the itch usually starts in the gut, not the skin.</b> Settle that, and the rest finally calms down.
        </p>
      </section>

      {/* early CTA */}
      <div id="top-cta" className="mx-auto mt-6 max-w-2xl px-6"><Cta label="SAVE 45% + FREE SHIPPING →" where="hero-cta" /></div>

      {/* WHY THIS WORKS - suppress vs settle-at-the-source */}
      <section className="mx-auto mt-12 max-w-2xl px-6">
        <h2 className="adv-display text-2xl leading-tight sm:text-3xl" style={{ color: INK }}>Why this works when creams, drops &amp; chews don't</h2>
        <img src="/lp/paw-lick.jpg" alt="A dog licking its paw" className="mt-4 aspect-[16/10] w-full rounded-2xl object-cover shadow-sm" />
        <p className="mt-4 text-[17px] leading-relaxed" style={{ color: BODY }}>
          Steroids and sprays <b style={{ color: INK }}>suppress</b> the reaction, so it fades for a week, then roars back the moment you stop. And most probiotic chews are baked, killing up to 90% of the bacteria before they reach the tub.
        </p>
        <p className="mt-3 text-[17px] leading-relaxed" style={{ color: BODY }}>
          5 Strain Probiotic+ is a cold-processed sprinkle, so <b style={{ color: INK }}>all 5 billion live cultures reach the gut alive</b>, where 70% of the immune system lives. Settle the gut, and the itching, licking and yeast calm at the source.
        </p>
      </section>

      {/* R1 - benefit-pill grid */}
      <section className="mx-auto mt-12 max-w-2xl px-6">
        <h3 className="adv-display text-2xl uppercase leading-tight" style={{ color: INK }}><Num n={1} /> One daily sprinkle, the whole itch problem</h3>
        <p className="mt-3 text-[17px] leading-relaxed" style={{ color: BODY }}>Everything a scratchy, uncomfortable dog needs, in one capsule you twist over dinner.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {BENEFITS.map((b) => (
            <span key={b} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-white" style={{ background: NAVY }}>
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden><path d="M4 8.5l2.5 2.5L12 5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* R2 - authority + review slider */}
      <section className="mx-auto mt-12 max-w-2xl px-6">
        <h3 className="adv-display text-2xl uppercase leading-tight" style={{ color: INK }}><Num n={2} /> Over 20,000 dogs, back to themselves</h3>
        <p className="mt-3 text-[17px] leading-relaxed" style={{ color: BODY }}>
          Dogs that licked their paws raw for years. Dogs up at 3am scratching. Dogs miserable every spring. We've watched them settle and get back to themselves, not by shutting the immune system off, but by fixing the gut it runs on.
        </p>
        <ReviewSlider />
      </section>

      {/* R3 - ingredient accordion */}
      <section className="mx-auto mt-12 max-w-2xl px-6">
        <h3 className="adv-display text-2xl uppercase leading-tight" style={{ color: INK }}><Num n={3} /> Clinically-backed strains, properly dosed</h3>
        <p className="mt-3 text-[17px] leading-relaxed" style={{ color: BODY }}>
          <b style={{ color: INK }}>5 billion live cultures</b> across 5 strains, plus a prebiotic and a 6-enzyme complex. Every active is dosed to do a real job, not an underdosed dusting.
        </p>
        <div className="mt-5 rounded-2xl border border-black/5 bg-white px-5 shadow-sm">
          {INGREDIENTS.map((ing) => <IngredientRow key={ing.name} {...ing} />)}
        </div>
      </section>

      {/* R4 - before/after + Day 7/30/90 timeline */}
      <section className="mx-auto mt-12 max-w-2xl px-6">
        <h3 className="adv-display text-2xl uppercase leading-tight" style={{ color: INK }}><Num n={4} /> Real relief in a few weeks</h3>
        <p className="mt-3 text-[17px] leading-relaxed" style={{ color: BODY }}>
          Most owners see real change inside the first month. Skip days and results stall, so give it the full 90.
        </p>
        <div className="mt-5">
          <BeforeAfter before="/lp/paw-before.jpg" after="/lp/paw-after.jpg"
            beforeAlt="A dog's paw before, pink, sore and saliva-stained from licking"
            afterAlt="The same paw after, calm skin with the fur grown back"
            caption="a real customer's paw, before and after the switch" />
        </div>
        <div className="mt-6 space-y-3">
          {TIMELINE.map((t) => (
            <div key={t.day} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <p className="adv-heading text-[15px] font-bold" style={{ color: INK }}>{t.day} · <span style={{ color: NAVY }}>{t.tag}</span></p>
              <p className="mt-1.5 text-[16px] leading-snug" style={{ color: BODY }}>{t.body}</p>
              <p className="mt-2 rounded-lg px-3 py-2 text-[14px] font-semibold italic" style={{ background: CREAM, color: NAVY }}>{t.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* R5 - value comparison vs a cheap chew */}
      <section className="mx-auto mt-12 max-w-2xl px-6">
        <h3 className="adv-display text-2xl uppercase leading-tight" style={{ color: INK }}><Num n={5} /> Don't be fooled by a cheap chew</h3>
        <p className="mt-3 text-[17px] leading-relaxed" style={{ color: BODY }}>
          A chew looks cheaper on the shelf. But most are one strain, baked until the bacteria are dead, and padded with fillers. Because we keep ours a pure powder, it's more potent, more diverse, and works out cheaper per serving that actually does something.
        </p>

        {/* 3 stat highlights */}
        <div className="mt-5 grid grid-cols-3 gap-2.5 text-center text-white">
          {[["5", "live strains, not 1"], ["20×", "more live cultures to the gut"], ["54%", "cheaper per serving"]].map(([v, l]) => (
            <div key={l} className="rounded-2xl px-2 py-4" style={{ background: NAVY }}>
              <div className="adv-display text-3xl leading-none" style={{ color: "#FFB4A8" }}>{v}</div>
              <div className="mt-1.5 text-[11px] leading-tight opacity-90">{l}</div>
            </div>
          ))}
        </div>

        {/* 2-column us vs them */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-black/10 bg-white p-4">
            <p className="adv-heading text-sm font-bold" style={{ color: MUTE }}>Typical chew</p>
            <ul className="mt-3 space-y-2 text-[13px]" style={{ color: BODY }}>
              {["1 strain", "Baked, most bacteria dead", "No digestive enzymes", "Fillers & flavourings", "More per real serving"].map((t) => (
                <li key={t} className="flex items-start gap-1.5"><span style={{ color: MUTE }}>✗</span>{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border-2 bg-white p-4" style={{ borderColor: ORANGE }}>
            <p className="adv-heading text-sm font-extrabold" style={{ color: INK }}>5 Strain Probiotic+</p>
            <ul className="mt-3 space-y-2 text-[13px] font-medium" style={{ color: INK }}>
              {["5 live strains", "Cold-processed, 5bn reach the gut", "6-enzyme digestive complex", "No fillers or nasties", "54% cheaper per serving"].map((t) => (
                <li key={t} className="flex items-start gap-1.5"><span style={{ color: ORANGE }}>✓</span>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-4 text-[17px] leading-relaxed" style={{ color: BODY }}>
          We even add a <b style={{ color: INK }}>6-enzyme complex most chews skip</b>, so your dog gets more from every meal. Vet co-developed with Dr Kishan Vara MRCVS and made in a UK human-supplement factory.
        </p>
      </section>

      {/* BONUS - 51% charity closer (personas.md: charity seals the sale) */}
      <section className="mx-auto mt-12 max-w-2xl px-6">
        <div className="overflow-hidden rounded-3xl text-white shadow-md" style={{ background: NAVY }}>
          <img src="/lp/charity-rescue.png" alt="Good For Pets founder with rescue dogs" className="aspect-[4/3] w-full object-cover" style={{ objectPosition: "center 30%" }} />
          <div className="p-6 sm:p-7">
            <p className="adv-heading text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.6)" }}>Bonus</p>
            <h2 className="adv-display mt-1 text-2xl leading-tight">51% of profits go to animal rescue</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-white/85">Helping your dog helps thousands more. More than half of every order goes to rescues like Soi Dog, Jerry Green Dogs and the RSPCA. No other pet brand gives this much.</p>
          </div>
        </div>
      </section>

      {/* OFFER CARD */}
      <section className="mx-auto mt-12 max-w-2xl px-6">
        <div className="overflow-hidden rounded-3xl text-white shadow-xl" style={{ background: NAVY }}>
          <div className="relative">
            <img src="/lp/hero-tub.jpg" alt="5 Strain Probiotic+" className="h-56 w-full object-cover" />
            <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-extrabold" style={{ color: NAVY }}>BEST-SELLER</span>
          </div>
          <div className="p-7">
            <div className="flex items-center gap-2">
              <Stars size={16} />
              <span className="text-sm font-semibold text-white/85">Over 20,000 dogs helped</span>
            </div>
            <h2 className="adv-display mt-2 text-3xl leading-tight">5 Strain Probiotic+</h2>
            <ul className="mt-4 space-y-2.5">
              {["For dogs of every age and size", "Cold-processed, so all 5 billion cultures reach the gut alive", "A sprinkle they love, no pills to fight"].map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-[15px] text-white/90">
                  <span className="mt-0.5"><Check color={ORANGE} /></span>{b}
                </li>
              ))}
            </ul>
            <a href={PRODUCT_URL} onClick={(e) => { e.preventDefault(); goToProduct("offer"); }} className="adv-heading mt-6 block w-full rounded-full py-4 text-center text-base font-extrabold uppercase tracking-wide text-white shadow-lg" style={{ background: ORANGE }}>
              Try Risk-Free, Save 45% →
            </a>
            <ul className="mt-4 space-y-1.5 text-sm text-white/85">
              {["Better skin in 90 days or your money back", "Free 48-hour shipping", "Loved by 20,000+ UK dogs"].map((t) => (
                <li key={t} className="flex items-center gap-2"><span style={{ color: "#FFB4A8" }}>✓</span>{t}</li>
              ))}
            </ul>
            <p className="mt-4 text-center text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "#FFB4A8" }}>From just 28p a day</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-12 max-w-2xl px-6">
        <h2 className="adv-display text-center text-2xl sm:text-3xl" style={{ color: INK }}>You asked. We answer.</h2>
        <div className="mt-6">{FAQS.map(([q, a]) => <Accordion key={q} q={q} a={a} />)}</div>
      </section>

      {/* closing CTA */}
      <section className="mx-auto mt-12 max-w-2xl px-6"><Cta label="HELP HIM FEEL COMFORTABLE AGAIN →" where="closing-cta" /></section>

      <p className="mx-auto mt-10 max-w-2xl px-6 text-center text-[11px] leading-relaxed" style={{ color: "#A8A8A8" }}>
        This is an advertorial and not a news article. Good For Pets supplements support and help maintain your dog's wellbeing; they are not intended to diagnose, treat, cure or prevent any disease. Individual results vary.
      </p>

      {/* STICKY CTA BAR */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 backdrop-blur transition-transform duration-300" style={{ transform: showSticky ? "translateY(0)" : "translateY(110%)" }}>
        <div className="mx-auto max-w-2xl px-4 py-3">
          <a href={PRODUCT_URL} onClick={(e) => { e.preventDefault(); goToProduct("sticky"); }} className="adv-heading block w-full rounded-full py-4 text-center text-base font-extrabold uppercase tracking-wide text-white shadow-md" style={{ background: ORANGE }}>Save 45% + Free Shipping →</a>
        </div>
      </div>
    </div>
  );
}
