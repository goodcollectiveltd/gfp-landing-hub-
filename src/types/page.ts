// Data model for a landing page.
//
// This mirrors the shape we'll eventually store in the Supabase `landing_pages`
// table and the structured JSON the `generate-page` edge function will output.
// The LLM fills these typed "slots" — it can reorder and populate sections, but
// it cannot invent new layout. Keep this file as the single source of truth for
// the section schema; the components and the (later) generator both depend on it.

/** A brand kit = the once-set visual + voice identity applied to every page. */
export interface BrandKit {
  /** Display name of the brand. */
  name: string;
  /** Short wordmark shown in the header if no logo image is provided. */
  wordmark: string;
  /** Optional logo image URL; shown in the header instead of the wordmark text. */
  logoUrl?: string;
  colors: {
    /** Primary brand color — buttons, accents, sticky buy bar. */
    primary: string;
    /** Text color that sits on top of `primary` (e.g. white on a dark button). */
    onPrimary: string;
    /** Secondary accent for highlights, eyebrows, icons. */
    accent: string;
    /** Page background. */
    background: string;
    /** Default body text color. */
    text: string;
    /** Muted text color for secondary copy. */
    muted: string;
    // --- v2 role palette (optional; renderer fills sensible defaults) ---
    /** Page base — the dominant background. White, never cream. */
    base?: string;
    /** Pale tint band used to alternate section backgrounds. */
    surfaceTint?: string;
    /** Darker shade of the accent for headings / depth. */
    accentDeep?: string;
    /** Heading colour — near-black ink. */
    ink?: string;
    /** Body copy colour — soft grey. */
    body?: string;
  };
  fonts: {
    /** CSS font-family stack for headings. */
    heading: string;
    /** CSS font-family stack for body copy. */
    body: string;
  };
  /** Non-system font family names to load from Google Fonts (e.g. ["Inter"]). */
  fontFamilies?: string[];
}

/** The Shopify-native buy box config (sticky bar + section CTAs share this). */
export interface BuyBoxConfig {
  productName: string;
  /** Display price, e.g. "$39". */
  price: string;
  /** Optional struck-through "was" price, e.g. "$59". */
  compareAtPrice?: string;
  /** Button label, e.g. "Add to Cart". */
  ctaLabel: string;
  /**
   * Shopify destination. Either a Buy Button / cart permalink or a product URL
   * that deep-links into checkout. Click-IDs (fbclid/utm) get appended at render
   * time on the public page so Meta attributes the conversion.
   */
  productUrl: string;
}

// ---------------------------------------------------------------------------
// Sections — a discriminated union keyed on `type`.
// ---------------------------------------------------------------------------

export interface HeroSection {
  type: "hero";
  data: {
    eyebrow?: string;
    headline: string;
    subheadline: string;
    /** Primary CTA label; scrolls to / triggers the buy box. */
    ctaLabel: string;
    /** Small trust line under the CTA, e.g. "Free shipping · 60-day guarantee". */
    trustLine?: string;
    /** Real product image URL (scraped from the product page). Falls back to a
     *  gradient placeholder when absent. */
    image?: string;
  };
}

export interface ProblemAgitateSection {
  type: "problemAgitate";
  data: {
    headline: string;
    intro?: string;
    /** The pains we're agitating — kept short and visceral. */
    painPoints: { title: string; body: string }[];
  };
}

export interface MechanismSection {
  type: "mechanism";
  data: {
    eyebrow?: string;
    headline: string;
    subheadline?: string;
    /** The "how it works" steps that make the promise believable. */
    steps: { title: string; body: string }[];
  };
}

export interface ProofSection {
  type: "proof";
  data: {
    headline: string;
    /** Headline stats / credibility numbers. */
    stats?: { value: string; label: string }[];
    /** Customer reviews / social proof. */
    reviews: { quote: string; author: string; rating: number }[];
  };
}

export interface OfferSection {
  type: "offer";
  data: {
    headline: string;
    subheadline?: string;
    /** What's included / why it's worth it. */
    bullets: string[];
    /** Reassurance line, e.g. "60-night money-back guarantee". */
    guarantee?: string;
    /** Real product packshot URL (scraped from the product page). Optional. */
    image?: string;
  };
}

