import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listPages } from "@/lib/pages";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import type { LandingPage } from "@/types/page";

// Admin console at "/". The control panel where the owner will eventually upload
// an ad creative, paste a competitor URL, pick a brand kit, generate, preview,
// and publish. For now it's the shell + the list of existing pages (read live
// from Supabase). The generator inputs are stubbed until the edge functions exist.

export default function AdminConsole() {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listPages()
      .then((p) => active && setPages(p))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold">GFP Landing Hub</h1>
            <p className="text-sm text-neutral-500">Advertorial generator · admin console</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              isSupabaseConfigured
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {isSupabaseConfigured ? "● Supabase connected" : "Sample data · not connected"}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Generator entry point — stubbed until the edge functions exist. */}
        <section className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8">
          <h2 className="text-xl font-semibold">Generate a new advertorial</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Upload an ad creative, paste a competitor landing page, pick a brand kit.
            (Wired up in a later step — these inputs are placeholders for now.)
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StubInput label="Ad creative" hint="Image / video upload" />
            <StubInput label="Competitor URL" hint="https://…" />
            <StubInput label="Brand kit" hint="Select a brand" />
          </div>
          <button
            disabled
            className="mt-6 cursor-not-allowed rounded-lg bg-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-600"
            title="Available once the generation pipeline is built"
          >
            Generate page
          </button>
        </section>

        {/* Existing pages */}
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Landing pages
          </h2>
          {loading && (
            <p className="mt-4 text-sm text-neutral-400">Loading pages…</p>
          )}
          <ul className="mt-4 space-y-3">
            {pages.map((page) => (
              <li
                key={page.slug}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{page.title}</p>
                  <p className="text-sm text-neutral-500">
                    <code className="rounded bg-neutral-100 px-1">/p/{page.slug}</code>
                    <StatusBadge status={page.status} />
                  </p>
                </div>
                <Link
                  to={`/p/${page.slug}`}
                  className="shrink-0 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
                >
                  Preview →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

function StubInput({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-sm font-medium text-neutral-700">{label}</p>
      <p className="mt-1 text-xs text-neutral-400">{hint}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: "draft" | "published" }) {
  const styles =
    status === "published"
      ? "bg-green-100 text-green-800"
      : "bg-neutral-200 text-neutral-600";
  return (
    <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
}
