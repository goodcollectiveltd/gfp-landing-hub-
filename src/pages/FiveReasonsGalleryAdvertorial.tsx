import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { initTracking, track, withAttribution } from "@/lib/tracking";

// 5 REASONS (GALLERY) listicle. Route /p/5-reasons-gallery.
//
// Layout modelled on a proven DTC supplement listicle format (offer bar, hero image gallery, vet
// credential byline, five numbered reasons with a benefit-chip grid, a before/after gallery, an
// ingredient dose grid, a results timeline and a "no fillers" close, then reviews + offer box and a
// sticky CTA). Every word, number and image here is Good For Pets' own, from company-context:
//   - specs/prices: products/product-and-range-reference.md (5bn CFU, 5 strains, inulin 250mg,
//     6-enzyme 150mg, £31.49 first sub, "as little as 28p a day", up to 45% = 3 tubs on sub)
//   - proof: 20,000+ dogs helped / 4,000+ five-star reviews (never conflated), T39 Chris B.,
//     Bear (T42, range + vet help), Murphy's ear, Dr Kishan Vara's PDP quote
//   - timeline: honest weeks 4-8 window, judged over 90 days (no invented "% noticed" stats)
//   - no fake countdown: the guide rules out fake timers, so the offer bar carries the guarantee.

const RED = "#EF3824"; // brand red: CTAs + accents
const NAVY = "#16223C";
const INK = "#1C1C2E";
const BODY = "#4B4B4B";
const MUTE = "#8A8A8A";
const CREAM = "#FBF6EF";
const CARD = "#FFFFFF";
const PRODUCT_URL = "https://goodforpets.co/products/5-strain-probiotic";

function goToProduct(placement: string) {
  track("CTAClick", { placement, content_ids: ["5-strain-probiotic"], content_type: "product" });
  // Meta standard funnel event; Purchase fires on the Shopify thank-you page and withAttribution
  // forwards click ids + _fbp/_fbc so Meta and WeTracked attribute the sale back here.
  track("InitiateCheckout", { placement, content_ids: ["5-strain-probiotic"], content_type: "product", content_name: "5 Strain Probiotic+", num_items: 1 });
  window.location.href = withAttribution(PRODUCT_URL);
}

/* ---------- shared bits ---------- */

function Stars({ size = 15 }: { size?: number }) {
  return (
    <span className="inline-flex gap-0.5 align-middle" aria-hidden>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={RED}>
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.8z" />
        </svg>
      ))}
    </span>
  );
}

