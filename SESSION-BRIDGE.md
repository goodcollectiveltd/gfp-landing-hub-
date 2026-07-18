# Session Bridge — GFP advertorial + the "PickPeanut replica" build (handoff)

Written 18 Jul 2026. Supersedes the old 10→8 bridge (that page has since been transformed).
Covers the **current state** of the live `/p/8-reasons` advertorial (the "bones") and the
**next task**: build a *new* page that replicates PickPeanut's structure on those bones.

---

## TL;DR
- This session rebuilt `/p/8-reasons` (`src/pages/EightReasonsAdvertorial.tsx`) into a **light,
  single-angle, mechanism-led listicle advertorial**. It's live on Netlify and is the reference/bones.
- **NEXT TASK:** build a **new** advertorial page that reuses this page's React component bones but is
  **restructured to replicate PickPeanut** (`pickpeanut.com/pages/ear-issues-split`) — an aggressive
  listicle with a top sale banner, per-reason CTAs, "Loved by N dogs", and a bundle/gift-style offer.
- **Copy the SKELETON, not the copy.** All copy stays GFP/Sue-grounded from `company-context/`.
  Never fabricate offers/gifts we don't actually have.

---

## Current state of `/p/8-reasons` (the bones to reuse)
- **File:** `src/pages/EightReasonsAdvertorial.tsx` · **route:** `/p/8-reasons` (in `src/App.tsx`) ·
  **live:** `https://gfp-landing-hub.netlify.app/p/8-reasons` (branded: `hello.goodforpets.co/p/8-reasons`).
- **Structure now (top → bottom):**
  1. Logo + native byline ("By Jess M · Verified ✓ · Updated today")
  2. **Headline:** "How 20,000+ Dog Owners Fixed *Itching, Ear Gunk & Paw Licking* (Without Another Vet Visit)" (symptoms in orange)
  3. **Subhead:** "No more guessing games. **Here are 8 proven reasons this works when chews don't** 👇" (`id="reasons-anchor"` — the sticky-reveal watches this)
  4. **The 8 reasons** — each: uppercase heading w/ orange number → image (or `BeforeAfter` slider) → body with ONE bolded key phrase (`withBold`) → a proof quote. R1 moisture villain (squish img + caption + Tanya S.), R2 bone-dry/5bn (kitchen sprinkle + Rob C.), R3 paw slider + Chris B. + "70% of the immune system lives in the gut", R4 ear slider + Katie S., R5 skin slider + Caroline L., R6 vet (clinic photo) + Dr Kishan Vara, R7 capsule-open UGC + Jazzy D., R8 **12-up UGC grid** + Dawn L.
  5. Social-proof stat bar after R5 (20,000+ / 4,500+ / 4.8/5)
  6. "What to expect" 90-day timeline (dot timeline, real PDP stages)
  7. Charity "bonus" block (51% to rescue)
  8. Cost-of-inaction line → **mid CTA**
  9. **Offer block** ("Up to 45% off today · with free 48-hour shipping", CTA "Save 45% + Free Shipping →", 90-day guarantee)
  10. Reviews (6 cards) → FAQ (7, accordions) → closing CTA → advertorial disclaimer → **sticky CTA bar** ("Save 45% →", reveals on scroll past `#reasons-anchor`)
- **Reusable components (the bones):** `Cta` (orange CTA, fires tracked `CTAClick` w/ placement), `BeforeAfter`
  (drag/tap before-after slider), `Accordion` (FAQ), `withBold(text, phrase)` (bolds one key phrase in a body),
  `goToProduct(placement)` (fires CTAClick + `withAttribution` → Shopify), the reason renderer (`REASONS[]`
  with `img`/`slider`/`imgCaption`/`bold`/`proof`/`seal` fields), the sticky-reveal `IntersectionObserver`.
- **Tracking:** `src/lib/tracking.ts` — Meta pixel **3813384208943708** (same as store/quiz), fires PageView +
  ViewContent + custom CTAClick; `withAttribution()` appends fbclid/_fbp/_fbc/UTM to the Shopify CTA URL.
  **Pixel only fires in the PROD build** (not dev). Reuse this file as-is on the new page.

## Key decisions this session (don't re-litigate)
- **Comparison table REMOVED.** Rationale (Nick T awareness+sophistication analysis): Sue is
  **solution/product-aware** and the market is **sophistication stage 3-4** → a **new mechanism** (moisture)
  beats an "us vs them" superiority table (a stage-2 lever). The table also caused the hero to "bounce
  between awareness stages." (If ever revisited, A/B it as a *mid-page* block, don't put it back in the hero.)
