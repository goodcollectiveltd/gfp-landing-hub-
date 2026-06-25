// Supabase Edge Function: list-products
// Returns a brand's products with EVERY buy option (each variant, plus any
// Subscribe & Save / selling-plan options with their real discounted price).
//
// No Shopify app or token required: we read the store's public storefront JSON
// (/products.json for the handle list, then /products/<handle>.js per product,
// which includes accurate prices + selling_plan_groups). Runs server-side, so
// no browser cross-origin issues. Each option carries a ready checkout link.

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
const UA = { "User-Agent": "Mozilla/5.0 (compatible; GFP-LandingHub/1.0)" };
const normDomain = (d: string) => d.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").trim();
const httpsify = (u: string | null | undefined) =>
  !u ? null : u.startsWith("//") ? "https:" + u : u;
const money = (cents: number | null | undefined) =>
  cents == null ? null : (cents / 100).toFixed(2);

interface Option {
  label: string;
  price: string | null;
  compareAtPrice: string | null;
  checkoutUrl: string;
}

// All product handles (from the lightweight products.json list).
async function fetchHandles(domain: string): Promise<string[]> {
  const handles: string[] = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`https://${domain}/products.json?limit=250&page=${page}`, {
      headers: UA,
    });
    if (!res.ok) {
      if (page === 1) throw new Error(`Could not read products from ${domain} (HTTP ${res.status}).`);
      break;
    }
    const data = await res.json();
    const batch: any[] = data.products ?? [];
    if (!batch.length) break;
    for (const p of batch) handles.push(p.handle);
    if (batch.length < 250) break;
  }
  return handles;
}

// Build buy options (variants + subscription plans) from a product's .js data.
function buildOptions(domain: string, p: any): Option[] {
  const opts: Option[] = [];
  const groups: any[] = p.selling_plan_groups ?? [];
  for (const v of p.variants ?? []) {
    const base = `https://${domain}/cart/${v.id}:1`;
    const isDefault = v.title === "Default Title";
    const vt = isDefault ? "" : v.title;
    // One-time purchase.
    opts.push({
      label: isDefault ? "One-time" : v.title,
      price: money(v.price),
      compareAtPrice: money(v.compare_at_price),
      checkoutUrl: base,
    });
    // Subscription / selling-plan options (real discounted per-delivery price).
    for (const g of groups) {
      for (const sp of g.selling_plans ?? []) {
        const adj = (sp.price_adjustments ?? [])[0];
        let cents = v.price;
        if (adj) {
          if (adj.value_type === "percentage") cents = Math.round(v.price * (1 - adj.value / 100));
          else if (adj.value_type === "fixed_amount") cents = v.price - adj.value;
          else if (adj.value_type === "price") cents = adj.value;
        }
        opts.push({
          label: `${vt ? vt + " — " : ""}${sp.name}`,
          price: money(cents),
          compareAtPrice: money(v.price), // one-time price as the "was"
          checkoutUrl: `${base}?selling_plan=${sp.id}`,
        });
      }
    }
  }
  return opts;
}

async function fetchProduct(domain: string, handle: string, country: string) {
  // ?country= forces Shopify Markets pricing for that market, so the price is
  // deterministic regardless of where this server runs (e.g. GB → UK prices).
  const res = await fetch(
    `https://${domain}/products/${handle}.js?country=${encodeURIComponent(country)}`,
    { headers: UA }
  );
  if (!res.ok) return null;
  const p = await res.json();
  return {
    title: p.title,
    handle: p.handle,
    url: `https://${domain}/products/${p.handle}`,
    image: httpsify(p.featured_image ?? (p.images ?? [])[0]),
    options: buildOptions(domain, p),
  };
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
  // Market country for pricing (default GB). Keeps prices deterministic.
  const country = String(body?.country || "GB").toUpperCase().slice(0, 2);

  try {
    const handles = (await fetchHandles(domain)).slice(0, 80); // cap for speed
    const products: any[] = [];
    // Fetch product details in small concurrent batches.
    for (let i = 0; i < handles.length; i += 8) {
      const chunk = handles.slice(i, i + 8);
      const results = await Promise.all(
        chunk.map((h) => fetchProduct(domain, h, country).catch(() => null))
      );
      for (const r of results) if (r) products.push(r);
    }
    return json({ products });
  } catch (err) {
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});
