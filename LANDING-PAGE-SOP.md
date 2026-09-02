# Landing Page SOP - GFP-Landing-Hub

How we build a new advertorial landing page that is **on-brand, professional, mobile-first and high-converting**, and ship it without breaking anything.

This is the operational build guide. It supersedes ad-hoc practice. It pairs with:
- `CLAUDE.md` (this repo - architecture + locked decisions)
- `company-context/` (the brand brain - voice, personas, proof, compliance)
- The two reference pages already live and proven: `src/pages/EightReasonsAdvertorial.tsx` (`/p/8-reasons`) and `src/pages/FiveReasonsAllergyAdvertorial.tsx` (`/p/5-reasons`).

> **The one rule that keeps pages on-brand:** the design system lives in **files, not prompts**. Every new page inherits the same tokens, components and copy rules by importing them, not by re-describing them. When you find yourself re-typing "orange is #EF3824", stop and import it instead. (This is the single most-repeated lesson across every external source in the research below.)

---

## 0. The 60-second checklist

Building a new page? Do these in order. Each links to a section.

1. **Ground it** - open `company-context`, read the persona + matching guide + the banks. Never write copy from memory. [§1]
2. **Write the brief** - audience, one goal, awareness stage, sections, reference URL. [§1]
3. **Clone the bones** - copy an existing page component, keep the shared helpers + tokens. [§2, §3]
4. **Fill the section kit** - hero, mechanism, proof, comparison, offer, FAQ, sticky CTA. [§4]
5. **Write the copy** - Nick Theriot craft, real proof only, compliant claims, no em dashes, honest urgency. [§5]
6. **Use real images** - dog-first UGC / before-afters, never stock-clinical, never fabricated. [§6]
7. **Wire the route + tracking** - one line in `App.tsx`; tracking is inherited from `tracking.ts`. [§3, §9]
8. **Verify at 390px** - build, Playwright screenshot, check broken images + console. [§7]
9. **Ship clean** - build, isolated commit, push, poll the LIVE page for your content (not a 200). [§8]
10. **Test it** - drop into Intelligems vs the PDP on cold traffic; watch PostHog. [§10]

---

## 1. Ground it before you build (non-negotiable)

The fastest way to an off-brand page is starting from a blank prompt. Both the research and our own rules say the same thing: **specific brief in, converting page out; vague brief in, generic page out.**

**Load the brand brain first.** Per `company-context/CLAUDE.md`, before writing any landing-page copy:
- Read `customer-insights/personas.md` - almost every GFP page speaks to **"Sue"**. Lead with the visible symptom (paw licking / itchy skin / gunky ears), not "gut health".
- Read the matching guide in `company-context/guides/` (writing-copy, ad-concepts).
- Pull real proof from the banks: `testimonials/`, `messaging-bank.md`, `image-bank/`, `products/`. **Never fabricate a testimonial, stat, before/after or price. That is the one hard line.**
- Skim `compliance-and-claims.md` - it is a risk radar, not a gate. Write the strong version, flag known ad-policy risk in one line, leave the copy for Will to approve.

**Then write a one-paragraph brief** (keep it in the PR / commit message or a comment):
- **Who** - the exact avatar and where they are in life right now (Sue, dog scratching for months, tried creams/drops/vet, out of ideas).
- **One goal** - click through to the PDP. One primary action, repeated. Competing CTAs kill conversion.
- **Awareness stage** (Nick Theriot) - cold/problem-aware needs the education-heavy advertorial; warm/product-aware can go lighter. This dictates length.
- **Sections** - the section order (use the kit in §4).
- **Reference** - if replicating a competitor page, capture its **structure and persuasion sequence only**, never its copy. (We did exactly this for `/p/5-reasons` from a Wuffes page - borrowed the layout, wrote all GFP copy.)

---

## 2. The brand system (how we keep it on-brand)

### The tokens (canonical for landing pages)
These are the exact constants both live pages use. Brand red matches the official swatch in `company-context/visual-identity.md`; the navy and cream are the tuned landing-page variants (see the drift note below).

| Token | Hex | Use |
|---|---|---|
| `ORANGE` | `#EF3824` | **CTAs and small accents only.** The one action colour. Official brand red. |
| `NAVY` | `#16223C` | Secondary blocks, dark cards, stat bars, sale banner. |
| `INK` | `#1C1C2E` | Headings. |
| `BODY` | `#4B4B4B` | Body text. |
| `MUTE` | `#8A8A8A` | Captions, sublines, bylines. |
| `CREAM` | `#FBF6F1` | Page background, cards. |

**Fonts:** `Poppins` (700/800) for display + headings + buttons; `Inter` (400/500/600/700) for body. Loaded per-page from Google Fonts in the mount effect. Class `.adv-display` = Poppins 800, `.adv-heading` = Poppins.

