# Build Flow

> This 17-gate flow is a **Dev B translation** of the copied Auctus V2 docs.
> It does not change the real project phases; it breaks Dev B's locked track into proof-driven checkpoints that stay inside Dev B ownership.

## Prerequisites

- Read `ProjectSummary.md`, `Codex_guide.md`, `Progress.md`, and `references/README.md` before starting work
- Read `Migration.md` before choosing where the phase implementation should live
- Node/npm compatible with the repo, GitHub repo access, and shared Supabase access are required before feature work
- Supabase CLI and GitHub Actions access are part of bootstrap; do not skip them
- Do not add Docker, Prisma, extra funding roles, private aggregators, AI-chat work, or new design-system exploration in this workspace
- Do not edit Dev A-owned folders except through an approved shared-file or contract protocol

Every phase closes only after the matching migration checkbox in `Progress.md` is checked. The record must follow `Migration.md` and name either `direct-main` execution or `workspace-draft` migration with real-project target paths and a commit/PR reference.

---

## P1 — Bootstrap Access and Collaborator Readiness `[GATE G1]`
**Goal:** establish Dev B's safe access to the shared repo and Supabase project before feature work starts
- [ ] repo collaborator access is accepted and the access-check PR runs CI
- [ ] Supabase project access is accepted and readable
- [ ] ownership and contract docs are read before bootstrap contributions begin
**Proof:** show the access-check PR, confirm Supabase dashboard access, and show the copied ownership/contracts docs used for kickoff  
**Commit:** `chore(bootstrap): confirm dev-b access and ownership context`

## P2 — Scraper Workspace and Shared Bootstrap Support `[GATE G2 — requires G1]`
**Goal:** deliver Dev B's bootstrap contributions and verify the scraper workflow skeleton
- [ ] `scraper/` skeleton exists and runs locally
- [ ] `scrape.yml` manual workflow succeeds
- [ ] GitHub Actions secrets are visible to the workflow
**Proof:** run `cd scraper && npx tsx index.ts`, show the manual workflow result, and confirm non-secret env-var presence in workflow logs  
**Commit:** `chore(bootstrap): add scraper workspace and workflow stub`

## P3 — Funding Contract Lock and Shared Bootstrap Gate `[GATE G3 — requires G2]`
**Goal:** finish the Dev B side of V2.P1 and lock the funding contract
- [ ] `funding.ts` is LOCKED after shared review
- [ ] draft `0003_funding.sql` and source reconnaissance notes exist
- [ ] shared bootstrap gate is green for Dev B-owned items
**Proof:** show the LOCKED funding contract, the local schema/source notes, and the green bootstrap checklist entries for Dev B  
**Commit:** `docs(contracts): lock funding contract and close bootstrap`

## P4 — Funding Schema `[GATE G4 — requires G3]`
**Goal:** create the unified funding table and persisted saved-filter storage
- [ ] `0003_funding.sql` is applied
- [ ] `funding_preferences` exists keyed by `(user_id, role)`
- [ ] cookie-only persistence is not used as the primary storage path
**Proof:** run `supabase db push` and show the `funding` and `funding_preferences` tables in SQL  
**Commit:** `feat(db): add funding and preference schema`

## P5 — Seed Data and Core Helpers `[GATE G5 — requires G4]`
**Goal:** make the funding domain queryable before the page layer lands
- [ ] `supabase/seeds/funding_seed.sql` provides seed rows for all three funding types
- [ ] funding helper modules and preference helpers exist
- [ ] query tests prove role-aware filtering works on seeded data
**Proof:** run the funding query tests and show seeded rows of all three types in the shared dev DB  
**Commit:** `feat(funding): add seed data and core funding helpers`

## P6 — Listing Pages, Filters, and Route Policies `[GATE G6 — requires G5]`
**Goal:** expose the funding domain through role-specific UI routes and publish the funding registry
- [ ] listing and detail pages exist for grants, scholarships, and research funding
- [ ] `FundingFilters` renders role-specific filters and saves defaults through `funding_preferences`
- [ ] `fundingPolicies` and `FundingSummaryTile` are published for Dev A consumption
**Proof:** demonstrate all three listings and one detail page per role, then show middleware picking up `fundingPolicies` on a fresh build  
**Commit:** `feat(funding): add role-aware listing detail and route policies`

## P7 — Matching Scorer Units `[GATE G7 — requires G6]`
**Goal:** implement and test the pure role-specific match-scoring functions
- [ ] `scoreBusinessGrant`, `scoreScholarship`, and `scoreResearchGrant` exist
- [ ] `scoreFor` dispatches by discriminated role profile
- [ ] fixtures cover perfect, partial, and no-match cases
**Proof:** run the matching unit tests and show 0-100 scores for each role's fixture set  
**Commit:** `feat(matching): add pure role-based scorers`

