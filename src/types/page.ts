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
  };
  fonts: {
    /** CSS font-family stack for headings. */
    heading: string;
    /** CSS font-family stack for body copy. */
    body: string;
  };
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

/** Any section. Discriminate on `.type`. */
export type Section =
  | HeroSection
  | ProblemAgitateSection
  | MechanismSection
  | ProofSection
  | OfferSection
  | FaqSection
  | FinalCtaSection;

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
