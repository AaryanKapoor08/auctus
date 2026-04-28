# Fill Manifest
# Canonical filled record for the Dev B Likit workspace.

workspace_scope: Dev B execution lens on the full Auctus V2 project; canonical project summary stays identical across all spaces

---

## IDENTITY
name: Auctus
tagline: Funding and pipeline track for the real multi-role Auctus V2 platform
problem: Auctus must stop behaving like a static business-only funding demo and become a real role-aware funding product. Dev B's track solves that problem by implementing the unified funding domain, saved funding preferences, matching, ETL ingestion, and funding-side visibility controls while keeping all identity and community implementation inside Dev A's ownership.
type: production
category: web
core_constraint: a user must only see active funding rows appropriate to their role, and the ETL pipeline must normalize the six locked official V2 sources into the unified funding model without breaking that visibility rule.

---

## DEVELOPER
dev_name: Priyan
dev_level: intermediate
dev_knows: TypeScript, React, Next.js, Tailwind, Git, data-driven UI work
dev_gaps: Supabase RLS, raw SQL migrations, ETL normalization, scraper workflow operations, GitHub Actions scheduling and secrets
dev_goal: independently ship the funding and pipeline track of Auctus V2 while respecting Dev A ownership boundaries

---

## TECH STACK
| Layer | Technology | Host |
|---|---|---|
| Frontend | Next.js 16 + React 19 + Tailwind CSS 4 | local dev now; production host deferred |
| Backend runtime | Next.js App Router server components and library exports | same Next.js app |
| Database | Supabase Postgres | Supabase |
| Access control | Postgres RLS | Supabase |
| ETL workspace | TypeScript Node workspace under `scraper/` | GitHub Actions + local dev |
| Scraping | cheerio | scraper workspace |
| Testing | Vitest | local dev + GitHub Actions |
| CI/CD | GitHub Actions | GitHub |

---

## COMMIT CONFIG
scopes: funding, matching, scraper, db, rls, ci, docs, restructure
tdd_targets: roleToFundingType, funding query filtering, funding preference helpers, filter-definition validation, scoreBusinessGrant, scoreScholarship, scoreResearchGrant, normalize, deduplicate, expire
docker_phase: not in current V2 scope
ci_phase: P2

---

## ARCHITECTURE DECISIONS
D1_title: One unified funding table
D1_decision: Use one `funding` table with a `type` discriminator for business grants, scholarships, and research grants.
D1_why: The locked V2 plan wants one funding domain that can power list/detail pages, summaries, matching, and RLS without duplicating schema or page logic three times.

D2_title: DB-backed funding preferences
D2_decision: Persist saved default filters in `funding_preferences` keyed by `(user_id, role)`.
D2_why: Defaults must survive devices and support server-side personalization; cookie-only persistence is too weak for the committed product direction.

D3_title: Role-specific filters in a shared framework
D3_decision: Reuse filter infrastructure where possible but keep each role's filters distinct.
D3_why: Business, student, and professor funding needs are materially different, and the build docs explicitly reject a bland generic filter set.

D4_title: GitHub Actions plus cheerio ETL
D4_decision: Run scraping in a separate `scraper/` workspace through GitHub Actions using cheerio.
D4_why: This is the locked V2 path for official-source ingestion on the free-tier stack and avoids adding a second hosted runtime.

D5_title: Six official V2 sources only
D5_decision: Limit V2 ETL to ISED Business Benefits Finder, ISED Supports for Business, EduCanada Scholarships, Indigenous Bursaries Search Tool, NSERC, and SSHRC.
D5_why: The source list is explicitly locked in the shared docs; Dev B verifies robots.txt and ToS but does not reopen source selection.

D6_title: Funding RLS keyed off profile role
D6_decision: Enforce funding visibility in the database using `profiles.role` and authenticated user identity.
D6_why: Route-level gating alone is not enough; the database must also reject cross-role and anonymous reads.

D7_title: Demo isolation instead of mutation
D7_decision: Build the real funding track in owned V2 folders and leave demo funding routes frozen in `(demo)`.
D7_why: Dev B needs a clean funding domain instead of layering real behavior on top of V1 demo assumptions.

---

## DATA / STRUCTURE

