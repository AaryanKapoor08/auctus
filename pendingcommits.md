# Pending Commits

Changes made on `main` since the last commit (`27ebf67 fix(env): expose public vars to client bundle`) that have **not** been committed yet. Group them per gate close.

---

## G10 — ETL Pipeline `[implemented + verified, uncommitted]`

Suggested commit message: `feat(scraper): add ETL pipeline with dedupe and expiry`

### New files

- `scraper/SOURCES.md` — per-source verification notes (robots.txt, ToS, cadence, URL patterns) for all six locked V2 sources; CIHR deferred; no private aggregator.
- `scraper/types.ts` — `ScrapedFunding`, `ScrapeContext`, `SourceModule`, `SourceCounts`, `SourceRunResult`.
- `scraper/utils.ts` — `cleanText`, `parseAmount`, `parseAmountRange`, `parseDate`, `resolveUrl`, `delay`.
- `scraper/normalize.ts` — `ScrapedFunding -> NormalizedFunding`; sets `source='scraped'`, `scraped_from`, `scraped_at`, `status='active'`.
- `scraper/deduplicate.ts` — dedupe by `(name, provider, type)` with insert / update / skip decision and `dedupeAndUpsert`.
- `scraper/expire.ts` — expires past-deadline rows from `active` to `expired`.
- `scraper/supabase.ts` — service-role client factory + Supabase-backed `DedupeStore` / `ExpireStore` + `recordScrapeRun`.
- `scraper/runner.ts` — generic per-source orchestrator: per-source failure isolation, per-source counts, optional `onResult` hook, optional expire hook.
- `scraper/sources/index.ts` — central `SOURCES` array (locked).
- `scraper/sources/business/ised-benefits-finder.ts` + `parseIsedBenefitsFinder`.
- `scraper/sources/business/ised-supports.ts` + `parseIsedSupports`.
- `scraper/sources/student/educanada.ts` + `parseEduCanada`.
- `scraper/sources/student/indigenous-bursaries.ts` + `parseIndigenousBursaries`.
- `scraper/sources/professor/nserc.ts` + `parseNserc`.
- `scraper/sources/professor/sshrc.ts` + `parseSshrc`.
- `supabase/migrations/0004_scrape_metadata.sql` — `funding_sources` table (PK = `id`, FK target for `scrape_runs`) and `scrape_runs` table; seeded with all six locked sources.
- `test/unit/scraper-utils.test.ts`
- `test/unit/scraper-normalize.test.ts`
- `test/unit/scraper-dedupe.test.ts`
- `test/unit/scraper-expire.test.ts`
- `test/unit/scraper-runner.test.ts` — failure isolation, per-source counts, onResult hook, expire hook.
- `test/unit/scraper-sources.test.ts` — fixture-backed parsing for all six locked sources + SOURCES registry sanity.

### Modified files

- `scraper/index.ts` — replaced bootstrap stub with real CLI: wires `SOURCES` → `runSources(...)` → Supabase stores; preserves `--bootstrap-only` flag.
- `scraper/README.md` — documents new layout, real-run env requirements, "adding a future source" recipe, and test layout.
- `package.json` — added `cheerio` to `devDependencies` so root vitest can resolve scraper imports.
- `package-lock.json` — cheerio + transitive deps.

### Verification recorded for the Proof Log

- `npm test` => 17 files / 68 tests passed (34 new scraper tests + 34 prior).
- `npm run lint` => success with 20 legacy warnings only.
- `npm run build` => success.
- `supabase db push --include-all` => applied `0004_scrape_metadata.sql` to the linked DB.
- `funding_sources` row count: 6 (one per locked source); both tables present in `information_schema.tables`.

### Deferred / still required

- `.github/workflows/scrape.yml` cron `0 3 * * *` not enabled (user asked not to do GitHub workflow work this session).
- Manual workflow trigger proof (≥ 1 row per source on a clean DB; `scrape_runs` row recorded) — manual blocker.

---

## G11 — RLS and Dashboard Integration `[implemented + verified, uncommitted]`

Suggested commit message: `feat(funding): add RLS for role-aware visibility` (RLS half) and `feat(dashboard): compose funding/deadline/forum tiles` (dashboard half) — or one combined commit `feat(funding,dashboard): wire role-aware RLS and dashboard tiles`.

### New files

- `supabase/migrations/0020_rls_funding.sql` — `funding_type_for_role` SQL helper plus RLS policies:
  - `funding`: authenticated SELECT only on `status='active'` whose type matches the caller's role; no policy for INSERT/UPDATE/DELETE (service role only).
  - `funding_preferences`: own-row + current-role-only for SELECT/INSERT/UPDATE/DELETE.
  - `funding_sources`, `scrape_runs`: RLS enabled with no authenticated policy → service role only.
