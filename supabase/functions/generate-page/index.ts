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

// --- Fetch competitor page and strip to readable text. ----------------------
async function fetchReadable(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; GFP-LandingHub/1.0)" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Could not fetch competitor URL (HTTP ${res.status})`);
  const html = await res.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ") // strip tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  // Cap to keep token cost sane; advertorials front-load their structure.
  return text.slice(0, 18000);
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
                "Slots for this section type. hero{eyebrow?,headline,subheadline,ctaLabel,trustLine?}; problemAgitate{headline,intro?,painPoints:[{title,body}]}; mechanism{eyebrow?,headline,subheadline?,steps:[{title,body}]}; proof{headline,stats?:[{value,label}],reviews:[{quote,author,rating}]}; offer{headline,subheadline?,bullets:[string],guarantee?}; faq{headline,items:[{q,a}]}; finalCta{headline,subheadline?,ctaLabel,trustLine?}",
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

  const { competitorUrl, brandKit, buyBox } = payload ?? {};
  if (!competitorUrl || typeof competitorUrl !== "string") {
    return json({ error: "competitorUrl is required." }, 400);
  }
  if (!brandKit) return json({ error: "brandKit is required." }, 400);

  try {
    // 1) Fetch competitor page.
    const pageText = await fetchReadable(competitorUrl);

    // 2) PASS 1 — comprehensive strategic teardown (structure, not copy).
    const analysisResp = await callClaude({
      model: MODEL_ANALYZE,
      max_tokens: 2000,
      system:
        "You are a direct-response strategist. Analyze a competitor advertorial/landing page and extract its PERSUASION STRUCTURE only — never copy its wording. Output a tight JSON object with keys: angle, hook, targetAudience, tone, persuasionSequence (array of stage names in order), offerStructure (pricing/bundle/guarantee/urgency cues), objections (array), proofTypes (array), keySectionsSkeleton (array of {section, purpose, keyPoints[]}). Respond with ONLY the JSON object, no prose.",
      messages: [
        {
          role: "user",
          content: `Competitor page text:\n"""\n${pageText}\n"""`,
        },
      ],
    });
    const analysisText =
      analysisResp.content?.find((b: any) => b.type === "text")?.text ?? "{}";
    let analysis: unknown;
    try {
      analysis = JSON.parse(analysisText);
    } catch {
      analysis = { raw: analysisText };
    }

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
        "- Stay strictly on-brand. Voice/tone: " + (bk.voice || "clear, trustworthy, benefit-led") + ".",
        bk.allowedClaims?.length
          ? "- You may ONLY make product claims from this allowed list: " + JSON.stringify(bk.allowedClaims) + ". Do not invent health/performance claims beyond it."
          : "- Avoid unverifiable health/performance claims.",
        bk.bannedWords?.length
          ? "- NEVER use these banned words: " + JSON.stringify(bk.bannedWords) + "."
          : "",
        "- Reviews must be plausible but clearly generic placeholders the owner can replace; do not fabricate specific named studies.",
        "- Order sections for maximum persuasion. Include a hero, the problem, the mechanism, proof, the offer, an faq, and a final CTA.",
      ].join("\n"),
      messages: [
        {
          role: "user",
          content: JSON.stringify({
            brand: { name: bk.name, voice: bk.voice },
            product: buyBox ?? null,
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

    return json({ analysis, sections: toolUse.input.sections });
  } catch (err) {
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});