### web: Models
model_1: FundingItem | id: uuid required | type: business_grant|scholarship|research_grant required | name: text required | description: text optional | provider: text required | amount_min: number optional | amount_max: number optional | deadline: iso-date optional | application_url: text optional | source_url: text optional | eligibility: jsonb required | requirements: text[] required | category: text optional | tags: text[] required | source: scraped|manual required | scraped_from: text optional | scraped_at: iso-timestamp optional | status: active|expired|archived required | created_at: timestamp required | updated_at: timestamp required
model_2: FundingSummary | id: uuid required | type: business_grant|scholarship|research_grant required | name: text required | provider: text required | amount_max: number optional | deadline: iso-date optional | match_score: number optional
model_3: FundingPreferences | user_id: uuid required ref profiles.id | role: Role required | default_filters: jsonb required | created_at: timestamp required | updated_at: timestamp required | primary key: (user_id,role)
model_4: FundingSource | id: uuid required | role: Role required | name: text required | base_url: text required | cadence: text required | active: boolean required
model_5: ScrapeRun | id: uuid required | source_id: uuid required ref funding_sources.id | started_at: timestamp required | finished_at: timestamp optional | fetched_count: integer required | inserted_count: integer required | updated_count: integer required | skipped_count: integer required | error_count: integer required | status: text required

---

## SEED / FIXTURES / TEST DATA
strategy: commit `supabase/seeds/funding_seed.sql` with 5-10 manual rows per funding type for early list/detail work; use role-specific filter fixtures and RoleProfile fixtures for matching tests; use fixture HTML for each scraper source module; record real scrape metadata in `scrape_runs` during workflow tests rather than relying on demo JSON.

---

## CORE LOGIC
logic: 1) funding pages call `ListFundingForRole` or `GetFundingById`; 2) role maps to the correct funding type and role-specific filter set; 3) `funding_preferences` stores durable defaults keyed by user and role; 4) `GetFundingSummariesForUser` can score active items using Dev A's published `RoleProfile`; 5) GitHub Actions runs `scraper/index.ts`, which invokes source modules, normalizes records, deduplicates updates, expires stale opportunities, and records per-source counts; 6) funding-side RLS rejects anonymous and cross-role reads; 7) Dev A consumes only the published summary exports and tile component for dashboard composition.

---

## FEATURES
feature_1: Unified funding table for grants, scholarships, and research funding
feature_2: DB-backed saved default filters in `funding_preferences`
feature_3: Role-specific funding listing and detail pages
feature_4: Role-specific filter definitions with a shared framework
feature_5: Per-role matching algorithms using the locked `RoleProfile` contract
feature_6: ETL ingestion from the six locked official V2 sources
feature_7: Funding-side RLS and published summary exports for Dev A dashboard composition

---

## ROUTES / ENTRY POINTS / SCREENS

### web: Routes
public_routes:
  - none in Dev B's owned surface; Dev A owns public routes

auth_routes:
  - none in Dev B's owned surface; Dev A owns auth routes

protected_routes:
  - GET /grants | protected business | business funding listing
  - GET /grants/[id] | protected business | business funding detail
  - GET /scholarships | protected student | student funding listing
  - GET /scholarships/[id] | protected student | student funding detail
  - GET /research-funding | protected professor | professor funding listing
  - GET /research-funding/[id] | protected professor | professor funding detail
  - export lib/funding/queries.ts#ListFundingForRole | protected context | role-aware listing helper
  - export lib/funding/queries.ts#GetFundingById | protected context | role-aware detail helper
  - export lib/funding/queries.ts#GetFundingSummariesForUser | protected context | dashboard summary helper
  - export lib/funding/preferences.ts helpers | protected context | save and load default filters
  - export lib/funding/route-policies.ts#fundingPolicies | shared runtime | publish funding routes to Dev A middleware
  - workflow .github/workflows/scrape.yml | GitHub Actions | manual and scheduled ETL run
  - entry scraper/index.ts | Node runtime | orchestrate source modules, normalize, dedupe, expire, and write

---

## RED LINES
redline_1: never edit Dev A-owned identity, onboarding, profile, forum, middleware, or dashboard files except through an approved shared-file or contract protocol
redline_2: never leak cross-role or anonymous funding rows
redline_3: never store `funding_preferences` in cookies as the primary persistence layer
redline_4: never add private/commercial aggregators to the locked V2 source list
redline_5: never change funding contracts or profile-dependent matching assumptions without the contract-change protocol

---

## ENV VARS
env_1: NEXT_PUBLIC_SUPABASE_URL | shared Supabase project URL used by app and scraper client setup | yes
env_2: NEXT_PUBLIC_SUPABASE_ANON_KEY | anon key for app-side RLS-safe queries | yes
env_3: SUPABASE_SERVICE_ROLE_KEY | privileged key for ETL writes and protected workflow execution | yes

