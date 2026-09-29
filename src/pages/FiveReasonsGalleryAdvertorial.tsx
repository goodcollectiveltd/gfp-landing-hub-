import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { initTracking, track, withAttribution } from "@/lib/tracking";

// 5 REASONS (GALLERY) listicle. Route /p/5-reasons-gallery.
//
// Layout modelled on a proven DTC supplement listicle format (offer bar, hero image gallery,
// credential byline, five numbered reasons: benefit grid, before/after gallery, formula block,
// results timeline, no-fillers close; then reviews, offer box and a sticky CTA). Every word, number
// and image is Good For Pets' own, from company-context:
//   - voice: customer-insights/personas.md ("Sue": frustrated, cheated, "marketing victim", guilt)
//   - specs/prices: products/product-and-range-reference.md (5bn CFU, 5 strains, inulin 250mg,
//     6-enzyme 150mg, RRP £44.99 -> £31.49 first sub, "as little as 28p a day", up to 45% = 3 tubs
//     on sub, pause/cancel anytime)
//   - proof: 20,000+ dogs helped / 4,000+ five-star reviews (never conflated); survey: 77% of dogs had
//     2+ symptoms; T39 Chris B.; Bear (T42, range + vet help); Murphy's ear
//   - guarantee wording: faq.md ("90-day money-back guarantee, no questions asked")
//   - timeline: honest weeks 4-8 window, judged over 90 days. No fake countdown, no invented stats.
// Dr Kishan Vara appears only as "Formulated with" (approved phrasing), no quote attributed.

const RED = "#EF3824"; // brand red: CTAs + accents
const NAVY = "#16223C";
const INK = "#1C1C2E";
const BODY = "#474A55";
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

