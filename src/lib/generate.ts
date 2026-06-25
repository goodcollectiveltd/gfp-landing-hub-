import { supabase } from "@/integrations/supabase/client";
import type { BrandKit, BuyBoxConfig, Section } from "@/types/page";

// Calls the generate-page edge function: competitor URL + brand kit -> sections.

export interface GenerateInput {
  competitorUrl: string;
  /** The owner's own product page — scraped for real facts + images. Optional. */
  productUrl?: string;
  brandKit: {
    name: string;
    voice: string;
    allowedClaims: string[];
    bannedWords: string[];
  };
  buyBox: BuyBoxConfig;
}

export interface GenerateResult {
  analysis: unknown;
  productFacts: unknown;
  sections: Section[];
}

export async function generatePage(
  input: GenerateInput
): Promise<GenerateResult> {
  const { data, error } = await supabase.functions.invoke("generate-page", {
    body: input,
  });

  if (error) {
    // Supabase wraps non-2xx responses; surface the function's message if present.
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

/** Assemble a full BrandKit (with colors/fonts) from the lighter form inputs. */
export function brandKitFromForm(form: {
  name: string;
  wordmark: string;
  primary: string;
  accent: string;
}): BrandKit {
  return {
    name: form.name,
    wordmark: form.wordmark || form.name,
    colors: {
      primary: form.primary,
      onPrimary: "#ffffff",
      accent: form.accent,
      background: "#fbfaf7",
      text: "#1c2b27",
      muted: "#5d6b66",
    },
    fonts: {
      heading: "'Georgia', 'Times New Roman', serif",
      body: "system-ui, -apple-system, 'Segoe UI', sans-serif",
    },
  };
}
