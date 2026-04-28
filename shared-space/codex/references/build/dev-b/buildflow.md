# Dev B Buildflow — Funding & Pipelines

**Owner: Priyan**

## Mission

Own the funding pipeline end-to-end:

- unified funding domain (one `funding` table, three role views)
- DB-backed funding preferences for saved role-specific filter defaults
- per-role matching algorithms
- ETL: scrapers, normalize, dedupe, expire, upsert
- role-aware funding visibility (RLS + query filters)

## Working Rule

Stay inside Dev B folders unless you are following a contract change protocol or executing an explicit shared-file PR.

## Off-Limits Folders (do NOT touch)

These belong to Dev A. Any change here requires Dev A's explicit approval on a PR you opened — and almost every time, the right move is to file an issue and let Dev A do it.

```
app/(identity)/**
app/onboarding/**
app/profile/**
app/forum/**
app/dashboard/**
app/page.tsx
app/layout.tsx
app/providers.tsx
app/globals.css                  ← shared, but Dev A is owner of last resort
middleware.ts
components/auth/**
components/profile/**
components/forum/**
components/layout/**
lib/auth/**
lib/profile/**                   ← exception: import only (e.g. getRoleProfile), never edit
lib/forum/**
lib/session/**                   ← exception: import only (GetSession, useSession), never edit
lib/env.ts                       ← exception: read only
supabase/migrations/0001_*.sql, 0002_*.sql, 0005_*.sql, 0010_*.sql (and 0010-0019 range)
.github/workflows/ci.yml
```

Demo folders are frozen for both devs after the V2.P1 surgery PR; do not touch them.

## Owned Folders

```
app/(funding)/grants/**
app/(funding)/scholarships/**
app/(funding)/research-funding/**
components/funding/**
lib/funding/**
lib/matching/**
scraper/**
supabase/migrations/0003_funding.sql           ← V2.P2: funding + funding_preferences
supabase/migrations/0004_scrape_metadata.sql   ← V2.P3: funding_sources + scrape_runs
supabase/migrations/0020_rls_funding.sql       ← V2.P3: funding-side RLS (0020-0029 range)
.github/workflows/scrape.yml
```

## Contracts Dev B Publishes

- `build/contracts/funding.ts` (LOCKED by V2.P1)
- Runtime: `lib/funding/queries.ts` exporting:
  - `ListFundingForRole: (query: FundingQuery) => Promise<FundingItem[]>`
  - `GetFundingById: (id: string) => Promise<FundingItem | null>`
  - `GetFundingSummariesForUser: (user_id: string, limit?: number) => Promise<FundingSummary[]>`
- Runtime: `lib/funding/preferences.ts` exporting preference read/write helpers for `funding_preferences`.
- Runtime: `lib/funding/route-policies.ts` exporting a `RoutePolicyRegistry` with funding routes.
- Runtime: `components/funding/FundingSummaryTile.tsx` — Dev A imports this for dashboard tiles.

## Contracts Dev B Consumes

- `build/contracts/role.ts` — for `Role`, `ROLES`, `ROLE_DEFAULT_ROUTE`.
- `build/contracts/profile.ts` — `Profile`, `RoleProfile` for matching algorithms.
- `build/contracts/session.ts` — `GetSession`, `useSession` for role-aware visibility.
- `build/contracts/route-policy.ts` — `RoutePolicy` shape.

---

## Step 0 — Shared Bootstrap (V2.P1)

Most bootstrap is owned by Dev A. Dev B's required contributions:

- **B5** Scraper workspace skeleton (`scraper/` with own `package.json`, `tsconfig.json`, `index.ts`).
- **C3** Scrape workflow stub (`.github/workflows/scrape.yml` with manual trigger).
- **D2** Lock the `funding.ts` contract with Dev A's review.
- Review the surgery PR (A1) and the supabase-js install PR (B2).

Do NOT start writing funding code in V2.P1. Use this phase to:

- Read and internalize `build/contracts/`.
- Sketch the `funding` table schema in a draft `0003_funding.sql` (do not commit until V2.P2).
- Draft 2-3 source-page reconnaissance notes (e.g., NSERC scholarship listing) — kept local, not committed.

