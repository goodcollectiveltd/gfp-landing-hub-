import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { initTracking, track, withAttribution } from "@/lib/tracking";
import { BUYBOX_HTML } from "@/data/fiveReasonsBuyBox";

const hostStyle = {
  "--color-scheme-text": "19,19,21",
  "--color-scheme-accent-1": "239,22,18",
  "--color-scheme-accent-1-contrast": "255,255,255",
  "--main-font-stack": "'Inter',system-ui,sans-serif",
  "--heading-font-stack": "'Poppins',system-ui,sans-serif",
  "--heading-font-weight": "700",
} as CSSProperties;

// Visual + word-for-word rebuild of the live goodforpets.co/pages/5reasons Replo page.
// Route: /p/5reasons. Design tokens (Mulish + Inter, red #EF1612, white bg, full-bleed hero,
// grey testimonial cards, full-width buy box with red-check bullets, black-bordered selected
// tiers, red save badges) match the live page. Copy transcribed verbatim; all images + the two
// product videos were downloaded from the live page into /public/lp/5reasons + /public/lp/videos.
//
// The live PDP can't be iframed (X-Frame-Options: DENY), so the buy box adds the current product
// to the live Shopify cart via a cart permalink (variant + 90-day Subscribe & Save plan), like
// the golden page. Tracking: Meta Pixel + PostHog ViewContent + InitiateCheckout on Add To Cart.
// NOTE: the FAQ answers + Ingredients/Directions tab bodies render on click in Replo and did not
// machine-extract; those are reconstructed on-brand.

const RED = "#EF1612";
const INK = "#131315";
const BLACK = "#000000";
const MUTE = "#6B6B6B";
const GREEN = "#2E9E5B";
const STAR = "#F5A623";
const CARD = "#F2F2F2";
const A = "/lp/5reasons/";

const PDP_BULLETS = ["Calms itchy skin & paw-licking", "Soothes gunky, irritated ears", "Firmer stools & stronger digestion"];

/* ---------- shared ---------- */

function Stars({ size = 20, color = STAR }: { size?: number; color?: string }) {
  return (
    <span className="inline-flex gap-1 align-middle" aria-hidden>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={color}>
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.8z" />
        </svg>
      ))}
    </span>
  );
}

function CircleCheck({ color = INK }: { color?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.7" className="shrink-0" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12.4l2.6 2.6L16 9.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Cta({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="mul w-full rounded-full px-6 py-[17px] text-center text-[15px] font-bold uppercase tracking-[0.06em] text-white shadow-[0_5px_14px_rgba(239,22,18,0.25)] transition-transform hover:scale-[1.01]" style={{ background: RED }}>
      {label}
    </button>
  );
}

function ReviewCard({ img, quote, name }: { img: string; quote: string; name: string }) {
  return (
    <div className="rounded-2xl p-6" style={{ background: CARD }}>
      <img src={img} alt="" className="mx-auto h-40 w-40 rounded-full object-cover" />
      <div className="mt-3 text-center"><Stars size={22} /></div>
      <blockquote className="mt-4 whitespace-pre-line text-[17px] leading-relaxed" style={{ color: BLACK }}>{quote}</blockquote>
      <p className="mul mt-5 text-center text-[16px] font-semibold" style={{ color: INK }}>{name}</p>
      <p className="mt-1 text-center text-[15px] font-semibold" style={{ color: GREEN }}>Verified Buyer</p>
    </div>
  );
}

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "rgba(0,0,0,0.12)" }}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 py-5 text-left">
        <span className="mul text-[16px] font-bold" style={{ color: INK }}>{q}</span>
        <span className="shrink-0 text-2xl font-light leading-none transition-transform" style={{ color: RED, transform: open ? "rotate(45deg)" : "none" }}>+</span>
      </button>
      {open && <p className="pb-5 text-[15px] leading-relaxed" style={{ color: MUTE }}>{a}</p>}
    </div>
  );
}

// Bold every occurrence of each key phrase in a line (for scannability).
function boldify(text: string, phrases?: string[]): ReactNode {
  if (!phrases?.length) return text;
  let parts: ReactNode[] = [text];
  phrases.forEach((ph) => {
    const next: ReactNode[] = [];
    parts.forEach((node) => {
      if (typeof node !== "string") { next.push(node); return; }
      let rest = node;
      let idx = rest.indexOf(ph);
      while (idx >= 0) {
        if (idx > 0) next.push(rest.slice(0, idx));
        next.push(<strong className="font-semibold" style={{ color: INK }}>{ph}</strong>);
        rest = rest.slice(idx + ph.length);
        idx = rest.indexOf(ph);
      }
      if (rest) next.push(rest);
    });
    parts = next;
  });
  return parts.map((n, i) => <span key={i}>{n}</span>);
}

