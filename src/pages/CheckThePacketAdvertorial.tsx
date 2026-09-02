import { Fragment, useEffect, useRef, useState } from "react";
import { initTracking, track, withAttribution } from "@/lib/tracking";

// "CHECK THE PACKET" FILLER-EXPOSE LISTICLE, 5 Strain Probiotic+. Route /p/check-the-packet.
//
// Built to the LANDING-PAGE-SOP.md, cloning the 8-reasons listicle format (numbered reasons
// + full-width image/slider + proof) but tailored to Will's filler-expose ad script:
//   hook = "don't give your dog probiotics until you've checked the back of the packet";
//   villain = fillers (glycerine/starch/grains) added to make a sellable chew, not to help;
//   answer = pure powder, 20x more good bacteria, 54% cheaper per serving, UK-vet formula,
//   51% to rescue, sold out every restock.
// Self-contained (no shared data file) to avoid the 8-reasons fork trap. Copy = Nick Theriot
// craft, real proof only, no em dashes, honest urgency. Colour system: ORANGE = CTAs only.

const ORANGE = "#EF3824"; // CTAs only
const NAVY = "#16223C";
const INK = "#1C1C2E";
const BODY = "#4B4B4B";
const MUTE = "#8A8A8A";
const PAGE_BG = "#FFFFFF"; // bright white page background (was cream)
const PRODUCT_URL = "https://goodforpets.co/products/5-strain-probiotic";

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

