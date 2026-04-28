# Auctus V2 — Master Project Summary

> Real multi-role Canadian funding platform for businesses, students, and professors, with real auth, real persistence, real funding storage, shared community features, and official-source ETL ingestion.

**Purpose of this file:** this summary is intentionally the **same full-project summary** across `dev-a-space`, `dev-b-space`, and `shared-space` so phase migration back into the real project stays simple. Workspace-specific execution differences live in each space's `BuildFlow.md`, `Progress.md`, `Codex_guide.md`, and `Migration.md`.

**Problem:** the current repository is still a polished frontend demo centered on a business-only experience with static JSON, local matching logic, and no real auth or persistence. Auctus V2 turns that demo shell into a real multi-role product where businesses find grants, students find scholarships, professors find research funding, and all three roles can sign in, persist profiles, receive role-aware funding views, and use one shared community forum.

**Current repo reality:** the copied planning docs explicitly say the real project is still at `V2.P1 — Shared Bootstrap & Restructuring (not started)`. In the source snapshot used to fill these workspace docs, the root `app/` tree was still the legacy demo shell with `/funding`, `/matchmaker`, `/talent`, `/test-cards`, `/test-components`, `/dashboard`, and `/forum` at top-level routes, and the V2.P1 surgery had not yet moved legacy/demo surfaces under `/(demo)/**`. So this summary describes the committed V2 target state and locked decisions, not already-landed implementation.

---

## System Overview
```text
Browser
  -> Next.js 16 App Router pages and route handlers
  -> role-aware shell, funding pages, onboarding, forum, dashboard
  -> middleware + combined route-policy registries
  -> Supabase Auth session + profiles join
  -> Supabase Postgres tables guarded by RLS

Funding data path
  GitHub Actions scrape.yml
    -> scraper/ TypeScript workspace
    -> 6 locked official source modules
    -> normalize -> dedupe -> expire -> upsert
    -> unified funding table in Supabase

Cross-domain coordination path
  codex/references/build/contracts/*.ts
    -> typed integration contracts
  codex/references/build/shared/*.md
    -> ownership, conventions, bootstrap, and master phase tracking
```

**Core Constraint:** Auctus must behave like one coherent multi-role product. Auth, role state, onboarding, protected routing, funding visibility, and persisted funding/profile data must agree with each other. No user should see the wrong role's funding surface, bypass onboarding, or depend on demo-only data paths in active V2 code.

---

## Core Features

- Google OAuth plus email OTP / magic-link authentication
- Three roles from the start: business, student, professor
- Role selection and persistent per-role onboarding/profile data
- Role-aware navigation, route protection, and dashboard composition
- Unified funding domain for grants, scholarships, and research funding
- Role-specific filters and DB-backed saved funding preferences
- Matching/personalization driven by onboarding/profile data plus saved preferences
- Shared forum with persisted threads and replies across all roles
- ETL ingestion from six locked official Canadian sources
- Legacy/demo features preserved under `(demo)` but frozen out of V2 product work

---

## Tech Stack

| Layer | Technology | Host |
|---|---|---|
| Frontend | Next.js 16 + React 19 + Tailwind CSS 4 | local dev now; production host deferred |
| Backend runtime | Next.js App Router server components and route handlers | same Next.js app |
| Database | Supabase Postgres | Supabase |
| Auth | Supabase Auth (Google OAuth + email OTP / magic link) | Supabase |
| Access control | Postgres RLS | Supabase |
| Scraping / ETL | TypeScript Node workspace + cheerio | GitHub Actions + local dev |
| Testing | Vitest | local dev + GitHub Actions |
| CI/CD | GitHub Actions | GitHub |

---

## Locked Product and Architecture Decisions

**D1 — Build the real platform, not another demo**  
This is the main V2 commitment in `codex/references/build/gameplan.md`. Demo features are preserved for continuity but are not the active architecture.

**D2 — Support all three roles from the start**  
Business, student, and professor are locked from day one in V2. The product and route structure are not allowed to collapse back to one role.

**D3 — Supabase Auth with Google + email OTP / magic link only for V2**  
GitHub, Microsoft, and email-password auth are deferred.

**D4 — One unified `funding` table with role-aware views and queries**  
The funding domain stays unified rather than splitting into separate product silos.

