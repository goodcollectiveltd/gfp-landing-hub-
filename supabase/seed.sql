-- GFP Landing Hub — sample seed data
-- GENERATED from src/data/samplePage.ts by scripts/gen-seed.ts — do not hand-edit.
--
-- Puts the sample advertorial into your database so the renderer can serve a real
-- page from Supabase. Run in: Supabase dashboard -> SQL Editor -> New snippet -> Run.
-- Safe to re-run (landing page upserts on slug; brand kit only inserts if absent).

with bk as (
  insert into public.brand_kits (name, wordmark, colors, fonts, voice, default_product_url)
  select
    $bkname$RestWell$bkname$,
    $bkwm$RestWell$bkwm$,
    $j${"primary":"#1f6f5c","onPrimary":"#ffffff","accent":"#e8a13a","background":"#fbfaf7","text":"#1c2b27","muted":"#5d6b66"}$j$::jsonb,
    $j${"heading":"'Georgia', 'Times New Roman', serif","body":"system-ui, -apple-system, 'Segoe UI', sans-serif"}$j$::jsonb,
    $voice$Calm, warm, reassuring, evidence-led. No hype.$voice$,
    $url$https://example-store.myshopify.com/cart/123456789:1$url$
  where not exists (select 1 from public.brand_kits where name = $bkname$RestWell$bkname$)
  returning id
), bk_id as (
  select id from bk
  union all
  select id from public.brand_kits where name = $bkname$RestWell$bkname$
  limit 1
)
insert into public.landing_pages (slug, status, title, brand_kit_id, buy_box, sections)
select
  $slug$restwell-magnesium$slug$,
  $status$published$status$,
  $title$RestWell Magnesium — Sleep Advertorial (sample)$title$,
  bk_id.id,
  $j${"productName":"RestWell Magnesium Glycinate","price":"$39","compareAtPrice":"$59","ctaLabel":"Add to Cart","productUrl":"https://example-store.myshopify.com/cart/123456789:1"}$j$::jsonb,
  $j$[{"type":"hero","data":{"eyebrow":"As recommended by sleep specialists","headline":"The 2-Minute Nightly Ritual That Helps You Fall Asleep — Without Melatonin Grogginess","subheadline":"A highly-absorbable magnesium glycinate that calms a racing mind and relaxes tense muscles, so you drift off naturally and wake up clear-headed.","ctaLabel":"Try RestWell Tonight","trustLine":"Free shipping · 60-night money-back guarantee"}},{"type":"problemAgitate","data":{"headline":"If You're Tired But Wired at Night, You're Not Broken — You're Probably Deficient","intro":"Up to 2 in 3 adults don't get enough magnesium — the mineral your nervous system needs to switch off. The result feels all too familiar:","painPoints":[{"title":"A mind that won't quiet down","body":"You're exhausted, but the second your head hits the pillow your brain starts replaying the day."},{"title":"Tossing, turning, watching the clock","body":"You fall asleep eventually — then wake at 3am and can't get back down."},{"title":"Groggy mornings, dragging days","body":"Melatonin knocks you out but leaves you foggy. Coffee just papers over the cracks."}]}},{"type":"mechanism","data":{"eyebrow":"Why it works","headline":"Magnesium Glycinate Calms the Nervous System — Glycine Carries It Where It's Needed","subheadline":"Most magnesium supplements use cheap oxide your body barely absorbs. RestWell uses chelated glycinate for gentle, high uptake — no laxative effect.","steps":[{"title":"Calms an overactive nervous system","body":"Magnesium regulates GABA, the neurotransmitter that tells your brain it's safe to power down."},{"title":"Relaxes tense muscles","body":"It eases the physical tension that keeps you fidgeting, so your body actually settles."},{"title":"Absorbs without the gut upset","body":"Bound to glycine for high bioavailability — you get the dose, not the bathroom trips."}]}},{"type":"proof","data":{"headline":"Over 40,000 Better Nights — and Counting","stats":[{"value":"4.8/5","label":"from 6,200+ reviews"},{"value":"92%","label":"fell asleep faster in 2 weeks"},{"value":"40k+","label":"bottles shipped"}],"reviews":[{"quote":"I've tried everything. This is the first thing that actually quiets my brain at night. I wake up clear, not drugged.","author":"Sarah M., verified buyer","rating":5},{"quote":"Skeptical at first — but by night three I was out in minutes. No grogginess like melatonin gave me.","author":"David R., verified buyer","rating":5},{"quote":"The 3am wake-ups have basically stopped. I didn't realize how much magnesium I was missing.","author":"Priya K., verified buyer","rating":5}]}},{"type":"offer","data":{"headline":"Start Sleeping Better Tonight — Risk-Free","subheadline":"Every bottle is a full 30-night supply.","bullets":["High-absorption magnesium glycinate (no cheap oxide)","No melatonin, no next-day grogginess","Gentle on the stomach — no laxative effect","Third-party tested · made in a GMP-certified facility","Free shipping on every order"],"guarantee":"Try it for 60 nights. If you're not sleeping better, send it back for a full refund — even the empty bottle."}},{"type":"faq","data":{"headline":"Common Questions","items":[{"q":"How is this different from melatonin?","a":"Melatonin forces a sleep signal and can leave you groggy. Magnesium works upstream — it calms your nervous system so your body falls asleep on its own, the way it's meant to."},{"q":"When will I notice a difference?","a":"Many people feel calmer the first night. Most report meaningfully better sleep within 1–2 weeks as magnesium levels rebuild."},{"q":"Is it safe to take every night?","a":"Yes — magnesium glycinate is gentle and designed for nightly use. As always, check with your doctor if you're pregnant or on medication."},{"q":"What if it doesn't work for me?","a":"You're covered by our 60-night money-back guarantee. If you're not sleeping better, we'll refund you in full."}]}},{"type":"finalCta","data":{"headline":"Your Best Night's Sleep Starts Tonight","subheadline":"Join 40,000+ people who finally switch off at night — backed by a 60-night guarantee.","ctaLabel":"Try RestWell Tonight","trustLine":"Free shipping · 60-night money-back guarantee"}}]$j$::jsonb
from bk_id
on conflict (slug) do update
  set sections = excluded.sections,
      buy_box  = excluded.buy_box,
      title    = excluded.title,
      status   = excluded.status,
      brand_kit_id = excluded.brand_kit_id,
      updated_at = now();
