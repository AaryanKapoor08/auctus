# Dev B Progress — Priyan

Mirror of `build/dev-b/buildflow.md`. A step is `[x]` only when **proof** is shown, not when code is written.

**Owner:** Priyan
**Domain:** funding & pipelines (funding domain, matching, ETL, ingestion, role-aware visibility)

## Current Phase

V2.P1 — Shared Bootstrap & Restructuring (not started)

## Contract Changes Consumed

(One line per locked-contract change Dev B consumed. Initially empty.)

---

## Step 0 — Shared Bootstrap (V2.P1)

Dev A drives most of bootstrap. Dev B's own items:

- [ ] Accepted GitHub repo collaborator invite; opened `dev-b/_access-check` PR; CI green.
- [ ] Accepted Supabase project invite; can read the dashboard.
- [ ] **B3a** — ran `supabase login` + `supabase link`; `supabase db push` works locally.
- [ ] **B5** — `scraper/` skeleton runs: `cd scraper && npx tsx index.ts` prints bootstrap line.
- [ ] **C3** — `.github/workflows/scrape.yml` manual `workflow_dispatch` succeeds from GitHub UI.
- [ ] **C4** — confirmed scrape workflow can read GitHub Actions secrets (manual run prints non-error log lines for env-var presence).
- [ ] **D2** — `funding.ts` at `// STATUS: LOCKED` after Dev A's review.
- [ ] Reviewed and approved Dev A's surgery PR (A1).
- [ ] Reviewed and approved Dev A's supabase-js install PR (B2).
- [ ] Read `build/contracts/` end-to-end.
- [ ] Drafted (not committed) the `0003_funding.sql` schema and 2-3 source reconnaissance notes.

**Phase commit (in `release: V2.P1 complete` PR):** `chore(bootstrap): scraper workspace and funding contract lock`

---

## Step 1 — Funding Domain Foundation (V2.P2)

