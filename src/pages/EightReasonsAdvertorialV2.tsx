import { Fragment, useEffect, useRef, useState } from "react";
import { initTracking, track, withAttribution } from "@/lib/tracking";

// "8 REASONS" LISTICLE ADVERTORIAL — V2 DRAFT (mentor restructure), 5 Strain Probiotic+.
// Route: /p/8-reasons-v2 (draft; the live page stays at /p/8-reasons untouched).
//
// What changed vs the live page (mentor's feedback + company-context grounding):
//  - Stronger, more agitating opening (names the failed-med carousel; lifts the guilt).
//  - The 8 reasons are re-sequenced as DISTINCT persuasive moves, not eight benefits:
//    agitate the current solution → new mechanism → proof (3 sliders) → authority →
//    ease/objection → risk reversal. (listicles.md: back half = the conversion stack.)
//  - Charity moved OUT of the reasons to a late "bonus" block (personas.md: charity
//    is Sue's closer, not an opener).
//  - Added the real "what to expect" 90-day timeline (product-and-range-reference.md)
//    to set expectations and cut Sue's #1 churn ("3 months in, still waiting").
//  - Offer uses HONEST urgency only — the real 30%-off-first-tub price lock, genuine
//    volume savings, and cost-of-waiting. No fabricated timers/scarcity (ASA + Sue).
//
// Colour system unchanged: ORANGE = CTAs only; NAVY = secondary blocks; cream bg.
// No on-page buy box: CTAs send to the live Shopify product page.

const ORANGE = "#EF3824"; // CTAs ONLY
const NAVY = "#16223C"; // every other coloured block/accent
const INK = "#1C1C2E"; // headings
const BODY = "#4B4B4B";
const MUTE = "#8A8A8A";
const CREAM = "#FBF6F1";
const PRODUCT_URL = "https://goodforpets.co/products/5-strain-probiotic";

/**
 * Every CTA runs through here: fire the Meta click event, then navigate to
 * Shopify with the ad-click ids / cookies / UTMs appended (withAttribution), so
 * the eventual Purchase attributes back to the ad. href stays PRODUCT_URL as the
 * no-JS / open-in-new-tab fallback.
 */
function goToProduct(placement: string) {
  track("CTAClick", { placement, content_ids: ["5-strain-probiotic"], content_type: "product" });
  window.location.href = withAttribution(PRODUCT_URL);
}

/* ---------- shared ---------- */

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

/** The one orange CTA. Links to the Shopify product page. */
function Cta({ label = "SEE THE DIFFERENCE IN HIS SKIN →", where = "cta" }: { label?: string; where?: string }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <a
        href={PRODUCT_URL}
        onClick={(e) => { e.preventDefault(); goToProduct(where); }}
        className="adv-heading w-full max-w-md rounded-full px-8 py-4 text-center text-sm font-extrabold uppercase tracking-wide text-white shadow-lg transition-transform hover:scale-[1.02] sm:text-base"
        style={{ background: ORANGE }}
      >
        {label}
      </a>
      <span className="flex items-center gap-1.5 text-center text-xs font-semibold" style={{ color: MUTE }}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill={NAVY} aria-hidden>
          <path d="M8 0l6 2.5v4.2c0 4-2.6 7.6-6 9.3-3.4-1.7-6-5.3-6-9.3V2.5z" />
        </svg>
        90-day money-back guarantee · 51% of profits to animal rescue
      </span>
    </div>
  );
}

