# GFP Landing Hub — Project Briefing (for strategic direction)

> Paste this whole file into Claude to get help steering the project. It explains
> what the software is, how it works, what's built, and — most importantly — the
> core problem it does **not** yet solve: producing pages that are **visually**
> near-identical to high-performing competitor advertorials.

---

## 1. TL;DR

An **AI advertorial / landing-page generator** for a single DTC e-commerce brand
(**Good For Pets**, UK dog supplements, hero product "5 Strain Probiotic+"). The
owner pastes a **competitor advertorial URL**; the app generates an **on-brand
advertorial** that mirrors the competitor's structure, written in the brand's
voice using the brand's own product/customer/proof knowledge, with the brand's
real images, reviews, fonts, colours and logo, plus a Shopify buy box.

**Traffic flow it serves:** Meta ad click → advertorial landing page (this app,
own subdomain) → Shopify checkout.

**The pitch:** one-shot generate high-converting, on-brand, Meta-policy-compliant
advertorials by modelling proven competitor pages — replacing slow manual builds
and Replo.

**The unsolved core problem:** it mirrors *loose structure* and writes good copy,
but it does **not visually replicate** the competitor's design. Output looks like
"our generic template," not "their page." The owner needs pages that are
**incredibly visually similar** to the (high-performing) competitor — and they're
currently far from that bar.

---

## 2. Who / context

- **Owner is non-technical.** Prefers clear explanations, safe defaults, small steps.
- Built with Claude Code over many sessions. Hosted on the brand's own subdomain
  (decision: max creative control; not Replo, not Shopify native pages).
- Single brand today, but the app is **multi-brand capable**.

---

## 3. What makes it unique (the intended moat)

1. **Competitor structural mirroring with original, compliant copy.** It's
   deliberately built so it copies *structure and persuasive beats*, never the
   competitor's literal words (copyright + Meta duplicate-copy safety). A two-pass
   design enforces this (see pipeline below).
2. **Deep brand grounding ("Context Hub").** Generation reads uploaded knowledge
   docs — a Product Knowledge doc, a Customer Avatar doc, an Objection & Proof
   Bank, and a Quote/Review Bank — plus an **allowed-claims list and a NEVER-SAY
   guardrail** so copy stays truthful and Meta-compliant (no invented stats, no
   cure/treat language).
3. **Real assets, auto-placed.** An **AI-captioned image library** (Claude vision
   captions + tags every uploaded image: product/vet/dog/before-after/ugc/etc.) and
   a **reviews library** (real customer reviews with their linked photos). The
   generator drops the right review photo next to the right quote, and matches
   images to sections by tag/caption — leaving labelled placeholders where nothing
   fits.
4. **Live Shopify pricing** — pulls products, variants AND subscription ("Subscribe
   & Save") prices straight from the storefront (no Shopify app/token needed),
   country-locked so prices are correct.
5. **Brand kit** — fonts (Google Fonts), colours, logos, voice/tone, allowed/banned
   claims, all applied automatically via the renderer.

---

## 4. Tech architecture

- **Frontend:** Vite + React 18 + TypeScript + Tailwind + React Router.
  - Admin console at `/` (gated by owner login), generator at `/new`, brand/Context
    Hub at `/hub`, public renderer at `/p/:slug`.
- **Backend:** Supabase — Postgres, Storage (public `brand-assets` bucket), Auth
  (single owner login), and Deno **Edge Functions**.
- **Database tables:** `brand_kits` (brand identity + fonts/colours/logos/images/
  allowed_claims/banned_words/store_domain), `landing_pages` (slug, status, section
  JSON, buy_box), `knowledge_docs` (Context Hub), `reviews`, `ad_assets`,
  `page_events`.
- **Edge functions:**
  - `generate-page` — the engine (below).
  - `analyze-image` — Claude vision: captions + categorises an uploaded image.
  - `list-products` — reads the store's public product JSON (variants + selling
    plans) for the buy box.
  - `scrape-reviews` — pulls photo reviews from a page.
- **Models:** Claude **Opus 4.8** for generation, **Haiku 4.5** for extraction/
  captioning. Anthropic API key stored as a Supabase function secret.
- **Rendering:** pages are stored as **structured section JSON** (NOT raw HTML) and
  rendered by a fixed library of ~13 React "block" components, themed per-brand via
  CSS variables (colours/fonts/logo).

### The 13 fixed section/block components
`hero`, `problemAgitate`, `mechanism`, `proof` (stats + reviews), `offer`,
`faq`, `finalCta`, `richText` (heading + paragraphs), `imageText` (image beside
text), `comparison` (us-vs-them table), `beforeAfter` (two image slots), `quote`
(testimonial + photo), `image` (standalone). Each has fixed styling + image
"slots" that render a real image or a labelled "upload here" placeholder.

---

## 5. The generation pipeline (how it works today)

1. **Fetch** the competitor URL's HTML server-side.
2. **Deterministic structural skeleton** — parse the HTML into an ordered token
   stream: heading text (`[H1]`/`[H2]`), image markers (`[IMG]`), and paragraph
   **length** markers (`p(20)` = ~20-word paragraph). Note: it captures paragraph
   *lengths and image positions*, and headings, but **deliberately NOT the
   competitor's body copy** (anti-plagiarism).
3. **Pass 1 (Haiku)** — turn the skeleton into a "block plan": for each logical
   section, a `{type, theme (abstracted, in its own words), image position,
   paragraph word-counts}`. Plus a `format` ("Listicle: 5 reasons + FAQ") and a
   `titlePattern`. Rules: mirror the skeleton 1:1 (same count/order/image
   placement), group FAQ into one block, don't add/remove sections.
