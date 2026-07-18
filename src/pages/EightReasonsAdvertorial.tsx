import { Fragment, useEffect, useRef, useState } from "react";
import { initTracking, track, withAttribution } from "@/lib/tracking";

// "8 REASONS" LISTICLE ADVERTORIAL, 5 Strain Probiotic+ sprinkle capsules. Route /p/8-reasons.
//
// Structure (mentor restructure, promoted live 17 Jul 2026):
//  - Agitating opening that names the failed-med carousel and lifts the guilt.
//  - The 8 reasons are DISTINCT persuasive moves, not eight benefits in a row:
//    agitate the current solution → new mechanism → proof (3 sliders) → authority →
//    ease/objection → risk reversal. (listicles.md: back half = the conversion stack.)
//  - Mechanism leads on MOISTURE (self-verifying: an owner can feel a chew is moist,
//    whereas "baked" is an unverifiable claim); heat is the backup point.
//  - Charity is a late "bonus" block (personas.md: it's Sue's closer, not an opener).
//  - Real "what to expect" 90-day timeline (product-and-range-reference.md) to cut
//    Sue's #1 churn ("3 months in, still waiting").
//  - HONEST urgency only — the real 30%-off-first-tub price lock, genuine volume
//    savings, cost-of-waiting. No fabricated timers/scarcity (ASA + brand-voice.md).
//
// Colour system: ORANGE = CTAs only; NAVY = secondary blocks; cream bg.
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
  img?: string; imgAlt?: string; pos?: string; seal?: boolean; imgCaption?: string;
  slider?: boolean; before?: string; after?: string; beforeAlt?: string; afterAlt?: string; afterLabel?: string; caption?: string; aspect?: string;
  proof?: string; bold?: string;
};

/** Bold one key phrase inside a reason body so skimmers catch the point. */
function withBold(text: string, phrase?: string) {
  if (!phrase) return text;
  const i = text.indexOf(phrase);
  if (i < 0) return text;
  return (<>{text.slice(0, i)}<b style={{ color: INK }}>{phrase}</b>{text.slice(i + phrase.length)}</>);
}

