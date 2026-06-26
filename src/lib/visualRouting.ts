// Slot routing (build brief §4): every visual slot the generator emits carries a
// `visualType` from a fixed enum, so turning slots into concrete page sections is
// deterministic. This is the single source of truth for that decision:
//
//   COMPONENT / furniture  -> a themed library component (section)
//   customVisual           -> the sanitised bespoke-markup block
//   photo types            -> resolve a real image:
//                               LIBRARY (confident caption/tag match) -> fill
//                               else BRIEF -> labelled placeholder + image brief
//
// Default bias: if a slot could plausibly be a component, it is one. Photos are
// the fallback, for genuine photographs only.
//
// Pure, side-effect-free, no frontend imports beyond types — so the same logic
// can be ported into the generate-page edge function (build order step 4).

import type { ImageBrief, Section, SectionType } from "@/types/page";
import { sanitizeCustomVisual } from "@/lib/sanitizeCustomVisual";

/** Visual types that map to a themed library component. */
export const COMPONENT_VISUAL_TYPES = [
  "mechanism",
  "gutRebalance",
  "strainBreakdown",
  "symptomToGut",
  "timeline",
  "comparison",
  "statPanel",
  "trustBadgeRow",
  "reviewCard",
  "vetPanel",
  // conversion furniture
  "socialProofBar",
  "numberedReason",
  "guaranteeBlock",
] as const;
export type ComponentVisualType = (typeof COMPONENT_VISUAL_TYPES)[number];

/** Visual types that resolve to a real photograph (library or brief). */
export const PHOTO_VISUAL_TYPES = [
  "productPhoto",
  "lifestylePhoto",
  "ugcPhoto",
  "beforeAfter",
  "proofScreenshot",
] as const;
export type PhotoVisualType = (typeof PHOTO_VISUAL_TYPES)[number];

export type VisualType = ComponentVisualType | PhotoVisualType | "customVisual";

const COMPONENT_TYPES = new Set<string>(COMPONENT_VISUAL_TYPES);
const PHOTO_TYPES = new Set<string>(PHOTO_VISUAL_TYPES);

export function isComponentVisualType(t: string): t is ComponentVisualType {
  return COMPONENT_TYPES.has(t);
}
export function isPhotoVisualType(t: string): t is PhotoVisualType {
  return PHOTO_TYPES.has(t);
}

/** visualType -> the renderer's section `type`. */
const VISUAL_TO_SECTION: Record<ComponentVisualType, SectionType> = {
  mechanism: "mechanismDiagram",
  gutRebalance: "gutRebalance",
  strainBreakdown: "strainBreakdown",
  symptomToGut: "symptomToGut",
  timeline: "expectationTimeline",
  comparison: "chewsComparison",
  statPanel: "statPanel",
  trustBadgeRow: "trustBadgeRow",
  reviewCard: "reviewCard",
  vetPanel: "vetPanel",
  socialProofBar: "socialProofBar",
  numberedReason: "numberedReason",
  guaranteeBlock: "guaranteeBlock",
};

/** One captioned image from the brand's library. */
export interface LibraryImage {
  url: string;
  tag: string;
  caption: string;
}

/** Photo-slot details the generator supplies for a photographic slot. */
export interface PhotoSlot {
  /** A stable id used in the image brief. */
  slotId?: string;
  /** What the image should show (used both for matching and as a placeholder label). */
  role: string;
  placement?: "left" | "right" | "full";
  aspectRatio?: "1:1" | "4:5" | "16:9";
  caption?: string;
  /** Free-text keywords to match against the library (defaults to `role`). */
  match?: string;
  /** A ready-made generation brief, used when there's no library match. */
  brief?: ImageBrief;
}

/** A visual slot as emitted by the generator. Discriminated on `visualType`. */
export interface VisualSlot {
  visualType: VisualType;
  /** Structured props for component/furniture types — already in the target
   *  section's `data` shape. */
  data?: Record<string, unknown>;
  /** For `customVisual`: raw markup (sanitised on resolve) + the design brief. */
  customVisual?: { markup: string; designBrief: string; heading?: string };
  /** For photo types. */
  photo?: PhotoSlot;
}

// --- Image library matching -------------------------------------------------

const STOPWORDS = new Set(["the", "a", "an", "of", "and", "with", "for", "to", "in", "on", "photo", "image", "picture"]);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * Find the best library image for some keywords. Scores by token overlap against
 * each image's tag (weighted) + caption. Returns null below a confidence floor —
 * a weak match becomes a BRIEF, not a wrong photo.
 */