- `lib/dashboard/composer.ts` — pure helpers `isWithinNextDays`, `selectUpcomingDeadlines`, `composeDashboard`; exported constants `EXPIRING_DEADLINE_WINDOW_DAYS = 30` and `NO_UPCOMING_DEADLINES_TEXT = "No upcoming deadlines."` (matches the spec wording exactly).
- `components/dashboard/UpcomingDeadlinesTile.tsx` — populated/empty-state tile; empty state renders the exact `NO_UPCOMING_DEADLINES_TEXT` and a "Browse funding" link to `ROLE_DEFAULT_ROUTE[session.role]`.
- `components/dashboard/ForumActivityTile.tsx` — recent-threads list + empty-state CTA to `/forum/new`.
- `test/unit/dashboard-composer.test.ts` — covers window filtering, sorting nearest-first, top-matches passthrough, thread trimming, exact empty-state text.

### Modified files

- `app/dashboard/page.tsx` — replaced legacy demo client component with a server component:
  - reads session via `getSession()`,
  - calls `GetFundingSummariesForUser(session.user_id, 5)` for the matches tile,
  - calls `GetFundingSummariesForUser(session.user_id, 30)` as the candidate set for the upcoming-deadlines tile (filtered server-side),
  - calls `listThreads()` for forum activity,
  - composes via `composeDashboard(...)` and renders `<FundingSummaryTile />`, `<UpcomingDeadlinesTile />`, `<ForumActivityTile />`,
  - empty-state CTA uses `ROLE_DEFAULT_ROUTE[session.role]`.

### Verification recorded for the Proof Log

- `supabase db push` => applied `0020_rls_funding.sql`.
- `pg_tables` query: `funding`, `funding_preferences`, `funding_sources`, `scrape_runs` all `rowsecurity=true`.
- `pg_policy` query: 1 policy on `funding` (SELECT only); 4 on `funding_preferences` (S/I/U/D); 0 on `funding_sources`; 0 on `scrape_runs`.
- `npm test` => 18 files / 76 tests passed (8 new dashboard-composer tests).
- `npm run lint` => success, 20 legacy warnings only.
- `npm run build` => success; `/dashboard` route present.

### Deferred / still required

- Manual cross-role / anonymous browser proof (Vitest+two-user RLS integration test) is blocked on Google OAuth / email magic-link configuration. Same manual blocker as G5/G7/G9.
- Manual end-to-end browser proof of business/student/professor dashboards rendering correctly is blocked on the same OAuth/email setup.

---

## G12 — Hardening and Release QA `[implemented + verified, uncommitted]`

Suggested commit message: `chore(hardening): isolate demo, add data-quality checks, refresh docs`

### New files

- `scraper/quality.ts` — `runQualityChecks` covering: `amount_min <= amount_max`, no `status='active'` with past deadline, scraped rows preserve `source_url`/`scraped_from`/`scraped_at`.
- `test/unit/scraper-quality.test.ts` — rule-by-rule and combined coverage.
- `test/unit/funding-rls-sql.test.ts` — verifies `0020_rls_funding.sql` enables RLS on every funding-domain table, publishes `funding_type_for_role`, restricts `funding` SELECT to active+role-matched rows, omits authenticated INSERT/UPDATE/DELETE policies on `funding`, and publishes own-row+current-role policies on `funding_preferences`. Confirms `funding_sources` and `scrape_runs` have no authenticated policy.
- `app/(demo)/layout.tsx` — wraps the demo route group in `<BusinessProvider>` so demo pages keep their context after `BusinessProvider` was removed from `app/providers.tsx`.

### Modified files

- `app/providers.tsx` — removed `BusinessProvider` (a `lib/demo/` import) from the V2 provider tree. `<Providers>` now only wraps `AuthProvider` + `ToastProvider`.
- `components/demo/ChatbotWrapper.tsx` — wraps `BusinessProvider` around the dynamically loaded `AIChatbot` so the chatbot still has its context (the chatbot is the documented demo exception still mounted in `app/layout.tsx`).
- `README.md` — refreshed Current Status to describe shipped V2 surface; added a Local Development section covering test/scraper bootstrap/scrape/db-push commands and a locked-migration table.
- `supabase/README.md` — added the locked migration table, the `--include-all` note for out-of-order pushes, and the three data-quality SQL queries (mirrors `scraper/quality.ts`).
- `scraper/README.md` — added `scraper-quality.test.ts` to the test list and a Data-quality Rules pointer.

### Demo-import audit (G12 sweep)

Active V2 app code is clean. Remaining demo imports are only in:

