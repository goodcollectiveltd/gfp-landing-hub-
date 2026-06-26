// Supabase Edge Function: generate-page  (Stage 3 — structural mirror)
// ---------------------------------------------------------------------------
// Pass 1 (Haiku): read the competitor advertorial and extract its STRUCTURE
//   only — an ordered block plan (section type + persuasive purpose + content
//   hint in its own words + what image belongs there). Never its wording.
// Pass 2 (Opus): WITHOUT seeing the competitor text, write the page from the
//   brand's Context Hub docs, voice, allowed claims, product, image library and
//   reviews — following the plan's order. Places real images/reviews by match;
//   leaves labelled placeholders otherwise.
//
// This split is the anti-plagiarism design: pass 2 can't copy what it never sees.
// Secret: ANTHROPIC_API_KEY.
// ---------------------------------------------------------------------------

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL_PLAN = "claude-haiku-4-5";
const MODEL_WRITE = "claude-opus-4-8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
function stripToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}
// Deterministic structural skeleton: an ordered token stream of the page's real
// blocks — [H1]/[H2] headings (text), [IMG] image markers, and p(N) paragraph
// LENGTH markers (word counts only, never the competitor's body copy). This is
// what lets the rebuild match section count, image placement and paragraph
// lengths exactly.
function structuralSkeleton(html: string): string {
  let h = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<img\b[^>]*>/gi, "\n[IMG]\n")
    .replace(/background-image\s*:\s*url/gi, "\n[IMG]\n")
    .replace(
      /<(h[1-3])\b[^>]*>([\s\S]*?)<\/\1>/gi,
      (_m, t, x) => `\n[${String(t).toUpperCase()}] ${stripToText(x).slice(0, 80)}\n`
    )
    .replace(/<\/(p|div|li|section|h[1-6]|button|a)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ");
  const lines = h.split("\n").map((x) => x.replace(/\s+/g, " ").trim());
  const out: string[] = [];
  let lastImg = false;
  for (const l of lines) {
    if (!l) continue;
    if (l === "[IMG]") {
      if (!lastImg) out.push("[IMG]");
      lastImg = true;
      continue;
    }
    lastImg = false;
    if (l.startsWith("[H")) {
      const ht = l.replace(/^\[H[1-3]\]\s*/, "");
      if (/^(your cart|cart|all products|menu|search|policies|helpful links|monthly giveaway|footer|newsletter|log ?in|sign ?up)/i.test(ht))
        continue;
      out.push(l);
      continue;
    }
    if (/^(your cart|all products|cart|menu|policies|helpful links|monthly giveaway|©|powered by|skip to|search|log in|sign up|follow)/i.test(l))
      continue;
    const w = l.split(" ").filter(Boolean).length;
    if (w >= 3) out.push(`p(${w})`);
  }
  // Start at the real headline (prefer the H1) so we drop nav/cart chrome.
  let firstH = out.findIndex((x) => x.startsWith("[H1]"));
  if (firstH < 0) firstH = out.findIndex((x) => x.startsWith("[H2]"));
  return (firstH > 0 ? out.slice(firstH) : out).slice(0, 130).join("\n");
}

function safeJson(text: string): any {
  try {
    let c = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const a = c.search(/[[{]/);
    const b = Math.max(c.lastIndexOf("]"), c.lastIndexOf("}"));
    if (a !== -1 && b !== -1) c = c.slice(a, b + 1);
    return JSON.parse(c);
  } catch {
    return null;
  }
}

async function callClaude(opts: {
  model: string;
  system: string;
  messages: unknown[];
  tools?: unknown[];
  tool_choice?: unknown;
  max_tokens?: number;
}): Promise<any> {
  let lastErr = "";
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: opts.model,
        max_tokens: opts.max_tokens ?? 4096,
        system: opts.system,
        messages: opts.messages,
        ...(opts.tools ? { tools: opts.tools } : {}),
        ...(opts.tool_choice ? { tool_choice: opts.tool_choice } : {}),
      }),
    });
    if (res.ok) return await res.json();
    lastErr = `${res.status} ${await res.text()}`;
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      continue;
    }
    break;
  }
  throw new Error(`Anthropic request failed: ${lastErr}`);
}

