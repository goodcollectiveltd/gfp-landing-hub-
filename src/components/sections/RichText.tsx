import type { RichTextSection } from "@/types/page";

// Editorial / article text block (heading + paragraphs).
export default function RichText({ data }: { data: RichTextSection["data"] }) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-2xl">
        {data.eyebrow && (
          <p className="lp-eyebrow mb-2 text-sm font-semibold">{data.eyebrow}</p>
        )}
        {data.heading && (
          <h2 className="lp-heading text-2xl font-bold sm:text-3xl">{data.heading}</h2>
        )}
        <div className="mt-4 space-y-4">
          {data.paragraphs.map((p, i) => (
            <p key={i} className="text-base leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