- **Hero collapsed to a single angle:** headline → subhead → straight into the reasons. Removed the 9pm
  emotional scene, the top CTA and the table. There is now **no CTA in the hero** until the sticky reveals on
  scroll — an early offer-led CTA under the subhead is the one open improvement (see Open items).
- **Mechanism leads on MOISTURE** (self-verifying: you can feel a chew is moist; "baked" is unverifiable).
- **Images:** real hi-res UGC where possible (squish, capsule-open, the 12-dog grid from the image bank) +
  a couple gpt-image-2-generated product shots. Authentic beats studio/AI for Sue.
- **Claim-heavy headlines ("fixed/stopped/gut fix") are on Will's explicit direction.** These are ASA/Meta
  claim risks (supplements *support/help*, never *treat/cure/stop/fix*). Flagged repeatedly; Will accepts the
  risk. Flag once on new work, then respect his call. See [[urgency-policy-and-mentor-reviews]].
- Copy was cut hard (Nick T "Cut the Fat" — every word earns its place); no em dashes anywhere.

---

## THE NEXT TASK — replicate PickPeanut on the GFP bones
Build a **new** page (suggested route `/p/gunky-ears`; new component file e.g. `EarIssuesAdvertorial.tsx`)
that copies **PickPeanut's structure** (`pickpeanut.com/pages/ear-issues-split`) but is written entirely in
GFP's voice from the banks. Reuse the components above.

**PickPeanut's skeleton (captured this session — replicate this flow):**
1. **Thin top SALE BANNER:** "☀️ Early Summer Sale — Save 45% + Free Shipping on your first order".
2. **Curiosity/authority headline** ("N Reasons [vet's] gunky-ear pills keep going viral…") + **ONE
   symptom-loaded sentence** subhead ("fixed gunky, yeasty, waxy, smelly ears for 20,000+ dogs and counting")
   + a "↓ learn more ↓" + a **CTA** + **"Loved by 20,000+ Dogs"** social-proof line.
3. **N reasons, each = a mini-ad:** bold benefit headline → 1-3 short sentences → a **testimonial** → **its
   OWN CTA button** (varying phrasing: "Save 45% + Free Shipping", "End the gunky-ear cycle", "Try risk-free").
   **Trust badges interspersed** between reasons ("100% money-back guarantee", "Ships within 48 hours").
4. **The last reason = the guarantee** (90-day money-back).
5. **A vet quote block** (Dr Kishan Vara MRCVS — the real vet; do NOT AI-fake a person).
6. **Offer = a proper stack:** size selector (Up to 10kg / 11-25 / 26-40 / 40kg+) → tiered **bundles** (they
   run "Buy 3 Get 2 Free" etc.) → per-month pricing → **savings callout** → honest **delivery-date urgency** →
   guarantee/shipping trust row → "Start Now →". Use GFP's REAL tiers (below) — no invented free gifts unless
   Will confirms they exist.
7. **Review carousel(s)** + FAQ.

**Angle note:** PickPeanut's page is **ears-led**. For GFP you can either mirror ears-led (there's strong ear
proof: Murphy before/afters, Katie S., etc.) or keep the broader skin/paws/ears cluster — check with Will
which symptom the paired ad leads on (congruence).

---

## Hard rules / GFP facts to carry over (ground everything in these)
- **Compliance:** support/help, never treat/cure/prevent. (Will overrides on headlines — flag once, respect.)
  Compliant-verb copy elsewhere.
- **Avatar "Sue"** (`company-context/customer-insights/personas.md`): 55-65+ woman, small much-loved dog,
  vet-refugee, **distrusts hype/"actors"**, buys on founder-honesty + reviews; charity *seals* the sale (late,
  not opener). Market **sophistication stage 3-4** → lead with the moisture new-mechanism.
- **Real offer/pricing** (`company-context/products/product-and-range-reference.md`): RRP **£44.99**;
  subscription **30% off first order → £31.49**, then **20%** for life, ships free; **volume: 2 tubs -10%,
  3 tubs -15%** → **"up to 45% off"** is the real max (30%+15% on 3 tubs); **~28p/day**; **90-day money-back**;
  **51% of profits to animal rescue**. Product = **5 Strain Probiotic+** (always full name), 5bn CFU, 5 strains,
  6 enzymes, inulin, made in a UK **human-supplement** factory to GMP, vet **Dr Kishan Vara MRCVS**.
  Social proof: **20,000+ dogs, 4,500+ reviews, 4.8/5**. Testimonials bank:
  `company-context/testimonials/testimonials.md` (use first-name + last-initial; check consent for full names).
