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
export interface BrandImage {
  url: string;
  tag: string; // one of IMAGE_TAGS
  label: string;
}

/** Image categories the generator matches placeholders against. */
export const IMAGE_TAGS = [
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
] as const;

export interface Brand {
  id?: string;
  name: string;
  wordmark: string;
  storeDomain: string;
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
  images: BrandImage[];
  headingFont: string;
  bodyFont: string;
  visualStyle: string;
}

// Fonts that don't need loading from Google (system / web-safe).
const SYSTEM_FONTS = new Set([
  "",
  "system-ui",
  "Georgia",
  "Times New Roman",
  "Arial",
  "Helvetica",
]);
const HEADING_FALLBACK = "Georgia, 'Times New Roman', serif";
const BODY_FALLBACK = "system-ui, -apple-system, 'Segoe UI', sans-serif";

/** Build the CSS font stacks for the renderer from the brand's font names. */
export function makeFonts(headingFont: string, bodyFont: string) {
  const stack = (family: string, fallback: string) =>
    family && !SYSTEM_FONTS.has(family) ? `'${family}', ${fallback}` : family ? `'${family}', ${fallback}` : fallback;
  return {
    heading: stack(headingFont, HEADING_FALLBACK),
    body: stack(bodyFont, BODY_FALLBACK),
  };
}

/** Which font families must be loaded from Google Fonts (non-system ones). */
export function googleFontFamilies(headingFont: string, bodyFont: string): string[] {
  const out: string[] = [];
  for (const f of [headingFont, bodyFont]) if (f && !SYSTEM_FONTS.has(f)) out.push(f);
  return [...new Set(out)];
}

export function emptyBrand(): Brand {
  return {
    name: "",
    wordmark: "",
    storeDomain: "",
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
    images: [],
    headingFont: "Georgia",
    bodyFont: "",
    visualStyle: "",
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
    fonts: makeFonts(b.headingFont, b.bodyFont),
    fontFamilies: googleFontFamilies(b.headingFont, b.bodyFont),
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
  "id,name,wordmark,store_domain,tagline,about,audience,voice,tone_dos,tone_donts,example_phrases,allowed_claims,banned_words,colors,palette,logos,images,heading_font,body_font,visual_style";

function rowToBrand(r: any): Brand {
  const colors = (r.colors ?? {}) as Partial<BrandKit["colors"]>;
  return {
    id: r.id,
    name: r.name ?? "",
    wordmark: r.wordmark || r.name || "",
    storeDomain: r.store_domain ?? "",
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
    images: r.images ?? [],
    headingFont: r.heading_font ?? "",
    bodyFont: r.body_font ?? "",
    visualStyle: r.visual_style ?? "",
  };
}

function brandToRow(b: Brand) {
  return {
    name: b.name,
    wordmark: b.wordmark || b.name,
    store_domain: b.storeDomain,
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
    images: b.images,
    fonts: makeFonts(b.headingFont, b.bodyFont),
    heading_font: b.headingFont,
    body_font: b.bodyFont,
    visual_style: b.visualStyle,
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

/**
 * Persist just the asset arrays (images/logos) for a brand immediately — used
 * right after an upload/remove so uploaded files are never lost if the page
 * reloads before a full "Save brand". No-op for unsaved (id-less) brands.
 */
export async function updateBrandAssets(
  id: string,
  fields: { images?: BrandImage[]; logos?: BrandLogo[] }
): Promise<void> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (fields.images) row.images = fields.images;
  if (fields.logos) {
    row.logos = fields.logos;
    row.logo_url = fields.logos[0]?.url ?? null;
  }
  const { error } = await supabase.from("brand_kits").update(row).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteBrand(id: string): Promise<void> {
  const { error } = await supabase.from("brand_kits").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Upload a file to a folder in the public brand-assets bucket; returns its URL. */
async function uploadBrandAsset(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("brand-assets")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw new Error(error.message);
  return supabase.storage.from("brand-assets").getPublicUrl(path).data.publicUrl;
}

export const uploadBrandLogo = (file: File) => uploadBrandAsset(file, "logos");
export const uploadBrandImage = (file: File) => uploadBrandAsset(file, "images");
