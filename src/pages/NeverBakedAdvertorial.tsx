import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { initTracking, track, withAttribution } from "@/lib/tracking";

// /p/never-baked: lander for the "Burning" video batch (Will to camera: "Burning people kills them...
// probiotics are live bacteria... brands bake them"). Founder voice, Will Rushmere. Same bones and length as
// /p/pablo-v2:
//   screen 1  continue the ad's sentence: probiotics are alive, so why are most of them baked
//   screen 2  heat kills the bacteria (claim on file, cards/ad-craft.md: baked, up to 90%), the moist chew
//   screen 3  ours is never heat-processed, so it arrives alive; Kishan; us-vs-them; first CTA
//   segment 2 not full of filler: the real rival label, pure powder
//   then      20,000+ switched, verbatim vs-baked reviews (T15, T10 shortened, T39), offer, FAQ, sign-off
// Facts: CF99045 label (5bn CFU, 5 named strains, chicory inulin first, 6 enzymes; never say "1 ingredient").
// Rival label = image-bank chew-label-composition.png (2bn per 2 chews, 3 strains, potato starch first).
// Founder: brother's ulcerative colitis helped by probiotics is why probiotics (CLAUDE.md, confirmed).
// No scarcity line here (nothing confirms a batch count for this page). Tracking: PostHog only (hard line 6).

const PAGE = "never-baked";
const RED = "#EF3824";
const NAVY = "#282C5F";
const INK = "#1C1C2E";
const BODY = "#45474F";
const MUTE = "#8A8A8A";
const CREAM = "#F3EDE5";
const PRODUCT_URL = "https://goodforpets.co/products/5-strain-probiotic";

function goToProduct(placement: string) {
  track("CTAClick", { placement, page: PAGE });
  window.location.href = withAttribution(PRODUCT_URL);
}

const STAR_PATH = "M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.8z";
function Stars({ size = 15, rating = 5 }: { size?: number; rating?: number }) {
  return (
    <span className="inline-flex gap-0.5 align-middle" aria-hidden>
      {[...Array(5)].map((_, i) => {
        const fill = Math.max(0, Math.min(1, rating - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox="0 0 20 20" fill="#E4DDD3" className="absolute inset-0"><path d={STAR_PATH} /></svg>
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <svg width={size} height={size} viewBox="0 0 20 20" fill={RED}><path d={STAR_PATH} /></svg>
            </span>
          </span>
        );
      })}
    </span>
  );
}

function Cta({ label, where, note = "90-day money-back guarantee · From 28p a day" }: { label: string; where: string; note?: string }) {
  return (
    <div>
      <a
        href={PRODUCT_URL}
        onClick={(e) => { e.preventDefault(); goToProduct(where); }}
        className="adv-heading block w-full whitespace-nowrap rounded-full py-4 text-center text-[15px] font-bold uppercase tracking-wide text-white shadow-lg"
        style={{ background: RED }}
      >
        {label}
      </a>
      <p className="mt-2.5 text-center text-[12.5px] font-semibold" style={{ color: MUTE }}>
        {note}
      </p>
    </div>
  );
}

function H2({ children }: { children: ReactNode }) {
  return <h2 className="adv-display mt-10 text-[23px] leading-[1.2]" style={{ color: INK }}>{children}</h2>;
}

function P({ children }: { children: ReactNode }) {
  return <p className="mt-3.5 text-[17px] leading-[1.6]" style={{ color: BODY }}>{children}</p>;
}

function B({ children }: { children: ReactNode }) {
  return <b style={{ color: INK }}>{children}</b>;
}

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
      <button onClick={() => setOpen(!open)} className="flex min-h-[48px] w-full items-center justify-between gap-4 py-4 text-left">
        <span className="adv-heading text-[16px] font-bold" style={{ color: INK }}>{q}</span>
        <span className="shrink-0 text-2xl font-light leading-none transition-transform" style={{ color: RED, transform: open ? "rotate(45deg)" : "none" }}>+</span>
      </button>
      {open && <p className="pb-4 text-[15px] leading-relaxed" style={{ color: BODY }}>{a}</p>}
    </div>
  );
}

