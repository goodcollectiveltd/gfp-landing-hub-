import { supabase } from "@/integrations/supabase/client";

// Context Hub: reference documents (product/customer/proof/etc.) the generator
// reads when it writes. Brand-scoped; managed in the Hub.

export const DOC_TAGS = [
  "product",
  "customer",
  "proof",
  "angles",
  "brand",
  "best-practice",
  "other",
] as const;

export interface KnowledgeDoc {
  id?: string;
  title: string;
  tag: string;
  content: string;
}

const SELECT = "id,title,tag,content";

export async function listDocs(brandId: string): Promise<KnowledgeDoc[]> {
  if (!brandId) return [];
  const { data, error } = await supabase
    .from("knowledge_docs")
    .select(SELECT)
    .eq("brand_id", brandId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[knowledge] listDocs:", error.message);
    return [];
  }
  return (data ?? []) as KnowledgeDoc[];
}

export async function saveDoc(brandId: string, doc: KnowledgeDoc): Promise<KnowledgeDoc> {
  if (doc.id) {
    const { data, error } = await supabase
      .from("knowledge_docs")
      .update({ title: doc.title, tag: doc.tag, content: doc.content, updated_at: new Date().toISOString() })
      .eq("id", doc.id)
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return data as KnowledgeDoc;
  }
  const { data, error } = await supabase
    .from("knowledge_docs")
    .insert({ brand_id: brandId, title: doc.title, tag: doc.tag, content: doc.content })
    .select(SELECT)
    .single();
  if (error) throw new Error(error.message);
  return data as KnowledgeDoc;
}

export async function deleteDoc(id: string): Promise<void> {
  const { error } = await supabase.from("knowledge_docs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