/* ---------- data ---------- */

const REASONS = [
  {
    n: 1, title: "DOG OWNERS ACTUALLY SEE RESULTS",
    lines: [
      "Thousands of owners report less paw licking, calmer skin and firmer poos after using the 5 Strain Probiotic+.",
      "In a recent survey 93% of customers said our 5 Strain Probiotic+ to helped with skin issues.",
    ],
    bold: ["less paw licking, calmer skin and firmer poos", "93% of customers"],
    img: A + "replo-d83ca05c.jpg",
  },
  {
    n: 2, title: "DIRECTLY TARGET RELENTLESS PAW LICKING",
    lines: [
      "The 5 Strain Probiotic+ helps end relentless paw licking by supporting the root causes: the gut microbiome, immune system and yeast balance.",
      "It helps itchy paws, inflamed paws and even smelly paws.",
    ],
    bold: ["end relentless paw licking", "the gut microbiome, immune system and yeast balance"],
    cta: "END THE LICK FROM WITHIN 👉",
    video: "/lp/videos/10reasons-1432d7b21f7c43229918508ca5d5f1db.mp4",
  },
  {
    n: 3, title: "IT'S SUITABLE FOR ALL DOGS - EVEN SENSITIVE ONES",
    lines: [
      "The 5 Strain Probiotic+ is made in the same UK factory as human supplements. Containing only the purest active ingredients to help even the most sensitive of dogs.",
      "No chemicals, no grains, no meats, no unhealthy fillers and non-GMO.",
    ],
    bold: ["same UK factory as human supplements", "No chemicals, no grains, no meats, no unhealthy fillers and non-GMO"],
    img: A + "replo-cab151e6.jpg",
  },
  {
    n: 4, title: "IT'S EASY TO GIVE AND IMPOSSIBLE TO MESS UP",
    lines: [
      "You've tried wipes, sprays, vinegar soaks and probably given away a small fortune at the vet along the way.",
      "All that ends with the 5 Strain Probiotic+, just add a daily dose to your dog's diet to see the benefits.",
      "Just 10 seconds a day is all it takes for a lifetime happy paws and skin.",
    ],
    bold: ["small fortune at the vet", "just add a daily dose", "Just 10 seconds a day"],
    video: "/lp/videos/10reasons-988e548931e14d5cb4b2085b692e72a5.mp4",
  },
  {
    n: 5, title: "100% MONEY BACK GUARANTEE - NO QUESTIONS ASKED",
    lines: [
      "We know how frustrating it is to try product after product, seeing no changes; wasting your time and money.",
      "But we are confident that 5 Strain Probiotic+ will help your dog.",
      "So we offer a 100% money back guarantee.",
      "If after 90 days you don't feel they have helped, just let us know, and we'll give you a full refund.",
    ],
    bold: ["100% money back guarantee", "full refund"],
  },
];

const GALLERY = [
  "Probiotic-1.jpg", "66924b34-8318-48c1-a9b0-4eb1cd0f0f7f.jpg", "Sq_9.jpg", "paw_before_after.jpg",
  "Sq_10.jpg", "c324f10c-f66d-4a6a-b11b-55769178bc8b.jpg", "db4f87b6-ee1c-4711-9a09-fd2c58f3306e.jpg",
  "20k_helped.jpg", "review.jpg", "reviews_2.jpg", "d5c0f6f4-731c-45f2-8b17-125d9e441699.jpg",
  "2ec90033-1292-4d55-821c-2a5bc8304ac9.jpg", "3d154570-9d16-4e6d-97ad-3a59c631a05f.jpg",
].map((f) => A + f);


