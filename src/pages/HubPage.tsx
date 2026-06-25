import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMasterBrand, saveMasterBrand } from "@/lib/brand";

// The Hub: where the ONE master brand lives (set once, used by every page).
// The knowledge-document library will land here next.

const FIELD =
  "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none";
const LABEL = "block text-sm font-medium text-neutral-700";

export default function HubPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [wordmark, setWordmark] = useState("");
  const [voice, setVoice] = useState("");
  const [allowedClaims, setAllowedClaims] = useState("");
  const [bannedWords, setBannedWords] = useState("");
  const [primary, setPrimary] = useState("#1f6f5c");
  const [accent, setAccent] = useState("#e8a13a");

  useEffect(() => {
    getMasterBrand()
      .then((b) => {
        if (!b) return;
        setName(b.name);
        setWordmark(b.wordmark);
        setVoice(b.voice);
        setAllowedClaims(b.allowedClaims.join("\n"));
        setBannedWords(b.bannedWords.join(", "));
        setPrimary(b.primary);
        setAccent(b.accent);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setError(null);
    setSaved(false);
    if (!name.trim()) {
      setError("Brand name is required.");
      return;
    }
    setSaving(true);
    try {
      await saveMasterBrand({
        name: name.trim(),
        wordmark: wordmark.trim(),
        voice: voice.trim(),
        allowedClaims: allowedClaims
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        bannedWords: bannedWords
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        primary,
        accent,
      });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold">Brand &amp; Knowledge Hub</h1>
            <p className="text-sm text-neutral-500">
              Your master brand — set once, used on every page
            </p>
          </div>
          <Link to="/" className="text-sm text-neutral-600 underline">
            ← Back to console
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-6 py-8">
        {loading ? (
          <p className="text-sm text-neutral-400">Loading your brand…</p>
        ) : (
          <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-base font-semibold">Master brand</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL}>Brand name</label>
                <input className={FIELD} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className={LABEL}>Wordmark (header text)</label>
                <input
                  className={FIELD}
                  placeholder="defaults to brand name"
                  value={wordmark}
                  onChange={(e) => setWordmark(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={LABEL}>Voice / tone</label>
              <input className={FIELD} value={voice} onChange={(e) => setVoice(e.target.value)} />
            </div>

            <div>
              <label className={LABEL}>Allowed claims (one per line)</label>
              <textarea
                className={`${FIELD} h-24 resize-y`}
                placeholder="Only claims the AI is allowed to make"
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

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                Primary color
                <input
                  type="color"
                  className="h-8 w-10 rounded border border-neutral-300"
                  value={primary}
                  onChange={(e) => setPrimary(e.target.value)}
                />
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-700">
                Accent color
                <input
                  type="color"
                  className="h-8 w-10 rounded border border-neutral-300"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                />
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:bg-neutral-300"
              >
                {saving ? "Saving…" : "Save brand"}
              </button>
              {saved && <span className="text-sm text-green-700">Saved ✓</span>}
              {error && <span className="text-sm text-red-700">{error}</span>}
            </div>
          </section>
        )}

        {/* Coming next: the knowledge-document library. */}
        <section className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6">
          <h2 className="text-base font-semibold text-neutral-700">Knowledge documents</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Coming next — upload best-practice guides, video transcripts, product
            summaries and core angles. The generator will read these every time it
            writes, for sharper copy.
          </p>
        </section>
      </main>
    </div>
  );
}
