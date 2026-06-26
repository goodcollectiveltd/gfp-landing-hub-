# SESSION BRIDGE — read this first

Hand-off for continuing the GFP Landing Hub in a new Claude Code session. Read
this, then `CLAUDE.md` (the locked plan), `PROJECT-SUMMARY.md` (full overview),
and the **visual build brief** (see §4). The owner (`will@stefanthomas.co`) is
**non-technical** — explain plainly, work in small reviewable steps.

---

## 1. What this is (one line)

An AI advertorial generator for **Good For Pets** (UK dog supplements, hero product
**"5 Strain Probiotic+"**). Owner pastes a **competitor advertorial URL** → the app
generates an **on-brand advertorial** that mirrors the competitor's structure,
written in the brand's voice from the brand's own knowledge, with the brand's real
images, reviews, fonts, colours, logo, and a Shopify buy box. Flow: Meta ad →
advertorial (`/p/:slug`) → Shopify checkout.

## 2. Where we are RIGHT NOW (the active phase)

The generator **works end-to-end** (mirrors competitor structure, writes compliant
on-brand copy, places real reviews/images). But output looked **visually generic**.
We are mid-way through a **VISUAL FIDELITY UPGRADE** driven by a build brief.

**Just completed:** a library of **13 bespoke, themed, prop-driven visual
components** (React + SVG + CSS) in `src/components/visuals/`. View them all at
**`/showcase`** (public route). They look great — modern, on-brand, legible.

**THE IMMEDIATE NEXT TASK** (this is where to start): the generator does NOT yet
emit these new components — it still outputs the old 13 section blocks. Wire the
new components into generation. See §5.

## 3. Read order for orientation

1. `CLAUDE.md` — locked product decisions/architecture.
2. `PROJECT-SUMMARY.md` — full overview + the visual-fidelity problem framing.
3. **The build brief** — `C:\Users\will\Downloads\gfp-landing-hub-visual-fidelity-spec.md`
   (ask the owner to re-share it in-session; it defines this whole phase: rich
   component library is the default, a vetted `customVisual` escape hatch, slot
   routing, image-brief schema, build order). It is the source of truth for the
   current work.
4. `/showcase` in the running app — see the components built so far.

## 4. The visual build brief — key points (full version in Downloads)

- **Mandate:** generated pages must look like bespoke, high-converting advertorials,
  NOT a re-skinned generic template. Default any "idea" section to a **custom-built
  visual component**; a plain image+text is the fallback for genuine photos only.
- **Guardrails:** audience is sceptical dog owners, female 55–65+ — large, legible,
  calm, credible; SVG/CSS over heavy JS (paid traffic, speed matters); one hero
  visual per idea; brand red `#EF3824`, Poppins headings, Inter body, all via CSS
  vars. **Compliance floor:** "supports / helps maintain" only — never treat/cure/
  prevent; never an alternative to vet treatment; product name always exactly
  "5 Strain Probiotic+".
- **Architecture:** rich themed component library is default; add a vetted
  `customVisual` block (sanitised SVG/JSX, brand vars only, store its design brief);
  structured section JSON stays (NO raw freeform HTML).
- **Build order:** (1) components [largely DONE], (2) `customVisual` + sanitiser +
  brief storage, (3) `visualType` in generation output, (4) slot routing
  COMPONENT/customVisual/LIBRARY/BRIEF, (5) image-brief generation+display+storage,
  (6) stock toggle (optional, default off), (7) light visual editor.

## 5. THE IMMEDIATE NEXT TASK — wire components into the generator

Brief steps 2–4 (the components exist; now make the engine use them):

1. **Register the 13 new components in the renderer + section schema** so they can
   be part of a page. They live in `src/components/visuals/`; the renderer is
   `src/components/PageRenderer.tsx`; section types are in `src/types/page.ts`. Each
   needs a `Section` union member (type + typed `data`/props) and a render case.
2. **Add `visualType` slot routing** (brief §4): each visual slot the generator
   emits carries a `visualType` enum. COMPONENT types (mechanism, gutRebalance,
   strainBreakdown, symptomToGut, timeline, comparison, statPanel, trustBadgeRow,
   reviewCard, vetPanel) → render a component. PHOTO types (productPhoto,
   lifestylePhoto, ugcPhoto, beforeAfter, proofScreenshot) → resolve from the
   captioned image library, else emit an **image brief** (brief §5) as a labelled
   placeholder. Default bias: if a slot could be a component, make it a component.
3. **Add the `customVisual` block** + a sanitiser (brief §2) for bespoke diagrams.
4. **Rewire `generate-page` Pass 2** (`supabase/functions/generate-page/index.ts`)
   to emit these component types with structured props, grounded in the Context Hub
   docs/voice/claims, "default to a component not a photo." Then redeploy + test.

Then **step 7: the light editor** (reorder/delete/swap/edit per block, regenerate a
single block/customVisual) — the final 10%.

