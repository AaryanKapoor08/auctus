# Auctus V2 Solo Progress

**Current Gate:** G3
**Current Phase:** P3 — Shared Tooling and Infrastructure Bootstrap
**Project Category:** web
**Last Updated:** 2026-04-30

This is the active root tracker for the solo build. The old `dev-a-space`, `dev-b-space`, and `shared-space` trackers are reference archives only.

The solo agent acts as both Dev A and Dev B while preserving their domain boundaries as architecture rules.

---

## Operating Rules

- Real implementation happens in the root project.
- Do not build duplicate app code inside `dev-a-space`, `dev-b-space`, or `shared-space`.
- Preserve contract-first integration between identity/community and funding/pipelines.
- Keep manual dashboard/admin tasks explicit as `manual proof required`.
- Do not mark a checkbox complete without proof.
- Each gate close records: migration mode (`direct-main` | `workspace-draft`), real-project target paths, verification command + result, commit/PR reference. See `dev-a-space/codex/Migration.md`.
- Use only allowed blockers from `dev-a-space/codex/references/build/shared/ownership.md` "Blocking Policy."
- Commit format `type(scope): description`; types `feat|fix|refactor|chore|docs|test|style|perf`.

---

## Proof Log

Add dated proof lines here as gates advance. Suggested format:

```
YYYY-MM-DD G[N] [mode]: <change> | targets: <paths> | verify: <cmd> => <result> | ref: <commit/PR>
```

- 2026-04-30: Read `dev-a-space/AGENTS.md`, `dev-b-space/AGENTS.md`, project summaries, progress trackers, shared ownership/conventions/bootstrap docs, and migration workflow.
- 2026-04-30: Confirmed root repo is still legacy demo state; `npm run build` passes; `npm run lint` fails because lint scans nested `auctus-frontend/.next/**` and app lint issues remain.
- 2026-04-30: Created local `develop` branch from `main`.
- 2026-04-30: Added Supabase baseline files: `.env.example`, `supabase/README.md`, `supabase/migrations/.gitkeep`, and `supabase/migrations/0000_init.sql`.
- 2026-04-30: Installed root Supabase packages: `@supabase/supabase-js` and `@supabase/ssr`.
- 2026-04-30: Added GitHub Actions workflow stubs: `.github/workflows/ci.yml` and `.github/workflows/scrape.yml`.
- 2026-04-30: Added scraper bootstrap package under `scraper/`; verified `npx tsx index.ts` prints `scraper bootstrapped` when run outside the sandbox.
- 2026-04-30: Verified `npm run build` still passes after Supabase/workflow bootstrap files.
- 2026-04-30: Fixed lint scope and baseline lint errors so `npm run lint` exits successfully. Warnings remain in legacy demo code.
- 2026-04-30: Verified `npm run build` still passes after lint-baseline fixes.
- 2026-04-30: Created local `.env.local` with Supabase project values. File is ignored by git.
- 2026-04-30: Set GitHub Actions secrets with GitHub CLI and verified secret names are present.
- 2026-04-30: Installed Supabase CLI via Scoop (`2.95.4`), authenticated with a personal access token, ran `supabase init`, linked project `kwfoxklfbrbgbmgyyfcl`, and applied `0000_init.sql` with `supabase db push`.
- 2026-04-30 G1 [direct-main]: pushed `develop`, enabled branch protection on `main` and `develop`, and verified first `App checks` CI run passed | targets: GitHub branches `main`, `develop` | verify: `gh run watch 25150670259 --exit-status` => success | ref: `ffb899f`
- 2026-04-30 G1 [direct-main]: verified protected workflow with PR #3 into `develop`, then promoted bootstrap to `main` with PR #4 | targets: GitHub PRs #3/#4, root bootstrap files | verify: required `App checks` passed | ref: `e2caebc`, `b493a58`
- 2026-04-30: Resolved G2 verification failures: `npx tsc --noEmit --pretty false` first failed with `TS5090: Non-relative paths are not allowed when 'baseUrl' is not set`; fixed with `baseUrl: "."`. The rerun then failed on stale `.next/types` entries for pre-move routes, nested `auctus-frontend/**` duplicate TypeScript errors, and `lib/demo/ai-responses.ts` importing missing `./data-utils`; fixed by excluding `auctus-frontend` from `tsconfig.json`, correcting demo imports, and using `npm run build` as the final Next typecheck.
- 2026-04-30 G2 [direct-main]: isolated legacy demo routes/data/helpers/components, copied root contracts, added domain skeletons, and added `@contracts/*`; `auctus-frontend/` decision = preserve nested duplicate outside lint/build scope | targets: `app/(demo)/**`, `components/demo/**`, `components/forum/**`, `components/ui/StatsCard.tsx`, `data/demo/**`, `lib/demo/**`, `build/contracts/**`, `lib/{auth,profile,forum,funding,matching,session}/index.ts`, `components/{auth,profile,forum,funding}/index.ts`, `.gitignore`, `tsconfig.json`, `app/layout.tsx`, `app/providers.tsx`, `components/layout/Navbar.tsx`, `app/dashboard/page.tsx`, `app/forum/**` | verify: `npm run build` with temporary `lib/_check.ts` importing `@contracts/role` => success; `npm run lint` => success with 25 legacy warnings; `npm run build` => success; dev smoke `Invoke-WebRequest` `/funding`, `/matchmaker`, `/talent` => 200; PR #5 `App checks` => pass | ref: `e95dc4d`, PR #5