**Logo:** `/lp/logo-brand.png` (red wordmark on cream/white). **Favicon:** the square orange "g" (`/logos/gfp-favicon-32.png` + 180 + 500, wired in `index.html`).

**Colour discipline (the rule that makes it look intentional):** orange is *only* for CTAs and tiny accents. Everything else structural is navy on cream. One action colour is what separates a professional page from a rainbow.

### The golden rule: tokens and components live in files

The strongest finding across every external source (OpenDesign, Anthropic, MindStudio) is: **move the design system out of prompts and into files the agent reads, so every page inherits the same type scale, colours and components automatically.**

- ✅ **Do:** import shared tokens + shared section components. A new page should not re-invent a button.
- ❌ **Don't:** re-describe the palette in a prompt, or eyeball a "close enough" navy.

> **Known debt to fix (do this next time you touch both pages):** right now each page **re-declares** `ORANGE/NAVY/INK/...` as local `const`s at the top of the file. That is duplication and it *will* drift. Extract them once into `src/lib/brand.ts` (tokens) and lift the shared pieces (`Cta`, `Stars`, `BeforeAfter`, `Accordion`, `Check`) into `src/components/advertorial/`. Then every new page imports one source of truth. This is the highest-leverage on-brand improvement available.

> **Swatch drift to reconcile:** `visual-identity.md`'s official swatch lists navy `#282C5F` and cream `#F3EDE5`; the pages use `#16223C` / `#FBF6F1`. Both live pages agree with each other, so they are internally consistent, but they are a tuned variant of the official swatch. Pick one canonical set (page variant or swatch) and put it in `brand.ts`. Do not add a third.

---

## 3. Page architecture (how a page is wired)

A landing page is **one self-contained React component + one route**. No backend, no buy box (CTAs deep-link to Shopify).

1. **Component:** `src/pages/<Name>Advertorial.tsx`. Start by copying the closest existing page so you inherit the shared helpers, tokens, tracking init and structure. Self-contained is fine and intentional for these bespoke pages.
2. **Route:** add one line in `src/App.tsx` **above** the `/p/:slug` catch-all:
   ```tsx
   <Route path="/p/<slug>" element={<YourPage />} />
   ```
3. **Tracking is inherited, not rebuilt.** In the mount `useEffect`: load fonts, set `document.title`, call `initTracking()`, fire `track("ViewContent", ...)`. Every CTA goes through a `goToProduct(placement)` that calls `track("CTAClick", ...)` then `window.location.href = withAttribution(PRODUCT_URL)`. Do not hand-roll pixels. See §9.
4. **`PRODUCT_URL`** is the live Shopify PDP (`https://goodforpets.co/products/5-strain-probiotic`). Every CTA points there.

Deploy is automatic: push to `main`, Netlify builds and serves at `hello.goodforpets.co/p/<slug>`.

---

## 4. The section kit (the structure that converts)

Our proven advertorial-listicle blueprint, mobile-first, top to bottom. It matches what every external source lists as high-converting (hero -> benefits -> proof -> objection handling -> offer -> FAQ -> repeated CTA) but is tuned for GFP with real mechanisms and proof.

| Order | Section | Job | Component in repo |
|---|---|---|---|
| 1 | **Honest sale banner** | Real offer, no fake countdown | inline navy bar |
| 2 | **Editorial hero** | Vet/verified byline + benefit headline + emotional opening + **dog-first image** | inline |
| 3 | **Early CTA** | Catch the already-warm; sticky watches it via IntersectionObserver | `<Cta>` + `#top-cta` |
| 4 | **Mechanism** ("why this works") | Suppress-vs-settle-at-the-source; the education a cold visitor needs | inline |
| 5 | **Reasons / benefits** | Distinct persuasive moves, not a feature list | inline `REASONS` map |
| 6 | **Proof** | Interactive before/after sliders + real review slider + stat bar | `<BeforeAfter>`, `<ReviewSlider>` |
| 7 | **Ingredients** | Icon + name + dose accordion (bacteria icons + `inulin.png`) | `<IngredientRow>` |
| 8 | **Comparison** | Us vs a cheap chew: stat cards (e.g. 20x / 5 strains / 54% cheaper) + 2-col ✓/✗ | inline |
| 9 | **Timeline** | Honest Day 7 / 30 / 90, cuts "3 months in, still waiting" churn | inline `TIMELINE` |
| 10 | **Charity closer** | 51% to rescue - Sue's closer, near the offer, never the opener | inline navy card |
| 11 | **Offer card** | Product + bullets + big CTA + trust list + per-day price | inline |
| 12 | **FAQ** | Accordion that kills objections (safety, timing, fussy dogs, breeds) | `<Accordion>` |
| 13 | **Closing CTA + disclaimer** | Final push + the advertorial disclaimer | `<Cta>` + inline |
| 14 | **Sticky CTA bar** | Single full-width CTA, revealed after the top CTA scrolls off | inline, IntersectionObserver |