## 6. What's already built and working

- ✅ Frontend (Vite+React+TS+Tailwind): admin `/`, generator `/new`, brand/Context
  Hub `/hub`, public `/p/:slug`, component gallery `/showcase`, login.
- ✅ Supabase: Postgres, Storage (`brand-assets`), Auth (owner login), Edge Functions.
- ✅ Tables: `brand_kits`, `landing_pages`, `knowledge_docs`, `reviews`, `ad_assets`,
  `page_events`.
- ✅ Brand kit (Good For Pets): voice, allowed_claims, banned_words, fonts
  (Poppins/Inter), colours (red #EF3824), logos, image library (72 images), store
  domain. Multi-brand capable.
- ✅ Image library with **AI vision captioning/tagging** (`analyze-image` fn).
  NOTE: most of the 72 images are still tagged "other"/uncaptioned — owner should
  run "Auto-caption all" in the Hub so product/vet/before-after images become
  placeable by the generator.
- ✅ Reviews library: 12 reviews (9 with photos), scrape + JSON import (`scrape-reviews`).
- ✅ Context Hub: 4 docs loaded (product, customer, objection, review bank).
- ✅ Live Shopify products/variants/subscriptions in the buy box (`list-products`).
- ✅ Generator (`generate-page`): fetches competitor → deterministic structural
  skeleton (headings + image positions + paragraph lengths, NOT their copy) →
  Pass 1 (Haiku) block plan → Pass 2 (Opus) writes the page from brand docs/voice/
  claims into the OLD 13 section blocks, placing real images/reviews. Anti-plagiarism
  by design (Pass 2 never sees competitor text). Recent fixes: Poppins fonts, tight
  spacing, punchy copy, object-cover images.
- ✅ 13 new visual components in `src/components/visuals/` + `/showcase`.
- ⏳ NOT done: wiring components into the generator (§5); `customVisual`; image-brief
  schema; light editor; Meta Pixel + fbclid/UTM passthrough; subdomain deploy.

## 7. Operational how-tos

- **Run app:** `npm run dev` (port 8080) — or the preview tool. Demo page:
  `/p/demo-ear-issues`. Component gallery: `/showcase`.
- **Supabase project ref:** `uzpqgeodcbfgymipefwb`. Good For Pets `brand_id`:
  `07bd3c4e-485f-4bca-82a7-5af17073c209`.
- **Deploy an edge function:** `SUPABASE_ACCESS_TOKEN=<token> npx supabase functions
  deploy <name> --project-ref uzpqgeodcbfgymipefwb`. ⚠️ The owner creates a
  **temporary Supabase access token** at supabase.com/dashboard/account/tokens, you
  use it for the session, and they **delete it after** (a fresh one is needed each
  session — it is NOT stored anywhere). Anthropic API key is already set as a
  function secret.
- **DB writes / migrations (privileged):** POST SQL to the Management API
  `https://api.supabase.com/v1/projects/<ref>/database/query` with the access token.
  Examples in `scripts/push-*.mjs`. (RLS makes the app's anon key read-only on
  published pages; owner-only for writes.)
- **Test a generation end-to-end:** `SB_TOKEN=<token> PROJECT_REF=uzpqgeodcbfgymipefwb
  node scripts/test-generate.mjs [competitorUrl]` — pulls real brand/docs/reviews,
  calls `generate-page`, prints the plan + sections, and saves to `/p/demo-ear-issues`.
- **Edge functions:** `generate-page`, `analyze-image`, `list-products`,
  `scrape-reviews` (Deno, in `supabase/functions/`).
- **GitHub:** `origin` = goodcollectiveltd/gfp-landing-hub- (branch `main`). Commit +
  push at each milestone. `.env` is gitignored (Supabase URL + anon key).

## 8. Locked decisions / constants

- Own subdomain hosting; Shopify-native buy box; **template + components, NO raw
  freeform HTML** (the `customVisual` escape hatch is sanitised, themeable, editable).
- Mirror competitor **structure**, never their copy (copyright + Meta duplicate-copy
  safety). Original copy from brand docs only.
- Compliance: supports/helps language; approved-claims list + NEVER-SAY list in the
  brand + docs; product name exactly "5 Strain Probiotic+".
- Brand: red `#EF3824`, Poppins headings, Inter body. Bacteria colour code in
  diagrams: blue = neutral, red = bad/dead, green = good/alive.
- Models: Opus 4.8 (generation), Haiku 4.5 (extraction/captioning).

## 9. Known gotchas

- Generation is non-deterministic (LLM). Always review a page before publishing; the
  editor (step 7) is how the owner does the final fixes.
- A fresh Supabase access token is needed each session for deploys/DB writes.
- Uncaptioned "other" images aren't placed by the generator — run "Auto-caption all".
- `generate-page` Pass 2 output is capped; large pages need `max_tokens` headroom
  (currently 14000) to avoid truncated tool calls (502 "did not return sections").
