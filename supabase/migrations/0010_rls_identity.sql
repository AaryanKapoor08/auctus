alter table public.profiles enable row level security;
alter table public.business_profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.professor_profiles enable row level security;
alter table public.threads enable row level security;
alter table public.replies enable row level security;
alter table public.reply_helpful_votes enable row level security;

drop policy if exists "profiles authenticated read" on public.profiles;
-- This policy intentionally allows authenticated profile directory reads.
-- Migration 0012_restrict_profile_email_select.sql narrows the exposed columns
-- so email remains service-role/current-user only.
create policy "profiles authenticated read"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "profiles owner update" on public.profiles;
create policy "profiles owner update"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "business profiles owner all" on public.business_profiles;
create policy "business profiles owner all"
on public.business_profiles
for all
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "student profiles owner all" on public.student_profiles;
create policy "student profiles owner all"
on public.student_profiles
for all
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "professor profiles owner all" on public.professor_profiles;
create policy "professor profiles owner all"
on public.professor_profiles
for all
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "threads authenticated read" on public.threads;
create policy "threads authenticated read"
on public.threads
for select
to authenticated
using (true);

drop policy if exists "threads author insert" on public.threads;
create policy "threads author insert"
on public.threads
for insert
to authenticated
with check (author_id = auth.uid());

drop policy if exists "threads author update" on public.threads;
create policy "threads author update"
on public.threads
for update
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

drop policy if exists "threads author delete" on public.threads;
create policy "threads author delete"
on public.threads
for delete
to authenticated
using (author_id = auth.uid());

drop policy if exists "replies authenticated read" on public.replies;
create policy "replies authenticated read"
on public.replies
for select
to authenticated
using (true);

drop policy if exists "replies author insert" on public.replies;
create policy "replies author insert"
on public.replies
for insert
to authenticated
with check (author_id = auth.uid());

drop policy if exists "replies author update" on public.replies;
create policy "replies author update"
on public.replies
for update
to authenticated
using (author_id = auth.uid())
with check (author_id = auth.uid());

drop policy if exists "replies author delete" on public.replies;
create policy "replies author delete"
on public.replies
for delete
to authenticated
using (author_id = auth.uid());

drop policy if exists "reply helpful votes authenticated read" on public.reply_helpful_votes;
create policy "reply helpful votes authenticated read"
on public.reply_helpful_votes
for select
to authenticated
using (user_id = auth.uid());
