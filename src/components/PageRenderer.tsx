import { useEffect, type CSSProperties } from "react";
import type { LandingPage } from "@/types/page";

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
    const href =
      "https://fonts.googleapis.com/css2?" +
      families.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}`).join("&") +
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
  const brandVars = {
    "--brand-primary": brandKit.colors.primary,
    "--brand-on-primary": brandKit.colors.onPrimary,
    "--brand-accent": brandKit.colors.accent,
    "--brand-bg": brandKit.colors.background,
    "--brand-text": brandKit.colors.text,
    "--brand-muted": brandKit.colors.muted,
    "--font-heading": brandKit.fonts.heading,
    "--font-body": brandKit.fonts.body,
  } as CSSProperties;

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

      {/* Ordered sections. pb-24 leaves room for the sticky buy bar. */}
      <main className="pb-24">
        {sections.map((section, i) => {
          switch (section.type) {
            case "hero":
              return (
                <Hero key={i} data={section.data} productUrl={buyBox.productUrl} />
              );
            case "problemAgitate":
              return <ProblemAgitate key={i} data={section.data} />;
            case "mechanism":
              return <Mechanism key={i} data={section.data} />;
            case "proof":
              return <Proof key={i} data={section.data} />;
            case "offer":
              return <Offer key={i} data={section.data} buyBox={buyBox} />;
            case "faq":
              return <FAQ key={i} data={section.data} />;
            case "finalCta":
              return (
                <FinalCTA
                  key={i}
                  data={section.data}
                  productUrl={buyBox.productUrl}
                />
              );
            case "richText":
              return <RichText key={i} data={section.data} />;
            case "imageText":
              return <ImageText key={i} data={section.data} />;
            case "comparison":
              return <Comparison key={i} data={section.data} />;
            case "beforeAfter":
              return <BeforeAfter key={i} data={section.data} />;
            case "quote":
              return <Quote key={i} data={section.data} />;
            case "image":
              return <ImageBlock key={i} data={section.data} />;

            // Visual component library — props are passed directly (not wrapped
            // in `data`), so we spread the section's data into the component.
            case "mechanismDiagram":
              return <MechanismDiagram key={i} {...section.data} />;
            case "gutRebalance":
              return <GutRebalanceVisual key={i} {...section.data} />;
            case "strainBreakdown":
              return <StrainBreakdown key={i} {...section.data} />;
            case "symptomToGut":
              return <SymptomToGut key={i} {...section.data} />;
            case "expectationTimeline":
              return <ExpectationTimeline key={i} {...section.data} />;
            case "chewsComparison":
              return <ChewsComparison key={i} {...section.data} />;
            case "statPanel":
              return <StatPanel key={i} {...section.data} />;
            case "socialProofBar":
              return <SocialProofBar key={i} {...section.data} />;
            case "numberedReason":
              return <NumberedReasonCard key={i} {...section.data} />;
            case "reviewCard":
              return <ReviewCard key={i} {...section.data} />;
            case "trustBadgeRow":
              return <TrustBadgeRow key={i} {...section.data} />;
            case "guaranteeBlock":
              return <GuaranteeBlock key={i} {...section.data} />;
            case "vetPanel":
              return <VetPanel key={i} {...section.data} />;

            default:
              // Exhaustiveness guard: a new section type without a renderer
              // becomes a compile error here.
              return assertNever(section);
          }
        })}
      </main>

      <BuyBox buyBox={buyBox} embedded={embedded} />
    </div>
  );
}

function assertNever(x: never): never {
  throw new Error(`Unhandled section type: ${JSON.stringify(x)}`);
}