**Tests for V2.P1:** `cd scraper && npx tsx index.ts` prints the bootstrap line; manual `workflow_dispatch` of `scrape.yml` succeeds.

**Proof for V2.P1:** Dev B's bootstrap items in `bootstrap.md` ticked; `funding.ts` LOCKED.

---

## Step 1 — Funding Domain Foundation (V2.P2)

### Coupling

- **Inbound:** consumes only LOCKED contracts (`Role`, `RoutePolicy`, `Session`). No runtime dependency on Dev A in this step.
- **Outbound to Dev A:** publishes `lib/funding/route-policies.ts` exporting `fundingPolicies: RoutePolicyRegistry`. Dev A's `lib/auth/route-policies.ts` imports and concatenates it. Dev A may have shipped a one-line placeholder version of this file in their Step 1 (`export const fundingPolicies: RoutePolicyRegistry = []`) — overwrite it with the real registry in this step.

### Tasks

1. `supabase/migrations/0003_funding.sql`:
   - `funding` table per `FundingItem` shape (use enum types for `type`, `status`, `source`).
   - Indexes: `(type, status, deadline)`, `(type, status, created_at desc)`.
   - Trigger: `updated_at = now()` on update.
2. Add `funding_preferences` table keyed by `(user_id, role)` with `default_filters jsonb`, `created_at`, `updated_at`. This is DB-backed saved preference storage; do not use cookies as the primary persistence mechanism.
3. Seed 5-10 manual rows per type via a `supabase/seeds/funding_seed.sql` (committed).
4. `lib/funding/supabase.ts` — internal client (server-side, anon for queries that respect RLS once it lands; service-role for ingestion in `scraper/`).
5. `lib/funding/queries.ts` — implement `ListFundingForRole`, `GetFundingById`, `GetFundingSummariesForUser` against the seeded table. `GetFundingSummariesForUser` initially ignores user-specific scoring and returns the most recent N items for the user's role; matching wires in Step 3.
6. `lib/funding/role-mapping.ts` — `roleToFundingType: Record<Role, FundingType>`.
7. `lib/funding/filter-definitions.ts` — role-specific filter definitions for business grants, scholarships, and research funding. Use a shared framework if useful, but do not collapse the roles into one bland generic filter set.
8. `lib/funding/preferences.ts` — `getFundingPreferences(user_id, role)`, `upsertFundingPreferences(user_id, role, default_filters)`, and `clearFundingPreferences(user_id, role)`.
9. `lib/funding/route-policies.ts` — register `/grants` (business), `/scholarships` (student), `/research-funding` (professor).

### Tests

- Vitest: `lib/funding/queries.test.ts` against a Supabase test instance (or pglite if added). Asserts return shape matches `FundingItem` / `FundingSummary`.
- Vitest: `lib/funding/role-mapping.test.ts` covers all three roles.
- Vitest: `lib/funding/preferences.test.ts` covers create, update, read, and clear for `funding_preferences`.

### Proof for completion

- [ ] `funding` table exists with seed rows of all three types.
- [ ] `funding_preferences` table persists default filters per `(user_id, role)`.
- [ ] Calling `ListFundingForRole({ role: 'student' })` from a Vitest test returns only `scholarship` rows.
- [ ] Role-specific filter definitions exist for all three roles and are consumed by listing query tests.
- [ ] `lib/funding/route-policies.ts` exports a registry that `middleware.ts` (Dev A) picks up after a fresh build.
- [ ] Commit: `feat(funding): add unified funding table and query helpers`

---

## Step 2 — Funding Pages (V2.P2)

### Coupling

- **Inbound from Dev A (soft):** `GetSession()` from `lib/session/get-session.ts` is the cleanest way to read the role server-side. **If Dev A has not published it yet,** each funding listing page hard-codes the role for the route (e.g., `/grants` assumes `business`). This is safe because the route itself is role-specific by design; middleware (Dev A) will eventually gate the URL anyway. Replace the hard-code with `GetSession()` in a one-line follow-up commit once Dev A's helper is on `develop`. Do not block on this.
- **Outbound to Dev A:** publishes `components/funding/FundingSummaryTile.tsx` for Dev A's dashboard. Pure presentation; takes `summaries: FundingSummary[]` prop.

### Do not start until