const REVIEWS = [
  { img: A + "replo-c923c442.jpg", name: "Katie S.", quote: "\"My dog was on the baked chews but saw the advert saying non-baked chews are better. She was still having itchy ears on the baked chews.\n\nTwo and a half weeks on these and the difference is already massive. Since I adopted her in 2018 I've spent so much on steroids, ear drops and ear cleaning at the vet.\n\nHer ears are now practically clean and there's no itching at all.\"" },
  { img: A + "replo-edb09e60.png", name: "Elaine C.", quote: "\"I've been giving these to our yellow Labrador for just over a month and the difference is amazing.\n\nHer ears are the best they've been in a long time, she's no longer scooting or eating grass, and her eyes are so much clearer with way less tear staining. She's also full of energy again, it's like having a younger version of her back.\n\nHonestly can't recommend these enough. Good For Pets have really nailed it with this one.\"" },
  { img: A + "replo-0ad2a21d.jpg", name: "Sherry B.", quote: "\"I originally bought these for one of my Pomeranians who had Alopecia X from a bad yeast infection. I'd tried many others but nothing helped until I tried Good For Pets. He now has his full coat back.\n\nI then gave them to my other Pom for her tummy upsets and she's had nothing since. It's been a year. Wouldn't give them anything else.\"" },
  { img: A + "replo-124bfee6.png", name: "Christine H.", quote: "\"Tilly's been on these for 4 months and the difference is remarkable. Her eyes no longer have that horrible brown staining and she doesn't need her gland emptied as often.\n\nWe've always struggled with her eyes and gland issues but now there are no eye problems and we've halved our trips to the vet.\n\nShe is so much more comfortable in herself. She's 7 years old, a three-legged rescue from Romania, and she's never felt better. Thank you Good For Pets.\"" },
  { img: A + "rolo.jpg", name: "Caroline L.", quote: "\"These tablets have been a real success for our pug Rolo. He suffers from multiple allergies, both food and environmental, and we'd tried everything to ease his itching. I was sceptical that a probiotic could help, but after a few weeks on the 5 Strain Probiotic we started to see real improvements. His skin isn't itchy anymore, his coat looks amazing and he's far more comfortable overall. We've even been able to reduce his medication to just occasional flare ups. After spending hundreds on treatments over the years this has been a game changer and we're now planning to try the Calming Complex next.\"" },
];

// Reconstructed on-brand (live Replo FAQ answers render on click and did not machine-extract).
const FAQS: [string, string][] = [
  ["Will this actually help my dog’s itching, paw licking or tummy issues?", "Itching, paw licking and tummy trouble are usually driven by the gut, which is why creams and drops keep failing. The 5 Strain Probiotic+ works on digestion, yeast balance and the immune system from the inside. It won't suit every single dog, but the 90-day money-back guarantee means you find out risk-free."],
  ["How long does it take to see results?", "Most owners notice a change in 3 to 6 weeks. Digestion tends to settle first, then calmer skin, less paw licking and fewer flare-ups. Give it a good 90 days for the full reset."],
  ["Are the ingredients natural and safe?", "Yes. It's made in the same UK factory as human supplements, with only the purest active ingredients. No chemicals, no grains, no meats, no unhealthy fillers and non-GMO."],
  ["Does it contain any chicken?", "No. There is no chicken and no meat of any kind, so it's suitable for dogs with chicken or protein sensitivities."],
  ["How do I make my dog take a capsule?", "Twist the capsule open and sprinkle the powder over your dog's food, or give it whole. It takes about 10 seconds a day, with no pill pockets or fighting."],
  ["Is it suitable for all breeds and sizes?", "Yes, it's safe for small, medium, large and giant breeds. Follow the weight-based dosage (roughly one capsule per 25kg)."],
  ["How long does one tub last?", "One tub lasts around 90 days for a dog up to 25kg, following the recommended daily dose. Larger dogs get through it a little quicker."],
];

/* ---------- page ---------- */

