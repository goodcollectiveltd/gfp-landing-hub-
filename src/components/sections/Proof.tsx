import type { ProofSection } from "@/types/page";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="text-base" style={{ color: "var(--brand-accent)" }} aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-black/15">{"★".repeat(5 - rating)}</span>
    </div>
  );
}

export default function Proof({ data }: { data: ProofSection["data"] }) {
  return (
    <section className="px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <h2 className="lp-heading text-center text-xl font-extrabold tracking-tight sm:text-2xl">
          {data.headline}
        </h2>

        {data.stats && data.stats.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {data.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="lp-accent-text lp-heading text-4xl font-bold">
                  {stat.value}
                </div>
                <div className="lp-muted mt-1 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {(data.reviews ?? []).map((review, i) => (
            <figure
              key={i}
              className="flex flex-col rounded-xl border border-black/5 bg-white p-6 shadow-sm"
            >
              <Stars rating={review.rating} />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed">
                "{review.quote}"
              </blockquote>
              <figcaption className="lp-muted mt-4 text-sm font-medium">
                {review.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
