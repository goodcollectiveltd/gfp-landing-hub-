import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  type Brand,
  type BrandLogo,
  type BrandSwatch,
  emptyBrand,
  listBrands,
  saveBrand,
  deleteBrand,
  uploadBrandLogo,
} from "@/lib/brand";

const FIELD =
  "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none";
const LABEL = "block text-sm font-medium text-neutral-700";

// Split a textarea (one item per line) into a trimmed array, and back.
const toLines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
const toCommas = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

export default function HubPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | "new">("new");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Form fields
  const [name, setName] = useState("");
  const [wordmark, setWordmark] = useState("");
  const [tagline, setTagline] = useState("");
  const [about, setAbout] = useState("");
  const [audience, setAudience] = useState("");
  const [voice, setVoice] = useState("");
  const [toneDos, setToneDos] = useState("");
  const [toneDonts, setToneDonts] = useState("");
  const [examplePhrases, setExamplePhrases] = useState("");
  const [allowedClaims, setAllowedClaims] = useState("");
  const [bannedWords, setBannedWords] = useState("");
  const [primary, setPrimary] = useState("#1f6f5c");
  const [accent, setAccent] = useState("#e8a13a");
  const [palette, setPalette] = useState<BrandSwatch[]>([]);
  const [logos, setLogos] = useState<BrandLogo[]>([]);

  function loadIntoForm(b: Brand) {
    setName(b.name);
    setWordmark(b.wordmark);
    setTagline(b.tagline);
    setAbout(b.about);
    setAudience(b.audience);
    setVoice(b.voice);
    setToneDos(b.toneDos.join("\n"));
    setToneDonts(b.toneDonts.join("\n"));
    setExamplePhrases(b.examplePhrases.join("\n"));
    setAllowedClaims(b.allowedClaims.join("\n"));
    setBannedWords(b.bannedWords.join(", "));
    setPrimary(b.primary);
    setAccent(b.accent);
    setPalette(b.palette);
    setLogos(b.logos);
  }

  function selectBrand(id: string | "new") {
    setSelectedId(id);
    setStatus(null);
    setError(null);
    if (id === "new") loadIntoForm(emptyBrand());
    else {
      const b = brands.find((x) => x.id === id);
      if (b) loadIntoForm(b);
    }
  }

  useEffect(() => {
    listBrands()
      .then((bs) => {
        setBrands(bs);
        if (bs.length && bs[0].id) {
          setSelectedId(bs[0].id);
          loadIntoForm(bs[0]);
        } else {
          loadIntoForm(emptyBrand());
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function currentBrand(): Brand {
    return {
      id: selectedId === "new" ? undefined : selectedId,
      name: name.trim(),
      wordmark: wordmark.trim(),
      tagline: tagline.trim(),
      about: about.trim(),
      audience: audience.trim(),
      voice: voice.trim(),
      toneDos: toLines(toneDos),
      toneDonts: toLines(toneDonts),
      examplePhrases: toLines(examplePhrases),
      allowedClaims: toLines(allowedClaims),
      bannedWords: toCommas(bannedWords),
      primary,
      accent,
      palette,
      logos,
    };
  }

  async function handleSave() {
    setError(null);
    setStatus(null);
    if (!name.trim()) {
      setError("Brand name is required.");
      return;
    }
    setSaving(true);
    try {
      const saved = await saveBrand(currentBrand());
      const bs = await listBrands();
      setBrands(bs);
      if (saved.id) setSelectedId(saved.id);
      setStatus("Saved ✓");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (selectedId === "new") return;
    if (!confirm("Delete this brand? This can't be undone.")) return;
    setError(null);
    try {
      await deleteBrand(selectedId);
      const bs = await listBrands();
      setBrands(bs);
      if (bs.length && bs[0].id) selectBrand(bs[0].id);
      else selectBrand("new");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const url = await uploadBrandLogo(file);
      setLogos((ls) => [...ls, { label: file.name.replace(/\.[^.]+$/, ""), url }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold">Brand &amp; Knowledge Hub</h1>
            <p className="text-sm text-neutral-500">
              Your brands — set up once, pick one per page
            </p>
          </div>
          <Link to="/" className="text-sm text-neutral-600 underline">
            ← Back to console
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        {loading ? (
          <p className="text-sm text-neutral-400">Loading your brands…</p>
        ) : (
          <>
            {/* Brand picker */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4">
              <label className="text-sm font-medium text-neutral-700">Brand:</label>
              <select
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                value={selectedId}
                onChange={(e) => selectBrand(e.target.value as string)}
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
                <option value="new">＋ New brand…</option>
              </select>
              {selectedId !== "new" && (
                <button
                  onClick={handleDelete}
                  className="ml-auto text-sm text-red-600 underline hover:text-red-800"
                >
                  Delete
                </button>
              )}
            </div>

            <section className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6">
              {/* Identity */}
              <div className="space-y-4">
                <h2 className="text-base font-semibold">Identity</h2>
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
                  <label className={LABEL}>Tagline</label>
                  <input className={FIELD} value={tagline} onChange={(e) => setTagline(e.target.value)} />
                </div>
                <div>
                  <label className={LABEL}>About / positioning</label>
                  <textarea
                    className={`${FIELD} h-20 resize-y`}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL}>Target audience</label>
                  <textarea
                    className={`${FIELD} h-16 resize-y`}
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  />
                </div>
              </div>

              {/* Logos */}
              <div className="space-y-3 border-t border-neutral-100 pt-5">
                <h2 className="text-base font-semibold">Logos</h2>
                <div className="flex flex-wrap gap-3">
                  {logos.map((logo, i) => (
                    <div key={i} className="w-36 rounded-lg border border-neutral-200 p-2">
                      <div className="flex h-16 items-center justify-center rounded bg-neutral-50">
                        <img src={logo.url} alt={logo.label} className="max-h-14 max-w-full" />
                      </div>
                      <input
                        className="mt-2 w-full rounded border border-neutral-200 px-2 py-1 text-xs"
                        value={logo.label}
                        onChange={(e) =>
                          setLogos((ls) =>
                            ls.map((l, j) => (j === i ? { ...l, label: e.target.value } : l))
                          )
                        }
                      />
                      <button
                        onClick={() => setLogos((ls) => ls.filter((_, j) => j !== i))}
                        className="mt-1 text-xs text-red-600 underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <label className="flex h-[104px] w-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 text-sm text-neutral-500 hover:border-neutral-400">
                    {uploading ? "Uploading…" : "＋ Upload logo"}
                    <input
                      ref={fileInput}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
                <p className="text-xs text-neutral-400">
                  The first logo shows in the page header. Add as many variants as you like.
                </p>
              </div>

              {/* Colors */}
              <div className="space-y-3 border-t border-neutral-100 pt-5">
                <h2 className="text-base font-semibold">Colors</h2>
                <div className="flex gap-6">
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
                <div className="space-y-2">
                  <p className="text-xs font-medium text-neutral-500">
                    Additional palette colors
                  </p>
                  {palette.map((sw, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="color"
                        className="h-8 w-10 rounded border border-neutral-300"
                        value={sw.hex}
                        onChange={(e) =>
                          setPalette((p) =>
                            p.map((s, j) => (j === i ? { ...s, hex: e.target.value } : s))
                          )
                        }
                      />
                      <input
                        className="flex-1 rounded border border-neutral-200 px-2 py-1 text-sm"
                        placeholder="label (e.g. Soft cream)"
                        value={sw.label}
                        onChange={(e) =>
                          setPalette((p) =>
                            p.map((s, j) => (j === i ? { ...s, label: e.target.value } : s))
                          )
                        }
                      />
                      <button
                        onClick={() => setPalette((p) => p.filter((_, j) => j !== i))}
                        className="text-xs text-red-600 underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setPalette((p) => [...p, { label: "", hex: "#000000" }])}
                    className="text-sm text-neutral-700 underline"
                  >
                    ＋ Add color
                  </button>
                </div>
              </div>

              {/* Voice & tone */}
              <div className="space-y-4 border-t border-neutral-100 pt-5">
                <h2 className="text-base font-semibold">Voice &amp; tone</h2>
                <div>
                  <label className={LABEL}>Voice / tone (overall)</label>
                  <input className={FIELD} value={voice} onChange={(e) => setVoice(e.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={LABEL}>Tone do's (one per line)</label>
                    <textarea
                      className={`${FIELD} h-24 resize-y`}
                      value={toneDos}
                      onChange={(e) => setToneDos(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Tone don'ts (one per line)</label>
                    <textarea
                      className={`${FIELD} h-24 resize-y`}
                      value={toneDonts}
                      onChange={(e) => setToneDonts(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Example on-brand phrases (one per line)</label>
                  <textarea
                    className={`${FIELD} h-20 resize-y`}
                    value={examplePhrases}
                    onChange={(e) => setExamplePhrases(e.target.value)}
                  />
                </div>
                <div>
                  <label className={LABEL}>Allowed claims (one per line)</label>
                  <textarea
                    className={`${FIELD} h-24 resize-y`}
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
              </div>

              <div className="flex items-center gap-3 border-t border-neutral-100 pt-5">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:bg-neutral-300"
                >
                  {saving ? "Saving…" : selectedId === "new" ? "Create brand" : "Save brand"}
                </button>
                {status && <span className="text-sm text-green-700">{status}</span>}
                {error && <span className="text-sm text-red-700">{error}</span>}
              </div>
            </section>

            <section className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6">
              <h2 className="text-base font-semibold text-neutral-700">Knowledge documents</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Coming next — upload brand-guideline docs, best-practice guides, video
                transcripts and core angles. The generator will read these when it writes.
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