- `0003_funding.sql` from Step 1 is applied to the shared dev DB and `lib/funding/queries.ts` is callable from a Vitest test. Step 2 only adds the UI surface around helpers Step 1 published.

### Tasks

1. `app/(funding)/grants/page.tsx` — server component. Calls `GetSession()`, asserts `role === 'business'` (middleware also enforces). Fetches via `ListFundingForRole({ role: 'business' })`. Renders `<FundingList items={...} />`.
2. `app/(funding)/scholarships/page.tsx` — same shape, role student.
3. `app/(funding)/research-funding/page.tsx` — same shape, role professor.
4. `app/(funding)/grants/[id]/page.tsx`, `scholarships/[id]/page.tsx`, `research-funding/[id]/page.tsx` — detail pages calling `GetFundingById`.
5. `components/funding/FundingList.tsx`, `FundingCard.tsx`, `FundingDetail.tsx`.
6. `components/funding/FundingFilters.tsx` — renders the role-specific filter definition for the current route, syncs short-term filter state to query params, and can save defaults through `lib/funding/preferences.ts`.
7. `components/funding/FundingSummaryTile.tsx` — Dev A imports this for the dashboard. Takes `summaries: FundingSummary[]` prop. Pure presentation.

### Tests

- Vitest: `FundingCard` snapshot against a fixture `FundingItem`.
- Manual: each role's listing page renders seeded rows.
- Manual: each role's listing page applies role-specific filters and can save/reload default filters for a signed-in test user.

### Proof for completion

- [ ] `/grants`, `/scholarships`, `/research-funding` render seed rows.
- [ ] Detail pages render eligibility breakdown.
- [ ] Each listing has role-specific filters; saved defaults survive reload and are not cookie-only.
- [ ] `<FundingSummaryTile>` renders correctly given a fixture.
- [ ] Commit: `feat(funding): add role-aware listing and detail pages`

---

## Step 3 — Matching (V2.P3)

### Coupling (real dependency)

- **Inbound from Dev A:** `lib/profile/queries.ts` exports `getRoleProfile(user_id) => Promise<RoleProfile | null>`. This is the runtime helper that returns the LOCKED `RoleProfile` shape for a real user. Block on this if it is not published yet — log under "Blockers" with name `getRoleProfile`.
- **Workaround if blocked:** implement and unit-test `lib/matching/{business,student,professor}.ts` against `RoleProfile` fixtures (the LOCKED contract is enough to do that). Only `GetFundingSummariesForUser`'s wiring needs the runtime helper.
- **Outbound to Dev A:** none in this step. Dev A consumes the wired `GetFundingSummariesForUser` only in V2.P4 (see Step 6).

### Tasks

1. `lib/matching/business.ts` — `scoreBusinessGrant(profile: BusinessProfile, item: FundingItem): number` per ProjectSummary weights (location 25, revenue 25, employees 20, industry 30).
2. `lib/matching/student.ts` — `scoreScholarship(profile: StudentProfile, item: FundingItem): number`. V2 weights (citizenship/residency removed because it is not in `StudentProfile`): education_level 30, field_of_study 25, institution 15, province 15, gpa 15. If citizenship/residency is added to `StudentProfile` post-V2 via the contract change protocol, the weights can be rebalanced in a follow-up PR.
3. `lib/matching/professor.ts` — `scoreResearchGrant(profile: ProfessorProfile, item: FundingItem): number` (research area 30, career stage 25, council 20, institution 15, past funding 10).
4. `lib/matching/index.ts` — `scoreFor(roleProfile: RoleProfile, item: FundingItem): number` dispatch.
5. Update `GetFundingSummariesForUser` to:
   - `GetSession()` → `user_id` → call `getRoleProfile(user_id)` from `lib/profile/queries.ts` (Dev A publishes this in their V2.P2 → V2.P3 Step 2).
   - Score every active item of the role's funding type, return top N as `FundingSummary` with `match_score`.
   - When `getRoleProfile` returns `null` (user not yet onboarded), return the most recent N rows with `match_score: null`.

> Note: `ListFundingForRole` continues to return `FundingItem[]` per the LOCKED `funding.ts` contract. Match scoring is exposed only via `FundingSummary.match_score` returned by `GetFundingSummariesForUser`. Adding a score field to `FundingItem` would require the contract change protocol — do not do it.

