create table if not exists public.business_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  business_name text not null,
  industry text,
  location text,
  revenue numeric,
  employees integer,
  description text,
  year_established integer,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  education_level text check (
    education_level in ('high_school', 'college', 'undergrad', 'masters', 'phd')
  ),
  field_of_study text,
  institution text,
  province text,
  gpa numeric,
  graduation_year integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.professor_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  institution text,
  department text,
  research_area text,
  career_stage text check (career_stage in ('early', 'mid', 'senior', 'emeritus')),
  h_index integer,
  research_keywords text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists business_profiles_set_updated_at on public.business_profiles;
create trigger business_profiles_set_updated_at
before update on public.business_profiles
for each row execute function public.set_updated_at();

drop trigger if exists student_profiles_set_updated_at on public.student_profiles;
create trigger student_profiles_set_updated_at
before update on public.student_profiles
for each row execute function public.set_updated_at();

drop trigger if exists professor_profiles_set_updated_at on public.professor_profiles;
create trigger professor_profiles_set_updated_at
before update on public.professor_profiles
for each row execute function public.set_updated_at();

create or replace function public.complete_onboarding(
  p_role text,
  p_display_name text,
  p_details jsonb
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_keywords text[];
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_role not in ('business', 'student', 'professor') then
    raise exception 'Invalid role';
  end if;

  update public.profiles
  set role = p_role,
      display_name = p_display_name
  where id = v_user_id
    and role is null;

  if not found then
    raise exception 'Profile is already onboarded or missing';
  end if;

  if p_role = 'business' then
    insert into public.business_profiles (
      id,
      business_name,
      industry,
      location,
      revenue,
      employees
    )
    values (
      v_user_id,
      p_details->>'business_name',
      nullif(p_details->>'industry', ''),
      nullif(p_details->>'location', ''),
      nullif(p_details->>'revenue', '')::numeric,
      nullif(p_details->>'employees', '')::integer
    );
  elsif p_role = 'student' then
    insert into public.student_profiles (
      id,
      education_level,
      field_of_study,
      institution,
      province,
      gpa
    )
    values (
      v_user_id,
      nullif(p_details->>'education_level', ''),
      nullif(p_details->>'field_of_study', ''),
      nullif(p_details->>'institution', ''),
      nullif(p_details->>'province', ''),
      nullif(p_details->>'gpa', '')::numeric
    );
  elsif p_role = 'professor' then
    select coalesce(array_agg(value), '{}')
    into v_keywords
    from jsonb_array_elements_text(coalesce(p_details->'research_keywords', '[]'::jsonb)) as value;

    insert into public.professor_profiles (
      id,
      institution,
      department,
      research_area,
      career_stage,
      research_keywords
    )
    values (
      v_user_id,
      nullif(p_details->>'institution', ''),
      nullif(p_details->>'department', ''),
      nullif(p_details->>'research_area', ''),
      nullif(p_details->>'career_stage', ''),
      v_keywords
    );
  end if;
end;
$$;
