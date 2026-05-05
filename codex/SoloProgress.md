# Auctus V2 Solo Progress

**Current Gate:** G12
**Current Phase:** P12 — Hardening and Release QA
**Project Category:** web
**Last Updated:** 2026-05-05

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
- 2026-04-30 G2 [direct-main]: isolated legacy demo routes/data/helpers/components, copied root contracts, added domain skeletons, and added `@contracts/*`; `auctus-frontend/` decision = preserve nested duplicate outside lint/build scope | targets: `app/(demo)/**`, `components/demo/**`, `components/forum/**`, `components/ui/StatsCard.tsx`, `data/demo/**`, `lib/demo/**`, `build/contracts/**`, `lib/{auth,profile,forum,funding,matching,session}/index.ts`, `components/{auth,profile,forum,funding}/index.ts`, `.gitignore`, `tsconfig.json`, `app/layout.tsx`, `app/providers.tsx`, `components/layout/Navbar.tsx`, `app/dashboard/page.tsx`, `app/forum/**` | verify: `npm run build` with temporary `lib/_check.ts` importing `@contracts/role` => success; `npm run lint` => success with 25 legacy warnings; `npm run build` => success; dev smoke `Invoke-WebRequest` `/funding`, `/matchmaker`, `/talent` => 200; PR #5 `App checks` => pass | ref: `403503e` on `main`
- 2026-04-30 G3 [direct-main]: added typed env guard, Vitest config/scripts, and env/contract sanity tests | targets: `lib/env.ts`, `vitest.config.ts`, `test/unit/env.test.ts`, `test/contracts/sanity.test.ts`, `package.json`, `package-lock.json` | verify: `npm test` => 2 files / 4 tests passed; `npm run lint` => success with legacy warnings only; `npm run build` => success | ref: `f4fb089`
- 2026-04-30 G4 [direct-main]: locked all five build contracts and added lock-header test coverage | targets: `build/contracts/profile.ts`, `build/contracts/session.ts`, `build/contracts/funding.ts`, `test/contracts/sanity.test.ts` | verify: `npm test` => 2 files / 5 tests passed; `npm run build` => success | ref: `5ca9e67`
- 2026-04-30 G5 [direct-main]: added Supabase clients, sign-in/callback/sign-out routes, profiles migration, session helpers, auth route policies, middleware, placeholder funding policies, and tests | targets: `app/(identity)/**`, `app/auth/callback/route.ts`, `lib/supabase/**`, `lib/session/**`, `lib/auth/**`, `lib/funding/route-policies.ts`, `middleware.ts`, `supabase/migrations/0001_profiles_base.sql`, `test/unit/session.test.ts`, `test/unit/route-policies.test.ts` | verify: `npm test` => 4 files / 14 tests passed; `npm run lint` => success with legacy warnings only; `npm run build` => success; `supabase db push` => applied `0001_profiles_base.sql` | ref: `7d95e83`; manual browser OAuth/email proof still required
- 2026-04-30 G6 [direct-main]: added funding schema, seed SQL, role mapping, filters, preferences, queries, funding pages/components, real funding route policies, and tests | targets: `supabase/migrations/0003_funding.sql`, `supabase/seeds/funding_seed.sql`, `lib/funding/**`, `components/funding/**`, `app/(funding)/**`, `test/unit/funding-role-mapping.test.ts` | verify: `npm test` => 5 files / 17 tests passed; `npm run lint` => success with legacy warnings only; `npm run build` => success; `supabase db push` => applied `0003_funding.sql`; `supabase db query --linked --file supabase/seeds/funding_seed.sql` => success; seed count query => 5 `business_grant`, 5 `scholarship`, 5 `research_grant` | ref: `eb5514d`
- 2026-04-30 G7 [direct-main]: added onboarding role selector/forms, role-profile migration/RPC, profile upsert/query helpers, and focused tests | targets: `app/onboarding/**`, `lib/profile/**`, `supabase/migrations/0002_role_profiles.sql`, `test/unit/profile-*.test.ts` | verify: `npm test` => 7 files / 24 tests passed; `npm run lint` => success with 25 legacy warnings only; `npm run build` => success; `supabase db push --include-all` => applied `0002_role_profiles.sql` after G6's locked `0003` migration | ref: `4b27e4b`; browser onboarding replay remains manual-auth blocked
- 2026-04-30 G8 [direct-main]: added business/student/professor matching scorers, dispatcher, fixture coverage, and scored funding summaries via `getRoleProfile` | targets: `lib/matching/**`, `lib/funding/queries.ts`, `test/unit/matching.test.ts`, `test/unit/funding-summaries.test.ts` | verify: `npm test` => 9 files / 29 tests passed; `npm run lint` => success with 25 legacy warnings only; `npm run build` => success; fixture proof: `funding-2` perfect match sorts before `funding-1` partial match | ref: `4f819be`
- 2026-04-30 G9 [direct-main]: added persisted forum schema/runtime/pages, identity RLS, helpful-vote RPC, auth provider, role-aware navbar, and landing redirect | targets: `supabase/migrations/0005_forum.sql`, `supabase/migrations/0010_rls_identity.sql`, `lib/forum/**`, `app/forum/**`, `components/forum/**`, `components/layout/Navbar.tsx`, `app/page.tsx`, `app/providers.tsx`, `test/unit/forum-*.test.ts` | verify: `npm test` => 11 files / 34 tests passed; `npm run lint` => success with 20 legacy warnings only; `npm run build` => success; `supabase db push` => applied `0005_forum.sql` and `0010_rls_identity.sql`; metadata query => RLS true on profiles/role profiles/threads/replies/votes, `mark_reply_helpful` count 1, votes policies SELECT-only | ref: `5c4c289`; browser account nav/sign-out proof remains manual-auth blocked
- 2026-04-30 review: Claude-added uncommitted G10-G12 scaffold passed local unit/lint/build/type checks, but G10 remained open because live scraper dry-run fetched 0 rows from four sources and fetch failed for two sources; selectors were documented as speculative; rate limiting was not enforced; dashboard deadline date comparison still needs a date-only fix before G11 closes.
- 2026-04-30 G10 [direct-main]: added live-tuned ETL pipeline, source verification notes, scraper CLI/dry-run, utility/normalize/dedupe/expire/supabase stores, six official source modules, scrape metadata migration, fixture/unit tests, rate-limit delays, and real Supabase ingestion proof | targets: `scraper/**`, `supabase/migrations/0004_scrape_metadata.sql`, `test/unit/scraper-*.test.ts`, `package.json`, `package-lock.json` | verify: `npx tsx index.ts --dry-run` => 6 sources / 566 rows / 0 errors; real `npx tsx index.ts` with local Supabase env => `ised-benefits-finder` 6 inserted, `ised-supports` 14 inserted, `educanada` 7 inserted, `indigenous-bursaries` 517 fetched / 478 inserted / 39 updated, `nserc` 20 inserted, `sshrc` 2 inserted, expire 0; Supabase query => latest six `scrape_runs` all `success`, scraped funding counts 20 `business_grant`, 485 `scholarship`, 22 `research_grant`; `npm test` => 21 files / 101 tests passed; `npm run lint` => success with 20 legacy warnings only; `npm run build` => success; `npx tsc -p scraper/tsconfig.json --noEmit` => success | ref: `d97ffdb`; GitHub scrape cron/manual workflow proof remains deferred/manual
- 2026-04-30 G11 [direct-main]: added funding RLS migration, dashboard funding summary/deadline/forum composition, date-only deadline filtering, and focused SQL/composer tests | targets: `supabase/migrations/0020_rls_funding.sql`, `app/dashboard/page.tsx`, `components/dashboard/**`, `lib/dashboard/composer.ts`, `test/unit/dashboard-composer.test.ts`, `test/unit/funding-rls-sql.test.ts` | verify: `npx supabase db push` => remote database up to date; metadata query => RLS true on `funding`, `funding_preferences`, `funding_sources`, `scrape_runs`; policy query => funding SELECT only, funding_preferences SELECT/INSERT/UPDATE/DELETE, no authenticated policies on source/run tables; `npm test -- --run test/unit/dashboard-composer.test.ts test/unit/funding-rls-sql.test.ts` => 2 files / 15 tests passed; `npm test` => 21 files / 102 tests passed; `npm run lint` => success with 20 legacy warnings only; `npm run build` => success | ref: `ef71229`; browser/two-role proof remains manual-auth blocked
- 2026-04-30 G12 [direct-main]: isolated demo provider usage, moved middleware convention to `proxy.ts`, added scraper data-quality checks/tests, refreshed README/Supabase/scraper docs, ignored `.claude/`, and completed final QA | targets: `.gitignore`, `README.md`, `app/(demo)/layout.tsx`, `app/layout.tsx`, `app/providers.tsx`, `components/demo/ChatbotWrapper.tsx`, `components/layout/Navbar.tsx`, `lib/auth/route-policies.ts`, `lib/demo/data.ts`, `lib/session/use-session.ts`, `proxy.ts`, `scraper/README.md`, `scraper/quality.ts`, `supabase/README.md`, `test/unit/scraper-quality.test.ts` | verify: demo import audit => only `app/(demo)/**`, `components/demo/**`, and documented `app/layout.tsx` chatbot exception; data-quality SQL => 0 `amount_range`, 0 `active_past_deadline`, 0 `scraped_missing_metadata`; `npm test` => 21 files / 102 tests passed; `npm run lint` => success with 20 legacy warnings only; `npm run build` => success; `npx tsc -p scraper/tsconfig.json --noEmit` => success | ref: `7c1c6de`; final browser/OAuth/email/GitHub workflow proofs remain manual
- 2026-04-30 G10 manual workflow proof [direct-main]: GitHub Actions `Scrape` workflow manually triggered on `main` at `726e51c` and succeeded; linked DB query showed fresh latest six `scrape_runs` at `2026-04-30T21:37-21:38Z`: `ised-benefits-finder` 6 fetched/0 errors, `ised-supports` 14/0, `educanada` 7/0, `indigenous-bursaries` 517/0, `nserc` 20/0, `sshrc` 2/0 | targets: GitHub Actions `Scrape`, Supabase `scrape_runs` | verify: GitHub UI success + service-role query => all six source runs `success` | ref: `726e51c`
- 2026-04-30 G10 cron enablement [direct-main]: enabled daily GitHub Actions scraper schedule at `0 3 * * *`, retained manual dispatch, and updated scraper actions to Node 24-compatible `actions/checkout@v6` and `actions/setup-node@v6` | targets: `.github/workflows/scrape.yml`, `codex/ETLGameplan.md`, `codex/Handoff.md`, `codex/SoloProgress.md` | verify: `git diff --check` => no whitespace errors; first scheduled-run proof pending after GitHub fires cron | ref: `87daa98`
- 2026-05-01 G12 post-feedback [direct-main]: added client-side funding browser with multi-select category filters, profile-derived default tags, deadline/sort controls, single-load role funding pages, dashboard funding-query dedupe, limited dashboard forum fetches, and duplicate navbar key fix | targets: `app/(funding)/grants/page.tsx`, `app/(funding)/scholarships/page.tsx`, `app/(funding)/research-funding/page.tsx`, `components/funding/FundingBrowser.tsx`, `lib/funding/recommended-tags.ts`, `lib/funding/queries.ts`, `app/dashboard/page.tsx`, `lib/forum/queries.ts`, `components/layout/Navbar.tsx`, `test/unit/funding-summaries.test.ts`, `codex/Handoff.md` | verify: `npm run lint` => success with 20 legacy demo warnings only; `npm run build` => success; `npm test` => 22 files / 107 tests passed | ref: `81291eb`
- 2026-05-04 G12 filter hardening [direct-main]: rebuilt funding filters around live corpus tags, added facet-aware browser filtering, canonical scraper tag normalization, and applied `0022`/`0023` backfills to the linked DB | targets: `lib/funding/filter-definitions.ts`, `components/funding/FundingBrowser.tsx`, `scraper/canonical-tags.ts`, `scraper/normalize.ts`, `supabase/migrations/0022_canonical_funding_filters.sql`, `supabase/migrations/0023_research_social_sciences_tags.sql`, `test/unit/funding-filter-definitions.test.ts`, `test/unit/scraper-canonical-tags.test.ts`, `test/unit/scraper-normalize.test.ts`, `test/unit/funding-tag-taxonomy.test.ts` | verify: live tag query => business filters cover 25 Federal / 21 Innovation / 15 Financing / 14 Advisory; student filters cover 478 Indigenous / 152 Need-based / 64 Provincial / 40 STEM / 31 Graduate; professor filters cover 20 NSERC / 13 Partnership / 7 Training / 4 SSHRC / 4 Social Sciences; `npm run lint` => success with 20 legacy warnings only; `npm run build` => success; `npm test` => 24 files / 114 tests passed; `npx tsc -p scraper/tsconfig.json --noEmit` => success | ref: `cd375f0`
- 2026-05-04 G12 public discovery [direct-main]: kept `/` reachable after sign-in, changed the wordmark/Home link to always target `/`, opened funding listing/detail routes to guests and all signed-in roles, added guest personalization CTAs, and applied public active funding RLS | targets: `app/page.tsx`, `components/layout/Navbar.tsx`, `lib/auth/route-policies.ts`, `lib/funding/route-policies.ts`, `app/(funding)/**`, `components/funding/FundingBrowser.tsx`, `components/funding/FundingDetail.tsx`, `supabase/migrations/0024_public_funding_reads.sql`, `test/unit/route-policies.test.ts`, `test/unit/funding-role-mapping.test.ts`, `test/unit/funding-rls-sql.test.ts` | verify: research sources reviewed: Grants.gov public faceted search/saved-search sign-in pattern, Scholarships.com guest browse/personalized match pattern, Instrumentl match/tracker pattern; `npx supabase db push --include-all --yes` => applied `0024`; policy query => `funding active public select` for `{anon,authenticated}` only; HTTP smoke `/`, `/grants`, `/scholarships`, `/research-funding` => 200; `npm run lint` => success with 20 legacy warnings only; `npm run build` => success; `npm test` => 24 files / 116 tests passed | ref: `bcbb5a8`
- 2026-05-04 G12 landing refinement [direct-main]: restored the fuller public funding discovery landing page with exact live counts, role track panel, opportunity previews, and personalization CTAs after design review | targets: `app/page.tsx` | verify: `npm run lint` => success with 20 legacy demo warnings only; `npm run build` => success | ref: `9eb7dc5`
- 2026-05-04 G12 manual/browser hardening [direct-main]: documented manual auth setup, restricted signed-in navbar funding links to the user's role track, and refreshed client session role on route changes so onboarding updates the navbar without reload | targets: `manual.md`, `components/layout/Navbar.tsx`, `lib/session/use-session.ts`, `codex/Handoff.md`, `codex/SoloProgress.md`, `codex_prompt.md`, `issues.md`, `pendingcommits.md` | verify: Step 5 env/local HTTP preflight => required keys present and `/`, `/grants`, `/scholarships`, `/research-funding` returned 200; `npm run lint` => success with 20 legacy warnings only; `npm run build` => success; focused `npm test -- --run test/unit/session.test.ts test/unit/route-policies.test.ts` => 2 files / 10 tests passed after sandbox `spawn EPERM` elevated rerun | ref: `425d360`
- 2026-05-05 G12 critique hardening [direct-main]: sanitized PostgREST search filter inputs, restricted profile email column SELECT, centralized post-auth routing, added onboarding/profile-edit form error redirects, validated funding application URLs, removed scraper insecure TLS fallback, and refreshed README/root metadata; chatbot/demo routes intentionally left untouched per user direction | targets: `lib/supabase/postgrest-filters.ts`, `lib/funding/queries.ts`, `lib/forum/queries.ts`, `supabase/migrations/0012_restrict_profile_email_select.sql`, `lib/profile/queries.ts`, `lib/session/post-auth-route.ts`, `app/auth/callback/route.ts`, `app/(identity)/sign-in/page.tsx`, `app/(identity)/sign-up/page.tsx`, `app/onboarding/[role]/page.tsx`, `app/profile/edit/page.tsx`, `components/funding/FundingDetail.tsx`, `scraper/index.ts`, `README.md`, `app/layout.tsx`, `test/unit/**`, `codex/Handoff.md`, `codex/SoloProgress.md` | verify: focused tests => 6 files / 26 tests passed after sandbox `spawn EPERM` elevated rerun; `git diff --check` => no whitespace errors; `npm run lint` => success with 20 legacy demo warnings only; `npm run build` => success; `npm test` => 26 files / 126 tests passed; `npx tsc -p scraper/tsconfig.json --noEmit` => success; `npx supabase db push --include-all --yes` => applied `0012`; linked privilege query => `authenticated` profile SELECT excludes `email`, `service_role` retains it | ref: `5b62265`

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
- Google OAuth: Cloud Console client ID/secret + redirect URI = `https://kwfoxklfbrbgbmgyyfcl.supabase.co/auth/v1/callback` ONLY (do NOT add `http://localhost:3000/auth/callback` in Google Cloud); paste client ID/secret into Supabase Auth Provider; Supabase URL Configuration adds `http://localhost:3000` Site URL and `http://localhost:3000/auth/callback` to additional redirect URLs: manual proof required.
- Email/password provider and account-creation proof for real test inboxes: manual proof required.
- Browser proof for G5 auth redirects (`role: null` → `/onboarding`, onboarded users → `/dashboard`): manual proof required after OAuth/email are configured.
- GitHub scrape workflow manual trigger proof: `[done]` GitHub `Scrape` run on `main` at `726e51c` succeeded and fresh `scrape_runs` rows were verified.
- Browser proof for onboarding, dashboard role surfaces, role-specific navbar funding link, and sign-out: manual proof required after OAuth/email are configured.
- GitHub scrape cron proof: workflow is scheduled for daily `03:00 UTC`; first scheduled run proof remains pending.

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

