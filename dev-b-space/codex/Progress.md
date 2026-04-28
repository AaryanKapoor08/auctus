# Progress

**Current Gate:** G1
**Current Phase:** P1 — Bootstrap Access and Collaborator Readiness
**Project Category:** web
**Last Updated:** 2026-04-28
**Session Notes:** Likit workspace filled from copied Auctus docs. Real repo state remains `V2.P1 — Shared Bootstrap & Restructuring (not started)`. This tracker mirrors only Dev B's role-safe execution path.

> Each gate (G) corresponds to a phase (P): G1 = P1, G2 = P2, etc.
> All checkboxes require proof before they can be marked `[x]`.

---

## G0 — Project Setup `[complete]`
- [x] G0.1 Identity captured from copied source docs
- [x] G0.2 Developer profile inferred and recorded for Priyan
- [x] G0.3 Category locked as `web`
- [x] G0.4 Dev B features, routes, models, and integrations mapped
- [x] G0.5 Constraints and red lines recorded
- [x] G0.6 Critique and cross-check completed
- [x] `_fill_manifest.md` fully populated
- [x] `ProjectSummary.md`, `Codex_guide.md`, `BuildFlow.md`, and `Progress.md` generated
- [x] Placeholder audit completed for filled files
- [x] Obsolete `ProjectSummary_*` templates removed from `codex/`

---

## Contract and Handoff Notes

Add one line per exact upstream or downstream handoff. Use commit hashes or PR links whenever possible.

- None recorded yet

---

