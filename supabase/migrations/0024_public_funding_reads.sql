-- Public discovery: active funding opportunities are browsable before sign-in.
-- Personalization, preferences, dashboard, sources, and scrape metadata remain protected.

drop policy if exists "funding active public select" on public.funding;
create policy "funding active public select"
on public.funding
for select
to anon, authenticated
using (status = 'active');

drop policy if exists "funding role select" on public.funding;
