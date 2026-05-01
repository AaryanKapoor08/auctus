create table if not exists public.profile_match_tags (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  role text not null check (role in ('business', 'student', 'professor')),
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profile_match_tags_set_updated_at on public.profile_match_tags;
create trigger profile_match_tags_set_updated_at
before update on public.profile_match_tags
for each row execute function public.set_updated_at();

alter table public.profile_match_tags enable row level security;

drop policy if exists "profile_match_tags_select_own" on public.profile_match_tags;
create policy "profile_match_tags_select_own"
on public.profile_match_tags
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "profile_match_tags_insert_own" on public.profile_match_tags;
create policy "profile_match_tags_insert_own"
on public.profile_match_tags
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "profile_match_tags_update_own" on public.profile_match_tags;
create policy "profile_match_tags_update_own"
on public.profile_match_tags
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "profile_match_tags_delete_own" on public.profile_match_tags;
create policy "profile_match_tags_delete_own"
on public.profile_match_tags
for delete
to authenticated
using (user_id = auth.uid());