## P1 — Bootstrap Access and Collaborator Readiness `[not started]`
- [ ] accept the GitHub repository collaborator invite
- [ ] open the `dev-b/_access-check` branch or PR path once access is granted
- [ ] confirm a Dev B PR can target `develop` and run CI
- [ ] accept the shared Supabase project invite
- [ ] confirm the shared Supabase dashboard is readable
- [ ] read `references/build/shared/ownership.md` core rules, Dev B boundaries, and allowed blockers
- [ ] read `references/build/shared/conventions.md` branch, PR, release, and blocker rules
- [ ] read `references/build/shared/bootstrap.md` and isolate the Dev B bootstrap items: B5, C3, C4 verification, D2, review of A1 and B2
- [ ] read `references/build/contracts/*.ts` end-to-end before funding code starts
- [ ] confirm root `claude/CurrentStatus.md` still says bootstrap is the current entry phase and no V2 code has started
- [ ] note that no funding feature code should ship during V2.P1 beyond bootstrap prep and local schema/source drafting
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P2 — Scraper Workspace and Shared Bootstrap Support `[locked — requires P1]`
- [ ] create `scraper/package.json`
- [ ] add the scraper package dependencies required by bootstrap: `cheerio` and `@supabase/supabase-js`
- [ ] create `scraper/tsconfig.json`
- [ ] create `scraper/index.ts` with the bootstrap log line
- [ ] create `scraper/README.md` explaining how the scraper is invoked locally and from GitHub Actions
- [ ] install scraper dependencies and verify `cd scraper && npx tsx index.ts` prints the bootstrap line
- [ ] create `.github/workflows/scrape.yml` with `workflow_dispatch`
- [ ] make the workflow run `cd scraper && npm ci && npx tsx index.ts`
- [ ] confirm the workflow is still a stub and does not schedule cron yet
- [ ] trigger the manual workflow from GitHub UI
- [ ] confirm workflow logs prove the Supabase secrets are visible without printing secret values
- [ ] leave funding domain code for later phases; this phase is only bootstrap support
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P3 — Funding Contract Lock and Shared Bootstrap Gate `[locked — requires P2]`
- [ ] review the draft `references/build/contracts/funding.ts` field set with Dev A
- [ ] ensure the funding contract covers `FundingItem`, `FundingSummary`, `FundingPreferences`, and `FundingQuery`
- [ ] move `funding.ts` to locked status with shared review
- [ ] review and approve Dev A's mixed-file surgery PR
- [ ] review and approve Dev A's Supabase dependency install PR
- [ ] draft `0003_funding.sql` locally without committing it before V2.P2
- [ ] draft 2-3 local source reconnaissance notes for future ETL work
- [ ] confirm the scraper bootstrap item B5 is complete
- [ ] confirm the scrape workflow stub item C3 is complete
- [ ] confirm the GitHub Actions secret visibility proof item C4 is complete
- [ ] confirm the bootstrap gate is green for Dev B-owned items before V2.P2 begins
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P4 — Funding Schema `[locked — requires P3]`
- [ ] create `supabase/migrations/0003_funding.sql`
- [ ] define enum types for `FundingType`, `FundingStatus`, and `source`
- [ ] create the `funding` table with the locked `FundingItem` fields: `id`, `type`, `name`, `description`, `provider`, `amount_min`, `amount_max`, `deadline`, `application_url`, `source_url`, `eligibility`, `requirements`, `category`, `tags`, `source`, `scraped_from`, `scraped_at`, `status`, `created_at`, and `updated_at`
- [ ] add the `(type, status, deadline)` index
- [ ] add the `(type, status, created_at desc)` index
- [ ] add the `updated_at` trigger for the `funding` table
- [ ] create `funding_preferences` keyed by `(user_id, role)`
- [ ] include `default_filters jsonb`, `created_at`, and `updated_at` on `funding_preferences`
- [ ] keep saved defaults DB-backed and do not use cookies as the primary persistence path
- [ ] apply `0003_funding.sql` to the shared dev DB
- [ ] verify the `funding` and `funding_preferences` tables exist in SQL after `supabase db push`
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P5 — Seed Data and Core Helpers `[locked — requires P4]`
- [ ] create `supabase/seeds/funding_seed.sql`
- [ ] add 5-10 manual seed rows for business grants
- [ ] add 5-10 manual seed rows for scholarships
- [ ] add 5-10 manual seed rows for research funding
- [ ] create `lib/funding/supabase.ts`
- [ ] define the query client path for regular reads and the service-role path for future ingestion use
- [ ] create `lib/funding/role-mapping.ts`
- [ ] ensure the role map covers `business`, `student`, and `professor`
- [ ] create `lib/funding/filter-definitions.ts`
- [ ] create a business-specific filter definition
- [ ] create a student-specific filter definition
- [ ] create a professor-specific filter definition
- [ ] create `lib/funding/preferences.ts`
- [ ] implement `getFundingPreferences(user_id, role)`
- [ ] implement `upsertFundingPreferences(user_id, role, default_filters)`
- [ ] implement `clearFundingPreferences(user_id, role)`
- [ ] create `lib/funding/queries.ts`
- [ ] implement `ListFundingForRole(query)`
- [ ] implement `GetFundingById(id)`
- [ ] implement `GetFundingSummariesForUser(user_id, limit)` returning recent items without scoring at this stage
- [ ] add tests for funding queries against seeded data
- [ ] add tests for role mapping coverage
- [ ] add tests for funding preference create, update, read, and clear
- [ ] verify `ListFundingForRole({ role: 'student' })` returns only scholarship rows
- [ ] verify saved default filters survive reload and are not cookie-only
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P6 — Listing Pages, Filters, and Route Policies `[locked — requires P5]`
- [ ] do not start until the Step 1 helpers from P5 are callable from tests
- [ ] create `app/(funding)/grants/page.tsx`
- [ ] create `app/(funding)/scholarships/page.tsx`
- [ ] create `app/(funding)/research-funding/page.tsx`
- [ ] create `app/(funding)/grants/[id]/page.tsx`
- [ ] create `app/(funding)/scholarships/[id]/page.tsx`
- [ ] create `app/(funding)/research-funding/[id]/page.tsx`
- [ ] create `components/funding/FundingList.tsx`
- [ ] create `components/funding/FundingCard.tsx`
- [ ] create `components/funding/FundingDetail.tsx`
- [ ] create `components/funding/FundingFilters.tsx`
- [ ] make `FundingFilters` render the role-specific filter set for each route
- [ ] make `FundingFilters` sync short-term state to query params
- [ ] make `FundingFilters` save and reload defaults through `funding_preferences`
- [ ] create `components/funding/FundingSummaryTile.tsx` as a pure presentation component for Dev A
- [ ] create `lib/funding/route-policies.ts`
- [ ] overwrite Dev A's temporary empty registry file with the real `fundingPolicies`
- [ ] register `/grants` for business users
- [ ] register `/scholarships` for student users
- [ ] register `/research-funding` for professor users
- [ ] if Dev A's `GetSession()` is not yet on `develop`, temporarily hard-code the route role per listing page and record a one-line follow-up to replace it later
- [ ] if Dev A's `GetSession()` is available, wire the listing pages to it instead of hard-coded role assumptions
- [ ] verify `/grants`, `/scholarships`, and `/research-funding` render seed data
- [ ] verify one detail page per role renders eligibility data correctly
- [ ] verify middleware picks up `fundingPolicies` on a fresh build
- [ ] add at least a snapshot or render test for `FundingCard`
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P7 — Matching Scorer Units `[locked — requires P6]`
- [ ] create `lib/matching/business.ts`
- [ ] implement `scoreBusinessGrant(profile, item)` with the locked weights: location 25, revenue 25, employees 20, industry 30
- [ ] create `lib/matching/student.ts`
- [ ] implement `scoreScholarship(profile, item)` with the locked weights: education level 30, field of study 25, institution 15, province 15, GPA 15
- [ ] explicitly avoid citizenship or residency weighting because those fields are not in the locked contract
- [ ] create `lib/matching/professor.ts`
- [ ] implement `scoreResearchGrant(profile, item)` with the locked weights: research area 30, career stage 25, council 20, institution 15, past funding 10
- [ ] create `lib/matching/index.ts`
- [ ] implement `scoreFor(roleProfile, item)` dispatch across the three role-specific scorers
- [ ] build fixture sets for perfect-match, partial-match, and no-match outcomes
- [ ] add unit tests proving the scorers return values in the 0-100 range
- [ ] add unit tests proving dispatch works for all three role variants
- [ ] do not wait for Dev A runtime publishing here; pure scorer work is independent
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P8 — Matching Runtime Wiring `[locked — requires P7]`
- [ ] wait for Dev A to publish `lib/profile/queries.ts#getRoleProfile` on `develop`
- [ ] if the helper is not published, log the exact blocker name `getRoleProfile` and do not reimplement it inside Dev B files
- [ ] update `GetFundingSummariesForUser(user_id, limit)` to call `getRoleProfile(user_id)`
- [ ] map the profile role to the correct funding type before scoring active items
- [ ] score each active item and return `FundingSummary.match_score`
- [ ] keep `ListFundingForRole()` returning `FundingItem[]` exactly as the locked contract requires
- [ ] return recent rows with `match_score: null` when `getRoleProfile()` returns `null`
- [ ] avoid adding any score field to `FundingItem`
- [ ] add tests proving scored summaries are returned for onboarded users
- [ ] add tests proving `match_score` stays `null` when role/profile data is missing
- [ ] capture one real or fixture-backed proof showing plausible ordering for a seeded user
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P9 — ETL Source Verification Docs `[locked — requires P8]`
- [ ] open the docs PR `docs(scraper): verify V2 ETL sources`
- [ ] record the `robots.txt` URL for Innovation Canada / ISED Business Benefits Finder
- [ ] record the `robots.txt` URL for ISED Supports for Business
- [ ] record the `robots.txt` URL for EduCanada Scholarships
- [ ] record the `robots.txt` URL for the Indigenous Bursaries Search Tool
- [ ] record the `robots.txt` URL for NSERC Funding Opportunities
- [ ] record the `robots.txt` URL for SSHRC Funding Opportunities
- [ ] record the relevant ToS note or absence-of-problem note for each of the six sources
- [ ] record the chosen scrape cadence for each of the six sources
- [ ] record the listing/detail URL pattern for each of the six sources
- [ ] confirm the locked V2 source set remains exactly six sources total
- [ ] confirm CIHR remains deferred for post-V2 ETL expansion
- [ ] confirm no private aggregators appear in any ETL planning file or checklist
- [ ] merge the verification PR before any source module lands
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P10 — Scraper Core Pipeline and Metadata `[locked — requires P9]`
- [ ] create `scraper/types.ts`
- [ ] define the shared `ScrapedFunding` and `Scraper` interfaces
- [ ] create `scraper/utils.ts`
- [ ] implement `parseAmount`
- [ ] implement `parseDate`
- [ ] implement `cleanText`
- [ ] create `scraper/normalize.ts`
- [ ] make normalization set `source: 'scraped'`, `scraped_from`, `scraped_at`, and `status: 'active'`
- [ ] create `scraper/deduplicate.ts`
- [ ] implement insert, update, and skip behavior keyed by `(name, provider, type)`
- [ ] create `scraper/expire.ts`
- [ ] expire past-deadline rows by moving them from `active` to `expired`
- [ ] create `scraper/index.ts`
- [ ] register source modules through a central `SOURCES` array rather than hard-coding orchestration logic throughout the file
- [ ] make per-source failures log and continue rather than aborting the whole run
- [ ] make per-source counts record fetched, inserted, updated, skipped, and errors
- [ ] create `supabase/migrations/0004_scrape_metadata.sql`
- [ ] add `funding_sources`
- [ ] add `scrape_runs`
- [ ] apply `0004_scrape_metadata.sql` to the shared dev DB
- [ ] add ETL-core tests for utilities, normalization, dedupe, and failure isolation
- [ ] verify `funding_sources` and `scrape_runs` exist in SQL after migration
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P11 — Business Source Modules `[locked — requires P10]`
- [ ] create the ISED Business Benefits Finder scraper module
- [ ] create the ISED Supports for Business scraper module
- [ ] add a leading verification comment to each source module referencing the merged docs PR
- [ ] rate-limit requests in the Business Benefits Finder module
- [ ] rate-limit requests in the Supports for Business module
- [ ] parse the source pages into `ScrapedFunding`
- [ ] normalize imported business rows into locked funding fields
- [ ] ensure imported rows carry `source_url`
- [ ] ensure imported rows carry `scraped_from`
- [ ] ensure imported rows carry `scraped_at`
- [ ] add fixture tests for both business source modules
- [ ] verify both sources register through `SOURCES` without special orchestrator branching
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P12 — Student and Professor Source Modules plus Schedule `[locked — requires P11]`
- [ ] create the EduCanada Scholarships scraper module
- [ ] create the Indigenous Bursaries Search Tool scraper module
- [ ] create the NSERC Funding Opportunities scraper module
- [ ] create the SSHRC Funding Opportunities scraper module
- [ ] add a leading verification comment to each module referencing the merged docs PR
- [ ] rate-limit requests in all four remaining modules
- [ ] add fixture tests for all four remaining modules
- [ ] ensure imported student and professor rows carry `source_url`
- [ ] ensure imported student and professor rows carry `scraped_from`
- [ ] ensure imported student and professor rows carry `scraped_at`
- [ ] update `.github/workflows/scrape.yml` to enable the cron schedule `0 3 * * *`
- [ ] verify a deliberate throw in one source does not stop the other five
- [ ] verify a clean manual run creates at least one row per source on a clean DB
- [ ] verify `scrape_runs` records per-source counts after the full run
- [ ] demonstrate that adding a future source requires only a new file plus one new `SOURCES` registration line
- [ ] confirm no private aggregators were introduced while implementing the source modules
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P13 — Funding RLS `[locked — requires P12]`
- [ ] wait for Dev A to apply `0010_rls_identity.sql` to the shared dev DB
- [ ] if `0010_rls_identity.sql` is not yet applied, log the exact blocker and stage the SQL locally without pushing it to the shared DB
- [ ] create `supabase/migrations/0020_rls_funding.sql`
- [ ] make anonymous funding reads return no rows
- [ ] make authenticated funding reads return only active rows for the current profile role
- [ ] use the `profiles.role` join shape that the locked identity schema guarantees
- [ ] restrict `funding_preferences` reads to the owner's own row
- [ ] restrict `funding_preferences` writes to the owner's own row and current role
- [ ] keep `funding_sources` and `scrape_runs` behind service-role access unless an explicit later status-page decision changes that
- [ ] keep `funding` insert, update, and delete service-role only for scraper ingestion
- [ ] apply `0020_rls_funding.sql` once the identity-side RLS dependency is cleared
- [ ] verify cross-role queries return nothing
- [ ] verify anonymous queries return nothing
- [ ] verify users cannot read or write another user's `funding_preferences`
- [ ] verify service-role ingestion still works after funding RLS lands
- [ ] run integration tests with at least two role users
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P14 — Integration Publishing Handoff `[locked — requires P13]`
- [ ] wait for the shared `release: V2.P3 complete` PR to merge to `main`
- [ ] verify the funding runtime exports on `main` are now backed by real ETL data
- [ ] confirm the shipped runtime surface includes `ListFundingForRole`, `GetFundingById`, `GetFundingSummariesForUser`, `fundingPolicies`, and `FundingSummaryTile`
- [ ] add a named handoff line in Dev A's notes section with the V2.P3 release commit hash
- [ ] make the handoff line explicitly say the dashboard may now consume real ETL-backed summaries
- [ ] review Dev A's dashboard integration PR
- [ ] do not edit `app/dashboard/**` while reviewing the integration
- [ ] verify Dev A consumed the published contract unchanged
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P15 — Hardening and Data Quality `[locked — requires P14]`
- [ ] grep Dev B-owned files for imports from `lib/demo`
- [ ] grep Dev B-owned files for imports from `components/demo`
- [ ] remove any demo imports found in funding, matching, or scraper code
- [ ] add data-quality assertions that fail when `amount_min > amount_max`
- [ ] add data-quality assertions that fail when `status='active'` on a past-deadline row
- [ ] add data-quality assertions or checks ensuring scraped rows preserve `source_url`, `scraped_from`, and `scraped_at`
- [ ] update `scraper/README.md` with env vars, run command, and expected output
- [ ] add or expand end-to-end coverage for listing, filter, detail, and summary behavior
- [ ] run the data-quality checks on the shared dev DB
- [ ] run funding and scraper tests green after the cleanup
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P16 — Release Gate Prep on Develop `[locked — requires P15]`
- [ ] ensure the blockers section is empty or every active blocker has been resolved with a named deliverable
- [ ] run `npm run lint` if the funding UI touched shared frontend code
- [ ] run `npm run build`
- [ ] run `npm test`
- [ ] run scraper tests or ETL verification tests
- [ ] confirm the ETL source verification docs PR is merged and referenced in release notes
- [ ] draft the release notes for the current phase
- [ ] list the shipped runtime exports in the release notes
- [ ] list the applied migrations in the release notes
- [ ] list the ETL state and source coverage in the release notes
- [ ] attach data-quality proof and demo-import audit proof to the release prep notes
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P17 — Third-Project QA and Shared Release Verification `[locked — requires P16]`
- [ ] wait for the shared-space QA checklist and third-project setup notes to be ready
- [ ] verify the shared phase release PR merges with both approvals
- [ ] run third-project QA for the three funding listings
- [ ] run third-project QA for role-specific filters and saved defaults
- [ ] run third-project QA for detail pages
- [ ] run third-project QA for matching summaries
- [ ] run third-project QA for ETL metadata visibility and stored scrape history expectations
- [ ] run third-project QA for cross-role and anonymous RLS denial
- [ ] run third-project QA for scraper service-role ingestion after policies are active
- [ ] verify the runtime exports still match the locked contracts after the final release merge
- [ ] attach QA notes and the final release PR reference
- [ ] record the final `git log --oneline -1` or merge commit reference for this phase close
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

---

## Blockers

Use only named blockers from `references/build/shared/ownership.md`.

- None recorded yet
