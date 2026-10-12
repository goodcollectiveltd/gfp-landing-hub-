import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { initTracking, track, withAttribution } from "@/lib/tracking";

// /p/vs-petlab: comparison advertorial for the "two tubs + post-it notes" ad (5 Strain Probiotic+ vs
// PetLab Co Probiotic Chew). Neutral third-person editorial voice (Will, 12 Oct 2026): no byline, no
// "I/we/ours", clearly labelled Advertorial. Not an independent review and never presented as one.
// Basis (Will, 12 Oct 2026): a 20kg dog, ongoing subscription prices. PetLab's dose is 2 chews a day from
// 11.4 to 34kg, ours 1 capsule up to 25kg, so 20kg shows the cost gap best (£1.73 vs 40p a day, one tub
// 15 vs 90 days). At 2 chews their live bacteria (6.2bn) beat our 5bn, so no bacteria row on this basis.
// PetLab UK figures: company-context/products/competitor-specs.md (label captured 3 Sep 2026; UK offer
// page re-checked 12 Oct 2026: £32.44 RRP, 40% off first month then 20% off, so 86.5p a chew on renewal;
// strains B. velezensis + E. faecium). UK formula only, never the US one. Ours: CF99045 label, 40p a day
// on subscription (Will, 12 Oct 2026). Tracking: PostHog only (hard line 6).

const PAGE = "vs-petlab";
const RED = "#EF3824";
const NAVY = "#282C5F";
const INK = "#1C1C2E";
const BODY = "#45474F";
const MUTE = "#8A8A8A";
const CREAM = "#F3EDE5";
const LINE = "#E6E0D7";
const PRODUCT_URL = "https://goodforpets.co/products/5-strain-probiotic";

function goToProduct(placement: string) {
  track("CTAClick", { placement, page: PAGE });
  window.location.href = withAttribution(PRODUCT_URL);
}

function Cta({ label, where, note = "90-day money-back guarantee" }: { label: string; where: string; note?: string }) {
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
      <p className="mt-2.5 text-center text-[12.5px] font-semibold" style={{ color: MUTE }}>{note}</p>
    </div>
  );
}

function H2({ children }: { children: ReactNode }) {
  return <h2 className="adv-display mt-9 text-[22px] leading-[1.2]" style={{ color: INK }}>{children}</h2>;
}

