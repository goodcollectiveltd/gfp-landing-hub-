# Session Bridge — GFP `/10-reasons` advertorial (handoff)

Snapshot for the next session. Covers what was built, the current state, every decision + why, key
file locations, gotchas, and what's still open. Written 16 Jul 2026.

---

## ⏫ Update — 17 Jul 2026 (Session 2: shipped it live)
The page is **deployed and live**. Key changes since the original bridge below:
- **Renamed 10 → 8 everywhere:** route is now **`/p/8-reasons`**, component/file **`EightReasonsAdvertorial.tsx`**,
  `document.title` fixed to "8 Reasons…". Old `/p/10-reasons` → `/p/8-reasons` via a 301 in `netlify.toml`.
- **Live on Netlify:** project **`gfp-landing-hub`** → `https://gfp-landing-hub.netlify.app`. Auto-builds from
  `origin/main`. Branded subdomain **`hello.goodforpets.co`** added (Shopify-managed DNS: CNAME `hello` →
  `gfp-landing-hub.netlify.app`). Final ad URL: **`https://hello.goodforpets.co/p/8-reasons`**.
- **Meta pixel + attribution DONE** (was open item #2): new `src/lib/tracking.ts` (pixel `3813384208943708`,
  same as store/quiz; ported from the quiz funnel). Fires `PageView` + `ViewContent` on load and a `CTAClick`
  custom event per placement; `withAttribution()` appends `fbclid`/`_fbp`/`_fbc`/UTMs to the Shopify CTA URL.
  Pixel only fires in the **PROD build** (never local). Verified live end-to-end via Playwright.
