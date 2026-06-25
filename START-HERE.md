# START HERE — session bridge

This file bridges the planning conversation (done in a different folder) into this
project's own Claude Code session. Read this first, then read `CLAUDE.md` for the full plan.

## Current state (as of handoff)

- ✅ Project scaffolded: Vite + React 18 + TypeScript + Tailwind. Separate git repo, first commit made.
- ✅ Dependencies installed (`npm install` done).
- ✅ Dev server confirmed working — `npm run dev` serves the placeholder page at http://localhost:8080.
- ⛔ Nothing built yet beyond the placeholder `src/App.tsx`. No Supabase, no AI, no components.

The owner is **non-technical** and new to the terminal. Explain plainly, work in small
reviewable steps, and don't assume terminal fluency.

## What we're building (one line)

An AI advertorial/landing-page generator: upload an ad creative + a competitor landing-page
URL, set brand guidelines once, and one-shot generate an on-brand advertorial (with a
Shopify buy box) for Meta-ad traffic, served on the brand's own subdomain.

Full decisions, architecture, data model, and pipeline are in **`CLAUDE.md`** — read it before building.

## First task for this session

Follow the build order in `CLAUDE.md`. Start at the renderer (no AI yet):

1. Confirm the app runs (`npm run dev`).
2. Add routing: admin console at `/`, public landing page at `/p/:slug`.
3. Build the 8 fixed section components (`Hero`, `ProblemAgitate`, `Mechanism`, `Proof`,
   `Offer`, `FAQ`, `FinalCTA`, sticky `BuyBox`) and render them from a hardcoded sample
   `landing_pages` JSON object — so we can see a full sample advertorial before wiring up AI.

## Suggested first message to send this session

> Read START-HERE.md and CLAUDE.md, confirm the dev server runs, then start on the build
> order: add routing and build the 8 section components against a hardcoded sample page JSON.
