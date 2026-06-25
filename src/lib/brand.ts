import { supabase } from "@/integrations/supabase/client";
import type { BrandKit } from "@/types/page";

// Multiple comprehensive brands. Each is a row in brand_kits; the generator
// picks one. Logos live in the public "brand-assets" storage bucket.

export interface BrandLogo {
  label: string;
  url: string;
}
export interface BrandSwatch {
  label: string;
  hex: string;
}

export interface Brand {
  id?: string;
  name: string;
  wordmark: string;
  tagline: string;
  about: string;
  audience: string;
  voice: string;
  toneDos: string[];
  toneDonts: string[];
  examplePhrases: string[];
  allowedClaims: string[];
  bannedWords: string[];
  primary: string;
  accent: string;
  palette: BrandSwatch[];
  logos: BrandLogo[];
}

const FONTS = {
  heading: "'Georgia', 'Times New Roman', serif",
  body: "system-ui, -apple-system, 'Segoe UI', sans-serif",
};

export function emptyBrand(): Brand {
  return {
    name: "",
    wordmark: "",
    tagline: "",
    about: "",
    audience: "",
    voice: "",
    toneDos: [],
    toneDonts: [],
    examplePhrases: [],
    allowedClaims: [],
    bannedWords: [],
    primary: "#1f6f5c",
    accent: "#e8a13a",
    palette: [],
    logos: [],
  };
}

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

/** Renderer BrandKit from a Brand (first logo, if any, becomes the header logo). */
export function brandKitFromBrand(b: Brand): BrandKit {
  return {
    name: b.name,
    wordmark: b.wordmark || b.name,
    colors: makeColors(b.primary, b.accent),
    fonts: FONTS,
    logoUrl: b.logos[0]?.url,
  };
}

/**
 * Compose the rich brand context into the single `voice` string the generator
 * sends to the edge function — so tone/positioning/audience all influence copy
 * without needing a function change.
 */
export function brandVoiceBrief(b: Brand): string {
  return [
    b.voice,
    b.about ? `About the brand: ${b.about}` : "",
    b.audience ? `Target audience: ${b.audience}` : "",
    b.toneDos.length ? `Tone do's: ${b.toneDos.join("; ")}` : "",
    b.toneDonts.length ? `Tone don'ts: ${b.toneDonts.join("; ")}` : "",
    b.examplePhrases.length
      ? `On-brand example phrasings: ${b.examplePhrases.join(" | ")}`
      : "",
  ]
    .filter(Boolean)
    .join(". ");
}

const SELECT =
  "id,name,wordmark,tagline,about,audience,voice,tone_dos,tone_donts,example_phrases,allowed_claims,banned_words,colors,palette,logos";

function rowToBrand(r: any): Brand {
  const colors = (r.colors ?? {}) as Partial<BrandKit["colors"]>;
  return {
    id: r.id,
    name: r.name ?? "",
    wordmark: r.wordmark || r.name || "",
    tagline: r.tagline ?? "",
    about: r.about ?? "",
    audience: r.audience ?? "",
    voice: r.voice ?? "",
    toneDos: r.tone_dos ?? [],
    toneDonts: r.tone_donts ?? [],
    examplePhrases: r.example_phrases ?? [],
    allowedClaims: r.allowed_claims ?? [],
    bannedWords: r.banned_words ?? [],
    primary: colors.primary ?? "#1f6f5c",
    accent: colors.accent ?? "#e8a13a",
    palette: r.palette ?? [],
    logos: r.logos ?? [],
  };
}

function brandToRow(b: Brand) {
  return {
    name: b.name,
    wordmark: b.wordmark || b.name,
    tagline: b.tagline,
    about: b.about,
    audience: b.audience,
    voice: b.voice,
    tone_dos: b.toneDos,
    tone_donts: b.toneDonts,
    example_phrases: b.examplePhrases,
    allowed_claims: b.allowedClaims,
    banned_words: b.bannedWords,
    colors: makeColors(b.primary, b.accent),
    palette: b.palette,
    logos: b.logos,
    fonts: FONTS,
    logo_url: b.logos[0]?.url ?? null, // public renderer reads logo_url
    updated_at: new Date().toISOString(),
  };
}

export async function listBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from("brand_kits")
    .select(SELECT)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[brand] listBrands:", error.message);
    return [];
  }
  return (data ?? []).map(rowToBrand);
}

export async function saveBrand(b: Brand): Promise<Brand> {
  const row = brandToRow(b);
  if (b.id) {
    const { data, error } = await supabase
      .from("brand_kits")
      .update(row)
      .eq("id", b.id)
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return rowToBrand(data);
  }
  const { data, error } = await supabase
    .from("brand_kits")
    .insert(row)
    .select(SELECT)
    .single();
  if (error) throw new Error(error.message);
  return rowToBrand(data);
}

export async function deleteBrand(id: string): Promise<void> {
  const { error } = await supabase.from("brand_kits").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Upload a logo file to the public brand-assets bucket; returns its public URL. */
export async function uploadBrandLogo(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const path = `logos/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("brand-assets")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw new Error(error.message);
  return supabase.storage.from("brand-assets").getPublicUrl(path).data.publicUrl;
}
