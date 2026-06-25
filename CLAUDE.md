# CLAUDE.md — GFP Landing Hub

Guidance for Claude Code working in this repo. This is a **separate project** from
`clever-logistics-pal` (a sibling folder). Do not blend the two. This file is the
source of truth for what we're building and the decisions already made.

## What this is

An **AI advertorial / landing-page generator and hub** for a DTC e-commerce brand
(driven primarily by **Meta ads**). The traffic flow:

```
Meta ad click ──▶ advertorial landing page (this app, own subdomain) ──▶ Shopify checkout
```

The owner uploads an **ad concept (creative)** and a **competitor landing-page URL**,
sets a few brand guidelines once, and the app **one-shot generates an on-brand
advertorial** with a **Shopify buy box** on it.

The owner is non-technical. Prefer clear explanations, safe defaults, and small
reviewable steps over large opaque changes.

## Decisions already locked in (do not re-litigate)

- **Hosting:** pages serve from the brand's **own subdomain** (e.g. `lp.<brand>.com`)
  for maximum creative control. Not Replo, not Shopify-native pages.
- **Buy box:** use a **Shopify-native buy box** embedded on the page
  (Shopify Buy Button SDK or a cart permalink that deep-links into Shopify checkout).
  **No Replo dependency.** The owner previously used Replo and is intentionally moving off it.
- **Output fidelity:** **template + light visual editor.** The LLM fills fixed,
  on-brand React **section components**; the owner can tweak individual copy lines in a
  simple editor but NOT do freeform structural editing. Do **not** generate raw freeform HTML.
- **Tracking:** **Meta-first.** Meta Pixel on the landing page + pass `fbclid`/`fbp`
  through to the Shopify CTA so conversions attribute correctly. Generic UTM passthrough
  so Google Ads (secondary, not the focus) works too. Google pixel is not a priority.

## Architecture

Mirror the proven shape of the sibling `clever-logistics-pal` project (the owner is
familiar with it): **thin React/Vite control panel + Supabase edge functions (Deno) +
Postgres**, with all AI calls routed through an `ai-proxy` edge function that handles
retries / 429 backoff. **Use the latest Claude models** (e.g. `claude-opus-4-8` for
generation quality; a cheaper model like `claude-haiku-4-5` is fine for scraping/extraction).

Two surfaces, one backend:
1. **Generator (admin console)** — upload ad creative, paste competitor URL, pick a brand
   kit, generate, preview, lightly edit, publish.
2. **Public renderer** — fast pages at `lp.<brand>.com/<slug>` with pixel + click-ID passthrough.

### Generation pipeline (edge functions to build)
| Function | Responsibility |
|---|---|
| `analyze-ad` | Claude vision reads the uploaded creative → extracts hook, angle, core claim, audience, tone. |
| `scrape-competitor` | Fetch the competitor URL, reduce to readable content → Claude extracts the **section skeleton + persuasion sequence** (structure only, NOT their copy — avoid plagiarism). |
| `generate-page` | Claude takes {ad analysis + competitor structure + brand kit} → outputs **structured section JSON** matching our components. Validate claims against the brand kit's allowed-claims list (Meta ad-policy safety). |
| `publish-page` | Persist the page, assign a slug, make it live on the subdomain. |

### Section components (the template)
Build ~8 fixed React components the generator fills via JSON slots:
`Hero`, `ProblemAgitate`, `Mechanism` (how/why it works), `Proof` (reviews/social proof),
`Offer`, `FAQ`, `FinalCTA`, plus a sticky **BuyBox** bar. The LLM can reorder/populate but
cannot break layout or go off-brand.

### Data model (Supabase / Postgres)
- `brand_kits` — logo, colors, fonts, voice/tone, **allowed claims**, banned words, default Shopify CTA / product URL.
- `landing_pages` — slug, status (draft/published), section JSON, source ad asset, competitor URL, `brand_kit_id`.
- `ad_assets` — uploaded creatives (Supabase Storage).
- `page_events` — (later) view + CTA-click tracking for conversion analytics.

## Tech stack

Vite + React 18 + TypeScript, Tailwind, React Router. Path alias `@` → `src`.
Dev server on port 8080 (`npm run dev`). Edge functions: Supabase (Deno) — deploy via Supabase.

## Build order (suggested next steps)

1. `npm install` then `npm run dev` to confirm the scaffold runs.
2. Add Tailwind-based UI shell + routing (admin console at `/`, public page at `/p/:slug`).
3. Build the 8 section components against a hardcoded sample `landing_pages` JSON (renderer first, no AI yet).
4. Stand up Supabase project, add `brand_kits` + `landing_pages` tables, wire the brand-kit form.
5. Build `generate-page` against a sample brand kit + manual inputs; get one page generated end-to-end.
6. Add `analyze-ad` (vision) and `scrape-competitor`; chain them into generation.
7. Add the light visual editor (inline copy edits → save section JSON).
8. Add Meta Pixel + Shopify buy box + click-ID passthrough on the public renderer.
9. Subdomain hosting / deploy.

## Conventions
- Never commit secrets. Use `.env` (gitignored); document required keys in `.env.example`.
- `src/integrations/supabase/types.ts` (once added) is auto-generated — never hand-edit.
- Keep the public renderer fast and lightweight — it serves paid ad traffic.