// Us vs a typical chew. Heat row leads, because it's this page's argument; the rest are from the two labels.
type VsRow = { label: string; basis?: string; them: string; us: string; badge: string; themBad?: boolean; why: string };
const VS_ROWS: VsRow[] = [
  { label: "Heat-processed", them: "Baked", us: "Never", badge: "Stays alive", themBad: true,
    why: "Heat kills live bacteria. Most chews are baked to set them. Ours never goes near heat, so the bacteria reach your dog alive." },
  { label: "Live bacteria", basis: "per chew vs per capsule", them: "1 billion", us: "5 billion", badge: "400% more",
    why: "The chew label we bought says 2 billion for 2 chews, so 1 billion each, counted before the heat. Every capsule of ours carries 5 billion." },
  { label: "Probiotic strains", them: "3", us: "5 named", badge: "67% more",
    why: "Different strains do different jobs in the gut. Ours lists all five by name on the label." },
  { label: "Starch and flour fillers", them: "5", us: "None", badge: "Filler-free", themBad: true,
    why: "Potato starch, garbanzo flour, pea flour, tapioca starch and coconut flour bulk the chew out. Ours has none of them." },
  { label: "Glycerine", them: "Yes", us: "None", badge: "Kept dry", themBad: true,
    why: "Glycerine keeps a chew soft and moist. Live bacteria last best kept dry, which is why ours is a powder in a sealed capsule." },
  { label: "Digestive enzymes", them: "None", us: "Included", badge: "Only ours", themBad: true,
    why: "Ours adds six digestive enzymes to help break down food. The chew label lists none." },
];

// Verbatim (cards/proof.md: shortening is fine, never add words). T15 Katie Swales, T10 Tanya Smith, T39 Chris B.
const REVIEWS: { quote: string; name: string; dog?: string; img?: string }[] = [
  {
    quote: "My dog was on the baked chews but saw the advert saying none baked chews are better. She was still having itchy ears on the baked chews. Been on these for about 2 and a half weeks and saw a massive difference already… her ears are practically clean and no itching at all",
    name: "Katie S.", dog: "Shih Tzu", img: "/lp/review-sherry.jpeg",
  },
  {
    quote: "These are brilliant! I had my boy on said baked prior to seeing these and the slightly helped his ear problems. These are another level completely. What a difference they have made.",
    name: "Tanya S.", img: "/lp/avatar-tanya.webp",
  },
  {
    quote: "My bulldog licked her paws bald and raw every summer for two and a half years. I tried everything including medication from the vet. Nothing worked… Within a week it started working and three weeks later there's no paw licking at all.",
    name: "Chris B.", dog: "Bulldog", img: "/lp/review-chris-b.jpeg",
  },
];

const FAQS: [string, string][] = [
  ["Is it really never heated?", "Never baked and never heat-processed. The bacteria go in as a dry powder and stay sealed in the capsule until you twist it open over your dog's dinner."],
  ["What's in it, and what's not?", "Every capsule has 5 billion live bacteria from 5 named strains, chicory inulin (a natural prebiotic) and a complex of six digestive enzymes. The capsule shell is plant cellulose, and the label's Additives list a little natural chicken flavouring plus magnesium stearate and silicon dioxide to help the powder flow. No starch, no glycerine, no flours, no grains. Made in the UK to GMP standards."],
  ["How long until I see a difference?", "Skin, paws and ears usually take 4 to 8 weeks, and some dogs 12 to 14. Judge it over 90 days, and if it doesn't help, you get a full refund."],
];