---

## PHASES

phase_1_name: Bootstrap Access and Collaborator Readiness
phase_1_goal: establish Dev B's safe access to the shared repo and Supabase project before feature work starts
phase_1_checkboxes:
  - repo collaborator access is accepted and the access-check PR runs CI
  - Supabase project access is accepted and readable
  - ownership and contract docs are read before bootstrap contributions begin
phase_1_proof: Show the access-check PR, confirm Supabase dashboard access, and show the copied ownership/contracts docs used for kickoff.
phase_1_commit: chore(bootstrap): confirm dev-b access and ownership context

phase_2_name: Scraper Workspace and Shared Bootstrap Support
phase_2_goal: deliver Dev B's bootstrap contributions and verify the scraper workflow skeleton
phase_2_checkboxes:
  - `scraper/` skeleton exists and runs locally
  - `scrape.yml` manual workflow succeeds
  - GitHub Actions secrets are visible to the workflow
phase_2_proof: Run `cd scraper && npx tsx index.ts`, show the manual workflow result, and confirm non-secret env-var presence in workflow logs.
phase_2_commit: chore(bootstrap): add scraper workspace and workflow stub

phase_3_name: Funding Contract Lock and Shared Bootstrap Gate
phase_3_goal: finish the Dev B side of V2.P1 and lock the funding contract
phase_3_checkboxes:
  - `funding.ts` is LOCKED after shared review
  - draft `0003_funding.sql` and source reconnaissance notes exist
  - shared bootstrap gate is green for Dev B-owned items
phase_3_proof: Show the LOCKED funding contract, the local schema/source notes, and the green bootstrap checklist entries for Dev B.
phase_3_commit: docs(contracts): lock funding contract and close bootstrap

phase_4_name: Funding Schema
phase_4_goal: create the unified funding table and persisted saved-filter storage
phase_4_checkboxes:
  - `0003_funding.sql` is applied
  - `funding_preferences` exists keyed by `(user_id, role)`
  - cookie-only persistence is not used as the primary storage path
phase_4_proof: Run `supabase db push` and show the `funding` and `funding_preferences` tables in SQL.
phase_4_commit: feat(db): add funding and preference schema

phase_5_name: Seed Data and Core Helpers
phase_5_goal: make the funding domain queryable before the page layer lands
phase_5_checkboxes:
  - `supabase/seeds/funding_seed.sql` provides seed rows for all three funding types
  - `lib/funding/supabase.ts`, query helpers, role mapping, and preferences helpers exist
  - query tests prove role-aware filtering works on seeded data
phase_5_proof: Run the funding query tests and show seeded rows of all three types in the shared dev DB.
phase_5_commit: feat(funding): add seed data and core funding helpers

phase_6_name: Listing Pages, Filters, and Route Policies
phase_6_goal: expose the funding domain through role-specific UI routes and publish the funding registry
phase_6_checkboxes:
  - listing and detail pages exist for grants, scholarships, and research funding
  - `FundingFilters` renders role-specific filters and saves defaults through `funding_preferences`
  - `fundingPolicies` and `FundingSummaryTile` are published for Dev A consumption
phase_6_proof: Demonstrate all three listings and one detail page per role, then show middleware picking up `fundingPolicies` on a fresh build.
phase_6_commit: feat(funding): add role-aware listing detail and route policies

phase_7_name: Matching Scorer Units
phase_7_goal: implement and test the pure role-specific match-scoring functions
phase_7_checkboxes:
  - `scoreBusinessGrant`, `scoreScholarship`, and `scoreResearchGrant` exist
  - `scoreFor` dispatches by discriminated role profile
  - fixtures cover perfect, partial, and no-match cases
phase_7_proof: Run the matching unit tests and show 0-100 scores for each role's fixture set.
phase_7_commit: feat(matching): add pure role-based scorers

phase_8_name: Matching Runtime Wiring
phase_8_goal: wire score generation into `GetFundingSummariesForUser` using Dev A's published runtime helper
phase_8_checkboxes:
  - `getRoleProfile(user_id)` is consumed rather than reimplemented
  - scored summaries are returned for onboarded users
  - `match_score` is `null` when the role profile is unavailable
phase_8_proof: Run summary-query tests against a real or fixture-backed role profile and show scored results for a real test user.
phase_8_commit: feat(matching): wire role profiles into funding summaries

