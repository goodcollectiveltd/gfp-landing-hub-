import { useEffect, useState } from "react";
import { initTracking, track, withAttribution } from "@/lib/tracking";

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

const CART_VARIANT = "57197308674392"; // 5 Strain Probiotic+ (≤25kg)
const SUB_PLAN = "693194785112";       // Subscribe & Save, delivered every 90 days
function cartUrl(qty: string, subscribe: boolean) {
  const base = `https://goodforpets.co/cart/${CART_VARIANT}:${qty}`;
  return subscribe ? `${base}?selling_plan=${SUB_PLAN}` : base;
}

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

function RedCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" className="shrink-0" aria-hidden>
      <circle cx="8" cy="8" r="8" fill={RED} />
      <path d="M4.5 8.2l2.2 2.2L11.5 5.6" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Cta({ label, onClick, rounded = "rounded-lg" }: { label: string; onClick: () => void; rounded?: string }) {
  return (
    <button onClick={onClick} className={`mul w-full ${rounded} px-6 py-4 text-center text-[17px] font-extrabold uppercase tracking-wide text-white shadow-md transition-transform hover:scale-[1.01]`} style={{ background: RED }}>
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
      <p className="mul mt-5 text-center text-[17px] font-extrabold" style={{ color: INK }}>{name}</p>
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

const BENEFITS = ["Soothes Paw Licking & Itchy Skin", "Helps Clear Gunky Ears", "Firmer Stools & Less Scooting", "Supports Healthy Yeast Balance"];

const PLANS = [
  { key: "1", name: "1 Tub", price: "£31.49", was: "", badge: "" },
  { key: "2", name: "2 Tubs", price: "£53.54", was: "£90.00", badge: "MOST POPULAR · SAVE 15%" },
  { key: "3", name: "3 Tubs", price: "£75.58", was: "£135.00", badge: "BEST VALUE · SAVE 20%" },
];

const WHAT_TO_EXPECT = ["replo-af1fd2af.jpg", "replo-b927a7dc.jpg", "replo-cab151e6.jpg", "replo-1eb7dd54.jpg", "replo-c8459dde.jpg", "replo-b4648855.jpg"].map((f) => A + f);

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
  const [weight, setWeight] = useState(0);
  const [plan, setPlan] = useState("1");
  const [sub, setSub] = useState(true);
  const [gi, setGi] = useState(0);
  const [ri, setRi] = useState(0);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Mulish:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    document.title = "5 Reasons Dogs Who Won't Stop Licking Their Paws Are Turning to 5 Strain Probiotic+";
    initTracking();
    track("ViewContent", { content_name: "5 Reasons Paws Advertorial", content_ids: ["5-strain-probiotic"], content_type: "product" });
    return () => { document.head.removeChild(link); };
  }, []);

  function scrollToBuybox(where: string) {
    track("CTAClick", { placement: where, content_ids: ["5-strain-probiotic"], content_type: "product" });
    document.getElementById("buybox")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function addToCart(where: string) {
    track("CTAClick", { placement: where, content_ids: ["5-strain-probiotic"], content_type: "product" });
    track("InitiateCheckout", { placement: where, content_ids: ["5-strain-probiotic"], content_type: "product", content_name: "5 Strain Probiotic+", num_items: Number(plan) });
    window.location.href = withAttribution(cartUrl(plan, sub));
  }

  const TABS = ["Benefits", "Ingredients", "Directions & Dosage", "What to expect"];
  const subFreq = ["0 - 25kg 1 tub (delivered every 90 days)", "25 - 40kg 1 tub (delivered every 60 days)", "40kg+ 1 tub (delivered every 45 days)"][weight];

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif", color: BLACK }}>
      <style>{`.mul{font-family:'Mulish',system-ui,sans-serif}`}</style>

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
        <p className="text-center text-[16px] font-semibold" style={{ color: INK }}>Formulated with Dr Kishan Vara MRCVS</p>
        <h1 className="mul mt-3 text-[34px] font-extrabold leading-[1.06]" style={{ color: INK }}>
          5 Reasons Dogs Who Won't Stop Licking Their Paws Are Turning to 5 Strain Probiotic+
        </h1>
        <p className="mt-4 text-[18px] leading-relaxed" style={{ color: BLACK }}>
          The simple solution to itchy, yeasty, inflamed dogs for 21,374 dogs and counting.
        </p>
        <div className="mt-5"><Cta label="Save 45% + FREE SHIPPING" onClick={() => scrollToBuybox("hero-cta")} /></div>
        <p className="mul mt-4 flex items-center justify-center gap-2 text-[16px] font-extrabold" style={{ color: INK }}>
          <Stars size={18} /> Loved by 21,374 Dogs
        </p>
      </div>

      {/* REASONS + Chris B after reason 1 */}
      <div className="mx-auto max-w-2xl px-5">
        {REASONS.map((r) => (
          <section key={r.n} className="mt-12">
            <h2 className="mul text-[32px] font-extrabold uppercase leading-[1.08]" style={{ color: INK }}>{r.n}. {r.title}</h2>
            {r.img && <img src={r.img} alt="" className="mt-5 aspect-square w-full rounded-xl object-cover" />}
            {r.video && <video src={r.video} className="mt-5 aspect-square w-full rounded-xl object-cover" muted loop playsInline autoPlay controls preload="metadata" />}
            <div className="mt-5 space-y-4">
              {r.lines.map((l, i) => <p key={i} className="text-[19px] font-bold leading-relaxed" style={{ color: BLACK }}>{l}</p>)}
            </div>
            {r.cta && <div className="mt-6"><Cta label={r.cta} onClick={() => scrollToBuybox(`reason-${r.n}-cta`)} /></div>}

            {r.n === 1 && (
              <div className="mt-12">
                <ReviewCard img={A + "review.jpg"} quote={"\"My bulldog licked her paws bald and raw every summer for two and a half years. I tried everything including medication from the vet. Nothing worked.\n\nSaw the advert, thought I'd give it a go. Within a week it started working and three weeks later there's no paw licking at all.\n\nThe vet was costing me £140 every two weeks. This is £33 and lasts two months. I don't work for these guys, I just wanted people to know.\""} name="Chris B." />
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

        <div className="mt-5 flex items-center gap-2"><Stars size={20} color={RED} /><span className="mul text-[16px] font-extrabold" style={{ color: INK }}>4,537 Reviews</span></div>
        <h2 className="mul mt-2 text-[38px] font-extrabold leading-none" style={{ color: INK }}>5 Strain Probiotic+</h2>
        <p className="mt-3 text-[19px]" style={{ color: BLACK }}>Human-grade microbiome support for your dog.</p>

        <ul className="mt-6 space-y-3">
          {BENEFITS.map((b) => <li key={b} className="flex items-center gap-3 text-[18px] font-semibold" style={{ color: INK }}><RedCheck /> {b}</li>)}
        </ul>

        {/* dosage calculator */}
        <p className="mul mt-8 text-[22px] font-bold" style={{ color: INK }}>Dog Dosage Calculator:</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {["0-25kg", "25-40kg", "40kg+"].map((w, i) => (
            <button key={w} onClick={() => setWeight(i)} className="rounded-xl border-2 py-3 text-[16px] font-semibold transition-colors"
              style={{ borderColor: weight === i ? INK : "rgba(0,0,0,0.18)", color: INK, borderWidth: weight === i ? 3 : 2 }}>{w}</button>
          ))}
        </div>

        {/* reset divider */}
        <div className="mt-8 flex items-center gap-3">
          <span className="h-px flex-1" style={{ background: "rgba(0,0,0,0.2)" }} />
          <span className="mul text-[18px] font-extrabold uppercase" style={{ color: INK }}>Your 90-Day Microbiome Reset</span>
          <span className="h-px flex-1" style={{ background: "rgba(0,0,0,0.2)" }} />
        </div>

        {/* plans */}
        <div className="mt-5 space-y-4">
          {PLANS.map((p) => (
            <div key={p.key} className="relative">
              {p.badge && <span className="mul absolute -top-3 right-3 z-10 rounded-md px-3 py-1 text-[12px] font-extrabold uppercase text-white" style={{ background: RED }}>{p.badge}</span>}
              <button onClick={() => setPlan(p.key)} className="flex w-full items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-left"
                style={{ borderColor: plan === p.key ? INK : "rgba(0,0,0,0.15)", borderWidth: plan === p.key ? 3 : 1 }}>
                <img src={GALLERY[0]} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                <span className="mul flex-1 text-[20px] font-extrabold" style={{ color: INK }}>{p.name}</span>
                <span className="text-right">
                  <span className="mul block text-[22px] font-extrabold" style={{ color: INK }}>{p.price}</span>
                  {p.was && <span className="text-[15px] line-through" style={{ color: RED }}>{p.was}</span>}
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* subscribe / one-time */}
        <div className="mt-5 space-y-3">
          <button onClick={() => setSub(true)} className="w-full rounded-2xl border bg-white p-5 text-left" style={{ borderColor: sub ? INK : "rgba(0,0,0,0.15)", borderWidth: sub ? 3 : 1 }}>
            <span className="flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full border-2" style={{ borderColor: INK }}>{sub && <span className="h-3.5 w-3.5 rounded-full" style={{ background: INK }} />}</span>
              <span className="mul text-[19px] font-extrabold" style={{ color: INK }}>Subscribe &amp; Save Extra 30%</span>
            </span>
            <ul className="mt-3 space-y-1.5 pl-9 text-[15px]" style={{ color: MUTE }}>
              <li className="list-disc">{subFreq}</li>
              <li className="list-disc">20% off every order after that</li>
              <li className="list-disc">Free 48hr shipping on every order</li>
              <li className="list-disc">Easily pause or cancel anytime</li>
            </ul>
          </button>
          <button onClick={() => setSub(false)} className="flex w-full items-center gap-3 rounded-2xl border bg-white p-5 text-left" style={{ borderColor: !sub ? INK : "rgba(0,0,0,0.15)", borderWidth: !sub ? 3 : 1 }}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2" style={{ borderColor: !sub ? INK : "#BBB" }}>{!sub && <span className="h-3.5 w-3.5 rounded-full" style={{ background: INK }} />}</span>
            <span className="mul text-[19px] font-extrabold" style={{ color: INK }}>One-time purchase</span>
          </button>
        </div>

        <div className="mt-5"><Cta label="Add To Cart" onClick={() => addToCart("buybox")} rounded="rounded-full" /></div>
        <p className="mul mt-3 flex items-center justify-center gap-2 text-[14px] font-extrabold uppercase" style={{ color: INK }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill={INK} aria-hidden><path d="M8 0l6 2.5v4.2c0 4-2.6 7.6-6 9.3-3.4-1.7-6-5.3-6-9.3V2.5z" /></svg>
          90 Day Money Back Guarantee
        </p>

        {/* Julie C */}
        <div className="mt-6 rounded-2xl p-5" style={{ background: CARD }}>
          <Stars size={18} />
          <p className="mt-2 text-[16px] leading-relaxed" style={{ color: BLACK }}>I started these 2 weeks ago and today I actually saw a difference no more paw licking or chewing. I cleaned her ears out today and nothing in there either.</p>
          <p className="mul mt-3 text-[16px] font-extrabold" style={{ color: INK }}>- Julie C. <span className="ml-1 text-[12px] font-semibold" style={{ color: MUTE }}>VERIFIED CUSTOMER</span></p>
        </div>
      </section>

      {/* TABS */}
      <section className="mx-auto mt-14 max-w-2xl px-5">
        <div className="flex gap-4 overflow-x-auto border-b" style={{ borderColor: "rgba(0,0,0,0.12)" }}>
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)} className="mul shrink-0 border-b-2 px-1 pb-3 text-[16px] font-bold transition-colors"
              style={{ borderColor: tab === i ? RED : "transparent", color: tab === i ? INK : MUTE }}>{t}</button>
          ))}
        </div>
        <div className="pt-5 text-[16px] leading-relaxed" style={{ color: BLACK }}>
          {tab === 0 && <ul className="space-y-3">{BENEFITS.map((b) => <li key={b} className="flex items-center gap-3 font-semibold" style={{ color: INK }}><RedCheck /> {b}</li>)}</ul>}
          {tab === 1 && <div className="space-y-2"><p>A 5-strain live probiotic complex (L. plantarum, L. acidophilus, L. brevis, B. lactis, L. rhamnosus), a chicory-root prebiotic (inulin/FOS, 250mg) and a 6-enzyme digestive complex (150mg).</p><p className="text-[14px]" style={{ color: MUTE }}>No chemicals, no grains, no meats, no unhealthy fillers, non-GMO. Made in the UK to human-supplement standard.</p></div>}
          {tab === 2 && <p>Give one capsule per 25kg of body weight, once a day. Twist it open and sprinkle the powder over food, or give it whole. Takes about 10 seconds a day.</p>}
          {tab === 3 && <div className="flex gap-3 overflow-x-auto pb-1">{WHAT_TO_EXPECT.map((w) => <img key={w} src={w} alt="What to expect" className="h-44 w-44 shrink-0 rounded-2xl object-cover" />)}</div>}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto mt-16 max-w-2xl px-5">
        <h2 className="mul text-center text-[34px] font-extrabold leading-tight" style={{ color: INK }}>Reviews from real customers</h2>
        <p className="mt-3 text-center text-[18px]" style={{ color: BLACK }}>Over 20,000 dogs helped and 4,500+ reviews</p>
        <div className="mt-6"><ReviewCard img={REVIEWS[ri].img} quote={REVIEWS[ri].quote} name={REVIEWS[ri].name} /></div>
        <div className="mt-4 flex items-center justify-center gap-4">
          <button aria-label="Previous" onClick={() => setRi((p) => (p - 1 + REVIEWS.length) % REVIEWS.length)} className="flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg" style={{ borderColor: INK, color: INK }}>←</button>
          <span className="text-[13px] font-semibold" style={{ color: MUTE }}>{ri + 1} / {REVIEWS.length}</span>
          <button aria-label="Next" onClick={() => setRi((p) => (p + 1) % REVIEWS.length)} className="flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg" style={{ borderColor: INK, color: INK }}>→</button>
        </div>
        <div className="mt-8"><Cta label="Save 45% Today →" onClick={() => scrollToBuybox("reviews-cta")} rounded="rounded-full" /></div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-16 max-w-2xl px-5">
        <h2 className="mul text-center text-[34px] font-extrabold leading-tight" style={{ color: INK }}>You asked. We answer.</h2>
        <p className="mt-3 text-center text-[18px]" style={{ color: BLACK }}>Everything You Need To Know</p>
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
