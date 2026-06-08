-- Identity/community content caps. Added as NOT VALID so existing rows are not
-- scanned during deploy, while new inserts and updates must stay bounded.

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_display_name_length'
  ) then
    alter table public.profiles
      add constraint profiles_display_name_length
      check (char_length(display_name) <= 80)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'business_profiles_text_length'
  ) then
    alter table public.business_profiles
      add constraint business_profiles_text_length
      check (
        char_length(business_name) <= 160
        and char_length(coalesce(industry, '')) <= 160
        and char_length(coalesce(location, '')) <= 160
      )
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'student_profiles_text_length'
  ) then
    alter table public.student_profiles
      add constraint student_profiles_text_length
      check (
        char_length(coalesce(field_of_study, '')) <= 160
        and char_length(coalesce(institution, '')) <= 160
        and char_length(coalesce(province, '')) <= 160
      )
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'professor_profiles_text_length'
  ) then
    alter table public.professor_profiles
      add constraint professor_profiles_text_length
      check (
        char_length(coalesce(institution, '')) <= 160
        and char_length(coalesce(department, '')) <= 160
        and char_length(coalesce(research_area, '')) <= 160
        and cardinality(research_keywords) <= 12
      )
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'threads_content_length'
  ) then
    alter table public.threads
      add constraint threads_content_length
      check (
        char_length(title) <= 160
        and char_length(content) <= 5000
        and char_length(category) <= 40
        and cardinality(tags) <= 5
      )
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'replies_content_length'
  ) then
    alter table public.replies
      add constraint replies_content_length
      check (char_length(content) <= 2500)
      not valid;
  end if;
end $$;