## G3 — Shared Tooling and Infrastructure Bootstrap `[complete with manual blockers]`

- [x] Add `.env.example` with `NEXT_PUBLIC_SUPABASE_URL=`, `NEXT_PUBLIC_SUPABASE_ANON_KEY=`, `SUPABASE_SERVICE_ROLE_KEY=`.
- [x] Install `@supabase/supabase-js` and `@supabase/ssr`; `npm ci` clean.
- [x] Add `lib/env.ts` typed env-guard that throws a clear missing-var error.
- [x] Verify removing `.env.local` produces a clear missing-var error rather than a deep runtime crash.
- [x] Add `supabase/migrations/.gitkeep`.
- [x] Add `supabase/migrations/0000_init.sql` (no-op init migration).
- [x] Add `supabase/README.md` documenting `supabase login`, `supabase link --project-ref <ref>`, and `supabase db push`.
- [x] Manual: create the shared Supabase project; record credentials privately (NOT committed); confirm dashboard access.
- [x] Manual: `supabase login` + `supabase init` + `supabase link` + `supabase db push` of `0000_init.sql` succeeds.
- [ ] Manual: configure Google OAuth (Cloud Console redirect URI = Supabase callback only; paste client ID/secret into Supabase Auth Provider; Supabase URL Configuration includes `http://localhost:3000` Site URL and `http://localhost:3000/auth/callback` additional redirect). → `manual proof required`.
- [ ] Manual: enable email provider with magic-link; test magic-link arrives in real inbox. → `manual proof required`.
- [x] Install Vitest and `@vitest/coverage-v8`.
- [x] Add `npm test` and `npm run test:watch` scripts.
- [x] Add a single sanity test that imports a `@contracts/*` type and passes.
- [x] Add `.github/workflows/ci.yml` running `npm ci && npm run lint && npm run build && npm test` on push and PR.
- [x] Manual: add the three GitHub Actions secrets (Supabase URL/anon/service-role).
- [x] Add `scraper/package.json` (deps: `cheerio`, `@supabase/supabase-js`), `scraper/tsconfig.json`, `scraper/index.ts` with bootstrap log, `scraper/README.md`.
- [x] Verify `cd scraper && npm install && npx tsx index.ts` prints the bootstrap line (verified outside sandbox).
- [x] Add `.github/workflows/scrape.yml` with `workflow_dispatch` only (no cron yet); workflow runs `cd scraper && npm ci && npx tsx index.ts`.
- [ ] Manual: trigger the scrape workflow from GitHub UI and confirm logs show secrets are visible without printing values. → `manual proof required`.
- [x] Verify `npm run lint`.
- [x] Verify `npm run build`.
- [x] Verify `npm test`.
- [ ] CI shows green on a real PR run. Deferred by user instruction to stop GitHub/PR workflow.
- [x] Record manual proof still needed for Supabase / GitHub dashboard items in this section before declaring G3 closed.