function Check({ color = NAVY }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" className="shrink-0" aria-hidden>
      <circle cx="8" cy="8" r="8" fill={color} />
      <path d="M4.5 8.2l2.2 2.2L11.5 5.6" stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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

function withBold(text: string, phrase?: string) {
  if (!phrase) return text;
  const i = text.indexOf(phrase);
  if (i < 0) return text;
  return (<>{text.slice(0, i)}<b style={{ color: INK }}>{phrase}</b>{text.slice(i + phrase.length)}</>);
}

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

function ReviewSlider() {
  const [i, setI] = useState(0);
  const rv = REVIEWS[i];
  const go = (d: number) => setI((p) => (p + d + REVIEWS.length) % REVIEWS.length);
  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <Stars size={15} />
        <blockquote className="mt-2 text-[15px] leading-relaxed" style={{ color: BODY }}>“{rv.quote}”</blockquote>
        <div className="mt-4 flex items-center gap-3">
          <img src={rv.img} alt="" className="h-11 w-11 rounded-full object-cover" />
          <span className="adv-heading flex items-center gap-1.5 text-sm font-bold" style={{ color: INK }}>{rv.name} <Check /></span>
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

/* ---------- content ---------- */

type Reason = {
  n: number; title: string; body: string; bold?: string; proof?: string;
  img?: string; imgAlt?: string; imgCaption?: string;
  slider?: boolean; before?: string; after?: string; beforeAlt?: string; afterAlt?: string; afterLabel?: string; caption?: string;
};

const REASONS: Reason[] = [
  {
    n: 1, title: "Most dog probiotics are packed with fillers (check the back of the packet)",
    bold: "to make a chew that's easy to sell, not to help your dog",
    body: "Glycerine, starches, grains and a list of other nasties. They aren't there for your dog. They're there to bind it into a soft chew that's easy to sell, not to help your dog. Flip the packet over and see for yourself.",
    img: "/lp/chew-squish.jpg", imgAlt: "A soft filler-bound probiotic chew squished apart between two fingers", imgCaption: "A soft chew is mostly binders and fillers. Read the label.",
    proof: "“I had my boy on the baked chews before these. These are another level completely, what a difference they've made.” · Tanya S.",
  },
  {
    n: 2, title: "So we built 5 Strain Probiotic+ completely differently",
    bold: "20× more good bacteria than standard dog probiotics",
    body: "No binders, no fillers, no grains. Just a pure powder you twist open and sprinkle over dinner. That is how we pack in 20× more good bacteria than standard dog probiotics, and get them to the gut alive.",
    img: "/lp/sprinkle-lifestyle.jpg", imgAlt: "Sprinkling the pure powder over a bowl of food", imgCaption: "A pure powder. Nothing but the good stuff.",
    proof: "“They really work. We used all sorts before and they were useless.” · Rob C.",
  },
  {
    n: 3, title: "It targets the real cause of the paw licking",
    bold: "70% of the immune system lives in the gut",
    body: "Paw licking is usually an allergic itch, not just the skin. 70% of the immune system lives in the gut, so settle the gut and the licking eases. Drag the slider:",
    slider: true, before: "/lp/paw-before.jpg", after: "/lp/paw-after.jpg",
    beforeAlt: "A dog's paw before, pink, sore and saliva-stained from licking", afterAlt: "The same paw after, calm skin with the fur grown back",
    afterLabel: "AFTER", caption: "a real customer's paw, before and after the switch",
    proof: "“My bulldog licked her paws raw for two and a half years. I tried everything. Three weeks on these and no paw licking at all.” · Chris B.",
  },
  {
    n: 4, title: "Cleaner, calmer ears, without another vet bill",
    bold: "A calmer gut helps keep both in check",
    body: "Gunky ears are usually the same allergy-and-yeast flare. A calmer gut helps keep both in check. Drag the slider:",
    slider: true, before: "/lp/ear-before-c.jpg", after: "/lp/ear-after-c.jpg",
    beforeAlt: "Dog's ear before, gunky and inflamed", afterAlt: "Dog's ear after, clean and calm",
    afterLabel: "AFTER · 3 WEEKS", caption: "Murphy's ear, before and after (real customer photo)",
    proof: "“Her ears are practically clean, no itching at all, after two and a half weeks.” · Katie S.",
  },
  {
    n: 5, title: "Calmer skin, fewer allergy flare-ups",
    bold: "Settle the gut, settle the reaction",
    body: "Itchy skin is often the immune system over-reacting on the outside. Settle the gut, settle the reaction, and the flare-ups ease. Bear's owner sent us this:",
    slider: true, before: "/lp/bear-before-c.jpg", after: "/lp/bear-after-c.jpg",
    beforeAlt: "Bear's skin before, red, raw and patchy", afterAlt: "Bear's skin after, calm, with a full coat",
    afterLabel: "AFTER", caption: "Bear's skin & coat, before and after (real customer)",
    proof: "“I was sceptical a probiotic could help, but after a few weeks his skin isn't itchy and his coat looks amazing.” · Caroline L.",
  },
  {
    n: 6, title: "No nasty extras to pay for, so it costs 54% less per serving",
    bold: "54% less per serving",
    body: "You aren't paying to turn powder into a chew. Cut out the fillers and the extra manufacturing, and the maths changes. 5 Strain Probiotic+ works out 54% less per serving than a typical chew, even though it's far stronger.",
    proof: "“The vet was £140 every two weeks, this is £33 and lasts two months.” · Chris B.",
  },
  {
    n: 7, title: "The most advanced formula on the market",
    bold: "UK vets, canine nutritionists and the latest veterinary research",
    body: "We're obsessed with helping dogs, so we built this with UK vets, canine nutritionists and the latest veterinary research. 5 clinically-backed strains, a chicory-root prebiotic and a 6-enzyme complex, in a human-supplement factory here in the UK.",
    img: "/lp/vet-kishan.jpg", imgAlt: "Dr Kishan Vara MRCVS in his veterinary clinic",
    proof: "“A genuinely proactive choice for dogs with sensitive stomachs, inflamed ears or recurring upset.” · Dr Kishan Vara, MRCVS",
  },
  {
    n: 8, title: "We sell out every restock, and we still take the risk for you",
    bold: "try it 90 days, and if you see no difference, we give you every penny back",
    body: "We've sold out every restock since launch, so this batch won't hang around. And we're so sure it helps, we take the risk. Try it 90 days, and if you see no difference, we give you every penny back.",
    img: "/lp/ugc-grid.jpg", imgAlt: "A grid of real customer dogs with 5 Strain Probiotic+",
    proof: "“Two years of vets not solving it, and within weeks his skin cleared. It ain't no scam.” · Dawn L.",
  },
];

const REVIEWS = [
  { quote: "My bulldog licked her paws bald and raw every summer for two and a half years. I tried everything including vet medication. Nothing worked. Within a week these started working, three weeks later no paw licking at all. The vet was £140 every two weeks, this is £33 and lasts two months.", name: "Chris B.", img: "/lp/review-chris-b.jpeg" },
  { quote: "My dog was on the baked chews but saw the advert saying non-baked is better. Two and a half weeks on these and the difference is already massive. Her ears are now practically clean and there's no itching at all.", name: "Katie S.", img: "/lp/review-katie-s.jpeg" },
  { quote: "A real success for our pug Rolo. He has multiple allergies and we'd tried everything. I was sceptical a probiotic could help, but after a few weeks his skin isn't itchy, his coat looks amazing and he's far more comfortable.", name: "Caroline L.", img: "/lp/review-caroline.jpg" },
  { quote: "Bought these for my Pomeranian who had Alopecia X from a bad yeast infection. I'd tried many others but nothing helped until Good For Pets. He now has his full coat back. Wouldn't give them anything else.", name: "Sherry B.", img: "/lp/review-sherry.jpeg" },
];

const TIMELINE: [string, string, string][] = [
  ["Days 0-14", "Settling in", "Softer stools at first is normal, the gut is just waking up."],
  ["Days 14-30", "First signs", "Firmer stools and less wind. You start to notice."],
  ["Days 30-60", "Real change", "Less paw licking and scratching, more comfortable in their skin."],
  ["Day 90+", "Comfortable", "Calm skin, steady digestion, a happier dog. The longer they stay on it, the better it gets."],
];

const FAQS: [string, string][] = [
  ["What's in it, and what's not?", "5 clinically-backed live strains, a chicory-root prebiotic and a 6-enzyme digestive complex. That's it. No glycerine, no starch fillers, no grains, no artificial flavours or colours, in a vegan capsule made in the UK to GMP standards."],
  ["Will this actually help my dog's itching, paw licking or ear issues?", "These symptoms are usually driven by the gut, which is why creams and drops keep failing. Because the powder is cold-processed (not baked like chews), the live cultures stay effective and work on digestion, yeast balance and skin. It won't suit every case, but the 90-day guarantee means you find out risk-free."],
  ["How long does it take to see results?", "Most owners notice changes in 3 to 6 weeks. Digestion improves first, then calmer skin, less paw licking and fewer flare-ups. Give it a good 90 days."],
  ["How do I give it to a fussy dog?", "Don't swallow it whole. Twist one capsule open and sprinkle the powder over your dog's food. No pill pockets, no fighting."],
  ["Is it suitable for all breeds and sizes?", "Yes, safe for small, medium, large and giant breeds. Follow the weight-based dosage on the product page (one capsule per 25kg)."],
];

/* ---------- page ---------- */

export default function CheckThePacketAdvertorial() {
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
    document.title = "Check the Back of the Packet, Good For Pets";
    initTracking();
    track("ViewContent", { content_name: "Check The Packet Advertorial", content_ids: ["5-strain-probiotic"], content_type: "product" });
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div className="min-h-screen pb-24" style={{ fontFamily: "'Inter', system-ui, sans-serif", color: INK, background: PAGE_BG }}>
      <style>{`
        .adv-heading { font-family: 'Poppins', system-ui, sans-serif; }
        .adv-display { font-family: 'Poppins', system-ui, sans-serif; font-weight: 800; }
      `}</style>

      {/* honest scarcity banner (real: sold out every restock) */}
      <div className="w-full px-4 py-2.5 text-center" style={{ background: NAVY }}>
        <p className="adv-heading text-sm font-extrabold uppercase tracking-wide text-white">
          ⚡ Sold out every restock, <span style={{ color: "#FFB4A8" }}>save 45% + free shipping today</span>
        </p>
      </div>

      {/* logo */}
      <header className="flex items-center justify-center border-b border-black/5 bg-white px-6 py-3">
        <img src="/lp/logo-brand.png" alt="Good For Pets" className="h-9 w-auto sm:h-10" />
      </header>

      {/* hero: byline + warning headline + dog-first UGC + subhead */}
      <section className="mx-auto max-w-2xl px-6 pt-6">
        <div className="flex items-center gap-2.5">
          <img src="/lp/vet-kishan.jpg" alt="Dr Kishan Vara MRCVS" className="h-9 w-9 rounded-full object-cover" />
          <p className="text-xs font-semibold" style={{ color: MUTE }}>By Dr Kishan Vara, MRCVS · Verified ✓ · Updated today</p>
        </div>
        <h1 className="adv-display mt-3 text-[30px] leading-[1.1] sm:text-4xl" style={{ color: INK }}>
          Don't Give Your Dog Another Probiotic Until You've <span style={{ color: ORANGE }}>Checked the Back of the Packet</span>
        </h1>
        <img src="/lp/hero-label-tubs.jpg" alt="Three different dog-probiotic tubs stacked, each ingredients label listing glycerine and fillers" className="mt-5 aspect-square w-full rounded-2xl object-cover shadow-sm" />
        <p className="mt-5 text-[17px] leading-relaxed" style={{ color: BODY }}>
          Most are packed with fillers to make them easy to sell. <span className="adv-heading font-bold" style={{ color: INK }}>Here's what to look for, and what we did differently</span> 👇
        </p>
      </section>

      {/* early CTA */}
      <div id="top-cta" className="mx-auto mt-6 max-w-2xl px-6"><Cta label="SAVE 45% + FREE SHIPPING →" where="hero-cta" /></div>

      {/* THE REASONS */}
      <section className="mx-auto mt-12 max-w-2xl space-y-10 px-6">
        {REASONS.map((r) => (
          <Fragment key={r.n}>
            <article>
              <h3 className="adv-display text-2xl uppercase leading-tight" style={{ color: INK }}>
                <span style={{ color: ORANGE }}>{r.n}.</span> {r.title}
              </h3>
              {r.slider ? (
                <div className="mt-4">
                  <BeforeAfter before={r.before!} after={r.after!} beforeAlt={r.beforeAlt!} afterAlt={r.afterAlt!} afterLabel={r.afterLabel} caption={r.caption!} />
                </div>
              ) : r.img ? (
                <div className="relative mt-4">
                  <img src={r.img} alt={r.imgAlt} className="aspect-[4/3] w-full rounded-2xl object-cover shadow-sm" />
                  {r.imgCaption && <span className="absolute bottom-3 left-3 right-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-semibold text-white">{r.imgCaption}</span>}
                </div>
              ) : null}
              <p className="mt-4 text-[17px] leading-relaxed" style={{ color: BODY }}>{withBold(r.body, r.bold)}</p>
              {r.proof && <p className="mt-3 border-l-2 pl-3 text-[15px] italic" style={{ borderColor: ORANGE, color: MUTE }}>{r.proof}</p>}
            </article>

            {/* social-proof stat bar after the 3 sliders */}
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

            {/* pure-powder comparison after the value reason */}
            {r.n === 6 && (
              <div className="!mt-8">
                <div className="grid grid-cols-3 gap-2.5 text-center text-white">
                  {[["20×", "more good bacteria"], ["100%", "pure powder, no fillers"], ["54%", "cheaper per serving"]].map(([v, l]) => (
                    <div key={l} className="rounded-2xl px-2 py-4" style={{ background: NAVY }}>
                      <div className="adv-display text-2xl leading-none sm:text-3xl" style={{ color: "#FFB4A8" }}>{v}</div>
                      <div className="mt-1.5 text-[11px] leading-tight opacity-90">{l}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-black/10 bg-white p-4">
                    <p className="adv-heading text-sm font-bold" style={{ color: MUTE }}>Typical chew</p>
                    <ul className="mt-3 space-y-2 text-[13px]" style={{ color: BODY }}>
                      {["Glycerine, starch, grains", "Baked, most bacteria dead", "1 strain", "More per real serving"].map((t) => (
                        <li key={t} className="flex items-start gap-1.5"><span style={{ color: MUTE }}>✗</span>{t}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border-2 bg-white p-4" style={{ borderColor: ORANGE }}>
                    <p className="adv-heading text-sm font-extrabold" style={{ color: INK }}>5 Strain Probiotic+</p>
                    <ul className="mt-3 space-y-2 text-[13px] font-medium" style={{ color: INK }}>
                      {["Pure powder, zero fillers", "Cold-processed, reaches the gut alive", "5 live strains", "54% cheaper per serving"].map((t) => (
                        <li key={t} className="flex items-start gap-1.5"><span style={{ color: ORANGE }}>✓</span>{t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </Fragment>
        ))}
      </section>

      {/* WHAT TO EXPECT timeline */}
      <section className="mx-auto mt-14 max-w-2xl px-6">
        <h2 className="adv-display text-center text-2xl sm:text-3xl" style={{ color: INK }}>What to expect</h2>
        <p className="mt-1 text-center text-sm" style={{ color: MUTE }}>Every dog is different, so give it the full 90 days.</p>
        <div className="mt-6 rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-6">
          {TIMELINE.map(([w, tag, d], i, arr) => (
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

      {/* BONUS charity closer */}
      <section className="mx-auto mt-14 max-w-2xl px-6">
        <div className="overflow-hidden rounded-3xl text-white shadow-md" style={{ background: NAVY }}>
          <img src="/lp/charity-rescue.png" alt="Good For Pets founder with rescue dogs" className="aspect-[4/3] w-full object-cover" style={{ objectPosition: "center 30%" }} />
          <div className="p-6 sm:p-7">
            <p className="adv-heading text-xs font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(255,255,255,0.6)" }}>Bonus</p>
            <h2 className="adv-display mt-1 text-2xl leading-tight">51% of profits go to animal welfare</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-white/85">Helping your dog helps thousands more. More than half of every order goes to rescues like Soi Dog, Jerry Green Dogs and the RSPCA. No other pet brand gives this much.</p>
          </div>
        </div>
      </section>

      {/* cost-of-inaction + mid CTA */}
      <p className="mx-auto mt-12 max-w-2xl px-6 text-center text-[17px] font-bold leading-snug" style={{ color: INK }}>
        Every week you wait is another week they're licking and scratching. The sooner they start, the sooner they settle.
      </p>
      <div className="mx-auto mt-5 max-w-2xl px-6"><Cta label="GIVE IT A RISK-FREE TRY →" where="mid-cta" /></div>

      {/* OFFER */}
      <section className="mx-auto mt-12 max-w-2xl px-6">
        <div className="overflow-hidden rounded-3xl border border-black/10 bg-white text-center shadow-xl">
          <img src="/lp/sprinkle-on-food.jpg" alt="Sprinkling the pure powder over food" className="h-48 w-full object-cover" />
          <div className="p-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: ORANGE }}>From just 28p a day</p>
            <h2 className="adv-display mt-2 text-3xl leading-tight" style={{ color: INK }}>Up to 45% off today</h2>
            <p className="mt-2 text-[15px] leading-relaxed" style={{ color: BODY }}>with free 48-hour shipping. Sold out every restock, so grab this batch before it's gone.</p>
            <a href={PRODUCT_URL} onClick={(e) => { e.preventDefault(); goToProduct("offer"); }} className="adv-heading mt-6 block w-full rounded-full py-4 text-center text-base font-extrabold uppercase tracking-wide text-white shadow-lg" style={{ background: ORANGE }}>
              Save 45% + Free Shipping →
            </a>
            <p className="mt-3 text-sm font-semibold" style={{ color: MUTE }}>Try it with our 90-day money-back guarantee.</p>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto mt-14 max-w-2xl px-6">
        <h2 className="adv-display text-center text-2xl sm:text-3xl" style={{ color: INK }}>Reviews from real customers</h2>
        <p className="mt-1 text-center text-sm" style={{ color: MUTE }}>Over 20,000 dogs helped and 4,500+ reviews</p>
        <ReviewSlider />
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-14 max-w-2xl px-6">
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
