import type { ComparisonSection } from "@/types/page";

// "Us vs them" comparison table.
export default function Comparison({ data }: { data: ComparisonSection["data"] }) {
  return (
    <section className="px-6 py-10" style={{ background: "rgba(0,0,0,0.02)" }}>
      <div className="mx-auto max-w-2xl">
        {data.heading && (
          <h2 className="lp-heading mb-5 text-center text-xl font-extrabold tracking-tight sm:text-2xl">
            {data.heading}
          </h2>
        )}
        <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="lp-accent-bg">
                <th className="p-3 text-left font-semibold"></th>
                <th className="p-3 text-center font-semibold">{data.usLabel}</th>
                <th className="p-3 text-center font-semibold opacity-90">
                  {data.themLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr key={i} className="border-t border-black/5">
                  <td className="p-3 font-medium">{row.feature}</td>
                  <td className="lp-accent-text p-3 text-center font-semibold">
                    {row.us}
                  </td>
                  <td className="lp-muted p-3 text-center">{row.them}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