---

## Contract Changes Consumed

One line per contract change after G4 lock.

- None recorded yet

---

## Manual Blockers

These require user/admin/dashboard action or credentials.

- GitHub branch protection for `main` and `develop`: `[done]` PRs required, `App checks` required, force pushes/deletes disabled.
- GitHub Actions secrets `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`: `[done]` verified by `gh secret list`.
- Supabase project creation, credentials, and dashboard access: `[done]` local env exists; dashboard project observed.
- Supabase CLI login/init/link/db push against shared project: `[done]` verified by successful `supabase db push`.
- Google OAuth: Cloud Console client ID/secret + redirect URI = `https://<project-ref>.supabase.co/auth/v1/callback` ONLY (do NOT add `http://localhost:3000/auth/callback` in Google Cloud); paste client ID/secret into Supabase Auth Provider; Supabase URL Configuration adds `http://localhost:3000` Site URL and `http://localhost:3000/auth/callback` to additional redirect URLs: manual proof required.
- Email OTP / magic-link deliverability to a real inbox: manual proof required.

---

## G1 — Solo Bootstrap and Control Plane `[complete]`

- [x] Read Dev A and Dev B `AGENTS.md`.
- [x] Read shared ownership, conventions, bootstrap, and migration rules.
- [x] Confirm solo-agent interpretation: one implementer, two internal domain boundaries.
- [x] Confirm root project is the real implementation target.
- [x] Create root `AGENTS.md`.
- [x] Create root `codex/SoloProgress.md`.
- [x] Create root `codex/Handoff.md`.
- [x] Decide whether root branch strategy will use local `develop` immediately or continue on `main` until user confirms GitHub protection.
- [x] Confirm root `claude/CurrentStatus.md` reference: file is missing from root; archived copy at `shared-space/codex/references/claude/CurrentStatus.md` is sufficient for solo workflow reference.
- [x] Record migration/proof reference after first control-plane commit (mode + commit hash).

**Branch strategy:** use `develop` as the integration branch. Branch protection is enabled on both `main` and `develop`.

**Branch strategy proof:** `develop` is pushed and protected. Future work branches from `develop` and returns through PRs. Phase releases use PRs from `develop` to `main`.

**Next proof target:** begin G2 from a feature branch off `develop`.

---

## G2 — Root Baseline and Demo Isolation `[complete]`

