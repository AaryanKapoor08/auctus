# Auctus V2 Handoff

**Last Updated:** 2026-05-05
**Current Gate:** G12 — Hardening and Release QA
**Status:** G10-G12 completed on `main`; issues 5, 6, 7, 11, 14, 16, 17, 18, 19, 20, and 21 resolved; dashboard redesign, forum delete controls, account deletion, critique docs, and first critique-hardening batch are complete

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
- G12 isolated demo provider usage, moved `middleware.ts` to the Next 16 `proxy.ts` convention, added scraper quality checks, refreshed docs, and completed final QA as `7c1c6de`.
- GitHub `Scrape` workflow manual proof succeeded on `main` at `726e51c`; fresh `scrape_runs` rows were verified in Supabase.
- Scrape workflow cron is enabled for daily `03:00 UTC` runs as `87daa98`; first scheduled-run proof is still pending.
- Post-G9 fix pinned `turbopack.root` in `next.config.ts` so Next resolves `@/*` imports from the root project instead of the nested archived `auctus-frontend/` duplicate.
- Post-G9 fix updated `lib/env.ts` so browser code reads `NEXT_PUBLIC_*` values through static `process.env.NEXT_PUBLIC_*` references instead of dynamic key lookup.
- Issue resolution task completed on `main`:
  - Issue 21 removed magic-link sign-in and added email/password sign-in as `2554bf0`.
  - Issue 11 added OAuth callback failure handling and visible sign-in errors as `ae169fc`.
  - Issue 5 added `/sign-up`, split new/returning auth flows, and updated guest entry points as `86bb280`.
  - Issue 6 added `/profile`, `/profile/edit`, profile update support, and authenticated navbar profile menu as `db7e7c1`.
  - Issue 14 added styled 404/error pages as `1fefab0`.
  - Issue 16 normalized canonical funding tags, moved filters to tag containment, applied `0021_funding_tag_taxonomy.sql`, and verified live counts as `c7438a0`.
  - Issue 20 added identity-owned `0011_profile_match_tags.sql`, redesigned onboarding around funding tags, and wired match tags into scoring as `2ef19b5`.
  - Issue 17 restored funding cards/filter-chip layout as `566ee2f`.
  - Issue 18 restored dashboard visual hierarchy as `a8399e3`.
  - Issue 19 restored forum search/category-chip/thread-card layout as `be3ce5a`.
- Post-issue feedback fix pushed as `81291eb`: funding pages now load role funding once and filter client-side with multi-select category checkboxes, deadline filtering, sorting, profile-derived default tags, and URL state updates without server navigation; dashboard now fetches matched funding once instead of twice and limits dashboard forum fetches to 5 threads; navbar now treats signed-in null-role users as onboarding users instead of guests and avoids duplicate `/dashboard` nav keys.
- Funding filter hardening on 2026-05-04 landed as `cd375f0`: expanded role filters into grouped facets, changed browser filtering to OR within a selected facet and AND across facets, added scraper canonical tag normalization for future ETL rows, and applied `0022`/`0023` linked-DB backfills so live rows use canonical tags instead of raw source tags.
- Public discovery flow on 2026-05-04 landed as `bcbb5a8`: removed the signed-in redirect from `/`, changed Auctus AI/Home to always target `/`, opened `/grants`, `/scholarships`, `/research-funding`, and their detail pages to guests/all signed-in roles, added soft sign-in/customization CTAs, and applied `0024_public_funding_reads.sql` so active funding rows are readable by `anon` and `authenticated`.
- Landing-page refinement on 2026-05-04 landed as `9eb7dc5`: restored the fuller public discovery landing page after design review, keeping exact live counts, a role track panel, opportunity previews, and browse-first personalization CTAs.
- Manual auth proof started on 2026-05-04: `manual.md` was overwritten with dashboard/browser setup steps; Google OAuth client creation was observed, but the client secret appeared in a screenshot and should be treated as exposed/rotated before production use.
- Role navbar correction on 2026-05-04: signed-in onboarded users now see only their role's funding link in the navbar (`business` => Grants, `student` => Scholarships, `professor` => Research) while guest/null-role discovery links remain broad.
- Client session refresh fix on 2026-05-04: `useSession` now reloads the profile role on route changes so onboarding/profile role updates update the navbar without requiring a manual browser refresh.
- Manual Step 5 preflight proof on 2026-05-04: `.env.local` has required Supabase keys without printing secret values, Supabase URL matches project `kwfoxklfbrbgbmgyyfcl`, `NEXT_PUBLIC_SITE_URL` is unset so app fallback is `http://localhost:3000`, and local server is reachable.
- Manual/browser hardening commit on 2026-05-04 landed as `425d360`.
- Product critique document landed as `fe5db85`.
- Dashboard role-workspace redesign landed as `6433e6d`: `app/dashboard/page.tsx` now renders role-specific copy, richer match cards, profile context, opportunity mix, deadline outlook, and forum activity for business/student/professor.
- Forum author deletion controls landed as one-file commits: delete mutations `b520465`, reply-card delete action `6584ac4`, and thread detail controls `a846880`.
- Account deletion feature landed as one-file commits: confirmation helper `14ba580`, test `24ece93`, service-role admin client `9009f00`, delete server action `7e5d7da`, and profile danger zone `22b6422`. Existing DB cascades remove profile, role profile, funding preferences, profile tags, forum threads, replies, and helpful votes.
- First critique-hardening batch on 2026-05-05 landed as `f078bc7`: sanitized PostgREST search `.or()` inputs for funding/forum, added `0012_restrict_profile_email_select.sql` and applied it to the linked DB, moved profile email reads to Supabase Auth for the current user, centralized post-auth routing, added onboarding/profile-edit error banners, validated funding application links, removed the scraper insecure TLS retry, and refreshed README/root metadata. Per user direction, chatbot/demo routes were left untouched.

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

