# Auctus V2 Handoff

**Last Updated:** 2026-04-30
**Current Gate:** G9 — Forum and Shell
**Status:** G3-G8 completed locally on `main`; continue one gate at a time from G9

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

## Verification

- `npm test` after G6: 5 files / 17 tests passed.
- `npm test` after G7: 7 files / 24 tests passed.
- `npm test` after G8: 9 files / 29 tests passed.
- `npm run lint` after G8: success with 25 legacy warnings only.
- `npm run build` after G8: success.
- `supabase db push`: applied `0001_profiles_base.sql` and `0003_funding.sql`.
- `supabase db push --include-all`: applied locked out-of-order `0002_role_profiles.sql`.
- `supabase db query --linked --file supabase/seeds/funding_seed.sql`: success.
- Seed count query: 5 `business_grant`, 5 `scholarship`, 5 `research_grant`.

Known build warnings:

- Next warns that `middleware.ts` convention is deprecated in favor of proxy.
- Next warns about an extra lockfile at `C:\Users\Jaska\package-lock.json`.

## Manual Blockers

- Google OAuth provider setup still needs browser/dashboard proof.
- Email OTP / magic-link deliverability still needs inbox proof.
- Fresh-browser auth redirect proof remains blocked until OAuth/email are configured.
- GitHub scrape workflow manual trigger proof is deferred because the user asked to stop GitHub workflow/PR work.

## Follow-Ups Already Noted

- G6 has role mapping/policy tests; deeper preference/query integration tests need a test DB harness.
- `FundingFilters` syncs query params; saved-default UI wiring to `funding_preferences` is a focused follow-up.
- `FundingCard` render/snapshot test is deferred to UI test setup/hardening.

## Exact Next Action

Start G9 on `main`:

1. Add `0005_forum.sql` and `0010_rls_identity.sql`.
2. Add persisted forum queries/pages/components.
3. Replace demo shell assumptions with role-aware providers/navbar/landing behavior.
4. Apply migrations and verify forum/RLS/helpful-vote behavior with focused tests/proof.

Keep identity/community code in Dev A-owned folders; funding remains consumed through published runtime only.