**Rules of thumb:**
- **One primary action.** Every CTA is the same offer to the same PDP.
- **Wireframe/structure first, polish second.** The structure is usually right on the first pass; spend refinement on copy clarity and CTA specificity, not layout.
- **Scannable.** Short paragraphs, a bolded key phrase per block (`withBold`), headings, no walls of text.

---

## 5. Copy rules (Nick Theriot + GFP compliance)

Grounded in `company-context/mentors/theriot-fb-ad-copy-sop.md` and `weekly-calls-highlights/copywriting.md`. The advertorial is the deliberate long-form exception to the 125-char ad rule.

- **Open on emotion + failed solutions.** Lead with where Sue is: "You've tried the creams. The drops. Maybe the steroids from the vet." Then the curiosity turn (the gut mechanism). Do **not** open on a feature dump.
- **Cut the fat.** Read it aloud; every word earns its place. Short sentences. Mobile hates long paragraphs.
- **Desired-state specifics over broad claims.** "No paw licking at all after three weeks", not "improves comfort". Kill "game-changer", "life-changing".
- **Each line earns the next.** Hook -> subhead -> first line -> next line.
- **Real proof only.** Testimonials, before/afters, stats and prices come from the banks. Fabrication is the one hard line.
- **Compliant claims by default** (support/help, not treat/cure/prevent), and the mechanism is gut -> immune -> skin (a balanced gut calms the over-active immune response and keeps yeast in balance; it does **not** kill yeast). Will can choose a stronger claim; flag the ASA/Meta risk once, then respect his call.
- **Comparative claims** ("20x stronger", "54% cheaper per serving") must be substantiable if challenged. Use them when directed, flag the substantiation need once.
- **No em dashes anywhere in copy.** Use commas or full stops. (`sed -i 's/—/-/g'` if any sneak in.)
- **Honest urgency only.** Real 45%-off + free shipping, cost-of-waiting, genuine volume savings. **No fake resetting countdowns or invented "today only" scarcity** - it breaches ASA, repels Sue, and Nick T says fake timers destroy trust.

---

## 6. Imagery

- **Dog-first, real, native.** Prefer real customer UGC (a happy dog + the tub) and real before/after photos over polished stock or clinical product shots. `public/lp/` holds the vetted set (`ugc-1..5`, `paw-before/after`, `bear-*`, `ear-*`, `vet-kishan`, bacteria icons).
- **Never fabricate** a before/after or a customer.
- **Optimise.** Image-bank originals are huge (up to 10MB). Re-encode to <=1400px JPEG ~q0.82 before use (canvas-via-Playwright trick; there is no ImageMagick on this machine). Slow images kill conversion and skew the split test.
- **Crop deliberately.** Match the aspect to the source (portrait UGC -> `aspect-[4/5]`), set `objectPosition` so the dog's face survives the crop.

---

## 7. Mobile-first build and verify (~85% of traffic is mobile)

Build and **prove it at 390px** before it is done. Never ask Will to check manually; verify and show proof.