export interface FaqSection {
  type: "faq";
  data: {
    headline: string;
    items: { q: string; a: string }[];
  };
}

export interface FinalCtaSection {
  type: "finalCta";
  data: {
    headline: string;
    subheadline?: string;
    ctaLabel: string;
    trustLine?: string;
  };
}

/**
 * A generation brief for a photographic slot that had no confident match in the
 * image library. The owner can drop this straight into an AI image pipeline.
 * Mirrors the build brief's image-brief schema (§5). Stored on the page record.
 */
export interface ImageBrief {
  /** Stable id for this slot within the page. */
  slotId: string;
  /** The section type the image lives in (e.g. "image", "beforeAfter"). */
  sectionType: string;
  placement: "left" | "right" | "full";
  aspectRatio: "1:1" | "4:5" | "16:9";
  /** Specific subject, e.g. "5 Strain Probiotic+ tub beside a bowl of food". */
  subject: string;
  /** Style reference, e.g. "clean studio, seamless brand-red #EF3824 background". */
  styleRef: string;
  /** Mood / cast, e.g. "real-looking older dog, owner 55-65, warm and calm". */
  mood: string;
  /** Composition safe-zone rule (Meta UI buffer). */
  safeZone: string;
  /** On-image text policy — none by default; text lives in the component. */
  textOverlay: string;
  /** What must not appear (claims, fake stats, competitor branding). */
  negativePrompt: string;
  /** Compliance note — product name always exactly "5 Strain Probiotic+". */
  compliance: string;
}

/**
 * An image slot. When `url` is set it renders the image; otherwise it renders a
 * labelled placeholder ("upload a vet photo here") the owner fills from their
 * image library. `role` describes what belongs there. When the slot was emitted
 * by the generator with no library match, `brief` carries a generation brief.
 */
export interface ImageSlot {
  url?: string;
  role?: string;
  brief?: ImageBrief;
}

// --- Flexible blocks (let a page mirror an arbitrary competitor structure) ---

/** Editorial / article text — heading + paragraphs. */
export interface RichTextSection {
  type: "richText";
  data: { eyebrow?: string; heading?: string; paragraphs: string[] };
}

/** Image beside text (alternating media sections). */
export interface ImageTextSection {
  type: "imageText";
  data: {
    heading?: string;
    body: string;
    image: ImageSlot;
    imagePosition?: "left" | "right";
  };
}

/** "Us vs them" comparison table. */
export interface ComparisonSection {
  type: "comparison";
  data: {
    heading?: string;
    usLabel: string;
    themLabel: string;
    rows: { feature: string; us: string; them: string }[];
  };
}

/** Before / after with two image slots. */
export interface BeforeAfterSection {
  type: "beforeAfter";
  data: { heading?: string; caption?: string; before: ImageSlot; after: ImageSlot };
}

/** Authority / testimonial quote with an optional portrait (e.g. the vet). */
export interface QuoteSection {
  type: "quote";
  data: { quote: string; attribution?: string; image?: ImageSlot };
}

/** A standalone image (or placeholder) with an optional caption. */
export interface ImageSection {
  type: "image";
  data: { image: ImageSlot; caption?: string };
}

// ---------------------------------------------------------------------------
// Visual component library — bespoke, themed, prop-driven blocks. These are the
// "default" for any idea section (a mechanism, comparison, process, stat, proof
// point): the generator emits a designed component, not a flat image+text block.
// Each `data` shape mirrors the matching component's props in
// `src/components/visuals/`. See the visual-fidelity build brief.
// ---------------------------------------------------------------------------

/** The "potency paradox": baked chews kill live bacteria; cold-fill keeps them alive. */
export interface MechanismDiagramSection {
  type: "mechanismDiagram";
  data: { heading?: string; subhead?: string };
}

/** Good bacteria crowding out the bad — two balance rings. supports/helps framing only. */
export interface GutRebalanceSection {
  type: "gutRebalance";
  data: { heading?: string; caption?: string };
}

/** The five named strains + prebiotic/enzyme add-ons, as designed capsule chips. */
export interface StrainBreakdownSection {
  type: "strainBreakdown";
  data: {
    heading?: string;
    strains: { name: string; cfu?: string }[];
    total?: string;
    addOns?: { label: string; detail?: string }[];
  };
}

