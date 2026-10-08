import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { initTracking, track, withAttribution } from "@/lib/tracking";

// /p/pablo-v2: challenger to /p/pablo (control). Same ad ("Dog owner goes viral after discovering
// the 'probiotic' she trusted wasn't what she thought"), but a shorter, harder sell:
//   screen 1  the label reveal (what was really inside), mirroring the ad's chew inset
//   screen 2  why that matters, one symptom beat (Pablo's paw/ear photos)
//   screen 3  what she switched to, label vs label, first CTA
//   then      Pablo's real result, 3 verbatim reviews, Kishan, offer, 3-question FAQ
// Facts: Sue + Pablo are a real customer case study (story confirmed by Will 8 Oct 2026, cards/proof.md:
// ~18 months on other solutions incl. vets, injections, hypoallergenic food; changes started at 6 weeks,
// transformed by 12 weeks). Rival label = image-bank chew-label-composition.png (2bn CFU per 2 chews,
// Composition starts potato starch, glycerine; 3 strains in Additives; no enzymes). Ours = CF99045 label.
// Rating 4.6 stars, no review count. Quotes verbatim (T15, T41). Tracking: PostHog only (hard line 6).

const RED = "#EF3824";
const NAVY = "#282C5F";
const INK = "#1C1C2E";
const BODY = "#45474F";
const MUTE = "#8A8A8A";
const CREAM = "#F3EDE5";
const PRODUCT_URL = "https://goodforpets.co/products/5-strain-probiotic";

function goToProduct(placement: string) {
  track("CTAClick", { placement, page: "pablo-v2" });
  window.location.href = withAttribution(PRODUCT_URL);
}

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