1. `npm run build` - catches TS errors. Must be clean.
2. Screenshot at **390px** with Playwright from `company-context/ad-factory` (chromium is installed there; run node **from that folder** or the module won't resolve). Full-page + the sections you changed.
3. In the same script, assert: **no broken images** (`naturalWidth > 0` for every `/lp/` img), **no console/page errors**, and check the H1 / key copy is present.
4. Fix anything, re-shoot. Tap targets >= 44px. No horizontal scroll. Ingredient/label rows must not wrap to 3 lines.
5. The in-app browser preview screenshot is flaky; Playwright is the source of truth for visuals.

---

## 8. Ship discipline (build -> verify -> isolated commit -> push -> confirm LIVE)

- **Only commit your own files.** This repo often carries **another session's uncommitted work** (a refactor moving 8-reasons copy into `src/data/eightReasonsContent.ts`, plus `PetWellnessTodayArticle.tsx` / `chewExposeContent.ts` and an `App.tsx` `/read` route). If you `git add` App.tsx blindly you can commit an import to a file that is not in the commit and **break the Netlify build for the whole hub.** Stage explicitly, check `git diff HEAD --cached --stat`, commit, and leave everything else untouched.
  - **The fork trap:** the live 8-reasons page uses **inline** copy; the working tree has the **data-file** version. To edit 8-reasons copy safely: back up the working-tree file, `git checkout HEAD -- <file>`, edit the inline version, commit only that, restore the backup, then mirror the same edit into `eightReasonsContent.ts` so it will not regress. (Reconciling this fork once - committing the data-file refactor + PetWellness together, or discarding it - removes this dance.)
- **A 200 is not proof.** The SPA fallback returns 200 for any path. **Poll the LIVE page for your actual content** (a distinctive new string present AND the old string gone). Bundle-hash polling has misled us - verify content, not the hash.
- **Netlify** auto-deploys from `main`, usually live in 1-2 minutes. Confirm with the real browser reading the rendered element, not just curl.

---

## 9. Tracking checklist (inherited from `src/lib/tracking.ts`)

Every page gets all of this for free by using the shared helpers. Confirm it fires:
- **Meta Pixel** `3813384208943708` - PageView on load, `ViewContent` on mount, `CTAClick` per placement. PROD-only.
- **PostHog** (project `phc_rKDMS99...`) - autocapture, `$pageview`, heatmaps, session replay, web vitals, scroll depth. PROD-only, loaded async off the critical path.
- **Intelligems tag** in `index.html` (`cdn.intelligems.io/esm/b7dd0f2b35f8/bundle.js`) - required so a redirect-test arm on this subdomain is counted. Register the subdomain in Intelligems too.
- **Attribution passthrough** via `withAttribution()` on every CTA: forwards `utm_*`, `fbclid`, `_fbp`/`_fbc`, Intelligems `igTg`/`igId`, and the PostHog `ph_did` to the Shopify URL so the eventual purchase stitches back.
- **Note:** actual purchases are NOT in PostHog (checkout is a different domain). Sales conversion lives in Intelligems / Meta Ads Manager / Shopify. Don't report on-page CTR as "conversion".

---

## 10. Test and iterate (don't publish and walk away)

"Generating a page fast is the problem" - the win is in the optimisation after.
- **Split-test it** in Intelligems, ideally the advertorial vs a straight PDP on **pure cold prospecting traffic**. Judge on **profit-per-visitor**, not CVR alone (AOV differs).
- **Run to significance.** Under ~200 visitors / a few orders per arm is "not enough data" - don't call a winner.
- **Read the heatmaps** (PostHog) - where CTAs get tapped, where scroll depth collapses, dead clicks. Move the close above where scroll dies.
- **A/B the obvious levers** post-launch: headline, hero image, CTA wording, offer framing.

---

## 11. Pitfalls (the checklist of ways it goes wrong)

- Competing CTAs / multiple offers -> dilutes the one action.
- Fabricated testimonials, before/afters, stats, prices -> the hard line, never.
- Feature-dump hero -> open on Sue's problem instead.
- Fake countdown / invented scarcity -> ASA breach + kills trust.
- Em dashes in copy -> banned.
- Stock/clinical imagery -> use real dog-first UGC.
- Unoptimised 10MB images -> slow page, skewed test.
- Re-describing the palette per prompt -> drift; import tokens.
- Committing App.tsx blindly -> can break the whole hub build (see §8).
- Reporting on-page CTR as "conversion" -> the sale is off-domain.
- Publishing without a 390px pass and a LIVE content check.

---

## Sources

External research (Sept 2026) that informed this SOP:
- [GemPages - How To Build a Landing Page With Claude Code](https://gempages.net/blogs/shopify/build-landing-page-with-claude-code)
- [The Rundown - Design a High-Converting Landing Page in Claude](https://app.therundown.ai/guides/how-to-design-a-high-converting-landing-page-in-claude-design)
- [OpenDesign - How to Use Claude Code for Frontend Design (2026)](https://open-design.ai/blog/how-to-use-claude-code-for-frontend-design/)
- [Anthropic - Set up your design system in Claude Design](https://support.claude.com/en/articles/14604397-set-up-your-design-system-in-claude-design)
- [MindStudio - Build a Brand Design System with Claude Design](https://www.mindstudio.ai/blog/how-to-build-brand-design-system-claude-design)
- YouTube walkthroughs reviewed: "Build High Converting Landing Pages With Claude" (Miguel Johnson), "I Used Claude Code to Build a Sales Page That Actually Converts", "How to Build Landing Pages With Claude Code (No Coding)".

Internal references (the real source of truth):
- `CLAUDE.md`, `company-context/` (personas, guides, banks, compliance, visual-identity, mentors/nick-theriot).
- Proven pages: `src/pages/EightReasonsAdvertorial.tsx`, `src/pages/FiveReasonsAllergyAdvertorial.tsx`.
- `src/lib/tracking.ts` (the tracking + attribution the whole hub shares).
