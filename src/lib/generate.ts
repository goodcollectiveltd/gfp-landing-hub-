import { supabase } from "@/integrations/supabase/client";
import type { BuyBoxConfig, Section } from "@/types/page";

// Calls the generate-page edge function (structural mirror): competitor URL +
// brand knowledge (docs, images, reviews) -> on-brand section blocks.

export interface GenerateInput {
  competitorUrl: string;
  brand: {
    name: string;
    voice: string;
    allowedClaims: string[];
    bannedWords: string[];
  };
  buyBox: BuyBoxConfig;
  docs: { title: string; tag: string; content: string }[];
  images: { url: string; tag: string; caption: string }[];
  reviews: { author: string; rating: number; body: string; images: string[] }[];
}

export interface GenerateResult {
  plan: unknown;
  sections: Section[];
}

export async function generatePage(input: GenerateInput): Promise<GenerateResult> {
  const { data, error } = await supabase.functions.invoke("generate-page", {
    body: input,
  });

  if (error) {
    let detail = error.message;
    try {
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === "function") {
        const body = await ctx.json();
        if (body?.error) detail = body.error;
      }
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return data as GenerateResult;
}
