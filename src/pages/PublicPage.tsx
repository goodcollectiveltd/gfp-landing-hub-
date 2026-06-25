import { useParams, Link } from "react-router-dom";
import PageRenderer from "@/components/PageRenderer";
import { samplePage } from "@/data/samplePage";

// Public landing page at /p/:slug — the page real Meta-ad traffic will hit.
// For now there's only the one hardcoded sample; once Supabase is wired in this
// will look the page up by slug. Click-ID (fbclid/utm) passthrough also lands
// here later (milestone 8).

const pagesBySlug: Record<string, typeof samplePage> = {
  [samplePage.slug]: samplePage,
};

export default function PublicPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? pagesBySlug[slug] : undefined;

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
