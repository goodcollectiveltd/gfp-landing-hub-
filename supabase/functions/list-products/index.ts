// Supabase Edge Function: list-products
// Returns a brand's products with EVERY buy option (variant, and — when a
// Shopify Storefront token is configured — subscription / selling-plan pricing).
//
// Two modes:
//  - Storefront API (preferred): set secrets SHOPIFY_STOREFRONT_TOKEN and
//    SHOPIFY_STORE_DOMAIN (the *.myshopify.com domain). Gets accurate variant +
//    subscription prices and real checkout links.
//  - Public fallback: no token → reads /products.json (all variants, no
//    subscription pricing).
//
// Each option carries a ready checkout URL (cart permalink, with selling_plan
// when it's a subscription). The public cart domain comes from the request's
// storeDomain (e.g. goodforpets.co) so checkout stays on the custom domain.

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
const normDomain = (d: string) =>
  d.replace(/^https?:\/\//i, "").replace(/\/.*$/, "").trim();
const numericId = (gid: string) => gid.split("/").pop() ?? gid;

interface Option {
  label: string;
  price: string | null;
  compareAtPrice: string | null;
  checkoutUrl: string;
}
interface Product {
  title: string;
  handle: string;
  url: string;
  image: string | null;
  options: Option[];
}

// ---- Storefront API mode -------------------------------------------------
const STOREFRONT_QUERY = `
query Products {
  products(first: 50) {
    edges { node {
      title handle
      featuredImage { url }
      variants(first: 100) { edges { node {
        id title availableForSale
        price { amount }
        compareAtPrice { amount }
        sellingPlanAllocations(first: 10) { edges { node {
          sellingPlan { id name }
          priceAdjustments { perDeliveryPrice { amount } price { amount } }
        }}}
      }}}
    }}
  }
}`;

async function fromStorefront(
  apiDomain: string,
  token: string,
  cartDomain: string
): Promise<Product[]> {
  const res = await fetch(`https://${apiDomain}/api/2024-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query: STOREFRONT_QUERY }),
  });
  if (!res.ok) throw new Error(`Shopify Storefront API error (HTTP ${res.status}).`);
  const data = await res.json();
  if (data.errors) throw new Error(`Shopify: ${JSON.stringify(data.errors).slice(0, 200)}`);

  return (data.data?.products?.edges ?? []).map((pe: any) => {
    const p = pe.node;
    const options: Option[] = [];
    for (const ve of p.variants?.edges ?? []) {
      const v = ve.node;
      const vid = numericId(v.id);
      const isDefault = v.title === "Default Title";
      const base = `https://${cartDomain}/cart/${vid}:1`;
      // One-time purchase option.
      options.push({
        label: isDefault ? "One-time" : v.title,
        price: v.price?.amount ?? null,
        compareAtPrice: v.compareAtPrice?.amount ?? null,
        checkoutUrl: base,
      });
      // Subscription / selling-plan options (real per-delivery price).
      for (const ae of v.sellingPlanAllocations?.edges ?? []) {
        const a = ae.node;
        const adj = (a.priceAdjustments ?? [])[0];
        const subPrice = adj?.perDeliveryPrice?.amount ?? adj?.price?.amount ?? v.price?.amount;
        const planId = numericId(a.sellingPlan.id);
        options.push({
          label: `${isDefault ? "" : v.title + " — "}${a.sellingPlan.name}`,
          price: subPrice ?? null,
          compareAtPrice: v.price?.amount ?? null, // show one-time price as the "was"
          checkoutUrl: `${base}?selling_plan=${planId}`,
        });
      }
    }
    return {
      title: p.title,
      handle: p.handle,
      url: `https://${cartDomain}/products/${p.handle}`,
      image: p.featuredImage?.url ?? null,
      options,
    };
  });
}

// ---- Public products.json fallback (all variants) ------------------------
async function fromPublicFeed(domain: string): Promise<Product[]> {
  const products: Product[] = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`https://${domain}/products.json?limit=250&page=${page}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; GFP-LandingHub/1.0)" },
    });
    if (!res.ok) {
      if (page === 1) throw new Error(`Could not read products from ${domain} (HTTP ${res.status}).`);
      break;
    }
    const data = await res.json();
    const batch: any[] = data.products ?? [];
    if (!batch.length) break;
    for (const p of batch) {
      const options: Option[] = (p.variants ?? []).map((v: any) => ({
        label: v.title === "Default Title" ? "One-time" : v.title,
        price: v.price ?? null,
        compareAtPrice: v.compare_at_price ?? null,
        checkoutUrl: `https://${domain}/cart/${v.id}:1`,
      }));
      products.push({
        title: p.title,
        handle: p.handle,
        url: `https://${domain}/products/${p.handle}`,
        image: (p.images ?? [])[0]?.src ?? null,
        options,
      });
    }
    if (batch.length < 250) break;
  }
  return products;
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
  const cartDomain = normDomain(String(body?.storeDomain ?? ""));
  if (!cartDomain) return json({ error: "storeDomain is required." }, 400);

  const token = Deno.env.get("SHOPIFY_STOREFRONT_TOKEN");
  const apiDomain = Deno.env.get("SHOPIFY_STORE_DOMAIN");

  try {
    const products =
      token && apiDomain
        ? await fromStorefront(normDomain(apiDomain), token, cartDomain)
        : await fromPublicFeed(cartDomain);
    return json({ products, mode: token && apiDomain ? "storefront" : "public" });
  } catch (err) {
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});