// Legacy structural archetypes — used by Pass 1 to classify competitor sections.
const LEGACY_BLOCK_TYPES = [
  "hero",
  "richText",
  "problemAgitate",
  "mechanism",
  "imageText",
  "comparison",
  "beforeAfter",
  "quote",
  "proof",
  "offer",
  "faq",
  "finalCta",
  "image",
];

// Bespoke visual-library components + furniture + the customVisual escape hatch.
// Pass 2 UPGRADES idea sections into these instead of flat image+text blocks.
const COMPONENT_BLOCK_TYPES = [
  "mechanismDiagram",
  "gutRebalance",
  "strainBreakdown",
  "symptomToGut",
  "expectationTimeline",
  "chewsComparison",
  "statPanel",
  "socialProofBar",
  "numberedReason",
  "reviewCard",
  "trustBadgeRow",
  "guaranteeBlock",
  "vetPanel",
  "customVisual",
];

// Full set Pass 2 may emit ("video" is a media block for variety).
const BLOCK_TYPES = [...LEGACY_BLOCK_TYPES, ...COMPONENT_BLOCK_TYPES, "video"];

// The visualType vocabulary the vision pass uses to tag each block's design
// treatment (maps onto our components / customVisual / photo / video).
const VISUAL_TYPES = [
  "mechanism", "gutRebalance", "strainBreakdown", "symptomToGut", "timeline",
  "comparison", "statPanel", "trustBadgeRow", "reviewCard", "vetPanel",
  "socialProofBar", "numberedReason", "guaranteeBlock", "productPhoto",
  "lifestylePhoto", "video", "customVisual", "copy",
];

/**
 * PASS 1 (vision): read the uploaded SCREENSHOT of the original advertorial and
 * produce a block plan that captures its VISUAL DESIGN features — so the page
 * can be rebuilt with the same KINDS of features in the brand's own style.
 * Captures design + structure only; never the competitor's wording.
 */
async function visionPlan(screenshotUrl: string, skeleton: string): Promise<any> {
  const resp = await callClaude({
    model: MODEL_WRITE, // Opus vision — design reading needs the strong model.
    max_tokens: 4000,
    system:
      "You are a senior direct-response landing-page designer. You are shown a SCREENSHOT of a competitor advertorial. Read its VISUAL DESIGN and output a block plan so the page can be REBUILT for another brand with the SAME KINDS of visual features, rendered in that brand's own style. " +
      "Look at the actual visual treatments, in order down the page: hero layout, comparison tables/sliders, before/after visuals, numbered lists with icons, stat callouts, process/timeline diagrams, mechanism diagrams, testimonial cards, authority/vet panels, trust-badge rows, guarantee seals, sticky offer cards, charts. " +
      'Output ONLY JSON: {"format":string,"titlePattern":string,"blocks":[{"type","theme","visualFeature","visualType","image","paragraphs"}]}. ' +
      "One entry per LOGICAL section, in order (the masthead/first screen is ONE hero; group an FAQ list into ONE faq block; a closing CTA is finalCta). ~8-14 blocks, never dozens. " +
      "For each block: " +
      "type = closest archetype from " + JSON.stringify(LEGACY_BLOCK_TYPES) + ". " +
      "theme = the section's point IN YOUR OWN WORDS (never transcribe the original's copy). " +
      "visualFeature = a precise description of the DESIGN treatment you actually see (e.g. 'two-column comparison, brand column highlighted, green check vs grey cross'; 'three circular percentage rings'; 'numbered cards 1-5, each an icon + small photo'; 'sticky price card with strikethrough + guarantee seal'). Describe DESIGN only — no copied sentences. " +
      "visualType = best match from " + JSON.stringify(VISUAL_TYPES) + ". Use 'customVisual' when the feature is a bespoke diagram none of the named components covers. Prefer a designed component over a plain photo whenever the section conveys an idea. " +
      "image = one of [none, top, beside, after] based on where a photo sits. " +
      "paragraphs = approx word counts of that section's body paragraphs, in order. " +
      "format = the page concept in a few words. titlePattern = the headline's shape/sentiment in your own words. " +
      "NEVER transcribe the competitor's wording, claims or numbers — capture DESIGN and STRUCTURE only.",
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "url", url: screenshotUrl } },
          {
            type: "text",
            text:
              "Analyse this advertorial's visual design and return the block plan." +
              (skeleton ? `\n\nText skeleton (structure reference only, do not copy wording):\n${skeleton}` : ""),
          },
        ],
      },
    ],
  });
  return safeJson(resp.content?.find((b: any) => b.type === "text")?.text ?? "");
}