Remaining review/admin blockers:

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
- G12 demo import audit: only `app/(demo)/**`, `components/demo/**`, and the documented `app/layout.tsx` chatbot exception import demo code.
- G12 data-quality SQL: 0 `amount_range`, 0 `active_past_deadline`, 0 `scraped_missing_metadata`.
- G12 final checks: `npm test` => 21 files / 102 tests passed; `npm run lint` => success with 20 legacy warnings only; `npm run build` => success; `npx tsc -p scraper/tsconfig.json --noEmit` => success.
- GitHub scrape workflow proof: GitHub UI success at commit `726e51c`; Supabase latest six `scrape_runs` at `2026-04-30T21:37-21:38Z` all `success` with fetched counts 6, 14, 7, 517, 20, 2 and 0 errors.
- Issue 16 live filter proof after `0021_funding_tag_taxonomy.sql`: `student STEM` => 54 rows, `student Provincial` => 57 rows, `business Federal` => 20 rows.
- Issue 20 migration proof: `npx supabase db push --include-all --yes` applied `0011_profile_match_tags.sql`; RLS metadata query returned `relrowsecurity = true`.
- Issue resolution final checks: `npm test` => 22 files / 106 tests passed; `npm run lint` => success with 20 legacy demo warnings only; `npm run build` => success.
- Post-feedback funding/render checks: initial focused `npm test -- --run test/unit/funding-summaries.test.ts test/unit/dashboard-composer.test.ts` failed in sandbox with Windows `spawn EPERM` while Vite loaded config; escalated rerun passed 2 files / 14 tests. `npm run lint` => success with 20 legacy demo warnings only. `npm run build` => success. Full `npm test` => 22 files / 107 tests passed. After duplicate navbar key fix, `npm run lint` => success with 20 legacy demo warnings only; focused funding/dashboard tests => 2 files / 14 tests passed; `npm run build` => success; full `npm test` => 22 files / 107 tests passed.
- Funding filter rebuild on 2026-05-04: `npx supabase db push --include-all --yes` applied `0022_canonical_funding_filters.sql` and `0023_research_social_sciences_tags.sql`. Live tag proof after backfill: business filters cover 25 Federal, 21 Innovation, 15 Financing, 14 Advisory, 13 Digital, 12 Growth; student filters cover 478 Indigenous, 341 Merit-based, 152 Need-based, 64 Provincial, 42 Education, 40 STEM, 31 Graduate; professor filters cover 20 NSERC/STEM, 13 Partnership, 7 Training, 6 International, 4 SSHRC, 4 Social Sciences. Focused tests initially hit sandbox `spawn EPERM`; escalated rerun passed 5 files / 16 tests. Final checks: `npm run lint` => success with 20 legacy demo warnings only; `npm run build` => success; `npm test` => 24 files / 114 tests passed; `npx tsc -p scraper/tsconfig.json --noEmit` => success.
- Public discovery proof on 2026-05-04: research inputs checked Grants.gov public faceted search + saved-search account pattern, Scholarships.com guest browse + personalized registration pattern, and Instrumentl match/tracker signed-in value pattern. `npx supabase db push --include-all --yes` applied `0024_public_funding_reads.sql`; policy query showed only `funding active public select` with roles `{anon,authenticated}` and `status = active`; HTTP smoke against local dev server returned 200 for `/`, `/grants`, `/scholarships`, and `/research-funding`; `npm run lint` => success with 20 legacy demo warnings only; focused route/RLS tests => 2 files / 14 tests passed; `npm test` => 24 files / 116 tests passed; `npm run build` => success.
- Landing refinement checks: `npm run lint` => success with 20 legacy demo warnings only; `npm run build` => success.
- Role navbar correction checks: `npm run lint` => success with 20 legacy demo warnings only; `npm run build` => success.
- Client session refresh checks: `npm run lint` => success with 20 legacy demo warnings only; `npm run build` => success; focused `npm test -- --run test/unit/session.test.ts test/unit/route-policies.test.ts` initially hit sandbox `spawn EPERM`, elevated rerun => 2 files / 10 tests passed.
- Manual Step 5 preflight checks: env-key presence script => required keys present and Supabase URL matches project; `Invoke-WebRequest http://localhost:3000` => 200; `Invoke-WebRequest /grants`, `/scholarships`, `/research-funding` => 200 each.
- Dashboard redesign checks: `npm run lint` => success with 20 legacy demo warnings only; `npm run build` => success; focused `npm test -- --run test/unit/dashboard-composer.test.ts` initially hit sandbox `spawn EPERM`, elevated rerun => 1 file / 9 tests passed; `Invoke-WebRequest http://localhost:3000/dashboard` => 200.
- Account deletion checks: `npm run lint` => success with 20 legacy demo warnings only; `npm run build` => success; focused `npm test -- --run test/unit/delete-account.test.ts` initially hit sandbox `spawn EPERM`, elevated rerun => 1 file / 1 test passed.
- Split commit preflight on 2026-05-05: `git fetch origin main` => success; `git rev-list --left-right --count HEAD...origin/main` => `0 0` before commits; `npm run lint` => success with 20 legacy demo warnings only; `npm run build` => success; `npm test` => 25 files / 117 tests passed.
- One-file commit/push proof on 2026-05-05: pushed `fe5db85`, `6433e6d`, `b520465`, `6584ac4`, `a846880`, `14ba580`, `24ece93`, `9009f00`, `7e5d7da`, and `22b6422` to `origin/main`; push output noted branch-protection bypass for direct-main pushes.
- Critique hardening checks on 2026-05-05: focused `npm test -- --run test/unit/postgrest-filters.test.ts test/unit/funding-summaries.test.ts test/unit/forum-queries.test.ts test/unit/profile-queries.test.ts test/unit/forum-sql.test.ts test/unit/session.test.ts` first hit sandbox `spawn EPERM`, elevated rerun => 6 files / 26 tests passed; `git diff --check` => no whitespace errors; `npm run lint` => success with 20 legacy demo warnings only; `npm run build` => success; `npm test` => 26 files / 126 tests passed; `npx tsc -p scraper/tsconfig.json --noEmit` => success; `npx supabase db push --include-all --yes` applied `0012_restrict_profile_email_select.sql`; linked privilege query showed `authenticated` profile SELECT excludes `email`, while `service_role` retains it.