/** Interactive before/after, drag the handle OR tap left/right to reveal. */
function BeforeAfter({ before, after, beforeAlt, afterAlt, afterLabel = "AFTER", caption, aspectClass = "aspect-[4/3]" }: {
  before: string; after: string; beforeAlt: string; afterAlt: string; afterLabel?: string; caption: string; aspectClass?: string;
}) {
  const [pos, setPos] = useState(52);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
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
      <div ref={ref} className={`relative ${aspectClass} w-full cursor-ew-resize select-none overflow-hidden rounded-2xl shadow-md`} onClick={(e) => setFromClientX(e.clientX)}>
        <img src={after} alt={afterAlt} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold" style={{ color: NAVY }}>{afterLabel}</span>
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
          <img src={before} alt={beforeAlt} className="absolute inset-0 h-full w-full object-cover" style={{ width: `${100 / (pos / 100)}%`, maxWidth: "none" }} draggable={false} />
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-white">BEFORE</span>
        </div>
        <div className="absolute inset-y-0" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
          <div className="h-full w-1 bg-white shadow-[0_0_6px_rgba(0,0,0,0.4)]" />
          <button aria-label="Drag to compare" onMouseDown={() => (dragging.current = true)} onTouchStart={() => (dragging.current = true)}
            className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-white shadow-lg">
            <svg width="22" height="22" viewBox="0 0 24 24" fill={NAVY} aria-hidden><path d="M8 7l-5 5 5 5V7zm8 0v10l5-5-5-5z" /></svg>
          </button>
        </div>
      </div>
      <p className="mt-2 text-center text-xs font-semibold" style={{ color: MUTE }}>👆 Drag the slider, {caption}</p>
    </div>
  );
}

/* ---------- the 8 reasons ---------- */

type Reason = {
  n: number; title: string; body: string;
  img?: string; imgAlt?: string; pos?: string; seal?: boolean;
  slider?: boolean; before?: string; after?: string; beforeAlt?: string; afterAlt?: string; afterLabel?: string; caption?: string; aspect?: string;
  proof?: string;
};

// V2 (mentor restructure): each reason is a different persuasive move, not eight
// benefits in a row. Arc = agitate the current solution → new mechanism → proof
// (the 3 before/after sliders, our click-magnets) → authority → ease/objection →
// risk reversal. Charity moved OUT of the list to a late "bonus" (Sue = closer,
// per personas.md), and a real "what to expect" timeline + honest-urgency offer
// added below. Grounded in personas.md, listicles.md, product-and-range-reference.md.
const REASONS: Reason[] = [
  {
    n: 1, title: "The dirty secret: most probiotic chews are dead on arrival",
    body: "Chews are baked at high heat, which kills up to 90% of the bacteria, then sit moist in the tub, which wakes the survivors so they burn out on the shelf. You've been paying for a dead product, and nobody tells you. It isn't your fault.",
    img: "/lp/moist-chews-real.jpg", imgAlt: "Moist chews in a tub, the live cultures dying before use", pos: "center",
  },
  {
    n: 2, title: "Cold-pressed and sealed dry, so it reaches the gut alive",
    body: "Ours is a dry, cold-pressed capsule, so all 5 billion live bacteria stay alive right up to the gut, 5× what a typical chew even claims. The strains, enzymes and prebiotic then firm up stools and cut the wind and scooting. A sprinkle, not a treat.",
    img: "/lp/pour-food.jpg", imgAlt: "The capsule powder poured over a bowl of food", pos: "center 55%",
  },
  {
    n: 3, title: "It targets the real cause of the paw licking",
    body: "Paw licking is usually an allergic itch, not just the skin. Most of the immune system lives in the gut, so balancing it helps calm the reaction driving the licking. Drag the slider:",
    slider: true, before: "/lp/paw-before.jpg", after: "/lp/paw-after.jpg",
    beforeAlt: "A dog's paw before, pink, sore, saliva-stained from licking", afterAlt: "The same paw after, calm skin with the fur grown back",
    afterLabel: "AFTER", caption: "a real customer's paw, before and after the switch",
  },
  {
    n: 4, title: "Cleaner, calmer ears, without another vet bill",
    body: "Gunky ears are usually the same allergy-and-yeast flare. A calmer gut helps keep both in check. Drag the slider:",
    slider: true, before: "/lp/ear-before-c.jpg", after: "/lp/ear-after-c.jpg",
    beforeAlt: "Dog's ear before, gunky and inflamed", afterAlt: "Dog's ear after, clean and calm",
    afterLabel: "AFTER · 3 WEEKS", caption: "Murphy's ear, before and after (real customer photo)",
    proof: "“Her ears are practically clean, no itching at all, after two and a half weeks.” · Katie S.",
  },
  {
    n: 5, title: "Calms itchy, irritated skin and coat",
    body: "Itchy skin is often an over-reacting immune system showing on the outside. Settle the gut, settle the reaction. Bear's owner sent us this:",
    slider: true, before: "/lp/bear-before-c.jpg", after: "/lp/bear-after-c.jpg",
    beforeAlt: "Bear's skin before, red, raw and patchy", afterAlt: "Bear's skin after, calm, with a full coat",
    afterLabel: "AFTER", caption: "Bear's skin & coat, before and after (real customer, Chris S.)",
  },
  {
    n: 6, title: "Vet co-developed, the UK's first double-strength capsule",
    body: "5 billion live cultures, 2.5× the original strength, cold-pressed, and made in the UK to human GMP standards, the thing our customers rate most of all. Co-developed with a vet.",
    img: "/lp/vet-kishan.jpg", imgAlt: "Dr Kishan Vara MRCVS with the product", pos: "center 20%",
    proof: "“A genuinely proactive choice for dogs with sensitive stomachs, inflamed ears or recurring upset.” · Dr Kishan Vara, MRCVS",
  },
  {
    n: 7, title: "Small enough to open and sprinkle in seconds",
    body: "Twist one open and sprinkle the powder over dinner. No pill pockets, no crushing a tablet, no fighting a tiny dog to swallow it. Even fussy ones don't notice.",
    img: "/lp/sprinkle-on-food.jpg", imgAlt: "Sprinkling the capsule powder over dinner", pos: "center",
    proof: "“I just sprinkle it on his food and he eats it, no problem.” · Jazzy D.",
  },
  {
    n: 8, title: "It's not magic, but we'll take the risk for you",
    body: "It won't suit every dog, and we'll say so. But we're so sure it'll help that we take the risk for you: try it for a full 90 days, and if you see no difference, we give you every penny back.",
    img: "/lp/ugc-1.jpg", imgAlt: "A happy, comfortable dog with the tub", pos: "center 35%", seal: true,
  },
];