### Real Dependency

- `Profile` / `RoleProfile` LOCKED contract — already locked in V2.P1.
- Runtime `lib/profile/queries.ts` `getRoleProfile` from Dev A's Step 2. **True dependency for the wiring step (5); the unit-test work for tasks 1-4 has no dependency** because the LOCKED `RoleProfile` contract is sufficient for fixtures.

### Tests

- Vitest: each `score*` function with fixtures (perfect match, partial, no match).
- Vitest: `scoreFor` dispatch happy path per role.
- Manual: pick a seeded business → matching ordering plausible.

### Proof for completion

- [ ] Three matching functions return scores 0-100 against fixtures.
- [ ] `GetFundingSummariesForUser` returns scored summaries for a real test user.
- [ ] Commit: `feat(matching): add per-role match scoring`

---

## Step 4 — ETL & Ingestion (V2.P3)

### Coupling

- **Inbound:** none. Scraper runs on its own GitHub Actions workflow with the Supabase service-role key.
- **Outbound to Dev A:** none directly. Dev A's dashboard consumes the funding rows produced here, but only via the published query helpers in V2.P4.

### Tasks

0. **Source selection (LOCKED).** The V2 ETL source list is locked to **official Canadian government / public-sector sources only**. Private aggregators (GrantCompass, GrantHub, Yconic, ScholarshipsCanada, Canada Grants Database, etc.) are explicitly **rejected** for V2 first-pass ETL — they may be useful for later licensed/partner data paths but not as scraper sources now.

   **Business (2 sources):**
   1. Innovation Canada / ISED **Business Benefits Finder** — https://ised-isde.canada.ca/site/innovation-canada/en/first-things-first/how-get-most-out-business-benefits-finder
   2. ISED **Supports for Business** — https://ised-isde.canada.ca/site/ised/en/supports-for-business

   **Student (2 sources — official-source first pass for V2; not full Canadian scholarship coverage):**
   1. **EduCanada Scholarships** — https://www.educanada.ca/scholarships-bourses/non_can/index.aspx?lang=eng
   2. **Indigenous Bursaries Search Tool** (Indigenous Services Canada) — https://sac-isc.gc.ca/eng/1351185180120/1351685455328

   **Professor / research (2 sources):**
   1. **NSERC Funding Opportunities** — https://nserc.canada.ca/en/funding/funding-opportunity
   2. **SSHRC Funding Opportunities** — https://sshrc-crsh.canada.ca/en/funding/opportunities.aspx

   **CIHR is deferred to the first post-V2 ETL expansion** unless a separate decision flips health-research professor coverage to mandatory in V2. Reasoning: many CIHR opportunities route through ResearchNet, which is more application-system oriented and less clean than NSERC/SSHRC for first-pass scraping.

   The total V2 source count remains **exactly 2 sources per role, 6 total**. Adding a 7th source requires either a new decision PR or a deferred-to-post-V2 note.

   The source list is already `LOCKED-FOR-V2` in `build/productvision.md` §7.4 — do not re-open the decision. Before any scraper module lands, open a small docs PR titled `docs(scraper): verify V2 ETL sources` that records, per source, the verified `robots.txt` URL, the relevant ToS clause (or absence thereof), the chosen cadence, and the listing/detail URL pattern. This PR is the precondition for the Step 4 implementation tasks.