// V2 (mentor restructure): each reason is a different persuasive move, not eight
// benefits in a row. Arc = agitate the current solution → new mechanism → proof
// (the 3 before/after sliders, our click-magnets) → authority → ease/objection →
// risk reversal. Charity moved OUT of the list to a late "bonus" (Sue = closer,
// per personas.md), and a real "what to expect" timeline + honest-urgency offer
// added below. Grounded in personas.md, listicles.md, product-and-range-reference.md.
const REASONS: Reason[] = [
  {
    n: 1, title: "Most probiotic chews are dead before your dog even gets one (here's how you can tell)", bold: "moisture kills the bacteria in the tub", proof: "“I had my boy on the baked chews before these. These are another level completely, what a difference they've made.” · Tanya S.",
    body: "That softness is moisture, and moisture kills the bacteria in the tub, dead before your dog gets one. Big brands sell chews anyway, a soft treat sells easier than a capsule. You weren't failing them. You were sold the easy option.",
    img: "/lp/chew-squish.jpg", imgAlt: "A soft, damp probiotic chew being squished apart between two fingers", pos: "center", imgCaption: "Squeeze one, it's soft and damp. That's the moisture that kills the probiotics.",
  },
  {
    n: 2, title: "Ours is bone-dry, so nothing wakes the bacteria early", bold: "all 5 billion reach the gut alive", proof: "“They really work. We used all sorts before and they were useless.” · Rob C.",
    body: "A dry capsule of powder. Nothing wakes the bacteria early, so all 5 billion reach the gut alive, 5× a typical chew. The enzymes and prebiotic firm up stools and cut the wind. A sprinkle, not a treat.",
    img: "/lp/sprinkle-lifestyle.jpg", imgAlt: "Sprinkling the dry capsule powder over a bowl of food in the kitchen", pos: "center",
  },
  {
    n: 3, title: "It targets the real cause of the paw licking", bold: "70% of the immune system lives in the gut",
    body: "Paw licking is usually an allergic itch, not just the skin. 70% of the immune system lives in the gut, so calm that and the licking eases. Drag the slider:",
    slider: true, before: "/lp/paw-before.jpg", after: "/lp/paw-after.jpg",
    beforeAlt: "A dog's paw before, pink, sore, saliva-stained from licking", afterAlt: "The same paw after, calm skin with the fur grown back",
    afterLabel: "AFTER", caption: "a real customer's paw, before and after the switch",
    proof: "“My bulldog licked her paws raw for two and a half years. I tried everything. Three weeks on these and no paw licking at all.” · Chris B.",
  },
  {
    n: 4, title: "Cleaner, calmer ears, without another vet bill", bold: "A calmer gut helps keep both in check",
    body: "Gunky ears are usually the same allergy-and-yeast flare. A calmer gut helps keep both in check. Drag the slider:",
    slider: true, before: "/lp/ear-before-c.jpg", after: "/lp/ear-after-c.jpg",
    beforeAlt: "Dog's ear before, gunky and inflamed", afterAlt: "Dog's ear after, clean and calm",
    afterLabel: "AFTER · 3 WEEKS", caption: "Murphy's ear, before and after (real customer photo)",
    proof: "“Her ears are practically clean, no itching at all, after two and a half weeks.” · Katie S.",
  },
  {
    n: 5, title: "Calms itchy, irritated skin and coat", bold: "Settle the gut, settle the reaction",
    body: "Itchy skin is often the immune system over-reacting on the outside. Settle the gut, settle the reaction. Bear's owner sent us this:",
    slider: true, before: "/lp/bear-before-c.jpg", after: "/lp/bear-after-c.jpg",
    beforeAlt: "Bear's skin before, red, raw and patchy", afterAlt: "Bear's skin after, calm, with a full coat",
    afterLabel: "AFTER", caption: "Bear's skin & coat, before and after (real customer, Chris S.)",
    proof: "“I was sceptical a probiotic could help, but after a few weeks his skin isn't itchy and his coat looks amazing.” · Caroline L.",
  },
  {
    n: 6, title: "Vet-developed, made in a UK human-supplement factory", bold: "Made to actually work",
    body: "5 billion live cultures, 5 different strains. Built in partnership with Dr Kishan Vara MRCVS, and produced in a human supplement factory here in the UK. Made to actually work.",
    img: "/lp/vet-kishan.jpg", imgAlt: "Dr Kishan Vara MRCVS in his veterinary clinic", pos: "center",
    proof: "“A genuinely proactive choice for dogs with sensitive stomachs, inflamed ears or recurring upset.” · Dr Kishan Vara, MRCVS",
  },
  {
    n: 7, title: "Small enough to open and sprinkle in seconds", bold: "No pill pockets, no crushing",
    body: "Twist one open and sprinkle over dinner. No pill pockets, no crushing, no fighting a fussy dog. They don't even notice.",
    img: "/lp/capsule-open.jpg", imgAlt: "Twisting a sprinkle capsule open over a bowl of food", pos: "center",
    proof: "“I just sprinkle it on his food and he eats it, no problem.” · Jazzy D.",
  },
  {
    n: 8, title: "It's not magic, but we'll take the risk for you", bold: "we give you every penny back", proof: "“Two years of vets not solving it, and within weeks his skin cleared. It ain't no scam.” · Dawn L.",
    body: "It won't suit every dog, and we'll say so. But we're so sure it helps, we take the risk: try it 90 days, and if you see no difference, we give you every penny back.",
    img: "/lp/ugc-grid.jpg", imgAlt: "A grid of real customer dogs with 5 Strain Probiotic+", pos: "center",
  },
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
  ["Is it suitable for all breeds and sizes?", "Yes, safe for small, medium, large and giant breeds. Just follow the weight-based dosage on the product page (one capsule per 25kg)."],
  ["How long does one tub last?", "Each tub has 90 capsules. Most dogs take one a day, so a tub lasts 90 days. Larger dogs take two or three a day."],
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

export default function EightReasonsAdvertorial() {
  // Sticky bar reveals only once the top CTA has scrolled off-screen, so the two
  // CTAs never fight in the hero.
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const el = document.getElementById("reasons-anchor");
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
    document.title = "8 Reasons UK Dog Parents Are Switching, Good For Pets";
    initTracking();
    track("ViewContent", { content_name: "8 Reasons Advertorial", content_ids: ["5-strain-probiotic"], content_type: "product" });
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
        <h1 className="adv-display mt-2 text-[30px] leading-[1.1] sm:text-4xl" style={{ color: INK }}>
          How 20,000+ Dog Owners Fixed <span style={{ color: ORANGE }}>Itching, Ear Gunk &amp; Paw Licking</span> (Without Another Vet Visit)
        </h1>
      </div>

      {/* single angle: headline → mechanism reveal → the 8 reasons (no hero clutter) */}
      <section id="reasons-anchor" className="mx-auto mt-6 max-w-2xl px-6">
        <p className="text-base leading-relaxed" style={{ color: BODY }}>
          Once you see how a chew is actually made, you can't unsee it. <span className="adv-heading font-bold" style={{ color: INK }}>Here are the 8 reasons they switched</span> 👇
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
                {r.imgCaption && (
                  <span className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-semibold text-white">{r.imgCaption}</span>
                )}
                {r.seal && (
                  <svg width="118" height="118" viewBox="0 0 120 120" aria-hidden className="absolute left-4 top-4 drop-shadow-lg">
                    <defs><path id="sealTop" d="M18 62 A 42 42 0 0 1 102 62" /></defs>
                    {[...Array(32)].map((_, i) => {
                      const a = (i / 32) * Math.PI * 2;
                      return <circle key={i} cx={60 + Math.cos(a) * 52} cy={60 + Math.sin(a) * 52} r="5.2" fill={NAVY} />;
                    })}
                    <circle cx="60" cy="60" r="50" fill={NAVY} />
                    <circle cx="60" cy="60" r="43" fill="none" stroke={ORANGE} strokeWidth="1.6" />
                    <text fill="#fff" fontSize="7.3" fontWeight="700" letterSpacing="0.7" fontFamily="Poppins, sans-serif">
                      <textPath href="#sealTop" startOffset="50%" textAnchor="middle">MONEY-BACK GUARANTEE</textPath>
                    </text>
                    <text x="60" y="74" textAnchor="middle" fill={ORANGE} fontSize="36" fontWeight="900" fontFamily="Poppins, sans-serif">90</text>
                    <text x="60" y="90" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="800" letterSpacing="4" fontFamily="Poppins, sans-serif">DAYS</text>
                  </svg>
                )}
              </div>
            ) : null}
            <p className="mt-4 text-[17px] leading-relaxed" style={{ color: BODY }}>{withBold(r.body, r.bold)}</p>
            {r.proof && <p className="mt-3 border-l-2 pl-3 text-[15px] italic" style={{ borderColor: ORANGE, color: MUTE }}>{r.proof}</p>}
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
        <div className="mt-6 rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
          {[
            ["Days 0–14", "Settling in", "Softer stools at first is normal, the gut is just waking up."],
            ["Days 14–30", "First signs", "Firmer stools and less wind. You start to notice."],
            ["Days 30–60", "Real change", "Less paw licking and scratching, more comfortable in their skin."],
            ["Day 90+", "Comfortable", "Calm skin, steady digestion, a happier dog. The longer they stay on it, the better it gets."],
          ].map(([w, tag, d], i, arr) => (
            <div key={w} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: ORANGE }} />
                {i < arr.length - 1 && <span className="my-1 w-0.5 flex-1" style={{ background: "rgba(22,34,60,0.15)" }} />}
              </div>
              <div className={i < arr.length - 1 ? "pb-6" : ""}>
                <p className="adv-heading text-[15px] font-bold leading-tight" style={{ color: INK }}>{w} · <span style={{ color: NAVY }}>{tag}</span></p>
                <p className="mt-1 text-[16px] leading-snug" style={{ color: BODY }}>{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BONUS — charity as the warm closer (personas.md: rarely opens the sale, repeatedly seals it) */}
      <section className="mx-auto mt-14 max-w-2xl px-6">
        <div className="overflow-hidden rounded-3xl text-white shadow-md" style={{ background: NAVY }}>
          <img src="/lp/charity-rescue.png" alt="Good For Pets founder with rescue dogs" className="aspect-[4/3] w-full object-cover" style={{ objectPosition: "center 30%" }} />
          <div className="p-6 sm:p-7">
            <p className="adv-heading text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.6)" }}>Bonus</p>
            <h2 className="adv-display mt-1 text-2xl leading-tight">51% of profits go to animal rescue</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-white/85">Helping your dog helps thousands more, recent donations to Soi Dog, Jerry Green Dogs and the RSPCA. No other pet brand gives this much.</p>
          </div>
        </div>
      </section>

      {/* honest cost-of-inaction (Nick: create urgency in the desire), then mid CTA */}
      <p className="mx-auto mt-12 max-w-2xl px-6 text-center text-[17px] font-bold leading-snug" style={{ color: INK }}>
        Every week you wait is another week they're licking and scratching. The sooner they start, the sooner they settle.
      </p>
      <div className="mx-auto mt-5 max-w-2xl px-6"><Cta label="GIVE IT A RISK-FREE TRY →" where="mid-cta" /></div>

      {/* OFFER block — tight: "up to 45% off" is the real max (30% first-sub + 15% for 3 tubs off RRP) */}
      <section className="mx-auto mt-12 max-w-2xl px-6">
        <div className="overflow-hidden rounded-3xl border border-black/5 bg-white text-center shadow-xl">
          <img src="/lp/sprinkle-on-food.jpg" alt="Sprinkling the capsule over food" className="h-48 w-full object-cover" />
          <div className="p-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: ORANGE }}>From just 28p a day</p>
            <h2 className="adv-display mt-2 text-3xl leading-tight" style={{ color: INK }}>Up to 45% off today</h2>
            <p className="mt-2 text-[15px] leading-relaxed" style={{ color: BODY }}>with free 48-hour shipping.</p>
            <a href={PRODUCT_URL} onClick={(e) => { e.preventDefault(); goToProduct("offer"); }} className="adv-heading mt-6 block w-full rounded-full py-4 text-center text-base font-extrabold uppercase tracking-wide text-white shadow-lg" style={{ background: ORANGE }}>
              Save 45% + Free Shipping →
            </a>
            <p className="mt-3 text-sm font-semibold" style={{ color: MUTE }}>Try it with our 90-day money-back guarantee.</p>
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

      {/* STICKY CTA BAR — hidden until the top CTA scrolls away (no clash in the hero) */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 backdrop-blur transition-transform duration-300" style={{ transform: showSticky ? "translateY(0)" : "translateY(110%)" }}>
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="adv-heading truncate text-sm font-bold" style={{ color: INK }}>5 Strain Probiotic+</p>
            <p className="truncate text-xs" style={{ color: MUTE }}>From <b style={{ color: ORANGE }}>28p a day</b></p>
          </div>
          <a href={PRODUCT_URL} onClick={(e) => { e.preventDefault(); goToProduct("sticky"); }} className="adv-heading shrink-0 rounded-full px-8 py-4 text-base font-extrabold text-white shadow-md" style={{ background: ORANGE }}>Save 45% →</a>
        </div>
      </div>
    </div>
  );
}
