import { useEffect, useState } from "react";
import { initTracking, track, withAttribution } from "@/lib/tracking";

// WORD-FOR-WORD rebuild of the live goodforpets.co/pages/5reasons Replo page.
// Route: /p/5reasons. Copy is transcribed verbatim from the live page; images + the two
// product videos were downloaded from the live page into /public/lp/5reasons + /public/lp/videos.
// Self-contained (no shared data file) to stay clear of the 8-reasons fork trap. Tracking wired:
// Meta Pixel + PostHog ViewContent + InitiateCheckout on Add To Cart, withAttribution() forwards
// click ids to the Shopify PDP.
//
// NOTE: the FAQ answers and the Ingredients/Directions tab bodies did not machine-extract from
// the live Replo DOM (they render on click); those are reconstructed on-brand and marked below.

const RED = "#EF3824";     // brand red / CTAs
const NAVY = "#16223C";
const INK = "#1C1C2E";
const BODY = "#4B4B4B";
const MUTE = "#8A8A8A";
const PAGE_BG = "#F4F4F5";
const A = "/lp/5reasons/"; // asset dir

// The current product on Shopify. The PDP itself can't be iframed (X-Frame-Options:
// DENY), so the buy box adds the real product to the live Shopify cart via a cart
// permalink, exactly like the golden page (probioticPlusPage.ts). Variant + 90-day
// Subscribe & Save plan are the ≤25kg 1-tub combo; quantity carries the tub tier.
const CART_VARIANT = "57197308674392"; // 5 Strain Probiotic+ (≤25kg)
const SUB_PLAN = "693194785112";       // Subscribe & Save, delivered every 90 days
function cartUrl(qty: string, subscribe: boolean) {
  const base = `https://goodforpets.co/cart/${CART_VARIANT}:${qty}`;
  return subscribe ? `${base}?selling_plan=${SUB_PLAN}` : base;
}

/* ---------- shared ---------- */

