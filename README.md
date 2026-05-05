# Auctus

Auctus is a web product in development for Canadian funding discovery.

The goal of V2 is to support three user types from the start:

1. businesses looking for grants and support programs
2. students looking for scholarships and related funding
3. professors looking for research funding

## Current Status

V2 is implemented end to end on `main`:

- Supabase auth (Google OAuth + email/password), profiles, and role-aware route protection.
- Per-role onboarding, persistence, and `getRoleProfile` runtime.
- Unified funding model with role-specific listings, detail pages, filters, and DB-backed preferences.
- Per-role match scoring wired into `GetFundingSummariesForUser`.
- Persisted forum (threads, replies, helpful votes) with identity RLS.
- ETL pipeline (`scraper/`) for six locked official-source modules, with normalize, dedupe, expire, run-tracking, and data-quality checks.
- Funding-side RLS: public active funding reads, owner-and-current-role preferences, service-role-only writes/metadata.
- Composed dashboard (funding summaries, upcoming deadlines, forum activity) consuming only the published runtime contracts.

The legacy demo routes are isolated under `app/(demo)/**` and stay mounted to keep the chatbot working. They are explicitly outside the V2 surface.

Active funding rows are intentionally public-readable so guests can browse before sign-up. Do not add private sponsor notes, internal review data, or role-private fields to `funding`; store private funding metadata in a separate service-role-only table.

Active planning and execution docs live in the [`build/`](build) folder. The active solo tracker is `codex/SoloProgress.md`.

## Tech Stack

The current application uses:

1. Next.js 16
2. React 19
3. TypeScript 5
4. Tailwind CSS 4
5. ESLint 9

The planned V2 platform adds:

1. Supabase for auth, database, and row level security
2. GitHub Actions for CI and ETL runs
3. a separate `scraper/` package for ingestion
4. Vitest for test coverage

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

Run the test suite:

```bash
npm test
```

Run the scraper bootstrap (no DB writes):

```bash
cd scraper && npm install && npx tsx index.ts --bootstrap-only
```

Run a real scrape against the linked Supabase project (requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in env):

```bash
cd scraper && npx tsx index.ts
```

Apply database migrations:

```bash
supabase db push
```

The migration set on `main`:

| File | Purpose |
|---|---|
| `0000_init.sql` | bootstrap no-op |
| `0001_profiles_base.sql` | `profiles` table + auth.user trigger |
| `0002_role_profiles.sql` | `business_profiles`, `student_profiles`, `professor_profiles` |
| `0003_funding.sql` | `funding`, `funding_preferences`, enums, indexes |
| `0004_scrape_metadata.sql` | `funding_sources` (seeded with six locked sources), `scrape_runs` |
| `0005_forum.sql` | `threads`, `replies`, `reply_helpful_votes`, `mark_reply_helpful` |
| `0010_rls_identity.sql` | identity RLS |
| `0011_profile_match_tags.sql` | profile-derived match tags |
| `0012_restrict_profile_email_select.sql` | profile email select hardening |
| `0020_rls_funding.sql` | funding RLS baseline (role-aware reads, service-role writes) |
| `0021_funding_tag_taxonomy.sql` | canonical funding tag taxonomy |
| `0022_canonical_funding_filters.sql` | canonical funding filter backfill |
| `0023_research_social_sciences_tags.sql` | research social-sciences tag backfill |
| `0024_public_funding_reads.sql` | public active funding reads for guest discovery |

## Important Project Docs

If you are trying to understand the project, start here:

1. [`build/productvision.md`](build/productvision.md)  
   Full project context, product direction, architecture, and pending decisions.

2. [`build/gameplan.md`](build/gameplan.md)  
   The committed V2 scope.

3. [`build/shared/buildflow.md`](build/shared/buildflow.md)  
   The master phase tracker for the two developer workflow.

4. [`build/shared/ownership.md`](build/shared/ownership.md)  
   Folder, route, migration, and domain ownership.

5. [`claude/ProjectSummary.md`](claude/ProjectSummary.md)  
   Broader product vision and architectural intent.

## Repository Notes

The `build/` folder is the active planning and execution layer for V2.

The `claude/` folder contains earlier project context and legacy planning material.

The existing app still contains demo era code and content. V2 is the effort to move that into a real multi role product with clear domain boundaries.
