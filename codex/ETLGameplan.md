# ETL Gameplan — Finish G10 First

Last updated: 2026-04-30

This document is the practical checklist for finishing the ETL work without mixing it up with later dashboard/release gates.

## Current State

G10 is now complete locally as `d97ffdb`. Claude's original scaffold was tuned against live official pages, rate limiting was added, and real Supabase ingestion proof was captured.

Observed review result:

- `npm test` passed: 21 files / 101 tests.
- `npm run lint` passed with legacy demo warnings only.
- `npm run build` passed.
- `npx tsc -p scraper/tsconfig.json --noEmit` passed.
- `npx tsx index.ts --dry-run` returned 566 rows across all six sources with 0 errors.
- Real `npx tsx index.ts` inserted/updated rows and recorded successful `scrape_runs` for all six sources.

The ETL pipeline should not be scheduled automatically until a GitHub manual workflow run is also proven clean.

## What You Need To Do

### Required After G10

You do not need to code the scraper. The local code-side G10 work is done.

You may need to help with these items:

1. Let me trigger or guide you through one GitHub manual workflow run if you want GitHub workflow proof.
2. Decide when automatic cron scraping should be enabled.

### Manual Dashboard/Admin Items

These are not code tasks and need either your browser access or your credentials:

1. Google OAuth setup in Google Cloud and Supabase.
2. Email magic-link inbox proof.
3. Browser proof of sign-in, onboarding, dashboard, navbar, and sign-out.
4. GitHub scrape workflow trigger/cron proof, if GitHub workflow work is allowed.

## What I Can Do

### G10 — ETL Pipeline

The code side of G10 is complete:

1. Inspected each official source live.
2. Replaced speculative parser selectors with live-tuned parsing.
3. Enforced each source's `rateLimitMs`.
4. Made `npx tsx index.ts --dry-run` return real normalized rows.
5. Ran the real scraper against Supabase.
6. Verified `funding_sources` and `scrape_runs`.
7. Updated `codex/SoloProgress.md` and `codex/Handoff.md`.

Remaining G10-adjacent manual item: GitHub scrape workflow trigger/cron proof.

### G11 — RLS and Dashboard Integration

I can do most of G11 after G10 is closed:

1. Validate and apply `0020_rls_funding.sql`.
2. Verify funding RLS policies in SQL metadata.
3. Fix the dashboard deadline date comparison.
4. Verify dashboard composition uses the published funding/forum helpers.
5. Run tests, lint, and build.
6. Update proof logs.

You still need to do or enable manual proof for:

- browser sign-in as business/student/professor;
- visual dashboard role proof;
- cross-role browser behavior if we cannot create test users programmatically.

### G12 — Hardening and Release QA

I can do nearly all code/documentation QA:

1. Audit active code for demo import leaks.
2. Run data-quality checks.
3. Add or adjust missing tests.
4. Update README, Supabase docs, and scraper docs.
5. Run final lint/build/test/scraper checks.
6. Record final proof.
7. Prepare clean commits in gate order if you ask me to commit.

You still need to do:

- final browser walkthrough after OAuth/email work is complete;
- any GitHub workflow proof if it requires your GitHub browser/session;
- production/deployment admin decisions, if any.

## Recommended Order

1. G10 is committed as `d97ffdb`.
2. Finish and verify G11.
3. Then finish and verify G12.
4. Only enable scheduled scraping after one manual GitHub scraper run is clean.

## GitHub Actions Scrape Setup

Current scrape workflow:

```yaml
on:
  workflow_dispatch:
```

This means manual only. It does not scrape automatically yet.

Future scheduled version:

```yaml
on:
  schedule:
    - cron: "0 3 * * *"
  workflow_dispatch:
```

That would run daily at 03:00 UTC.

Do not enable this cron until:

1. local dry-run returns real rows; `[done]`
2. real Supabase ingestion succeeds; `[done]`
3. one manual GitHub workflow run succeeds;
4. `scrape_runs` records sane counts in the GitHub-run context.

## Immediate Next Step

Move to G11. First concrete task: fix dashboard date-only deadline filtering, then validate/apply funding RLS.
