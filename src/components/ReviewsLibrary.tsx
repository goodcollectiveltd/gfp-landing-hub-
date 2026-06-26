import { useEffect, useState } from "react";
import {
  type Review,
  listReviews,
  importReviews,
  deleteReview,
  scrapeReviews,
} from "@/lib/reviews";

// Reviews library for one brand: scrape from the site or paste a JSON export,
// each review keeping its linked photo(s). Used by the generator's Proof/UGC.
export default function ReviewsLibrary({ brandId }: { brandId: string | null }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  function reload() {
    if (!brandId) return;
    setLoading(true);
    listReviews(brandId)
      .then(setReviews)
      .finally(() => setLoading(false));
  }
  useEffect(reload, [brandId]);

  if (!brandId) {
    return (
      <section className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6">
        <h2 className="text-base font-semibold text-neutral-700">Reviews library</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Save this brand first, then scrape or import your customer reviews here.
        </p>
      </section>
    );
  }

  async function handleScrape() {
    if (!brandId || !scrapeUrl.trim()) return;
    setBusy("Scraping…");
    setError(null);
    setMessage(null);
    try {
      const scraped = await scrapeReviews(scrapeUrl.trim());
      const { added, skipped } = await importReviews(brandId, scraped);
      setMessage(`Scraped ${scraped.length} · added ${added}, skipped ${skipped} (already saved).`);
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function handleImport() {
    if (!brandId) return;
    setBusy("Importing…");
    setError(null);
    setMessage(null);
    try {
      const parsed = JSON.parse(importText);
      const arr = Array.isArray(parsed) ? parsed : parsed.reviews;
      if (!Array.isArray(arr)) throw new Error("Expected a JSON array of reviews.");
      const { added, skipped } = await importReviews(brandId, arr);
      setMessage(`Added ${added}, skipped ${skipped} (already saved).`);
      setImportText("");
      setShowImport(false);
      reload();
    } catch (e) {
      setError(e instanceof Error ? `Import failed: ${e.message}` : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteReview(id);
      setReviews((rs) => rs.filter((r) => r.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Reviews library</h2>
          <p className="text-sm text-neutral-500">
            {reviews.length} saved · real reviews + photos for Proof &amp; UGC blocks.
          </p>
        </div>
      </div>

      {/* Scrape from site */}
      <div className="flex flex-wrap items-end gap-2 rounded-xl bg-neutral-50 p-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-neutral-600">
            Scrape reviews from a page on your site
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            placeholder="https://goodforpets.co/  (or a product/reviews page)"
            value={scrapeUrl}
            onChange={(e) => setScrapeUrl(e.target.value)}
          />
        </div>
        <button
          onClick={handleScrape}
          disabled={!!busy}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:bg-neutral-300"
        >
          Scrape
        </button>
        <button
          onClick={() => setShowImport((s) => !s)}
          className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
        >
          Paste JSON
        </button>
      </div>

      {showImport && (
        <div className="space-y-2">
          <textarea
            className="h-40 w-full resize-y rounded-lg border border-neutral-300 px-3 py-2 font-mono text-xs"
            placeholder='[ { "name": "…", "rating": 5, "text": "…", "images": ["https://…"] } ]'
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          <button
            onClick={handleImport}
            disabled={!!busy || !importText.trim()}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:bg-neutral-300"
          >
            Import reviews
          </button>
        </div>
      )}

      {busy && <p className="text-sm text-neutral-500">{busy}</p>}
      {message && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">{message}</p>
      )}
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {loading && <p className="text-sm text-neutral-400">Loading…</p>}

      {/* Review list */}
      {reviews.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-3 rounded-xl border border-neutral-200 p-3">
              {r.images[0] ? (
                <img
                  src={r.images[0]}
                  alt={r.author}
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-[10px] text-neutral-400">
                  no photo
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {r.author || "Anonymous"}{" "}
                  <span className="text-amber-500">{"★".repeat(r.rating)}</span>
                </p>
                <p className="line-clamp-2 text-xs text-neutral-500">{r.body}</p>
                <button
                  onClick={() => r.id && handleDelete(r.id)}
                  className="mt-1 text-xs text-red-600 underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