function Stars({ size = 16, color = "#FFB100" }: { size?: number; color?: string }) {
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

function Check({ color = "#2FA84F" }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" className="shrink-0" aria-hidden>
      <circle cx="8" cy="8" r="8" fill={color} />
      <path d="M4.5 8.2l2.2 2.2L11.5 5.6" stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RedButton({ label, onClick, className = "" }: { label: string; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`adv-heading w-full rounded-full px-6 py-4 text-center text-base font-extrabold uppercase tracking-wide text-white shadow-lg transition-transform hover:scale-[1.01] ${className}`}
      style={{ background: RED }}
    >
      {label}
    </button>
  );
}

function Accordion({ q, a, open: openInit = false }: { q: string; a: string; open?: boolean }) {
  const [open, setOpen] = useState(openInit);
  return (
    <div className="border-b" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 py-5 text-left">
        <span className="adv-heading text-[15px] font-bold" style={{ color: INK }}>{q}</span>
        <span className="shrink-0 text-2xl font-light leading-none transition-transform" style={{ color: RED, transform: open ? "rotate(45deg)" : "none" }}>+</span>
      </button>
      {open && <p className="pb-5 text-[15px] leading-relaxed" style={{ color: BODY }}>{a}</p>}
    </div>
  );
}

/* ---------- data ---------- */

const REASONS = [
  {
    n: 1, title: "DOG OWNERS ACTUALLY SEE RESULTS",
    lines: [
      "Thousands of owners report less paw licking, calmer skin and firmer poos after using the 5 Strain Probiotic+.",
      "In a recent survey 93% of customers said our 5 Strain Probiotic+ to helped with skin issues.",
    ],
    img: A + "replo-d83ca05c.jpg",
  },
  {
    n: 2, title: "DIRECTLY TARGET RELENTLESS PAW LICKING",
    lines: [
      "The 5 Strain Probiotic+ helps end relentless paw licking by supporting the root causes: the gut microbiome, immune system and yeast balance.",
      "It helps itchy paws, inflamed paws and even smelly paws.",
    ],
    cta: "END THE LICK FROM WITHIN 👉",
    video: "/lp/videos/10reasons-1432d7b21f7c43229918508ca5d5f1db.mp4",
  },
  {
    n: 3, title: "IT'S SUITABLE FOR ALL DOGS - EVEN SENSITIVE ONES",
    lines: [
      "The 5 Strain Probiotic+ is made in the same UK factory as human supplements. Containing only the purest active ingredients to help even the most sensitive of dogs.",
      "No chemicals, no grains, no meats, no unhealthy fillers and non-GMO.",
    ],
    img: A + "replo-cab151e6.jpg",
  },
  {
    n: 4, title: "IT'S EASY TO GIVE AND IMPOSSIBLE TO MESS UP",
    lines: [
      "You've tried wipes, sprays, vinegar soaks and probably given away a small fortune at the vet along the way.",
      "All that ends with the 5 Strain Probiotic+, just add a daily dose to your dog's diet to see the benefits.",
      "Just 10 seconds a day is all it takes for a lifetime happy paws and skin.",
    ],
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
  },
];

const GALLERY = [
  "Probiotic-1.jpg", "66924b34-8318-48c1-a9b0-4eb1cd0f0f7f.jpg", "Sq_9.jpg", "paw_before_after.jpg",
  "Sq_10.jpg", "c324f10c-f66d-4a6a-b11b-55769178bc8b.jpg", "db4f87b6-ee1c-4711-9a09-fd2c58f3306e.jpg",
  "20k_helped.jpg", "review.jpg", "reviews_2.jpg", "d5c0f6f4-731c-45f2-8b17-125d9e441699.jpg",
  "2ec90033-1292-4d55-821c-2a5bc8304ac9.jpg", "3d154570-9d16-4e6d-97ad-3a59c631a05f.jpg",
].map((f) => A + f);

const BENEFIT_BULLETS = [
  "Soothes Paw Licking & Itchy Skin",
  "Helps Clear Gunky Ears",
  "Firmer Stools & Less Scooting",
  "Supports Healthy Yeast Balance",
];

const PLANS = [
  { key: "1", name: "1 Tub", price: "£31.49", was: "", badge: "" },
  { key: "2", name: "2 Tubs", price: "£53.54", was: "£90.00", badge: "MOST POPULAR · SAVE 15%" },
  { key: "3", name: "3 Tubs", price: "£75.58", was: "£135.00", badge: "BEST VALUE · SAVE 20%" },
];

const WHAT_TO_EXPECT = [
  "replo-af1fd2af.jpg", "replo-b927a7dc.jpg", "replo-cab151e6.jpg",
  "replo-1eb7dd54.jpg", "replo-c8459dde.jpg", "replo-b4648855.jpg",
].map((f) => A + f);

const REVIEWS = [
  {
    quote: "My dog was on the baked chews but saw the advert saying non-baked chews are better. She was still having itchy ears on the baked chews.\n\nTwo and a half weeks on these and the difference is already massive. Since I adopted her in 2018 I've spent so much on steroids, ear drops and ear cleaning at the vet.\n\nHer ears are now practically clean and there's no itching at all.",
    name: "Katie S.", img: A + "replo-c923c442.jpg",
  },
  {
    quote: "I've been giving these to our yellow Labrador for just over a month and the difference is amazing.\n\nHer ears are the best they've been in a long time, she's no longer scooting or eating grass, and her eyes are so much clearer with way less tear staining. She's also full of energy again, it's like having a younger version of her back.\n\nHonestly can't recommend these enough. Good For Pets have really nailed it with this one.",
    name: "Elaine C.", img: A + "replo-edb09e60.png",
  },
  {
    quote: "I originally bought these for one of my Pomeranians who had Alopecia X from a bad yeast infection. I'd tried many others but nothing helped until I tried Good For Pets. He now has his full coat back.\n\nI then gave them to my other Pom for her tummy upsets and she's had nothing since. It's been a year. Wouldn't give them anything else.",
    name: "Sherry B.", img: A + "replo-0ad2a21d.jpg",
  },
  {
    quote: "Tilly's been on these for 4 months and the difference is remarkable. Her eyes no longer have that horrible brown staining and she doesn't need her gland emptied as often.\n\nWe've always struggled with her eyes and gland issues but now there are no eye problems and we've halved our trips to the vet.\n\nShe is so much more comfortable in herself. She's 7 years old, a three-legged rescue from Romania, and she's never felt better. Thank you Good For Pets.",
    name: "Christine H.", img: A + "replo-124bfee6.png",
  },
  {
    quote: "These tablets have been a real success for our pug Rolo. He suffers from multiple allergies, both food and environmental, and we'd tried everything to ease his itching. I was sceptical that a probiotic could help, but after a few weeks on the 5 Strain Probiotic we started to see real improvements. His skin isn't itchy anymore, his coat looks amazing and he's far more comfortable overall. We've even been able to reduce his medication to just occasional flare ups. After spending hundreds on treatments over the years this has been a game changer and we're now planning to try the Calming Complex next.",
    name: "Caroline L.", img: A + "rolo.jpg",
  },
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
  const [weight, setWeight] = useState(0);
  const [plan, setPlan] = useState("1");
  const [sub, setSub] = useState(true);
  const [gi, setGi] = useState(0);
  const [ri, setRi] = useState(0);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    document.title = "5 Reasons Dogs Who Won't Stop Licking Their Paws Are Turning to 5 Strain Probiotic+";
    initTracking();
    track("ViewContent", { content_name: "5 Reasons Paws Advertorial", content_ids: ["5-strain-probiotic"], content_type: "product" });
    return () => { document.head.removeChild(link); };
  }, []);

  const TABS = ["Benefits", "Ingredients", "Directions & Dosage", "What to expect"];
  const rv = REVIEWS[ri];

  function scrollToBuybox(where: string) {
    track("CTAClick", { placement: where, content_ids: ["5-strain-probiotic"], content_type: "product" });
    document.getElementById("buybox")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function addToCart(where: string) {
    track("CTAClick", { placement: where, content_ids: ["5-strain-probiotic"], content_type: "product" });
    track("InitiateCheckout", { placement: where, content_ids: ["5-strain-probiotic"], content_type: "product", content_name: "5 Strain Probiotic+", num_items: Number(plan) });
    window.location.href = withAttribution(cartUrl(plan, sub));
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif", color: INK, background: PAGE_BG }}>
      <style>{`
        .adv-heading { font-family: 'Poppins', system-ui, sans-serif; }
        .adv-display { font-family: 'Poppins', system-ui, sans-serif; font-weight: 800; }
      `}</style>

      {/* header */}
      <header className="flex items-center justify-center border-b border-black/5 bg-white px-6 py-3">
        <img src={A + "GFP-New_Logo-Rduced_1.png"} alt="Good For Pets" className="h-9 w-auto sm:h-10" />
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-2xl px-5 pt-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: MUTE }}>Formulated with Dr Kishan Vara MRCVS</p>
        <h1 className="adv-display mt-3 text-[27px] leading-[1.12] sm:text-4xl" style={{ color: INK }}>
          5 Reasons Dogs Who Won't Stop Licking Their Paws Are Turning to <span style={{ color: RED }}>5 Strain Probiotic+</span>
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed" style={{ color: BODY }}>
          The simple solution to itchy, yeasty, inflamed dogs for 21,374 dogs and counting.
        </p>
        <img src={A + "replo-fa7ce357.jpg"} alt="Happy dog with 5 Strain Probiotic+" className="mt-5 w-full rounded-2xl object-cover shadow-sm" />
        <div className="mt-5"><RedButton label="Save 45% + FREE SHIPPING" onClick={() => scrollToBuybox("hero-cta")} /></div>
        <p className="mt-3 flex items-center justify-center gap-2 text-sm font-bold" style={{ color: INK }}>
          <Stars size={16} /> Loved by 21,374 Dogs
        </p>
      </section>

      {/* CHRIS B TESTIMONIAL */}
      <section className="mx-auto mt-8 max-w-2xl px-5">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <Stars size={15} />
          <blockquote className="mt-3 whitespace-pre-line text-[15px] leading-relaxed" style={{ color: BODY }}>
            {"\"My bulldog licked her paws bald and raw every summer for two and a half years. I tried everything including medication from the vet. Nothing worked.\n\nSaw the advert, thought I'd give it a go. Within a week it started working and three weeks later there's no paw licking at all.\n\nThe vet was costing me £140 every two weeks. This is £33 and lasts two months. I don't work for these guys, I just wanted people to know.\""}
          </blockquote>
          <div className="mt-4 flex items-center gap-1.5">
            <span className="adv-heading text-sm font-bold" style={{ color: INK }}>Chris B.</span>
            <Check /> <span className="text-xs font-semibold" style={{ color: MUTE }}>Verified Buyer</span>
          </div>
        </div>
      </section>

      {/* THE 5 REASONS */}
      <section className="mx-auto mt-10 max-w-2xl space-y-10 px-5">
        {REASONS.map((r) => (
          <article key={r.n}>
            <h2 className="adv-display text-2xl uppercase leading-tight" style={{ color: INK }}>
              <span style={{ color: RED }}>{r.n}.</span> {r.title}
            </h2>
            {r.img && <img src={r.img} alt="" className="mt-4 aspect-square w-full rounded-2xl object-cover shadow-sm" />}
            {r.video && (
              <video src={r.video} className="mt-4 aspect-square w-full rounded-2xl object-cover shadow-sm" muted loop playsInline autoPlay controls preload="metadata" />
            )}
            <div className="mt-4 space-y-3">
              {r.lines.map((l, i) => (
                <p key={i} className="text-[16px] leading-relaxed" style={{ color: BODY }}>{l}</p>
              ))}
            </div>
            {r.cta && <div className="mt-4"><RedButton label={r.cta} onClick={() => scrollToBuybox(`reason-${r.n}-cta`)} /></div>}
          </article>
        ))}
      </section>

      {/* BUY BOX */}
      <section id="buybox" className="mx-auto mt-12 max-w-2xl px-5 scroll-mt-4">
        <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
          {/* gallery */}
          <div className="p-4">
            <img src={GALLERY[gi]} alt="5 Strain Probiotic+" className="aspect-square w-full rounded-2xl object-cover" />
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {GALLERY.map((g, i) => (
                <button key={g} onClick={() => setGi(i)} className="shrink-0 overflow-hidden rounded-lg border-2" style={{ borderColor: i === gi ? RED : "transparent" }}>
                  <img src={g} alt="" className="h-14 w-14 object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="px-5 pb-6">
            <div className="flex items-center gap-2"><Stars size={15} /><span className="text-xs font-semibold underline" style={{ color: MUTE }}>4,537 Reviews</span></div>
            <h3 className="adv-display mt-1 text-2xl" style={{ color: INK }}>5 Strain Probiotic+</h3>
            <p className="text-sm" style={{ color: MUTE }}>Human-grade microbiome support for your dog.</p>
            <ul className="mt-4 space-y-2">
              {BENEFIT_BULLETS.map((b) => (
                <li key={b} className="flex items-center gap-2 text-[15px] font-medium" style={{ color: INK }}><Check /> {b}</li>
              ))}
            </ul>

            {/* dosage calculator */}
            <p className="adv-heading mt-6 text-sm font-bold" style={{ color: INK }}>Dog Dosage Calculator:</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {["0-25kg", "25-40kg", "40kg+"].map((w, i) => (
                <button key={w} onClick={() => setWeight(i)} className="rounded-xl border-2 py-2.5 text-sm font-bold transition-colors"
                  style={{ borderColor: weight === i ? RED : "rgba(0,0,0,0.12)", color: weight === i ? RED : INK, background: weight === i ? "#FEF0EE" : "#fff" }}>
                  {w}
                </button>
              ))}
            </div>

            {/* plans */}
            <p className="adv-heading mt-6 text-center text-sm font-extrabold uppercase tracking-wide" style={{ color: INK }}>Your 90-Day Microbiome Reset</p>
            <div className="mt-3 space-y-2.5">
              {PLANS.map((p) => (
                <button key={p.key} onClick={() => setPlan(p.key)} className="relative flex w-full items-center justify-between rounded-2xl border-2 px-4 py-3 text-left transition-colors"
                  style={{ borderColor: plan === p.key ? RED : "rgba(0,0,0,0.12)", background: plan === p.key ? "#FEF0EE" : "#fff" }}>
                  <span className="flex items-center gap-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border-2" style={{ borderColor: plan === p.key ? RED : "#CBD5E1" }}>
                      {plan === p.key && <span className="h-2.5 w-2.5 rounded-full" style={{ background: RED }} />}
                    </span>
                    <span>
                      <span className="adv-heading block text-[15px] font-bold" style={{ color: INK }}>{p.name}</span>
                      {p.badge && <span className="text-[11px] font-bold" style={{ color: RED }}>{p.badge}</span>}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="adv-heading block text-base font-extrabold" style={{ color: INK }}>{p.price}</span>
                    {p.was && <span className="text-xs line-through" style={{ color: MUTE }}>{p.was}</span>}
                  </span>
                </button>
              ))}
            </div>

            {/* subscribe toggle */}
            <div className="mt-4 space-y-2">
              <button onClick={() => setSub(true)} className="w-full rounded-2xl border-2 p-4 text-left transition-colors" style={{ borderColor: sub ? RED : "rgba(0,0,0,0.12)", background: sub ? "#FEF0EE" : "#fff" }}>
                <span className="adv-heading text-[15px] font-extrabold" style={{ color: INK }}>Subscribe &amp; Save Extra 30%</span>
                <ul className="mt-2 space-y-1 text-[13px]" style={{ color: BODY }}>
                  <li>{["0 - 25kg 1 tub (delivered every 90 days)", "25 - 40kg 1 tub (delivered every 60 days)", "40kg+ 1 tub (delivered every 45 days)"][weight]}</li>
                  <li>20% off every order after that</li>
                  <li>Free 48hr shipping on every order</li>
                  <li>Easily pause or cancel anytime</li>
                </ul>
              </button>
              <button onClick={() => setSub(false)} className="w-full rounded-2xl border-2 p-4 text-left transition-colors" style={{ borderColor: !sub ? RED : "rgba(0,0,0,0.12)", background: !sub ? "#FEF0EE" : "#fff" }}>
                <span className="adv-heading text-[15px] font-extrabold" style={{ color: INK }}>One-time purchase</span>
              </button>
            </div>

            <div className="mt-5"><RedButton label="Add To Cart" onClick={() => addToCart("buybox")} /></div>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold" style={{ color: INK }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill={NAVY} aria-hidden><path d="M8 0l6 2.5v4.2c0 4-2.6 7.6-6 9.3-3.4-1.7-6-5.3-6-9.3V2.5z" /></svg>
              90 DAY MONEY BACK GUARANTEE
            </p>
          </div>
        </div>

        {/* Julie C mini review */}
        <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
          <Stars size={14} />
          <p className="mt-2 text-[15px] leading-relaxed" style={{ color: BODY }}>I started these 2 weeks ago and today I actually saw a difference no more paw licking or chewing. I cleaned her ears out today and nothing in there either.</p>
          <p className="mt-3 text-sm font-bold" style={{ color: INK }}>- Julie C. <span className="ml-1 text-[11px] font-semibold" style={{ color: MUTE }}>VERIFIED CUSTOMER</span></p>
        </div>
      </section>

      {/* PRODUCT INFO TABS */}
      <section className="mx-auto mt-12 max-w-2xl px-5">
        <div className="flex gap-2 overflow-x-auto border-b" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} className="shrink-0 border-b-2 px-3 pb-2 pt-1 text-sm font-bold transition-colors"
              style={{ borderColor: tab === i ? RED : "transparent", color: tab === i ? RED : MUTE }}>{t}</button>
          ))}
        </div>
        <div className="pt-5 text-[15px] leading-relaxed" style={{ color: BODY }}>
          {tab === 0 && (
            <ul className="space-y-2">
              {BENEFIT_BULLETS.map((b) => <li key={b} className="flex items-center gap-2 font-medium" style={{ color: INK }}><Check /> {b}</li>)}
            </ul>
          )}
          {tab === 1 && (
            <div className="space-y-2">
              <p>A 5-strain live probiotic complex (L. plantarum, L. acidophilus, L. brevis, B. lactis, L. rhamnosus), a chicory-root prebiotic (inulin/FOS, 250mg) and a 6-enzyme digestive complex (150mg).</p>
              <p className="text-xs" style={{ color: MUTE }}>No chemicals, no grains, no meats, no unhealthy fillers, non-GMO. Made in the UK to human-supplement standard.</p>
            </div>
          )}
          {tab === 2 && (
            <div className="space-y-2">
              <p>Give one capsule per 25kg of body weight, once a day. Twist it open and sprinkle the powder over food, or give it whole. Takes about 10 seconds a day.</p>
            </div>
          )}
          {tab === 3 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {WHAT_TO_EXPECT.map((w) => <img key={w} src={w} alt="What to expect" className="h-40 w-40 shrink-0 rounded-2xl object-cover" />)}
            </div>
          )}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto mt-14 max-w-2xl px-5">
        <h2 className="adv-display text-center text-2xl sm:text-3xl" style={{ color: INK }}>Reviews from real customers</h2>
        <p className="mt-1 text-center text-sm" style={{ color: MUTE }}>Over 20,000 dogs helped and 4,500+ reviews</p>
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <Stars size={15} />
          <blockquote className="mt-2 whitespace-pre-line text-[15px] leading-relaxed" style={{ color: BODY }}>“{rv.quote}”</blockquote>
          <div className="mt-4 flex items-center gap-3">
            <img src={rv.img} alt="" className="h-11 w-11 rounded-full object-cover" />
            <span className="adv-heading flex items-center gap-1.5 text-sm font-bold" style={{ color: INK }}>{rv.name} <Check /> <span className="text-xs font-semibold" style={{ color: MUTE }}>Verified Buyer</span></span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-center gap-4">
          <button aria-label="Previous" onClick={() => setRi((p) => (p - 1 + REVIEWS.length) % REVIEWS.length)} className="flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg" style={{ borderColor: NAVY, color: NAVY }}>←</button>
          <span className="text-xs font-semibold" style={{ color: MUTE }}>{ri + 1} / {REVIEWS.length}</span>
          <button aria-label="Next" onClick={() => setRi((p) => (p + 1) % REVIEWS.length)} className="flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg" style={{ borderColor: NAVY, color: NAVY }}>→</button>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-14 max-w-2xl px-5">
        <h2 className="adv-display text-center text-2xl sm:text-3xl" style={{ color: INK }}>You asked. We answer.</h2>
        <p className="mt-1 text-center text-sm" style={{ color: MUTE }}>Everything You Need To Know</p>
        <div className="mt-6">{FAQS.map(([q, a], i) => <Accordion key={q} q={q} a={a} open={i === 0} />)}</div>
      </section>

      {/* CLOSING CTA */}
      <section className="mx-auto mt-12 max-w-2xl px-5"><RedButton label="Save 45% + FREE SHIPPING" onClick={() => scrollToBuybox("closing-cta")} /></section>

      {/* FOOTER */}
      <footer className="mt-14 px-5 py-10 text-center" style={{ background: NAVY }}>
        <img src={A + "Reduced_GFP_White.png"} alt="Good For Pets" className="mx-auto h-12 w-auto" />
        <p className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>© 2026 - Good For Pets</p>
      </footer>
    </div>
  );
}
