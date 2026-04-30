-- 0004_scrape_metadata.sql
-- Tracks the locked V2 funding sources and per-run ingestion metrics for the scraper.

create table if not exists public.funding_sources (
  id text primary key,
  role text not null check (role in ('business', 'student', 'professor')),
  type public.funding_type not null,
  display_name text not null,
  listing_url text not null,
  enabled boolean not null default true,
  rate_limit_ms integer not null default 1500,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists funding_sources_set_updated_at on public.funding_sources;
create trigger funding_sources_set_updated_at
before update on public.funding_sources
for each row execute function public.set_updated_at();

create table if not exists public.scrape_runs (
  id uuid primary key default gen_random_uuid(),
  source_id text not null references public.funding_sources(id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  fetched integer not null default 0,
  inserted integer not null default 0,
  updated integer not null default 0,
  skipped integer not null default 0,
  errors integer not null default 0,
  error_messages text[] not null default '{}',
  status text not null default 'running' check (status in ('running', 'success', 'failed'))
);

create index if not exists scrape_runs_source_started_idx
on public.scrape_runs (source_id, started_at desc);

insert into public.funding_sources (id, role, type, display_name, listing_url, rate_limit_ms, notes)
values
  (
    'ised-benefits-finder',
    'business',
    'business_grant',
    'ISED Business Benefits Finder',
    'https://ised-isde.canada.ca/site/innovation-canada/en/innovation-canada',
    1500,
    'Innovation Canada program surface plus Business Benefits Finder tool link. OGL-Canada attribution via source_url.'
  ),
  (
    'ised-supports',
    'business',
    'business_grant',
    'ISED Supports for Business',
    'https://ised-isde.canada.ca/site/ised/en/supports-for-business',
    1500,
    'ISED Supports for Business landing index. OGL-Canada.'
  ),
  (
    'educanada',
    'student',
    'scholarship',
    'EduCanada Scholarships',
    'https://www.educanada.ca/scholarships-bourses/non_can/index.aspx?lang=eng',
    1500,
    'EduCanada non-Canadian scholarship listings. OGL-Canada.'
  ),
  (
    'indigenous-bursaries',
    'student',
    'scholarship',
    'Indigenous Bursaries Search Tool',
    'https://sac-isc.gc.ca/eng/1351185180120/1351685455328',
    1500,
    'Indigenous Services Canada bursaries search tool. OGL-Canada.'
  ),
  (
    'nserc',
    'professor',
    'research_grant',
    'NSERC Funding Opportunities',
    'https://nserc.canada.ca/en/funding/funding-opportunity',
    1500,
    'NSERC funding opportunity index. OGL-Canada.'
  ),
  (
    'sshrc',
    'professor',
    'research_grant',
    'SSHRC Funding Opportunities',
    'https://sshrc-crsh.canada.ca/en/funding/opportunities.aspx',
    1500,
    'SSHRC funding opportunity index. OGL-Canada.'
  )
on conflict (id) do update set
  role = excluded.role,
  type = excluded.type,
  display_name = excluded.display_name,
  listing_url = excluded.listing_url,
  rate_limit_ms = excluded.rate_limit_ms,
  notes = excluded.notes,
  updated_at = now();