Known build warnings:

- Next warns that `middleware.ts` convention is deprecated in favor of proxy.

## Manual Blockers

- Google OAuth provider setup still needs browser/dashboard proof.
- Email/password provider setup and browser account-creation proof still need manual proof.
- Fresh-browser auth redirect proof remains blocked until OAuth/email-password are configured.
- Business/student/professor navbar funding-link and sign-out browser proof remain blocked until OAuth/email-password are configured.
- GitHub scrape workflow manual trigger proof is `[done]` at commit `726e51c`; cron is enabled and first scheduled-run proof remains pending.
- Live browser proof for onboarding, dashboard role surfaces, and funding RLS remains blocked until OAuth/email-password sign-in works.
- Proving the first scheduled GitHub scrape cron run remains pending.

## Codex-Doable Follow-Ups

- Keep `issues.md` and `pendingcommits.md` out of product commits unless explicitly requested.
- Browser-check funding pages after the public discovery change: confirm guest browsing works in a fresh/incognito browser, signed-in users can return to `/`, and personalization CTAs appear only for guests.
- Dev server note: existing Next dev server is running at `http://localhost:3000` with PID `25604`; a new `npm run dev` attempt correctly reported that server as already running.
- Do not spend time redesigning the landing page unless the user asks; current landing page is the restored fuller version from `9eb7dc5`.

## Follow-Ups Already Noted

- G6 has role mapping/policy tests; deeper preference/query integration tests need a test DB harness.
- `FundingFilters` syncs query params; saved-default UI wiring to `funding_preferences` is a focused follow-up.
- `FundingCard` render/snapshot test is deferred to UI test setup/hardening.

## Exact Next Action

Next action:

1. Push `f078bc7` and this progress-doc commit if the user wants the critique-hardening batch on `origin/main`.
2. Continue manual auth/browser proof at `manual.md` Step 6: Google OAuth browser proof.
3. Browser-check the committed dashboard redesign for student/business/professor accounts.
4. Browser-check the committed account deletion flow with a disposable account only; confirm wrong confirmation redirects to `/profile?error=delete_confirmation`, exact `DELETE` removes the auth user, signs out, and cascades forum/profile rows.
5. Browser proof to capture: sign-up -> onboarding -> dashboard, sign-out -> `/`, sign-in returning user -> dashboard, Auctus AI/Home -> `/` while signed in, guest funding browse works, and student/business/professor accounts see only their own funding track in the signed-in navbar while dashboard remains personalized.
6. Also check first scheduled GitHub scrape cron proof if available.
