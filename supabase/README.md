# Supabase Setup

Auctus V2 uses Supabase Auth, Postgres, and RLS.

## Required Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_ENRICHMENT_ENABLED=false
AI_GEMINI_API_KEY=
AI_GEMINI_MODEL=gemini-2.5-flash
AI_GEMINI_EMBEDDING_MODEL=gemini-embedding-001
AI_EMBEDDING_DIMENSIONS=768
AI_OPENROUTER_API_KEY=
AI_OPENROUTER_MODEL=nvidia/nemotron-3-super-120b-a12b
ADMIN_ALLOWLIST=aaryankapoor008@gmail.com
```

Do not commit `.env.local` or real secrets.

## CLI Setup

Install the Supabase CLI using the official method for your machine, or with npm:

```bash
npm i -g supabase
```

Authenticate:

```bash
supabase login
```

Link this repo to the Supabase project:

```bash
supabase link --project-ref <project-ref>
```

Apply migrations:

```bash
supabase db push
```

## Migration Rules

- Migrations live in `supabase/migrations/`.
- File names use `NNNN_description.sql`.
- `0000_init.sql` is a no-op bootstrap migration.
- Identity/community migrations use the ranges documented in the V2 ownership references.
- Funding/pipeline migrations use the funding ranges documented in the V2 ownership references.

### Locked migration set

| File | Domain | Lands at |
|---|---|---|
| `0000_init.sql` | shared bootstrap | G3 |
| `0001_profiles_base.sql` | identity | G5 |
| `0002_role_profiles.sql` | identity | G7 |
| `0003_funding.sql` | funding | G6 |
| `0004_scrape_metadata.sql` | funding (`funding_sources`, `scrape_runs`) | G10 |
| `0005_forum.sql` | identity (forum tables, `mark_reply_helpful`) | G9 |
| `0010_rls_identity.sql` | identity RLS | G9 |
| `0020_rls_funding.sql` | funding RLS | G11 |
| `0025_ai_enrichment.sql` | funding AI enrichment | G13 |
| `0026_pgvector_funding.sql` | funding semantic search | G16 |

`0010_rls_identity.sql` must be applied before `0020_rls_funding.sql` because the funding RLS join reads `profiles.role`. When `db push` reports out-of-order migrations, use `supabase db push --include-all` to sync.

`0026_pgvector_funding.sql` enables the `vector` extension, stores raw vectors in `funding_embeddings`, and grants the semantic match RPC only to `service_role`. Public pages only receive ranked funding IDs after server-side checks.

### Data-quality checks

Run these queries after a scraper run on the shared dev DB. Each must return zero:

```sql
select count(*) from public.funding
  where amount_min is not null and amount_max is not null and amount_min > amount_max;

select count(*) from public.funding
  where status='active' and deadline is not null and deadline < current_date;

select count(*) from public.funding
  where source='scraped' and (source_url is null or scraped_from is null or scraped_at is null);
```

The same rules are encoded in `scraper/quality.ts` (`runQualityChecks`) for unit-test coverage.

## Manual Proof Needed

Record proof in `codex/SoloProgress.md` after:

- the Supabase project exists
- the env values are available locally
- `supabase login` works
- `supabase link --project-ref <project-ref>` works
- `supabase db push` applies migrations to the shared dev DB
