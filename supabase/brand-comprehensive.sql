-- GFP Landing Hub — comprehensive multi-brand upgrade
-- ---------------------------------------------------------------------------
-- Run in Supabase: SQL Editor → New snippet → paste → Run. Safe to re-run.
-- Adds richer brand fields + a public storage bucket for brand logos.
-- ---------------------------------------------------------------------------

-- Richer brand fields on brand_kits.
alter table public.brand_kits add column if not exists tagline         text not null default '';
alter table public.brand_kits add column if not exists about           text not null default '';
alter table public.brand_kits add column if not exists audience        text not null default '';
alter table public.brand_kits add column if not exists tone_dos        text[] not null default '{}';
alter table public.brand_kits add column if not exists tone_donts      text[] not null default '{}';
alter table public.brand_kits add column if not exists example_phrases text[] not null default '{}';
alter table public.brand_kits add column if not exists palette         jsonb  not null default '[]'::jsonb;  -- [{label,hex}]
alter table public.brand_kits add column if not exists logos           jsonb  not null default '[]'::jsonb;  -- [{label,url}]
alter table public.brand_kits add column if not exists documents       jsonb  not null default '[]'::jsonb;  -- [{name,url}] (Context Hub, later)
alter table public.brand_kits add column if not exists updated_at      timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- Storage bucket for brand logos (public so they can show on live pages).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('brand-assets', 'brand-assets', true)
on conflict (id) do nothing;

-- Anyone can READ brand assets (they appear on public pages).
drop policy if exists "public read brand-assets" on storage.objects;
create policy "public read brand-assets"
  on storage.objects for select
  using (bucket_id = 'brand-assets');

-- Only the signed-in owner can upload / change / remove brand assets.
drop policy if exists "owner writes brand-assets" on storage.objects;
create policy "owner writes brand-assets"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'brand-assets');

drop policy if exists "owner updates brand-assets" on storage.objects;
create policy "owner updates brand-assets"
  on storage.objects for update to authenticated
  using (bucket_id = 'brand-assets');

drop policy if exists "owner deletes brand-assets" on storage.objects;
create policy "owner deletes brand-assets"
  on storage.objects for delete to authenticated
  using (bucket_id = 'brand-assets');
