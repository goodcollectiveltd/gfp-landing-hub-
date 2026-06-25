// Supabase Edge Function: list-products
// Reads a Shopify store's public products feed (/products.json) server-side and
// returns a normalized product list for the generator's product picker. Running
// server-side avoids browser cross-origin (CORS) issues with the store domain.
//
// Deploy: supabase functions deploy list-products  (no secrets needed).

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

function normDomain(d: string): string {
  return d.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").trim();
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
  const domain = normDomain(String(body?.storeDomain ?? ""));
  if (!domain) return json({ error: "storeDomain is required." }, 400);

  try {
    const products: any[] = [];
    for (let page = 1; page <= 5; page++) {
      const res = await fetch(
        `https://${domain}/products.json?limit=250&page=${page}`,
        { headers: { "User-Agent": "Mozilla/5.0 (compatible; GFP-LandingHub/1.0)" } }
      );
      if (!res.ok) {
        if (page === 1)
          return json({ error: `Could not read products from ${domain} (HTTP ${res.status}).` }, 502);
        break;
      }
      const data = await res.json();
      const batch: any[] = data.products ?? [];
      if (!batch.length) break;
      for (const p of batch) {
        const v = (p.variants ?? [])[0] ?? {};
        products.push({
          title: p.title,
          handle: p.handle,
          url: `https://${domain}/products/${p.handle}`,
          price: v.price ?? null,
          compareAtPrice: v.compare_at_price ?? null,
          image: (p.images ?? [])[0]?.src ?? null,
        });
      }
      if (batch.length < 250) break;
    }
    return json({ products });
  } catch (err) {
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});
