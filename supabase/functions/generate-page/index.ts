// Supabase Edge Function: generate-page
// ---------------------------------------------------------------------------
// The core engine. Given a competitor URL + a brand kit, it:
//   1. Fetches the competitor page and reduces it to readable text.
//   2. Claude PASS 1 — comprehensive strategic teardown (structure/persuasion
//      only, NOT the competitor's words).
//   3. Claude PASS 2 — rebuilds that playbook into OUR section JSON with
//      original, on-brand copy (respecting allowed claims / banned words).
// Returns { analysis, sections } for the admin console to preview + save.
//
// Secrets (set in Supabase dashboard → Edge Functions → Secrets):
//   ANTHROPIC_API_KEY   (required)
//
// Deploy (dashboard, no CLI): Edge Functions → Deploy a new function →
// name it "generate-page" → paste this file → Deploy.
// ---------------------------------------------------------------------------

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

// Latest models: Opus for generation quality, Haiku for cheap extraction.
const MODEL_GENERATE = "claude-opus-4-8";
const MODEL_ANALYZE = "claude-haiku-4-5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// --- Anthropic call with simple 429/5xx backoff (inline ai-proxy for v1). ----
async function callClaude(opts: {
  model: string;
  system: string;
  messages: unknown[];
  tools?: unknown[];
  tool_choice?: unknown;
  max_tokens?: number;
}): Promise<any> {
  const maxAttempts = 4;
  let lastErr = "";
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
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
    // Retry on rate limit / transient server errors with exponential backoff.
    if (res.status === 429 || res.status >= 500) {
      const waitMs = 1000 * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }
    break; // non-retryable
  }
  throw new Error(`Anthropic request failed: ${lastErr}`);
}

// --- HTML → readable text. --------------------------------------------------
function stripToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ") // strip tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchHtml(url: string, label: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; GFP-LandingHub/1.0)" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Could not fetch ${label} (HTTP ${res.status})`);
  return await res.text();
}

// Competitor page: text only (we want its structure, not its images).
async function fetchReadable(url: string): Promise<string> {
  const html = await fetchHtml(url, "competitor URL");
  return stripToText(html).slice(0, 18000); // advertorials front-load structure
}

// --- Product page: text + candidate product images. -------------------------
function absolutize(src: string, base: string): string | null {
  try {
    return new URL(src, base).href;
  } catch {
    return null;
  }
}

/** Pull real, plausibly-product image URLs from product-page HTML. */
function extractImages(html: string, baseUrl: string): { url: string; alt: string }[] {
  const out: { url: string; alt: string }[] = [];
  const seen = new Set<string>();
  const push = (rawSrc: string | undefined, alt = "") => {
    if (!rawSrc) return;
    const abs = absolutize(rawSrc.trim(), baseUrl);
    if (!abs || !/^https?:/i.test(abs)) return;
    if (/\.svg(\?|$)/i.test(abs)) return;
    if (/(sprite|favicon|icon|logo|pixel|tracking|loader|spinner|1x1|placeholder)/i.test(abs))
      return;
    if (seen.has(abs)) return;
    seen.add(abs);
    out.push({ url: abs, alt: alt.slice(0, 120) });
  };
  // og:image first (usually the canonical product shot).
  const og =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (og) push(og[1]);
  // Then <img> tags (src / data-src), capturing alt for relevance hints.
  const imgRe = /<img\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRe.exec(html)) && out.length < 20) {
    const tag = m[0];
    const src =
      tag.match(/\bsrc=["']([^"']+)["']/i)?.[1] ??
      tag.match(/\bdata-src=["']([^"']+)["']/i)?.[1];
    const alt = tag.match(/\balt=["']([^"']*)["']/i)?.[1] ?? "";
    push(src, alt);
  }
  return out.slice(0, 12);
}

async function fetchProductPage(
  url: string
): Promise<{ text: string; images: { url: string; alt: string }[] }> {
  const html = await fetchHtml(url, "product URL");
  return { text: stripToText(html).slice(0, 14000), images: extractImages(html, url) };
}

// Lenient JSON parse for model output (handles ```json fences / stray prose).
function safeJsonParse(text: string): any {
  try {
    let c = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const a = c.indexOf("{");
    const b = c.lastIndexOf("}");
    if (a !== -1 && b !== -1) c = c.slice(a, b + 1);
    return JSON.parse(c);
  } catch {
    return { raw: text };
  }
}

