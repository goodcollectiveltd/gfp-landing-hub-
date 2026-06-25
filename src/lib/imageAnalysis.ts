import { supabase } from "@/integrations/supabase/client";

// Calls the analyze-image edge function (Claude vision) for one image URL.
export interface ImageAnalysis {
  caption: string;
  tag: string;
}

export async function analyzeImage(imageUrl: string): Promise<ImageAnalysis> {
  const { data, error } = await supabase.functions.invoke("analyze-image", {
    body: { imageUrl },
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
  return { caption: data?.caption ?? "", tag: data?.tag ?? "" };
}
