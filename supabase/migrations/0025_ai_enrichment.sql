-- 0025_ai_enrichment.sql
-- Funding-domain AI enrichment foundation. Provider calls land in G14; this
-- migration only adds deterministic row identity, storage, queue metadata, and RLS.

do $$
begin
  create type public.ai_enrichment_status as enum (
    'pending',
    'processing',
    'enriched',
    'needs_review',
    'failed_retryable',
    'failed_permanent'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.ai_enrichment_task_type as enum (
    'summary',
    'tags',
    'checklist',
    'match_reasons',
    'data_quality',
    'radar'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.ai_provider_preference as enum (
    'auto',
    'gemini-only',
    'openrouter-only',
    'gemini-then-openrouter'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.ai_enrichment_run_status as enum (
    'running',
    'success',
    'partial',
    'aborted_budget',
    'failed'
  );
exception
  when duplicate_object then null;
end $$;

alter table public.funding
add column if not exists content_hash text;

create or replace function public.compute_funding_content_hash(p_row public.funding)
returns text
language sql
stable
as $$
  select md5(
    concat_ws(
      chr(31),
      coalesce(p_row.name, ''),
      coalesce(p_row.provider, ''),
      coalesce(p_row.source_url, ''),
      coalesce(p_row.description, ''),
      coalesce(p_row.eligibility::text, ''),
      coalesce(array_to_string(p_row.requirements, chr(30)), ''),
      coalesce((
        select string_agg(tag, chr(30) order by tag)
        from unnest(coalesce(p_row.tags, '{}'::text[])) as tag
      ), ''),
      coalesce(p_row.deadline::text, ''),
      coalesce(p_row.amount_min::text, ''),
      coalesce(p_row.amount_max::text, ''),
      coalesce(p_row.application_url, '')
    )
  );
$$;

create or replace function public.set_funding_content_hash()
returns trigger
language plpgsql
as $$
begin
  new.content_hash := public.compute_funding_content_hash(new);
  return new;
end;
$$;

drop trigger if exists funding_set_content_hash on public.funding;
create trigger funding_set_content_hash
before insert or update of
  name,
  provider,
  source_url,
  description,
  eligibility,
  requirements,
  tags,
  deadline,
  amount_min,
  amount_max,
  application_url
on public.funding
for each row execute function public.set_funding_content_hash();

update public.funding as f
set content_hash = public.compute_funding_content_hash(f)
where f.content_hash is null;

alter table public.funding
alter column content_hash set not null;

create table if not exists public.funding_ai_enrichment (
  id uuid primary key default gen_random_uuid(),
  funding_id uuid not null references public.funding(id) on delete cascade,
  task_type public.ai_enrichment_task_type not null,
  content_hash text not null,
  summary text,
  eligibility_bullets text[] not null default '{}',
  best_fit_applicant text,
  normalized_tags text[] not null default '{}',
  application_checklist text[] not null default '{}',
  match_reason_templates jsonb not null default '{}'::jsonb,
  data_quality_flags jsonb not null default '[]'::jsonb,
  deadline_urgency text,
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  needs_review boolean not null default false,
  provider text not null,
  model text not null,
  prompt_version integer not null,
  schema_version integer not null,
  enriched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (funding_id, task_type, content_hash, prompt_version, schema_version)
);

create index if not exists funding_ai_enrichment_current_idx
on public.funding_ai_enrichment (
  funding_id,
  task_type,
  content_hash,
  prompt_version,
  schema_version
)
where needs_review = false;

drop trigger if exists funding_ai_enrichment_set_updated_at on public.funding_ai_enrichment;
create trigger funding_ai_enrichment_set_updated_at
before update on public.funding_ai_enrichment
for each row execute function public.set_updated_at();

create table if not exists public.ai_enrichment_jobs (
  id uuid primary key default gen_random_uuid(),
  funding_id uuid not null references public.funding(id) on delete cascade,
  content_hash text not null,
  task_types text[] not null,
  status public.ai_enrichment_status not null default 'pending',
  attempt_count integer not null default 0 check (attempt_count >= 0),
  provider_preference public.ai_provider_preference not null default 'auto',
  next_attempt_at timestamptz not null default now(),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (array_length(task_types, 1) > 0)
);

create unique index if not exists ai_enrichment_jobs_current_key
on public.ai_enrichment_jobs (funding_id, content_hash)
where status in ('pending', 'processing', 'failed_retryable');

create index if not exists ai_enrichment_jobs_claim_idx
on public.ai_enrichment_jobs (status, next_attempt_at);

drop trigger if exists ai_enrichment_jobs_set_updated_at on public.ai_enrichment_jobs;
create trigger ai_enrichment_jobs_set_updated_at
before update on public.ai_enrichment_jobs
for each row execute function public.set_updated_at();

create table if not exists public.ai_enrichment_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  provider text,
  model text,
  rows_attempted integer not null default 0 check (rows_attempted >= 0),
  rows_enriched integer not null default 0 check (rows_enriched >= 0),
  rows_needs_review integer not null default 0 check (rows_needs_review >= 0),
  rows_failed integer not null default 0 check (rows_failed >= 0),
  tokens_in integer not null default 0 check (tokens_in >= 0),
  tokens_out integer not null default 0 check (tokens_out >= 0),
  cost_in_cents integer not null default 0 check (cost_in_cents >= 0),
  cost_out_cents integer not null default 0 check (cost_out_cents >= 0),
  status public.ai_enrichment_run_status not null default 'running',
  aborted_reason text check (
    aborted_reason is null
    or aborted_reason in ('token_budget', 'cost_budget', 'provider_failure_cap')
  ),
  error_summary jsonb not null default '{"by_provider":{},"by_validator":{}}'::jsonb,
  created_at timestamptz not null default now(),
  check (status = 'aborted_budget' or aborted_reason is null)
);

create table if not exists public.ai_enrichment_quarantine (
  id uuid primary key default gen_random_uuid(),
  funding_id uuid references public.funding(id) on delete cascade,
  task_type public.ai_enrichment_task_type,
  provider text not null,
  model text not null,
  content_hash text not null,
  prompt_version integer not null,
  schema_version integer not null,
  error_category text not null,
  redacted_payload text not null check (length(redacted_payload) <= 32780),
  created_at timestamptz not null default now()
);

alter table public.funding_ai_enrichment enable row level security;
alter table public.ai_enrichment_jobs enable row level security;
alter table public.ai_enrichment_runs enable row level security;
alter table public.ai_enrichment_quarantine enable row level security;

drop policy if exists "funding_ai_enrichment public select" on public.funding_ai_enrichment;
create policy "funding_ai_enrichment public select"
on public.funding_ai_enrichment
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.funding f
    where f.id = funding_ai_enrichment.funding_id
      and f.status = 'active'
  )
);

-- ai_enrichment_jobs, ai_enrichment_runs, and ai_enrichment_quarantine are
-- service-role only. No anon/authenticated policies are published for them.