- [x] Audit nested `auctus-frontend/` duplicate folder and decide whether it is ignored, removed, or preserved outside lint scope.
- [x] Fix lint configuration so generated output and duplicate build artifacts are not scanned.
- [x] Move legacy demo routes into `app/(demo)/**`: `app/funding/**`, `app/matchmaker/**`, `app/talent/**`, `app/test-cards/**`, `app/test-components/**`.
- [x] Move `data/*.json` into `data/demo/*.json`.
- [x] Move `lib/data-utils.ts` legacy demo helpers into `lib/demo/data.ts`.
- [x] Move `lib/BusinessContext.jsx` into `lib/demo/BusinessContext.jsx` (or `.tsx` if trivial; otherwise leave the rename for hardening).
- [x] Move `lib/ai-responses.ts` into `lib/demo/ai-responses.ts`.
- [x] Move `components/AIChatbot.tsx` and `components/ChatbotWrapper.tsx` into `components/demo/**` (the legacy AIChatbot stays mounted in `app/layout.tsx` and imports only from `components/demo/` and `lib/demo/`).
- [x] Move `components/cards/GrantCard.tsx`, `MatchCard.tsx`, `JobCard.tsx`, `TalentCard.tsx` into `components/demo/**`.
- [x] Move `components/cards/ThreadCard.tsx` and `ReplyCard.tsx` into `components/forum/**`.
- [x] Move `components/cards/StatsCard.tsx` into `components/ui/StatsCard.tsx`.
- [x] Create empty domain skeleton folders with stub `index.ts`: `lib/auth`, `lib/profile`, `lib/forum`, `lib/funding`, `lib/matching`, `lib/session`, `components/auth`, `components/profile`, `components/forum`, `components/funding`.
- [x] Add root `build/contracts/**` by copying the locked references from `dev-a-space/codex/references/build/contracts/{role,route-policy,profile,session,funding}.ts` and `README.md`.
- [x] Add `@contracts/*` path alias in `tsconfig.json` (`"@contracts/*": ["build/contracts/*"]`).
- [x] Verify the alias with a throwaway `lib/_check.ts` import that typechecks.
- [x] Verify `/(demo)/funding`, `/(demo)/matchmaker`, `/(demo)/talent` still load in dev.
- [x] Verify `npm run lint`.
- [x] Verify `npm run build`.

**Decision:** preserve the nested `auctus-frontend/` duplicate folder, but keep it outside lint/build scope via ESLint and TypeScript excludes. It remains ignored by git.

**Route note:** `(demo)` is a Next route group and does not appear in browser URLs. The moved demo pages were dev-smoke verified at `/funding`, `/matchmaker`, and `/talent`.

---

## G3 — Shared Tooling and Infrastructure Bootstrap `[locked — requires G2]`

- [x] Add `.env.example` with `NEXT_PUBLIC_SUPABASE_URL=`, `NEXT_PUBLIC_SUPABASE_ANON_KEY=`, `SUPABASE_SERVICE_ROLE_KEY=`.
- [x] Install `@supabase/supabase-js` and `@supabase/ssr`; `npm ci` clean.
- [ ] Add `lib/env.ts` typed env-guard that throws a clear missing-var error.
- [ ] Verify removing `.env.local` produces a clear missing-var error rather than a deep runtime crash.
- [x] Add `supabase/migrations/.gitkeep`.
- [x] Add `supabase/migrations/0000_init.sql` (no-op init migration).
- [x] Add `supabase/README.md` documenting `supabase login`, `supabase link --project-ref <ref>`, and `supabase db push`.
- [x] Manual: create the shared Supabase project; record credentials privately (NOT committed); confirm dashboard access.
- [x] Manual: `supabase login` + `supabase init` + `supabase link` + `supabase db push` of `0000_init.sql` succeeds.
- [ ] Manual: configure Google OAuth (Cloud Console redirect URI = Supabase callback only; paste client ID/secret into Supabase Auth Provider; Supabase URL Configuration includes `http://localhost:3000` Site URL and `http://localhost:3000/auth/callback` additional redirect). → `manual proof required`.
- [ ] Manual: enable email provider with magic-link; test magic-link arrives in real inbox. → `manual proof required`.
- [ ] Install Vitest and `@vitest/coverage-v8`.
- [ ] Add `npm test` and `npm run test:watch` scripts.
- [ ] Add a single sanity test that imports a `@contracts/*` type and passes.
- [x] Add `.github/workflows/ci.yml` running `npm ci && npm run lint && npm run build && npm test` on push and PR.
- [x] Manual: add the three GitHub Actions secrets (Supabase URL/anon/service-role).
- [x] Add `scraper/package.json` (deps: `cheerio`, `@supabase/supabase-js`), `scraper/tsconfig.json`, `scraper/index.ts` with bootstrap log, `scraper/README.md`.
- [x] Verify `cd scraper && npm install && npx tsx index.ts` prints the bootstrap line (verified outside sandbox).
- [x] Add `.github/workflows/scrape.yml` with `workflow_dispatch` only (no cron yet); workflow runs `cd scraper && npm ci && npx tsx index.ts`.
- [ ] Manual: trigger the scrape workflow from GitHub UI and confirm logs show secrets are visible without printing values. → `manual proof required`.
- [x] Verify `npm run lint`.
- [x] Verify `npm run build`.
- [ ] Verify `npm test`.
- [ ] CI shows green on a real PR run.
- [ ] Record manual proof still needed for Supabase / GitHub dashboard items in this section before declaring G3 closed.

