# Auctus V2 Handoff

**Last Updated:** 2026-04-30
**Current Gate:** G10 — ETL Pipeline
**Status:** G3-G9 completed locally on `main`; continue one gate at a time from G10

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
- Post-G9 fix pinned `turbopack.root` in `next.config.ts` so Next resolves `@/*` imports from the root project instead of the nested archived `auctus-frontend/` duplicate.

## Verification

- `npm test` after G6: 5 files / 17 tests passed.
- `npm test` after G7: 7 files / 24 tests passed.
- `npm test` after G8: 9 files / 29 tests passed.
- `npm test` after G9: 11 files / 34 tests passed.
- `npm run lint` after G9: success with 20 legacy warnings only.
- `npm run build` after G9: success.
- `npm run build` after Turbopack root fix: success; extra lockfile/root warning is gone.
- `supabase db push`: applied `0001_profiles_base.sql` and `0003_funding.sql`.
- `supabase db push --include-all`: applied locked out-of-order `0002_role_profiles.sql`.
- `supabase db push`: applied `0005_forum.sql` and `0010_rls_identity.sql`.
- Linked DB metadata proof after G9: RLS true on `profiles`, all role profile tables, `threads`, `replies`, `reply_helpful_votes`; `mark_reply_helpful` function count 1; `reply_helpful_votes` policies are SELECT-only.
- `supabase db query --linked --file supabase/seeds/funding_seed.sql`: success.
- Seed count query: 5 `business_grant`, 5 `scholarship`, 5 `research_grant`.

Known build warnings:

- Next warns that `middleware.ts` convention is deprecated in favor of proxy.

## Manual Blockers

- Google OAuth provider setup still needs browser/dashboard proof.
- Email OTP / magic-link deliverability still needs inbox proof.
- Fresh-browser auth redirect proof remains blocked until OAuth/email are configured.
- Business/student/professor navbar funding-link and sign-out browser proof remain blocked until OAuth/email are configured.
- GitHub scrape workflow manual trigger proof is deferred because the user asked to stop GitHub workflow/PR work.

## Follow-Ups Already Noted

- G6 has role mapping/policy tests; deeper preference/query integration tests need a test DB harness.
- `FundingFilters` syncs query params; saved-default UI wiring to `funding_preferences` is a focused follow-up.
- `FundingCard` render/snapshot test is deferred to UI test setup/hardening.

## Exact Next Action

Start G10 on `main`:

1. Draft ETL source verification notes for the six locked official sources.
2. Add scraper core types/utils/normalize/dedupe/expire and `0004_scrape_metadata.sql`.
3. Implement six source modules with verification comments and fixtures.
4. Keep CI/GitHub workflow changes minimal; user asked not to do PR/GitHub workflow work.

Do not start G11 until G10 is implemented, verified, committed, pushed, and documented.
