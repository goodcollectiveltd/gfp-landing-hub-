// Quality gate (wake-up-call brief §4). Run a generated page against the brief's
// checklist BEFORE declaring it done. This covers the lines that are checkable
// from the section JSON; render-side lines (white base, no gradient boxes, type
// hierarchy) are now guaranteed by the renderer itself.
//
// Pure + dependency-free so the generate-page edge function can run the same
// checks server-side.

import type { Section } from "@/types/page";

export interface GateResult {
  pass: boolean;
  failures: string[];
  warnings: string[];
}

/** Visual treatment of a section, for the adjacency-variety rule. */
type Media = "copy" | "component" | "photo" | "video" | "feature";

const COMPONENT_TYPES = new Set<string>([
  "mechanismDiagram", "gutRebalance", "strainBreakdown", "symptomToGut",
  "expectationTimeline", "chewsComparison", "statPanel", "socialProofBar",
  "numberedReason", "reviewCard", "trustBadgeRow", "guaranteeBlock", "vetPanel",
  "customVisual", "comparison", "proof",
]);
const PHOTO_TYPES = new Set<string>(["image", "imageText", "beforeAfter"]);

function mediaClass(s: Section): Media {
  if (s.type === "finalCta") return "feature";
  if (s.type === "video") return "video";
  if (PHOTO_TYPES.has(s.type)) return "photo";
  if (s.type === "quote") {
    const img = (s.data as { image?: { url?: string } }).image;
    return img?.url ? "photo" : "copy";
  }
  if (COMPONENT_TYPES.has(s.type)) return "component";
  return "copy"; // hero, richText, problemAgitate, mechanism, faq, offer
}

/** Body paragraphs of a section, for the text-density rule. */
function bodyParas(s: Section): string[] {
  const d = s.data as Record<string, unknown>;
  if (s.type === "richText") return (d.paragraphs as string[] | undefined) ?? [];
  if (s.type === "imageText") {
    const body = (d.body as string) ?? "";
    const parts = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    return parts.length ? parts : body ? [body] : [];
  }
  return [];
}
const wordCount = (p: string) => (p || "").trim().split(/\s+/).filter(Boolean).length;
const MAX_PARA_WORDS = 60;

export function checkPage(sections: Section[]): GateResult {
  const failures: string[] = [];
  const warnings: string[] = [];

  if (!sections?.length) {
    return { pass: false, failures: ["Page has no sections."], warnings: [] };
  }

  // 1. Text density — no section beyond a heading + ~2 short paragraphs, and no
  //    single over-long paragraph (a wall of text in one block).
  sections.forEach((s, i) => {
    const paras = bodyParas(s);
    if (paras.length > 2) {
      failures.push(
        `Section ${i + 1} (${s.type}) has ${paras.length} paragraphs — convert the substance into a component (list, stat, diagram, comparison).`
      );
    }
    const longest = Math.max(0, ...paras.map(wordCount));
    if (longest > MAX_PARA_WORDS) {
      failures.push(
        `Section ${i + 1} (${s.type}) has a ${longest}-word paragraph — too long; tighten to ~2 short sentences or move it into a component.`
      );
    }
  });

  // 2. Media variety — no two adjacent sections share a media treatment.
  const media = sections.map(mediaClass);
  for (let i = 1; i < media.length; i++) {
    if (media[i] === media[i - 1]) {
      const msg = `Sections ${i} and ${i + 1} are both "${media[i]}" — adjacent sections must differ in media/layout.`;
      // Two walls of copy in a row is the worst offender → failure.
      if (media[i] === "copy") failures.push(msg);
      else warnings.push(msg);
    }
  }

  // 3. At least one built component or video is present.
  if (!media.some((m) => m === "component" || m === "video")) {
    failures.push("No built component or video present — the page reads as flat image+text.");
  }

  // 4. A full-vermilion feature block (the closing CTA) anchors the page.
  if (!sections.some((s) => s.type === "finalCta")) {
    warnings.push("No finalCta feature block — add a closing vermilion CTA.");
  }

  return { pass: failures.length === 0, failures, warnings };
}

/** One-line human summary for logs / presenting the page. */
export function formatGate(r: GateResult): string {
  if (r.pass && !r.warnings.length) return "Quality gate: PASS (no issues).";
  const parts = [`Quality gate: ${r.pass ? "PASS" : "FAIL"}`];
  if (r.failures.length) parts.push(`${r.failures.length} failure(s):\n- ${r.failures.join("\n- ")}`);
  if (r.warnings.length) parts.push(`${r.warnings.length} warning(s):\n- ${r.warnings.join("\n- ")}`);
  return parts.join("\n");
}