## P8 — Matching Runtime Wiring `[GATE G8 — requires G7]`
**Goal:** wire score generation into `GetFundingSummariesForUser` using Dev A's published runtime helper
- [ ] `getRoleProfile(user_id)` is consumed rather than reimplemented
- [ ] scored summaries are returned for onboarded users
- [ ] `match_score` is `null` when the role profile is unavailable
**Proof:** run summary-query tests against a real or fixture-backed role profile and show scored results for a real test user  
**Commit:** `feat(matching): wire role profiles into funding summaries`

## P9 — ETL Source Verification Docs `[GATE G9 — requires G8]`
**Goal:** lock the practical scrape rules before committing source modules
- [ ] a docs PR records robots.txt, ToS notes, cadence, and URL pattern for all six sources
- [ ] the source list matches the locked V2 decision exactly
- [ ] no private aggregator appears in any ETL planning artifact
**Proof:** show the merged verification PR and the six-source checklist  
**Commit:** `docs(scraper): verify V2 ETL sources`

## P10 — Scraper Core Pipeline and Metadata `[GATE G10 — requires G9]`
**Goal:** build the reusable ETL core before adding all source modules
- [ ] core ETL modules exist
- [ ] `0004_scrape_metadata.sql` is applied
- [ ] per-source counts and failure isolation are wired into the pipeline
**Proof:** run the ETL unit tests and show `funding_sources` plus `scrape_runs` tables in SQL  
**Commit:** `feat(scraper): add core ETL pipeline and metadata tables`

## P11 — Business Source Modules `[GATE G11 — requires G10]`
**Goal:** land the two locked business-source scrapers with correct normalization metadata
- [ ] ISED Business Benefits Finder module exists
- [ ] ISED Supports for Business module exists
- [ ] both modules rate-limit requests and populate `source_url`, `scraped_from`, and `scraped_at`
**Proof:** run source-module fixture tests and show imported business rows carrying the required metadata fields  
**Commit:** `feat(scraper): add business funding source modules`

## P12 — Student and Professor Source Modules plus Schedule `[GATE G12 — requires G11]`
**Goal:** finish the remaining four locked sources and activate the scheduled workflow
- [ ] EduCanada, Indigenous Bursaries Search Tool, NSERC, and SSHRC modules exist
- [ ] cron schedule is live at `0 3 * * *`
- [ ] a failure in one source does not stop the others
**Proof:** run the full scraper test suite, show the cron-enabled workflow file, and demonstrate one-source failure isolation  
**Commit:** `feat(scraper): add remaining V2 source modules and schedule`

## P13 — Funding RLS `[GATE G13 — requires G12]`
**Goal:** enforce funding visibility and preference ownership in the database
- [ ] `0020_rls_funding.sql` is applied
- [ ] anonymous and cross-role funding reads return nothing
- [ ] users cannot read or write another user's `funding_preferences`
**Proof:** run the RLS integration tests with at least two role users and show service-role ingestion still succeeds afterward  
**Commit:** `feat(rls): add funding-side visibility policies`

## P14 — Integration Publishing Handoff `[GATE G14 — requires G13]`
**Goal:** publish the stable funding runtime surface for Dev A dashboard composition
- [ ] V2.P3 funding runtime exports are shipped on `main` against real ETL data
- [ ] Dev A receives a named handoff entry for `GetFundingSummariesForUser`
- [ ] Dev B reviews the dashboard integration PR without editing `app/dashboard/**`
**Proof:** show the release merge commit, the handoff note in Dev A progress, and the dashboard tile consuming the published contract unchanged  
**Commit:** `docs(funding): confirm dashboard handoff readiness`

## P15 — Hardening and Data Quality `[GATE G15 — requires G14]`
**Goal:** remove demo bleed and prove the funding data remains sane
- [ ] no active Dev B file imports from `lib/demo` or `components/demo`
- [ ] data-quality assertions catch invalid amounts and stale active deadlines
- [ ] `scraper/README.md` documents env, run, and expected output
**Proof:** run the demo-import grep, run data-quality checks on the shared dev DB, and show the updated scraper README  
**Commit:** `chore(hardening): remove demo imports and add data-quality checks`

## P16 — Release Gate Prep on Develop `[GATE G16 — requires G15]`
**Goal:** finish Dev B's checklist before the shared phase-release PR
- [ ] all Dev B tests are green on `develop`
- [ ] blockers section is empty or explicitly resolved
- [ ] release PR notes clearly name the shipped runtime exports, migrations, and ETL state
**Proof:** show green `npm test`, `npm run build`, scraper tests, and the drafted release PR notes  
**Commit:** `docs(release): prepare funding release gate`

## P17 — Third-Project QA and Shared Release Verification `[GATE G17 — requires G16]`
**Goal:** complete the shared release gate and independent verification on a fresh Supabase project
- [ ] the `release: V2.PN complete` PR merges with both approvals
- [ ] third Supabase project QA succeeds for funding listings, matching summaries, ETL metadata, and RLS
- [ ] final runtime exports remain contract-correct after release
**Proof:** show the release PR merge, the third-project QA notes, and `git log --oneline -1`  
**Commit:** `docs(qa): record Dev B release and QA verification`
