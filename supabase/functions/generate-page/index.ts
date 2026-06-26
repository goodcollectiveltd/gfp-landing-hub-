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
      out.push(l);
      continue;
    }
    if (/^(your cart|all products|cart|menu|policies|helpful links|monthly giveaway|©|powered by|skip to|search|log in|sign up|follow)/i.test(l))
      continue;
    const w = l.split(" ").filter(Boolean).length;
    if (w >= 3) out.push(`p(${w})`);
  }
  // Start at the first real headline so we drop nav/cart chrome.
  const firstH = out.findIndex((x) => x.startsWith("[H1]") || x.startsWith("[H2]"));
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

const BLOCK_TYPES = [
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
                "Image url values MUST be copied verbatim from availableImages or a review's image; never invent a URL. If nothing fits, omit url and set role to a short description (e.g. 'Vet holding the product').",
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
  if (!ANTHROPIC_API_KEY) return json({ error: "ANTHROPIC_API_KEY not set." }, 500);

  let payload: any;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Body must be JSON." }, 400);
  }

  const {
    competitorUrl,
    brand = {},
    buyBox = {},
    docs = [],
    images = [],
    reviews = [],
  } = payload ?? {};
  if (!competitorUrl) return json({ error: "competitorUrl is required." }, 400);

  try {
    // Fetch competitor page → text (structure source for pass 1 only).
    const res = await fetch(competitorUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GFP-LandingHub/1.0)" },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`Could not fetch competitor URL (HTTP ${res.status}).`);
    const html = await res.text();
    const skeleton = structuralSkeleton(html);

    // PASS 1 — turn the deterministic skeleton into a strict block plan.
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
        "For each block: type = best fit from " + JSON.stringify(BLOCK_TYPES) + " (heading+paragraphs, no image = richText; section with an [IMG] = imageText; standalone [IMG] = image; questions = faq; closing CTA = finalCta). " +
        "theme = the section's point IN YOUR OWN WORDS from its heading (never copy wording). " +
        "image = one of [none, top, beside, after] (none if no [IMG] in that block). " +
        "paragraphs = array of approx word counts for that block's body paragraphs, in order (e.g. [20,25]). " +
        "format = the page concept in a few words. titlePattern = the headline's shape/sentiment in your own words.",
      messages: [{ role: "user", content: `Structural skeleton:\n${skeleton}` }],
    });
    const plan = safeJson(planResp.content?.find((b: any) => b.type === "text")?.text ?? "") ?? {
      blocks: [],
    };

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
        "You are an elite direct-response copywriter for the DTC brand below. Build a complete advertorial landing page by calling emit_page.",
        "MIRROR THE STRUCTURE EXACTLY, block for block: emit EXACTLY one block per plan block, in the same order and the same TYPE. Emit the same TOTAL number of blocks as the plan — never add a section (no extra problem/mechanism/proof/comparison) the plan does not contain, and never drop or merge one. If it's a numbered listicle, number the reason headings (1., 2., 3.…).",
        "MATCH LENGTH & IMAGES per block: write the SAME NUMBER of paragraphs as the block's `paragraphs` array, each roughly that word count (within ~25%). Honour `image`: 'beside' or 'after' → an imageText (or image) block with an image slot; 'top' → a hero/offer image; 'none' → no image. Keep the brand's section to the same visual weight as the original.",
        "The HERO block's headline IS the page's main headline — build it from titlePattern in the SAME shape, in your own wording. For a numbered-listicle page the hero headline must take the '[N] Reasons …' form (e.g. '5 Reasons Dog Owners Are Switching to Good For Pets'), then the numbered reason sections follow. Mirror the FAQ questions with on-brand answers.",
        "WRITE 100% ORIGINAL COPY in the brand voice. You do NOT have the competitor's words — never reproduce competitor phrasing; only their structure and the abstracted themes guide you. Every sentence is yours, grounded in the brand docs.",
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
    if (!toolUse?.input?.sections) {
      return json({ error: "Generation did not return sections.", plan, raw: writeResp }, 502);
    }
    return json({ plan, sections: toolUse.input.sections });
  } catch (err) {
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});
