# G0 — Completed Questionnaire Record

This record was filled from the copied Auctus planning docs, not invented ad hoc.
`ProjectSummary.md` is the same full-project summary used in every space. This questionnaire narrows execution to the Dev B workspace while keeping the project identity global.

Primary source order:
- `references/build/shared/buildflow.md`
- `references/build/shared/ownership.md`
- `references/build/shared/bootstrap.md`
- `references/build/shared/conventions.md`
- `references/build/dev-b/buildflow.md`
- `references/build/dev-b/progress.md`
- `references/build/gameplan.md`
- `references/build/productvision.md`
- `references/build/resume_session_context.md`
- `references/build/contracts/*.ts`
- `references/claude/CurrentStatus.md`
- `references/claude/*.md` as archived template/mentor context copied from the root `claude/` folder

---

## G0.1 — Identity

1. Project name: `Auctus`
2. One-line description: a real multi-role Canadian funding platform for businesses, students, and professors
3. Problem it solves: users should not have to manually search fragmented funding sources without personalization or trust. The Dev B track solves the funding and pipeline side of that problem by creating one role-aware funding domain, persisted role-specific preferences, matching, and a repeatable ETL pipeline against the six locked official V2 sources.
4. Project type: `production`

Pass record:
- Locked by `references/build/gameplan.md`
- Workspace scope narrowed to Dev B only per `references/build/shared/ownership.md`

---

## G0.2 — Developer Profile

1. Developer name: `Priyan`
2. Experience level: `intermediate` (working assumption; not explicitly stated in the source docs)
3. Comfortable with: TypeScript, React, Next.js, Tailwind, Git-based feature work, data-driven UI work
4. Not yet experienced enough to treat as implicit: Supabase RLS, raw SQL migrations, ETL normalization, scraper workflow operations, GitHub Actions secrets and scheduling
5. End-state goal: independently ship the funding and pipeline track of Auctus V2 without crossing into Dev A's identity and community ownership

Pass record:
- Owner mapping is locked in `references/build/shared/ownership.md`
- Skill assumptions were chosen conservatively to match the existing role split

---

## G0.3 — Architecture + Category Detection

1. What is being built:
   A role-aware funding and ingestion layer inside a full-stack Next.js product. This workspace owns the unified funding schema, saved funding preferences, listing/detail pages, per-role filters, matching, ETL ingestion, and funding-side visibility controls.
2. Tech stack:
   Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Supabase Postgres, RLS, raw SQL migrations, Vitest, GitHub Actions, cheerio, a separate `scraper/` Node workspace.
3. How the pieces connect:
   Funding pages and dashboard consumers call Dev B runtime exports inside the Next.js app. Those helpers query the unified `funding` table plus `funding_preferences` using role-aware query rules. Matching uses the locked `RoleProfile` shape from Dev A. ETL runs inside GitHub Actions, scrapes the six locked official sources, normalizes records, deduplicates, expires stale rows, and writes into Supabase with the service-role key.
4. Key architecture decisions and why:
   - One unified `funding` table: locked product decision for one shared funding domain.
   - DB-backed `funding_preferences` instead of cookies: persistence must survive devices and support server-side personalization.
   - Role-specific filters in a shared framework: shared structure without collapsing real role differences.
   - GitHub Actions + cheerio ETL: locked V2 approach for official-source scraping on the free stack.
   - Funding RLS keyed off `profiles.role`: visibility enforcement must not rely on URL shape alone.
5. Data in this workspace:
   `FundingItem`, `FundingSummary`, `FundingPreferences`, `FundingQuery`, `funding_sources`, `scrape_runs`, plus scraper normalization/dedupe metadata.
6. Config or environment variables:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

Category result:
- This is a `web` project
- Reason: the funding track is still part of a browser-based product backed by a server runtime and database, even though it also contains a scraper sub-workspace

---

## G0.4 — Features & Structure

1. Core features:
   - Unified `funding` table covering grants, scholarships, and research funding
   - Persisted role-specific funding preferences in `funding_preferences`
   - Role-specific listing and detail pages plus filters
   - Per-role matching algorithms using locked profile contracts
   - ETL ingestion from six official Canadian sources
   - Funding-side RLS and role-aware query helpers
   - Published funding summary tile and summary query for Dev A dashboard composition

2. Frontend pages:

| Page | Route | Auth |
|---|---|---|
| Grants list | `/grants` | protected business |
| Grant detail | `/grants/[id]` | protected business |
| Scholarships list | `/scholarships` | protected student |
| Scholarship detail | `/scholarships/[id]` | protected student |
| Research funding list | `/research-funding` | protected professor |
| Research funding detail | `/research-funding/[id]` | protected professor |

3. Runtime routes and entry points owned by Dev B:

