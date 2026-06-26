import { useMemo } from "react";
import { sanitizeCustomVisual } from "@/lib/sanitizeCustomVisual";
import type { CustomVisualSection } from "@/types/page";

// Renders a bespoke `customVisual` block. The markup is sanitised again here, at
// the point of injection, as a safety net — see sanitizeCustomVisual. Themed
// purely through the brand CSS variables already on the page root.
export default function CustomVisual({ data }: { data: CustomVisualSection["data"] }) {
  const safe = useMemo(() => sanitizeCustomVisual(data.markup), [data.markup]);

  if (!safe) return null;

  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-3xl">
        {data.heading && (
          <h2 className="lp-heading mb-6 text-center text-xl font-extrabold tracking-tight sm:text-2xl">
            {data.heading}
          </h2>
        )}
        {/* Sanitised markup only. */}
        <div className="cv-block" dangerouslySetInnerHTML={{ __html: safe }} />
      </div>
    </section>
  );
}