4. **Pass 2 (Opus)** — WITHOUT ever seeing the competitor's text, write the page by
   emitting the 13-component section JSON, following the plan exactly. It is fed:
   the plan, the brand voice + allowed claims + NEVER-SAY rules, the **Context Hub
   docs**, the **image library** (url+tag+caption), the **reviews** (author+body+
   photo), and the buy box. It writes punchy original copy, matches paragraph
   lengths, and places real images/reviews by match (placeholder otherwise).
5. **Render** the section JSON via the brand-themed component renderer; owner can
   preview, then Save/Publish to `/p/:slug`.

**Why the two passes:** Pass 1 sees competitor text but only outputs an abstracted
structural plan; Pass 2 writes from brand material and never sees competitor copy.
So it mirrors *layout + persuasion structure* while guaranteeing *original words*.

---

## 6. What's built and working

- ✅ Renderer + the 13 flexible block components + image placeholders
- ✅ Brand kit: voice, allowed/banned claims, fonts (Google Fonts), colours, logos,
  visual-style notes, store domain — multi-brand
- ✅ Image library with **AI vision captioning + auto-tagging**
- ✅ Reviews library (scrape + JSON import, photos linked per review)
- ✅ Context Hub: 4 loaded knowledge docs (product, customer, objection, review bank)
- ✅ Live Shopify product/variant/subscription pricing in the buy box
- ✅ Owner login, Save/Publish, public renderer with sticky Shopify buy bar
- ✅ Generator that mirrors a competitor's loose structure + writes on-brand,
  Meta-compliant copy + places real images/reviews
- ✅ Recent visual pass: real fonts (Poppins), tighter spacing, punchy copy,
  object-cover images, bigger logo

**Not yet built:** a light visual editor (tweak/reorder/delete blocks, swap images
before publishing); Meta Pixel + fbclid/UTM passthrough; subdomain deploy.

---

## 7. THE CORE PROBLEM (what to help me with)

**The output is structurally similar but visually generic. It does not look like
the competitor's page, and nowhere near the polish/conversion level of a real
high-performing advertorial.**

### Why — the honest technical reasons
1. **It never SEES the page.** The engine only parses the **HTML text skeleton**
   (headings, paragraph lengths, image positions). It has **no model of the
   competitor's actual visual design**: colour blocking, section backgrounds,
   imagery style/treatment, typographic hierarchy and scale, spacing rhythm,
   badges/icons/trust marks, button styles, card designs, dividers, the "feel."
2. **Fixed, brand-generic component library.** Every page is assembled from the
   same ~13 styled React components. So output always looks like *our template*,
   re-skinned with brand colours — it **cannot reproduce a competitor's bespoke
   visual design**. Two very different competitor pages come out looking similar.
3. **No real design fidelity inputs.** It doesn't capture the competitor's computed
   styles (fonts, colours, section background colours, image aspect ratios, spacing)
   or a screenshot to anchor the look.
4. **Structure matching is "loose."** It mirrors section order, image positions and
   paragraph lengths approximately, but not section *designs* (e.g. a numbered
   reason rendered as a coloured card with an icon vs our plain heading+paragraph).

### What "good" looks like to the owner
Paste a competitor advertorial → get a page that is **incredibly visually similar**
(same look and feel, section designs, imagery treatment, polish) — just with our
brand, product, copy, images and compliance. High-converting, not generic.

---

## 8. Key tension / locked decision that may need revisiting

A **locked early decision** was: *"template + light visual editor; the LLM fills
fixed on-brand React section components; do NOT generate raw freeform HTML"* (for
brand consistency + safety + a simple editor). **This is exactly what now limits
visual replication.** True visual cloning likely needs more flexible rendering than
a fixed template allows. The central strategic question:

> **How do we get genuine visual fidelity to arbitrary competitor designs without
> losing brand consistency, Meta-policy safety, editability, and a non-technical
> owner's ability to manage it?**

### Options to weigh (please pressure-test / extend these)
- **Add true visual analysis:** render the competitor page (headless browser /
  screenshot) and use **Claude vision** to extract a design spec — palette, section
  designs, imagery style, type hierarchy, spacing, components (cards/badges/icons) —
  and also scrape **computed styles**. Feed that into generation.
- **Richer, more configurable design system:** expand beyond 13 fixed components to
  a larger kit with **style variants + per-section design tokens** (background
  colour, layout pattern, card style, icon, image treatment) the generator sets per
  block — closer to cloning a design without freeform HTML.
- **Revisit the "no freeform HTML" rule:** allow constrained, sanitised, themeable
  layout output (a layout DSL or a vetted component-with-props schema) so the model
  can reproduce arbitrary section designs while staying safe/editable.
- **Design-token transfer:** pull the competitor's colours/fonts/spacing/section
  backgrounds and apply *our brand* equivalents systematically.
- **Reference-image conditioning:** give the model a screenshot of each competitor
  section as a visual target while it builds the matching brand block.

### Constraints to respect
- Non-technical owner; safe defaults; small reviewable steps.
- Meta ad-policy + copyright safety (original copy, approved claims, NEVER-SAY).
- Brand consistency (it must still look like Good For Pets).
- Editable output + fast public pages (paid traffic).
- Stack: React/Vite + Supabase edge functions + Claude (Opus/Haiku).

---

## 9. Good questions for the strategist (you) to answer

1. What's the highest-leverage path to visual fidelity given the constraints —
   vision-driven design spec, a richer token-based design system, or relaxing the
   no-freeform-HTML rule (and how to keep it safe/editable)?
2. How should "visual similarity" be defined and measured so we know we've hit it?
3. What's the minimal change that gets 80% of the visual lift?
4. Does the fixed-component approach need replacing, augmenting, or just enriching
   with variants + design tokens?
5. How do we balance "looks like the competitor" with "looks like our brand"?
