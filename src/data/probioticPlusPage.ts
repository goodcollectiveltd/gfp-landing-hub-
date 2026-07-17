import type { LandingPage } from "@/types/page";

// The GOLDEN PAGE — a hand-built replication of the live Replo advertorial at
// goodforpets.co/pages/5strainprobioticcomplex, rebuilt for the NEW product
// (5 Strain Probiotic+ sprinkle capsules, CF99045) with upgraded copy.
//
// Every claim is grounded in company-context/:
//   - mechanisms & numbers .... messaging-bank.md (§2, §3, §3B)
//   - persona & scenes ........ customer-insights/personas.md ("Sue")
//   - testimonials ............ testimonials/testimonials.md (IDs cited inline)
//   - product facts ........... products/label-specs.md (CF99045)
//   - compliance .............. compliance-and-claims.md (supports/helps, never treat/cure)
//   - copy method ............. mentors/nick-theriot.md (create emotion, guilt+relief stack)
// Pricing/variants pulled live from Shopify 10 Jul 2026:
//   variant 57197308674392 (1 tub £44.99) · Subscribe & Save 30% first order
//   (£31.49), 20% ongoing · selling plan 693194785112 = deliver every 90 days.
//
// This page doubles as the fidelity benchmark for the generator rebuild.

export const probioticPlusPage: LandingPage = {
  slug: "5-strain-probiotic-plus",
  status: "published",
  title: "5 Strain Probiotic+ — Advertorial (golden page)",
  brandKit: {
    name: "Good For Pets",
    wordmark: "Good For Pets",
    colors: {
      primary: "#EF3824", // brand vermilion
      onPrimary: "#FFFFFF",
      accent: "#EF3824",
      background: "#FFFFFF",
      text: "#161616",
      muted: "#6B6B6B",
      base: "#FFFFFF",
      surfaceTint: "#FCEAE6",
      accentDeep: "#C02A18",
      ink: "#161616",
      body: "#4B4B4B",
    },
    fonts: {
      heading: "'Poppins', system-ui, sans-serif",
      body: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    },
    fontFamilies: ["Poppins"],
  },
  buyBox: {
    productName: "5 Strain Probiotic+ · 90 sprinkle capsules",
    price: "£31.49",
    compareAtPrice: "£44.99",
    ctaLabel: "Start My Dog's Relief",
    // Subscribe & Save (30% off first tub, 20% ongoing), delivered every 90
    // days — matches one tub at 1 capsule/day for a ≤25kg dog.
    productUrl:
      "https://goodforpets.co/cart/57197308674392:1?selling_plan=693194785112",
  },
  sections: [
    // ---- 1 · Hero — lead symptom (paw licking, 50% of survey) + gut reveal ----
    {
      type: "hero",
      data: {
        eyebrow: "20,000+ UK dogs helped · vet co-developed",
        headline:
          "Still Licking His Paws? It Might Not Be His Skin — It Might Be His Gut.",
        subheadline:
          "The itching, the paw licking, the gunky ears — they often start in the gut, not the skin. 5 Strain Probiotic+ is a cold-filled sprinkle capsule that gets 5 billion live bacteria to where the problem usually starts. Chews can't.",
        ctaLabel: "Start My Dog's Relief",
        trustLine:
          "90-day money-back guarantee · 51% of profits go to animal rescue",
        image: "/lp/hero-tub.jpg",
      },
    },

    // ---- 2 · Trust strip ----
    {
      type: "socialProofBar",
      data: {
        rating: 4.8,
        reviewCount: "4,537+",
        extraValue: "20,000+",
        extraLabel: "dogs helped in the last 12 months",
      },
    },

    // ---- 3 · The scene (Nick: CREATE the emotion, don't ask about it) ----
    {
      type: "imageText",
      data: {
        heading: "You know the sound.",
        body: "It's 9pm. The telly's on, and underneath it there's that wet, rhythmic lick-lick-lick again. You've done the sprays, the special shampoos, the vet visits, the chews that promised the world — and he's still at his paws. Somewhere along the way you started feeling like you've let him down. You haven't. You've most likely just been sold the wrong tool for the job — and that's what this page is about.",
        image: {
          url: "/lp/scene-sofa.jpg",
          role: "Owner on sofa at night, dog licking its paw",
        },
        imagePosition: "left",
      },
    },

    // ---- 4 · Problem agitation — her exact symptom cluster, in her words ----
    {
      type: "problemAgitate",
      data: {
        headline: "If Nothing Has Worked, It's Probably Not You — It's the Chews",
        intro:
          "Most owners who find us have a cupboard of half-used chews, sprays and shampoos that each promised the world. Here's what they're usually still living with:",
        painPoints: [
          {
            title: "The paws",
            body: "Licking and chewing through the evening, pink-stained fur, sore patches that never quite settle.",
          },
          {
            title: "The ears",
            body: "Dark gunk that's back within days of cleaning, head shaking, and that smell that won't shift.",
          },
          {
            title: "The tummy",
            body: "Sloppy poos, gurgling, grass-eating, and wind that clears the room.",
          },
        ],
      },
    },

    // ---- 5 · THE MECHANISM — heat + moisture double-kill vs the dry capsule ----
    {
      type: "mechanismDiagram",
      data: {
        heading: "Why the Chews You've Tried Never Stood a Chance",
        subhead:
          "A probiotic is only as good as the bacteria still alive when it reaches the gut. The chew format kills them twice before your dog gets one.",
        cards: [
          {
            icon: "flame",
            label: "1 · Baked in the oven",
            dots: "dead",
            caption:
              "Most chews are baked or hot-extruded. That heat can destroy up to 90% of the live bacteria before the tub is even sealed.",
          },
          {
            icon: "droplet",
            label: "2 · Woken up in the tub",
            dots: "fading",
            caption:
              "Chews are moist — and moisture wakes the surviving bacteria up early. They burn out sitting on the shelf, weaker every single day.",
          },
          {
            icon: "snow",
            label: "5 Strain Probiotic+",
            dots: "alive",
            highlight: true,
            caption:
              "Never baked. A dry, sealed capsule keeps all 5 billion live cultures dormant until they reach your dog's gut — where they're actually needed.",
          },
        ],
      },
    },
    {
      type: "image",
      data: {
        image: {
          url: "/lp/moist-chews.jpg",
          role: "Macro of moist chews in a tub, condensation on the lid",
        },
        caption:
          "Moisture-rich chews: the “live” cultures are waking up — and dying — in the tub, long before they reach your dog.",
      },
    },

    // ---- 6 · The product answer ----
    {
      type: "imageText",
      data: {
        heading: "The Capsule That Dodges Both",
        body: "5 Strain Probiotic+ is cold-filled — never baked — in a human-supplement factory, to full human standards. The dry, sealed capsule keeps 5 billion live cultures per capsule dormant until dinnertime: around 5× what a typical chew delivers. Alongside them: 6 digestive enzymes and prebiotic inulin, with no fillers, grains or meat. It's not dressed up as a treat, because it isn't one. It's the part that actually works.",
        image: { url: "/lp/tub-capsules-spill.jpg", role: "Capsules spilling from the tub" },
        imagePosition: "right",
      },
    },

    // ---- 7 · Benefits (live page's 5 benefits, compliant phrasing) ----
    {
      type: "mechanism",
      data: {
        eyebrow: "What owners see",
        headline: "Real Relief You Can Actually See",
        subheadline:
          "One capsule a day works on the gut — and the gut is tied to almost everything you're seeing on the outside.",
        steps: [
          {
            title: "Calmer skin, fewer flare-ups",
            body: "Supports the healthy yeast balance that's often behind itching, paw licking and hot, irritated skin.",
          },
          {
            title: "Cleaner, comfier ears",
            body: "Works on the gut imbalance frequently behind recurring gunky, smelly ears and head shaking.",
          },
          {
            title: "Firmer poos, settled tummy",
            body: "5 strains plus 6 digestive enzymes help calm sloppy poos, wind and gurgling — usually the first change owners notice.",
          },
          {
            title: "Stronger natural defences",
            body: "A balanced gut supports your dog's immune system day to day, helping them cope with flare-up season.",
          },
          {
            title: "A brighter dog all round",
            body: "Owners report clearer eyes, fresher breath and a happier, more settled dog within weeks.",
          },
        ],
      },
    },

    // ---- 8 · Show, don't tell — Murphy's ears (real UGC proof) ----
    {
      type: "beforeAfter",
      data: {
        heading: "Murphy's Ears — Proof, Not Promises",
        caption:
          "Murphy the Labrador's ear before and after his owners switched to 5 Strain Probiotic+. In their words: “The gunk in his ears had gone, the smell had gone… we've spent thousands at the vets. I honestly wish we'd started it sooner.”",
        before: { url: "/lp/ear-before.jpg", role: "Murphy's ear before" },
        after: { url: "/lp/ear-after.jpg", role: "Murphy's ear after" },
      },
    },

    // ---- 9 · Vet authority (quote from the live page, tightened) ----
    {
      type: "vetPanel",
      data: {
        name: "Dr Kishan Vara",
        credential: "MRCVS · Veterinary Surgeon",
        quote:
          "Daily probiotics and enzymes make a meaningful difference to a dog's digestion. This formula pairs beneficial Lactobacillus and Bifidobacterium strains with prebiotic chicory root, helping good bacteria flourish. It's an excellent proactive choice for dogs with sensitive stomachs, inflamed ears or recurring digestive upset.",
        image: { url: "/lp/vet-kishan.jpg", role: "Dr Kishan Vara portrait" },
      },
    },

    // ---- 10 · How to use (live page's SNAP/SERVE, rebuilt for capsules) ----
    {
      type: "imageText",
      data: {
        heading: "Ten Seconds a Day. No Wrestling.",
        body: "No hiding tablets in pâté, no prising jaws open. Twist the capsule, sprinkle the meat-free chicken-flavour powder over dinner, done — it's a sprinkle, not a pill. One capsule a day for dogs up to 25kg (two for 25–40kg, three above), so a single 90-capsule tub lasts a smaller dog around three months.",
        image: { url: "/lp/sprinkle-on-food.jpg", role: "Sprinkling a capsule over a food bowl" },
        imagePosition: "left",
      },
    },

    // ---- 11 · Comparison (live page's table, upgraded) ----
    {
      type: "chewsComparison",
      data: {
        heading: "5 Strain Probiotic+ vs the Chews in Your Cupboard",
        usLabel: "5 Strain Probiotic+",
        themLabel: "Typical probiotic chews",
        rows: [
          {
            feature: "Live bacteria per serving",
            us: "5 billion, sealed dry",
            them: "~1 billion, fading daily",
          },
          {
            feature: "Manufacturing",
            us: "Cold-filled, never baked",
            them: "Baked — heat kills up to 90%",
          },
          {
            feature: "Moisture in the tub",
            us: "Dry capsule, cultures stay dormant",
            them: "Moist — wakes bacteria early",
          },
          {
            feature: "What else is inside",
            us: "No fillers, grains or meat",
            them: "Fillers, flavourings, grains",
          },
          {
            feature: "Cost per day",
            us: "Around 40p a day",
            them: "Often double, for less",
          },
        ],
      },
    },

    // ---- 12 · The formula (live page's strain grid) ----
    {
      type: "strainBreakdown",
      data: {
        heading: "What's Inside Every Capsule",
        strains: [
          { name: "Lactobacillus acidophilus" },
          { name: "Lactobacillus rhamnosus" },
          { name: "Lactobacillus plantarum" },
          { name: "Lactobacillus brevis" },
          { name: "Bifidobacterium lactis" },
        ],
        total: "5 billion live cultures per capsule",
        addOns: [
          {
            label: "Prebiotic inulin · 250mg",
            detail: "Chicory root — feeds the good bacteria so they take hold",
          },
          {
            label: "6 digestive enzymes · 150mg",
            detail: "Help break food down, so your dog absorbs the goodness you pay for",
          },
        ],
      },
    },

    // ---- 13 · Proof wall (stats + short quotes T13 / T03 / T38) ----
    {
      type: "proof",
      data: {
        headline: "Hear It From the Owners Who'd Tried Everything",
        stats: [
          { value: "4,537+", label: "verified reviews" },
          { value: "20,000+", label: "dogs helped in 12 months" },
          { value: "51%", label: "of profits to animal rescue" },
        ],
        reviews: [
          {
            quote:
              "Constantly chewing and licking his paws… ears full of black gunk. I tried 3 companies' probiotics before which did not make any difference. No more scratching or licking, his ears are very very clean — and his eyes literally sparkle.",
            author: "Amanda H. · Frenchie",
            rating: 5,
          },
          {
            quote:
              "He had monthly injections at the vets for so-called allergies at £120 a month. Two months on this probiotic and the change is amazing. If your dog has been licking or scratching, you won't regret it.",
            author: "Shaun M. · French Bulldog",
            rating: 5,
          },
          {
            quote:
              "Amazing results. The only thing that has worked — and I feel like I've tried every potion.",
            author: "Kim B.",
            rating: 5,
          },
        ],
      },
    },

    // ---- 14 · The killer cost-vs-vet story (T39, with real photo) ----
    {
      type: "reviewCard",
      data: {
        quote:
          "My bulldog licked her paws bald and raw every summer for two and a half years. I tried everything including medication from the vet. Nothing worked… Within a week it started working and three weeks later there's no paw licking at all. The vet was costing me £140 every two weeks. This is £33 and lasts two months. I don't work for these guys, I just wanted people to know.",
        name: "Chris B.",
        rating: 5,
        verified: true,
        image: { url: "/lp/review-chris-b.jpeg", role: "Chris B.'s bulldog" },
      },
    },
    {
      type: "reviewCard",
      data: {
        quote:
          "My dog was on the baked chews but saw the advert saying non-baked is better. Two and a half weeks on these and a massive difference already. Since 2018 I've spent so much on vets, steroids, ear drops — and now her ears are practically clean, no itching at all.",
        name: "Katie S.",
        rating: 5,
        verified: true,
        image: { url: "/lp/review-katie-s.jpeg", role: "Katie S.'s shih tzu" },
      },
    },

    // ---- 15 · Bear — the rescue story that carries the 51% mission ----
    {
      type: "beforeAfter",
      data: {
        heading: "Bear's Story",
        caption:
          "Bear spent his first eight years on a narrowboat, used as a stud dog and left in a terrible state — fur shaved off, skin raw with sores. Fourteen months of Good For Pets supplements (and some vet help) later: skin calm, full coat back. Dogs like Bear are why 51% of our profits go to animal rescue.",
        before: { url: "/lp/bear-before.jpg", role: "Bear before — raw, inflamed skin" },
        after: { url: "/lp/bear-after.jpg", role: "Bear after — calm skin, full coat" },
      },
    },

    // ---- 16 · Offer (real live pricing, honest subscription terms) ----
    {
      type: "offer",
      data: {
        headline: "Start Your Dog's 90-Day Gut Reset",
        subheadline:
          "One tub = 90 sprinkle capsules — around three months for a dog up to 25kg.",
        bullets: [
          "5 billion live cultures per capsule — cold-filled, never baked",
          "6 digestive enzymes + prebiotic inulin in every dose",
          "Meat-free chicken flavour dogs love · no fillers, grains or meat",
          "Subscribe & Save: 30% off your first tub (£31.49), then 20% off for life — pause or cancel anytime",
          "Prefer a one-off? £44.99 a tub · free tracked 48hr shipping on subscriptions and orders over £50",
          "Works out around 40p a day — roughly half the daily cost of the big-name chews",
        ],
        guarantee:
          "90-day money-back guarantee: if your dog isn't more comfortable, you get every penny back. No questions, no quibbles.",
        image: "/lp/tub-white.jpg",
      },
    },
    {
      type: "trustBadgeRow",
      data: {
        badges: [
          { label: "Made in the UK", icon: "flag" },
          { label: "GMP-certified facility", icon: "shield" },
          { label: "No fillers, grains or meat", icon: "leaf" },
          { label: "51% of profits to rescue", icon: "heart" },
        ],
      },
    },

    // ---- 17 · Honest expectations (fights the #1 churn reason) ----
    {
      type: "expectationTimeline",
      data: {
        heading: "What to Expect — We'd Rather Be Honest Than Fast",
        steps: [
          {
            when: "Weeks 1–2",
            title: "The gut settles first",
            body: "Firmer poos, less wind, a bit more energy. A brief adjustment period is completely normal — start on a half dose for the first week.",
          },
          {
            when: "Weeks 3–6",
            title: "The outside catches up",
            body: "Less paw licking and scratching, and ears that start staying cleaner between cleans.",
          },
          {
            when: "Weeks 6–12",
            title: "The new normal",
            body: "Calmer skin, comfortable ears, a brighter dog. Give it the full 90 days — you're covered by the guarantee either way.",
          },
        ],
      },
    },
    {
      type: "guaranteeBlock",
      data: {
        days: 90,
        text: "Try 5 Strain Probiotic+ for a full 90 days. If you're not seeing a calmer, more comfortable dog, tell us and we'll refund every penny — even if the tub is empty.",
      },
    },

    // ---- 18 · FAQ (live page's Qs, rebuilt for capsules + honesty) ----
    {
      type: "faq",
      data: {
        headline: "Got Questions? We've Got Honest Answers.",
        items: [
          {
            q: "Will this actually help with the itching, paw licking and gunky ears?",
            a: "These symptoms are often driven by the gut, which is why creams and sprays keep failing — they never touch the cause. 5 Strain Probiotic+ works on gut and yeast balance, which is closely tied to skin and ears. It's not a magic cure and won't suit every case, but for a lot of dogs it's the missing piece — and the 90-day guarantee means you can find out risk-free.",
          },
          {
            q: "How is this different from the probiotic chews I've already tried?",
            a: "Two ways chews fail: they're baked (heat can destroy up to 90% of the live bacteria before the tub is sealed) and they're moist (moisture wakes the survivors up so they burn out on the shelf). Our capsule is cold-filled and bone dry — the 5 billion cultures stay dormant until they hit the gut. That's around 5× what a typical chew delivers.",
          },
          {
            q: "How long until I see a difference?",
            a: "We'd rather be honest than overpromise: most owners notice firmer stools and more energy in the first couple of weeks. Itchy skin and ears take longer — often 6 to 8 weeks. Give it the full 90 days; you're covered by the guarantee the whole time.",
          },
          {
            q: "My dog is fussy — will they actually eat it?",
            a: "It's a sprinkle, not a pill. Twist the capsule open and mix the meat-free chicken-flavour powder into their food. Nearly all dogs take it first time — no crushing, no pill pockets, no wrestling.",
          },
          {
            q: "Is it natural and safe?",
            a: "Yes — no fillers, grains, meat or artificial additives, in a vegan capsule shell. It's made in the UK to GMP standards on a human-supplement production line, and co-developed with vet Dr Kishan Vara MRCVS. Not for puppies under 12 weeks or pregnant dogs, and if your dog is under vet treatment it's worth a quick word with them first.",
          },
          {
            q: "How long does one tub last?",
            a: "Each tub has 90 capsules. Dogs up to 25kg need one a day (about three months per tub), 25–40kg two a day, and over 40kg three a day.",
          },
          {
            q: "Can I pause or cancel the subscription?",
            a: "Any time, in a couple of clicks — no phone calls, no hoops. You also get 30% off your first tub and 20% off every delivery after that.",
          },
        ],
      },
    },

    // ---- 19 · Resolution scene + final CTA (guilt → relief, 51% closer) ----
    {
      type: "image",
      data: {
        image: {
          url: "/lp/scene-walk.jpg",
          role: "Owner and dog on a happy morning walk",
        },
        caption:
          "Peace of mind that you're finally doing the best by him — that's what you're really buying.",
      },
    },
    {
      type: "finalCta",
      data: {
        headline: "Help Your Dog Finally Feel Comfortable Again",
        subheadline:
          "Calmer skin, cleaner ears and a settled tummy — from one ten-second sprinkle a day. And 51% of the profit goes straight to rescue dogs like Bear.",
        ctaLabel: "Start My Dog's Relief",
        trustLine:
          "90-day money-back guarantee · Free 48hr tracked shipping on subscriptions · Pause or cancel anytime",
      },
    },
  ],
};
