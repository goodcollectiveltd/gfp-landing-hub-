import { useState } from "react";
import { Link } from "react-router-dom";
import PageRenderer from "@/components/PageRenderer";
import { generatePage, brandKitFromForm } from "@/lib/generate";
import { savePage, slugify } from "@/lib/pages";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import type { BuyBoxConfig, LandingPage, Section } from "@/types/page";

// The generator: paste a competitor URL + your brand details -> the edge function
// returns section JSON -> we preview it with the real renderer. Saving/publishing
// to the DB comes next; for now this proves the full generate-and-preview loop.

const FIELD =
  "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none";
const LABEL = "block text-sm font-medium text-neutral-700";

export default function GeneratePage() {
  // Pre-filled with the sample so the owner can click Generate immediately.
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [productPageUrl, setProductPageUrl] = useState("");
  const [name, setName] = useState("RestWell");
  const [voice, setVoice] = useState("Calm, warm, reassuring, evidence-led. No hype.");
  const [allowedClaims, setAllowedClaims] = useState(
    "high-absorption magnesium glycinate\nno melatonin\ngentle on the stomach"
  );
  const [bannedWords, setBannedWords] = useState("cure, miracle, guaranteed");
  const [primary, setPrimary] = useState("#1f6f5c");
  const [accent, setAccent] = useState("#e8a13a");
  const [productName, setProductName] = useState("RestWell Magnesium Glycinate");
  const [price, setPrice] = useState("$39");
  const [compareAtPrice, setCompareAtPrice] = useState("$59");
  const [ctaLabel, setCtaLabel] = useState("Add to Cart");
  const [productUrl, setProductUrl] = useState(
    "https://example-store.myshopify.com/cart/123456789:1"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[] | null>(null);

  // Save / publish
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<
    { ok: true; slug: string; status: string } | { ok: false; text: string } | null
  >(null);

  const buyBox: BuyBoxConfig = {
    productName,
    price,
    compareAtPrice: compareAtPrice || undefined,
    ctaLabel,
    productUrl,
  };

  async function handleGenerate() {
    setError(null);
    setSections(null);
    if (!competitorUrl.trim()) {
      setError("Please paste a competitor landing-page URL first.");
      return;
    }
    setLoading(true);
    try {
      const result = await generatePage({
        competitorUrl: competitorUrl.trim(),
        productUrl: productPageUrl.trim() || undefined,
        brandKit: {
          name,
          voice,
          allowedClaims: allowedClaims
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          bannedWords: bannedWords
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        },
        buyBox,
      });
      setSections(result.sections);
      setSaveMsg(null);
      if (!slug) setSlug(slugify(productName || name));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(status: "draft" | "published") {
    if (!sections) return;
    const finalSlug = slugify(slug || productName || name);
    if (!finalSlug) {
      setSaveMsg({ ok: false, text: "Please enter a page address (slug)." });
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    try {
      await savePage({
        slug: finalSlug,
        title: productName || name,
        status,
        brandKit: brandKitFromForm({ name, wordmark: name, primary, accent }),
        buyBox,
        sections,
        competitorUrl: competitorUrl.trim() || undefined,
      });
      setSaveMsg({ ok: true, slug: finalSlug, status });
    } catch (e) {
      setSaveMsg({ ok: false, text: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(false);
    }
  }

  const previewPage: LandingPage | null = sections && {
    slug: "preview",
    status: "draft",
    title: `${name} — generated preview`,
    brandKit: brandKitFromForm({ name, wordmark: name, primary, accent }),
    buyBox,
    sections,
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold">Generate an advertorial</h1>
            <p className="text-sm text-neutral-500">
              Competitor URL + your brand → an on-brand page
            </p>
          </div>
          <Link to="/" className="text-sm text-neutral-600 underline">
            ← Back to console
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[380px_1fr]">
        {/* ---------------- Form ---------------- */}
        <div className="space-y-5">
          {!isSupabaseConfigured && (
            <p className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800">
              Supabase isn't configured, so generation is disabled.
            </p>
          )}

          <div>
            <label className={LABEL}>Competitor landing-page URL</label>
            <input
              className={FIELD}
              placeholder="https://competitor.com/their-advertorial"
              value={competitorUrl}
              onChange={(e) => setCompetitorUrl(e.target.value)}
            />
            <p className="mt-1 text-xs text-neutral-400">
              We analyze its structure & persuasion flow — never copy its words.
            </p>
          </div>

          <div>
            <label className={LABEL}>Your product page URL</label>
            <input
              className={FIELD}
              placeholder="https://yourstore.com/products/your-product"
              value={productPageUrl}
              onChange={(e) => setProductPageUrl(e.target.value)}
            />
            <p className="mt-1 text-xs text-neutral-400">
              Optional but recommended — we pull real facts & product photos from it.
            </p>
          </div>

          <fieldset className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Brand kit
            </legend>
            <div>
              <label className={LABEL}>Brand name</label>
              <input className={FIELD} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className={LABEL}>Voice / tone</label>
              <input className={FIELD} value={voice} onChange={(e) => setVoice(e.target.value)} />
            </div>
            <div>
              <label className={LABEL}>Allowed claims (one per line)</label>
              <textarea
                className={`${FIELD} h-20 resize-y`}
                value={allowedClaims}
                onChange={(e) => setAllowedClaims(e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL}>Banned words (comma-separated)</label>
              <input
                className={FIELD}
                value={bannedWords}
                onChange={(e) => setBannedWords(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                Primary
                <input
                  type="color"
                  className="h-8 w-10 rounded border border-neutral-300"
                  value={primary}
                  onChange={(e) => setPrimary(e.target.value)}
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                Accent
                <input
                  type="color"
                  className="h-8 w-10 rounded border border-neutral-300"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="space-y-4 rounded-xl border border-neutral-200 bg-white p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Buy box (Shopify)
            </legend>
            <div>
              <label className={LABEL}>Product name</label>
              <input
                className={FIELD}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className={LABEL}>Price</label>
                <input className={FIELD} value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className={LABEL}>Compare-at</label>
                <input
                  className={FIELD}
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={LABEL}>CTA label</label>
              <input
                className={FIELD}
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL}>Shopify product / cart URL</label>
              <input
                className={FIELD}
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
              />
            </div>
          </fieldset>

          <button
            onClick={handleGenerate}
            disabled={loading || !isSupabaseConfigured}
            className="w-full rounded-lg bg-neutral-900 px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {loading ? "Generating… (~20–40s)" : "Generate page"}
          </button>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
        </div>

        {/* ---------------- Preview ---------------- */}
        <div className="min-w-0">
          {previewPage && (
            <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="flex-1">
                  <label className={LABEL}>Page address (slug)</label>
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <span className="text-neutral-400">/p/</span>
                    <input
                      className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 focus:border-neutral-900 focus:outline-none"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="your-page"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleSave("draft")}
                  disabled={saving}
                  className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
                >
                  Save draft
                </button>
                <button
                  onClick={() => handleSave("published")}
                  disabled={saving}
                  className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Publish"}
                </button>
              </div>
              {saveMsg?.ok && (
                <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
                  {saveMsg.status === "published" ? "Published! Live at " : "Saved as draft: "}
                  <Link to={`/p/${saveMsg.slug}`} className="font-semibold underline">
                    /p/{saveMsg.slug}
                  </Link>
                </p>
              )}
              {saveMsg && !saveMsg.ok && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {saveMsg.text}
                </p>
              )}
            </div>
          )}
          <div className="overflow-hidden rounded-xl border border-neutral-300 bg-white">
            {loading && (
              <div className="flex h-96 items-center justify-center text-neutral-400">
                Reading the competitor page and writing your advertorial…
              </div>
            )}
            {!loading && !previewPage && (
              <div className="flex h-96 flex-col items-center justify-center gap-2 px-6 text-center text-neutral-400">
                <p className="text-sm">Your generated page will preview here.</p>
                <p className="text-xs">Fill in the form and click Generate.</p>
              </div>
            )}
            {!loading && previewPage && (
              <div className="max-h-[80vh] overflow-y-auto">
                <PageRenderer page={previewPage} embedded />
              </div>
            )}
          </div>
          {previewPage && (
            <p className="mt-2 text-xs text-neutral-400">
              Live preview using the real page components. Saving & publishing come next.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
