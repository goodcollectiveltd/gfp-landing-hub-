import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageRenderer from "@/components/PageRenderer";
import { generatePage } from "@/lib/generate";
import { savePage, slugify } from "@/lib/pages";
import {
  listBrands,
  brandKitFromBrand,
  brandVoiceBrief,
  uploadScreenshot,
  type Brand,
} from "@/lib/brand";
import {
  listProducts,
  formatPrice,
  type StoreProduct,
  type ProductOption,
} from "@/lib/products";
import { listDocs } from "@/lib/knowledge";
import { listReviews } from "@/lib/reviews";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import type { BuyBoxConfig, LandingPage, Section } from "@/types/page";

// The generator. Brand details come from the master brand (set in the Hub), so
// this form only needs the competitor URL, your product page, and the buy box.

const FIELD =
  "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none";
const LABEL = "block text-sm font-medium text-neutral-700";

export default function GeneratePage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandId, setBrandId] = useState<string>("");
  const [brandLoading, setBrandLoading] = useState(true);

  const [competitorUrl, setCompetitorUrl] = useState("");
  const [productPageUrl, setProductPageUrl] = useState("");

  // Screenshot of the original advertorial → drives visual-feature replication.
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [shotUploading, setShotUploading] = useState(false);

  async function onPickScreenshot(file: File | undefined) {
    if (!file) return;
    setShotUploading(true);
    setError(null);
    try {
      const url = await uploadScreenshot(file);
      setScreenshotUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setShotUploading(false);
    }
  }

  // Live products from the selected brand's store.
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Buy box (per product / per page).
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [ctaLabel, setCtaLabel] = useState("Add to Cart");
  const [productUrl, setProductUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[] | null>(null);

  // Save / publish
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<
    { ok: true; slug: string; status: string } | { ok: false; text: string } | null
  >(null);

  useEffect(() => {
    listBrands()
      .then((bs) => {
        setBrands(bs);
        if (bs.length && bs[0].id) setBrandId(bs[0].id);
      })
      .finally(() => setBrandLoading(false));
  }, []);

  const brand = brands.find((b) => b.id === brandId) ?? null;
  const storeDomain = brand?.storeDomain ?? "";

  // Load the selected brand's live products whenever the store changes.
  useEffect(() => {
    if (!storeDomain) {
      setProducts([]);
      return;
    }
    setProductsLoading(true);
    setProductsError(null);
    listProducts(storeDomain)
      .then(setProducts)
      .catch((e) => setProductsError(e instanceof Error ? e.message : String(e)))
      .finally(() => setProductsLoading(false));
  }, [storeDomain]);

  const [selectedHandle, setSelectedHandle] = useState("");
  const selectedProduct = products.find((p) => p.handle === selectedHandle) ?? null;

  function applyOption(p: StoreProduct, opt: ProductOption) {
    setProductName(p.title);
    setPrice(formatPrice(opt.price));
    setCompareAtPrice(opt.compareAtPrice ? formatPrice(opt.compareAtPrice) : "");
    setProductUrl(opt.checkoutUrl);
    setProductPageUrl(p.url);
  }

  function onSelectProduct(handle: string) {
    setSelectedHandle(handle);
    const p = products.find((x) => x.handle === handle);
    if (!p) return;
    setProductName(p.title);
    setProductPageUrl(p.url);
    if (p.options.length === 1) applyOption(p, p.options[0]); // auto-fill if only one
  }

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
    if (!brand?.id) return;
    if (!competitorUrl.trim() && !screenshotUrl) {
      setError("Add a competitor URL or upload a screenshot of the original first.");
      return;
    }
    setLoading(true);
    try {
      // Pull the brand's knowledge to ground the copy + place real assets.
      const [docs, reviews] = await Promise.all([
        listDocs(brand.id),
        listReviews(brand.id),
      ]);
      const result = await generatePage({
        competitorUrl: competitorUrl.trim(),
        screenshotUrl: screenshotUrl || undefined,
        brand: {
          name: brand.name,
          voice: brandVoiceBrief(brand),
          allowedClaims: brand.allowedClaims,
          bannedWords: brand.bannedWords,
        },
        buyBox,
        docs: docs.map((d) => ({ title: d.title, tag: d.tag, content: d.content })),
        images: brand.images.map((i) => ({ url: i.url, tag: i.tag, caption: i.caption })),
        reviews: reviews.map((r) => ({
          author: r.author,
          rating: r.rating,
          body: r.body,
          images: r.images,
        })),
      });
      setSections(result.sections);
      setSaveMsg(null);
      if (!slug) setSlug(slugify(productName || brand.name));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(status: "draft" | "published") {
    if (!sections || !brand?.id) return;
    const finalSlug = slugify(slug || productName || brand.name);
    if (!finalSlug) {
      setSaveMsg({ ok: false, text: "Please enter a page address (slug)." });
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    try {
      await savePage({
        slug: finalSlug,
        title: productName || brand.name,
        status,
        brandKitId: brand.id,
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

  const previewPage: LandingPage | null =
    sections && brand
      ? {
          slug: "preview",
          status: "draft",
          title: `${brand.name} — generated preview`,
          brandKit: brandKitFromBrand(brand),
          buyBox,
          sections,
        }
      : null;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold">Generate an advertorial</h1>
            <p className="text-sm text-neutral-500">
              Competitor URL + your product → an on-brand page
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

          {/* Brand picker */}
          {!brandLoading && brands.length === 0 && (
            <p className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-800">
              No brands yet.{" "}
              <Link to="/hub" className="font-semibold underline">
                Create a brand in the Hub
              </Link>{" "}
              first.
            </p>
          )}
          {brands.length > 0 && (
            <div>
              <label className={LABEL}>Build in the style of</label>
              <div className="mt-1 flex items-center gap-2">
                <select
                  className={FIELD}
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <Link to="/hub" className="shrink-0 text-sm text-neutral-600 underline">
                  edit
                </Link>
              </div>
            </div>
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
            <label className={LABEL}>Screenshot of the original (recommended)</label>
            {screenshotUrl ? (
              <div className="mt-1 flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-2">
                <img
                  src={screenshotUrl}
                  alt="Original advertorial screenshot"
                  className="h-24 w-20 rounded object-cover object-top"
                />
                <div className="flex-1 text-xs text-neutral-500">
                  <p className="font-medium text-neutral-700">Screenshot added</p>
                  <p className="mt-0.5">We'll replicate its visual features in your brand style.</p>
                  <button
                    type="button"
                    onClick={() => setScreenshotUrl("")}
                    className="mt-2 text-neutral-500 underline hover:text-neutral-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                disabled={shotUploading}
                onChange={(e) => onPickScreenshot(e.target.files?.[0])}
                className="mt-1 block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-neutral-700"
              />
            )}
            <p className="mt-1 text-xs text-neutral-400">
              {shotUploading
                ? "Uploading…"
                : "Upload a full-page screenshot of the original advertorial — the engine reads its design and rebuilds those features in your brand look."}
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
              Buy box (Shopify)
            </legend>

            {storeDomain && (
              <div className="space-y-3">
                <div>
                  <label className={LABEL}>Select a product</label>
                  <select
                    className={FIELD}
                    value={selectedHandle}
                    onChange={(e) => onSelectProduct(e.target.value)}
                  >
                    <option value="" disabled>
                      {productsLoading
                        ? "Loading products…"
                        : products.length
                        ? "Choose a product…"
                        : "No products found"}
                    </option>
                    {products.map((p) => (
                      <option key={p.handle} value={p.handle}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedProduct && selectedProduct.options.length > 1 && (
                  <div>
                    <label className={LABEL}>Buy option</label>
                    <select
                      className={FIELD}
                      defaultValue=""
                      onChange={(e) => {
                        const opt = selectedProduct.options[Number(e.target.value)];
                        if (opt) applyOption(selectedProduct, opt);
                      }}
                    >
                      <option value="" disabled>
                        Choose an option…
                      </option>
                      {selectedProduct.options.map((opt, i) => (
                        <option key={i} value={i}>
                          {opt.label}
                          {opt.price ? ` — ${formatPrice(opt.price)}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {productsError && (
                  <p className="text-xs text-red-600">
                    Couldn't load products: {productsError}
                  </p>
                )}
                <p className="text-xs text-neutral-400">
                  Live from {storeDomain} — fills the fields below (and the product
                  page URL for scraping). You can still edit them.
                </p>
              </div>
            )}

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
            disabled={loading || !isSupabaseConfigured || !brand}
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
              Live preview using the real page components.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