- **Honest urgency only** (ASA + Sue): real 45%-off / price-lock / delivery-date / cost-of-waiting. **No fake
  countdowns or "only N left".** See [[urgency-policy-and-mentor-reviews]].
- **Mobile-first (~85% traffic):** build & verify at **390px** via Playwright in `company-context/ad-factory`
  (chromium installed). The in-app preview-pane screenshot is flaky — always use Playwright. See
  [[mobile-first-builds]].
- **Tracking:** reuse `src/lib/tracking.ts`; new page must `initTracking()` + `track("ViewContent", …)` and
  route every CTA through `goToProduct(placement)` so clicks attribute.
- Nick T frameworks live in `company-context/mentors/nick-theriot.md` (quick ref) +
  `mentors/nick-theriot-course-notes/` (deep: awareness + sophistication stages in `advanced-marketing-fundamentals/`).

## Gotchas
- **Dev/preview:** `cd GFP-Landing-Hub && npm run dev -- --port 8091` (8080/8091 often held → Vite falls back).
  For screenshots use a **PROD build**: `npm run build` then `npm run preview -- --port 8090`, and drive it with
  **Playwright run FROM `company-context/ad-factory`** (node fails to resolve `playwright` if run elsewhere).
  The pixel only fires in PROD.
- **Netlify** auto-deploys from `origin/main` (project **gfp-landing-hub**). Deploys take ~1-2 min; a 200 alone
  is not proof (SPA fallback returns 200 for any path) — **poll for the new content** before claiming it's live.
- **Image pipeline:** `company-context/ad-factory` — gpt-image-2 via `/images/edits` (see `scene.mjs`; write a
  small inline `_*.mjs` in ad-factory, run, `rm` it). ⚠️ A **live OpenAI key is committed in
  `ad-factory/.env`** — never push that folder to a remote. Compress page images to ~**1200×900 JPEG q0.85**
  via the canvas-in-Playwright trick. Real UGC lives in `company-context/image-bank/products/ugc/`
  (dogfluencers / jazzy-d / best-barking-behaviour / murphy / chris-and-bear / skin-transformation);
  build a numbered contact sheet to pick images fast. **For a real person (the vet), use a real photo — never AI-fabricate.**
- LF→CRLF git warnings on this repo are harmless.

---

## How to resume fast
1. `cd GFP-Landing-Hub`; read this bridge + `company-context/CLAUDE.md` + `guides/writing-copy.md`
   (and `products/science-behind-probiotics.md` before touching the mechanism).
2. Open `src/pages/EightReasonsAdvertorial.tsx` — the component bones to copy.
3. Fetch PickPeanut once (`pickpeanut.com/pages/ear-issues-split`) if you want the live layout again
   (in-app browser: `preview_start` with the url → `get_page_text` / mobile screenshot).
4. Build the new page from the bones + PickPeanut skeleton + GFP banks. Verify at 390px via Playwright. Push.

## ▶️ START PROMPT for the next session (paste this)
> Build a new GFP advertorial page that replicates the **structure** of
> `pickpeanut.com/pages/ear-issues-split` using the component **bones** of the existing `/p/8-reasons`
> page (`src/pages/EightReasonsAdvertorial.tsx`). **Read `SESSION-BRIDGE.md` first.** Create a new route
> (e.g. `/p/gunky-ears`) and a new component file. Copy PickPeanut's **skeleton** — top sale banner →
> curiosity headline + one-line symptom subhead + "Loved by 20,000+ dogs" + CTA → N reasons where **each
> reason has its own CTA + a testimonial**, with trust badges interspersed → guarantee reason → vet block →
> a **bundle/size-selector offer** with honest delivery/urgency → review carousel → FAQ. Write **all copy as
> GFP/Sue-grounded** from `company-context/` (no PickPeanut copy, no invented gifts/offers; real pricing:
> up to 45% off + free shipping + 90-day guarantee). Reuse `Cta` / `BeforeAfter` / `Accordion` / `withBold` /
> `goToProduct` / `src/lib/tracking.ts` / the sticky bar. Keep the hard rules (compliance flag on claim-heavy
> lines, honest urgency only, no em dashes, **mobile-first — verify at 390px via Playwright in
> `company-context/ad-factory`**). Get a PROD preview up and show me a 390px screenshot. Leave the current
> `/p/8-reasons` untouched.
