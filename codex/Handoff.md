# Auctus V2 Handoff

**Last Updated:** 2026-04-30
**Current Gate:** G12 — Hardening and Release QA
**Status:** G10 completed as `d97ffdb`; G11 completed as `ef71229` with browser/two-user auth proof still manual-blocked; continue with G12 hardening

## Start Here

Read in order:

1. `codex/Handoff.md`
2. `codex/SoloProgress.md`
3. `AGENTS.md`

Implementation is now continuing directly on `main` per user instruction. Do not spend time on PR/GitHub mechanics unless explicitly asked.

## Latest Completed Work

- G2 demo isolation was applied directly to `main` as `403503e`.
- G3 added `lib/env.ts`, Vitest, `npm test`, `npm run test:watch`, and env/contract sanity tests as `f4fb089`.
- G4 locked all five contracts and added lock-header test coverage as `5ca9e67`.
- G5 added Supabase clients, sign-in/callback/sign-out, profile trigger migration, session helpers, route policies, middleware, placeholder funding policies, and tests as `7d95e83`.
- G6 added funding schema, seed SQL, role mapping, filters, preferences, queries, funding routes/components, real funding policies, and tests as `eb5514d`.
- G7 added onboarding role selector/forms, `0002_role_profiles.sql`, transactional profile onboarding RPC, profile upsert/query helpers, and tests as `4b27e4b`.
- G8 added role-specific matching scorers, `scoreFor`, fixture-backed tests, and scored `GetFundingSummariesForUser` results as `4f819be`.
- G9 added forum schema/RLS/RPC, persisted forum runtime and pages, auth context provider, role-aware navbar, and signed-in landing redirect as `5c4c289`.
- G10 added live-tuned ETL pipeline, six official source modules, source verification notes, scraper CLI/dry-run, dedupe/expire/normalize/Supabase stores, `0004_scrape_metadata.sql`, and scraper tests as `d97ffdb`.
- G11 added funding RLS migration, dashboard funding summary/deadline/forum tiles, date-only deadline filtering, and dashboard/RLS SQL tests as `ef71229`.
- Post-G9 fix pinned `turbopack.root` in `next.config.ts` so Next resolves `@/*` imports from the root project instead of the nested archived `auctus-frontend/` duplicate.
- Post-G9 fix updated `lib/env.ts` so browser code reads `NEXT_PUBLIC_*` values through static `process.env.NEXT_PUBLIC_*` references instead of dynamic key lookup.

## Claude Work Review — 2026-04-30

Claude added uncommitted files for G10-G12: scraper pipeline, scrape metadata migration, funding RLS migration, dashboard composition, data-quality checks, docs, and tests.

Local checks passed:

- `npm test` => 21 files / 101 tests passed.
- `npm run lint` => success with 20 legacy demo warnings only.
- `npm run build` => success.
- `npx tsc -p scraper/tsconfig.json --noEmit` => success.

Resolved from review:

- G10 live ETL proof is now complete. `npx tsx index.ts --dry-run` returned 566 rows across six sources with 0 errors.
- Real scraper run wrote rows and scrape_runs records to Supabase.
- Source rate limits are now enforced inside source scrapes via `ctx.delay`.
- `scraper/SOURCES.md` now records live-tuned status rather than speculative selector status.

Remaining review blockers for G12:

- `.claude/settings.local.json` is machine/tool-specific and should stay untracked.

## Verification

