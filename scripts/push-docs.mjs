// One-off: load the Good For Pets context docs into knowledge_docs via the
// Supabase Management API. Idempotent (deletes same-titled docs first).
import { readFileSync } from "fs";

const TOKEN = process.env.SB_TOKEN;
const REF = process.env.PROJECT_REF;
const DL = "C:/Users/will/Downloads/";

const docs = [
  {
    file: DL + "5-Strain-Probiotic-Plus-Product-Knowledge.md",
    title: "5 Strain Probiotic+ — Product Knowledge",
    tag: "product",
  },
  {
    file: DL + "5-Strain-Probiotic-Plus-Customer-Avatar.md",
    title: "5 Strain Probiotic+ — Customer Avatar",
    tag: "customer",
  },
  {
    file: DL + "5-Strain-Probiotic-Plus-Objection-Proof-Bank.md",
    title: "5 Strain Probiotic+ — Objection & Proof Bank",
    tag: "proof",
  },
];

const contents = docs.map((d) => readFileSync(d.file, "utf8"));

const titlesList = docs.map((d, i) => `$n${i}$${d.title}$n${i}$`).join(", ");
const valuesRows = docs
  .map(
    (d, i) =>
      `  ($n${i}$${d.title}$n${i}$, $g${i}$${d.tag}$g${i}$, $c${i}$${contents[i]}$c${i}$)`
  )
  .join(",\n");

const sql = `
delete from public.knowledge_docs
 where brand_id = (select id from public.brand_kits where name = $bn$Good For Pets$bn$ limit 1)
   and title in (${titlesList});

insert into public.knowledge_docs (brand_id, title, tag, content)
select b.id, v.title, v.tag, v.content
from (select id from public.brand_kits where name = $bn$Good For Pets$bn$ limit 1) b
cross join (values
${valuesRows}
) as v(title, tag, content);

select title, tag, length(content) as chars from public.knowledge_docs
 where brand_id = (select id from public.brand_kits where name = $bn$Good For Pets$bn$ limit 1)
 order by tag;
`;

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: "POST",
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});
console.log("HTTP", res.status);
console.log(await res.text());
