import { supabase } from "@/integrations/supabase/client";

// Live products (with every buy option) from a brand's Shopify store, via the
// list-products edge function. Each option = a variant or subscription choice,
// with its real price and a ready checkout URL.

export interface ProductOption {
  label: string;
  price: string | null;
  compareAtPrice: string | null;
  checkoutUrl: string;
}

export interface StoreProduct {
  title: string;
  handle: string;
  url: string;
  image: string | null;
  options: ProductOption[];
}

export async function listProducts(storeDomain: string): Promise<StoreProduct[]> {
  if (!storeDomain) return [];
  const { data, error } = await supabase.functions.invoke("list-products", {
    body: { storeDomain },
  });
  if (error) {
    let detail = error.message;
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx?.json) {
        const b = await ctx.json();
        if (b?.error) detail = b.error;
      }
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return (data?.products ?? []) as StoreProduct[];
}

/** Format a Shopify price number (e.g. "44.99") as a tidy display price. */
export function formatPrice(p: string | null, currency = "£"): string {
  if (!p) return "";
  const n = Number(p);
  if (Number.isNaN(n)) return p;
  const s = n % 1 === 0 ? String(n) : n.toFixed(2);
  return `${currency}${s}`;
}