function VersusCard() {
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const cols = "grid grid-cols-[36%_29%_35%]";
  return (
    <div ref={ref} className="mt-6">
      <div className="relative">
        {/* the raised "ours" column */}
        <div className="pointer-events-none absolute -bottom-2 -top-2 right-0 w-[35%] rounded-2xl shadow-lg" style={{ background: NAVY }} aria-hidden />

        <div className={`relative ${cols} items-end pb-3`}>
          <div />
          <div className="flex flex-col items-center gap-1.5 px-1 text-center">
            <img src="/lp/pablo-v2/chews.jpg" alt="" className="h-10 w-10 rounded-full object-cover opacity-80" />
            <span className="text-[12px] font-semibold leading-tight" style={{ color: MUTE }}>Typical chew</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-1 pt-1 text-center">
            <img src="/lp/pablo-v2/tub-icon.png" alt="" className="h-12 w-auto" />
            <span className="adv-heading text-[12.5px] font-bold leading-tight text-white">5 Strain Probiotic+</span>
          </div>
        </div>

        {VS_ROWS.map((r, i) => (
          <button
            key={r.label}
            type="button"
            onClick={() => { setOpen(open === i ? null : i); track("CompareRow", { row: r.label, page: PAGE }); }}
            className={`relative ${cols} w-full items-center border-t py-3.5 text-left transition-all duration-500 ease-out`}
            style={{ borderColor: "#EAE4DB", opacity: shown ? 1 : 0, transform: shown ? "none" : "translateY(10px)", transitionDelay: `${i * 90}ms` }}
            aria-expanded={open === i}
          >
            <span className="pr-2">
              <span className="adv-heading block text-[14px] font-semibold leading-tight" style={{ color: INK }}>{r.label}</span>
              {r.basis && <span className="mt-0.5 block text-[11px] leading-tight" style={{ color: MUTE }}>{r.basis}</span>}
            </span>
            <span className="flex items-center justify-center gap-1 px-1 text-center text-[13.5px] leading-tight" style={{ color: r.themBad ? "#B4483A" : BODY }}>
              {r.themBad && <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden className="shrink-0"><path d="M4 4l8 8M12 4l-8 8" stroke="#B4483A" strokeWidth="2.4" strokeLinecap="round" /></svg>}
              {r.them}
            </span>
            <span className="flex flex-col items-center gap-1 px-1 text-center">
              <span className="adv-heading text-[14.5px] font-bold leading-tight text-white">{r.us}</span>
              <span className="adv-heading rounded-full px-2 py-0.5 text-[10.5px] font-bold text-white transition-transform duration-500"
                style={{ background: RED, transform: shown ? "scale(1)" : "scale(0.6)", transitionDelay: `${i * 90 + 250}ms` }}>
                {r.badge}
              </span>
            </span>
            {open === i && (
              <span className="col-span-3 mt-3 block rounded-lg px-3 py-2.5 text-[13px] leading-snug" style={{ background: CREAM, color: INK, marginRight: "36%" }}>
                {r.why}
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="mt-5 text-center text-[12px] font-semibold" style={{ color: MUTE }}>Tap any row to see why it matters</p>
    </div>
  );
}

function ReviewCard({ quote, name, dog, img }: { quote: string; name: string; dog?: string; img?: string }) {
  return (
    <figure className="rounded-2xl border bg-white p-5" style={{ borderColor: "#E6E0D7" }}>
      <div className="flex items-center gap-3">
        {img
          ? <img src={img} alt={`${name}'s dog`} className="h-12 w-12 shrink-0 rounded-full object-cover" />
          : <span className="adv-display flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[18px] text-white" style={{ background: NAVY }}>{name[0]}</span>}
        <div className="min-w-0">
          <p className="adv-heading text-[15px] font-semibold leading-tight" style={{ color: INK }}>{name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[12px] font-medium" style={{ color: "#2F7D4F" }}>
            <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden><circle cx="8" cy="8" r="8" fill="#2F7D4F" /><path d="M4.6 8.3l2.2 2.2 4.6-4.8" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Verified buyer {dog && <span style={{ color: MUTE }}>&middot; {dog}</span>}
          </p>
        </div>
        <span className="ml-auto self-start"><Stars size={13} /></span>
      </div>
      <blockquote className="mt-3.5 text-[15.5px] leading-[1.6]" style={{ color: INK }}>&ldquo;{quote}&rdquo;</blockquote>
    </figure>
  );
}

export default function NeverBakedAdvertorial() {
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    document.title = "Why most dog probiotics are baked, Good For Pets";
    initTracking();
    return () => { document.head.removeChild(link); };
  }, []);

  // sticky CTA once the first in-page CTA is above the screen (scroll check, as on pablo-v2)
  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById("first-cta");
      setShowSticky(!!el && el.getBoundingClientRect().bottom < 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white pb-24" style={{ fontFamily: "'Inter', system-ui, sans-serif", color: INK }}>
      <style>{`
        .adv-heading { font-family: 'Poppins', system-ui, sans-serif; }
        .adv-display { font-family: 'Poppins', system-ui, sans-serif; font-weight: 700; letter-spacing: -0.015em; }
      `}</style>

      <article className="mx-auto max-w-xl px-5 pt-5">
        {/* byline */}
        <div className="flex items-center gap-2.5">
          <img src="/lp/never-baked/will-avatar.jpg" alt="Will Rushmere" className="h-9 w-9 shrink-0 rounded-full object-cover" />
          <p className="text-[12.5px] font-semibold" style={{ color: MUTE }}>By Will Rushmere · Founder, Good For Pets</p>
        </div>

        {/* screen 1: finish the ad's sentence */}
        <h1 className="adv-display mt-3 text-[26px] leading-[1.14]" style={{ color: INK }}>
          Probiotics are alive. <span style={{ color: RED }}>So why are most dog probiotics baked?</span>
        </h1>
        <p className="mt-3 text-[16.5px] leading-[1.55]" style={{ color: BODY }}>
          If your dog has been on probiotic chews for months and they're still scratching, still licking their paws raw, it isn't you. It's what happens to the chew before it ever reaches your cupboard.
        </p>

        <figure className="mt-4">
          <img src="/lp/chew-squish.jpg" alt="A probiotic chew broken in half" className="aspect-[4/3] w-full rounded-xl object-cover" />
          <figcaption className="mt-1.5 text-[12.5px] font-semibold" style={{ color: MUTE }}>A typical probiotic chew. Made like a dog treat.</figcaption>
        </figure>

        {/* screen 2: the heat */}
        <H2>To make a chew, they bake it</H2>
        <P>
          A probiotic is live bacteria. Living things. But to turn it into a soft chew, it gets mixed into a dough and baked, the same way you'd make a dog biscuit. That's most of the tubs on the market.
        </P>
        <P>
          Heat kills bacteria. It's how we sterilise things. <B>Baking can kill up to 90% of them</B> before your dog eats a single chew. And whatever survives then sits in a soft, moist chew, which is the last place live bacteria want to be.
        </P>
        <P>
          So you give one every morning for three months and wonder why nothing's changed. <B>Nothing changed because there was nothing there.</B>
        </P>

        {/* screen 3: ours */}
        <H2>Ours is never baked. Not once.</H2>
        <img src="/lp/capsule-open.jpg" alt="Twisting open a 5 Strain Probiotic+ capsule over a dog's dinner" className="mt-4 aspect-[4/3] w-full rounded-xl object-cover" />
        <P>
          5 Strain Probiotic+ is never heat-processed. The bacteria go in as a dry powder and stay sealed in the capsule until you twist it open over dinner. So they're <B>still alive when they reach your dog's gut</B>, which is the entire point of a probiotic.
        </P>
        <P>
          That's <B>5 billion live bacteria in every capsule</B>, from five named strains, plus chicory inulin to feed them and six digestive enzymes.
        </P>
        <P>It's formulated with a UK vet, Dr Kishan Vara. This is what he says about it:</P>
        <figure className="mt-3 flex items-start gap-3 rounded-xl p-4" style={{ background: CREAM }}>
          <img src="/lp/vet-kishan.jpg" alt="Dr Kishan Vara MRCVS" className="h-12 w-12 shrink-0 rounded-full object-cover" />
          <div>
            <blockquote className="text-[15px] leading-snug" style={{ color: INK }}>
              &ldquo;&hellip;an excellent proactive choice for dogs with sensitive stomachs, gunky ears, or recurring digestive upset.&rdquo;
            </blockquote>
            <figcaption className="adv-heading mt-1.5 text-[12.5px] font-semibold" style={{ color: NAVY }}>Dr Kishan Vara MRCVS</figcaption>
          </div>
        </figure>

        {/* segment 2: not full of filler */}
        <H2>And it isn't full of filler</H2>
        <P>
          Turn a chew tub over. Ingredients are listed heaviest first, and on this one it reads <B>potato starch, glycerine, garbanzo flour, pea flour.</B> Fourteen ingredients before you even reach the bacteria.
        </P>
        <img src="/lp/hero-label-in-hand.jpg" alt="The back of a probiotic chew tub: Composition starting potato starch and glycerine" className="mt-4 aspect-square w-full rounded-xl object-cover" style={{ objectPosition: "50% 70%" }} />
        <P>
          You're paying for a dog treat with a probiotic stirred in. For an itchy dog, that filler isn't helping, and <B>it might be making things worse.</B> Ours is pure powder: no starch, no flour, no glycerine. You're paying for what does the work.
        </P>

        <VersusCard />

        <div id="first-cta" className="mt-6"><Cta label="Try the one that's alive →" where="first-cta" /></div>

        {/* proof */}
        <h2 className="adv-display mt-10 text-[22px] leading-tight" style={{ color: INK }}>There's a reason 20,000+ UK dog owners ditched the chews</h2>
        <p className="mt-1.5 flex items-center gap-2 text-[13.5px] font-semibold" style={{ color: BODY }}>
          <Stars size={14} rating={4.6} /> Good For Pets is rated 4.6 stars by its customers
        </p>
        <div className="mt-4 space-y-3">
          {REVIEWS.map((r) => <ReviewCard key={r.name} {...r} />)}
        </div>
        <P>
          Be patient with it. Skin, paws and ears usually take <B>4 to 8 weeks</B>, and some dogs 12 to 14. That's why you get 90 days to judge it.
        </P>

        {/* offer */}
        <section id="offer" className="mt-10 overflow-hidden rounded-2xl border border-black/10 text-center shadow-lg">
          <img src="/lp/sprinkle-on-food.jpg" alt="Sprinkling the pure powder over a dog's dinner" className="aspect-[3/2] w-full object-cover" style={{ objectPosition: "50% 62%" }} />
          <div className="px-5 pb-5 pt-4">
            <p className="text-[12px] font-bold uppercase tracking-[0.16em]" style={{ color: RED }}>As little as 28p a day</p>
            <h2 className="adv-display mt-1 text-[26px] leading-tight" style={{ color: INK }}>Up to 45% off today</h2>
            <p className="mt-1 text-[14px] font-semibold" style={{ color: BODY }}>Free shipping on subscription</p>
            <div className="mt-4"><Cta label="Get the probiotic that's alive →" where="offer" note="90 days to try it. If it doesn't help, full refund." /></div>
          </div>
        </section>

        {/* founder sign-off */}
        <section className="mt-10 flex items-start gap-4 rounded-2xl p-5" style={{ background: CREAM }}>
          <img src="/lp/never-baked/will-rescue.jpg" alt="Will with rescue dogs" className="h-24 w-24 shrink-0 rounded-xl object-cover" style={{ objectPosition: "40% 30%" }} />
          <div>
            <p className="text-[15px] leading-[1.55]" style={{ color: INK }}>
              I started Good For Pets after seeing probiotics help my brother's ulcerative colitis. I wanted one for dogs that actually works. And 51% of our profits go to dog rescue.
            </p>
            <p className="adv-heading mt-2 text-[14px] font-bold" style={{ color: NAVY }}>Will Rushmere, founder</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-10">
          <h2 className="adv-display text-[21px]" style={{ color: INK }}>Quick questions</h2>
          <div className="mt-2">{FAQS.map(([q, a]) => <Accordion key={q} q={q} a={a} />)}</div>
        </section>

        <div className="mt-8"><Cta label="Try the one that's alive →" where="closing" /></div>

        <p className="mt-10 text-center text-[11px] leading-relaxed" style={{ color: "#A8A8A8" }}>
          This is an advertorial. Good For Pets supplements support and help maintain your dog's wellbeing; they are not intended to diagnose, treat, cure or prevent any disease. Individual results vary.
        </p>
      </article>

      {/* sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 backdrop-blur transition-transform duration-300" style={{ transform: showSticky ? "translateY(0)" : "translateY(110%)" }}>
        <div className="mx-auto max-w-xl px-4 py-3">
          <a href={PRODUCT_URL} onClick={(e) => { e.preventDefault(); goToProduct("sticky"); }} className="adv-heading block w-full rounded-full py-3.5 text-center text-[15px] font-bold uppercase tracking-wide text-white shadow-md" style={{ background: RED }}>
            Try the one that's alive →
          </a>
        </div>
      </div>
    </div>
  );
}
