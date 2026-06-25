// Generates supabase/seed.sql from the canonical sample page so the seeded row
// exactly matches what the renderer expects. Run:
//   node scripts/gen-seed.ts > supabase/seed.sql
import { samplePage as p } from "../src/data/samplePage.ts";

const j = (v: unknown) => JSON.stringify(v);

const sql = `-- GFP Landing Hub — sample seed data
-- GENERATED from src/data/samplePage.ts by scripts/gen-seed.ts — do not hand-edit.
--
-- Puts the sample advertorial into your database so the renderer can serve a real
-- page from Supabase. Run in: Supabase dashboard -> SQL Editor -> New snippet -> Run.
-- Safe to re-run (landing page upserts on slug; brand kit only inserts if absent).

with bk as (
  insert into public.brand_kits (name, wordmark, colors, fonts, voice, default_product_url)
  select
    $bkname$${p.brandKit.name}$bkname$,
    $bkwm$${p.brandKit.wordmark}$bkwm$,
    $j$${j(p.brandKit.colors)}$j$::jsonb,
    $j$${j(p.brandKit.fonts)}$j$::jsonb,
    $voice$Calm, warm, reassuring, evidence-led. No hype.$voice$,
    $url$${p.buyBox.productUrl}$url$
  where not exists (select 1 from public.brand_kits where name = $bkname$${p.brandKit.name}$bkname$)
  returning id
), bk_id as (
  select id from bk
  union all
  select id from public.brand_kits where name = $bkname$${p.brandKit.name}$bkname$
  limit 1
)
insert into public.landing_pages (slug, status, title, brand_kit_id, buy_box, sections)
select
  $slug$${p.slug}$slug$,
  $status$${p.status}$status$,
  $title$${p.title}$title$,
  bk_id.id,
  $j$${j(p.buyBox)}$j$::jsonb,
  $j$${j(p.sections)}$j$::jsonb
from bk_id
on conflict (slug) do update
  set sections = excluded.sections,
      buy_box  = excluded.buy_box,
      title    = excluded.title,
      status   = excluded.status,
      brand_kit_id = excluded.brand_kit_id,
      updated_at = now();
`;

process.stdout.write(sql);