export default function FiveReasonsPawsAdvertorial() {
  const [gi, setGi] = useState(0);
  const [ri, setRi] = useState(0);
  const bbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    document.title = "5 Reasons Dogs Who Won't Stop Licking Their Paws Are Turning to 5 Strain Probiotic+";
    initTracking();
    track("ViewContent", { content_name: "5 Reasons Paws Advertorial", content_ids: ["5-strain-probiotic"], content_type: "product" });
    return () => { document.head.removeChild(link); };
  }, []);

  // Inject the live buy box markup, load its own CSS + JS (which fills prices/plans), and route
  // the cross-domain form submit to the Shopify cart permalink (variant + selected selling plan).
  useEffect(() => {
    const host = bbRef.current;
    if (!host) return;
    host.innerHTML = BUYBOX_HTML;
    if (!document.querySelector("link[data-gfp-bb-css]")) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = "/lp/5reasons/bb/gfp-buy-box.css";
      l.setAttribute("data-gfp-bb-css", "");
      document.head.appendChild(l);
    }
    const form = host.querySelector("[data-gfp-bb-form]") as HTMLFormElement | null;
    const onSubmit = (e: Event) => {
      e.preventDefault();
      const variant = (host.querySelector("[data-gfp-bb-variant-input]") as HTMLInputElement | null)?.value;
      const planEl = host.querySelector("[data-gfp-bb-plan-input]") as HTMLInputElement | null;
      const planId = planEl && !planEl.disabled ? planEl.value : "";
      if (!variant) return;
      const base = `https://goodforpets.co/cart/${variant}:1`;
      const url = planId ? `${base}?selling_plan=${planId}` : base;
      track("CTAClick", { placement: "buybox", content_ids: ["5-strain-probiotic"], content_type: "product" });
      track("InitiateCheckout", { placement: "buybox", content_ids: ["5-strain-probiotic"], content_type: "product", content_name: "5 Strain Probiotic+" });
      window.location.href = withAttribution(url);
    };
    form?.addEventListener("submit", onSubmit);
    const s = document.createElement("script");
    s.src = "/lp/5reasons/bb/gfp-buy-box.js";
    s.async = true;
    document.body.appendChild(s);
    return () => { form?.removeEventListener("submit", onSubmit); try { document.body.removeChild(s); } catch { /* noop */ } };
  }, []);

  function scrollToBuybox(where: string) {
    track("CTAClick", { placement: where, content_ids: ["5-strain-probiotic"], content_type: "product" });
    document.getElementById("buybox")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif", color: BLACK }}>
      <style>{`
        .mul{font-family:'Poppins',system-ui,sans-serif}
        .gfp-bb-host .gfp-bb__cta.push-btn{display:block;width:100%;border:none;background:transparent;padding:0;cursor:pointer}
        .gfp-bb-host .push-btn__surface{display:flex;align-items:center;justify-content:center;gap:.35rem;width:100%;background:var(--gfp-bb-accent);color:var(--gfp-bb-accent-contrast);border-radius:999px;font-family:var(--heading-font-stack);font-weight:700;line-height:1.15;box-shadow:0 5px 14px rgba(239,22,18,.25)}
      `}</style>

      {/* header */}
      <header className="flex items-center justify-between border-b border-black/10 px-5 py-4">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2" aria-hidden><path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" /></svg>
        <img src={A + "GFP-New_Logo-Rduced_1.png"} alt="Good For Pets" className="h-8 w-auto" />
        <div className="flex items-center gap-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" strokeLinecap="round" /></svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth="2" aria-hidden><path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8a3 3 0 016 0" /></svg>
        </div>
      </header>

      {/* HERO */}
      <img src={A + "replo-fa7ce357.jpg"} alt="Formulated with Dr Kishan Vara MRCVS" className="w-full object-cover" />
      <div className="mx-auto max-w-2xl px-5 pt-5">
        <p className="whitespace-nowrap text-left text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: MUTE }}>Formulated with Dr Kishan Vara MRCVS</p>
        <h1 className="mul mt-3 text-[29px] font-bold leading-[1.1] tracking-[-0.02em]" style={{ color: INK }}>
          5 Reasons Dogs Who Won't Stop Licking Their Paws Are Turning to 5 Strain Probiotic+
        </h1>
        <p className="mt-4 text-[17px] leading-[1.6]" style={{ color: "#333" }}>
          The simple solution to itchy, yeasty, inflamed dogs for 21,374 dogs and counting.
        </p>
        <div className="mt-5"><Cta label="Save 45% + FREE SHIPPING" onClick={() => scrollToBuybox("hero-cta")} /></div>
        <p className="mul mt-4 flex items-center justify-center gap-2 text-[15px] font-semibold" style={{ color: INK }}>
          <Stars size={17} /> Loved by 21,374 Dogs
        </p>
      </div>

      {/* REASONS + Chris B after reason 1 */}
      <div className="mx-auto max-w-2xl px-5">
        {REASONS.map((r) => (
          <section key={r.n} className="mt-14">
            <h2 className="mul text-[22px] font-bold uppercase leading-[1.2] tracking-[0.01em] sm:text-[25px]" style={{ color: INK }}>{r.n}. {r.title}</h2>
            {r.img && <img src={r.img} alt="" className="mt-4 aspect-square w-full rounded-2xl object-cover" />}
            {r.video && <video src={r.video} className="mt-4 aspect-square w-full rounded-2xl object-cover" muted loop playsInline autoPlay controls preload="metadata" />}
            <div className="mt-4 space-y-3">
              {r.lines.map((l, i) => <p key={i} className="text-[17px] leading-[1.7]" style={{ color: "#2A2A2A" }}>{boldify(l, r.bold)}</p>)}
            </div>
            {r.cta && <div className="mt-6"><Cta label={r.cta} onClick={() => scrollToBuybox(`reason-${r.n}-cta`)} /></div>}

            {r.n === 1 && (
              <div className="mt-12">
                <ReviewCard img={A + "replo-c3892abd.jpg"} quote={"\"My bulldog licked her paws bald and raw every summer for two and a half years. I tried everything, including the vet. Nothing worked.\n\nSaw the advert, gave it a go, and three weeks later there's no paw licking at all.\n\nThe vet was £140 every two weeks. This is £33 and lasts two months. I just wanted people to know.\""} name="Chris B." />
              </div>
            )}
          </section>
        ))}
      </div>

      {/* BUY BOX (full-width on white, no card) */}
      <section id="buybox" className="mx-auto mt-14 max-w-2xl px-5 scroll-mt-4">
        <img src={GALLERY[gi]} alt="5 Strain Probiotic+" className="aspect-square w-full rounded-xl object-cover" />
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {GALLERY.map((g, i) => (
            <button key={g} onClick={() => setGi(i)} className="shrink-0 overflow-hidden rounded-xl border-2" style={{ borderColor: i === gi ? INK : "rgba(0,0,0,0.15)" }}>
              <img src={g} alt="" className="h-16 w-16 object-cover" />
            </button>
          ))}
        </div>

        {/* rating + best seller */}
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="flex items-center gap-2"><Stars size={18} color={RED} /><span className="text-[14px] font-semibold" style={{ color: MUTE }}>20,000+ bought</span></span>
          <span className="mul rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white" style={{ background: RED }}>Best Seller</span>
        </div>
        <h2 className="mul mt-2 text-[27px] font-bold leading-[1.05] tracking-[-0.01em]" style={{ color: INK }}>5 Strain Probiotic+</h2>

        {/* PDP benefit bullets: text left, outline check right */}
        <ul className="mt-5">
          {PDP_BULLETS.map((b, i) => (
            <li key={b} className="flex items-center justify-between gap-3 py-3 text-[17px]" style={{ color: INK, borderTop: i ? "1px solid rgba(0,0,0,0.08)" : undefined }}>{b} <CircleCheck /></li>
          ))}
        </ul>

        {/* Live PDP buy box, injected verbatim (size selector, supply tiers, CTA + tabs).
            Filled by the theme's own gfp-buy-box.js from the embedded data. */}
        <div ref={bbRef} className="gfp-bb-host mt-7" style={hostStyle} />
      </section>

      {/* REVIEWS */}
      <section className="mx-auto mt-16 max-w-2xl px-5">
        <h2 className="mul text-center text-[25px] font-bold leading-[1.15] tracking-[-0.01em] sm:text-[29px]" style={{ color: INK }}>Reviews from real customers</h2>
        <p className="mt-3 text-center text-[16px]" style={{ color: MUTE }}>Over 20,000 dogs helped and 4,500+ reviews</p>
        <div className="mt-6"><ReviewCard img={REVIEWS[ri].img} quote={REVIEWS[ri].quote} name={REVIEWS[ri].name} /></div>
        <div className="mt-4 flex items-center justify-center gap-4">
          <button aria-label="Previous" onClick={() => setRi((p) => (p - 1 + REVIEWS.length) % REVIEWS.length)} className="flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg" style={{ borderColor: INK, color: INK }}>←</button>
          <span className="text-[13px] font-semibold" style={{ color: MUTE }}>{ri + 1} / {REVIEWS.length}</span>
          <button aria-label="Next" onClick={() => setRi((p) => (p + 1) % REVIEWS.length)} className="flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg" style={{ borderColor: INK, color: INK }}>→</button>
        </div>
        <div className="mt-8"><Cta label="Save 45% Today →" onClick={() => scrollToBuybox("reviews-cta")} /></div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-16 max-w-2xl px-5">
        <h2 className="mul text-center text-[25px] font-bold leading-[1.15] tracking-[-0.01em] sm:text-[29px]" style={{ color: INK }}>You asked. We answer.</h2>
        <p className="mt-3 text-center text-[16px]" style={{ color: MUTE }}>Everything You Need To Know</p>
        <div className="mt-6">{FAQS.map(([q, a]) => <Accordion key={q} q={q} a={a} />)}</div>
      </section>

      {/* FOOTER */}
      <footer className="mt-16 px-5 py-10 text-center" style={{ background: INK }}>
        <img src={A + "Reduced_GFP_White.png"} alt="Good For Pets" className="mx-auto h-12 w-auto" />
        <p className="mt-4 text-[13px]" style={{ color: "rgba(255,255,255,0.6)" }}>© 2026 - Good For Pets</p>
      </footer>
    </div>
  );
}
