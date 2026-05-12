# Supabase

This folder contains the local Supabase configuration, database migrations, and seed data for Auctus.

## Environment

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Do not commit `.env.local` or real secrets.

## CLI

Install and authenticate the Supabase CLI:

```bash
npm i -g supabase
supabase login
```

Link the project:

```bash
supabase link --project-ref <project-ref>
```

Apply migrations:

```bash
supabase db push
```

If your remote database reports out-of-order migrations, run:

```bash
supabase db push --include-all
```

## Migrations

| File | Purpose |
|---|---|
| `0000_init.sql` | bootstrap no-op |
| `0001_profiles_base.sql` | profiles table and auth trigger |
| `0002_role_profiles.sql` | business, student, and professor profiles |
| `0003_funding.sql` | funding and funding preferences |
| `0004_scrape_metadata.sql` | funding sources and scrape runs |
| `0005_forum.sql` | forum tables and helpful-vote function |
| `0010_rls_identity.sql` | identity and forum RLS |
| `0011_profile_match_tags.sql` | profile-derived match tags |
| `0012_restrict_profile_email_select.sql` | profile email access hardening |
| `0020_rls_funding.sql` | funding RLS |
| `0021_funding_tag_taxonomy.sql` | canonical funding tags |
| `0022_canonical_funding_filters.sql` | canonical funding filter backfill |
| `0023_research_social_sciences_tags.sql` | research tag backfill |
| `0024_public_funding_reads.sql` | public active funding reads |

## Data Checks

After scraper runs, these checks should return zero rows:

```sql
select count(*) from public.funding
where amount_min is not null
  and amount_max is not null
  and amount_min > amount_max;

select count(*) from public.funding
where status = 'active'
  and deadline is not null
  and deadline < current_date;

select count(*) from public.funding
where source = 'scraped'
  and (source_url is null or scraped_from is null or scraped_at is null);
```