// emit_page tool: the flexible block schema (mirrors src/types/page.ts). Image
// slots are { url?, role? } — url copied verbatim from availableImages/reviews,
// else role = a short description of what to upload there.
const emitTool = {
  name: "emit_page",
  description: "Return the finished advertorial as an ordered array of section blocks.",
  input_schema: {
    type: "object",
    properties: {
      sections: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: { type: "string", enum: BLOCK_TYPES },
            data: {
              type: "object",
              description:
                "Slots for this block type. " +
                "— Copy/structure blocks — " +
                "hero{eyebrow?,headline,subheadline,ctaLabel,trustLine?,image?(url string)}; " +
                "richText{eyebrow?,heading?,paragraphs[string]}; " +
                "problemAgitate{headline,intro?,painPoints[{title,body}]}; " +
                "mechanism{eyebrow?,headline,subheadline?,steps[{title,body}]}; " +
                "imageText{heading?,body,image{url?,role?},imagePosition?(left|right)}; " +
                "comparison{heading?,usLabel,themLabel,rows[{feature,us,them}]}; " +
                "beforeAfter{heading?,caption?,before{url?,role?},after{url?,role?}}; " +
                "quote{quote,attribution?,image{url?,role?}}; " +
                "proof{headline,stats?[{value,label}],reviews[{quote,author,rating}]}; " +
                "offer{headline,subheadline?,bullets[string],guarantee?,image?(url string)}; " +
                "faq{headline,items[{q,a}]}; " +
                "finalCta{headline,subheadline?,ctaLabel,trustLine?}; " +
                "image{image{url?,role?},caption?}. " +
                "— Bespoke visual components (PREFER these for idea sections) — " +
                "mechanismDiagram{heading?,subhead?} (the potency paradox: baked chews kill live bacteria vs cold-fill; internal art is fixed, you only set headings); " +
                "gutRebalance{heading?,caption?} (good bacteria crowding out bad — associative, supports/helps only); " +
                "strainBreakdown{heading?,strains[{name,cfu?}],total?,addOns?[{label,detail?}]}; " +
                "symptomToGut{heading?,symptoms?[string],caption?}; " +
                "expectationTimeline{heading?,steps[{when,title,body}]}; " +
                "chewsComparison{heading?,usLabel?,themLabel?,rows[{feature,us,them}]}; " +
                "statPanel{heading?,stats[{value,label}]}; " +
                "socialProofBar{rating?(number),reviewCount?(string),extraValue?,extraLabel?}; " +
                "numberedReason{number,title,body,image?{url?,role?},imagePosition?(left|right)}; " +
                "reviewCard{quote,name,rating?(number),image?{url?,role?},verified?(bool)}; " +
                "trustBadgeRow{badges?[{label,icon?(flag|shield|leaf|heart)}]}; " +
                "guaranteeBlock{days?(number),text?}; " +
                "vetPanel{name,credential,quote,image?{url?,role?}}; " +
                "customVisual{markup(string: self-contained, sanitised SVG/HTML, brand CSS vars only, NO <script>/on*/external src/href),designBrief(string),heading?}; " +
                "video{src?(url),poster?(url),caption?,role?} — for media variety; unless you are given a real video URL, omit src and set role to what the video should show (a poster placeholder + brief is added automatically). " +
                "Image url values MUST be copied verbatim from availableImages or a review's image; never invent a URL. If nothing fits, omit url and set role to a short description (e.g. 'Vet holding the product') — a generation brief is added automatically.",
            },
          },
          required: ["type", "data"],
        },
      },
    },
    required: ["sections"],
  },
};

// --- Post-processing: deterministic slot routing on the emitted sections -----
// (Server port of src/lib/visualRouting.ts + sanitizeCustomVisual.ts.)

const DANGEROUS_TAGS =
  "script|iframe|object|embed|link|meta|base|foreignObject|style|form|input|button|textarea|select|audio|video|source|a|animate|animateTransform|animateMotion|set|handler";

/** Coarse server-side sanitiser for storage. The render-time DOM sanitiser
 *  (sanitizeCustomVisual.ts) is the strong net; this strips the obvious vectors
 *  before the markup is ever persisted. */
