# GFP Landing Hub

AI advertorial / landing-page generator. You upload an ad concept and a competitor
landing page, set your brand guidelines once, and it generates an on-brand landing
page (with a Shopify buy box) for your Meta-ad traffic — served on your own subdomain.

This is a **separate project** from `clever-logistics-pal`. They share no code or history.

## Getting started (run these in your own terminal)

From inside this folder (`C:\Users\will\GFP-Landing-Hub`):

```sh
npm install      # one time — downloads dependencies
npm run dev      # starts the dev server at http://localhost:8080
```

Open http://localhost:8080 in your browser — you should see the placeholder page.

## Working on it with Claude Code

Open a **new Claude Code session in this folder** (not the logistics one). The very
first thing to do is read `CLAUDE.md` — it has the full plan and every decision we've
already made, so the new session has all the context it needs.

A good first message to that session:
> Read CLAUDE.md, then run npm install and confirm the dev server works. After that,
> start on the build order: build the 8 section components against sample data.

## Where things are

- `CLAUDE.md` — the full project brief, architecture, and build order. **Start here.**
- `src/` — the React app (admin console + public page renderer will live here).
- `supabase/` — edge functions + DB (to be added).
