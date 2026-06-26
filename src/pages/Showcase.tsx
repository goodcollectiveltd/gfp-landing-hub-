import { useEffect, type CSSProperties } from "react";
import SocialProofBar from "@/components/visuals/SocialProofBar";
import StatPanel from "@/components/visuals/StatPanel";
import StrainBreakdown from "@/components/visuals/StrainBreakdown";
import ChewsComparison from "@/components/visuals/ChewsComparison";
import ExpectationTimeline from "@/components/visuals/ExpectationTimeline";
import VetPanel from "@/components/visuals/VetPanel";
import GuaranteeBlock from "@/components/visuals/GuaranteeBlock";
import NumberedReasonCard from "@/components/visuals/NumberedReasonCard";
import MechanismDiagram from "@/components/visuals/MechanismDiagram";
import GutRebalanceVisual from "@/components/visuals/GutRebalanceVisual";
import SymptomToGut from "@/components/visuals/SymptomToGut";
import ReviewCard from "@/components/visuals/ReviewCard";
import TrustBadgeRow from "@/components/visuals/TrustBadgeRow";

// Public gallery of the new visual component library (Good For Pets sample data),
// for visual review at /showcase. Compliance-safe copy (supports/helps language).
const brandVars = {
  "--brand-primary": "#EF3824",
  "--brand-on-primary": "#ffffff",
  "--brand-accent": "#EF3824",
  "--brand-bg": "#FBF7F2",
  "--brand-text": "#1A1A1A",
  "--brand-muted": "#6B6B6B",
  "--font-heading": "'Poppins', system-ui, sans-serif",
  "--font-body": "'Inter', system-ui, sans-serif",
} as CSSProperties;

function Label({ children }: { children: string }) {
  return (
    <p className="mx-auto max-w-3xl px-6 pt-8 text-xs font-semibold uppercase tracking-wide text-neutral-400">
      {children}
    </p>
  );
}

export default function Showcase() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="lp-root min-h-screen" style={brandVars}>
      <header className="border-b border-black/5 px-6 py-3 text-center">
        <span className="lp-heading text-2xl font-extrabold" style={{ color: "var(--brand-primary)" }}>
          Component library
        </span>
      </header>

      <Label>SocialProofBar</Label>
      <SocialProofBar rating={4.8} reviewCount="4,537+" extraValue="20,000+" extraLabel="dogs helped" />

      <Label>StatPanel</Label>
      <StatPanel
        stats={[
          { value: "5 billion", label: "live cultures (CFU) per capsule" },
          { value: "5", label: "named, research-backed strains" },
          { value: "90 days", label: "money-back guarantee" },
        ]}
      />

      <Label>StrainBreakdown</Label>
      <StrainBreakdown
        strains={[
          { name: "Lactobacillus plantarum" },
          { name: "Lactobacillus acidophilus" },
          { name: "Lactobacillus brevis" },
          { name: "Lactobacillus rhamnosus" },
          { name: "Bifidobacterium lactis" },
        ]}
        total="5 billion live cultures"
        addOns={[
          { label: "Chicory-root prebiotic", detail: "250mg inulin to feed the good bacteria" },
          { label: "Digestive enzyme complex", detail: "150mg to help break food down" },
        ]}
      />

      <Label>ChewsComparison</Label>
      <ChewsComparison
        rows={[
          { feature: "Live bacteria", us: "Reach the gut alive", them: "Often dead in the tub" },
          { feature: "Process", us: "Cold-filled", them: "Heat-baked" },
          { feature: "Strains", us: "5 named", them: "Often 1, unnamed" },
          { feature: "Made in", us: "UK, GMP-certified", them: "Often overseas" },
        ]}
      />

      <Label>ExpectationTimeline</Label>
      <ExpectationTimeline
        steps={[
          { when: "Week 1", title: "Settling in", body: "The gut starts to adjust. Stools may be a little softer at first." },
          { when: "Weeks 2–3", title: "Firmer, settled", body: "Many owners notice firmer stools and less wind." },
          { when: "Week 4+", title: "Calmer skin & coat", body: "Supports a calmer coat and steadier digestion with daily use." },
        ]}
      />

      <Label>VetPanel</Label>
      <VetPanel
        name="Dr Kishan Vara"
        credential="MRCVS · practising UK vet & co-developer"
        quote="Daily probiotics and enzymes make a meaningful difference to a dog's digestion."
      />

      <Label>NumberedReasonCard</Label>
      <NumberedReasonCard
        number={1}
        title="It works on more than just the ears"
        body="Itchy ears, paw licking and loose stools often share one root: the gut. Support the gut, and the rest has the best chance to settle."
      />

      <Label>GuaranteeBlock</Label>
      <GuaranteeBlock />

      <Label>MechanismDiagram</Label>
      <MechanismDiagram />

      <Label>GutRebalanceVisual</Label>
      <GutRebalanceVisual />

      <Label>SymptomToGut</Label>
      <SymptomToGut />

      <Label>ReviewCard</Label>
      <ReviewCard
        name="Sherry B."
        rating={5}
        quote="I'd tried many others but nothing helped until I tried Good For Pets. He now has his full coat back. It's been a year — wouldn't give them anything else."
      />

      <Label>TrustBadgeRow</Label>
      <TrustBadgeRow />

      <div className="h-16" />
    </div>
  );
}