/** Top symptoms shown as "often starts in the gut, not the skin" (associative only). */
export interface SymptomToGutSection {
  type: "symptomToGut";
  data: { heading?: string; symptoms?: string[]; caption?: string };
}

/** "What to expect" timeline — week 1, 2-3, 4+. */
export interface ExpectationTimelineSection {
  type: "expectationTimeline";
  data: { heading?: string; steps: { when: string; title: string; body: string }[] };
}

/** Designed "us vs typical chews" comparison (tick/cross, brand column highlighted). */
export interface ChewsComparisonSection {
  type: "chewsComparison";
  data: {
    heading?: string;
    usLabel?: string;
    themLabel?: string;
    rows: { feature: string; us: string; them: string; usWins?: boolean }[];
  };
}

/** A row of large, legible stat figures (big number + label). */
export interface StatPanelSection {
  type: "statPanel";
  data: { heading?: string; stats: { value: string; label: string }[] };
}

/** Compact trust strip — stars, rating, review count, optional second proof number. */
export interface SocialProofBarSection {
  type: "socialProofBar";
  data: { rating?: number; reviewCount?: string; extraValue?: string; extraLabel?: string };
}

/** A numbered reason (for "N reasons" listicles) with an optional real image. */
export interface NumberedReasonSection {
  type: "numberedReason";
  data: {
    number: number;
    title: string;
    body: string;
    image?: ImageSlot;
    imagePosition?: "left" | "right";
  };
}

/** Polished testimonial card — stars, quote, name, "Verified Customer", optional photo. */
export interface ReviewCardSection {
  type: "reviewCard";
  data: { quote: string; name: string; rating?: number; image?: ImageSlot; verified?: boolean };
}

/** A row of trust badges (UK-made, GMP, vegan, charity). */
export interface TrustBadgeRowSection {
  type: "trustBadgeRow";
  data: { badges?: { label: string; icon?: "flag" | "shield" | "leaf" | "heart" }[] };
}

/** The money-back guarantee, as a designed seal + line. */
export interface GuaranteeBlockSection {
  type: "guaranteeBlock";
  data: { days?: number; text?: string };
}

/** Vet credibility panel — portrait, name, credential, on-record quote. */
export interface VetPanelSection {
  type: "vetPanel";
  data: { name: string; credential: string; quote: string; image?: ImageSlot };
}

/**
 * The escape hatch: a bespoke diagram the generator authors directly as
 * sanitised SVG/HTML markup (brand CSS variables only, no scripts/handlers) when
 * no library component fits. `markup` is sanitised again at render time as a
 * safety net. `designBrief` is stored so the block can be regenerated or swapped.
 * NOT raw freeform HTML pages — a single themeable, editable block.
 */
export interface CustomVisualSection {
  type: "customVisual";
  data: {
    /** Sanitised SVG/HTML markup, themed via brand CSS variables. */
    markup: string;
    /** The design brief that produced it (for regenerate / swap / edit). */
    designBrief: string;
    /** Optional heading shown above the visual. */
    heading?: string;
  };
}

/** Any section. Discriminate on `.type`. */
export type Section =
  | HeroSection
  | ProblemAgitateSection
  | MechanismSection
  | ProofSection
  | OfferSection
  | FaqSection
  | FinalCtaSection
  | RichTextSection
  | ImageTextSection
  | ComparisonSection
  | BeforeAfterSection
  | QuoteSection
  | ImageSection
  // Visual component library
  | MechanismDiagramSection
  | GutRebalanceSection
  | StrainBreakdownSection
  | SymptomToGutSection
  | ExpectationTimelineSection
  | ChewsComparisonSection
  | StatPanelSection
  | SocialProofBarSection
  | NumberedReasonSection
  | ReviewCardSection
  | TrustBadgeRowSection
  | GuaranteeBlockSection
  | VetPanelSection
  // Bespoke escape hatch
  | CustomVisualSection;

export type SectionType = Section["type"];

/** A full landing page = brand kit + buy box + an ordered list of sections. */
export interface LandingPage {
  slug: string;
  status: "draft" | "published";
  /** Internal title shown in the admin console (not rendered on the page). */
  title: string;
  brandKit: BrandKit;
  buyBox: BuyBoxConfig;
  sections: Section[];
}