- **Subdomain root** `/` now **302 → goodforpets.co** (edge redirect in `netlify.toml` + `StoreRedirect`
  fallback). To avoid locking the owner out, the **admin console moved `/` → `/admin`** (login + "back to
  console" links updated).
- **`netlify.toml`** added: build (`npm run build` → `dist`), root redirect, 10→8 redirect, SPA fallback.
- **Supabase client** hardened: `??` → `||` so an empty Netlify env var can't white-screen the app.
- **Committed + pushed** to `origin/main` (was open item #3 — done). Repo is fully deployable from a clean clone.
- **Still open:** compress `charity-rescue.png` (3.0MB, on-page) + `tub-cutout.png` (3.9MB, golden page);
  confirm `hello.goodforpets.co` once DNS/SSL propagate; Meta Pixel Helper spot-check in a real browser.

*(The rest of this doc is the original 16 Jul bridge — still accurate except the 10→8 rename and the items above.)*

---

## TL;DR
Built a bespoke **listicle advertorial** for 5 Strain Probiotic+ (a rebuild of the live Replo page
`goodforpets.co/pages/10reasons`), plus an earlier PDP-style "golden page." Both live in the Landing Hub
and render locally. The `/10-reasons` page went through ~15 rounds of the owner's direction and is now an
**8-reason** page (consolidated from 10). It is content-complete and design-complete; the outstanding work
is **tracking (Meta pixel/click-IDs), a file/route rename, and git commit** — see Open Items.

---

## The two pages built this session
| Page | Component | Route | What it is |
|---|---|---|---|
| **8-reasons advertorial** (primary focus) | `src/pages/TenReasonsAdvertorial.tsx` | `/p/10-reasons` | Cold-traffic listicle advertorial. **⚠️ Name is stale** — it's 8 reasons now, route/file still say "10/Ten". |
| **Golden page** (PDP-style advertorial) | `src/pages/ProbioticPlusAdvertorial.tsx` | `/p/5-strain-probiotic-plus` | Earlier section-by-section clone of the live `/5strainprobioticcomplex` Replo page. |

There's also a **rejected** JSON-template version at `src/data/probioticPlusPage.ts` (registered in
`src/lib/pages.ts`) — the owner found the generic Landing-Hub components too template-looking; **bespoke
art-directed components are the accepted approach.** Don't revive the template path.

Routes are wired in `src/App.tsx`. Dev server: **port 8091** this session (8080 was held by another chat's
quiz-funnel). `npm run dev -- --port 8091` from `GFP-Landing-Hub/`.

---

## Current state of `/10-reasons` (the 8-reason page)

**Structure (top → bottom):**
1. Header — real brand logo `logo-brand.png`
2. Native byline — "By Jess M · Verified ✓ · Updated today"
3. H1 — "8 Reasons UK Dog Parents Are Ditching Expensive Probiotic Chews for Sprinkle Capsules"
4. **Create-emotion scene** (not a sell-to question) — "It's 9pm, and there's that wet lick-lick-lick under the telly again. Not his skin, most likely. It's his gut."
5. Rating row — 4.8/5 · 4,500+ reviews · 20,000+ dogs helped
6. **Comparison table** — the hero lands here (Hollow Socks structure); the whole card links to the product page
7. Top CTA
8. **Problem-agitation** line → "You've done the sprays, the shampoos, the chews, the vet bills, and nothing's stuck. Here's what nobody tells you 👇"
9. **Mechanism card** — "Why most probiotic chews are dead on arrival" (Baked / Full of moisture / The fix). This is the new-mechanism reveal, moved up front.
10. **The 8 reasons** (heading → full-width image/slider → 1–2 line body, most with a proof quote):
    1. Paw licking — before/after **slider**
    2. Helps clear gunky ears — **slider** + Katie S. quote
    3. Calms itchy skin — Bear before/after **slider**
    - → **stat bar** (20,000+ dogs · 4,500+ reviews · 4.8/5)
    4. Settles the tummy + scooting (merged) — Lynn S. quote
    5. 5 billion cultures / UK's first double-strength (merged potency + vet) — Dr Kishan Vara photo + quote
    6. Sprinkles in seconds — Jazzy D. quote
    7. 51% of profits to rescue
    8. "It's not magic, but we'll take the risk" — 90-day guarantee + seal
11. Mid CTA → Offer block (from 28p/day, £44.99 anchor struck, "54% cheaper per day", subscribe-save, badges, guarantee) → Reviews (6 cards) → FAQ (7) → closing CTA → advertorial disclaimer → **sticky CTA bar**.

**Design system (locked):** ORANGE `#EF3824` = CTAs + small accents ONLY (no big orange fills except CTAs);
NAVY `#16223C` = secondary blocks (table header, stat bar); INK `#1C1C2E` headings; cream `#FBF6F1` bg.
Fonts **Poppins (display) + Inter (body)** — verified from the live Replo page + used across GFP.
3 before/after sliders use the `BeforeAfter` component (default `aspect-[4/3]`).

---

## Key decisions & why (don't re-litigate)
- **Bespoke art-directed component**, not the JSON template renderer (owner rejected the template look).
- **Consolidated 10 → 8 reasons** using Nick's leverage analysis: merged tummy+scooting, merged potency+vet; back half is a deliberate conversion stack (superiority → ease → identity → guarantee). Cut the two lowest-leverage/redundant slots.
- **No on-page buy box** — CTAs link to the live Shopify product page (`PRODUCT_URL`). Owner removed the buy box.
- **Hero lands on the comparison table** (Hollow Socks winning-page structure). No plain product hero image (owner: a plain packshot hurts performance).
- **Correct mechanism = gut→immune→skin axis.** Probiotics **calm the over-active allergic immune response** (which keeps yeast in check) — they do **NOT** "kill" or "crowd out" skin/ear yeast. Full write-up + papers: `company-context/products/science-behind-probiotics.md`. **Never regress to "kills the yeast."**
- **No em dashes (—) anywhere** — brand rule; also stripped from `company-context/testimonials/testimonials.md`. Attribution uses a middot (·).
- **No fake urgency** (no countdown/"stock running low") — brand-voice.md bans invented scarcity. This is the one place we deliberately diverge from Hollow Socks.
- **Copy is hyper-tight** (Nick: simple > clever; owner pushed hard for brevity). Reasons are 1–2 short lines. The one place to spend words is the emotional hook/lead (the 9pm scene).
- **Prices/specs are real:** RRP £44.99; subscribe-save 30% first order then 20%; ~28p/day; ~54% cheaper per day than top-10 competitors (all from `company-context`). Live variant IDs used on the golden page's buy box; the /10-reasons page just links to the PDP.

---

## Context-hub files created/updated this session
- **NEW** `company-context/products/science-behind-probiotics.md` — the gut→immune→skin mechanism narrative + every paper cited (PMIDs/DOIs). Pointed to from the README map and `guides/writing-copy.md`.
- `company-context/README.md` — added the science-file pointer in the products line.
- `company-context/guides/writing-copy.md` — added row 6 (science file) with the "probiotics don't kill yeast" correction.
- `company-context/testimonials/testimonials.md` — em dashes removed (customer quotes untouched; only formatting).
- Memory: `gfp-landing-hub-golden-page.md`, `probiotic-mechanism-science.md` (both indexed in MEMORY.md).

---

## Analysis done (reference, not action)
- **Full Nick Theriot matrix teardown** of the page (8-layer LP framework + emotional concepts + hooks/positioning + copy principles + listicle anatomy). Verdict: mechanically excellent; the last gap was emotional (sell-to → create-emotion), now addressed via the 9pm scene + sharpened agitation + restored byline.
- **PostHog heatmap read** of the live `/10reasons`: #1 paid-social LP (744 visitors/7d, 29.6% bounce, 85% mobile); scroll collapses to ~14% by the offer; taps cluster on the comparison table + before/after images (→ made them interactive) + reason headings. Note: PostHog MCP here only exposes `render-ui`; read heatmaps by driving authenticated PostHog in the user's real Chrome (claude-in-chrome).

---

## Gotchas
- **Dev server on 8091** (8080 taken by another chat). The in-app **preview pane screenshot is flaky** — verify visuals with **Playwright via `company-context/ad-factory`** (chromium is installed there): `node -e "const {chromium}=require('playwright')..."` pointing at `http://localhost:8091/p/10-reasons`.
- **Image compression discipline:** image-bank photos are huge (up to 10MB). Always re-encode to ≤1200–1400px JPEG (q0.82–0.85) before putting on a page. No ImageMagick on this machine — use the canvas-in-Playwright trick (see the crop/compress scripts used this session).
- **Image gen:** `company-context/ad-factory/scene.mjs` / `creative.mjs` use `gpt-image-2`. ⚠️ A **live OpenAI key is committed** in `company-context/ad-factory/.env` — rotate if that folder is ever pushed to a remote.
- Page assets live in `GFP-Landing-Hub/public/lp/`. `paw-lick.jpg` is now unused (replaced by the paw before/after slider). Ear/Bear sliders use the `*-c.jpg` cropped variants; sources are the un-suffixed files.

---

## Open items / next steps
1. **Rename** `TenReasonsAdvertorial` → `EightReasonsAdvertorial` and route `/p/10-reasons` → `/p/8-reasons` for accuracy (cosmetic; the URL must match whatever the paired ad links to). Also update any ad that promises "10 reasons" for congruence.
2. **Meta pixel + fbclid/fbp/UTM passthrough** on the CTAs — **not built yet**, and it's required before this takes paid traffic (the whole point of the subdomain). This is the biggest functional gap on both advertorials.
3. **Commit to git** — nothing has been committed this session. The repo has both advertorials, the new components/images, and the context-hub edits (context-hub is a separate folder/repo).
4. **Ear before/after crop** is unsettled — the owner reverted a 4:5 experiment; it's currently 4:3 matched-zoom. The two Murphy ear photos are framed differently (before is a tighter shot); a clean match may need a portrait aspect for that pair or a different before image. Await direction.
5. **Optional trims** the owner flagged: FAQ #5 ("how do I give it") is covered by Reason 6; FAQ #1 repeats the mechanism — either is a clean deletion.
6. **Optional tests:** a symptom-led H1 variant for paw-licking ad sets (congruence); a one-line cost-of-inaction beat (the "not important enough" objection).
7. **Phase-2 generator rebuild** (from `gfp-landing-hub-golden-page` memory) — re-point generation at `company-context/`, real headless competitor capture, blocking quality gate, auto image-briefs, and the Meta layer. Still pending; these two hand-built pages are the fidelity benchmark.

---

## How to resume fast
1. `cd GFP-Landing-Hub && npm run dev -- --port 8091`, open `/p/10-reasons`.
2. Read `company-context/CLAUDE.md` + `guides/writing-copy.md` before touching copy; `science-behind-probiotics.md` before touching the mechanism.
3. For visual checks, screenshot via Playwright in `company-context/ad-factory`, not the flaky preview pane.
4. Keep it: no em dashes, no fake urgency, orange = CTAs only, mechanism = gut→immune→skin (never "kills yeast").
