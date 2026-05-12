# Auctus

Auctus is a Next.js app for Canadian funding discovery. It supports three account types:

- businesses looking for grants and support programs
- students looking for scholarships and bursaries
- professors looking for research funding

## Features

- Supabase authentication and profile onboarding
- Role-specific funding pages for grants, scholarships, and research funding
- Saved funding preferences and profile-based match scoring
- Funding detail pages with official application links
- Community forum with threads, replies, and helpful votes
- Dashboard with recommended funding, upcoming deadlines, profile details, and forum activity
- Scraper package for ingesting official Canadian funding sources

## Tech Stack

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- Supabase
- Vitest

## Local Development

Install dependencies:

```bash
npm install
```

Create `.env.local` from `.env.example` and fill in the Supabase values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run the test suite:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

## Database

Apply migrations with the Supabase CLI:

```bash
supabase db push
```

Current migrations:

| File | Purpose |
|---|---|
| `0000_init.sql` | bootstrap no-op |
| `0001_profiles_base.sql` | profiles table and auth trigger |
| `0002_role_profiles.sql` | role-specific profile tables |
| `0003_funding.sql` | funding and funding preferences |
| `0004_scrape_metadata.sql` | funding sources and scrape runs |
| `0005_forum.sql` | forum threads, replies, and helpful votes |
| `0010_rls_identity.sql` | identity and forum row-level security |
| `0011_profile_match_tags.sql` | profile-derived match tags |
| `0012_restrict_profile_email_select.sql` | profile email access hardening |
| `0020_rls_funding.sql` | funding row-level security |
| `0021_funding_tag_taxonomy.sql` | canonical funding tags |
| `0022_canonical_funding_filters.sql` | canonical funding filter backfill |
| `0023_research_social_sciences_tags.sql` | research tag backfill |
| `0024_public_funding_reads.sql` | public active funding reads |

## Scraper

Bootstrap the scraper package:

```bash
cd scraper
npm install
npx tsx index.ts --bootstrap-only
```

Run a dry scrape without database writes:

```bash
cd scraper
npx tsx index.ts --dry-run
```

Run a real scrape with Supabase environment variables configured:

```bash
cd scraper
npx tsx index.ts
```