1. `scraper/types.ts` — `ScrapedFunding`, `Scraper` interfaces (matching ProjectSummary).
2. `scraper/utils.ts` — `parseAmount`, `parseDate`, `cleanText`.
3. `scraper/sources/business/`, `scraper/sources/student/`, `scraper/sources/professor/` — implement **the 2 sources per role chosen in Task 0 (6 total)**. Each source is a module exporting a `Scraper` impl using `cheerio`. Design the `Scraper` interface and the per-role source folders so additional sources can be added later by dropping a new module into the right folder and registering it in `scraper/index.ts` — no other code change required. Adding sources to reach the eventual 5 per role / 15 total is deferred but not removed from the roadmap.
4. `scraper/normalize.ts` — `ScrapedFunding → FundingItem` (sets `source: 'scraped'`, `scraped_from`, `scraped_at`, `status: 'active'`).
5. `scraper/deduplicate.ts` — match by `(name, provider, type)`. INSERT new, UPDATE changed, skip same.
6. `scraper/expire.ts` — `UPDATE funding SET status='expired' WHERE deadline < now() AND status='active'`.
7. `scraper/index.ts` — register all scrapers in a single `SOURCES` array per role; invoke, normalize, dedupe, expire, log per-source counts. Per-source failure does not stop other scrapers. Adding a new source = add to the array; no orchestrator edits.
8. `supabase/migrations/0004_scrape_metadata.sql` — `funding_sources`, `scrape_runs` tables for run tracking.
9. Update `.github/workflows/scrape.yml` — uncomment cron `0 3 * * *`. The `SUPABASE_SERVICE_ROLE_KEY` secret is already present from V2.P1 C4.

### ETL implementation requirements

These apply to every scraper module:

- Verify `robots.txt` and the source's terms of service before committing the module. Document the verification one-liner in the module's leading comment.
- Rate-limit outbound requests (per-source delay; do not parallelize requests within a single source).
- Cache fetched HTML to a per-run artifact directory where practical so re-runs and tests do not hit the source repeatedly.
- For every imported row, populate `source_url` (the canonical funding URL), `scraped_from` (the listing page), and `scraped_at` (ISO timestamp). These are part of the LOCKED `FundingItem` contract.
- Per-source failures must not stop other sources (`scraper/index.ts` catches per source, logs the error, continues).
- Per-source counts (`fetched`, `inserted`, `updated`, `skipped`, `errors`) are logged and recorded in `scrape_runs`.
- Adding a future source must require only: a new file under `scraper/sources/<role>/` plus one line in the `SOURCES` array — no orchestrator edits.

### Tests

- Vitest in `scraper/`: each `Scraper` impl against a fixture HTML file under `scraper/__fixtures__/`.
- Vitest: `dedupe` against a fixture DB (or mocked Supabase client) covering insert/update/skip.
- Manual: trigger workflow from GitHub UI, confirm `scrape_runs` row appears with non-zero count.

### Proof for completion

- [ ] `docs(scraper): verify V2 ETL sources` PR merged with per-source `robots.txt` + ToS notes for all six locked sources.
- [ ] All 6 locked sources implemented:
  - business: ISED Business Benefits Finder, ISED Supports for Business
  - student: EduCanada Scholarships, Indigenous Bursaries Search Tool
  - professor: NSERC Funding Opportunities, SSHRC Funding Opportunities
- [ ] Each source module's leading comment cites the verified `robots.txt` / ToS check.
- [ ] Each scraper rate-limits outbound requests.
- [ ] Every imported row carries `source_url`, `scraped_from`, `scraped_at`.
- [ ] Adding a 3rd source for any role requires only a new file + one line in `SOURCES`. Demonstrate with a no-op stub source, run, remove.
- [ ] Manual workflow run produces ≥ 1 new row per source on a clean DB.
- [ ] `scrape_runs` row recorded with per-source counts (`fetched`, `inserted`, `updated`, `skipped`, `errors`).
- [ ] Per-source failure isolated: a deliberate throw in one source does not stop the other five.
- [ ] Cron schedule live (`0 3 * * *`).
- [ ] No private aggregator (GrantCompass, GrantHub, Yconic, ScholarshipsCanada, Canada Grants Database, etc.) appears as a source.
- [ ] Commit: `feat(scraper): add ETL pipeline with dedupe and expiry`

---

## Step 5 — Funding RLS (V2.P3)

### Coupling (real dependency)

- **Inbound from Dev A:** `supabase/migrations/0010_rls_identity.sql` applied to the shared dev DB. Without it, the `profiles.role` join your RLS reads from is unreliable. Block on this — log under "Blockers" with name `0010_rls_identity.sql`.
- **Workaround if blocked:** stage the policy SQL locally; do not apply to shared DB until 0010 lands.
- **Outbound to Dev A:** none.

### Tasks

