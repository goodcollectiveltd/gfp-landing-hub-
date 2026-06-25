import type { LandingPage } from "@/types/page";

// A showcase page exercising the new flexible blocks + image placeholders.
// Used only as a local preview at /p/blocks-demo (renderer test).
export const sampleBlocks: LandingPage = {
  slug: "blocks-demo",
  status: "published",
  title: "Flexible blocks demo",
  brandKit: {
    name: "Good For Pets",
    wordmark: "Good For Pets",
    colors: {
      primary: "#EF3824",
      onPrimary: "#ffffff",
      accent: "#1A1A1A",
      background: "#FBF7F2",
      text: "#1A1A1A",
      muted: "#6B6B6B",
    },
    fonts: {
      heading: "'Georgia', 'Times New Roman', serif",
      body: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    },
  },
  buyBox: {
    productName: "5 Strain Probiotic+",
    price: "£44.99",
    ctaLabel: "Shop Now",
    productUrl: "https://goodforpets.co/products/5-strain-probiotic",
  },
  sections: [
    {
      type: "richText",
      data: {
        eyebrow: "Vet column",
        heading: "If your dog won't stop licking their paws, it often starts in the gut",
        paragraphs: [
          "This is a sample article block — the kind of editorial intro a competitor might open with.",
          "The generator fills these with your brand's original copy, grounded in your real product.",
        ],
      },
    },
    {
      type: "imageText",
      data: {
        heading: "Cold-filled, so the good bacteria survive",
        body: "Image + text block. The image on the left is a placeholder — you'd drop a product or process shot in from your library.",
        image: { role: "Product / process shot" },
        imagePosition: "left",
      },
    },
    {
      type: "quote",
      data: {
        quote: "I recommend a cold-filled probiotic for dogs with recurring skin and gut issues.",
        attribution: "Dr Kishan Vara, MRCVS",
        image: { role: "Vet photo" },
      },
    },
    {
      type: "beforeAfter",
      data: {
        heading: "8 weeks of daily use",
        caption: "Upload your own before/after photos here.",
        before: { role: "Before photo" },
        after: { role: "After photo" },
      },
    },
    {
      type: "comparison",
      data: {
        heading: "Good For Pets vs typical chews",
        usLabel: "Good For Pets",
        themLabel: "Typical chews",
        rows: [
          { feature: "Live cultures", us: "5 billion CFU", them: "Often unlisted" },
          { feature: "Form", us: "Cold-filled capsule", them: "Heat-baked chew" },
          { feature: "Strains", us: "5 named", them: "1 unnamed" },
          { feature: "Made in", us: "UK", them: "Often overseas" },
        ],
      },
    },
    {
      type: "finalCta",
      data: {
        headline: "Give your dog a calmer, more comfortable life",
        ctaLabel: "Shop 5 Strain Probiotic+",
        trustLine: "90-day money-back guarantee · 51% of profits donated",
      },
    },
  ],
};
