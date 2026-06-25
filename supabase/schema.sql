-- GFP Landing Hub — database schema
-- ---------------------------------------------------------------------------
-- HOW TO RUN THIS (non-technical, ~2 minutes):
--   1. Open your project at https://supabase.com/dashboard
--   2. Left sidebar → "SQL Editor" → "New query"
--   3. Paste this whole file in, click "Run"
--   4. You should see "Success. No rows returned" — that's correct.
-- Re-running is safe (it uses IF NOT EXISTS / CREATE OR REPLACE).
-- ---------------------------------------------------------------------------

-- Brand kits: the once-set visual + voice identity reused across every page.
create table if not exists public.brand_kits (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  name          text not null,
  wordmark      text not null default '',
  logo_url      text,
  -- { primary, onPrimary, accent, background, text, muted }
  colors        jsonb not null default '{}'::jsonb,
  -- { heading, body }
  fonts         jsonb not null default '{}'::jsonb,
  -- Free-text voice/tone guidance for the generator.
  voice         text not null default '',
  -- Meta ad-policy safety: only claims on this list may appear on a page.
  allowed_claims text[] not null default '{}',
  -- Words the brand never uses.
  banned_words   text[] not null default '{}',
  -- Default Shopify destination for the buy box (deep-links into checkout).
  default_product_url text not null default '',
  source_website_url  text  -- where we scraped the brand kit from, if any
);

-- Landing pages: one row per advertorial. All live under this one hub at /p/<slug>.
create table if not exists public.landing_pages (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  slug          text not null unique,
  status        text not null default 'draft'
                  check (status in ('draft', 'published')),
  title         text not null,
  brand_kit_id  uuid references public.brand_kits(id) on delete set null,
  -- The structured section JSON our React components render (see src/types/page.ts).
  sections      jsonb not null default '[]'::jsonb,
  -- { productName, price, compareAtPrice, ctaLabel, productUrl }
  buy_box       jsonb not null default '{}'::jsonb,
  competitor_url text,
  source_ad_asset_id uuid
);

-- Uploaded ad creatives (the image/video lives in Supabase Storage; this row is metadata).
create table if not exists public.ad_assets (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  storage_path  text not null,            -- path within the 'ad-assets' storage bucket
  kind          text not null default 'image' check (kind in ('image', 'video')),
  -- Claude's vision analysis: { hook, angle, coreClaim, audience, tone }
  analysis      jsonb
);

-- link landing_pages → ad_assets now that both tables exist
do $$ begin
  alter table public.landing_pages
    add constraint landing_pages_source_ad_asset_fk
    foreign key (source_ad_asset_id) references public.ad_assets(id) on delete set null;
exception when duplicate_object then null;
end $$;

-- Page analytics (view + CTA-click tracking). Wired up later (milestone 8).
create table if not exists public.page_events (
  id              bigint generated always as identity primary key,
  created_at      timestamptz not null default now(),
  landing_page_id uuid references public.landing_pages(id) on delete cascade,
  type            text not null check (type in ('view', 'cta_click')),
  meta            jsonb not null default '{}'::jsonb  -- fbclid, utm, referrer, etc.
);

create index if not exists idx_landing_pages_slug on public.landing_pages(slug);
create index if not exists idx_page_events_page on public.page_events(landing_page_id);

-- ---------------------------------------------------------------------------
-- Row-Level Security (RLS)
-- Security model: the browser (anon key) can ONLY READ published pages + their
-- brand kits. Every write (generate, publish, edit) goes through an edge function
-- using the secret service-role key, which bypasses RLS. So nothing on the public
-- internet can modify your data — it can only view live pages.
-- ---------------------------------------------------------------------------
alter table public.brand_kits   enable row level security;
alter table public.landing_pages enable row level security;
alter table public.ad_assets    enable row level security;
alter table public.page_events  enable row level security;

-- Anyone can read PUBLISHED landing pages (this is the public renderer).
drop policy if exists "public reads published pages" on public.landing_pages;
create policy "public reads published pages"
  on public.landing_pages for select
  using (status = 'published');

-- Anyone can read brand kits (needed to theme a published page).
drop policy if exists "public reads brand kits" on public.brand_kits;
create policy "public reads brand kits"
  on public.brand_kits for select
  using (true);

-- Anyone can log a page view / CTA click (insert only, no read).
drop policy if exists "public inserts events" on public.page_events;
create policy "public inserts events"
  on public.page_events for insert
  with check (true);

-- ad_assets and all writes are intentionally NOT exposed to anon — only the
-- service-role key (edge functions) can touch them.

-- ---------------------------------------------------------------------------
-- Storage bucket for ad creatives. (You can also create this in the dashboard:
-- Storage → New bucket → name "ad-assets" → keep it Private.)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('ad-assets', 'ad-assets', false)
on conflict (id) do nothing;