1. `supabase/migrations/0020_rls_funding.sql` — RLS policies:
   - SELECT on `funding`: `status='active'` AND `type` matches `(SELECT role FROM profiles WHERE id = auth.uid())` mapped via the `roleToFundingType` SQL helper. Anonymous = no rows.
   - SELECT/INSERT/UPDATE/DELETE on `funding_preferences`: authenticated users can only read/write their own row for their current role.
   - SELECT on `funding_sources`, `scrape_runs`: service role only (and optionally authenticated read for status pages — defer).
   - INSERT/UPDATE/DELETE on `funding`: service role only (scraper).
2. Verify Dev A's identity-side RLS (`0010_rls_identity.sql`) is landed first (allowed blocker per `ownership.md`).
3. Run integration test: Vitest with two test users of different roles, assert each only sees their type.

### Proof for completion

- [ ] Cross-role query returns nothing.
- [ ] Anonymous query returns nothing.
- [ ] User cannot read or write another user's `funding_preferences`.
- [ ] Service role still ingests via scraper.
- [ ] Commit: `feat(funding): add RLS for role-aware visibility`

---

## Step 6 — Integration Publishing (V2.P4)

### Coupling (this is the heavy one)

- **Inbound:** none — your work is already done; you are publishing.
- **Outbound to Dev A:** after the V2.P3 release PR merges to `main`, confirm in Dev A's `progress.md` "Contract changes consumed" section: `lib/funding/queries.ts` exports shipped on `main` against real ETL data as of `<release commit hash>`. This is the trigger Dev A waits for to start their Step 5 dashboard tile.

### Tasks

1. Confirm the V2.P3 release PR has merged: `funding.ts` and all runtime exports are shipped on `main` against real ETL data.
2. Notify Dev A in their `progress.md` "Contract changes consumed" section: "FundingSummary scored against real ETL data, shipped on main as of `<release commit hash>`."
3. Pair with Dev A on the dashboard tile PR — review only; do NOT edit `app/dashboard/**`.

### Proof for completion

- [ ] Dev A's dashboard tile renders Dev B's data without changes to the contract.
- [ ] Commit: `docs(funding): confirm contracts stable for integration`

---

## Step 7 — Hardening (V2.P5)

### Coupling

- **Inbound:** none.
- **Outbound to Dev A:** none. Each dev hardens their own surface independently.

### Tasks

1. Audit Dev B owned files for any imports from `lib/demo/` or `components/demo/`. Remove all.
2. Add data-quality test in `scraper/`: no row with `amount_min > amount_max`; no `status='active'` row with past deadline.
3. README in `scraper/` covers env, run, expected output.
4. End-to-end test (Vitest or Playwright if added): seeded user → loads listing → filter → detail.

### Proof for completion

- [ ] Zero demo imports in Dev B files.
- [ ] All data-quality assertions green on the live dev DB.
- [ ] Commit: `chore(hardening): remove demo imports and add funding tests`

---

## Done Criteria for Dev B's Track

- Funding listing and detail work for business, student, professor.
- Per-role matching scores correctly using LOCKED profile shape.
- ETL produces clean ingestible funding data daily.
- RLS blocks cross-role and unauthenticated access.
- Dev A consumes `FundingItem`, `FundingQuery`, `FundingSummary`, `ListFundingForRole`, `GetFundingById`, `GetFundingSummariesForUser`, `FundingSummaryTile` without ambiguity.

## When You Are Blocked

Check `build/shared/conventions.md` "When you are blocked." Allowed blockers for Dev B:

- `0010_rls_identity.sql` (Dev A) not applied to shared dev DB → blocks Step 5 funding RLS only. Stage your `0020_rls_funding.sql` locally; do not apply it.
- `lib/profile/queries.ts getRoleProfile` from Dev A not published → blocks Step 3 wiring of `GetFundingSummariesForUser` to scoring. Tasks 1-4 of Step 3 (the unit-tested matchers) are not blocked because the LOCKED `RoleProfile` contract is sufficient for fixtures.
- `Profile` / `RoleProfile` not LOCKED at V2.P1 D2 → would block Step 3 matching, but the V2.P1 completion gate prevents starting V2.P3 if those are not LOCKED. So this should not occur in practice.

If you hit any of these, log in `progress.md` "Blockers" with the named missing deliverable. Otherwise pick another step in this track that has no upstream dependency.