/* ---------- comparison table ---------- */

const TABLE = [
  { feature: "Paw Licking & Yeast", us: "5 targeted strains", them: "1–2 generic" },
  { feature: "Gunky Ears", us: "5 billion live CFU", them: "Low, barely helps" },
  { feature: "Itchy Skin", us: "Works from the gut", them: "No skin support" },
  { feature: "Digestion", us: "Enzymes + prebiotic", them: "None added" },
  { feature: "Value", us: "From 28p a day", them: "Often double" },
];

/* ---------- reviews ---------- */

const REVIEWS = [
  { quote: "My dog was on the baked chews but saw the advert saying non-baked is better. Two and a half weeks on these and the difference is already massive. Since I adopted her in 2018 I've spent so much on steroids, ear drops and vet cleaning. Her ears are now practically clean and there's no itching at all.", name: "Katie S.", img: "/lp/review-katie-s.jpeg" },
  { quote: "My bulldog licked her paws bald and raw every summer for two and a half years. I tried everything including vet medication. Nothing worked. Within a week these started working, three weeks later no paw licking at all. The vet was £140 every two weeks, this is £33 and lasts two months. I don't work for these guys, I just wanted people to know.", name: "Chris B.", img: "/lp/review-chris-b.jpeg" },
  { quote: "Just over a month in and the difference is amazing. Her ears are the best they've been in a long time, no more scooting or eating grass, and her eyes are so much clearer with way less tear staining. She's full of energy again, like a younger version of her back.", name: "Elaine C.", img: "/lp/review-elaine.jpeg" },
  { quote: "Bought these for my Pomeranian who had Alopecia X from a bad yeast infection. I'd tried many others but nothing helped until Good For Pets. He now has his full coat back. Gave them to my other Pom for tummy upsets and she's had nothing since, it's been a year. Wouldn't give them anything else.", name: "Sherry B.", img: "/lp/review-sherry.jpeg" },
  { quote: "Tilly's been on these 4 months and the difference is remarkable. Her eyes no longer have that horrible brown staining and she doesn't need her gland emptied as often. We've halved our trips to the vet. She's a three-legged rescue from Romania and she's never felt better.", name: "Christine H.", img: "/lp/review-christine-h.png" },
  { quote: "A real success for our pug Rolo. He has multiple allergies and we'd tried everything. I was sceptical a probiotic could help, but after a few weeks his skin isn't itchy, his coat looks amazing and he's far more comfortable. After spending hundreds over the years, a game changer.", name: "Caroline L.", img: "/lp/review-caroline.jpg" },
];