function TickDot({ bg = RED, size = 18 }: { bg?: string; size?: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-full" style={{ background: bg, width: size, height: size }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 16 16" aria-hidden>
        <path d="M3 8.5l3.2 3.2L13 4.8" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function CtaButton({ label, where, compact = false }: { label: string; where: string; compact?: boolean }) {
  return (
    <a
      href={PRODUCT_URL}
      onClick={(e) => { e.preventDefault(); goToProduct(where); }}
      className={`adv-heading block w-full whitespace-nowrap rounded-full text-center font-bold uppercase tracking-wide text-white shadow-lg transition-transform active:scale-[0.98] ${compact ? "py-3.5 text-[14px]" : "py-4 text-[15px]"}`}
      style={{ background: RED }}
    >
      {label}
    </a>
  );
}

function ReasonHeading({ n, children }: { n: number; children: ReactNode }) {
  return (
    <h2 className="adv-display mt-5 flex gap-2.5 text-[23px] leading-[1.2]" style={{ color: NAVY }}>
      <span className="adv-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[16px] text-white" style={{ background: RED, marginTop: 1 }}>{n}</span>
      <span>{children}</span>
    </h2>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-[16.5px] leading-[1.6]" style={{ color: BODY }}>{children}</p>;
}

function B({ children }: { children: ReactNode }) {
  return <b style={{ color: INK }}>{children}</b>;
}

/* ---------- hero gallery ---------- */

const HERO_SLIDES = [
  { src: "/lp/hero-tub.jpg", alt: "The 5 Strain Probiotic+ tub" },
  { src: "/lp/tub-capsules-spill.jpg", alt: "5 Strain Probiotic+ tub with its sprinkle capsules" },
  { src: "/lp/sprinkle-on-food.jpg", alt: "Sprinkling the pure powder over a dog's dinner" },
  { src: "/lp/ugc-1.jpg", alt: "A happy dog on the grass beside the 5 Strain Probiotic+ tub" },
];

function HeroGallery() {
  const [i, setI] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  const onScroll = () => {
    const el = rail.current; if (!el) return;
    setI(Math.round(el.scrollLeft / el.clientWidth));
  };
  return (
    <div className="relative">
      <div ref={rail} onScroll={onScroll} className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {HERO_SLIDES.map((s) => (
          <div key={s.src} className="relative aspect-square w-full shrink-0 snap-center">
            <img src={s.src} alt={s.alt} className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
      <div className="absolute left-1/2 top-3 flex -translate-x-1/2 gap-1.5">
        {HERO_SLIDES.map((s, n) => (
          <span key={s.src} className="h-1.5 rounded-full transition-all" style={{ width: n === i ? 16 : 6, background: n === i ? "#fff" : "rgba(255,255,255,0.55)" }} />
        ))}
      </div>
    </div>
  );
}

/* ---------- before/after gallery ---------- */

const BEFORE_AFTERS = [
  { before: "/lp/bear-before-c.jpg", after: "/lp/bear-after-c.jpg", name: "Bear, rescue Shih Tzu", story: "Raw, sore skin → a full coat again", note: "On the Good For Pets range, with vet help" },
  { before: "/lp/ear-before-c.jpg", after: "/lp/ear-after-c.jpg", name: "Murphy, 3 weeks in", story: "Crusted, inflamed ears → clean and calm" },
  { before: "/lp/paw-before.jpg", after: "/lp/paw-after.jpg", name: "A customer's dog", story: "Paws licked raw → calm, healed skin" },
];

function BeforeAfterGallery() {
  const [i, setI] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  const onScroll = () => {
    const el = rail.current; if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (card) setI(Math.round(el.scrollLeft / (card.offsetWidth + 12)));
  };
  return (
    <div>
      <div ref={rail} onScroll={onScroll} className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {BEFORE_AFTERS.map((b) => (
          <figure key={b.name} className="w-[88%] shrink-0 snap-center overflow-hidden rounded-2xl" style={{ background: CARD }}>
            <div className="grid grid-cols-2 gap-0.5">
              <div className="relative">
                <img src={b.before} alt={`${b.name}, before`} className="aspect-square w-full object-cover" />
                <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-bold text-white">BEFORE</span>
              </div>
              <div className="relative">
                <img src={b.after} alt={`${b.name}, after`} className="aspect-square w-full object-cover" />
                <span className="absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white" style={{ background: RED }}>AFTER</span>
              </div>
            </div>
            <figcaption className="px-3.5 py-3">
              <p className="adv-heading text-[15px] font-bold leading-snug" style={{ color: INK }}>{b.story}</p>
              <p className="mt-0.5 text-[12.5px]" style={{ color: MUTE }}>{b.name}{b.note ? `. ${b.note}.` : ""}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-1.5">
        {BEFORE_AFTERS.map((b, n) => (
          <span key={b.name} className="h-1.5 rounded-full transition-all" style={{ width: n === i ? 16 : 6, background: n === i ? RED : "#D9D2C8" }} />
        ))}
        <span className="ml-2 text-[12px] font-semibold" style={{ color: MUTE }}>Swipe for more</span>
      </div>
    </div>
  );
}

/* ---------- content ---------- */

const BENEFITS = [
  "Paw licking",
  "Itchy skin",
  "Gunky, smelly ears",
  "Sensitive tummy",
  "Loose stools",
  "Scooting",
  "Dull, patchy coat",
  "Yeast balance",
  "Immune support",
  "Wind",
];

const STRAINS = ["L. plantarum", "L. acidophilus", "L. brevis", "B. lactis", "L. rhamnosus"];

const TIMELINE: [string, string, string][] = [
  ["Weeks 2-4", "First signs", "Firmer stools, less wind, a calmer tummy. The good bacteria are settling in."],
  ["Weeks 4-8", "Real change", "Less licking and scratching, calmer ears. Quieter nights, for both of you."],
  ["Day 90", "The full picture", "Calm skin, steady digestion, a happier dog. The longer they stay on it, the better it gets."],
];

const REVIEWS = [
  { quote: "My bulldog licked her paws raw for two and a half years. I tried everything, including vet medication. Three weeks on these and no paw licking at all.", name: "Chris B.", img: "/lp/review-chris-b.jpeg" },
  { quote: "Two and a half weeks on these and the difference is already massive. Her ears are now practically clean and there's no itching at all.", name: "Katie S.", img: "/lp/review-katie-s.jpeg" },
  { quote: "Our pug Rolo has multiple allergies and we'd tried everything. After a few weeks his skin isn't itchy, his coat looks amazing and he's far more comfortable.", name: "Caroline L.", img: "/lp/review-caroline.jpg" },
  { quote: "I'd tried many others but nothing helped until Good For Pets. He now has his full coat back. Wouldn't give them anything else.", name: "Sherry B.", img: "/lp/review-sherry.jpeg" },
];

/* ---------- page ---------- */

export default function FiveReasonsGalleryAdvertorial() {
  const [showSticky, setShowSticky] = useState(false);

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

  // sticky CTA only once the headline has scrolled away, so it never sits on top of the opening
  useEffect(() => {
    const el = document.getElementById("headline");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="min-h-screen pb-24" style={{ fontFamily: "'Inter', system-ui, sans-serif", color: INK, background: CREAM }}>
      <style>{`
        .adv-heading { font-family: 'Poppins', system-ui, sans-serif; }
        .adv-display { font-family: 'Poppins', system-ui, sans-serif; font-weight: 700; letter-spacing: -0.015em; }
      `}</style>

      {/* offer bar: a real standing offer + the guarantee, no fake countdown */}
      <div className="flex items-center justify-between gap-3 px-4 py-2" style={{ background: NAVY }}>
        <p className="adv-heading text-[12.5px] font-bold uppercase leading-tight tracking-wide text-white">
          <span style={{ color: "#FF8A75" }}>Save up to 45%</span><br />+ Free UK shipping
        </p>
        <p className="adv-heading shrink-0 rounded-lg px-2.5 py-1.5 text-center text-[11px] font-bold uppercase leading-tight" style={{ background: CREAM, color: NAVY }}>
          90-day<br />money-back
        </p>
      </div>

      <div className="mx-auto max-w-xl">
        <HeroGallery />

        {/* trust strip (kept off the photos so nothing sits on top of the product) */}
        <div className="flex items-center justify-between gap-2 border-b px-5 py-3" style={{ borderColor: "#EDE5DA" }}>
          <span className="flex items-center gap-1.5 whitespace-nowrap text-[13px] font-semibold" style={{ color: INK }}>
            <Stars size={13} /> 20,000+ dogs helped
          </span>
          <span className="flex gap-1">
            {["UK made"].map((b) => (
              <span key={b} className="whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide" style={{ borderColor: NAVY, color: NAVY }}>{b}</span>
            ))}
          </span>
        </div>

        {/* title + byline + opener */}
        <section className="px-5 pt-5">
          <h1 id="headline" className="adv-display text-[28px] leading-[1.13]" style={{ color: NAVY }}>
            5 Reasons Your Itchy Dog Needs This Probiotic, Not Another Chew
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <img src="/lp/vet-kishan.jpg" alt="Dr Kishan Vara MRCVS" className="h-11 w-11 shrink-0 rounded-full object-cover" />
            <div className="leading-snug">
              <p className="text-[13.5px] font-semibold" style={{ color: INK }}>Formulated with Dr Kishan Vara, MRCVS</p>
              <p className="text-[12.5px]" style={{ color: MUTE }}>Updated September 2026</p>
            </div>
          </div>

          <p className="mt-4 text-[16.5px] leading-[1.6]" style={{ color: BODY }}>
            The 3am licking. The scratching. The ears you can smell before you see them. <B>So much of that itch starts in the gut, not the skin</B>, which is why creams never last. 5 Strain Probiotic+ supports it at the source: <B>a pure, potent powder</B> with 5 billion live bacteria from five named strains, and none of the starch and glycerine you'll find in most chews.
          </p>
        </section>

        {/* 1. benefits */}
        <section className="px-5 pt-10">
          <img src="/lp/sprinkle-on-food.jpg" alt="Sprinkling 5 Strain Probiotic+ over a dog's dinner" className="aspect-[4/3] w-full rounded-2xl object-cover" />
          <ReasonHeading n={1}>One Daily Sprinkle for Every Symptom You're Fighting</ReasonHeading>
          <P>
            Itchy dogs rarely have just one problem: <B>77% of our customers' dogs had two or more.</B> One capsule over dinner supports them all.
          </P>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[14px] font-semibold leading-tight" style={{ background: CARD, color: INK }}>
                <TickDot /> {b}
              </div>
            ))}
          </div>
        </section>

        {/* 2. before/after gallery */}
        <section className="pt-10">
          <div className="px-5">
            <ReasonHeading n={2}>Real Dogs. Real Owners' Photos. Real Change.</ReasonHeading>
            <P>
              <B>No models, no stock photos.</B> Just our customers' own dogs, before and after.
            </P>
          </div>
          <div className="mt-4"><BeforeAfterGallery /></div>
        </section>

        {/* 3. chews are filler -> so we made a pure, potent powder */}
        <section className="px-5 pt-10">
          <figure>
            <img src="/lp/chew-label.jpg" alt="The Composition on a typical probiotic chew tub: potato starch and glycerine listed first" className="aspect-[4/3] w-full rounded-2xl object-cover" style={{ objectPosition: "center 55%" }} />
            <figcaption className="mt-2 text-[12px] font-semibold" style={{ color: MUTE }}>A typical probiotic chew. Read the Composition, not the front.</figcaption>
          </figure>
          <ReasonHeading n={3}>Chews Are Mostly Filler. So We Made a Pure, Potent Powder.</ReasonHeading>
          <P>
            Turn a probiotic chew over and read the Composition. Potato starch, glycerine, flours, yeast. That's what you're really paying for, and none of it helps an itchy dog. <B>So we cut the lot.</B> What's left is pure, potent powder, every gram of it doing a job.
          </P>
          <div className="mt-4 rounded-2xl px-4 py-3.5" style={{ background: "#EDE5DA" }}>
            <p className="text-[11.5px] font-bold uppercase tracking-wide" style={{ color: MUTE }}>In a typical chew</p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              {["Starch", "Glycerine", "Flours", "Yeast"].map((f) => (
                <span key={f} className="text-[15px] font-semibold line-through decoration-2" style={{ color: MUTE, textDecorationColor: RED }}>{f}</span>
              ))}
            </div>
            <div className="mt-3 border-t pt-3" style={{ borderColor: "#DCD2C5" }}>
              <p className="text-[11.5px] font-bold uppercase tracking-wide" style={{ color: RED }}>In ours</p>
              <p className="mt-1 text-[15px] font-semibold" style={{ color: INK }}>Live cultures, prebiotic, enzymes. That's it.</p>
            </div>
          </div>
          <div className="mt-3 overflow-hidden rounded-2xl" style={{ background: CARD }}>
            <div className="px-4 py-4 text-center" style={{ background: NAVY }}>
              <p className="adv-display text-[30px] leading-none text-white">5 billion</p>
              <p className="mt-1.5 text-[12.5px] font-semibold uppercase tracking-wide text-white/75">live bacteria in every capsule</p>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 px-4 py-4">
              {STRAINS.map((s) => (
                <p key={s} className="flex items-center gap-2 text-[14px] font-semibold italic" style={{ color: INK }}>
                  <TickDot size={16} /> {s}
                </p>
              ))}
            </div>
            <div className="grid grid-cols-2 border-t" style={{ borderColor: "#EFE9E1" }}>
              <div className="px-4 py-3">
                <p className="adv-display text-[19px]" style={{ color: RED }}>250mg</p>
                <p className="text-[12.5px] font-semibold leading-snug" style={{ color: BODY }}>Prebiotic inulin, from chicory root</p>
              </div>
              <div className="border-l px-4 py-3" style={{ borderColor: "#EFE9E1" }}>
                <p className="adv-display text-[19px]" style={{ color: RED }}>150mg</p>
                <p className="text-[12.5px] font-semibold leading-snug" style={{ color: BODY }}>6-enzyme digestive complex</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. timeline */}
        <section className="px-5 pt-10">
          <img src="/lp/ugc-1.jpg" alt="A happy, comfortable dog next to the 5 Strain Probiotic+ tub" className="aspect-[4/3] w-full rounded-2xl object-cover" />
          <ReasonHeading n={4}>Real Change in Weeks, Judged Over 90 Days</ReasonHeading>
          <P>
            No overnight miracles. Most owners see <B>less licking and scratching by weeks 4 to 8.</B> The key is giving it every single day.
          </P>
          <div className="mt-5"><CtaButton label="Start your 90 days risk-free" where="timeline-cta" /></div>
          <ol className="relative mt-6 space-y-4 pl-7">
            <span className="absolute bottom-2 left-[7px] top-2 w-0.5" style={{ background: "#E7DFD4" }} aria-hidden />
            {TIMELINE.map(([when, title, body]) => (
              <li key={when} className="relative">
                <span className="absolute -left-7 top-1 h-4 w-4 rounded-full border-[3px] bg-white" style={{ borderColor: RED }} aria-hidden />
                <p className="adv-heading text-[15px] font-bold" style={{ color: NAVY }}>
                  <span style={{ color: RED }}>{when}:</span> {title}
                </p>
                <p className="mt-0.5 text-[14.5px] leading-relaxed" style={{ color: BODY }}>{body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 5. the guarantee (wording from faq.md: "90-day money-back guarantee, no questions asked") */}
        <section className="px-5 pt-10">
          <div className="flex items-center gap-5 rounded-2xl px-5 py-6" style={{ background: NAVY }}>
            <div className="flex h-[104px] w-[104px] shrink-0 flex-col items-center justify-center rounded-full border-4 text-center" style={{ borderColor: RED, background: CREAM }}>
              <span className="adv-display text-[38px] leading-none" style={{ color: RED }}>90</span>
              <span className="adv-heading mt-0.5 text-[10px] font-bold uppercase leading-tight tracking-wide" style={{ color: NAVY }}>day<br />guarantee</span>
            </div>
            <div className="text-white">
              <p className="adv-display text-[21px] leading-tight">Money back if it doesn't help</p>
              <p className="mt-1.5 text-[13.5px] leading-snug text-white/80">No questions asked. You're never stuck with something that didn't work for your dog.</p>
            </div>
          </div>
          <ReasonHeading n={5}>Try It Risk-Free for 90 Days</ReasonHeading>
          <P>
            You've been let down before, so we'll take the risk. Give it a proper go: a full 90 days, every day. <B>If it doesn't help your dog, you don't pay.</B> No questions asked.
          </P>
          <P>
            Made in the UK to GMP standards. And 51% of our profits go to animal rescue, so every tub helps a dog who has no one.
          </P>
        </section>

        {/* reviews */}
        <section className="px-5 pt-10">
          <p className="flex items-center justify-center gap-2 text-[13.5px] font-semibold" style={{ color: INK }}>
            <Stars size={14} /> 4,000+ five-star reviews
          </p>
          <div className="mt-4 space-y-3">
            {REVIEWS.map((r) => (
              <figure key={r.name} className="rounded-2xl p-4" style={{ background: CARD }}>
                <Stars size={13} />
                <blockquote className="mt-2 text-[15px] leading-relaxed" style={{ color: INK }}>"{r.quote}"</blockquote>
                <figcaption className="mt-3 flex items-center gap-2.5">
                  <img src={r.img} alt={`${r.name}'s dog`} className="h-9 w-9 rounded-full object-cover" />
                  <span className="text-[13px] font-semibold" style={{ color: BODY }}>{r.name} · Verified buyer</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* offer box */}
        <section className="px-5 pt-10">
          <div className="overflow-hidden rounded-3xl shadow-lg" style={{ background: CARD }}>
            <p className="adv-heading py-2.5 text-center text-[12.5px] font-bold uppercase tracking-wide text-white" style={{ background: RED }}>
              Save up to 45% + free UK shipping
            </p>
            <div className="p-5">
              <img src="/lp/hero-tub.jpg" alt="5 Strain Probiotic+" className="aspect-[4/3] w-full rounded-2xl object-cover" />
              <p className="adv-heading mt-4 text-[11.5px] font-bold uppercase tracking-wide" style={{ color: RED }}>20,000+ dogs helped</p>
              <h3 className="adv-display mt-1 text-[24px] leading-tight" style={{ color: NAVY }}>5 Strain Probiotic+</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-[16px] font-semibold line-through" style={{ color: MUTE }}>£44.99</span>
                <span className="adv-display text-[28px] leading-none" style={{ color: INK }}>£31.49</span>
                <span className="text-[12.5px] font-semibold" style={{ color: MUTE }}>first subscription order</span>
              </div>
              <p className="mt-1 text-[13px] font-semibold" style={{ color: RED }}>As little as 28p a day</p>
              <ul className="mt-4 space-y-2.5">
                {[
                  "Supports itchy skin, paws, ears and tummies from the gut out",
                  "5 billion live bacteria, zero glycerine, starch or grains",
                  "Sprinkles over dinner, even fussy dogs eat it",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[14.5px] leading-snug" style={{ color: INK }}>
                    <span className="mt-0.5"><TickDot bg={NAVY} /></span>
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-5"><CtaButton label="Try it risk-free →" where="offer-box" /></div>
              <div className="mt-4 space-y-1 text-center text-[13px] font-semibold" style={{ color: BODY }}>
                <p>✅ 90-day money-back guarantee</p>
                <p>🚚 Free 48hr UK shipping on subscription</p>
              </div>
            </div>
          </div>
        </section>

        {/* disclaimer */}
        <p className="px-5 pt-10 text-center text-[11px] leading-relaxed" style={{ color: MUTE }}>
          This is an advertorial. Good For Pets supplements support and help maintain your dog's wellbeing; they are not intended to diagnose, treat, cure or prevent any disease. Individual results vary. Free 48hr shipping applies to subscription orders. Always speak to your vet about any ongoing health concern.
        </p>
      </div>

      {/* sticky CTA, shown once the headline is out of view */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 px-4 pb-3 pt-2.5 transition-transform duration-300"
        style={{ background: "rgba(22,34,60,0.97)", transform: showSticky ? "translateY(0)" : "translateY(110%)" }}
      >
        <div className="mx-auto max-w-xl"><CtaButton label="Claim up to 45% off →" where="sticky" compact /></div>
      </div>
    </div>
  );
}