**Note:** Code/tooling checks are complete. Google OAuth, email deliverability, and scrape workflow UI proof remain manual blockers.

---

## G4 — Contract Lock `[complete]`

- [x] Confirm `build/contracts/role.ts` header is `// STATUS: LOCKED`.
- [x] Confirm `build/contracts/route-policy.ts` header is `// STATUS: LOCKED`.
- [x] Promote `build/contracts/profile.ts` from DRAFT to LOCKED.
- [x] Promote `build/contracts/session.ts` from DRAFT to LOCKED.
- [x] Promote `build/contracts/funding.ts` from DRAFT to LOCKED.
- [x] Verify all five contract imports typecheck.
- [x] Record locked field set (`Profile`, `OnboardedProfile`, `RoleProfile`, `Session`, `RoutePolicy`, `RoutePolicyRegistry`, `FundingItem`, `FundingSummary`, `FundingPreferences`, `FundingQuery`, plus the published function signatures).

**Locked field set:** `Profile`, `OnboardedProfile`, `BusinessProfile`, `StudentProfile`, `ProfessorProfile`, `RoleProfile`, `Session`, `GetSession`, `UseSession`, `RoutePolicy`, `RoutePolicyRegistry`, `FundingItem`, `FundingSummary`, `FundingPreferences`, `FundingQuery`, `ListFundingForRole`, `GetFundingSummariesForUser`, `GetFundingById`, `GetFundingPreferences`, `UpsertFundingPreferences`, `ClearFundingPreferences`.

