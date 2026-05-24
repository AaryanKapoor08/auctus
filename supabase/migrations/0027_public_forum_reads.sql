-- Public forum reads support the marketing/public community surfaces while
-- keeping all writes authenticated and author-owned.

drop policy if exists "threads public read" on public.threads;
create policy "threads public read"
on public.threads
for select
to anon, authenticated
using (true);

drop policy if exists "replies public read" on public.replies;
create policy "replies public read"
on public.replies
for select
to anon, authenticated
using (true);

grant select on public.threads to anon;
grant select on public.replies to anon;

grant select (
  id,
  role,
  display_name,
  avatar_url,
  created_at,
  updated_at
) on public.profiles to anon;
