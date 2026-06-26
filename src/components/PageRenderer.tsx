import { useEffect, type CSSProperties, type ReactNode } from "react";
import type { BuyBoxConfig, LandingPage, Section } from "@/types/page";

import Hero from "@/components/sections/Hero";
import ProblemAgitate from "@/components/sections/ProblemAgitate";
import Mechanism from "@/components/sections/Mechanism";
import Proof from "@/components/sections/Proof";
import Offer from "@/components/sections/Offer";
import FAQ from "@/components/sections/FAQ";
import FinalCTA from "@/components/sections/FinalCTA";
import BuyBox from "@/components/sections/BuyBox";
import RichText from "@/components/sections/RichText";
import ImageText from "@/components/sections/ImageText";
import Comparison from "@/components/sections/Comparison";
import BeforeAfter from "@/components/sections/BeforeAfter";
import Quote from "@/components/sections/Quote";
import ImageBlock from "@/components/sections/ImageBlock";

// Visual component library — bespoke themed blocks the generator can emit.
import MechanismDiagram from "@/components/visuals/MechanismDiagram";
import GutRebalanceVisual from "@/components/visuals/GutRebalanceVisual";
import StrainBreakdown from "@/components/visuals/StrainBreakdown";
import SymptomToGut from "@/components/visuals/SymptomToGut";
import ExpectationTimeline from "@/components/visuals/ExpectationTimeline";
import ChewsComparison from "@/components/visuals/ChewsComparison";
import StatPanel from "@/components/visuals/StatPanel";
import SocialProofBar from "@/components/visuals/SocialProofBar";
import NumberedReasonCard from "@/components/visuals/NumberedReasonCard";
import ReviewCard from "@/components/visuals/ReviewCard";
import TrustBadgeRow from "@/components/visuals/TrustBadgeRow";
import GuaranteeBlock from "@/components/visuals/GuaranteeBlock";
import VetPanel from "@/components/visuals/VetPanel";
import CustomVisual from "@/components/sections/CustomVisual";

/**
 * Renders a full landing page from its JSON. Brand kit → CSS variables, then the
 * ordered `sections` array → the matching fixed components. This is the heart of
 * the "template + fill the slots" approach: the generator can reorder/populate
 * sections but never touches layout.
 */
