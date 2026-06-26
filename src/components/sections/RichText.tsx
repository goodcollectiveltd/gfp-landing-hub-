import type { RichTextSection } from "@/types/page";

// Editorial / article text block (heading + paragraphs).
export default function RichText({ data }: { data: RichTextSection["data"] }) {
  return (
    <section className="px-6 py-8">
      <div className="mx-auto max-w-2xl">
        {data.eyebrow && (
          <p className="lp-eyebrow mb-2 text-xs font-semibold">{data.eyebrow}</p>
        )}
        {data.heading && (
          <h2 className="lp-heading text-xl font-extrabold tracking-tight sm:text-2xl">
            {data.heading}
          </h2>
        )}
        <div className="mt-3 space-y-3">
          {data.paragraphs.map((p, i) => (
            <p key={i} className="text-[15px] leading-relaxed sm:text-base">
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
