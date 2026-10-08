import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { initTracking, track, withAttribution } from "@/lib/tracking";

// /p/pablo-v2: challenger to /p/pablo (control). Same ad ("Dog owner goes viral after discovering
// the 'probiotic' she trusted wasn't what she thought"), but a shorter, harder sell:
//   screen 1  the label reveal (what was really inside), mirroring the ad's chew inset
//   screen 2  why that matters, one symptom beat (Pablo's paw/ear photos)
//   screen 3  what she switched to, label vs label, first CTA
//   then      Pablo's real result, 2 verbatim reviews, Kishan, offer, 3-question FAQ
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

const COMPARE: [string, string, string][] = [
  ["Composition", "14 ingredients, potato starch and glycerine first", "1 ingredient: chicory inulin"],
  ["Live bacteria", "2 billion per 2 chews", "5 billion per capsule"],
  ["Strains", "3", "5 named strains"],
  ["Digestive enzymes", "None", "Enzyme complex"],
];

const REVIEWS: { quote: string; name: string }[] = [
  {
    quote: "My dog was on the baked chews but saw the advert saying none baked chews are better. She was still having itchy ears on the baked chews… her ears are practically clean and no itching at all",
    name: "Katie S.",
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
            <img src="/lp/pablo-paw.jpg" alt="Pablo's sore, licked paw" className="aspect-square w-full rounded-xl object-cover" />
            <img src="/lp/pablo-ear.jpg" alt="Pablo's inflamed ear" className="aspect-square w-full rounded-xl object-cover" style={{ objectPosition: "50% 40%" }} />
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

        <div className="mt-5 overflow-hidden rounded-xl border border-black/10">
          <div className="grid grid-cols-[1fr_1fr_1fr] text-[12px] font-bold uppercase tracking-wide">
            <div className="px-3 py-2.5" style={{ background: CREAM, color: MUTE }}>Back label</div>
            <div className="px-3 py-2.5" style={{ background: CREAM, color: MUTE }}>The chews</div>
            <div className="px-3 py-2.5 text-white" style={{ background: NAVY }}>5 Strain Probiotic+</div>
          </div>
          {COMPARE.map(([k, them, us]) => (
            <div key={k} className="grid grid-cols-[1fr_1fr_1fr] border-t border-black/10 text-[13.5px] leading-snug">
              <div className="px-3 py-3 font-semibold" style={{ color: INK }}>{k}</div>
              <div className="px-3 py-3" style={{ color: MUTE }}>{them}</div>
              <div className="px-3 py-3 font-semibold" style={{ color: INK, background: "#F7F8FC" }}>{us}</div>
            </div>
          ))}
        </div>

        <div id="first-cta" className="mt-6"><Cta label="See Pablo's probiotic →" where="first-cta" /></div>

        {/* result + proof */}
        <H2>About 6 weeks in, the changes started</H2>
        <img src="/lp/pablo-hero.jpg" alt="Sue and Pablo outdoors" className="mt-4 aspect-[4/3] w-full rounded-xl object-cover" style={{ objectPosition: "50% 35%" }} />
        <P>
          It wasn't overnight. At about 6 weeks things started to change, and by 12 weeks <B>Pablo was transformed.</B> Every dog is different: most take 4 to 8 weeks, some 12 to 14, so give it a full 90 days.
        </P>

        <p className="mt-7 flex items-center gap-2 text-[14px] font-semibold" style={{ color: INK }}>
          <Stars /> Rated 4.6 stars by our customers
        </p>
        <div className="mt-3 space-y-3">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="rounded-xl p-4" style={{ background: CREAM }}>
              <Stars size={13} />
              <blockquote className="mt-2 text-[15px] leading-relaxed" style={{ color: INK }}>"{r.quote}"</blockquote>
              <figcaption className="mt-2 text-[13px] font-semibold" style={{ color: BODY }}>{r.name} · Verified buyer</figcaption>
            </figure>
          ))}
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
          <img src="/lp/sprinkle-on-food.jpg" alt="Sprinkling the pure powder over a dog's dinner" className="h-44 w-full object-cover" />
          <div className="p-6">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: RED }}>From just 28p a day</p>
            <h2 className="adv-display mt-2 text-[28px] leading-tight" style={{ color: INK }}>Up to 45% off today</h2>
            <p className="mt-2 text-[15px] leading-relaxed" style={{ color: BODY }}>
              Subscribe for <B>£31.49</B> your first tub (then £35.99), free shipping. Or £44.99 one-off.
            </p>
            <p className="adv-heading mt-4 text-[13px] font-bold uppercase tracking-wide" style={{ color: RED }}>⚡ Only 13 left in this batch</p>
            <div className="mt-3"><Cta label="Get the pure powder →" where="offer" /></div>
            <p className="mt-3 text-[13px] font-semibold" style={{ color: INK }}>51% of our profits go to dog rescue.</p>
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
