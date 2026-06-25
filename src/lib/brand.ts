import { supabase } from "@/integrations/supabase/client";
import type { BrandKit } from "@/types/page";

// The single master brand (one fixed brand across every page). Stored as one row
// in brand_kits and edited in the Hub — NOT re-entered per page.

export interface MasterBrand {
  id: string;
  name: string;
  wordmark: string;
  voice: string;
  allowedClaims: string[];
  bannedWords: string[];
  primary: string;
  accent: string;
}

const DEFAULT_PRIMARY = "#1f6f5c";
const DEFAULT_ACCENT = "#e8a13a";
const FONTS = {
  heading: "'Georgia', 'Times New Roman', serif",
  body: "system-ui, -apple-system, 'Segoe UI', sans-serif",
};

/** Full brand color object from the two editable colors. */
export function makeColors(primary: string, accent: string): BrandKit["colors"] {
  return {
    primary,
    onPrimary: "#ffffff",
    accent,
    background: "#fbfaf7",
    text: "#1c2b27",
    muted: "#5d6b66",
  };
}

/** Build the renderer's BrandKit from the master brand. */
export function brandKitFromMaster(b: MasterBrand): BrandKit {
  return {
    name: b.name,
    wordmark: b.wordmark || b.name,
    colors: makeColors(b.primary, b.accent),
    fonts: FONTS,
  };
}

/** Load the master brand (the single brand_kits row), or null if none set yet. */
export async function getMasterBrand(): Promise<MasterBrand | null> {
  const { data, error } = await supabase
    .from("brand_kits")
    .select("id,name,wordmark,voice,allowed_claims,banned_words,colors")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[brand] getMasterBrand:", error.message);
    return null;
  }
  if (!data) return null;
  const colors = (data.colors ?? {}) as Partial<BrandKit["colors"]>;
  return {
    id: data.id as string,
    name: data.name as string,
    wordmark: (data.wordmark as string) || (data.name as string),
    voice: (data.voice as string) ?? "",
    allowedClaims: (data.allowed_claims as string[]) ?? [],
    bannedWords: (data.banned_words as string[]) ?? [],
    primary: colors.primary ?? DEFAULT_PRIMARY,
    accent: colors.accent ?? DEFAULT_ACCENT,
  };
}

/** Create or update the master brand. Requires an authenticated session. */
export async function saveMasterBrand(
  b: Omit<MasterBrand, "id">
): Promise<MasterBrand> {
  const fields = {
    name: b.name,
    wordmark: b.wordmark || b.name,
    voice: b.voice,
    allowed_claims: b.allowedClaims,
    banned_words: b.bannedWords,
    colors: makeColors(b.primary, b.accent),
    fonts: FONTS,
  };

  const existing = await getMasterBrand();
  if (existing) {
    const { error } = await supabase
      .from("brand_kits")
      .update(fields)
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
    return { ...b, id: existing.id };
  }
  const { data, error } = await supabase
    .from("brand_kits")
    .insert(fields)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { ...b, id: data.id as string };
}