const FAQS = [
  ["Will this actually help my dog's itching, paw licking or tummy issues?", "These symptoms are often driven by the gut, which is why creams and drops keep failing, they never touch the cause. Because the capsule is cold-processed (not baked like chews), the live cultures stay effective and work on digestion, yeast balance and skin health. It's not a magic cure and won't suit every case, but for a lot of dogs it's the missing piece, and the 90-day guarantee means you find out risk-free."],
  ["How long does it take to see results?", "Most owners notice changes in 3–6 weeks. Digestion usually improves first, followed by calmer skin, less paw licking and fewer flare-ups over the following weeks. Give it a good 90 days."],
  ["Are the ingredients natural and safe?", "Yes, 100% natural, grain-free, gentle and vet co-developed. No fillers, no artificial flavourings, no unnecessary additives, in a vegan capsule shell made in the UK to GMP standards."],
  ["Does it contain any chicken?", "No, we use a meat-free natural chicken flavouring, so dogs love the taste without any risk to chicken-sensitive dogs."],
  ["How do I get my dog to take a capsule?", "The sprinkle capsules aren't meant to be swallowed whole. Just twist one open and sprinkle the powder straight over your dog's food. No pill pockets, no fighting."],
  ["Is it suitable for all breeds and sizes?", "Yes, safe for small, medium, large and giant breeds. Just follow the weight-based dosage on the product page (roughly one capsule per 25kg)."],
  ["How long does one tub last?", "Each tub has 90 capsules. Most dogs take one a day, so a tub lasts around 90 days. Larger dogs can take up to three a day."],
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

/* ---------- page ---------- */

export default function EightReasonsAdvertorialV2() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    document.title = "8 Reasons UK Dog Parents Are Switching, Good For Pets";
    initTracking();
    track("ViewContent", { content_name: "8 Reasons Advertorial (v2 draft)", content_ids: ["5-strain-probiotic"], content_type: "product" });
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div className="min-h-screen pb-20" style={{ fontFamily: "'Inter', system-ui, sans-serif", color: INK, background: CREAM }}>
      <style>{`
        .adv-heading { font-family: 'Poppins', system-ui, sans-serif; }
        .adv-display { font-family: 'Poppins', system-ui, sans-serif; font-weight: 800; }
      `}</style>

      {/* header */}
      <header className="flex items-center justify-center border-b border-black/5 bg-white px-6 py-3">
        <img src="/lp/logo-brand.png" alt="Good For Pets" className="h-9 w-auto sm:h-10" />
      </header>

      {/* byline (editorial native feel) */}
      <div className="mx-auto max-w-2xl px-6 pt-6">
        {/* native byline (advertorial credibility device) */}
        <p className="text-xs font-semibold" style={{ color: MUTE }}>By Jess M · Verified ✓ · Updated today</p>
        <h1 className="adv-display mt-2 text-[28px] leading-[1.1] sm:text-4xl" style={{ color: INK }}>
          8 Reasons UK Dog Parents Are Ditching Expensive Probiotic Chews for <span style={{ color: ORANGE }}>Sprinkle Capsules</span>
        </h1>
        {/* stronger opening: agitate the failed-med carousel + lift the guilt, then bridge (personas.md: vet-med refugee) */}
        <p className="mt-3 text-base leading-relaxed" style={{ color: BODY }}>
          It's 9pm, and there's that wet lick-lick-lick under the telly again. You've tried the sprays, the shampoos, the chews off Amazon, maybe vet visits that wore off in days. Nothing's stuck, and every failed try feels like you're letting them down.
        </p>
        <p className="mt-3 text-base leading-relaxed" style={{ color: BODY }}>
          Here's what nobody tells you: it's usually not their skin at all, it's their gut. And it isn't your fault, <b style={{ color: INK }}>most probiotic chews are dead before your dog gets one.</b>
        </p>
        {/* proof + native byline, one compact row */}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <span className="flex items-center gap-1.5"><Stars size={16} /><span className="adv-heading font-bold" style={{ color: INK }}>4.8/5</span></span>
          <span style={{ color: MUTE }}>· 4,500+ reviews · 20,000+ dogs helped</span>
        </div>
      </div>

      {/* comparison table, the hero lands here (Hollow Socks structure) */}
      <section className="mx-auto mt-7 max-w-2xl px-6">
        <h2 className="adv-display text-center text-2xl sm:text-3xl" style={{ color: INK }}>Sprinkle Capsules <span style={{ color: ORANGE }}>vs</span> Traditional Chews</h2>
        <a href={PRODUCT_URL} onClick={(e) => { e.preventDefault(); goToProduct("comparison-table"); }} className="mt-4 block w-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-lg">
          <div className="grid grid-cols-[1fr_1fr_0.9fr]">
            <div className="p-2" />
            <div className="adv-heading flex items-center justify-center px-2 py-2.5 text-center" style={{ background: NAVY }}>
              <img src="/lp/logo-brand-white.png" alt="Good For Pets" className="h-4 w-auto" />
            </div>
            <div className="adv-heading flex items-center justify-center px-2 py-2.5 text-center text-[11px] font-bold" style={{ color: MUTE, background: "#F1F1F1" }}>Chews</div>
          </div>
          {TABLE.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_0.9fr] border-t border-black/5">
              <div className="flex items-center px-2.5 py-2 text-[12px] font-bold leading-tight" style={{ color: INK }}>{r.feature}</div>
              <div className="flex items-center gap-1 px-2 py-2 text-[12px] font-semibold leading-tight" style={{ background: "rgba(22,34,60,0.04)", color: NAVY }}>
                <svg className="shrink-0" width="14" height="14" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill={ORANGE} /><path d="M5 9.2l2.6 2.6L13 6.4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {r.us}
              </div>
              <div className="flex items-center gap-1 px-2 py-2 text-[12px] leading-tight" style={{ color: MUTE }}>
                <svg className="shrink-0" width="14" height="14" viewBox="0 0 18 18"><circle cx="9" cy="9" r="8.2" fill="none" stroke="#C9C9C9" strokeWidth="1.6" /><path d="M6 6l6 6M12 6l-6 6" stroke="#C9C9C9" strokeWidth="1.8" strokeLinecap="round" /></svg>
                {r.them}
              </div>
            </div>
          ))}
        </a>
      </section>

      {/* single top-third CTA (orange) */}
      <div className="mx-auto mt-6 max-w-2xl px-6"><Cta label="SHOW ME THE CAPSULE →" where="top-cta" /></div>

      {/* short bridge into the list — the mechanism reveal now lives in reasons 1–2 */}
      <section className="mx-auto mt-12 max-w-2xl px-6">
        <p className="text-[15px] leading-relaxed" style={{ color: BODY }}>
          Once you see how a chew is actually made, you can't unsee it. <span className="adv-heading font-bold" style={{ color: INK }}>Here are the 8 reasons UK dog parents are switching</span> 👇
        </p>
      </section>

      {/* THE 8 REASONS, heading → full-width image → body */}
      <section className="mx-auto mt-12 max-w-2xl space-y-10 px-6">
        {REASONS.map((r) => (
          <Fragment key={r.n}>
          <article>
            <h3 className="adv-display text-2xl uppercase leading-tight" style={{ color: INK }}>
              <span style={{ color: ORANGE }}>{r.n}.</span> {r.title}
            </h3>
            {r.slider ? (
              <div className="mt-4">
                <BeforeAfter before={r.before!} after={r.after!} beforeAlt={r.beforeAlt!} afterAlt={r.afterAlt!} afterLabel={r.afterLabel} caption={r.caption!} aspectClass={r.aspect} />
              </div>
            ) : r.img ? (
              <div className="relative mt-4">
                <img src={r.img} alt={r.imgAlt} className="aspect-[4/3] w-full rounded-2xl object-cover shadow-sm" style={{ objectPosition: r.pos ?? "center" }} />
                {r.seal && (
                  <svg width="92" height="92" viewBox="0 0 76 76" aria-hidden className="absolute left-4 top-4 drop-shadow-md">
                    <path d="M38 4l8 5 9-1 4 8 8 4-1 9 5 8-5 8 1 9-8 4-4 8-9-1-8 5-8-5-9 1-4-8-8-4 1-9-5-8 5-8-1-9 8-4 4-8 9 1z" fill={ORANGE} />
                    <text x="38" y="35" textAnchor="middle" fill="#fff" fontSize="19" fontWeight="800" fontFamily="Poppins, sans-serif">90</text>
                    <text x="38" y="50" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="700" letterSpacing="1">DAY</text>
                  </svg>
                )}
              </div>
            ) : null}
            <p className="mt-4 text-[15px] leading-relaxed" style={{ color: BODY }}>{r.body}</p>
            {r.proof && <p className="mt-3 border-l-2 pl-3 text-sm italic" style={{ borderColor: ORANGE, color: MUTE }}>{r.proof}</p>}
          </article>
          {/* social-proof stat bar, placed right after the 3 before/after sliders */}
          {r.n === 5 && (
            <div className="!mt-12 grid grid-cols-3 overflow-hidden rounded-2xl text-center text-white" style={{ background: NAVY }}>
              {[["20,000+", "dogs helped"], ["4,500+", "reviews"], ["4.8/5", "average rating"]].map(([v, l]) => (
                <div key={l} className="px-2 py-4">
                  <div className="adv-display text-xl leading-none sm:text-2xl">{v}</div>
                  <div className="mt-1 text-[11px] opacity-85">{l}</div>
                </div>
              ))}
            </div>
          )}
          </Fragment>
        ))}
      </section>

      {/* WHAT TO EXPECT — the real 90-day timeline (sets expectations, cuts Sue's #1 churn) */}
      <section className="mx-auto mt-14 max-w-2xl px-6">
        <h2 className="adv-display text-center text-2xl sm:text-3xl" style={{ color: INK }}>What to expect</h2>
        <p className="mt-1 text-center text-sm" style={{ color: MUTE }}>Every dog is different, so give it the full 90 days.</p>
        <div className="mt-6 overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
          {[
            ["Days 0–14", "Softer stools at first is normal, the gut is just waking up."],
            ["Days 14–30", "Firmer stools and less wind. You start to notice."],
            ["Days 30–60", "Less paw licking and scratching, more comfortable in their skin."],
            ["Day 90+", "Calm skin, steady digestion, happier dog. The longer they stay on it, the better it gets."],
          ].map(([w, d], i) => (
            <div key={w} className="flex items-start gap-4 p-4 sm:p-5" style={{ borderTop: i ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
              <span className="adv-heading shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: NAVY }}>{w}</span>
              <p className="text-[15px] leading-snug" style={{ color: BODY }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BONUS — charity as the warm closer (personas.md: rarely opens the sale, repeatedly seals it) */}
      <section className="mx-auto mt-14 max-w-2xl px-6">
        <div className="overflow-hidden rounded-3xl text-white shadow-md" style={{ background: NAVY }}>
          <img src="/lp/charity-rescue.png" alt="Good For Pets founder with rescue dogs" className="h-44 w-full object-cover" style={{ objectPosition: "center 25%" }} />
          <div className="p-6 sm:p-7">
            <p className="adv-heading text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.6)" }}>Bonus</p>
            <h2 className="adv-display mt-1 text-2xl leading-tight">51% of profits go to animal rescue</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-white/85">Helping your dog helps thousands more. Recent donations include Soi Dog, Jerry Green Dogs and the RSPCA, no other pet brand gives away this much.</p>
          </div>
        </div>
      </section>

      {/* mid CTA */}
      <div className="mx-auto mt-12 max-w-2xl px-6"><Cta label="GIVE IT A RISK-FREE TRY →" where="mid-cta" /></div>

      {/* OFFER block — HONEST urgency only: real price-lock + cost of waiting + real volume savings */}
      <section className="mx-auto mt-12 max-w-2xl px-6">
        <div className="overflow-hidden rounded-3xl border border-black/5 bg-white text-center shadow-xl">
          <img src="/lp/sprinkle-on-food.jpg" alt="Sprinkling the capsule over food" className="h-48 w-full object-cover" />
          <div className="p-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: ORANGE }}>From just 28p a day</p>
            <h2 className="adv-display mt-2 text-3xl leading-tight" style={{ color: INK }}>Start today and lock your first tub at £31.49</h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed" style={{ color: BODY }}>
              That's <b style={{ color: INK }}>30% off</b> the usual <span className="line-through" style={{ color: MUTE }}>£44.99</span> on your first subscription order, then £35.99 after, around <b style={{ color: INK }}>54% cheaper per day</b> than the UK's top-10 competitor chews. Ships free, pause or cancel anytime.
            </p>
            {/* honest urgency = cost of waiting (no fake timers, no invented scarcity) */}
            <div className="mx-auto mt-4 flex max-w-md items-start gap-3 rounded-2xl p-4 text-left" style={{ background: "rgba(22,34,60,0.05)" }}>
              <svg className="mt-0.5 shrink-0" width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="9" fill={NAVY} /><path d="M9 4.5v5l3 2" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="text-[14px] leading-snug" style={{ color: INK }}>The gut takes a few weeks to settle, so every week you put it off is another week they're licking and scratching. The sooner they start, the sooner they're comfortable.</span>
            </div>
            <a href={PRODUCT_URL} onClick={(e) => { e.preventDefault(); goToProduct("offer"); }} className="adv-heading mt-6 block w-full rounded-full py-4 text-center text-base font-extrabold uppercase tracking-wide text-white shadow-lg" style={{ background: ORANGE }}>
              Start My Dog's Relief →
            </a>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-semibold" style={{ color: BODY }}>
              <span className="rounded-lg bg-black/[0.04] px-2 py-2">Free 48h shipping</span>
              <span className="rounded-lg bg-black/[0.04] px-2 py-2">Pause anytime</span>
              <span className="rounded-lg bg-black/[0.04] px-2 py-2">90-day guarantee</span>
            </div>
            <p className="mt-3 text-sm font-semibold" style={{ color: MUTE }}>Stocking up saves more: 2 tubs save an extra 10%, 3 tubs an extra 15%.</p>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto mt-14 max-w-3xl px-6">
        <h2 className="adv-display text-center text-2xl sm:text-3xl" style={{ color: INK }}>Reviews from real customers</h2>
        <p className="mt-1 text-center text-sm" style={{ color: MUTE }}>Over 20,000 dogs helped and 4,500+ reviews</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {REVIEWS.map((rv) => (
            <figure key={rv.name} className="flex flex-col rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <Stars size={15} />
              <blockquote className="mt-2 flex-1 text-[14px] leading-relaxed" style={{ color: BODY }}>“{rv.quote}”</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <img src={rv.img} alt="" className="h-11 w-11 rounded-full object-cover" />
                <span>
                  <span className="adv-heading block text-sm font-bold" style={{ color: INK }}>{rv.name}</span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color: NAVY }}>
                    <svg width="12" height="12" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill={NAVY} /><path d="M4.5 8.2l2.2 2.2L11.5 5.6" stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    Verified Buyer
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-14 max-w-2xl px-6">
        <h2 className="adv-display text-center text-2xl sm:text-3xl" style={{ color: INK }}>You asked. We answer.</h2>
        <p className="mt-1 text-center text-sm" style={{ color: MUTE }}>Everything you need to know</p>
        <div className="mt-6">{FAQS.map(([q, a]) => <Accordion key={q} q={q} a={a} />)}</div>
      </section>

      {/* closing CTA */}
      <section className="mx-auto mt-12 max-w-2xl px-6"><Cta label="HELP HIM FEEL COMFORTABLE AGAIN →" where="closing-cta" /></section>
      <p className="mx-auto mt-10 max-w-2xl px-6 text-center text-[11px] leading-relaxed" style={{ color: "#A8A8A8" }}>
        This is an advertorial and not a news article. Good For Pets supplements support and help maintain your dog's wellbeing; they are not intended to diagnose, treat, cure or prevent any disease. Individual results vary.
      </p>

      {/* STICKY CTA BAR */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-2.5">
          <div className="min-w-0">
            <p className="adv-heading truncate text-sm font-bold" style={{ color: INK }}>5 Strain Probiotic+</p>
            <p className="text-xs" style={{ color: MUTE }}>From <b style={{ color: ORANGE }}>28p a day</b> · 90-day guarantee</p>
          </div>
          <a href={PRODUCT_URL} onClick={(e) => { e.preventDefault(); goToProduct("sticky"); }} className="adv-heading shrink-0 rounded-full px-6 py-3 text-sm font-extrabold text-white shadow-md" style={{ background: ORANGE }}>Get Relief →</a>
        </div>
      </div>
    </div>
  );
}