- `app/(demo)/**` (allowed: it is the demo route group)
- `components/demo/**` (allowed: it is the demo component group)
- `app/layout.tsx` → `@/components/demo/ChatbotWrapper` — the explicit AGENTS.md exception ("the legacy AIChatbot stays mounted in `app/layout.tsx` and may import only from `components/demo/` and `lib/demo/`").

### Live data-quality run (linked dev DB)

- `select count(*) from public.funding where amount_min is not null and amount_max is not null and amount_min > amount_max;` => `0`
- `select count(*) from public.funding where status='active' and deadline is not null and deadline < current_date;` => `0`
- `select count(*) from public.funding where source='scraped' and (source_url is null or scraped_from is null or scraped_at is null);` => `0`

### Verification

- `npm test` => 20 files / 93 tests passed (8 dashboard-composer + 9 scraper-quality + 6 funding-rls-sql + previous suites).
- `npm run lint` => success, 20 legacy warnings only (all in `app/(demo)/**` and `components/demo/**` — frozen by AGENTS.md).
- `npm run build` => success.

### Deferred / still required

- Manual deployment/admin notes (Google OAuth, email magic-link, scrape workflow trigger) remain manual blockers carried from prior gates.
- Final QA checklist when committing is captured here in `pendingcommits.md`; once committed, fold into `codex/SoloProgress.md` Proof Log.

---

## Post-G12 — Selector caveat + dry-run dev loop `[uncommitted]`

Suggested commit message: `feat(scraper): add --dry-run / --source CLI and flag speculative selectors`

### New files

- `scraper/cli.ts` — `parseArgs`, `selectSources`, and `HELP_TEXT`. Handles `--bootstrap-only`, `--dry-run`, repeatable `--source <id>` (or `--source=<id>`), `--help` / `-h`, and reports unknown args.
- `test/unit/scraper-cli.test.ts` — covers flag parsing, repeatable sources, `--source` without an id, unknown flags, and `selectSources` filter behaviour.

### Modified files

- `scraper/index.ts` — uses `parseArgs` + `selectSources`. New behaviours:
  - `--help` / `-h` prints usage and exits 0.
  - Unknown args print usage and exit 2.
  - `--dry-run` skips Supabase entirely, calls each selected source's `scrape(...)` then `normalize(...)`, prints one JSON row per line and a per-source count summary.
  - `--source <id>` (repeatable) limits the run; unknown ids exit 2.
  - CLI guard switched to `pathToFileURL(process.argv[1]).href === import.meta.url` so it works on Windows.
- `scraper/SOURCES.md` — leading STATUS notice that selectors are speculative until tuned against live HTML; calls out JS-rendered sites that need a headless fetcher; points to `--dry-run` for selector iteration.
- `scraper/README.md` — adds the CLI section, the `--dry-run` recipe, and the speculative-selectors warning.

### Smoke tests on Windows

- `npx tsx index.ts --help` => prints usage, exit 0.
- `npx tsx index.ts --bootstrap-only` => prints `scraper bootstrapped`, exit 0.
- `npx tsx index.ts --dry-run --source nserc` => `dry-run nserc fetched 0` (confirms the speculative-selectors caveat against the live NSERC page; pipeline itself ran without errors).

### Verification

- `npm test` => 21 files / 101 tests passed (5 new CLI tests).
- `npm run build` => success.

---

## Final QA Checklist (G10–G12, pre-commit)

- [x] All test files green: `npm test` => 20 / 93.
- [x] `npm run lint` succeeds (legacy warnings only).
- [x] `npm run build` succeeds; `/dashboard` route present.
- [x] Migrations `0004_scrape_metadata.sql` and `0020_rls_funding.sql` applied to linked Supabase project.
- [x] `funding_sources` seeded with all six locked sources.
- [x] RLS verified via `pg_tables.rowsecurity = true` on `funding`, `funding_preferences`, `funding_sources`, `scrape_runs`.
- [x] RLS policies verified via `pg_policy` (1 SELECT on `funding`; 4 on `funding_preferences`; 0 on `funding_sources`; 0 on `scrape_runs`).
- [x] Live data-quality SQL counts all `0`.
- [x] Active V2 app code has no `lib/demo` / `components/demo` imports outside the documented exception.
- [x] All G10/G11/G12 changes itemized above.
- [ ] Run a full e2e browser walkthrough once OAuth / magic-link is configured (manual blocker).
- [ ] Trigger the scrape workflow from GitHub UI and capture a `scrape_runs` row with non-zero counts (manual blocker; user paused GH workflow work).
- [ ] Enable cron `0 3 * * *` in `.github/workflows/scrape.yml` (manual blocker; user paused GH workflow work).


