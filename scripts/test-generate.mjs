// End-to-end test of generate-page: pulls real brand knowledge from the DB and
// runs a generation against a competitor URL. Run with SB_TOKEN + PROJECT_REF.
const TOKEN = process.env.SB_TOKEN;
const REF = process.env.PROJECT_REF;
const ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6cHFnZW9kY2JmZ3ltaXBlZndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTczNTMsImV4cCI6MjA5Nzk5MzM1M30.2RoVkOrZb5ToQ7JQikzB9fbHc2B23fPruLeROp3ULqc";
const COMPETITOR = process.argv[2] || "https://pickpeanut.com/pages/ear-issues-split";

async function q(sql) {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  return r.json();
}
const bid = `(select id from public.brand_kits where name = 'Good For Pets' limit 1)`;

const brand = (
  await q(`select name, voice, allowed_claims, banned_words, images from public.brand_kits where name = 'Good For Pets' limit 1`)
)[0];
const docs = await q(`select title, tag, content from public.knowledge_docs where brand_id = ${bid}`);
const reviews = await q(`select author, rating, body, images from public.reviews where brand_id = ${bid}`);

console.log(
  `Loaded: ${docs.length} docs, ${(brand.images || []).length} images, ${reviews.length} reviews`
);

const payload = {
  competitorUrl: COMPETITOR,
  brand: {
    name: brand.name,
    voice: brand.voice || "warm, honest, plain-spoken, founder-to-owner UK voice",
    allowedClaims: brand.allowed_claims || [],
    bannedWords: brand.banned_words || [],
  },
  buyBox: {
    productName: "5 Strain Probiotic+",
    price: "£44.99",
    compareAtPrice: "",
    ctaLabel: "Shop Now",
    productUrl: "https://goodforpets.co/products/5-strain-probiotic",
  },
  docs,
  images: brand.images || [],
  reviews: reviews.map((r) => ({ ...r, images: r.images || [] })),
};

console.log("Generating (this runs Haiku plan + Opus write, ~30-90s)…");
const t0 = Date.now();
const res = await fetch("https://uzpqgeodcbfgymipefwb.supabase.co/functions/v1/generate-page", {
  method: "POST",
  headers: { Authorization: `Bearer ${ANON}`, "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
const out = await res.json();
console.log("HTTP", res.status, `· ${((Date.now() - t0) / 1000).toFixed(0)}s\n`);
if (out.error) {
  console.log("ERROR:", out.error);
} else {
  const plan = out.plan?.blocks || out.plan || [];
  console.log("=== STRUCTURE PLAN (from competitor) ===");
  plan.forEach((b, i) => console.log(`  ${i + 1}. ${b.type}  [img:${b.imageNeed || "-"}]  ${b.purpose || ""}`));
  console.log("\n=== GENERATED PAGE (your brand) ===");
  (out.sections || []).forEach((s, i) => {
    const d = s.data || {};
    const head = d.headline || d.heading || d.quote || d.eyebrow || "";
    const img =
      typeof d.image === "string"
        ? d.image
        : d.image?.url || d.before?.url || d.after?.url || "";
    const ph = d.image?.role || d.before?.role || "";
    console.log(`  ${i + 1}. ${s.type}  ${head ? "— " + String(head).slice(0, 70) : ""}`);
    if (img) console.log(`        REAL IMAGE: ${img.slice(0, 70)}`);
    else if (ph) console.log(`        placeholder: ${ph}`);
    if (s.type === "quote" && d.attribution) console.log(`        review by: ${d.attribution}`);
  });

  // Cache + save it so we can view the rendered page at /p/demo-ear-issues.
  const { writeFileSync } = await import("fs");
  writeFileSync("scripts/last-gen.json", JSON.stringify({ sections: out.sections, buyBox: payload.buyBox }));
  const secJson = JSON.stringify(out.sections);
  const bbJson = JSON.stringify(payload.buyBox);
  const saveSql = `
delete from public.landing_pages where slug = 'demo-ear-issues';
insert into public.landing_pages (slug, status, title, brand_kit_id, sections, buy_box, competitor_url)
select 'demo-ear-issues', 'published', 'Ear issues demo', ${bid},
  $sx$${secJson}$sx$::jsonb, $bx$${bbJson}$bx$::jsonb, $cu$${COMPETITOR}$cu$;`;
  const saveRes = await q(saveSql);
  console.log("\nSaved →", JSON.stringify(saveRes).slice(0, 80), "→ /p/demo-ear-issues");
}
