import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import type { BrandKit, BuyBoxConfig, LandingPage, Section } from "@/types/page";
import { samplePage } from "@/data/samplePage";

// Read layer for landing pages. The renderer talks to Supabase through here.
// Everything falls back to the hardcoded sample so the app keeps working even
// before the database has data (or before .env is configured).

// Shape of a landing_pages row joined to its brand_kits row.
interface PageRow {
  slug: string;
  status: "draft" | "published";
  title: string;
  sections: Section[];
  buy_box: BuyBoxConfig;
  brand_kits: BrandKitRow | BrandKitRow[] | null;
}

interface BrandKitRow {
  name: string;
  wordmark: string | null;
  logo_url: string | null;
  colors: BrandKit["colors"];
  fonts: BrandKit["fonts"];
}

const SELECT =
  "slug,status,title,sections,buy_box,brand_kits(name,wordmark,logo_url,colors,fonts)";

/** Map a joined DB row into the LandingPage shape the components render. */
function rowToLandingPage(row: PageRow): LandingPage {
  // Supabase returns a to-one relation as an object, but be defensive.
  const bk = Array.isArray(row.brand_kits) ? row.brand_kits[0] : row.brand_kits;
  const brandKit: BrandKit = {
    name: bk?.name ?? samplePage.brandKit.name,
    wordmark: bk?.wordmark || bk?.name || samplePage.brandKit.wordmark,
    colors: bk?.colors ?? samplePage.brandKit.colors,
    fonts: bk?.fonts ?? samplePage.brandKit.fonts,
  };
  return {
    slug: row.slug,
    status: row.status,
    title: row.title,
    brandKit,
    buyBox: row.buy_box,
    sections: row.sections,
  };
}

/** Fetch one published page by slug. Falls back to the sample page if missing. */
export async function getPublishedPage(slug: string): Promise<LandingPage | null> {
  if (!isSupabaseConfigured) {
    return slug === samplePage.slug ? samplePage : null;
  }

  const { data, error } = await supabase
    .from("landing_pages")
    .select(SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("[pages] getPublishedPage failed:", error.message);
  }
  if (data) return rowToLandingPage(data as unknown as PageRow);

  // Not in the DB yet — keep the sample slug working for the demo.
  return slug === samplePage.slug ? samplePage : null;
}

/** Turn a title/product name into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export interface SavePageInput {
  slug: string;
  title: string;
  status: "draft" | "published";
  /** The master brand's id (managed in the Hub, not per page). */
  brandKitId: string;
  buyBox: BuyBoxConfig;
  sections: Section[];
  competitorUrl?: string;
}

/**
 * Save (insert or update) a landing page by slug, linked to the master brand.
 * Requires an authenticated session (RLS allows writes only to the owner).
 */
export async function savePage(input: SavePageInput): Promise<{ slug: string }> {
  const { error } = await supabase.from("landing_pages").upsert(
    {
      slug: input.slug,
      title: input.title,
      status: input.status,
      brand_kit_id: input.brandKitId,
      sections: input.sections,
      buy_box: input.buyBox,
      competitor_url: input.competitorUrl ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" }
  );
  if (error) throw new Error(`Saving page: ${error.message}`);
  return { slug: input.slug };
}

/** List pages for the admin console. Falls back to [sample] when DB is empty. */
export async function listPages(): Promise<LandingPage[]> {
  if (!isSupabaseConfigured) return [samplePage];

  const { data, error } = await supabase
    .from("landing_pages")
    .select(SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[pages] listPages failed:", error.message);
    return [samplePage];
  }
  if (!data || data.length === 0) return [samplePage];
  return (data as unknown as PageRow[]).map(rowToLandingPage);
}
