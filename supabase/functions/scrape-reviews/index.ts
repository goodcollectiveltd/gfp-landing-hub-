// Supabase Edge Function: scrape-reviews
// Scrapes photo reviews embedded in a store's pages (theme review carousels)
// and returns structured reviews: { name, rating, text, image }.
// Input: { url }   ->   { reviews: [...] }
// Uses Claude (Haiku) only to split the reviewer name from the review text.
// Secret: ANTHROPIC_API_KEY (already set).

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const MODEL = "claude-haiku-4-5";

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
const stripTags = (h: string) =>
  h.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
const httpsify = (u: string) => (u.startsWith("//") ? "https:" + u : u);

function safeJson(text: string): any {
  try {
    let c = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const a = c.indexOf("[");
    const b = c.lastIndexOf("]");
    if (a !== -1 && b !== -1) c = c.slice(a, b + 1);
    return JSON.parse(c);
  } catch {
    return [];
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Body must be JSON." }, 400);
  }
  const url = body?.url;
  if (!url || typeof url !== "string") return json({ error: "url is required." }, 400);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GFP-LandingHub/1.0)" },
    });
    if (!res.ok) return json({ error: `Could not fetch ${url} (HTTP ${res.status}).` }, 502);
    const html = await res.text();

    // Split into carousel slides; keep only those that contain a star rating.
    const chunks = html.split(/<li[^>]*class="[^"]*splide__slide/i).slice(1);
    const raw: { image: string | null; rating: number; text: string }[] = [];
    for (const chunk of chunks) {
      const stars = (chunk.match(/★/g) || []).length;
      if (!stars) continue; // not a review slide
      const imgMatch =
        chunk.match(/src="(\/\/[^"]+cdn\/shop[^"]+)"/i) ||
        chunk.match(/src="(https?:\/\/[^"]+cdn[^"]+)"/i) ||
        chunk.match(/data-src="([^"]+)"/i);
      const text = stripTags(chunk).replace(/★/g, "").trim();
      if (text.length < 15) continue;
      raw.push({
        image: imgMatch ? httpsify(imgMatch[1]) : null,
        rating: Math.min(stars, 5),
        text,
      });
    }

    if (!raw.length) return json({ reviews: [], note: "No review slides found on that page." });

    // Use Claude to split reviewer name from review body for each snippet.
    let parsed: any[] = [];
    if (ANTHROPIC_API_KEY) {
      const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 3000,
          system:
            "Each item is a customer product review that ends with the reviewer's name (sometimes after an emoji). " +
            "Return ONLY a JSON array, one object per item in the same order: {\"name\": string, \"text\": string}. " +
            "name = the reviewer's name only. text = the review body with the trailing name removed, kept verbatim otherwise.",
          messages: [
            { role: "user", content: JSON.stringify(raw.map((r, i) => ({ i, snippet: r.text }))) },
          ],
        }),
      });
      if (aiRes.ok) {
        const data = await aiRes.json();
        parsed = safeJson(data.content?.find((b: any) => b.type === "text")?.text ?? "[]");
      }
    }

    const reviews = raw.map((r, i) => ({
      name: parsed[i]?.name ?? "",
      text: parsed[i]?.text ?? r.text,
      rating: r.rating,
      image: r.image,
    }));

    return json({ reviews });
  } catch (err) {
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});