phase_9_name: ETL Source Verification Docs
phase_9_goal: lock the practical scrape rules before committing source modules
phase_9_checkboxes:
  - a docs PR records robots.txt, ToS notes, cadence, and URL pattern for all six sources
  - the source list matches the locked V2 decision exactly
  - no private aggregator appears in any ETL planning artifact
phase_9_proof: Show the merged verification PR and the six-source checklist.
phase_9_commit: docs(scraper): verify V2 ETL sources

phase_10_name: Scraper Core Pipeline and Metadata
phase_10_goal: build the reusable ETL core before adding all source modules
phase_10_checkboxes:
  - `types.ts`, `utils.ts`, `normalize.ts`, `deduplicate.ts`, `expire.ts`, and `index.ts` exist
  - `0004_scrape_metadata.sql` is applied
  - per-source counts and failure isolation are wired into the pipeline
phase_10_proof: Run the ETL unit tests and show `funding_sources` plus `scrape_runs` tables in SQL.
phase_10_commit: feat(scraper): add core ETL pipeline and metadata tables

phase_11_name: Business Source Modules
phase_11_goal: land the two locked business-source scrapers with correct normalization metadata
phase_11_checkboxes:
  - ISED Business Benefits Finder module exists
  - ISED Supports for Business module exists
  - both modules rate-limit requests and populate `source_url`, `scraped_from`, and `scraped_at`
phase_11_proof: Run source-module fixture tests and show imported business rows carrying the required metadata fields.
phase_11_commit: feat(scraper): add business funding source modules

phase_12_name: Student and Professor Source Modules plus Schedule
phase_12_goal: finish the remaining four locked sources and activate the scheduled workflow
phase_12_checkboxes:
  - EduCanada, Indigenous Bursaries Search Tool, NSERC, and SSHRC modules exist
  - cron schedule is live at `0 3 * * *`
  - a failure in one source does not stop the others
phase_12_proof: Run the full scraper test suite, show the cron-enabled workflow file, and demonstrate one-source failure isolation.
phase_12_commit: feat(scraper): add remaining V2 source modules and schedule

phase_13_name: Funding RLS
phase_13_goal: enforce funding visibility and preference ownership in the database
phase_13_checkboxes:
  - `0020_rls_funding.sql` is applied
  - anonymous and cross-role funding reads return nothing
  - users cannot read or write another user's `funding_preferences`
phase_13_proof: Run the RLS integration tests with at least two role users and show service-role ingestion still succeeds afterward.
phase_13_commit: feat(rls): add funding-side visibility policies

phase_14_name: Integration Publishing Handoff
phase_14_goal: publish the stable funding runtime surface for Dev A dashboard composition
phase_14_checkboxes:
  - V2.P3 funding runtime exports are shipped on `main` against real ETL data
  - Dev A receives a named handoff entry for `GetFundingSummariesForUser`
  - Dev B reviews the dashboard integration PR without editing `app/dashboard/**`
phase_14_proof: Show the release merge commit, the handoff note in Dev A progress, and the dashboard tile consuming the published contract unchanged.
phase_14_commit: docs(funding): confirm dashboard handoff readiness

phase_15_name: Hardening and Data Quality
phase_15_goal: remove demo bleed and prove the funding data remains sane
phase_15_checkboxes:
  - no active Dev B file imports from `lib/demo` or `components/demo`
  - data-quality assertions catch invalid amounts and stale active deadlines
  - `scraper/README.md` documents env, run, and expected output
phase_15_proof: Run the demo-import grep, run data-quality checks on the shared dev DB, and show the updated scraper README.
phase_15_commit: chore(hardening): remove demo imports and add data-quality checks

phase_16_name: Release Gate Prep on Develop
phase_16_goal: finish Dev B's checklist before the shared phase-release PR
phase_16_checkboxes:
  - all Dev B tests are green on `develop`
  - blockers section is empty or explicitly resolved
  - release PR notes clearly name the shipped runtime exports, migrations, and ETL state
phase_16_proof: Show green `npm test`, `npm run build`, scraper tests, and the drafted release PR notes.
phase_16_commit: docs(release): prepare funding release gate

phase_17_name: Third-Project QA and Shared Release Verification
phase_17_goal: complete the shared release gate and independent verification on a fresh Supabase project
phase_17_checkboxes:
  - the `release: V2.PN complete` PR merges with both approvals
  - third Supabase project QA succeeds for funding listings, matching summaries, ETL metadata, and RLS
  - final runtime exports remain contract-correct after release
phase_17_proof: Show the release PR merge, the third-project QA notes, and the final `git log --oneline -1`.
phase_17_commit: docs(qa): record Dev B release and QA verification