export default function PageRenderer({
  page,
  embedded = false,
}: {
  page: LandingPage;
  /** Render for an in-admin preview (buy bar sticks to the container, not the viewport). */
  embedded?: boolean;
}) {
  const { brandKit, buyBox, sections } = page;

  // Load any non-system brand fonts from Google Fonts.
  const familyKey = (brandKit.fontFamilies ?? []).join(",");
  useEffect(() => {
    const families = brandKit.fontFamilies ?? [];
    if (!families.length) return;
    // Request the full weight range so headings render in TRUE bold (e.g.
    // Poppins 700/800), not a browser-synthesised faux-bold of the 400 file.
    const href =
      "https://fonts.googleapis.com/css2?" +
      families
        .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}:wght@400;500;600;700;800`)
        .join("&") +
      "&display=swap";
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyKey]);

  // Brand kit drives every color/font via CSS variables (see index.css helpers).
  // The v2 role palette is authoritative: white base, vermilion accent, ink
  // headings, grey body. We prefer the brand's role fields and fall back to the
  // v2 defaults — deliberately NOT using the legacy cream `background` / dark
  // `text` values, so older brand rows still render on-spec.
  const c = brandKit.colors;
  const accent = c.accent || c.primary;
  const brandVars = {
    "--brand-primary": c.primary,
    "--brand-on-primary": c.onPrimary,
    "--brand-accent": accent,
    "--brand-accent-deep": c.accentDeep ?? "#C02A18",
    "--brand-base": c.base ?? "#FFFFFF",
    "--brand-surface-tint": c.surfaceTint ?? "#FCEAE6",
    "--brand-ink": c.ink ?? "#161616",
    "--brand-text": c.body ?? "#4B4B4B",
    "--brand-muted": c.muted && c.body ? c.muted : "#6B6B6B",
    // Back-compat: .lp-root reads --brand-bg.
    "--brand-bg": c.base ?? "#FFFFFF",
    "--font-heading": brandKit.fonts.heading,
    "--font-body": brandKit.fonts.body,
  } as CSSProperties;

  // Section rhythm: alternate white / pale-tint bands so no two adjacent
  // sections share a background. Full-vermilion "feature" sections (the closing
  // CTA) paint their own background, so the band stays transparent for them.
  const FEATURE_TYPES = new Set(["finalCta"]);
  let nf = 0; // counts non-feature sections to drive the alternation
  const toneFor = (type: string): "white" | "tint" | "feature" => {
    if (FEATURE_TYPES.has(type)) return "feature";
    return nf++ % 2 === 0 ? "white" : "tint";
  };

  return (
    <div className="lp-root min-h-screen" style={brandVars}>
      {/* Minimal brand header: logo image if available, else the wordmark text. */}
      <header className="flex items-center justify-center border-b border-black/5 px-6 py-3">
        {brandKit.logoUrl ? (
          <img src={brandKit.logoUrl} alt={brandKit.name} className="h-11 w-auto sm:h-12" />
        ) : (
          <span className="lp-heading lp-accent-text text-2xl font-extrabold">
            {brandKit.wordmark}
          </span>
        )}
      </header>

      {/* Ordered sections, each in a rhythm band. pb-24 leaves room for the
          sticky buy bar. */}
      <main className="pb-24">
        {sections.map((section, i) => (
          <div key={i} className="lp-band" data-tone={toneFor(section.type)}>
            {renderSection(section, buyBox)}
          </div>
        ))}
      </main>

      <BuyBox buyBox={buyBox} embedded={embedded} />
    </div>
  );
}

/** Map one section to its component. The band wrapper supplies the key. */
function renderSection(section: Section, buyBox: BuyBoxConfig): ReactNode {
  switch (section.type) {
    case "hero":
      return <Hero data={section.data} productUrl={buyBox.productUrl} />;
    case "problemAgitate":
      return <ProblemAgitate data={section.data} />;
    case "mechanism":
      return <Mechanism data={section.data} />;
    case "proof":
      return <Proof data={section.data} />;
    case "offer":
      return <Offer data={section.data} buyBox={buyBox} />;
    case "faq":
      return <FAQ data={section.data} />;
    case "finalCta":
      return <FinalCTA data={section.data} productUrl={buyBox.productUrl} />;
    case "richText":
      return <RichText data={section.data} />;
    case "imageText":
      return <ImageText data={section.data} />;
    case "comparison":
      return <Comparison data={section.data} />;
    case "beforeAfter":
      return <BeforeAfter data={section.data} />;
    case "quote":
      return <Quote data={section.data} />;
    case "image":
      return <ImageBlock data={section.data} />;

    // Visual component library — props are passed directly (not wrapped in
    // `data`), so we spread the section's data into the component.
    case "mechanismDiagram":
      return <MechanismDiagram {...section.data} />;
    case "gutRebalance":
      return <GutRebalanceVisual {...section.data} />;
    case "strainBreakdown":
      return <StrainBreakdown {...section.data} />;
    case "symptomToGut":
      return <SymptomToGut {...section.data} />;
    case "expectationTimeline":
      return <ExpectationTimeline {...section.data} />;
    case "chewsComparison":
      return <ChewsComparison {...section.data} />;
    case "statPanel":
      return <StatPanel {...section.data} />;
    case "socialProofBar":
      return <SocialProofBar {...section.data} />;
    case "numberedReason":
      return <NumberedReasonCard {...section.data} />;
    case "reviewCard":
      return <ReviewCard {...section.data} />;
    case "trustBadgeRow":
      return <TrustBadgeRow {...section.data} />;
    case "guaranteeBlock":
      return <GuaranteeBlock {...section.data} />;
    case "vetPanel":
      return <VetPanel {...section.data} />;

    // Bespoke escape hatch (markup sanitised at render time).
    case "customVisual":
      return <CustomVisual data={section.data} />;

    default:
      // Exhaustiveness guard: a new section type without a renderer becomes a
      // compile error here.
      return assertNever(section);
  }
}

function assertNever(x: never): never {
  throw new Error(`Unhandled section type: ${JSON.stringify(x)}`);
}
