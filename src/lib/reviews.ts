import { supabase } from "@/integrations/supabase/client";

// Reviews library: real customer reviews (with their linked photos) the
// generator drops into Proof / UGC blocks. Brand-scoped, owner-managed.

export interface Review {
  id?: string;
  author: string;
  rating: number;
  body: string;
  date?: string | null;
  product?: string;
  images: string[];
  source?: string;
}

const SELECT = "id,author,rating,body,review_date,product,images,source";

function rowToReview(r: any): Review {
  return {
    id: r.id,
    author: r.author ?? "",
    rating: r.rating ?? 5,
    body: r.body ?? "",
    date: r.review_date ?? null,
    product: r.product ?? "",
    images: Array.isArray(r.images) ? r.images : [],
    source: r.source ?? "",
  };
}

/** Stable-ish key for de-duplication (author + start of body). */
const dedupeKey = (author: string, body: string) =>
  `${author.trim().toLowerCase()}|${body.trim().slice(0, 50).toLowerCase()}`;

export async function listReviews(brandId: string): Promise<Review[]> {
  if (!brandId) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select(SELECT)
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[reviews] listReviews:", error.message);
    return [];
  }
  return (data ?? []).map(rowToReview);
}

/** Normalize a loosely-typed incoming record into a Review. */
function normalize(r: any): Review | null {
  const author = String(r.name ?? r.author ?? "").trim();
  const body = String(r.text ?? r.body ?? "").trim();
  if (!body) return null;
  let images: string[] = [];
  if (Array.isArray(r.images)) images = r.images.filter((x: any) => typeof x === "string");
  else if (typeof r.image === "string") images = [r.image];
  const ratingNum = Number(r.rating);
  return {
    author,
    rating: Number.isFinite(ratingNum) ? Math.min(5, Math.max(1, Math.round(ratingNum))) : 5,
    body,
    date: r.date ?? r.review_date ?? null,
    product: String(r.product ?? "").trim(),
    images,
    source: r.source ?? "import",
  };
}

/** Bulk import reviews, skipping ones that already exist. */
export async function importReviews(
  brandId: string,
  incoming: any[]
): Promise<{ added: number; skipped: number }> {
  const existing = await listReviews(brandId);
  const seen = new Set(existing.map((r) => dedupeKey(r.author, r.body)));

  const toInsert: any[] = [];
  let skipped = 0;
  for (const raw of incoming) {
    const r = normalize(raw);
    if (!r) {
      skipped++;
      continue;
    }
    const key = dedupeKey(r.author, r.body);
    if (seen.has(key)) {
      skipped++;
      continue;
    }
    seen.add(key);
    toInsert.push({
      brand_id: brandId,
      author: r.author,
      rating: r.rating,
      body: r.body,
      review_date: r.date || null,
      product: r.product ?? "",
      images: r.images,
      source: r.source ?? "import",
    });
  }

  if (toInsert.length) {
    const { error } = await supabase.from("reviews").insert(toInsert);
    if (error) throw new Error(error.message);
  }
  return { added: toInsert.length, skipped };
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Scrape reviews from a page (theme review carousel) via the edge function. */
export async function scrapeReviews(url: string): Promise<any[]> {
  const { data, error } = await supabase.functions.invoke("scrape-reviews", {
    body: { url },
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
  return (data?.reviews ?? []) as any[];
}