function Cta({ label, where }: { label: string; where: string }) {
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
        90-day money-back guarantee · As little as 28p a day
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

// Head-to-head, from the two back labels. Rival: 2bn CFU "per 2 soft chews", 3 strains in Additives,
// 14 Composition ingredients, no enzymes. Ours (CF99045): 5bn CFU per capsule, 5 strains, 1 Composition
// ingredient, enzyme complex. Toggle compares one chew vs one capsule, or each label's own serving.
type Basis = "unit" | "serving";
type Row = { label: string; them: number; us: number; themText: string; usText: string; max: number; badge: string; note?: string };
function rowsFor(basis: Basis): Row[] {
  const theirs = basis === "unit" ? 1 : 2;
  const pct = Math.round((5 / theirs - 1) * 100);
  return [
    { label: "Live bacteria", them: theirs, us: 5, themText: `${theirs}bn`, usText: "5bn", max: 5, badge: `${pct}% more`,
      note: basis === "unit" ? "One chew vs one capsule" : "Their serving (2 chews) vs ours (1 capsule)" },
    { label: "Probiotic strains", them: 3, us: 5, themText: "3", usText: "5", max: 5, badge: "67% more" },
    { label: "Ingredients in the Composition", them: 14, us: 1, themText: "14", usText: "1", max: 14, badge: "93% fewer", note: "Fewer is purer. Theirs starts with potato starch and glycerine." },
    { label: "Digestive enzymes", them: 0, us: 1, themText: "None", usText: "Included", max: 1, badge: "Only ours" },
  ];
}

const REVIEWS: { quote: string; name: string; dog?: string; img?: string }[] = [
  {
    quote: "My bulldog licked her paws bald and raw every summer for two and a half years. I tried everything including medication from the vet. Nothing worked… three weeks later there's no paw licking at all.",
    name: "Chris B.", dog: "Bulldog", img: "/lp/review-chris-b.jpeg",
  },
  {
    quote: "My dog was on the baked chews but saw the advert saying none baked chews are better. She was still having itchy ears on the baked chews… her ears are practically clean and no itching at all",
    name: "Katie S.", dog: "Shih Tzu", img: "/lp/review-sherry.jpeg",
  },
  {
    quote: "So, my journey is that for years we paid for vets' consultation and drops due to constantly recurring ear infections. Since starting your product, he hasn't had a single infection. Just wonderful.",
    name: "Sarah B.",
  },
];

const FAQS: [string, string][] = [
  ["What's in it, and what's not?", "One Composition ingredient, chicory inulin (a natural prebiotic), plus 5 billion live bacteria from 5 named strains and a digestive enzyme complex in every capsule. No starch, no glycerine, no flours, no grains. Made in the UK to GMP standards."],
  ["How do I give it to a fussy dog?", "Twist the capsule open and sprinkle the powder over their dinner. No chews to bribe them with and no pills to hide."],
  ["How long until I see a difference?", "Most dogs take 4 to 8 weeks, some 12 to 14. For Pablo the changes started at about 6 weeks. Judge it over 90 days, and if it doesn't help, you get your money back."],
];

function ProofStrip({ stacked = false }: { stacked?: boolean }) {
  return (
    <p className={`mt-4 flex items-center justify-center text-[13.5px] font-semibold ${stacked ? "flex-col gap-1" : "gap-2"}`} style={{ color: INK }}>
      <Stars size={14} /> <span>20,000+ UK dog owners have switched</span>
    </p>
  );
}

function VersusCard() {
  const [basis, setBasis] = useState<Basis>("unit");
  const [shown, setShown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const rows = rowsFor(basis);
  const bar = (v: number, max: number) => ({ width: shown ? `${Math.max(v / max, v ? 0.06 : 0) * 100}%` : "0%" });
  const tabs: [Basis, string][] = [["unit", "Chew vs capsule"], ["serving", "Per serving"]];
  return (
    <div ref={ref} className="mt-6 rounded-2xl border bg-white p-4" style={{ borderColor: "#E6E0D7" }}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <img src="/lp/pablo-v2/chews.jpg" alt="" className="h-9 w-9 rounded-full object-cover" />
          <span className="text-[12.5px] font-semibold leading-tight" style={{ color: BODY }}>Typical<br />chew</span>
        </div>
        <span className="adv-display text-[13px]" style={{ color: MUTE }}>vs</span>
        <div className="flex items-center gap-2">
          <img src="/lp/pablo-v2/tub-icon.png" alt="" className="h-11 w-auto object-contain" />
          <span className="adv-heading text-[12.5px] font-bold leading-tight" style={{ color: NAVY }}>5 Strain<br />Probiotic+</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 rounded-full p-1" style={{ background: CREAM }} role="tablist">
        {tabs.map(([k, label]) => (
          <button key={k} role="tab" aria-selected={basis === k}
            onClick={() => { setBasis(k); track("CompareToggle", { basis: k, page: "pablo-v2" }); }}
            className="adv-heading min-h-[44px] rounded-full text-[13px] font-semibold transition-colors"
            style={basis === k ? { background: "#fff", color: INK, boxShadow: "0 1px 3px rgba(0,0,0,0.12)" } : { color: BODY }}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-1">
        {rows.map((r, i) => (
          <div key={r.label} className="py-4" style={i ? { borderTop: "1px solid #EEE9E1" } : undefined}>
            <div className="flex items-center justify-between gap-3">
              <span className="adv-heading text-[15px] font-semibold leading-tight" style={{ color: INK }}>{r.label}</span>
              <span className="adv-heading shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-bold text-white" style={{ background: RED }}>{r.badge}</span>
            </div>
            <div className="mt-3 grid grid-cols-[48px_1fr_64px] items-center gap-x-2.5 gap-y-2">
              <span className="text-[12px] font-medium" style={{ color: MUTE }}>Chew</span>
              <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "#F1ECE5" }}>
                <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ ...bar(r.them, r.max), background: "#B8ADA0" }} />
              </div>
              <span className="text-right text-[13px] font-semibold tabular-nums" style={{ color: BODY }}>{r.themText}</span>
              <span className="text-[12px] font-bold" style={{ color: NAVY }}>Ours</span>
              <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "#F1ECE5" }}>
                <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ ...bar(r.us, r.max), background: NAVY, transitionDelay: "120ms" }} />
              </div>
              <span className="adv-heading text-right text-[14px] font-bold tabular-nums" style={{ color: INK }}>{r.usText}</span>
            </div>
            {r.note && <p className="mt-2 text-[12px] leading-snug" style={{ color: MUTE }}>{r.note}</p>}
          </div>
        ))}
      </div>
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

