import type { MechanismSection } from "@/types/page";

export default function Mechanism({
  data,
}: {
  data: MechanismSection["data"];
}) {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-3xl text-center">
        {data.eyebrow && (
          <p className="lp-eyebrow mb-3 text-sm font-semibold">{data.eyebrow}</p>
        )}
        <h2 className="lp-heading text-2xl font-bold sm:text-3xl">
          {data.headline}
        </h2>
        {data.subheadline && (
          <p className="lp-muted mx-auto mt-4 max-w-2xl text-lg leading-relaxed">
            {data.subheadline}
          </p>
        )}
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
        {data.steps.map((step, i) => (
          <div key={i} className="text-center">
            <div
              className="lp-accent-bg mx-auto flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
              aria-hidden
            >
              {i + 1}
            </div>
            <h3 className="lp-heading mt-4 text-lg font-semibold">
              {step.title}
            </h3>
            <p className="lp-muted mt-2 text-sm leading-relaxed">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
