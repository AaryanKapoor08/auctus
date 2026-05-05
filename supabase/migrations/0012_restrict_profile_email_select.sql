-- Keep forum/profile identity surfaces readable while preventing arbitrary
-- authenticated clients from selecting every user's email address.

revoke select on public.profiles from anon;
revoke select on public.profiles from authenticated;

grant select (
  id,
  role,
  display_name,
  avatar_url,
  created_at,
  updated_at
) on public.profiles to authenticated;

grant select (
  id,
  role,
  display_name,
  email,
  avatar_url,
  created_at,
  updated_at
) on public.profiles to service_role;