function Tick({ color = "#fff" }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden className="shrink-0">
      <path d="M3 8.5l3.2 3.2L13 4.8" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CtaButton({ label, where }: { label: string; where: string }) {
  return (
    <a
      href={PRODUCT_URL}
      onClick={(e) => { e.preventDefault(); goToProduct(where); }}
      className="adv-heading block w-full rounded-full px-6 py-4 text-center text-[15px] font-bold uppercase tracking-wide text-white shadow-lg transition-transform hover:scale-[1.02]"
      style={{ background: RED }}
    >
      {label}
    </a>
  );
}

function ReasonHeading({ n, children }: { n: number; children: ReactNode }) {
  return (
    <h2 className="adv-display mt-6 text-[25px] leading-[1.18]" style={{ color: NAVY }}>
      {n}. {children}
    </h2>
  );
}

/* ---------- hero gallery ---------- */

const HERO_SLIDES = [
  { src: "/lp/hero-tub.jpg", alt: "The 5 Strain Probiotic+ tub", overlay: true },
  { src: "/lp/tub-capsules-spill.jpg", alt: "5 Strain Probiotic+ tub with its sprinkle capsules" },
  { src: "/lp/sprinkle-on-food.jpg", alt: "Sprinkling the pure powder over a dog's dinner" },
  { src: "/lp/ugc-1.jpg", alt: "A happy dog on the grass beside the 5 Strain Probiotic+ tub" },
];

function HeroGallery() {
  const [i, setI] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const go = (next: number) => {
    const n = (next + HERO_SLIDES.length) % HERO_SLIDES.length;
    setI(n);
    track.current?.scrollTo({ left: n * track.current.clientWidth, behavior: "smooth" });
  };
  const onScroll = () => {
    const el = track.current; if (!el) return;
    setI(Math.round(el.scrollLeft / el.clientWidth));
  };
  return (
    <div className="relative">
      <div ref={track} onScroll={onScroll} className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {HERO_SLIDES.map((s) => (
          <div key={s.src} className="relative aspect-square w-full shrink-0 snap-center">
            <img src={s.src} alt={s.alt} className="h-full w-full object-cover" />
            {s.overlay && (
              <div className="absolute inset-0 flex flex-col justify-between p-5 text-white">
                <div>
                  <p className="adv-display text-[30px] leading-[1.05]">Pure powder.<br />Nothing else.</p>
                  <p className="mt-2 max-w-[62%] text-[13px] font-medium leading-snug text-white/90">
                    5 named strains. 5 billion live bacteria. <b>Zero glycerine, starch or grains.</b>
                  </p>
                </div>
                <div>
                  <span className="adv-heading inline-block rounded-full bg-white px-4 py-2 text-[15px] font-bold" style={{ color: RED }}>
                    20,000+ dogs helped
                  </span>
                  <div className="mt-3 flex gap-1.5">
                    {["UK made", "Vet formulated", "90-day guarantee"].map((b) => (
                      <span key={b} className="whitespace-nowrap rounded-full border border-white/70 px-2 py-1 text-[9.5px] font-bold uppercase tracking-wide">{b}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button aria-label="Previous image" onClick={() => go(i - 1)}
        className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M10 3L5 8l5 5" stroke={NAVY} strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
      </button>
      <button aria-label="Next image" onClick={() => go(i + 1)}
        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow">
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M6 3l5 5-5 5" stroke={NAVY} strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
      </button>
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
        {HERO_SLIDES.map((s, n) => (
          <span key={s.src} className="h-1.5 rounded-full transition-all" style={{ width: n === i ? 16 : 6, background: n === i ? "#fff" : "rgba(255,255,255,0.55)" }} />
        ))}
      </div>
    </div>
  );
}

/* ---------- content ---------- */

const BENEFITS = [
  "Paw-Licking Support",
  "Itchy Skin Support",
  "Ear Health Support",
  "Digestive Support",
  "Firmer Stools",
  "Scooting & Anal Gland Support",
  "Immune Support",
  "Healthy Coat",
  "Yeast Balance Support",
  "Less Wind",
];

const BEFORE_AFTERS = [
  { before: "/lp/bear-before-c.jpg", after: "/lp/bear-after-c.jpg", name: "Bear", detail: "rescue Shih Tzu", story: "from raw, sore skin to a full coat again", note: "on the Good For Pets range, with vet help" },
  { before: "/lp/ear-before-c.jpg", after: "/lp/ear-after-c.jpg", name: "Murphy", detail: "3 weeks in", story: "from crusted, inflamed ears to clean and calm" },
  { before: "/lp/paw-before.jpg", after: "/lp/paw-after.jpg", name: "A customer's dog", detail: "real owner photo", story: "from paws licked raw to calm, healed skin" },
];

const INGREDIENTS: [string, string][] = [
  ["Live Culture Blend", "5 billion CFU"],
  ["Lactobacillus plantarum", "Live strain"],
  ["Lactobacillus acidophilus", "Live strain"],
  ["Lactobacillus brevis", "Live strain"],
  ["Bifidobacterium lactis", "Live strain"],
  ["Lactobacillus rhamnosus", "Live strain"],
  ["Prebiotic Inulin (chicory root)", "250 mg"],
  ["6-Enzyme Complex", "150 mg"],
];

const TIMELINE: [string, string, string][] = [
  ["Weeks 1-2", "Settling in", "The good bacteria start moving in. Softer stools at first are normal, the gut is just waking up."],
  ["Weeks 2-4", "First signs", "Firmer stools, less wind and a more settled tummy. This is when most owners start to notice."],
  ["Weeks 4-8", "Real change", "Less paw licking and scratching, calmer ears. Your dog is more comfortable in their own skin."],
  ["Day 90", "The full picture", "Calm skin, steady digestion and a happier dog. The longer they stay on it, the better it gets."],
];

const REVIEWS = [
  { quote: "My bulldog licked her paws raw for two and a half years. I tried everything, including vet medication. Three weeks on these and no paw licking at all.", name: "Chris B.", img: "/lp/review-chris-b.jpeg" },
  { quote: "Two and a half weeks on these and the difference is already massive. Her ears are now practically clean and there's no itching at all.", name: "Katie S.", img: "/lp/review-katie-s.jpeg" },
  { quote: "Our pug Rolo has multiple allergies and we'd tried everything. After a few weeks his skin isn't itchy, his coat looks amazing and he's far more comfortable.", name: "Caroline L.", img: "/lp/review-caroline.jpg" },
  { quote: "I'd tried many others but nothing helped until Good For Pets. He now has his full coat back. Wouldn't give them anything else.", name: "Sherry B.", img: "/lp/review-sherry.jpeg" },
];

/* ---------- page ---------- */

export default function FiveReasonsGalleryAdvertorial() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    document.title = "5 reasons your itchy dog needs this probiotic, Good For Pets";
    initTracking();
    track("ViewContent", { content_name: "5 Reasons Gallery Listicle", content_ids: ["5-strain-probiotic"], content_type: "product" });
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div className="min-h-screen pb-24" style={{ fontFamily: "'Inter', system-ui, sans-serif", color: INK, background: CREAM }}>
      <style>{`
        .adv-heading { font-family: 'Poppins', system-ui, sans-serif; }
        .adv-display { font-family: 'Poppins', system-ui, sans-serif; font-weight: 700; letter-spacing: -0.01em; }
      `}</style>

      {/* offer bar (honest: a real standing offer + the guarantee, no fake countdown) */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5" style={{ background: NAVY }}>
        <div className="leading-tight">
          <p className="adv-heading text-[13px] font-bold uppercase tracking-wide" style={{ color: "#FFB4A6" }}>Save up to 45% today 🐾</p>
          <p className="adv-heading text-[12px] font-bold uppercase tracking-wide text-white">+ Free UK shipping on subscription</p>
        </div>
        <div className="shrink-0 rounded-lg px-2.5 py-1.5 text-center leading-none" style={{ background: CREAM }}>
          <p className="adv-heading text-[15px] font-bold" style={{ color: NAVY }}>90-day</p>
          <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide" style={{ color: NAVY }}>money-back</p>
        </div>
      </div>

      <div className="mx-auto max-w-xl">
        <HeroGallery />

        {/* title + byline */}
        <section className="px-5 pt-6">
          <h1 className="adv-display text-[29px] leading-[1.14]" style={{ color: NAVY }}>
            5 Reasons Your Itchy, Paw-Licking Dog Needs This Probiotic
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <img src="/lp/vet-kishan.jpg" alt="Dr Kishan Vara MRCVS" className="h-12 w-12 rounded-full object-cover" />
            <div className="leading-snug">
              <p className="text-[14px] font-semibold" style={{ color: INK }}>Vet-formulated with Dr Kishan Vara, MRCVS</p>
              <p className="text-[13px]" style={{ color: MUTE }}>Updated September 2026</p>
            </div>
          </div>
          <p className="mt-5 text-[16.5px] leading-relaxed" style={{ color: BODY }}>
            5 Strain Probiotic+ is a pure-powder probiotic with <b style={{ color: INK }}>5 billion live bacteria from five named strains</b>, a chicory-root prebiotic and a 6-enzyme complex. It supports your dog from the gut outwards, where so much of the itching, licking and ear trouble starts.
          </p>
        </section>

        {/* 1. benefits */}
        <section className="px-5 pt-10">
          <img src="/lp/sprinkle-on-food.jpg" alt="Sprinkling 5 Strain Probiotic+ over a dog's dinner" className="aspect-square w-full rounded-2xl object-cover" />
          <ReasonHeading n={1}>Whole-Dog Support in One Daily Sprinkle</ReasonHeading>
          <p className="mt-3 text-[16px] leading-relaxed" style={{ color: BODY }}>
            One capsule over dinner covers the problems that keep you both up at night, so your dog can finally settle.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {BENEFITS.map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-semibold text-white" style={{ background: NAVY }}>
                <Tick /> {b}
              </span>
            ))}
          </div>
        </section>

        {/* 2. before/after gallery */}
        <section className="pt-12">
          <div className="px-5">
            <ReasonHeading n={2}>Life-Changing for 20,000+ Dogs</ReasonHeading>
            <blockquote className="mt-4 rounded-2xl p-4" style={{ background: CARD }}>
              <p className="text-[15.5px] italic leading-relaxed" style={{ color: INK }}>
                "Daily probiotics and enzymes make a meaningful difference to a dog's digestion... an excellent proactive choice for dogs with sensitive stomachs, gunky ears, or recurring digestive upset."
              </p>
              <footer className="mt-2 text-[13px] font-semibold" style={{ color: MUTE }}>Dr Kishan Vara, MRCVS</footer>
            </blockquote>
            <p className="mt-4 text-[16px] leading-relaxed" style={{ color: BODY }}>
              Paws licked raw. Ears you can smell across the room. Skin no cream ever fixes. These are real dogs from real owners. <b style={{ color: INK }}>Swipe to see the change.</b>
            </p>
          </div>
          <div className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {BEFORE_AFTERS.map((b) => (
              <figure key={b.name} className="w-[86%] shrink-0 snap-center">
                <div className="grid grid-cols-2 gap-1.5 overflow-hidden rounded-2xl">
                  <div className="relative">
                    <img src={b.before} alt={`${b.name} before`} className="aspect-[3/4] w-full object-cover" />
                    <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2.5 py-0.5 text-[10px] font-bold text-white">BEFORE</span>
                  </div>
                  <div className="relative">
                    <img src={b.after} alt={`${b.name} after`} className="aspect-[3/4] w-full object-cover" />
                    <span className="absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white" style={{ background: RED }}>AFTER</span>
                  </div>
                </div>
                <figcaption className="mt-2 text-[13.5px] leading-snug" style={{ color: BODY }}>
                  <b style={{ color: INK }}>{b.name}</b> ({b.detail}): {b.story}{b.note ? <span style={{ color: MUTE }}> ({b.note})</span> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* 3. ingredient dose grid */}
        <section className="px-5 pt-12">
          <img src="/lp/capsule-open.jpg" alt="An opened 5 Strain Probiotic+ capsule showing the pure powder" className="aspect-square w-full rounded-2xl object-cover" />
          <ReasonHeading n={3}>Five Named Strains, Properly Dosed</ReasonHeading>
          <p className="mt-3 text-[16px] leading-relaxed" style={{ color: BODY }}>
            Every capsule tells you exactly what's inside. <b style={{ color: INK }}>Five clinically-studied strains, a prebiotic to feed them and enzymes to help digestion.</b> No mystery padding.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            {INGREDIENTS.map(([name, dose]) => (
              <div key={name} className="rounded-xl p-3" style={{ background: CARD }}>
                <p className="text-[13px] font-semibold leading-snug" style={{ color: INK }}>{name}</p>
                <p className="adv-heading mt-1 text-[16px] font-bold" style={{ color: RED }}>{dose}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[12px] leading-snug" style={{ color: MUTE }}>Enzymes: amylase, bromelain, protease, lipase, cellulase and lactase. Per capsule.</p>
        </section>

        {/* 4. timeline */}
        <section className="px-5 pt-12">
          <img src="/lp/ugc-1.jpg" alt="A happy, comfortable dog next to the 5 Strain Probiotic+ tub" className="aspect-square w-full rounded-2xl object-cover" />
          <ReasonHeading n={4}>Real Change in Weeks, Not Years</ReasonHeading>
          <p className="mt-3 text-[16px] leading-relaxed" style={{ color: BODY }}>
            Most owners see first signs within a month, then real change in weeks 4 to 8. <b style={{ color: INK }}>The biggest mistake is stopping early or skipping days.</b> Give it a full 90 days, every day.
          </p>
          <div className="mt-5"><CtaButton label="Try it risk-free today" where="timeline-cta" /></div>
          <ol className="mt-6 space-y-3">
            {TIMELINE.map(([when, title, body]) => (
              <li key={when} className="rounded-2xl p-4" style={{ background: CARD }}>
                <p className="adv-heading text-[15px] font-bold" style={{ color: NAVY }}>
                  <span style={{ color: RED }}>{when}</span> · {title}
                </p>
                <p className="mt-1 text-[14.5px] leading-relaxed" style={{ color: BODY }}>{body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-[12px] leading-snug" style={{ color: MUTE }}>Every dog is different. Individual results vary.</p>
        </section>

        {/* 5. no fillers */}
        <section className="px-5 pt-12">
          <img src="/lp/chew-label.jpg" alt="The Composition on a typical probiotic chew tub: potato starch and glycerine listed first" className="aspect-square w-full rounded-2xl object-cover" style={{ objectPosition: "center 40%" }} />
          <p className="mt-2 text-[12px] font-semibold" style={{ color: MUTE }}>A typical probiotic chew. Read the Composition: starch and glycerine first.</p>
          <ReasonHeading n={5}>No Fillers, No Glycerine. Just What Works.</ReasonHeading>
          <p className="mt-3 text-[16px] leading-relaxed" style={{ color: BODY }}>
            Turn a probiotic chew over and read the Composition. Starch, glycerine, flours, yeast. That's what most chews are really made of. <b style={{ color: INK }}>5 Strain Probiotic+ is the opposite: pure, human-grade powder in a vegan capsule</b>, with nothing your dog doesn't need. Made in the UK to GMP standards and cold-filled, never baked. And <b style={{ color: INK }}>51% of our profits go to animal rescue.</b>
          </p>
        </section>

        {/* reviews */}
        <section className="px-5 pt-12">
          <div className="flex items-center justify-center gap-2 text-[14px] font-semibold" style={{ color: INK }}>
            <Stars /> 4,000+ five-star reviews
          </div>
          <div className="mt-4 space-y-3">
            {REVIEWS.map((r) => (
              <figure key={r.name} className="rounded-2xl p-4" style={{ background: CARD }}>
                <div className="flex items-center gap-3">
                  <img src={r.img} alt={`${r.name}'s dog`} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <Stars size={13} />
                    <p className="text-[13px] font-semibold" style={{ color: INK }}>{r.name} · Verified buyer</p>
                  </div>
                </div>
                <blockquote className="mt-3 text-[15px] leading-relaxed" style={{ color: BODY }}>"{r.quote}"</blockquote>
              </figure>
            ))}
          </div>
        </section>

        {/* offer box */}
        <section id="offer" className="px-5 pt-12">
          <div className="overflow-hidden rounded-3xl shadow-lg" style={{ background: CARD }}>
            <p className="adv-heading py-2.5 text-center text-[13px] font-bold uppercase tracking-wide text-white" style={{ background: RED }}>
              🐾 Save up to 45% + free UK shipping
            </p>
            <div className="p-5">
              <span className="adv-heading inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white" style={{ background: NAVY }}>20,000+ dogs helped</span>
              <img src="/lp/hero-tub.jpg" alt="5 Strain Probiotic+" className="mt-4 aspect-[4/3] w-full rounded-2xl object-cover" />
              <h3 className="adv-display mt-4 text-[24px] leading-tight" style={{ color: NAVY }}>5 Strain Probiotic+</h3>
              <p className="text-[13px] font-semibold" style={{ color: MUTE }}>For dogs of all ages, breeds and sizes</p>
              <ul className="mt-4 space-y-2">
                {[
                  "Supports itchy skin, paws, ears and tummies from the gut out",
                  "5 billion live bacteria, zero glycerine, starch or grains",
                  "Sprinkles over dinner, even fussy dogs eat it",
                  "From £31.49, as little as 28p a day",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-[14.5px] leading-snug" style={{ color: INK }}>
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: NAVY }}><Tick /></span>
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-5"><CtaButton label="Try risk-free, save up to 45% →" where="offer-box" /></div>
              <div className="mt-4 space-y-1.5 text-center text-[13px] font-semibold" style={{ color: BODY }}>
                <p>✅ 90-day money-back guarantee</p>
                <p>🚚 Free 48hr shipping on subscription</p>
                <p>🐾 51% of profits to animal rescue</p>
              </div>
            </div>
          </div>
        </section>

        {/* disclaimer */}
        <p className="px-5 pt-10 text-center text-[11px] leading-relaxed" style={{ color: MUTE }}>
          This is an advertorial. Good For Pets supplements support and help maintain your dog's wellbeing; they are not intended to diagnose, treat, cure or prevent any disease. Individual results vary. Always speak to your vet about any ongoing health concern.
        </p>
      </div>

      {/* sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-3 pt-3" style={{ background: NAVY }}>
        <div className="mx-auto max-w-xl"><CtaButton label="Claim up to 45% off →" where="sticky" /></div>
      </div>
    </div>
  );
}
