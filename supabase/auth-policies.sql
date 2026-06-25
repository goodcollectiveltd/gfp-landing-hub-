-- GFP Landing Hub — owner write access
-- ---------------------------------------------------------------------------
-- Run in Supabase: SQL Editor → New snippet → paste → Run.
-- Lets a logged-in owner (role = authenticated) create/edit pages, brand kits,
-- and ad assets. The public (anon) still only reads published pages — unchanged.
-- Safe to re-run.
-- ---------------------------------------------------------------------------

-- Table privileges for the authenticated role.
grant select, insert, update, delete on public.landing_pages to authenticated;
grant select, insert, update, delete on public.brand_kits   to authenticated;
grant select, insert, update, delete on public.ad_assets    to authenticated;

-- Full-access RLS policies for the single trusted owner. Any signed-in user is
-- the owner (there's only one account), so USING (true) is intentional.
drop policy if exists "owner manages landing_pages" on public.landing_pages;
create policy "owner manages landing_pages"
  on public.landing_pages for all to authenticated
  using (true) with check (true);

drop policy if exists "owner manages brand_kits" on public.brand_kits;
create policy "owner manages brand_kits"
  on public.brand_kits for all to authenticated
  using (true) with check (true);

drop policy if exists "owner manages ad_assets" on public.ad_assets;
create policy "owner manages ad_assets"
  on public.ad_assets for all to authenticated
  using (true) with check (true);