- `npm test` after G6: 5 files / 17 tests passed.
- `npm test` after G7: 7 files / 24 tests passed.
- `npm test` after G8: 9 files / 29 tests passed.
- `npm test` after G9: 11 files / 34 tests passed.
- `npm run lint` after G9: success with 20 legacy warnings only.
- `npm run build` after G9: success.
- `npm run build` after Turbopack root fix: success; extra lockfile/root warning is gone.
- `npm test -- --run test/unit/env.test.ts` after browser env fix: 1 file / 3 tests passed.
- `npm run build` after browser env fix: success.
- `supabase db push`: applied `0001_profiles_base.sql` and `0003_funding.sql`.
- `supabase db push --include-all`: applied locked out-of-order `0002_role_profiles.sql`.
- `supabase db push`: applied `0005_forum.sql` and `0010_rls_identity.sql`.
- Linked DB metadata proof after G9: RLS true on `profiles`, all role profile tables, `threads`, `replies`, `reply_helpful_votes`; `mark_reply_helpful` function count 1; `reply_helpful_votes` policies are SELECT-only.
- `supabase db query --linked --file supabase/seeds/funding_seed.sql`: success.
- Seed count query: 5 `business_grant`, 5 `scholarship`, 5 `research_grant`.
- G10 dry-run: `npx tsx index.ts --dry-run` from `scraper/` => `ised-benefits-finder` 6, `ised-supports` 14, `educanada` 7, `indigenous-bursaries` 517, `nserc` 20, `sshrc` 2; total 566, errors 0.
- G10 real scraper run: `npx tsx index.ts` from `scraper/` with local Supabase env loaded => six source summaries success; inserted/updated rows; expire 0.
- G10 Supabase query proof: latest six `scrape_runs` all `success`; scraped funding counts are 20 `business_grant`, 485 `scholarship`, 22 `research_grant`.
- G10 full verification: `npm test` => 21 files / 101 tests passed; `npm run lint` => success with 20 legacy warnings only; `npm run build` => success; `npx tsc -p scraper/tsconfig.json --noEmit` => success.
- G11 migration state: `npx supabase db push` => remote database up to date.
- G11 RLS metadata: `npx supabase db query --linked ...pg_tables...` => RLS true on `funding`, `funding_preferences`, `funding_sources`, `scrape_runs`; `pg_policies` query => funding SELECT only, funding_preferences SELECT/INSERT/UPDATE/DELETE, no source/run authenticated policies.
- G11 focused tests: `npm test -- --run test/unit/dashboard-composer.test.ts test/unit/funding-rls-sql.test.ts` => 2 files / 15 tests passed.
- G11 full checks: `npm test` => 21 files / 102 tests passed; `npm run lint` => success with 20 legacy warnings only; `npm run build` => success.

Known build warnings:

- Next warns that `middleware.ts` convention is deprecated in favor of proxy.

## Manual Blockers

- Google OAuth provider setup still needs browser/dashboard proof.
- Email OTP / magic-link deliverability still needs inbox proof.
- Fresh-browser auth redirect proof remains blocked until OAuth/email are configured.
- Business/student/professor navbar funding-link and sign-out browser proof remain blocked until OAuth/email are configured.
- GitHub scrape workflow manual trigger proof is deferred because the user asked to stop GitHub workflow/PR work.
- Live browser proof for onboarding, dashboard role surfaces, and funding RLS remains blocked until OAuth/email sign-in works.
- Enabling and proving the GitHub scrape cron/manual workflow remains manual/deferred while GitHub workflow work is paused.

## Codex-Doable Remaining Work

- Fix dashboard deadline filtering to compare date-only deadlines.
- Keep `.claude/settings.local.json` out of commits.
- Review/apply the remaining uncommitted G12 hardening/docs/data-quality changes.
- Keep `.claude/settings.local.json`, `issues.md`, and `pendingcommits.md` out of product commits unless explicitly requested.
- Re-run `npm test`, `npm run lint`, `npm run build`, and data-quality proof after G12 fixes.

## Follow-Ups Already Noted

- G6 has role mapping/policy tests; deeper preference/query integration tests need a test DB harness.
- `FundingFilters` syncs query params; saved-default UI wiring to `funding_preferences` is a focused follow-up.
- `FundingCard` render/snapshot test is deferred to UI test setup/hardening.

## Exact Next Action

Start G12 review/fix on `main`:

1. Review remaining uncommitted hardening changes: demo-provider isolation, scraper quality checks, README updates, and docs.
2. Keep local/tool scratch files out of commits.
3. Run data-quality checks against the shared dev DB.
4. Re-run full verification and update `codex/SoloProgress.md` before closing G12.

Do not close G12 until G11 is verified and documented.