**D5 — Personalization comes from onboarding/profile data plus DB-backed saved funding preferences**  
Cookies are not the primary persistence strategy.

**D6 — Funding filters are role-specific, with a shared framework only where useful**  
The build docs explicitly reject a bland generic filter model.

**D7 — One shared forum across all roles**  
Community is shared even though funding surfaces are role-specific.

**D8 — Demo isolation instead of ongoing mutation**  
`talent`, `matchmaker`, V1 funding pages, test pages, and the local chatbot move to `(demo)` and stay frozen.

**D9 — AI chat expansion is deferred**  
The legacy local chatbot stays mounted as-is; it is not active V2 scope.

**D10 — No major design exploration in V2**  
Existing UI primitives stay; V2 is primarily architecture, auth, persistence, data, and workflow work.

**D11 — Two-developer execution with strict ownership boundaries**  
Dev A owns identity/community. Dev B owns funding/pipelines. Shared work goes through the shared docs/contracts.

**D12 — ETL source list is locked for V2**  
The six sources are: ISED Business Benefits Finder, ISED Supports for Business, EduCanada Scholarships, Indigenous Bursaries Search Tool, NSERC, and SSHRC. CIHR and private aggregators are deferred/rejected for V2.

---

## Data Models

```text
Profile
  id: uuid required ref auth.users.id
  role: business|student|professor|null required default null
  display_name: text required
  email: text required
  avatar_url: text optional
  created_at: timestamp required
  updated_at: timestamp required

BusinessProfile
  id: uuid required ref profiles.id
  business_name: text required
  industry: text optional
  location: text optional
  revenue: number optional
  employees: number optional
  description: text optional
  year_established: number optional
  website: text optional

StudentProfile
  id: uuid required ref profiles.id
  education_level: enum optional
  field_of_study: text optional
  institution: text optional
  province: text optional
  gpa: number optional
  graduation_year: number optional

ProfessorProfile
  id: uuid required ref profiles.id
  institution: text optional
  department: text optional
  research_area: text optional
  career_stage: enum optional
  h_index: number optional
  research_keywords: text[] required

FundingItem
  id: uuid required
  type: business_grant|scholarship|research_grant required
  name: text required
  provider: text required
  description: text optional
  amount_min: number optional
  amount_max: number optional
  deadline: iso-date optional
  application_url: text optional
  source_url: text optional
  eligibility: jsonb required
  requirements: text[] required
  category: text optional
  tags: text[] required
  source: scraped|manual required
  scraped_from: text optional
  scraped_at: iso-timestamp optional
  status: active|expired|archived required
  created_at: timestamp required
  updated_at: timestamp required

FundingSummary
  id: uuid required
  type: business_grant|scholarship|research_grant required
  name: text required
  provider: text required
  amount_max: number optional
  deadline: iso-date optional
  match_score: number optional

FundingPreferences
  user_id: uuid required ref profiles.id
  role: business|student|professor required
  default_filters: jsonb required
  created_at: timestamp required
  updated_at: timestamp required

Thread
  id: uuid required
  author_id: uuid required ref profiles.id
  title: text required
  body: text required
  category: text required
  created_at: timestamp required
  updated_at: timestamp required

Reply
  id: uuid required
  thread_id: uuid required ref threads.id
  author_id: uuid required ref profiles.id
  body: text required
  helpful_count: integer required default 0
  created_at: timestamp required
  updated_at: timestamp required

ReplyHelpfulVote
  reply_id: uuid required ref replies.id
  user_id: uuid required ref profiles.id
  created_at: timestamp required
  unique(reply_id, user_id)

FundingSource
  id: uuid required
  role: business|student|professor required
  name: text required
  base_url: text required
  cadence: text required
  active: boolean required

ScrapeRun
  id: uuid required
  source_id: uuid required ref funding_sources.id
  started_at: timestamp required
  finished_at: timestamp optional
  fetched_count: integer required
  inserted_count: integer required
  updated_count: integer required
  skipped_count: integer required
  error_count: integer required
  status: text required
```

---

## Seed and Test Data Strategy

