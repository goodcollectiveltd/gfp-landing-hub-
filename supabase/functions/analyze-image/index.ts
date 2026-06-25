// Supabase Edge Function: analyze-image
// Captions + categorizes a brand image using Claude vision, so the generator
// knows exactly what each image shows and can place it well.
// Input: { imageUrl }  ->  { caption, tag }
// Secret: ANTHROPIC_API_KEY (already set on the project).

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const MODEL = "claude-haiku-4-5"; // vision-capable and cheap for captioning

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

const TAGS = [
  "product",
  "dog",
  "vet",
  "before",
  "after",
  "before-after",
  "ugc",
  "lifestyle",
  "ingredient",
  "other",
];

function safeJson(text: string): any {
  try {
    let c = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const a = c.indexOf("{");
    const b = c.lastIndexOf("}");
    if (a !== -1 && b !== -1) c = c.slice(a, b + 1);
    return JSON.parse(c);
  } catch {
    return {};
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!ANTHROPIC_API_KEY) return json({ error: "ANTHROPIC_API_KEY not set." }, 500);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Body must be JSON." }, 400);
  }
  const imageUrl = body?.imageUrl;
  if (!imageUrl || typeof imageUrl !== "string")
    return json({ error: "imageUrl is required." }, 400);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system:
          "You caption and categorize images for a DTC pet-supplement brand's landing pages. " +
          "Respond with ONLY a JSON object: {\"caption\": string, \"tag\": string}. " +
          "caption: one specific, vivid sentence describing exactly what's shown — subject (which breed/person/product), setting, mood, and any visible text/claims/packaging. " +
          "Note if it's a customer/UGC-style photo, a clinical/vet shot, a product packshot, or a before/after. " +
          "tag: the single best-fit category from " + JSON.stringify(TAGS) + ".",
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "url", url: imageUrl } },
              { type: "text", text: "Caption and categorize this image." },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      return json({ error: `Vision request failed (HTTP ${res.status}): ${await res.text()}` }, 502);
    }
    const data = await res.json();
    const text = data.content?.find((b: any) => b.type === "text")?.text ?? "{}";
    const parsed = safeJson(text);
    const tag = TAGS.includes(parsed.tag) ? parsed.tag : "other";
    return json({ caption: String(parsed.caption ?? ""), tag });
  } catch (err) {
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});