| Method | Path or export | Auth | Purpose |
|---|---|---|---|
| runtime export | `lib/funding/queries.ts#ListFundingForRole` | protected context | role-aware funding listings |
| runtime export | `lib/funding/queries.ts#GetFundingById` | protected context | funding detail lookup |
| runtime export | `lib/funding/queries.ts#GetFundingSummariesForUser` | protected context | dashboard summary query |
| runtime export | `lib/funding/preferences.ts` helpers | protected context | read/write saved defaults |
| runtime export | `lib/funding/route-policies.ts#fundingPolicies` | shared runtime | funding route registration for Dev A middleware |
| runtime export | `components/funding/FundingSummaryTile.tsx` | shared presentation | dashboard tile consumed by Dev A |
| workflow entry | `.github/workflows/scrape.yml` | GitHub Actions | scheduled and manual ETL run |
| workspace entry | `scraper/index.ts` | Node runtime | orchestrates source modules, normalization, dedupe, expiry, and writes |

4. Core constraint:
   A user must only see active funding rows for their own role, and the ETL pipeline must normalize the six locked official V2 sources into the unified funding model without breaking that visibility rule.
5. Third-party integrations:
   - Supabase Postgres + RLS
   - GitHub Actions
   - cheerio
   - six locked official sources: ISED Business Benefits Finder, ISED Supports for Business, EduCanada Scholarships, Indigenous Bursaries Search Tool, NSERC, SSHRC

Coverage check:
- Every listed feature maps to a page, runtime export, or ETL entry point
- Every listing/detail route maps to the unified funding model and role-aware query rules

---

## G0.5 — Constraints & Red Lines

1. What must never happen:
   - Dev B must not edit Dev A-owned identity, onboarding, profile, forum, middleware, or dashboard files except through an approved shared-file or contract protocol
   - Funding visibility must never leak cross-role rows or anonymous rows
   - Saved preferences must never be cookie-only persistence
   - Private/commercial aggregators must never be added to the locked V2 source list
   - Match scoring must not mutate the locked contract shapes without the change protocol
2. Performance constraints:
   Listing queries and dashboard summaries must stay cheap enough to run through the Next.js server runtime. Scrapers must be rate-limited and per-source failures must not stop the remaining sources.
3. Anything else to know:
   The repo is still at `V2.P1 — not started`. This workspace is a filled planning layer for future execution, not evidence that the implementation already exists.
4. Routes that must never have auth:
   None in Dev B's owned surface. Dev A owns public routes.
5. Routes that must always have auth:
   `/grants`, `/grants/[id]`, `/scholarships`, `/scholarships/[id]`, `/research-funding`, `/research-funding/[id]`

---

## G0.6 — Critique, Cross-Check, Finalize

### Step 1 — Issues found

1. `references/claude/CurrentStatus.md` is the main repo-state snapshot in the root `claude/` set; most of the other root `claude/` files are generic mentor/templates rather than Auctus-specific execution docs.
2. The current repo is still a demo and V2.P1 has not started, so the workspace must describe the target Dev B track without pretending implementation already exists.
3. The stock Likit template expects unused `ProjectSummary_*` templates to be deleted; this workspace therefore deletes them instead of preserving them.
4. The stock Likit template is generic and student-oriented; Auctus requires explicit ownership boundaries, typed-contract usage, and named blockers for ETL/RLS handoffs.

### Step 2 — Resolutions applied

1. Execution truth is anchored to `codex/references/build/` docs and typed contracts.
2. `codex/references/claude/CurrentStatus.md` is used as the repo-state snapshot, while the rest of `codex/references/claude/` is kept as archived root template/mentor context.
3. Archive templates remain untouched and are excluded from G0 failure checks in `AGENTS.md`.
4. All generated files are role-scoped to Dev B and explicitly mark Dev A surfaces as import-only or off-limits.

### Step 3 — Cross-check

- Feature → route/export:
  funding list/detail maps to `/grants`, `/scholarships`, `/research-funding`, `ListFundingForRole`, `GetFundingById`
  personalization maps to `FundingPreferences`, filter definitions, and `GetFundingSummariesForUser`
  matching maps to `scoreBusinessGrant`, `scoreScholarship`, `scoreResearchGrant`, and `RoleProfile`
  ingestion maps to `scraper/index.ts`, source modules, dedupe, expire, `scrape.yml`
- Route/export → model:
  listing/detail helpers map to `FundingItem`
  dashboard summaries map to `FundingSummary`
  saved defaults map to `FundingPreferences`
  ETL audit maps to `funding_sources` and `scrape_runs`
- Auth rule consistency:
  every Dev B UI route is protected and role-specific
  runtime helpers consume Dev A's session/profile contracts without editing Dev A files
  RLS backs the route-level gating with database enforcement

### Step 4 — Final summary

- Name: `Auctus`
- Workspace: `Dev B / Priyan`
- Category: `web`
- Track goal: ship funding, matching, ETL, and funding-side visibility without crossing into identity/community implementation
- Current real execution point: `V2.P1 — Shared Bootstrap & Restructuring (not started)`

### Step 5 — Confirmation record

This filled workspace reflects the locked planning state as of `2026-04-28`.

### Step 6 — Output record

- `_fill_manifest.md` completed
- `ProjectSummary.md` completed
- `Codex_guide.md` completed
- `BuildFlow.md` completed
- `Progress.md` completed

### G0 pass condition

Met for this workspace. Proceed at `G1 / P1`.