// --- The section JSON schema we force Claude to emit (PASS 2). ---------------
// Mirrors src/types/page.ts. Kept permissive on per-section data so the model
// has room, but the section `type`s are locked to our components.
const sectionsTool = {
  name: "emit_page",
  description: "Return the finished advertorial as structured section JSON.",
  input_schema: {
    type: "object",
    properties: {
      sections: {
        type: "array",
        description: "Ordered sections. Use each type at most once; reorder freely.",
        items: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: [
                "hero",
                "problemAgitate",
                "mechanism",
                "proof",
                "offer",
                "faq",
                "finalCta",
              ],
            },
            data: {
              type: "object",
              description:
                "Slots for this section type. hero{eyebrow?,headline,subheadline,ctaLabel,trustLine?,image?}; problemAgitate{headline,intro?,painPoints:[{title,body}]}; mechanism{eyebrow?,headline,subheadline?,steps:[{title,body}]}; proof{headline,stats?:[{value,label}],reviews:[{quote,author,rating}]}; offer{headline,subheadline?,bullets:[string],guarantee?,image?}; faq{headline,items:[{q,a}]}; finalCta{headline,subheadline?,ctaLabel,trustLine?}. image fields are product photo URLs and MUST be copied verbatim from the provided allowedImages list — never invent an image URL, and omit the field if no suitable image was provided.",
            },
          },
          required: ["type", "data"],
        },
      },
    },
    required: ["sections"],
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!ANTHROPIC_API_KEY) {
    return json({ error: "ANTHROPIC_API_KEY secret is not set on this function." }, 500);
  }

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Body must be JSON." }, 400);
  }

  const { competitorUrl, productUrl, brandKit, buyBox } = payload ?? {};
  if (!competitorUrl || typeof competitorUrl !== "string") {
    return json({ error: "competitorUrl is required." }, 400);
  }
  if (!brandKit) return json({ error: "brandKit is required." }, 400);

  try {
    // 1) Fetch competitor page + (optionally) the owner's product page in parallel.
    const [pageText, product] = await Promise.all([
      fetchReadable(competitorUrl),
      productUrl && typeof productUrl === "string"
        ? fetchProductPage(productUrl)
        : Promise.resolve(null),
    ]);

    // 2) PASS 1 — comprehensive strategic teardown (structure, not copy).
    const analysisResp = await callClaude({
      model: MODEL_ANALYZE,
      max_tokens: 2000,
      system:
        "You are a direct-response strategist. Analyze a competitor advertorial/landing page and extract its PERSUASION STRUCTURE only — never copy its wording. Output a tight JSON object with keys: angle, hook, targetAudience, tone, persuasionSequence (array of stage names in order), offerStructure (pricing/bundle/guarantee/urgency cues), objections (array), proofTypes (array), keySectionsSkeleton (array of {section, purpose, keyPoints[]}). Respond with ONLY the JSON object, no prose.",
      messages: [
        { role: "user", content: `Competitor page text:\n"""\n${pageText}\n"""` },
      ],
    });
    const analysis = safeJsonParse(
      analysisResp.content?.find((b: any) => b.type === "text")?.text ?? "{}"
    );

    // 2b) PRODUCT PASS — extract real product facts + pick real product images
    //     (chosen only from the candidate URLs we scraped).
    let productFacts: any = null;
    if (product) {
      const prodResp = await callClaude({
        model: MODEL_ANALYZE,
        max_tokens: 1500,
        system:
          "Extract structured product facts from this product page to ground an advertorial. Return ONLY JSON: { name, tagline, summary, keyFeatures:[], ingredients:[], claims:[], price, heroImage, gallery:[] }. heroImage and gallery MUST be chosen ONLY from the provided candidate image URLs (copy exact URL strings) — pick the single best main product shot as heroImage and up to 3 other genuine product images for gallery; skip logos/banners/lifestyle/unrelated images. If none are clearly product images, leave heroImage empty and gallery [].",
        messages: [
          {
            role: "user",
            content: JSON.stringify({
              productPageText: product.text,
              candidateImages: product.images,
            }),
          },
        ],
      });
      productFacts = safeJsonParse(
        prodResp.content?.find((b: any) => b.type === "text")?.text ?? "{}"
      );
    }

    // Whitelist of image URLs the generator is allowed to use (verbatim only).
    const allowedImages: string[] = [];
    if (productFacts?.heroImage) allowedImages.push(productFacts.heroImage);
    if (Array.isArray(productFacts?.gallery)) allowedImages.push(...productFacts.gallery);

    // 3) PASS 2 — rebuild on-brand with original copy, forced into our schema.
    const bk = brandKit;
    const genResp = await callClaude({
      model: MODEL_GENERATE,
      max_tokens: 4096,
      tools: [sectionsTool],
      tool_choice: { type: "tool", name: "emit_page" },
      system: [
        "You are an expert direct-response copywriter for a DTC e-commerce brand.",
        "Write a complete advertorial landing page by calling emit_page.",
        "Rules:",
        "- Use the competitor TEARDOWN only as a strategic blueprint (sequence, angles, proof types). NEVER reuse the competitor's literal wording. All copy must be original.",
        product
          ? "- Ground ALL product specifics (name, benefits, features, ingredients) in the provided productFacts — this is the REAL product. Do not invent product attributes that contradict it; use the real product name."
          : "",
        allowedImages.length
          ? "- You may set hero.data.image and offer.data.image, but ONLY to a URL copied verbatim from allowedImages. Never invent an image URL. Prefer productFacts.heroImage for the hero."
          : "- No product images are available; omit all image fields.",
        "- Stay strictly on-brand. Voice/tone: " + (bk.voice || "clear, trustworthy, benefit-led") + ".",
        bk.allowedClaims?.length
          ? "- You may ONLY make product claims from this allowed list: " + JSON.stringify(bk.allowedClaims) + ". Do not invent health/performance claims beyond it."
          : "- Avoid unverifiable health/performance claims.",
        bk.bannedWords?.length
          ? "- NEVER use these banned words: " + JSON.stringify(bk.bannedWords) + "."
          : "",
        "- Reviews must be plausible but clearly generic placeholders the owner can replace; do not fabricate specific named studies.",
        "- Order sections for maximum persuasion. Include a hero, the problem, the mechanism, proof, the offer, an faq, and a final CTA.",
      ]
        .filter(Boolean)
        .join("\n"),
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            brand: { name: bk.name, voice: bk.voice },
            product: buyBox ?? null,
            productFacts,
            allowedImages,
            competitorTeardown: analysis,
          }),
        },
      ],
    });

    const toolUse = genResp.content?.find((b: any) => b.type === "tool_use");
    if (!toolUse?.input?.sections) {
      return json(
        { error: "Generation did not return sections.", raw: genResp },
        502
      );
    }

    return json({ analysis, productFacts, sections: toolUse.input.sections });
  } catch (err) {
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});
