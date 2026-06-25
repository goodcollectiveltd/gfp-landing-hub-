// One-off: push the Good For Pets brand into brand_kits via the Supabase
// Management API (privileged), so it appears in the Hub. Run:
//   SB_TOKEN=... PROJECT_REF=... node scripts/push-brand.mjs
const TOKEN = process.env.SB_TOKEN;
const REF = process.env.PROJECT_REF;

const brand = {
  name: "Good For Pets",
  wordmark: "Good For Pets",
  tagline:
    "Help your dog feel their best, and help a dog in need. We give 51% of profits to animal welfare.",
  about:
    "Good For Pets is a founder-led, UK-made dog supplement brand built on radical transparency and a simple belief: no one should have to lose for your dog to win. Our hero, 5 Strain Probiotic+, is a cold-filled capsule co-developed with a practising vet, delivering 5 billion live cultures from five research-backed strains plus chicory-root prebiotic, with none of the heat, moisture or fillers that weaken typical chews. We show you the strains, the CFU and where it's made, while the category hides behind unnamed blends and scare tactics. And because helping your dog should help dogs everywhere, we give 51% of our profits to UK animal welfare charities including the RSPCA, Dogs Trust and Guide Dogs.",
  audience:
    "Primarily women aged 45 to 65+ in the UK who treat their dog as family. Their dog has a persistent, visible problem they're desperate to solve: constant paw licking, itchy or flaky skin, scratching, gunky ears, scooting or an unsettled gut. They've usually tried chews, vet trips, steroids or ear drops that cost a fortune and didn't last. They're sceptical of bold marketing, so they're won over by evidence, real reviews, founder honesty and a clear label. What they want is simple: a calmer, more comfortable dog, better value than the vet, and a brand they can actually trust.",
  voice:
    "A straight-talking UK founder and dog-lover who respects the reader's intelligence: honest, plain-spoken, science-led, proud of the mission, and willing to call out the category's hype without using it.",
  tone_dos: [
    "Write in first person, founder to one worried owner",
    "Lead with the dog's problem in the owner's words (paw licking, itchy skin, gunky ears, scooting)",
    "Back every claim with specifics: 5 strains, 5 billion CFU, cold-filled capsule, UK made, the vet",
    "Make the mission a flywheel, not a footnote: their purchase helps another dog",
    "Challenge the category at the category level (heat-killed chews, unnamed single strains, tiny doses, fillers, overseas factories, fear-mongering)",
    "Use real reviews and concrete numbers (20,000+ dogs helped, 54% cheaper, 90-day money-back)",
    "Sentence case, short paragraphs, roughly fifth-grade reading level, adult register",
    "Acknowledge scepticism and earn trust before the sale",
  ],
  tone_donts: [
    "No em dashes",
    "No hype words: miracle, breakthrough, magic, cure-all",
    "Don't claim to cure, treat or prevent any condition",
    "Don't name a specific competitor when knocking unless the exact knock is documented and true",
    "Don't position the supplement as a replacement for veterinary care",
    "Don't guilt-trip the owner or fear-monger",
    "No corporate filler or hedging",
  ],
  example_phrases: [
    "If your dog won't stop licking their paws, they're trying to tell you something. It often starts in the gut.",
    "5 billion live cultures. Up to 20x what some chews deliver. One small capsule a day.",
    "54% cheaper per serving than our top 10 competitors for a 20kg dog. Better value than the vet, too.",
    "Most chews kill the bacteria in the tub. Ours is cold-filled, so the good bacteria actually reach your dog.",
    "Five named strains. Chicory-root prebiotic. No fillers, no grains. Made in the UK.",
    "Co-developed with our vet. Nothing hidden, nothing to spin.",
    "When you help your dog, you help a dog in need. 51% of our profits go to animal welfare. That's the whole point.",
    "20,000+ dogs helped in the last year, and a 90-day money-back guarantee if yours isn't one of them.",
    "Real reviews from real owners, not stock photos and slogans.",
    "We won't scare you into buying. We'll just show you the label.",
  ],
  allowed_claims: [
    "Five research-backed strains: Lactobacillus acidophilus, Lactobacillus rhamnosus, Lactobacillus brevis, Lactobacillus plantarum, Bifidobacterium lactis",
    "5 billion live cultures (CFU) per serving",
    "Up to 20x the live cultures (CFU) of some competitors",
    "Up to 54% cheaper per serving than our top 10 competitors for a 20kg dog",
    "Includes chicory-root prebiotic (inulin) to feed the beneficial bacteria",
    "Cold-filled capsule, heat and moisture free, to protect the live cultures that chews can degrade",
    "No unhealthy fillers or grains",
    "Made in the UK",
    "Co-developed with practising UK vet Dr Kishan Vara MRCVS",
    "Human-grade ingredients",
    "Supports a healthy gut microbiome, digestion and firmer, more regular stools",
    "Supports the gut-skin connection, helping maintain healthy skin and a glossy coat",
    "Supports natural immune defences and a healthy yeast balance",
    "Suitable for daily, long-term use across breeds and sizes",
    "20,000+ dogs helped in the last 12 months",
    "Backed by 4,537+ verified reviews",
    "90-day money-back guarantee",
    "51% of profits donated to UK animal welfare charities including the RSPCA, Dogs Trust and Guide Dogs",
  ],
  banned_words: [],
  colors: {
    primary: "#EF3824",
    onPrimary: "#ffffff",
    accent: "#1A1A1A",
    background: "#FBF7F2",
    text: "#1A1A1A",
    muted: "#6B6B6B",
  },
  palette: [
    { label: "Ink", hex: "#1A1A1A" },
    { label: "Warm off-white", hex: "#FBF7F2" },
    { label: "Neutral grey", hex: "#6B6B6B" },
  ],
  logos: [],
  fonts: {
    heading: "'Georgia', 'Times New Roman', serif",
    body: "system-ui, -apple-system, 'Segoe UI', sans-serif",
  },
  default_product_url: "https://goodforpets.co/pages/probioplus",
};

// SQL builders using dollar-quoting so apostrophes need no escaping.
const t = (s) => `$t$${s}$t$`;
const arr = (a) =>
  a.length ? `array[${a.map((x) => `$q$${x}$q$`).join(",")}]::text[]` : `array[]::text[]`;
const j = (o) => `$j$${JSON.stringify(o)}$j$::jsonb`;

const sql = `
insert into public.brand_kits
  (name, wordmark, tagline, about, audience, voice, tone_dos, tone_donts,
   example_phrases, allowed_claims, banned_words, colors, palette, logos, fonts,
   default_product_url, updated_at)
values
  (${t(brand.name)}, ${t(brand.wordmark)}, ${t(brand.tagline)}, ${t(brand.about)},
   ${t(brand.audience)}, ${t(brand.voice)}, ${arr(brand.tone_dos)}, ${arr(brand.tone_donts)},
   ${arr(brand.example_phrases)}, ${arr(brand.allowed_claims)}, ${arr(brand.banned_words)},
   ${j(brand.colors)}, ${j(brand.palette)}, ${j(brand.logos)}, ${j(brand.fonts)},
   ${t(brand.default_product_url)}, now())
returning id, name;
`;

const res = await fetch(
  `https://api.supabase.com/v1/projects/${REF}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  }
);
console.log("HTTP", res.status);
console.log(await res.text());
