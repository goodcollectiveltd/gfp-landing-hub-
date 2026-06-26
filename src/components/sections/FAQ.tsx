import type { FaqSection } from "@/types/page";

export default function FAQ({ data }: { data: FaqSection["data"] }) {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <h2 className="lp-heading text-center text-xl font-extrabold tracking-tight sm:text-2xl">
          {data.headline}
        </h2>
        <div className="mt-8 divide-y divide-black/10 rounded-xl border border-black/5 bg-white">
          {(data.items ?? []).map((item, i) => (
            <details key={i} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="lp-heading flex cursor-pointer items-center justify-between gap-4 text-base font-semibold">
                {item.q}
                <span
                  className="lp-muted shrink-0 text-xl transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="lp-muted mt-3 text-sm leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