- [ ] `supabase/migrations/0003_funding.sql` applied (single migration covering both `funding` and `funding_preferences`); indexes and `updated_at` trigger present.
- [ ] `funding_preferences` table persists default filters per `(user_id, role)`.
- [ ] `supabase/seeds/funding_seed.sql` committed; 5-10 seed rows per type visible in shared dev DB.
- [ ] `lib/funding/supabase.ts` server client.
- [ ] `lib/funding/queries.ts` exports `ListFundingForRole`, `GetFundingById`, `GetFundingSummariesForUser` (no scoring yet — recent-N for the role).
- [ ] `lib/funding/role-mapping.ts` covers all three roles.
- [ ] `lib/funding/filter-definitions.ts` defines role-specific filters for all three funding routes.
- [ ] `lib/funding/preferences.ts` exposes read/upsert/clear helpers for saved defaults.
- [ ] `lib/funding/route-policies.ts` exports `fundingPolicies` (overwrites Dev A's V2.P2 placeholder); registers `/grants`, `/scholarships`, `/research-funding`.
- [ ] Vitest: preference helpers round-trip saved defaults; no cookie usage.
- [ ] Vitest: queries return rows shaped per `FundingItem`/`FundingSummary`.
- [ ] **Proof:** `ListFundingForRole({ role: 'student' })` returns only `scholarship` rows; middleware (Dev A) gates the routes once `fundingPolicies` is imported in `lib/auth/route-policies.ts`.
- [ ] **Commit:** `feat(funding): add unified funding table and query helpers`

---

## Step 2 — Funding Pages (V2.P2)

- [ ] `app/(funding)/grants/page.tsx`, `scholarships/page.tsx`, `research-funding/page.tsx` server components.
- [ ] Per-role detail pages.
- [ ] `components/funding/FundingList.tsx`, `FundingCard.tsx`, `FundingDetail.tsx`, `FundingFilters.tsx`.
- [ ] `FundingFilters.tsx` renders role-specific filters, syncs query params, and saves/reloads DB-backed defaults.
- [ ] `components/funding/FundingSummaryTile.tsx` exported for Dev A.
- [ ] Vitest snapshot for `FundingCard`.
- [ ] **Proof:** all three role listings render seed rows in dev; detail pages render eligibility breakdown.
- [ ] **Commit:** `feat(funding): add role-aware listing and detail pages`

---

## Step 3 — Matching (V2.P3)

- [ ] `lib/matching/business.ts`, `student.ts`, `professor.ts` implemented per ProjectSummary weights.
- [ ] `lib/matching/index.ts` `scoreFor(roleProfile, item)` dispatch.
- [ ] Vitest covers each scoring function with `RoleProfile` fixtures (perfect / partial / no match).
- [ ] **Blocker check:** Dev A's `getRoleProfile` published? If not, log under Blockers; tasks above are not blocked, only the wiring step below is.
- [ ] `GetFundingSummariesForUser` calls `getRoleProfile(user_id)`, scores items, returns top-N as `FundingSummary` with `match_score`. Returns `match_score: null` when role profile is unset.
- [ ] No new field added to `FundingItem`; scoring is exposed only via `FundingSummary.match_score`.
- [ ] **Proof:** seeded business → matching ordering plausible in a Vitest test driving `GetFundingSummariesForUser` against a fixture session.
- [ ] **Commit:** `feat(matching): add per-role match scoring`

---

## Step 4 — ETL & Ingestion (V2.P3)

- [ ] `docs(scraper): verify V2 ETL sources` PR merged with per-source `robots.txt` URL, ToS notes, cadence, and URL pattern for the six already-locked sources (ISED Business Benefits Finder, ISED Supports for Business, EduCanada Scholarships, Indigenous Bursaries Search Tool, NSERC, SSHRC).
- [ ] Each source module's leading comment cites the verified `robots.txt` / ToS check from the verification PR.
- [ ] No private aggregator (GrantCompass, GrantHub, Yconic, ScholarshipsCanada, Canada Grants Database, etc.) appears anywhere in `scraper/sources/`.
- [ ] `scraper/types.ts`, `utils.ts`, `normalize.ts`, `deduplicate.ts`, `expire.ts`, `index.ts`.
- [ ] Exactly 2 sources per role (6 total) implemented under `scraper/sources/{business,student,professor}/`.
- [ ] `scraper/index.ts` uses a `SOURCES` array — adding a source needs zero orchestrator changes (verified by adding a stub, running, removing).
- [ ] `supabase/migrations/0004_scrape_metadata.sql` applied.
- [ ] `.github/workflows/scrape.yml` cron uncommented and live (`0 3 * * *`); reads `SUPABASE_SERVICE_ROLE_KEY` already present from V2.P1 C4.
- [ ] Each scraper rate-limits outbound requests; per-source HTML cache used where practical.
- [ ] Every imported row populates `source_url`, `scraped_from`, `scraped_at`.
- [ ] Vitest fixtures for each scraper.
- [ ] Dedupe test covers insert/update/skip.
- [ ] Per-source failure isolation test: deliberate throw in one source does not stop the other five.
- [ ] **Proof:** manual workflow run on clean DB produces ≥ 1 new row per source; `scrape_runs` row recorded with per-source counts (`fetched`, `inserted`, `updated`, `skipped`, `errors`).
- [ ] **Commit:** `feat(scraper): add ETL pipeline with dedupe and expiry`

---

## Step 5 — Funding RLS (V2.P3)

- [ ] **Blocker check:** Dev A's `0010_rls_identity.sql` applied to shared dev DB? If not, stage policy SQL locally and log in Blockers.
- [ ] `supabase/migrations/0020_rls_funding.sql` applied.
- [ ] Cross-role query returns nothing.
- [ ] Anonymous query returns nothing.
- [ ] User cannot read or write another user's `funding_preferences`.
- [ ] Service role still ingests via scraper (verified by re-running the scrape workflow after RLS lands).
- [ ] **Proof:** Vitest with two role users each only sees their type.
- [ ] **Commit:** `feat(funding): add RLS for role-aware visibility`

---

## Step 6 — Integration Publishing (V2.P4)

- [ ] V2.P3 release PR merged to `main`; all `lib/funding/queries.ts` runtime exports shipped against real ETL data.
- [ ] Notified Dev A (entry in their `progress.md` "Contract changes consumed").
- [ ] Reviewed Dev A's dashboard tile PR; required no contract change.
- [ ] **Proof:** Dev A's dashboard renders real funding tiles for each role.
- [ ] **Commit:** `docs(funding): confirm contracts stable for integration`

---

## Step 7 — Hardening (V2.P5)

- [ ] Zero `from "@/lib/demo"` or `from "@/components/demo"` in Dev B owned files.
- [ ] Data-quality assertions green: no `amount_min > amount_max`, no past-deadline `status='active'`.
- [ ] `scraper/README.md` covers env, run, expected output.
- [ ] Vitest end-to-end for funding flow.
- [ ] **Proof:** all suites green; data-quality SQL returns 0 violations on live dev DB.
- [ ] **Commit:** `chore(hardening): remove demo imports and add funding tests`

---

## Blockers

(Log here only with a named missing deliverable per `ownership.md` "Allowed blockers." None recorded yet.)

## Notes

(Free-form. Use sparingly.)