export function matchImage(library: LibraryImage[], keywords: string): LibraryImage | null {
  const want = tokens(keywords);
  if (!want.length || !library.length) return null;

  let best: LibraryImage | null = null;
  let bestScore = 0;
  for (const img of library) {
    if (!img.url) continue;
    // Untagged "other" images aren't confidently placeable.
    const tagToks = tokens(img.tag);
    const capToks = new Set(tokens(img.caption));
    let score = 0;
    for (const w of want) {
      if (tagToks.includes(w)) score += 2;
      else if (capToks.has(w)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = img;
    }
  }
  // Require at least one solid (tag-level) or two soft hits.
  return bestScore >= 2 ? best : null;
}

// --- Resolution -------------------------------------------------------------

function defaultBrief(slot: VisualSlot, photo: PhotoSlot, sectionType: string): ImageBrief {
  return (
    photo.brief ?? {
      slotId: photo.slotId ?? `${slot.visualType}-${sectionType}`,
      sectionType,
      placement: photo.placement ?? "full",
      aspectRatio: photo.aspectRatio ?? "4:5",
      subject: photo.role,
      styleRef:
        slot.visualType === "productPhoto"
          ? "clean studio, seamless brand-red #EF3824 background, soft shadow"
          : "natural home lifestyle, soft daylight",
      mood: "real-looking older dog, owner 55-65, warm and calm",
      safeZone: "Keep key elements within the central 60% of the frame; top 20% and bottom 20% clear (Meta UI buffer).",
      textOverlay: "None — text lives in the component, not the image.",
      negativePrompt: "no on-image health claims, no fake stats, no competitor branding",
      compliance: 'Product name always exactly "5 Strain Probiotic+".',
    }
  );
}

function resolvePhoto(slot: VisualSlot, library: LibraryImage[]): Section {
  const photo: PhotoSlot = slot.photo ?? { role: "Product image" };

  if (slot.visualType === "beforeAfter") {
    const before = matchImage(library, photo.match ?? `before ${photo.role}`);
    const after = matchImage(library, `after ${photo.role}`);
    return {
      type: "beforeAfter",
      data: {
        caption: photo.caption,
        before: before ? { url: before.url, role: "Before" } : { role: "Before", brief: defaultBrief(slot, photo, "beforeAfter") },
        after: after ? { url: after.url, role: "After" } : { role: "After", brief: defaultBrief(slot, photo, "beforeAfter") },
      },
    };
  }

  const img = matchImage(library, photo.match ?? photo.role);
  if (img) {
    return { type: "image", data: { image: { url: img.url, role: photo.role }, caption: photo.caption } };
  }
  // No confident match — placeholder + brief (BRIEF route).
  return {
    type: "image",
    data: { image: { role: photo.role, brief: defaultBrief(slot, photo, "image") }, caption: photo.caption },
  };
}

/**
 * Turn one generator-emitted visual slot into a concrete page Section.
 * Deterministic: COMPONENT -> component, customVisual -> sanitised block,
 * photo -> LIBRARY match or BRIEF placeholder.
 */
export function resolveVisualSlot(slot: VisualSlot, library: LibraryImage[] = []): Section {
  if (slot.visualType === "customVisual") {
    const cv = slot.customVisual ?? { markup: "", designBrief: "" };
    return {
      type: "customVisual",
      data: {
        markup: sanitizeCustomVisual(cv.markup),
        designBrief: cv.designBrief,
        heading: cv.heading,
      },
    };
  }

  if (isComponentVisualType(slot.visualType)) {
    const type = VISUAL_TO_SECTION[slot.visualType];
    // The generator supplies `data` already shaped to the target section; the
    // section schema is the validation boundary, so we attach it as-is.
    return { type, data: slot.data ?? {} } as Section;
  }

  if (isPhotoVisualType(slot.visualType)) {
    return resolvePhoto(slot, library);
  }

  // Unknown type — fail safe to a labelled placeholder rather than throwing.
  return { type: "image", data: { image: { role: `Unrecognised visual: ${String(slot.visualType)}` } } };
}

/** Resolve a whole page's worth of slots. */
export function resolveVisualSlots(slots: VisualSlot[], library: LibraryImage[] = []): Section[] {
  return slots.map((s) => resolveVisualSlot(s, library));
}