export default function SuePabloV2Advertorial() {
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    document.title = "What was really inside Pablo's probiotic, Good For Pets";
    initTracking();
    return () => { document.head.removeChild(link); };
  }, []);

  // sticky CTA once the first in-page CTA is above the screen; a plain scroll check (not an
  // IntersectionObserver) so a fast fling or jump past it can't skip the trigger
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
          <img src="/lp/pablo-hero.jpg" alt="Sue" className="h-9 w-9 shrink-0 rounded-full object-cover" style={{ objectPosition: "24% 40%" }} />
          <p className="text-[12.5px] font-semibold" style={{ color: MUTE }}>By Sue Walker · @sue.walker8</p>
        </div>

        {/* screen 1: continue the ad's sentence, then the reveal */}
        <h1 className="adv-display mt-3 text-[26px] leading-[1.14]" style={{ color: INK }}>
          The 'probiotic' I trusted for 18 months wasn't what I thought. <span style={{ color: RED }}>Here's what was really inside.</span>
        </h1>
        <p className="mt-3 text-[16.5px] leading-[1.55]" style={{ color: BODY }}>
          I only ever read the front of Pablo's chews. Then I turned the tub over.
        </p>

        <figure className="relative mt-4">
          <img src="/lp/pablo-v2/label-composition.jpg" alt="The back of the probiotic chew tub: 2 billion CFUs per 2 soft chews, Composition starting potato starch and glycerine" className="w-full rounded-xl border border-black/10" />
          <img src="/lp/pablo-v2/chews.jpg" alt="The brown pressed probiotic chews" className="absolute -right-1 -top-4 h-[72px] w-[72px] rounded-full border-[3px] border-white object-cover shadow-md" />
        </figure>

        <P>
          The Composition lists the heaviest ingredients first. <B>Potato starch. Glycerine. Garbanzo flour. Pea flour. Brewer's yeast.</B> Fourteen ingredients in total. And the "2 billion" on the front? <B>That's for two chews.</B>
        </P>

        {/* screen 2: why it matters, one symptom beat */}
        <H2>We'd spent hundreds of pounds on a starch and glycerine treat</H2>
        <P>
          For 18 months we tried everything. The vets, injections, a switch to hypoallergenic food, and those chews. Small changes, then straight back to the licking and scratching.
        </P>
        <figure className="mt-4">
          <div className="grid grid-cols-2 gap-2">
            {[["/lp/pablo-paw.jpg", "Paw", "Pablo's sore, licked paw", "50% 50%"], ["/lp/pablo-ear.jpg", "Ear", "Pablo's inflamed ear", "50% 40%"]].map(([src, tag, alt, pos]) => (
              <div key={tag} className="relative">
                <img src={src} alt={alt} className="aspect-square w-full rounded-xl object-cover" style={{ objectPosition: pos }} />
                <span className="adv-heading absolute left-2 top-2 rounded-full bg-white px-2.5 py-0.5 text-[11.5px] font-bold" style={{ color: INK }}>{tag}</span>
              </div>
            ))}
          </div>
          <figcaption className="mt-1.5 text-[12.5px] font-semibold" style={{ color: MUTE }}>Pablo's paw and ear, before.</figcaption>
        </figure>
        <P>
          Pablo's itch starts in his gut, where most of his immune system lives. The chews weren't calming it. Full of fillers like that, <B>they were making it worse.</B>
        </P>

        {/* screen 3: what she switched to, label vs label, first CTA */}
        <H2>So I found one with nothing to hide</H2>
        <img src="/lp/pablo-product.jpg" alt="Pablo next to his 5 Strain Probiotic+ tub" className="mt-4 aspect-[4/3] w-full rounded-xl object-cover" style={{ objectPosition: "50% 45%" }} />
        <P>
          5 Strain Probiotic+ is pure powder in a twist-open capsule. Turn the tub over and the Composition is <B>one ingredient: chicory inulin</B>, a natural prebiotic. Then <B>5 billion live bacteria in every capsule</B>, from five named strains, plus a digestive enzyme complex. You sprinkle it on dinner.
        </P>

        <VersusCard />

        <div id="first-cta" className="mt-6"><Cta label="See Pablo's probiotic →" where="first-cta" /></div>
        <ProofStrip />

        {/* result + proof */}
        <H2>About 6 weeks in, the changes started</H2>
        <img src="/lp/pablo-hero.jpg" alt="Sue and Pablo outdoors" className="mt-4 aspect-[4/3] w-full rounded-xl object-cover" style={{ objectPosition: "50% 35%" }} />
        <P>
          It wasn't overnight. At about 6 weeks things started to change, and by 12 weeks <B>Pablo was transformed.</B> Every dog is different: most take 4 to 8 weeks, some 12 to 14, so give it a full 90 days.
        </P>

        <h2 className="adv-display mt-10 text-[22px] leading-tight" style={{ color: INK }}>20,000+ UK dog owners have switched</h2>
        <p className="mt-1.5 flex items-center gap-2 text-[13.5px] font-semibold" style={{ color: BODY }}>
          <Stars size={14} /> Rated 4.6 stars by our customers
        </p>
        <div className="mt-4 space-y-3">
          {REVIEWS.map((r) => <ReviewCard key={r.name} {...r} />)}
        </div>

        <figure className="mt-6 flex items-center gap-3.5 rounded-xl border border-black/10 p-4">
          <img src="/lp/vet-kishan.jpg" alt="Dr Kishan Vara MRCVS" className="h-14 w-14 shrink-0 rounded-full object-cover" />
          <div>
            <blockquote className="text-[14.5px] italic leading-snug" style={{ color: INK }}>
              "…an excellent proactive choice for dogs with sensitive stomachs, gunky ears, or recurring digestive upset."
            </blockquote>
            <figcaption className="mt-1 text-[12.5px] font-semibold" style={{ color: MUTE }}>Dr Kishan Vara MRCVS, who formulated it with us</figcaption>
          </div>
        </figure>

        {/* offer (scarcity kept as on the control, per Will) */}
        <section className="mt-10 overflow-hidden rounded-2xl border border-black/10 text-center shadow-lg">
          <img src="/lp/sprinkle-on-food.jpg" alt="Sprinkling the pure powder over a dog's dinner" className="aspect-square w-full object-cover" />
          <div className="p-6">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: RED }}>From just 28p a day</p>
            <h2 className="adv-display mt-2 text-[28px] leading-tight" style={{ color: INK }}>Up to 45% off today</h2>
            <p className="mt-2 text-[14px] font-semibold" style={{ color: BODY }}>Free shipping on subscription</p>
            <p className="adv-heading mt-4 text-[13px] font-bold uppercase tracking-wide" style={{ color: RED }}>⚡ Only 13 left in this batch</p>
            <div className="mt-3"><Cta label="Get the pure powder →" where="offer" /></div>
            <ProofStrip stacked />
            <p className="mt-2 text-[13px] font-semibold" style={{ color: INK }}>51% of our profits go to dog rescue.</p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-10">
          <h2 className="adv-display text-[21px]" style={{ color: INK }}>Quick questions</h2>
          <div className="mt-2">{FAQS.map(([q, a]) => <Accordion key={q} q={q} a={a} />)}</div>
        </section>

        <div className="mt-8"><Cta label="Start Pablo's probiotic →" where="closing" /></div>

        <p className="mt-10 text-center text-[11px] leading-relaxed" style={{ color: "#A8A8A8" }}>
          This is an advertorial. Good For Pets supplements support and help maintain your dog's wellbeing; they are not intended to diagnose, treat, cure or prevent any disease. Individual results vary.
        </p>
      </article>

      {/* sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 backdrop-blur transition-transform duration-300" style={{ transform: showSticky ? "translateY(0)" : "translateY(110%)" }}>
        <div className="mx-auto max-w-xl px-4 py-3">
          <a href={PRODUCT_URL} onClick={(e) => { e.preventDefault(); goToProduct("sticky"); }} className="adv-heading block w-full rounded-full py-3.5 text-center text-[15px] font-bold uppercase tracking-wide text-white shadow-md" style={{ background: RED }}>
            See Pablo's probiotic →
          </a>
        </div>
      </div>
    </div>
  );
}