**Note:** Several G3 bootstrap items were prepared early by user request. G3 remains formally locked until G2 is closed (demo isolation, domain skeletons, contracts, alias) and the remaining manual + Vitest items are verified in sequence.

---

## G4 — Contract Lock `[locked — requires G3]`

- [ ] Confirm `build/contracts/role.ts` header is `// STATUS: LOCKED`.
- [ ] Confirm `build/contracts/route-policy.ts` header is `// STATUS: LOCKED`.
- [ ] Promote `build/contracts/profile.ts` from DRAFT to LOCKED.
- [ ] Promote `build/contracts/session.ts` from DRAFT to LOCKED.
- [ ] Promote `build/contracts/funding.ts` from DRAFT to LOCKED.
- [ ] Verify all five contract imports typecheck.
- [ ] Record locked field set (`Profile`, `OnboardedProfile`, `RoleProfile`, `Session`, `RoutePolicy`, `RoutePolicyRegistry`, `FundingItem`, `FundingSummary`, `FundingPreferences`, `FundingQuery`, plus the published function signatures).

---

## G5 — Identity Foundation `[locked — requires G4]`

- [ ] Add `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (App Router server, cookie-based via `@supabase/ssr`).
- [ ] Add `app/(identity)/sign-in/page.tsx` with Google OAuth and email OTP / magic-link only. Explicitly avoid GitHub OAuth, Microsoft OAuth, and password auth.
- [ ] Add `app/auth/callback/route.ts` that routes first-login or null-role users to `/onboarding` and already-onboarded users to `/dashboard`.
- [ ] Add `app/(identity)/sign-out/route.ts` (POST).
- [ ] Add `supabase/migrations/0001_profiles_base.sql`: `profiles` table with `id`, nullable `role` checked against `business|student|professor|null`, `display_name`, `email`, `avatar_url`, `created_at`, `updated_at`; trigger creating a `profiles` row from `auth.users`. No role-specific tables in this migration.
- [ ] Apply `0001_profiles_base.sql` via `supabase db push`; verify a fresh sign-in auto-creates a `profiles` row; verify `GetSession()` returns `role: null` until onboarding completes.
- [ ] Add `lib/session/get-session.ts` exporting the `GetSession` shape from `@contracts/session` (joins `profiles.role`).
- [ ] Add `lib/session/use-session.ts` exporting the `UseSession` shape from `@contracts/session`.
- [ ] Add `lib/auth/route-policies.ts` with `authPolicies` for `/`, `/sign-in`, `/auth/callback`, `/sign-out`, `/onboarding`, `/profile`, `/profile/edit`, `/forum`, `/dashboard`.
- [ ] Export `combineRegistries(...registries)` sorting by descending `path.length` (most specific match wins).
- [ ] Add the placeholder `lib/funding/route-policies.ts` with body `export const fundingPolicies: RoutePolicyRegistry = []` so middleware can statically import it before G6 lands.
- [ ] Add `middleware.ts` combining `authPolicies` and `fundingPolicies`; redirects unauthenticated users on protected routes → `/sign-in`; signed-in `role: null` → `/onboarding`; wrong-role → `/` or `ROLE_DEFAULT_ROUTE[role]`.
- [ ] Verify the empty funding registry does not crash unregistered routes.
- [ ] Add Vitest suites for `get-session` (proves `{ user_id, role: null }` before onboarding) and middleware redirect cases.
- [ ] Demonstrate Google sign-in and magic-link sign-in end-to-end in a fresh browser; capture redirect proof for onboarding-vs-dashboard behavior.

---

## G6 — Funding Foundation `[locked — requires G5]`

- [ ] Add `supabase/migrations/0003_funding.sql`:
  - enums for `FundingType`, `FundingStatus`, `source`.
  - `funding` table with all `FundingItem` fields plus `(type, status, deadline)` and `(type, status, created_at desc)` indexes and an `updated_at` trigger.
  - `funding_preferences` keyed by `(user_id, role)` with `default_filters jsonb`, `created_at`, `updated_at`. DB-backed, NOT cookie-only.
- [ ] Apply `0003_funding.sql`; verify both tables exist in SQL.
- [ ] Add `supabase/seeds/funding_seed.sql` with 5–10 manual rows each for `business_grant`, `scholarship`, `research_grant`.
- [ ] Add `lib/funding/supabase.ts` (query client for reads, service-role path for future ingestion).
- [ ] Add `lib/funding/role-mapping.ts` covering `business`, `student`, `professor`.
- [ ] Add `lib/funding/filter-definitions.ts` with role-specific filters (business, student, professor).
- [ ] Add `lib/funding/preferences.ts`: `getFundingPreferences`, `upsertFundingPreferences`, `clearFundingPreferences` per locked contract.
- [ ] Add `lib/funding/queries.ts`: `ListFundingForRole`, `GetFundingById`, `GetFundingSummariesForUser` (returns recent items WITHOUT scoring at this stage; scoring lands in G8).
- [ ] Tests: role mapping coverage; preferences create/read/update/clear; `ListFundingForRole({ role: 'student' })` returns only scholarship rows; saved defaults survive reload (not cookie-only).
- [ ] Add `app/(funding)/grants/page.tsx`, `app/(funding)/scholarships/page.tsx`, `app/(funding)/research-funding/page.tsx`.
- [ ] Add detail pages: `app/(funding)/grants/[id]/page.tsx`, `app/(funding)/scholarships/[id]/page.tsx`, `app/(funding)/research-funding/[id]/page.tsx`.
- [ ] Add `components/funding/FundingList.tsx`, `FundingCard.tsx`, `FundingDetail.tsx`, `FundingFilters.tsx`.
- [ ] `FundingFilters` renders role-specific filter set, syncs short-term state to query params, saves/reloads defaults via `funding_preferences`.
- [ ] Add `components/funding/FundingSummaryTile.tsx` as a pure presentation component for dashboard consumption.
- [ ] Overwrite `lib/funding/route-policies.ts` placeholder with the real `fundingPolicies`: `/grants` business-only, `/scholarships` student-only, `/research-funding` professor-only.
- [ ] Verify middleware picks up `fundingPolicies` on a fresh build.
- [ ] Verify the three listings render seed data and one detail page per role renders eligibility correctly.
- [ ] Add a render/snapshot test for `FundingCard`.

---

## G7 — Onboarding and Profile Persistence `[locked — requires G6]`

- [ ] Add `app/onboarding/page.tsx` role selector.
- [ ] Add `app/onboarding/[role]/page.tsx`.
- [ ] Business first-run fields: `display_name`, `business_name`, `industry`, `location`, `revenue`, `employees`. Keep `description`, `year_established`, `website` OUT of first-run.
- [ ] Student first-run fields: `display_name`, `education_level`, `field_of_study`, `institution`, `province`, `gpa`. Keep `graduation_year` OUT of first-run.
- [ ] Professor first-run fields: `display_name`, `institution`, `department`, `research_area`, `career_stage`, `research_keywords`. Keep `h_index` OUT of first-run.
- [ ] Do not add citizenship or residency fields anywhere — they are not in the locked contract.
- [ ] Validation enforces only the locked required fields per role.
- [ ] Add `supabase/migrations/0002_role_profiles.sql` with `business_profiles`, `student_profiles`, `professor_profiles` matching the locked contract field sets.
- [ ] Apply `0002_role_profiles.sql`.
- [ ] Add `lib/profile/upsert.ts` writing `profiles.role` AND the role-specific row in ONE transaction; reject invalid role writes.
- [ ] Add `lib/profile/queries.ts` exporting `getRoleProfile(user_id)` returning the discriminated `RoleProfile` union or `null`.
- [ ] Wire null-role users to `/onboarding` after auth callback resolution; onboarded users to `/dashboard`.
- [ ] Tests: `lib/profile/upsert.test.ts` (happy path, invalid role, already-onboarded); `lib/profile/queries.test.ts` (business, student, professor, null-role).
- [ ] Demo end-to-end: pick role → submit form → persist rows → next sign-in skips onboarding.

---

## G8 — Funding Pages and Matching `[locked — requires G7]`

- [ ] Add `lib/matching/business.ts` with `scoreBusinessGrant(profile, item)` weights: location 25, revenue 25, employees 20, industry 30.
- [ ] Add `lib/matching/student.ts` with `scoreScholarship(profile, item)` weights: education level 30, field of study 25, institution 15, province 15, GPA 15. Do not weight citizenship/residency.
- [ ] Add `lib/matching/professor.ts` with `scoreResearchGrant(profile, item)` weights: research area 30, career stage 25, council 20, institution 15, past funding 10.
- [ ] Add `lib/matching/index.ts` with `scoreFor(roleProfile, item)` dispatching across the three scorers.
- [ ] Build fixture sets for perfect, partial, and no-match outcomes.
- [ ] Tests: scorers return values in 0–100; dispatch works for all three role variants.
- [ ] Update `GetFundingSummariesForUser(user_id, limit)` to call `getRoleProfile(user_id)`, score each active item, and return `FundingSummary.match_score`.
- [ ] Keep `ListFundingForRole()` returning `FundingItem[]` exactly per contract — do NOT add a score field to `FundingItem`.
- [ ] Return recent rows with `match_score: null` when `getRoleProfile()` returns `null`.
- [ ] Tests: scored summaries returned for onboarded users; `match_score` stays `null` when role/profile missing.
- [ ] Capture one fixture-backed proof showing plausible ordering for a seeded user.

---

## G9 — Forum and Shell `[locked — requires G8]`

- [ ] Add `supabase/migrations/0005_forum.sql`:
  - `threads` table with locked authorship + timestamps.
  - `replies` table with `helpful_count`.
  - `reply_helpful_votes` table with UNIQUE `(reply_id, user_id)`.
  - `mark_reply_helpful(reply_id uuid)` SECURITY DEFINER function: rejects unauthenticated calls; inserts vote with `ON CONFLICT DO NOTHING`; increments `helpful_count` only on a fresh insert; granted EXECUTE to `authenticated`.
- [ ] Add `supabase/migrations/0010_rls_identity.sql`:
  - `profiles` RLS: authenticated read of display_name/role surface; write only own row.
  - `business_profiles`, `student_profiles`, `professor_profiles`: own-row-only.
  - `threads`, `replies`: authenticated read; author-only write.
  - `reply_helpful_votes`: client writes blocked outside the function path.
- [ ] Apply both migrations; verify another user's profile rows cannot be read or written via authenticated queries.
- [ ] Add `lib/forum/queries.ts` exporting `listThreads`, `getThread`, `createThread`, `createReply`, `markReplyHelpful` (calls the DB function — no direct row update).
- [ ] Add `app/forum/page.tsx`, `app/forum/[threadId]/page.tsx`, `app/forum/new/page.tsx` against real persisted data.
- [ ] Adapt `components/forum/ThreadCard.tsx` and `components/forum/ReplyCard.tsx` to real persisted data; render author role badge.
- [ ] Tests/proof: thread create → reply → reload persistence; cross-user edit blocked by RLS; helpful-vote increments exactly once per user (duplicate-vote prevention + unauthenticated-failure cases).
- [ ] Update `components/layout/Navbar.tsx` for signed-out + signed-in role-aware navigation; use `ROLE_DEFAULT_ROUTE`, never hard-coded role-to-route branching.
- [ ] Update `app/page.tsx` so signed-in users redirect to `/dashboard`; signed-out landing remains public and role-agnostic (no funding data).
- [ ] Wrap the app tree in `<Providers>` in `app/layout.tsx`; wire auth context in `app/providers.tsx` via `useSession`.
- [ ] Verify business, student, professor accounts each see the correct funding link in the navbar; sign-out returns user to `/`.

---

## G10 — ETL Pipeline `[locked — requires G9]`

- [ ] Add ETL source verification notes (workspace-draft mode acceptable) covering all six locked official sources: ISED Business Benefits Finder, ISED Supports for Business, EduCanada Scholarships, Indigenous Bursaries Search Tool, NSERC Funding Opportunities, SSHRC Funding Opportunities. For each: robots.txt URL, ToS note (or absence-of-problem note), scrape cadence, listing/detail URL pattern.
- [ ] Confirm CIHR is deferred to post-V2 ETL expansion; confirm no private aggregator appears in any ETL planning file.
- [ ] Add `scraper/types.ts` with `ScrapedFunding` and `Scraper` interfaces.
- [ ] Add `scraper/utils.ts` with `parseAmount`, `parseDate`, `cleanText`.
- [ ] Add `scraper/normalize.ts` setting `source: 'scraped'`, `scraped_from`, `scraped_at`, `status: 'active'`.
- [ ] Add `scraper/deduplicate.ts` keyed by `(name, provider, type)` with insert/update/skip behavior.
- [ ] Add `scraper/expire.ts` moving past-deadline rows from `active` → `expired`.
- [ ] Refactor `scraper/index.ts` to register sources via a central `SOURCES` array; per-source failures log and continue; per-source counts record fetched/inserted/updated/skipped/errors.
- [ ] Add `supabase/migrations/0004_scrape_metadata.sql` with `funding_sources` and `scrape_runs`; apply it; verify in SQL.
- [ ] Add ETL tests for utilities, normalization, dedupe, and failure isolation.
- [ ] Add the six source modules; each has a leading verification comment referencing the verification notes; each rate-limits requests; each preserves `source_url`, `scraped_from`, `scraped_at`.
- [ ] Add fixture tests for all six modules.
- [ ] Verify a deliberate throw in one source does not stop the other five.
- [ ] Verify a clean manual run creates at least one row per source on a clean DB and `scrape_runs` records per-source counts.
- [ ] Demonstrate that adding a new future source requires only one new file plus one `SOURCES` line.
- [ ] Update `.github/workflows/scrape.yml` to enable cron `0 3 * * *` only after all source verification is complete.

---

## G11 — RLS and Dashboard Integration `[locked — requires G10]`

- [ ] Confirm `0010_rls_identity.sql` is already applied (dependency for funding RLS join on `profiles.role`).
- [ ] Add `supabase/migrations/0020_rls_funding.sql`:
  - anonymous funding reads return no rows.
  - authenticated funding reads return only `active` rows for the current `profiles.role`.
  - `funding_preferences` reads/writes restricted to owner's own row + current role.
  - `funding_sources` and `scrape_runs` behind service-role.
  - `funding` insert/update/delete service-role only (for scraper ingestion).
- [ ] Apply `0020_rls_funding.sql`.
- [ ] Verify cross-role queries return nothing; anonymous queries return nothing; users cannot read/write another user's `funding_preferences`; service-role ingestion still works.
- [ ] Run integration tests with at least two role users.
- [ ] Compose the dashboard funding summary tile in `app/dashboard/page.tsx`:
  - read session via `getSession()`.
  - call `GetFundingSummariesForUser(session.user_id, 5)` for the summary tile.
  - import `FundingSummaryTile` from `components/funding/` as presentation only — no direct funding-table query from dashboard code.
- [ ] Add expiring-deadlines tile:
  - call `GetFundingSummariesForUser(session.user_id, N)` with a large enough limit for a 30-day filter.
  - filter results server-side for deadlines within next 30 days; sort nearest first.
  - render the populated state.
  - render exact empty-state text `No upcoming deadlines.`
  - empty-state CTA uses `ROLE_DEFAULT_ROUTE[session.role]` (`/grants` business, `/scholarships` student, `/research-funding` professor).
- [ ] Add forum activity tile alongside profile and funding data.
- [ ] Verify business, student, and professor dashboards render the correct summary surface and the correct populated/empty-state expiring-deadlines behavior.
- [ ] Add or update dashboard composer test mocking the funding runtime helper.

---

## G12 — Hardening and Release QA `[locked — requires G11]`

- [ ] Grep active app code for imports from `lib/demo` and `components/demo` (outside `app/(demo)/**`); remove any leaks.
- [ ] Audit remaining flows for demo-only alerts or fake persistence.
- [ ] Add data-quality assertions: fail when `amount_min > amount_max`; fail when `status='active'` on a past-deadline row; ensure scraped rows preserve `source_url`, `scraped_from`, `scraped_at`.
- [ ] Run data-quality checks on the shared dev DB.
- [ ] Add missing tests for: auth callback path, onboarding upsert, `getRoleProfile`, forum CRUD, dashboard composer, `mark_reply_helpful` duplicate-prevention, scraper utilities, source-module fixtures.
- [ ] Update `README.md`, `supabase/README.md`, and `scraper/README.md` (env vars, run command, expected output, migration expectations).
- [ ] Run `npm run lint`, `npm run build`, `npm test`, scraper tests — all green.
- [ ] Record final QA checklist and any unresolved manual deployment/admin notes.
- [ ] Final commit reference recorded in Proof Log.
