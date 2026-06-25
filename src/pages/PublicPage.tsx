import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageRenderer from "@/components/PageRenderer";
import { getPublishedPage } from "@/lib/pages";
import type { LandingPage } from "@/types/page";

// Public landing page at /p/:slug — the page real Meta-ad traffic will hit.
// Reads the published page from Supabase by slug (falling back to the sample
// page so the demo keeps working before the DB is seeded). Click-ID
// (fbclid/utm) passthrough lands here later (milestone 8).

export default function PublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getPublishedPage(slug ?? "")
      .then((p) => {
        if (active) setPage(p);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 text-neutral-400">
        Loading…
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-neutral-50 p-6 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Page not found</h1>
        <p className="text-neutral-600">
          No published landing page matches{" "}
          <code className="rounded bg-neutral-200 px-1">/{slug}</code>.
        </p>
        <Link to="/" className="text-blue-600 underline">
          Back to the console
        </Link>
      </div>
    );
  }

  return <PageRenderer page={page} />;
}