- Source snapshot reality: demo JSON datasets and legacy demo routes still existed in their pre-surgery locations; V2.P1 moves them into `data/demo/`, `lib/demo/`, `components/demo/`, and `app/(demo)/**`
- V2 early funding work uses committed manual seed rows in `supabase/seeds/funding_seed.sql`
- Auth/profile/forum work uses real Supabase test users and persisted rows
- Matching relies on `RoleProfile` fixtures plus real test users after onboarding lands
- ETL source modules are tested against fixture HTML and then verified with manual/scheduled workflow runs

---

## Core Service Logic

1. User signs in through Google or email OTP / magic link.
2. Supabase creates/resumes the session and a `profiles` row exists for the user.
3. Middleware reads the merged route-policy registry and redirects based on auth state, null-role onboarding state, and allowed roles.
4. Onboarding persists `profiles.role` plus the relevant role-specific profile table row.
5. Funding pages query the unified `funding` table through role-aware helpers and role-specific filters.
6. Matching scores funding opportunities against persisted role-profile data and returns `FundingSummary` results.
7. ETL runs through GitHub Actions, scrapes the six locked official sources, normalizes records, deduplicates changes, expires stale rows, and writes to Supabase.
8. Forum pages persist threads and replies under RLS and protect helpful-vote behavior through the database function path.
9. Dashboard composition combines identity/profile state, funding summaries, upcoming deadlines, and forum activity.

---

## Current App Snapshot Used For Planning

The source snapshot checked before root cleanup exposed these legacy routes directly from `app/`:

- `/`
- `/dashboard`
- `/forum`
- `/forum/[threadId]`
- `/forum/new`
- `/funding`
- `/funding/[grantId]`
- `/matchmaker`
- `/talent`
- `/test-cards`
- `/test-components`
- `/test-components/store-test`

These are the routes the V2.P1 mixed-file surgery relocates into the target structure below.

---

## Target Frontend Pages and Routes

| Surface | Route | Auth | Notes |
|---|---|---|---|
| Landing | `/` | public | signed-in users later redirect to dashboard |
| Sign in | `/sign-in` | public | Google + email OTP / magic-link |
| Auth callback | `/auth/callback` | public | redirects to onboarding or dashboard |
| Sign out | `/sign-out` | protected | clears session |
| Onboarding | `/onboarding` | protected | role selector |
| Onboarding by role | `/onboarding/[role]` | protected | role-specific first-run form |
| Profile | `/profile` | protected | role-aware persisted profile |
| Profile edit | `/profile/edit` | protected | deferred field editing |
| Forum list | `/forum` | protected | shared forum |
| Forum thread | `/forum/[threadId]` | protected | thread + replies |
| New thread | `/forum/new` | protected | create thread |
| Dashboard | `/dashboard` | protected | profile + funding + forum composition |
| Grants | `/grants` | protected business | role-specific funding listing |
| Grant detail | `/grants/[id]` | protected business | business funding detail |
| Scholarships | `/scholarships` | protected student | role-specific funding listing |
| Scholarship detail | `/scholarships/[id]` | protected student | student funding detail |
| Research funding | `/research-funding` | protected professor | role-specific funding listing |
| Research funding detail | `/research-funding/[id]` | protected professor | professor funding detail |
| Demo legacy | `/(demo)/**` | mixed | preserved but frozen after V2.P1 surgery |

---

## Target File Structure

```text
root/
├── app/
│   ├── (identity)/
│   ├── (funding)/
│   ├── (demo)/
│   ├── onboarding/
│   ├── profile/
│   ├── forum/
│   ├── dashboard/
│   ├── page.tsx
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── auth/
│   ├── profile/
│   ├── forum/
│   ├── funding/
│   ├── layout/
│   ├── demo/
│   └── ui/
├── lib/
│   ├── auth/
│   ├── session/
│   ├── profile/
│   ├── forum/
│   ├── funding/
│   ├── matching/
│   ├── demo/
│   └── env.ts
├── data/
│   └── demo/
├── scraper/
│   ├── sources/
│   ├── __fixtures__/
│   └── ...
├── supabase/
│   ├── migrations/
│   └── seeds/
├── dev-a-space/
│   └── codex/
├── dev-b-space/
│   └── codex/
└── shared-space/
    └── codex/
```

---

## Environment Variables

| Key | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | shared Supabase project URL | yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key for client and RLS-safe reads | yes |
| `SUPABASE_SERVICE_ROLE_KEY` | privileged key for server/admin/ETL writes and workflow secrets | yes |
