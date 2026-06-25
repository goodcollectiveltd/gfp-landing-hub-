import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  type Brand,
  type BrandLogo,
  type BrandSwatch,
  type BrandImage,
  IMAGE_TAGS,
  emptyBrand,
  listBrands,
  saveBrand,
  deleteBrand,
  updateBrandAssets,
  uploadBrandLogo,
  uploadBrandImage,
} from "@/lib/brand";
import { analyzeImage } from "@/lib/imageAnalysis";

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
  const [storeDomain, setStoreDomain] = useState("");
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
  const [images, setImages] = useState<BrandImage[]>([]);
  const [imageTag, setImageTag] = useState<string>("product");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const imgInput = useRef<HTMLInputElement>(null);
  const [headingFont, setHeadingFont] = useState("Georgia");
  const [bodyFont, setBodyFont] = useState("");
  const [visualStyle, setVisualStyle] = useState("");

  function loadIntoForm(b: Brand) {
    setName(b.name);
    setWordmark(b.wordmark);
    setStoreDomain(b.storeDomain);
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
    setImages(b.images);
    setHeadingFont(b.headingFont);
    setBodyFont(b.bodyFont);
    setVisualStyle(b.visualStyle);
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
      storeDomain: storeDomain.trim(),
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
      images,
      headingFont: headingFont.trim(),
      bodyFont: bodyFont.trim(),
      visualStyle: visualStyle.trim(),
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

  // Persist asset arrays immediately (durable on upload/remove/tag), so a page
  // reload can never lose uploaded files. No-op for an unsaved (new) brand.
  async function persistAssets(fields: { images?: BrandImage[]; logos?: BrandLogo[] }) {
    if (selectedId === "new") return;
    try {
      await updateBrandAssets(selectedId, fields);
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
      const next = [...logos, { label: file.name.replace(/\.[^.]+$/, ""), url }];
      setLogos(next);
      await persistAssets({ logos: next });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploadingImage(true);
    setError(null);
    try {
      const added: BrandImage[] = [];
      for (const file of files) {
        const url = await uploadBrandImage(file);
        added.push({ url, tag: imageTag, label: file.name.replace(/\.[^.]+$/, ""), caption: "" });
      }
      const next = [...images, ...added];
      setImages(next);
      await persistAssets({ images: next });
      // Auto-caption the new images with vision (durable per image).
      void runAnalysis(next, added.map((a) => a.url));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploadingImage(false);
      if (imgInput.current) imgInput.current.value = "";
    }
  }

  // Vision-caption a set of images (by url), persisting after each so progress
  // is never lost. Only fills the tag when it's still the default "other".
  async function runAnalysis(base: BrandImage[], urls: string[]) {
    // Hard guard: never touch an image that already has a caption, regardless
    // of caller — only analyze ones still missing one.
    const todo = urls.filter((url) => {
      const img = base.find((x) => x.url === url);
      return img && !img.caption;
    });
    if (!todo.length) return;
    let working = [...base];
    let done = 0;
    for (const url of todo) {
      setAnalyzing(`Analyzing ${++done}/${todo.length}…`);
      try {
        const a = await analyzeImage(url);
        working = working.map((x) =>
          x.url === url
            ? {
                ...x,
                caption: a.caption || x.caption,
                tag: x.tag === "other" && a.tag ? a.tag : x.tag,
              }
            : x
        );
        setImages(working);
        await persistAssets({ images: working });
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    }
    setAnalyzing(null);
  }

  function handleAnalyzeAll() {
    void runAnalysis(images, images.filter((x) => !x.caption).map((x) => x.url));
  }

  function removeImage(i: number) {
    const next = images.filter((_, j) => j !== i);
    setImages(next);
    void persistAssets({ images: next });
  }

  function changeImageTag(i: number, tag: string) {
    const next = images.map((x, j) => (j === i ? { ...x, tag } : x));
    setImages(next);
    void persistAssets({ images: next });
  }

  function changeImageCaption(i: number, caption: string) {
    setImages((xs) => xs.map((x, j) => (j === i ? { ...x, caption } : x)));
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
                  <label className={LABEL}>Store domain (for the live product list)</label>
                  <input
                    className={FIELD}
                    placeholder="e.g. goodforpets.co"
                    value={storeDomain}
                    onChange={(e) => setStoreDomain(e.target.value)}
                  />
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

              {/* Image library */}
              <div className="space-y-3 border-t border-neutral-100 pt-5">
                <h2 className="text-base font-semibold">Image library</h2>
                <p className="text-xs text-neutral-400">
                  Upload and tag your reusable images (vet, product, dog, before/after…).
                  The generator pulls from these to fill page image placeholders.
                </p>

                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className={LABEL}>Tag for new uploads</label>
                    <select
                      className="mt-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm capitalize"
                      value={imageTag}
                      onChange={(e) => setImageTag(e.target.value)}
                    >
                      {IMAGE_TAGS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <label className="cursor-pointer rounded-lg border border-dashed border-neutral-300 px-4 py-2 text-sm text-neutral-600 hover:border-neutral-400">
                    {uploadingImage ? "Uploading…" : "＋ Upload images"}
                    <input
                      ref={imgInput}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                  {images.some((x) => !x.caption) && (
                    <button
                      onClick={handleAnalyzeAll}
                      disabled={!!analyzing}
                      className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:bg-neutral-300"
                    >
                      ✨ Auto-caption all
                    </button>
                  )}
                  {analyzing && (
                    <span className="text-sm text-neutral-500">{analyzing}</span>
                  )}
                </div>
                <p className="text-xs text-neutral-400">
                  New uploads are auto-captioned by AI. The caption describes what's in
                  each image so the generator can place it accurately.
                </p>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((img, i) => (
                      <div key={i} className="rounded-lg border border-neutral-200 p-2">
                        <div className="flex h-24 items-center justify-center overflow-hidden rounded bg-neutral-50">
                          <img src={img.url} alt={img.label} className="max-h-24 max-w-full object-contain" />
                        </div>
                        <select
                          className="mt-2 w-full rounded border border-neutral-200 px-2 py-1 text-xs capitalize"
                          value={img.tag}
                          onChange={(e) => changeImageTag(i, e.target.value)}
                        >
                          {IMAGE_TAGS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                        <input
                          className="mt-1 w-full rounded border border-neutral-200 px-2 py-1 text-xs"
                          placeholder="label"
                          value={img.label}
                          onChange={(e) =>
                            setImages((xs) =>
                              xs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x))
                            )
                          }
                          onBlur={() => void persistAssets({ images })}
                        />
                        <textarea
                          className="mt-1 h-16 w-full resize-y rounded border border-neutral-200 px-2 py-1 text-[11px] leading-snug"
                          placeholder={analyzing ? "…" : "AI caption (what's in the image)"}
                          value={img.caption}
                          onChange={(e) => changeImageCaption(i, e.target.value)}
                          onBlur={() => void persistAssets({ images })}
                        />
                        <button
                          onClick={() => removeImage(i)}
                          className="mt-1 text-xs text-red-600 underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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

              {/* Visual style */}
              <div className="space-y-4 border-t border-neutral-100 pt-5">
                <h2 className="text-base font-semibold">Visual style</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={LABEL}>Heading font</label>
                    <input
                      className={FIELD}
                      placeholder="e.g. Playfair Display, Georgia"
                      value={headingFont}
                      onChange={(e) => setHeadingFont(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL}>Body font</label>
                    <input
                      className={FIELD}
                      placeholder="e.g. Inter (blank = system default)"
                      value={bodyFont}
                      onChange={(e) => setBodyFont(e.target.value)}
                    />
                  </div>
                </div>
                <p className="-mt-2 text-xs text-neutral-400">
                  Any{" "}
                  <a
                    href="https://fonts.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Google Font
                  </a>{" "}
                  name works (it loads automatically). Web-safe names like Georgia/Arial
                  also work.
                </p>
                <div>
                  <label className={LABEL}>Visual style guidelines</label>
                  <textarea
                    className={`${FIELD} h-28 resize-y`}
                    placeholder="Overall aesthetic, photography style, button shape, spacing, imagery do's & don'ts — anything the generator should follow visually."
                    value={visualStyle}
                    onChange={(e) => setVisualStyle(e.target.value)}
                  />
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