function P({ children, className = "mt-3" }: { children: ReactNode; className?: string }) {
  return <p className={`${className} text-[17px] leading-[1.55]`} style={{ color: BODY }}>{children}</p>;
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

const ROWS: { label: string; them: string; us: string; delta: string }[] = [
  { label: "Cost a day", them: "£1.73", us: "40p", delta: "77% less" },
  { label: "One tub lasts", them: "15 days", us: "90 days", delta: "6x longer" },
  { label: "Probiotic strains", them: "2", us: "5", delta: "2.5x more" },
  { label: "Digestive enzymes", them: "None", us: "6", delta: "Only one" },
  { label: "First ingredient", them: "Glycerine", us: "Inulin", delta: "A prebiotic" },
];

function Scorecard() {
  const cols = "grid grid-cols-[1fr_88px_108px]";
  return (
    <div className="mt-3 overflow-hidden rounded border" style={{ borderColor: LINE }}>
      <div className={cols}>
        <div />
        <div className="flex flex-col items-center gap-1.5 px-1.5 py-3 text-center">
          <img src="/lp/vs-petlab/petlab-thumb.jpg" alt="PetLab Co Probiotic Chew tub" className="h-12 w-12 rounded bg-white object-contain" />
          <span className="text-[11.5px] font-semibold leading-tight" style={{ color: MUTE }}>PetLab Co chews</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 px-1.5 py-3 text-center" style={{ background: NAVY }}>
          <img src="/lp/vs-petlab/ours-thumb.jpg" alt="5 Strain Probiotic+ tub" className="h-12 w-12 rounded bg-white object-contain" />
          <span className="adv-heading text-[11.5px] font-bold leading-tight text-white">5 Strain Probiotic+</span>
        </div>
      </div>
      {ROWS.map((r) => (
        <div key={r.label} className={cols}>
          <div className="flex items-center border-t px-3 py-3" style={{ borderColor: "#EFE9E0" }}>
            <span className="adv-heading text-[14px] font-semibold leading-tight" style={{ color: INK }}>{r.label}</span>
          </div>
          <div className="flex items-center justify-center border-t px-1 text-center text-[14.5px]" style={{ borderColor: "#EFE9E0", color: "#6B6B73" }}>{r.them}</div>
          <div className="flex flex-col items-center justify-center border-t px-1 py-2.5 text-center" style={{ background: NAVY, borderColor: "#3A3F78" }}>
            <span className="adv-display text-[17px] leading-tight text-white">{r.us}</span>
            <span className="mt-0.5 text-[11px] font-semibold leading-tight" style={{ color: "#FFB4A8" }}>{r.delta}</span>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between border-t px-3 py-3" style={{ background: CREAM, borderColor: LINE }}>
        <span className="text-[14px] font-semibold" style={{ color: INK }}>Result</span>
        <span className="adv-display text-[15px]" style={{ color: NAVY }}>5 Strain Probiotic+ wins 5 of 5</span>
      </div>
    </div>
  );
}

const INSIDE = [
  { name: "PetLab Co Probiotic Chew", unit: "Per 4g chew, all of it eaten", thumb: "/lp/vs-petlab/petlab-thumb.jpg", ours: false, share: "About 7%", tile: "~7%", bar: "7%",
    active: ["2 probiotic strains, 3.1bn bacteria", "Prebiotics FOS and GOS, 200mg", "Yeast postbiotic blend, 75mg"],
    restLabel: "The rest of the chew, heaviest first",
    rest: "Glycerine, sweet potato powder, potato starch, chickpea flour, rapeseed oil, dried brewer's yeast, pork liver powder, apple extract, yeast products, sunflower lecithin." },
  { name: "5 Strain Probiotic+", unit: "Per capsule, the powder your dog eats", thumb: "/lp/vs-petlab/ours-thumb.jpg", ours: true, share: "Almost 90%", tile: "~90%", bar: "89%",
    active: ["5 named probiotic strains, 5bn bacteria", "Chicory inulin prebiotic, 250mg", "6 digestive enzymes, 150mg"],
    restLabel: "Everything else",
    rest: "Natural flavouring and two flow agents (magnesium stearate and silicon dioxide). No glycerine, starch or flour." },
];

// Verbatim, shortened (cards/proof.md allows trimming, never adding). T15 Katie Swales, T39 Chris B.
const REVIEWS = [
  { name: "Katie S.", dog: "Shih Tzu", img: "/lp/review-sherry.jpeg",
    quote: "My dog was on the baked chews… Been on these for about 2 and a half weeks and saw a massive difference already… her ears are practically clean and no itching at all" },
  { name: "Chris B.", dog: "Bulldog", img: "/lp/review-chris-b.jpeg",
    quote: "My bulldog licked her paws bald and raw every summer for two and a half years… Within a week it started working and three weeks later there's no paw licking at all." },
];

const FAQS: [string, string][] = [
  ["How was this compared?", "From each brand's own UK label and website. Both are compared on the daily dose each brand recommends for a 20kg dog, at ongoing subscription prices. Prices change, so check before you buy."],
  ["Can a dog switch straight from chews?", "Yes. Give half a capsule's worth for the first 5 to 7 days, then the full amount. Twist the capsule open and sprinkle it over dinner."],
  ["How long until a difference shows?", "Skin, paws and ears usually take 4 to 8 weeks, and some dogs 12 to 14. That's why there are 90 days to judge it, with a full refund if it doesn't help."],
];

export default function VsPetlabAdvertorial() {
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
    document.title = "PetLab's chews vs 5 Strain Probiotic+: what the labels say";
    initTracking();
    return () => { document.head.removeChild(link); };
  }, []);

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
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: MUTE }}>Advertorial · Good For Pets · Updated October 2026</p>

        <h1 className="adv-display mt-2.5 text-[26px] leading-[1.14]" style={{ color: INK }}>
          PetLab's chews vs 5 Strain Probiotic+. <span style={{ color: RED }}>What the labels actually say.</span>
        </h1>
        <P className="mt-2.5">Both tubs turned over. Here's how they compare.</P>

        <img src="/lp/vs-petlab/hero.jpg" alt="5 Strain Probiotic+ and PetLab Co Probiotic Chew tubs side by side" className="mt-4 w-full rounded object-cover" />

        {/* scorecard */}
        <p className="mt-7 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: MUTE }}>The scorecard</p>
        <p className="mt-0.5 text-[12.5px]" style={{ color: MUTE }}>Daily dose for a 20kg dog, ongoing subscription prices</p>
        <Scorecard />

        <div id="first-cta" className="mt-6"><Cta label="Try 5 Strain Probiotic+ →" where="first-cta" /></div>

        {/* what's inside: both labels, same layout, like for like (Will, 12 Oct 2026: don't imply theirs
            has no probiotics). Shares exclude the bacteria themselves, which neither label weighs.
            PetLab: 4g chew, FOS 100mg + GOS 100mg + yeast postbiotic 75mg = 275mg, about 7%.
            Ours (Will, 12 Oct 2026: fair to the top end, defensible): the dog eats the powder, not the shell
            ("twist open, do not give whole"). 51g / 90 = ~567mg a capsule incl. shell; 400mg of actives needs
            size 1+. Will (12 Oct 2026): our capsules are size 00, whose HPMC shell is ~118mg, so the powder is
            ~449mg and inulin 250mg + enzymes 150mg = 89% of it before counting the bacteria ("almost 90%").
            Even the smallest shell that fits (size 1, ~75mg) still gives 81%.
            Weighing the powder from 10 capsules would pin the exact figure. */}
        <H2>What's actually in each one</H2>
        <P>Both contain probiotics. The question is how much of each one does the work.</P>
        {/* stat tiles: the headline number for each, as a visual */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {INSIDE.map((x) => (
            <div key={x.name} className="rounded border p-3 text-center" style={{ borderColor: x.ours ? NAVY : LINE, background: x.ours ? NAVY : "#fff" }}>
              <img src={x.thumb} alt={x.name} className="mx-auto h-24 w-24 rounded bg-white object-contain" />
              <p className="adv-display mt-2 text-[30px] leading-none" style={{ color: x.ours ? "#fff" : "#B4483A" }}>{x.tile}</p>
              <p className="mt-1 text-[12.5px] font-semibold leading-tight" style={{ color: x.ours ? "#C9CBE0" : MUTE }}>active ingredients</p>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-3">
          {INSIDE.map((x) => (
            <div key={x.name} className="overflow-hidden rounded border" style={{ borderColor: x.ours ? NAVY : LINE }}>
              <div className="flex items-center justify-between gap-3 px-4 py-2.5" style={{ background: x.ours ? NAVY : "#FAF8F5" }}>
                <p className="adv-heading text-[15px] font-bold leading-tight" style={{ color: x.ours ? "#fff" : INK }}>{x.name}</p>
                <p className="shrink-0 text-[12px]" style={{ color: x.ours ? "#C9CBE0" : MUTE }}>{x.unit}</p>
              </div>
              <div className="px-4 pb-4 pt-3">
                <div className="h-2.5 w-full overflow-hidden rounded-sm" style={{ background: "#EEE7DD" }}>
                  <div className="h-full" style={{ width: x.bar, background: x.ours ? NAVY : "#B4483A" }} />
                </div>
                <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: MUTE }}>The active part</p>
                <ul className="mt-1 space-y-0.5 text-[15.5px] leading-snug" style={{ color: INK }}>
                  {x.active.map((t) => <li key={t}>{t}</li>)}
                </ul>
                <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.06em]" style={{ color: MUTE }}>{x.restLabel}</p>
                <p className="mt-1 text-[15.5px] leading-snug" style={{ color: BODY }}>{x.rest}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11.5px] leading-snug" style={{ color: MUTE }}>From each label, counting what your dog actually eats: the whole chew, or the powder from the capsule. Neither label weighs the bacteria, so both percentages leave them out.</p>
        <p className="adv-display mt-6 text-[21px] leading-[1.25]" style={{ color: INK }}>Theirs is mostly treat. Ours is mostly the good stuff.</p>

        {/* our own capsule-pour clip */}
        <video
          src="/lp/videos/10reasons-2fbbd795798a4366b3d4794ba7a4796a.mp4"
          poster="/lp/capsule-open.jpg"
          className="mt-4 aspect-square w-full rounded object-cover"
          muted loop playsInline autoPlay preload="metadata"
          aria-label="Twisting open a 5 Strain Probiotic+ capsule and pouring the powder over a dog's dinner"
        />
        <p className="mt-1.5 text-[12.5px] font-semibold" style={{ color: MUTE }}>Twist open, sprinkle on dinner. Developed with vet partner Dr Kishan Vara.</p>

        {/* fair to PetLab */}
        <H2>Where PetLab does better</H2>
        <div className="mt-3 overflow-hidden rounded border" style={{ borderColor: LINE }}>
          {[
            ["/lp/vs-petlab/petlab-thumb.jpg", "PetLab", "A treat most dogs enjoy, and handy on walks."],
            ["/lp/vs-petlab/ours-thumb.jpg", "5 Strain Probiotic+", "A flavoured powder topper for dinner. Not a treat."],
          ].map(([img, who, t], i) => (
            <div key={who} className={`flex items-center gap-3 px-3 py-3 ${i ? "border-t" : ""}`} style={{ borderColor: "#EFE9E0" }}>
              <img src={img} alt="" className="h-12 w-12 shrink-0 rounded bg-white object-contain" />
              <p className="text-[15.5px] leading-snug" style={{ color: INK }}><b>{who}:</b> {t}</p>
            </div>
          ))}
        </div>

        {/* verdict */}
        <H2>The verdict</H2>
        <div className="mt-3 rounded p-4" style={{ background: CREAM }}>
          <p className="text-[16px]" style={{ color: BODY }}>For a treat: <b style={{ color: INK }}>PetLab</b>.</p>
          <p className="adv-display mt-1 text-[19px] leading-snug" style={{ color: INK }}>For an itchy dog: 5 Strain Probiotic+</p>
          <ul className="mt-3 space-y-2">
            {["5 strains, not 2", "6 digestive enzymes", "No glycerine, starch or flour", "Under a quarter of the price a day", "90-day money-back guarantee"].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[16px] leading-snug" style={{ color: INK }}><svg width="20" height="20" viewBox="0 0 22 22" aria-hidden className="mt-0.5 shrink-0"><circle cx="11" cy="11" r="11" fill={NAVY} /><path d="M6.5 11.4l3 3 6-6.4" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg><span>{t}</span></li>
            ))}
          </ul>
        </div>

        <div className="mt-6"><Cta label="Try 5 Strain Probiotic+ →" where="verdict" /></div>

        {/* proof, shown with the dogs */}
        <h2 className="adv-display mt-10 text-[20px] leading-tight" style={{ color: INK }}>20,000+ UK dog owners have switched</h2>
        <p className="mt-1.5 text-[13.5px] font-semibold" style={{ color: BODY }}>
          <span style={{ color: RED }}>★★★★★</span> Good For Pets is rated 4.6 stars by its customers
        </p>
        <div className="mt-3 space-y-3">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="flex gap-3 rounded border bg-white p-3" style={{ borderColor: LINE }}>
              <img src={r.img} alt={`${r.name}'s ${r.dog}`} className="h-20 w-20 shrink-0 rounded object-cover" />
              <div className="min-w-0">
                <blockquote className="text-[15px] leading-[1.5]" style={{ color: INK }}>&ldquo;{r.quote}&rdquo;</blockquote>
                <figcaption className="mt-1.5 text-[12.5px] font-semibold" style={{ color: INK }}>{r.name} · {r.dog} · <span style={{ color: "#2F7D4F" }}>Verified buyer</span></figcaption>
              </div>
            </figure>
          ))}
        </div>

        {/* offer */}
        <section id="offer" className="mt-9 overflow-hidden rounded border text-center" style={{ borderColor: LINE }}>
          <img src="/lp/sprinkle-on-food.jpg" alt="5 Strain Probiotic+ sprinkled over a dog's dinner" className="aspect-[3/2] w-full object-cover" style={{ objectPosition: "50% 62%" }} />
          <div className="px-5 pb-5 pt-4">
            <p className="text-[12px] font-bold uppercase tracking-[0.16em]" style={{ color: RED }}>As little as 28p a day</p>
            <h2 className="adv-display mt-1 text-[26px] leading-tight" style={{ color: INK }}>Up to 45% off today</h2>
            <p className="mt-1 text-[14px] font-semibold" style={{ color: BODY }}>Free shipping on subscription</p>
            <div className="mt-4"><Cta label="Try 5 Strain Probiotic+ →" where="offer" note="90 days to try it. If it doesn't help, full refund." /></div>
            <p className="mt-2 text-[12.5px] font-semibold" style={{ color: INK }}>51% of Good For Pets' profits go to dog rescue.</p>
          </div>
        </section>

        <section className="mt-9">
          <h2 className="adv-display text-[20px]" style={{ color: INK }}>Quick questions</h2>
          <div className="mt-2">{FAQS.map(([q, a]) => <Accordion key={q} q={q} a={a} />)}</div>
        </section>

        <p className="mt-8 text-center text-[11px] leading-relaxed" style={{ color: "#A8A8A8" }}>
          This is an advertorial by Good For Pets. Figures from each brand's own UK label and website, ongoing subscription prices, 20kg dog, checked 12 October 2026. PetLab and PetLab Co are trademarks of their owner, which is not affiliated with Good For Pets. Good For Pets supplements support and help maintain your dog's wellbeing; they are not intended to diagnose, treat, cure or prevent any disease. Individual results vary.
        </p>
      </article>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-white/95 backdrop-blur transition-transform duration-300" style={{ transform: showSticky ? "translateY(0)" : "translateY(110%)" }}>
        <div className="mx-auto max-w-xl px-4 py-3">
          <a href={PRODUCT_URL} onClick={(e) => { e.preventDefault(); goToProduct("sticky"); }} className="adv-heading block w-full rounded-full py-3.5 text-center text-[15px] font-bold uppercase tracking-wide text-white shadow-md" style={{ background: RED }}>
            Try 5 Strain Probiotic+ →
          </a>
        </div>
      </div>
    </div>
  );
}