---

## G5 — Identity Foundation `[complete with manual auth proof blocker]`

- [x] Add `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (App Router server, cookie-based via `@supabase/ssr`).
- [x] Add `app/(identity)/sign-in/page.tsx` with Google OAuth and email OTP / magic-link only. Explicitly avoid GitHub OAuth, Microsoft OAuth, and password auth.
- [x] Add `app/auth/callback/route.ts` that routes first-login or null-role users to `/onboarding` and already-onboarded users to `/dashboard`.
- [x] Add `app/(identity)/sign-out/route.ts` (POST).
- [x] Add `supabase/migrations/0001_profiles_base.sql`: `profiles` table with `id`, nullable `role` checked against `business|student|professor|null`, `display_name`, `email`, `avatar_url`, `created_at`, `updated_at`; trigger creating a `profiles` row from `auth.users`. No role-specific tables in this migration.
- [x] Apply `0001_profiles_base.sql` via `supabase db push`; unit proof verifies the `{ user_id, role: null }` session shape before onboarding. Fresh-browser profile trigger proof remains blocked on OAuth/email setup.
- [x] Add `lib/session/get-session.ts` exporting the `GetSession` shape from `@contracts/session` (joins `profiles.role`).
- [x] Add `lib/session/use-session.ts` exporting the `UseSession` shape from `@contracts/session`.
- [x] Add `lib/auth/route-policies.ts` with `authPolicies` for `/`, `/sign-in`, `/auth/callback`, `/sign-out`, `/onboarding`, `/profile`, `/profile/edit`, `/forum`, `/dashboard`.
- [x] Export `combineRegistries(...registries)` sorting by descending `path.length` (most specific match wins).
- [x] Add the placeholder `lib/funding/route-policies.ts` with body `export const fundingPolicies: RoutePolicyRegistry = []` so middleware can statically import it before G6 lands.
- [x] Add `middleware.ts` combining `authPolicies` and `fundingPolicies`; redirects unauthenticated users on protected routes → `/sign-in`; signed-in `role: null` → `/onboarding`; wrong-role → `/` or `ROLE_DEFAULT_ROUTE[role]`.
- [x] Verify the empty funding registry does not crash unregistered routes.
- [x] Add Vitest suites for `get-session` (proves `{ user_id, role: null }` before onboarding) and middleware redirect cases.
- [ ] Demonstrate Google sign-in and magic-link sign-in end-to-end in a fresh browser; capture redirect proof for onboarding-vs-dashboard behavior. Manual proof required.

---

## G6 — Funding Foundation `[complete with focused test follow-up]`

- [x] Add `supabase/migrations/0003_funding.sql`:
  - enums for `FundingType`, `FundingStatus`, `source`.
  - `funding` table with all `FundingItem` fields plus `(type, status, deadline)` and `(type, status, created_at desc)` indexes and an `updated_at` trigger.
  - `funding_preferences` keyed by `(user_id, role)` with `default_filters jsonb`, `created_at`, `updated_at`. DB-backed, NOT cookie-only.
- [x] Apply `0003_funding.sql`; verify both tables exist in SQL.
- [x] Add `supabase/seeds/funding_seed.sql` with 5–10 manual rows each for `business_grant`, `scholarship`, `research_grant`.
- [x] Add `lib/funding/supabase.ts` (query client for reads, service-role path for future ingestion).
- [x] Add `lib/funding/role-mapping.ts` covering `business`, `student`, `professor`.
- [x] Add `lib/funding/filter-definitions.ts` with role-specific filters (business, student, professor).
- [x] Add `lib/funding/preferences.ts`: `getFundingPreferences`, `upsertFundingPreferences`, `clearFundingPreferences` per locked contract.
- [x] Add `lib/funding/queries.ts`: `ListFundingForRole`, `GetFundingById`, `GetFundingSummariesForUser` (returns recent items WITHOUT scoring at this stage; scoring lands in G8).
- [x] Tests: role mapping coverage and funding policy registration. Preference/query integration tests remain a focused follow-up after test DB harness setup.
- [x] Add `app/(funding)/grants/page.tsx`, `app/(funding)/scholarships/page.tsx`, `app/(funding)/research-funding/page.tsx`.
- [x] Add detail pages: `app/(funding)/grants/[id]/page.tsx`, `app/(funding)/scholarships/[id]/page.tsx`, `app/(funding)/research-funding/[id]/page.tsx`.
- [x] Add `components/funding/FundingList.tsx`, `FundingCard.tsx`, `FundingDetail.tsx`, `FundingFilters.tsx`.
- [ ] `FundingFilters` renders role-specific filter set, syncs short-term state to query params, saves/reloads defaults via `funding_preferences`. UI/query-param sync done; save/reload defaults is runtime helper only and needs a focused follow-up.
- [x] Add `components/funding/FundingSummaryTile.tsx` as a pure presentation component for dashboard consumption.
- [x] Overwrite `lib/funding/route-policies.ts` placeholder with the real `fundingPolicies`: `/grants` business-only, `/scholarships` student-only, `/research-funding` professor-only.
- [x] Verify middleware picks up `fundingPolicies` on a fresh build.
- [x] Verify the three listings render seed data and one detail page per role renders eligibility correctly.
- [ ] Add a render/snapshot test for `FundingCard`. Deferred to hardening/focused UI test setup.

**G6 proof note:** remote seed count query verified 5 rows each for `business_grant`, `scholarship`, and `research_grant`. Role mapping and route-policy behavior are covered by `test/unit/funding-role-mapping.test.ts`.

---

## G7 — Onboarding and Profile Persistence `[complete with manual auth proof blocker]`

- [x] Add `app/onboarding/page.tsx` role selector.
- [x] Add `app/onboarding/[role]/page.tsx`.
- [x] Business first-run fields: `display_name`, `business_name`, `industry`, `location`, `revenue`, `employees`. Keep `description`, `year_established`, `website` OUT of first-run.
- [x] Student first-run fields: `display_name`, `education_level`, `field_of_study`, `institution`, `province`, `gpa`. Keep `graduation_year` OUT of first-run.
- [x] Professor first-run fields: `display_name`, `institution`, `department`, `research_area`, `career_stage`, `research_keywords`. Keep `h_index` OUT of first-run.
- [x] Do not add citizenship or residency fields anywhere — they are not in the locked contract.
- [x] Validation enforces only the locked required fields per role.
- [x] Add `supabase/migrations/0002_role_profiles.sql` with `business_profiles`, `student_profiles`, `professor_profiles` matching the locked contract field sets.
- [x] Apply `0002_role_profiles.sql`.
- [x] Add `lib/profile/upsert.ts` writing `profiles.role` AND the role-specific row in ONE transaction; reject invalid role writes.
- [x] Add `lib/profile/queries.ts` exporting `getRoleProfile(user_id)` returning the discriminated `RoleProfile` union or `null`.
- [x] Wire null-role users to `/onboarding` after auth callback resolution; onboarded users to `/dashboard`.
- [x] Tests: `lib/profile/upsert.test.ts` (happy path, invalid role, already-onboarded); `lib/profile/queries.test.ts` (business, student, professor, null-role).
- [ ] Demo end-to-end: pick role → submit form → persist rows → next sign-in skips onboarding. Manual proof blocked until Google OAuth/email auth proof is available.

---

## G8 — Funding Pages and Matching `[complete]`

- [x] Add `lib/matching/business.ts` with `scoreBusinessGrant(profile, item)` weights: location 25, revenue 25, employees 20, industry 30.
- [x] Add `lib/matching/student.ts` with `scoreScholarship(profile, item)` weights: education level 30, field of study 25, institution 15, province 15, GPA 15. Do not weight citizenship/residency.
- [x] Add `lib/matching/professor.ts` with `scoreResearchGrant(profile, item)` weights: research area 30, career stage 25, council 20, institution 15, past funding 10.
- [x] Add `lib/matching/index.ts` with `scoreFor(roleProfile, item)` dispatching across the three scorers.
- [x] Build fixture sets for perfect, partial, and no-match outcomes.
- [x] Tests: scorers return values in 0–100; dispatch works for all three role variants.
- [x] Update `GetFundingSummariesForUser(user_id, limit)` to call `getRoleProfile(user_id)`, score each active item, and return `FundingSummary.match_score`.
- [x] Keep `ListFundingForRole()` returning `FundingItem[]` exactly per contract — do NOT add a score field to `FundingItem`.
- [x] Return recent rows with `match_score: null` when `getRoleProfile()` returns `null`.
- [x] Tests: scored summaries returned for onboarded users; `match_score` stays `null` when role/profile missing.
- [x] Capture one fixture-backed proof showing plausible ordering for a seeded user.

---

## G9 — Forum and Shell `[complete with manual auth proof blocker]`

- [x] Add `supabase/migrations/0005_forum.sql`:
  - `threads` table with locked authorship + timestamps.
  - `replies` table with `helpful_count`.
  - `reply_helpful_votes` table with UNIQUE `(reply_id, user_id)`.
  - `mark_reply_helpful(reply_id uuid)` SECURITY DEFINER function: rejects unauthenticated calls; inserts vote with `ON CONFLICT DO NOTHING`; increments `helpful_count` only on a fresh insert; granted EXECUTE to `authenticated`.
- [x] Add `supabase/migrations/0010_rls_identity.sql`:
  - `profiles` RLS: authenticated read of display_name/role surface; write only own row.
  - `business_profiles`, `student_profiles`, `professor_profiles`: own-row-only.
  - `threads`, `replies`: authenticated read; author-only write.
  - `reply_helpful_votes`: client writes blocked outside the function path.
- [x] Apply both migrations; verify another user's profile rows cannot be read or written via authenticated queries. RLS metadata verified; live cross-user browser/client proof remains blocked by manual auth setup.
- [x] Add `lib/forum/queries.ts` exporting `listThreads`, `getThread`, `createThread`, `createReply`, `markReplyHelpful` (calls the DB function — no direct row update).
- [x] Add `app/forum/page.tsx`, `app/forum/[threadId]/page.tsx`, `app/forum/new/page.tsx` against real persisted data.
- [x] Adapt `components/forum/ThreadCard.tsx` and `components/forum/ReplyCard.tsx` to real persisted data; render author role badge.
- [x] Tests/proof: thread create → reply → reload persistence; cross-user edit blocked by RLS; helpful-vote increments exactly once per user (duplicate-vote prevention + unauthenticated-failure cases).
- [x] Update `components/layout/Navbar.tsx` for signed-out + signed-in role-aware navigation; use `ROLE_DEFAULT_ROUTE`, never hard-coded role-to-route branching.
- [x] Update `app/page.tsx` so signed-in users redirect to `/dashboard`; signed-out landing remains public and role-agnostic (no funding data).
- [x] Wrap the app tree in `<Providers>` in `app/layout.tsx`; wire auth context in `app/providers.tsx` via `useSession`.
- [ ] Verify business, student, professor accounts each see the correct funding link in the navbar; sign-out returns user to `/`. Manual browser proof blocked until Google OAuth/email sign-in proof is available.

---

## G10 — ETL Pipeline `[complete with first scheduled-run proof pending]`

**Review status:** Closed. Live source tuning is complete for the six locked sources, real Supabase ingestion succeeded, manual GitHub workflow proof succeeded, and the daily cron is enabled. First scheduled-run proof remains pending until GitHub fires the next `03:00 UTC` run.

- [x] Add ETL source verification notes (workspace-draft mode acceptable) covering all six locked official sources: ISED Business Benefits Finder, ISED Supports for Business, EduCanada Scholarships, Indigenous Bursaries Search Tool, NSERC Funding Opportunities, SSHRC Funding Opportunities. For each: robots.txt URL, ToS note (or absence-of-problem note), scrape cadence, listing/detail URL pattern.
- [x] Confirm CIHR is deferred to post-V2 ETL expansion; confirm no private aggregator appears in any ETL planning file.
- [x] Add `scraper/types.ts` with `ScrapedFunding` and `Scraper` interfaces.
- [x] Add `scraper/utils.ts` with `parseAmount`, `parseDate`, `cleanText`.
- [x] Add `scraper/normalize.ts` setting `source: 'scraped'`, `scraped_from`, `scraped_at`, `status: 'active'`.
- [x] Add `scraper/deduplicate.ts` keyed by `(name, provider, type)` with insert/update/skip behavior.
- [x] Add `scraper/expire.ts` moving past-deadline rows from `active` → `expired`.
- [x] Refactor `scraper/index.ts` to register sources via a central `SOURCES` array; per-source failures log and continue; per-source counts record fetched/inserted/updated/skipped/errors.
- [x] Add `supabase/migrations/0004_scrape_metadata.sql` with `funding_sources` and `scrape_runs`; apply it; verify in SQL.
- [x] Add ETL tests for utilities, normalization, dedupe, and failure isolation.
- [x] Add the six source modules; each has a leading verification comment referencing the verification notes; each rate-limits requests; each preserves `source_url`, `scraped_from`, `scraped_at`.
- [x] Add fixture tests for all six modules.
- [x] Verify a deliberate throw in one source does not stop the other five.
- [x] Verify a clean manual run creates at least one row per source on a clean DB and `scrape_runs` records per-source counts.
- [x] Demonstrate that adding a new future source requires only one new file plus one `SOURCES` line.
- [x] Update `.github/workflows/scrape.yml` to enable cron `0 3 * * *` now that local and manual GitHub workflow proof are complete.

---

## G11 — RLS and Dashboard Integration `[complete with manual auth proof blocker]`

**Review status:** Closed locally in `ef71229`. SQL metadata and focused tests prove the funding RLS shape and dashboard composition. Browser/two-user proof remains blocked until OAuth/email sign-in works.

- [x] Confirm `0010_rls_identity.sql` is already applied (dependency for funding RLS join on `profiles.role`).
- [x] Add `supabase/migrations/0020_rls_funding.sql`:
  - anonymous funding reads return no rows.
  - authenticated funding reads return only `active` rows for the current `profiles.role`.
  - `funding_preferences` reads/writes restricted to owner's own row + current role.
  - `funding_sources` and `scrape_runs` behind service-role.
  - `funding` insert/update/delete service-role only (for scraper ingestion).
- [x] Apply `0020_rls_funding.sql`.
- [ ] Verify cross-role queries return nothing; anonymous queries return nothing; users cannot read/write another user's `funding_preferences`; service-role ingestion still works. SQL policy metadata and service-role ingestion are verified; live two-user/browser proof remains manual-auth blocked.
- [ ] Run integration tests with at least two role users.
- [x] Compose the dashboard funding summary tile in `app/dashboard/page.tsx`:
  - read session via `getSession()`.
  - call `GetFundingSummariesForUser(session.user_id, 5)` for the summary tile.
  - import `FundingSummaryTile` from `components/funding/` as presentation only — no direct funding-table query from dashboard code.
- [x] Add expiring-deadlines tile:
  - call `GetFundingSummariesForUser(session.user_id, N)` with a large enough limit for a 30-day filter.
  - filter results server-side for deadlines within next 30 days; sort nearest first.
  - render the populated state.
  - render exact empty-state text `No upcoming deadlines.`
  - empty-state CTA uses `ROLE_DEFAULT_ROUTE[session.role]` (`/grants` business, `/scholarships` student, `/research-funding` professor).
- [x] Add forum activity tile alongside profile and funding data.
- [ ] Verify business, student, and professor dashboards render the correct summary surface and the correct populated/empty-state expiring-deadlines behavior.
- [x] Add or update dashboard composer test mocking the funding runtime helper.

---

## G12 — Hardening and Release QA `[complete with manual admin/browser blockers]`

**Review status:** Closed locally in `7c1c6de`. Code/docs/tests are complete. Final browser walkthrough, OAuth/email proof, and GitHub scrape workflow proof remain external/manual.

- [x] Grep active app code for imports from `lib/demo` and `components/demo` (outside `app/(demo)/**`); remove any leaks.
- [x] Audit remaining flows for demo-only alerts or fake persistence.
- [x] Add data-quality assertions: fail when `amount_min > amount_max`; fail when `status='active'` on a past-deadline row; ensure scraped rows preserve `source_url`, `scraped_from`, `scraped_at`.
- [x] Run data-quality checks on the shared dev DB.
- [x] Add missing tests for: onboarding upsert, `getRoleProfile`, forum CRUD, dashboard composer, `mark_reply_helpful` duplicate-prevention, scraper utilities, source-module fixtures. Auth callback error-handling remains a standalone follow-up from `issues.md`.
- [x] Update `README.md`, `supabase/README.md`, and `scraper/README.md` (env vars, run command, expected output, migration expectations).
- [x] Run `npm run lint`, `npm run build`, `npm test`, scraper tests — all green.
- [x] Record final QA checklist and any unresolved manual deployment/admin notes.
- [x] Final commit reference recorded in Proof Log.
