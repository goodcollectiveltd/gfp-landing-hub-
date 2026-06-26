import { useEffect, useState } from "react";
import {
  type KnowledgeDoc,
  DOC_TAGS,
  listDocs,
  saveDoc,
  deleteDoc,
} from "@/lib/knowledge";

const FIELD =
  "mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none";
const LABEL = "block text-sm font-medium text-neutral-700";

// Context Hub document manager for one brand. The generator reads these docs
// (by tag) when it writes pages.
export default function KnowledgeDocs({ brandId }: { brandId: string | null }) {
  const [docs, setDocs] = useState<KnowledgeDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<KnowledgeDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brandId) {
      setDocs([]);
      return;
    }
    setLoading(true);
    listDocs(brandId)
      .then(setDocs)
      .finally(() => setLoading(false));
  }, [brandId]);

  if (!brandId) {
    return (
      <section className="rounded-2xl border border-dashed border-neutral-300 bg-white p-6">
        <h2 className="text-base font-semibold text-neutral-700">Knowledge documents</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Save this brand first, then add product, customer and proof documents here.
        </p>
      </section>
    );
  }

  async function handleSave() {
    if (!editing || !brandId) return;
    if (!editing.title.trim()) {
      setError("Give the document a title.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await saveDoc(brandId, {
        ...editing,
        title: editing.title.trim(),
      });
      setDocs((prev) =>
        prev.some((d) => d.id === saved.id)
          ? prev.map((d) => (d.id === saved.id ? saved : d))
          : [...prev, saved]
      );
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    try {
      await deleteDoc(id);
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Knowledge documents</h2>
          <p className="text-sm text-neutral-500">
            Product, customer, proof & angle docs the generator reads when it writes.
          </p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing({ title: "", tag: "product", content: "" })}
            className="shrink-0 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
          >
            ＋ Add document
          </button>
        )}
      </div>

      {loading && <p className="text-sm text-neutral-400">Loading documents…</p>}

      {/* Existing docs */}
      {!editing && docs.length > 0 && (
        <ul className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{d.title || "Untitled"}</p>
                <p className="text-xs text-neutral-400">
                  <span className="rounded bg-neutral-100 px-1.5 py-0.5 capitalize">{d.tag}</span>{" "}
                  · {d.content.length.toLocaleString()} chars
                </p>
              </div>
              <div className="flex shrink-0 gap-3 text-sm">
                <button onClick={() => setEditing(d)} className="text-neutral-600 underline">
                  Edit
                </button>
                <button
                  onClick={() => d.id && handleDelete(d.id)}
                  className="text-red-600 underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!editing && !loading && docs.length === 0 && (
        <p className="text-sm text-neutral-400">
          No documents yet. Paste in your product/customer docs to make the copy smarter.
        </p>
      )}

      {/* Editor */}
      {editing && (
        <div className="space-y-3 rounded-xl border border-neutral-200 p-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={LABEL}>Title</label>
              <input
                className={FIELD}
                placeholder="e.g. 5 Strain Probiotic+ — product knowledge"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </div>
            <div>
              <label className={LABEL}>Tag</label>
              <select
                className={`${FIELD} capitalize`}
                value={editing.tag}
                onChange={(e) => setEditing({ ...editing, tag: e.target.value })}
              >
                {DOC_TAGS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL}>Content</label>
            <textarea
              className={`${FIELD} h-72 resize-y font-mono text-xs`}
              placeholder="Paste the document (Markdown is fine)…"
              value={editing.content}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-neutral-900 px-5 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:bg-neutral-300"
            >
              {saving ? "Saving…" : "Save document"}
            </button>
            <button
              onClick={() => {
                setEditing(null);
                setError(null);
              }}
              className="text-sm text-neutral-500 underline"
            >
              Cancel
            </button>
            {error && <span className="text-sm text-red-700">{error}</span>}
          </div>
        </div>
      )}
    </section>
  );
}