function sanitizeMarkupServer(markup: unknown): string {
  if (!markup || typeof markup !== "string") return "";
  let s = markup;
  // Paired dangerous tags + their contents.
  s = s.replace(new RegExp(`<\\s*(${DANGEROUS_TAGS})\\b[\\s\\S]*?<\\/\\s*\\1\\s*>`, "gi"), " ");
  // Self-closing / unclosed dangerous tags.
  s = s.replace(new RegExp(`<\\s*\\/?\\s*(${DANGEROUS_TAGS})\\b[^>]*>`, "gi"), " ");
  // Inline event handlers.
  s = s
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, " ")
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, " ")
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, " ");
  // URL attributes that aren't same-document refs.
  s = s
    .replace(/\b(href|xlink:href|src)\s*=\s*"(?!#)[^"]*"/gi, " ")
    .replace(/\b(href|xlink:href|src)\s*=\s*'(?!#)[^']*'/gi, " ");
  return s.trim();
}

function makeBrief(sectionType: string, role: string, placement: string, productPhoto: boolean) {
  return {
    slotId: `${sectionType}-${role}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60),
    sectionType,
    placement,
    aspectRatio: sectionType === "beforeAfter" ? "1:1" : "4:5",
    subject: role,
    styleRef: productPhoto
      ? "clean studio, seamless brand-red #EF3824 background, soft shadow"
      : "natural home lifestyle, soft daylight",
    mood: "real-looking older dog, owner 55-65, warm and calm",
    safeZone:
      "Keep key elements within the central 60% of the frame; top 20% and bottom 20% clear (Meta UI buffer).",
    textOverlay: "None — text lives in the component, not the image.",
    negativePrompt: "no on-image health claims, no fake stats, no competitor branding",
    compliance: 'Product name always exactly "5 Strain Probiotic+".',
  };
}

/** An image slot is { url?, role?, brief? }. Attach a brief when it's a bare
 *  placeholder (role, no url) so the owner gets a ready-to-use generation brief. */
function fillSlotBrief(slot: any, sectionType: string, placement: string) {
  if (slot && typeof slot === "object" && !slot.url && slot.role && !slot.brief) {
    const productish = /product|tub|pack|bottle|capsule|label/i.test(String(slot.role));
    slot.brief = makeBrief(sectionType, String(slot.role), placement, productish);
  }
}

/** Walk the emitted sections: sanitise customVisual markup, attach image briefs. */
function postProcessSections(sections: any[]): any[] {
  if (!Array.isArray(sections)) return sections;
  for (const sec of sections) {
    const d = sec?.data;
    if (!d) continue;
    switch (sec.type) {
      case "customVisual":
        d.markup = sanitizeMarkupServer(d.markup);
        break;
      case "image":
      case "imageText":
        fillSlotBrief(d.image, sec.type, d.imagePosition ?? "full");
        break;
      case "video":
        // A video with no asset is a poster placeholder — give it a brief too.
        if (!d.src && d.role && !d.brief) {
          d.brief = makeBrief("video", String(d.role), "full", false);
        }
        break;
      case "beforeAfter":
        fillSlotBrief(d.before, sec.type, "left");
        fillSlotBrief(d.after, sec.type, "right");
        break;
      case "quote":
      case "vetPanel":
      case "reviewCard":
      case "numberedReason":
        fillSlotBrief(d.image, sec.type, d.imagePosition ?? "full");
        break;
    }
  }
  return sections;
}

// --- Quality gate (brief §4) — server port of src/lib/qualityGate.ts ---------

const GATE_COMPONENTS = new Set([
  "mechanismDiagram", "gutRebalance", "strainBreakdown", "symptomToGut",
  "expectationTimeline", "chewsComparison", "statPanel", "socialProofBar",
  "numberedReason", "reviewCard", "trustBadgeRow", "guaranteeBlock", "vetPanel",
  "customVisual", "comparison", "proof",
]);
const GATE_PHOTO = new Set(["image", "imageText", "beforeAfter"]);

function mediaClass(s: any): string {
  if (s.type === "finalCta") return "feature";
  if (s.type === "video") return "video";
  if (GATE_PHOTO.has(s.type)) return "photo";
  if (s.type === "quote") return s.data?.image?.url ? "photo" : "copy";
  if (GATE_COMPONENTS.has(s.type)) return "component";
  return "copy";
}
function bodyParas(s: any): string[] {
  const d = s.data ?? {};
  if (s.type === "richText") return (d.paragraphs ?? []) as string[];
  if (s.type === "imageText") {
    const body = (d.body as string) ?? "";
    const parts = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    return parts.length ? parts : body ? [body] : [];
  }
  return [];
}
const wordCount = (p: string) => (p || "").trim().split(/\s+/).filter(Boolean).length;
const MAX_PARA_WORDS = 60;
function checkPage(sections: any[]): { pass: boolean; failures: string[]; warnings: string[] } {
  const failures: string[] = [];
  const warnings: string[] = [];
  if (!Array.isArray(sections) || !sections.length)
    return { pass: false, failures: ["Page has no sections."], warnings: [] };

  sections.forEach((s, i) => {
    const paras = bodyParas(s);
    if (paras.length > 2)
      failures.push(`Block ${i + 1} (${s.type}) has ${paras.length} paragraphs — convert the substance into a component, don't write a wall of text.`);
    const longest = Math.max(0, ...paras.map(wordCount));
    if (longest > MAX_PARA_WORDS)
      failures.push(`Block ${i + 1} (${s.type}) has a ${longest}-word paragraph — too long; tighten to ~2 short sentences or move the substance into a component.`);
  });

  const media = sections.map(mediaClass);
  for (let i = 1; i < media.length; i++) {
    if (media[i] === media[i - 1]) {
      const msg = `Blocks ${i} and ${i + 1} are both "${media[i]}" — adjacent blocks must differ in media/layout.`;
      if (media[i] === "copy") failures.push(msg);
      else warnings.push(msg);
    }
  }
  if (!media.some((m) => m === "component" || m === "video"))
    failures.push("No built component or video present — the page reads as flat image+text. Convert idea blocks into components and add a video.");
  if (!sections.some((s) => s.type === "finalCta"))
    warnings.push("No finalCta feature block — add a closing vermilion CTA.");

  return { pass: failures.length === 0, failures, warnings };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!ANTHROPIC_API_KEY) return json({ error: "ANTHROPIC_API_KEY not set." }, 500);

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Body must be JSON." }, 400);
  }

  const {
    competitorUrl,
    screenshotUrl,
    brand = {},
    buyBox = {},
    docs = [],
    images = [],
    reviews = [],
  } = payload ?? {};
  if (!competitorUrl && !screenshotUrl)
    return json({ error: "Provide a competitor URL or a screenshot." }, 400);

  try {
    // Fetch competitor page → text skeleton (structure reference). Optional when
    // a screenshot is supplied; the vision pass reads structure from the image.
    let skeleton = "";
    if (competitorUrl) {
      try {
        const res = await fetch(competitorUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; GFP-LandingHub/1.0)" },
          redirect: "follow",
        });
        if (res.ok) skeleton = structuralSkeleton(await res.text());
        else if (!screenshotUrl) throw new Error(`Could not fetch competitor URL (HTTP ${res.status}).`);
      } catch (e) {
        if (!screenshotUrl) throw e; // with a screenshot we can proceed without the URL
      }
    }

    // PASS 1 — build the block plan. With a screenshot, READ ITS VISUAL DESIGN
    // (vision) so we can replicate the original's features. Otherwise fall back
    // to the deterministic text skeleton.
    let plan: any;
    if (screenshotUrl) {
      plan = (await visionPlan(screenshotUrl, skeleton)) ?? { blocks: [] };
    } else {
      const planResp = await callClaude({
        model: MODEL_PLAN,
        max_tokens: 3000,
        system:
          "You convert a competitor advertorial's STRUCTURAL SKELETON into a block plan so the page can be rebuilt for another brand, block-for-block. " +
          "The skeleton is an ordered token stream: [H1]/[H2]/[H3] are headings (with their text), [IMG] marks an image, and p(N) marks a paragraph of about N words. " +
          "Output ONLY JSON: {\"format\":string, \"titlePattern\":string, \"blocks\":[{\"type\",\"theme\",\"image\",\"paragraphs\"}]}. " +
          "Group the skeleton into the page's LOGICAL blocks, in order, preserving image placement and paragraph lengths — but do NOT fragment: " +
          "(1) The content before the first heading is ONE hero block. Output exactly ONE hero. " +
          "(2) Each main content heading (e.g. each numbered reason) = one block, containing its following paragraphs and image. " +
          "(3) A run of short question-style headings/paragraphs (an FAQ accordion, often after a 'Got questions/FAQ' heading) = ONE faq block; list the questions as its theme. NEVER make each FAQ question its own block. " +
          "(4) A trailing call to action = finalCta. " +
          "Do NOT add sections that aren't there (no extra problem/mechanism/proof/comparison) and do NOT split a section into several blocks. A typical result is hero + the listicle items + offer + faq + finalCta (~8-12 blocks), NOT dozens. " +
          "For each block: type = best fit from " + JSON.stringify(LEGACY_BLOCK_TYPES) + " (heading+paragraphs, no image = richText; section with an [IMG] = imageText; standalone [IMG] = image; questions = faq; closing CTA = finalCta). " +
          "theme = the section's point IN YOUR OWN WORDS from its heading (never copy wording). " +
          "image = one of [none, top, beside, after] (none if no [IMG] in that block). " +
          "paragraphs = array of approx word counts for that block's body paragraphs, in order (e.g. [20,25]). " +
          "format = the page concept in a few words. titlePattern = the headline's shape/sentiment in your own words.",
        messages: [{ role: "user", content: `Structural skeleton:\n${skeleton}` }],
      });
      plan = safeJson(planResp.content?.find((b: any) => b.type === "text")?.text ?? "") ?? { blocks: [] };
    }

    // PASS 2 — write the page from BRAND material only, following the plan.
    const docsText = (docs as any[])
      .map((d) => `### ${d.title} [${d.tag}]\n${d.content}`)
      .join("\n\n")
      .slice(0, 48000);
    // Only images useful for matching (captioned or specifically tagged), capped.
    const availableImages = (images as any[])
      .filter((i) => (i.caption && i.caption.length) || (i.tag && i.tag !== "other"))
      .slice(0, 50)
      .map((i) => ({ url: i.url, tag: i.tag, caption: i.caption }));
    const availableReviews = (reviews as any[]).map((r) => ({
      author: r.author,
      rating: r.rating,
      body: r.body,
      image: (r.images || [])[0] ?? null,
    }));

    const writeResp = await callClaude({
      model: MODEL_WRITE,
      max_tokens: 14000,
      tools: [emitTool],
      tool_choice: { type: "tool", name: "emit_page" },
      system: [
        "You are an elite direct-response copywriter AND visual designer for the DTC brand below. Build a complete advertorial landing page by calling emit_page.",
        "MIRROR THE STRUCTURE, block for block: cover one content block per plan block, in the same order, conveying the same point. Keep the same total count of CONTENT sections — never invent a content section (no extra problem/mechanism/proof/comparison) the plan does not contain, and never drop or merge one. If it's a numbered listicle, number the reason headings (1., 2., 3.…). (You MAY additionally insert a few conversion-furniture blocks per the rule below — those don't count as content sections.)",
        "REPLICATE THE ORIGINAL'S VISUAL FEATURES: when a plan block has a `visualFeature` (the design treatment seen in the uploaded original) and a suggested `visualType`, recreate that SAME feature in the BRAND'S style. Use the suggested library component when one fits; when `visualType` is 'customVisual', author a customVisual that recreates the feature (brand CSS variables, sanitised SVG/HTML, large & legible). Take design cues from the original's features — but render everything in the brand palette/voice and NEVER copy its wording, images, or exact colours. The goal: each page visually echoes the specific original it came from, not a generic kit.",
        "DEFAULT TO A DESIGNED VISUAL COMPONENT, NOT FLAT IMAGE+TEXT. For any block that carries an IDEA — a mechanism/how-it-works, a comparison, a process, a set of stats, a proof point, an authority quote, a numbered reason — emit the matching bespoke component instead of a plain image/imageText/richText block. Mapping: how/why-it-works or mechanism → mechanismDiagram (or gutRebalance for the good-vs-bad-bacteria balance idea); strains/ingredients → strainBreakdown; symptoms-trace-to-root → symptomToGut; what-to-expect / results-over-time → expectationTimeline; us-vs-them / chews comparison → chewsComparison; a big number / stat callout → statPanel; a numbered reason in a listicle → numberedReason; a testimonial (especially one with a photo) → reviewCard; the vet / authority figure → vetPanel. richText, imageText, image and plain comparison/quote are the FALLBACK — use them only for genuine photographs or pure editorial copy that no component fits.",
        "CONVERSION FURNITURE: you MAY add a small, sensible set of furniture blocks even if the plan lacks them — at most ONE socialProofBar (just under the hero), and near the offer/finalCta at most ONE trustBadgeRow, ONE guaranteeBlock and ONE statPanel. Do not scatter furniture elsewhere or exceed these counts.",
        "customVisual is the escape hatch — use it ONLY for a genuinely bespoke diagram no component covers. data.markup must be self-contained, sanitised SVG/HTML (NO <script>, NO on* handlers, NO external src/href — internal #refs only), themed ONLY via the brand CSS variables (var(--brand-primary), var(--brand-on-primary), var(--brand-text), var(--font-heading), …), large and legible. Set data.designBrief to a one-line description so it can be regenerated. NEVER output a raw freeform HTML page — one self-contained block only.",
        "COMPONENT DATA obeys every rule below: only approved claims; numbers ONLY verbatim from the docs (strainBreakdown strains/CFU, statPanel figures, etc.); expectationTimeline/gutRebalance/symptomToGut stay associative with supports/helps language — never a cure/treat/prevent claim. Fill component data from the brand docs; when unsure of an optional heading, omit it and let the component use its on-brand default.",
        "QUALITY GATE — every page MUST pass these or it is rejected:",
        "(a) TEXT DENSITY: no block may be a heading plus three or more paragraphs. Keep every block to a heading + AT MOST two short paragraphs. If a plan block has more substance (its `paragraphs` array is long), do NOT write long copy — pull the substance into a component instead (numberedReason list, statPanel, strainBreakdown, chewsComparison, expectationTimeline, mechanismDiagram). Body copy is support, not the main event.",
        "(b) MEDIA VARIETY: no two ADJACENT blocks may share the same media/layout. Never place two copy blocks, two photo blocks, or two of the same component back to back. Alternate treatments — e.g. component, then photo/video, then copy. Include at least ONE video block for variety (poster placeholder unless given a real video URL).",
        "(c) NO INVENTED FILLER: if the brand docs do not contain the substance a block needs (a real number, a per-strain benefit, a testimonial with a photo), do NOT fabricate it and do NOT pad with generic filler. Emit the block but prefix the relevant copy with '[NEEDS CONTENT: what's missing]' so the owner can supply it. A flagged gap is acceptable; invented filler is not.",
        "MATCH LENGTH & IMAGES per block: for copy blocks, write the SAME NUMBER of paragraphs as the block's `paragraphs` array, each roughly that word count (within ~25%). Honour `image`: 'beside'/'after' → a component or imageText/image block carrying an image slot; 'top' → a hero/offer image; 'none' → no image. Keep the brand's section to the same visual weight as the original.",
        "The HERO block's headline IS the page's main headline — build it from titlePattern in the SAME shape, in your own wording. For a numbered-listicle page the hero headline must take the '[N] Reasons …' form (e.g. '5 Reasons Dog Owners Are Switching to Good For Pets'), then the numbered reason sections follow. Mirror the FAQ questions with on-brand answers.",
        "WRITE 100% ORIGINAL COPY in the brand voice. You do NOT have the competitor's words — never reproduce competitor phrasing; only their structure and the abstracted themes guide you. Every sentence is yours, grounded in the brand docs.",
        "PUNCHY & SCANNABLE: this is a high-converting landing page, not an essay. Short, sharp sentences. Short paragraphs (mostly 1 sentence, occasionally 2). Lead with the hook/benefit. Match the paragraph LENGTHS in each block's `paragraphs` array — if it's ~15-25 words, write ~15-25 words. NEVER write long expository paragraphs.",
        "Use the brand docs as KNOWLEDGE ONLY — never paste, quote, or lightly reword doc passages; they read like reference material, which is the wrong register for a landing page. Transform the facts into tight, original, benefit-led lines.",
        "GROUND EVERYTHING in the brand knowledge docs: use only the approved claims, obey the NEVER-SAY rules, and write in the customer's real voice/objection→proof patterns from the docs.",
        "CRITICAL — NUMBERS: never state any statistic, count, percentage, price, multiple or timeframe unless it appears verbatim in the brand knowledge. Do NOT invent or inflate figures (e.g. no made-up '43,000 owners'). The ONLY approved volume figures are '20,000+ dogs helped in the last 12 months' and '4,537+ verified reviews'; use the exact comparative phrasing from the docs ('up to 20x', the cheaper-per-serving line) and never round up or embellish.",
        "Do NOT state or imply the vet uses the product on his own dogs, or any personal anecdote about him — only that he co-developed the formula, plus his on-record quote from the docs. Do not invent product details, ingredients, or [CONFIRM] items.",
        "Voice: " + (brand.voice || "warm, honest, plain-spoken, founder-to-owner") + ".",
        brand.allowedClaims?.length
          ? "ONLY make product claims found in the docs / this allowed list: " + JSON.stringify(brand.allowedClaims) + "."
          : "",
        brand.bannedWords?.length ? "NEVER use these words: " + JSON.stringify(brand.bannedWords) + "." : "",
        "IMAGES: for any image slot, pick a url verbatim from availableImages whose tag/caption fits the block (e.g. a 'vet' image for an authority quote, 'before-after' for a transformation). If none fits, omit url and set role to a short description of what to upload.",
        "REVIEWS: for testimonial/quote/proof blocks use availableReviews verbatim (real author + body + rating). When a review has an image, prefer a `quote` block and set its image.url to that review's image so the right dog pairs with the right words. Never put a review photo with a different review.",
        "Product/offer: use the buyBox for product name, price and CTA. Put the guarantee near CTAs.",
      ]
        .filter(Boolean)
        .join("\n"),
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            brand: { name: brand.name },
            buyBox,
            format: plan.format ?? "",
            titlePattern: plan.titlePattern ?? "",
            structurePlan: plan.blocks ?? plan,
            availableImages,
            availableReviews,
            brandKnowledge: docsText,
          }),
        },
      ],
    });

    const toolUse = writeResp.content?.find((b: any) => b.type === "tool_use");
    let rawSections = toolUse?.input?.sections;
    // The model occasionally returns `sections` as a JSON string — coerce it.
    if (typeof rawSections === "string") rawSections = safeJson(rawSections);
    if (!Array.isArray(rawSections)) {
      return json({ error: "Generation did not return sections.", plan, raw: writeResp }, 502);
    }
    let sections = postProcessSections(rawSections);
    let gate = checkPage(sections);

    // Quality gate: if the page fails, run ONE corrective pass to fix the
    // specific failures before returning. Remaining issues are reported, not
    // hidden — and never block the response (the owner reviews before publish).
    if (gate.failures.length) {
      try {
        const fixResp = await callClaude({
          model: MODEL_WRITE,
          max_tokens: 14000,
          tools: [emitTool],
          tool_choice: { type: "tool", name: "emit_page" },
          system: [
            "You are revising an advertorial landing page to pass a strict quality gate. Return the FULL corrected page by calling emit_page.",
            "Keep the brand voice and obey every compliance rule: approved claims only, numbers ONLY verbatim from the existing copy (invent nothing), supports/helps language (never cure/treat/prevent), product name exactly \"5 Strain Probiotic+\".",
            "Fix EVERY listed failure. Rules to satisfy: no block is a heading + 3 or more paragraphs (pull the substance into a component — numberedReason/statPanel/strainBreakdown/chewsComparison/expectationTimeline/mechanismDiagram); no two ADJACENT blocks share the same media/layout; include at least one built component AND one video (poster placeholder, omit src + set role); keep a closing finalCta.",
            "Do NOT invent numbers or filler. If substance is missing, prefix the copy with '[NEEDS CONTENT: …]'. Preserve real reviews/images already placed.",
          ].join("\n"),
          messages: [
            {
              role: "user",
              content: JSON.stringify({
                failures: gate.failures,
                warnings: gate.warnings,
                currentSections: sections,
              }),
            },
          ],
        });
        const fixUse = fixResp.content?.find((b: any) => b.type === "tool_use");
        let rawFixed = fixUse?.input?.sections;
        if (typeof rawFixed === "string") rawFixed = safeJson(rawFixed);
        if (Array.isArray(rawFixed)) {
          const fixed = postProcessSections(rawFixed);
          const gate2 = checkPage(fixed);
          if (gate2.failures.length <= gate.failures.length) {
            sections = fixed;
            gate = gate2;
          }
        }
      } catch (_e) {
        // Keep the first draft + its gate result if the corrective pass fails.
      }
    }

    return json({ plan, sections, gate });
  } catch (err) {
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});
