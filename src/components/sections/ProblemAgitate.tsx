import type { ProblemAgitateSection } from "@/types/page";

export default function ProblemAgitate({
  data,
}: {
  data: ProblemAgitateSection["data"];
}) {
  return (
    <section className="px-6 py-16" style={{ background: "rgba(0,0,0,0.02)" }}>
      <div className="mx-auto max-w-3xl">
        <h2 className="lp-heading text-center text-2xl font-bold sm:text-3xl">
          {data.headline}
        </h2>
        {data.intro && (
          <p className="lp-muted mx-auto mt-4 max-w-2xl text-center text-lg">
            {data.intro}
          </p>
        )}
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {data.painPoints.map((point, i) => (
            <div
              key={i}
              className="rounded-xl border border-black/5 bg-white p-6 shadow-sm"
            >
              <h3 className="lp-heading text-lg font-semibold">{point.title}</h3>
              <p className="lp-muted mt-2 text-sm leading-relaxed">
                {point.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
