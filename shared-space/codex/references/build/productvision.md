# Auctus V2 — Product Vision, System Context, and Resume File

**Last updated:** 2026-04-25  
**Primary purpose:** single-file context handoff for future work sessions  
**Use this when:** you want Codex or Claude to regain the full project context quickly

---

## 1. What this file is

This file is the **high-context project brief** for Auctus V2.

It exists because:

- `build/gameplan.md` is intentionally short and strategic
- `build/shared/buildflow.md` and the dev buildflows are execution docs, not full product context
- `claude/ProjectSummary.md` is product vision, but it does not capture all of the decisions, clarifications, and tradeoffs discussed afterward

This file should let a future assistant or developer understand:

- what Auctus V2 is supposed to become
- what is already agreed
- what is still open
- how the architecture is supposed to work
- how two developers are supposed to execute it
- where to resume discussion next

## 2. What this file is not

- It is **not** the authoritative phase tracker. `build/shared/buildflow.md` remains authoritative for phase order and gates.
- It is **not** the authoritative ownership map. `build/shared/ownership.md` remains authoritative for folder, route, DB, and migration ownership.
- It is **not** the authoritative typed contract source. `build/contracts/*.ts` remain authoritative for cross-domain types.
- ETL source selection is now **LOCKED-FOR-V2** (see §7.4); Dev B verifies robots.txt/ToS but does not re-open the list.

Treat this file as the **best re-entry point**, then jump into the build docs for implementation.

---

## 3. Current Snapshot

### Project name

Auctus

### Core idea

A multi-role Canadian funding platform that helps:

- businesses find grants and support programs
- students find scholarships, grants, and related funding
- professors find research funding opportunities

### Current repo reality

The repo is currently closer to a **frontend demo shell** than a finished product. It already has:

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- ESLint 9
- demo pages and legacy static/demo data

It does **not** yet have the full V2 backend/platform stack wired up.

### Current execution status

As of 2026-04-25:

- both dev progress files say the project is at `V2.P1 — Shared Bootstrap & Restructuring`
- both progress files say that phase is **not started**

So the team is still at the setup and restructuring stage, not at feature-complete implementation yet.

---

## 4. Product Vision In Plain English

Auctus is meant to become a **real product**, not another mockup/demo.

The product should:

- support **three roles from the beginning**
- use real authentication and persistent user data
- personalize funding recommendations
- store and query real funding opportunities
- ingest fresh funding data through ETL/scraping
- provide a shared community/forum area
- keep legacy/demo features isolated instead of pretending they are part of the new product

The intended product feel is:

- role-aware
- useful immediately after signup
- personalized enough that users feel the product understands their funding context
- operationally simple enough that two developers can actually ship it

---

## 5. What V2 Actually Means

### Important distinction

There are two layers of ambition:

1. **Broad product vision**
   This is the larger idea in `claude/ProjectSummary.md`.
2. **Committed V2 scope**
   This is the buildable, near-term version described in `build/gameplan.md` and the buildflows.

### V2 definition

V2 is the **first real version** of Auctus:

- multi-role from day one
- real auth
- real profiles
- real funding storage
- real forum persistence
- real scraper/ETL pipeline
- strong ownership boundaries for two parallel developers

### V2 is not

- a major redesign effort
- a full AI-chat product phase
- an expansion of every legacy feature
- the complete long-term vision in one pass

---

## 6. In Scope vs Out of Scope

### In scope for V2

- repo restructuring for two-dev execution
- Supabase setup
- env handling
- migrations
- CI and basic tests
- Google-based and email-based authentication flows
- onboarding and role selection
- per-role profiles
- route protection
- unified funding data model
- funding listing/detail pages by role
- matching/personalization logic
- shared forum
- ETL pipeline for funding ingestion

### Explicitly deferred or frozen

- major AI chat expansion
- talent expansion
- matchmaker expansion
- major visual redesign
- aggressive expansion of legacy demo features

### Legacy rule

Legacy/demo features should remain available in a `(demo)` area so the old app does not break, but they are **not active V2 product work**.

---

## 7. Current Product Direction

This section captures what has been discussed so far, including product intent, user wishes, and current working recommendations.

### 7.1 Core USP

The product's main differentiator is expected to be **personalized funding discovery**, not just a static database of opportunities.

That means the product should not only show funding listings. It should:

- understand who the user is
- understand what they are eligible for
- rank and summarize funding in a useful way
- reduce the need for repetitive searching

### 7.2 Personalization direction

**Working direction:** personalization should come primarily from **onboarding + saved profile data**, not just ad hoc filters.

#### User concern raised

Businesses, students, and professors will each need some kind of personalization because that is the USP.

Two approaches were discussed:

1. Ask questions during signup/onboarding
2. Let users use funding-page filters and persist those with cookies

#### Recommended direction

Use a **hybrid model**, but with different roles for each part:

- onboarding questions = durable eligibility and personalization data
- page filters = short-term search intent
- saved preferences = stored in DB, not cookies

#### Why this direction is better

- cookies are weak for cross-device persistence
- cookies do not give strong server-side personalization
- filters alone are too shallow to power the dashboard and match scoring
- onboarding/profile data fits the V2 architecture better because matching and dashboard summaries are already server-side concepts

#### Candidate onboarding fields (not locked)

Business:

- business name
- industry
- province/location
- revenue band
- employee band
- business stage or maturity

Student:

- education level
- field of study
- institution
- province
- GPA optional
- citizenship/residency — **excluded from V2 onboarding**; not part of `StudentProfile`. Adding it would require the contract change protocol. Until then, student matching does not depend on this field.

Professor:

- institution
- department
- research area
- career stage
- research keywords

#### Additional persistence concept

Locked V2 direction:

- `funding_preferences`
  - `user_id`
  - `role`
  - `default_filters` (`jsonb`)
  - `updated_at`

The intent is **not** to store a tiny generic preference object. The product likely needs:

- strong, role-specific funding filters
- enough filtering depth that users can narrow results aggressively
- separate filter logic and UI by role, not one bland shared filter set

The current expectation is:

- shared filter framework
- role-specific filter definitions
- DB-backed saved preferences, not cookie-only persistence

#### Status

`LOCKED DIRECTION`

The product direction is agreed:

- personalization should rely on onboarding/profile data
- filters alone should not be the main personalization strategy
- V2 should include `funding_preferences`
- filters should be role-specific, not one generic set

**Onboarding field set: LOCKED 2026-04-26.** See `build/dev-a/buildflow.md` Step 2 task 1 for the per-role required-vs-deferred split. Summary:

- **Business required:** `display_name`, `business_name`, `industry`, `location`, `revenue`, `employees`. Deferred to `/profile/edit`: `description`, `year_established`, `website`.
- **Student required:** `display_name`, `education_level`, `field_of_study`, `institution`, `province`, `gpa`. Deferred: `graduation_year`. Citizenship/residency is excluded from V2 (not in `StudentProfile`).
- **Professor required:** `display_name`, `institution`, `department`, `research_area`, `career_stage`, `research_keywords`. Deferred: `h_index`.

Adding any new onboarding field requires updating `build/contracts/profile.ts` first via the contract change protocol.

### 7.3 Authentication direction

Important distinction:

- **Authentication** = how users sign in
- **Authorization** = what they can access after sign-in

Authorization in Auctus is based on the role system:

- `business`
- `student`
- `professor`

#### User request raised

The product may want multiple common sign-in methods such as:

- Google
- GitHub
- normal email

#### Locked V2 decision

For V2, auth is locked as:

- Google: yes
- Email OTP / magic link: yes
- Microsoft / Azure: deferred
- GitHub: deferred
- Email + password: deferred

#### Reasoning

- Google is broadly useful across businesses, students, and professors
- email OTP/magic link is a universal fallback
- Microsoft is more relevant to universities and professional institutions than GitHub
- GitHub is lower-value for this audience and adds setup/support surface
- every extra provider adds callback handling, QA, configuration, and support burden

#### Status

`LOCKED FOR V2`

### 7.4 ETL source selection

#### Status

`LOCKED-FOR-V2` (decided 2026-04-26)

V2 uses **official Canadian government / public-sector sources only**. Private aggregators are explicitly rejected for V2 first-pass ETL.

#### Locked V2 source list (6 total, 2 per role)

**Business:**

1. Innovation Canada / ISED **Business Benefits Finder** — https://ised-isde.canada.ca/site/innovation-canada/en/first-things-first/how-get-most-out-business-benefits-finder
2. ISED **Supports for Business** — https://ised-isde.canada.ca/site/ised/en/supports-for-business

**Student:**

1. **EduCanada Scholarships** — https://www.educanada.ca/scholarships-bourses/non_can/index.aspx?lang=eng
2. **Indigenous Bursaries Search Tool** — https://sac-isc.gc.ca/eng/1351185180120/1351685455328

> Scope note: these two are an **official-source first pass for V2**, not full Canadian scholarship coverage. Provincial student-aid portals, university scholarship pages, and major non-government scholarship programs are deferred to a post-V2 ETL expansion.

**Professor / research:**

1. **NSERC Funding Opportunities** — https://nserc.canada.ca/en/funding/funding-opportunity
2. **SSHRC Funding Opportunities** — https://sshrc-crsh.canada.ca/en/funding/opportunities.aspx

#### CIHR

Deferred to the first post-V2 ETL expansion. Many CIHR opportunities route through ResearchNet, which is more application-system oriented than NSERC/SSHRC. Re-evaluate if health-research professor coverage is later flagged as mandatory in V2.

#### Explicitly rejected for V2 first-pass ETL

GrantCompass, GrantHub, Yconic, ScholarshipsCanada, Canada Grants Database, and other private/commercial aggregators. Reasons: ToS / scraping risk, commercial database incentives, less authoritative than official sources, more likely to change markup, higher legal/product risk for V2. They may be useful for comparison or future licensed/partner data paths but are not first-pass scraper sources.

#### What is already decided (still true)

- ETL is part of V2.
- ETL writes normalized data into Supabase.
- The website reads from the normalized funding table, not from live scraped pages.
- Every imported row carries `source_url`, `scraped_from`, `scraped_at`.
- Per-source failures are isolated; the scraper logs per-source counts to `scrape_runs`.

---

## 8. System Architecture

### High-level shape

The system is a **domain-split monolith plus a background ingestion worker**.

There are two main runtimes:

1. **Next.js app**
   Handles UI, auth-aware pages, profiles, forum, funding pages, session-aware queries, and role-aware navigation.
2. **Scraper / ETL runtime**
   Runs separately, fetches funding opportunities, normalizes them, deduplicates them, expires old rows, and writes them to Supabase.

### Core architectural principle

This is **not** meant to become a complicated service mesh or multi-backend system.

It should stay simple:

- one web app
- one primary backend platform (Supabase)
- one background ingestion pipeline
- typed contracts between the two developer domains

### System picture

```text
Browser
  -> Next.js app
    -> session helpers
    -> middleware
    -> domain query helpers
    -> Supabase Auth + Postgres

GitHub Actions
  -> scraper/
    -> fetch source pages
    -> parse / normalize
    -> dedupe / expire
    -> write funding rows into Supabase
```

---

## 9. Planned Tech Stack

### Current frontend base

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- ESLint 9
- `clsx`
- `tailwind-merge`
- `lucide-react`

### Planned V2 platform stack

Frontend / app:

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS

Backend / platform:

- Supabase Auth
- Supabase Postgres
- Supabase RLS
- `@supabase/supabase-js`
- `@supabase/ssr`

Scraping / ETL:

- separate `scraper/` TypeScript package
- `cheerio`
- GitHub Actions

Quality / tooling:

- Vitest
- GitHub Actions CI

### Architectural note on AI

The legacy chatbot can remain mounted in the legacy/demo area, but new AI-chat system work is deferred for V2.

---

## 10. Data Architecture

### Supabase as the source of truth

Supabase is expected to store:

#### Auth

- `auth.users`

#### Identity and profiles

- `profiles`
- `business_profiles`
- `student_profiles`
- `professor_profiles`

#### Community

- `threads`
- `replies`

#### Funding and pipeline

- `funding`
- `funding_sources`
- `scrape_runs`

#### Planned V2 addition

- `funding_preferences`

### Unified funding table

One of the key V2 decisions is to use **one unified funding table** rather than separate tables for business grants, scholarships, and research grants.

Each funding row should carry a `type`, for example:

- `business_grant`
- `scholarship`
- `research_grant`

This keeps the data model simpler and allows one funding UI architecture with role-aware filtering and scoring.

---

## 11. Domain Boundaries

### Dev A owns identity and community

- auth
- session helpers
- role assignment
- onboarding
- profile persistence
- forum
- route protection
- shell composition
- dashboard composition

### Dev B owns funding and pipelines

- funding schema
- funding queries
- funding pages
- matching logic
- scraper / ETL
- funding visibility rules
- funding-side RLS

### Why this matters

The build is designed so two developers can work in parallel **without stepping on each other**.

Cross-domain integration is supposed to happen through:

- typed contracts under `build/contracts/`
- named runtime exports
- explicit handoffs

It should **not** happen through random edits in each other's folders.

---

## 12. Contract-Based Integration

The cross-domain contracts are a major part of the system design.

### Shared contract themes

- role enum
- profile shapes
- session shape
- funding shapes
- route policy shape

### Why contracts exist

Dev A and Dev B need to move independently, but still agree on:

- what a session looks like
- what profile data matching can read
- what a funding item/summary looks like
- how route gating is registered

The contracts make those agreements explicit and compiler-visible.

### Important current note

Some contract files are still marked `DRAFT` and are supposed to become `LOCKED` by the V2.P1 completion gate.

---

## 13. Authorization and Route Gating

### Role model

The three roles are:

- `business`
- `student`
- `professor`

### Default role routes

The intended default funding routes are:

- business -> `/grants`
- student -> `/scholarships`
- professor -> `/research-funding`

### Route protection model

Dev A owns `middleware.ts`, but the middleware is not supposed to hardcode funding logic.

Instead:

- Dev A registers identity/community routes
- Dev B registers funding routes
- both are merged into one route policy registry
- middleware applies the most specific matching rule

This avoids constant cross-domain edits whenever funding routes change.

---

## 14. User Flow

### Primary auth and onboarding flow

1. User lands on `/`
2. If signed out, they see the public landing page
3. User signs in
4. Supabase callback returns to the app
5. App checks whether a profile exists and whether a role has been chosen
6. If role is missing, user goes to onboarding
7. User selects role
8. User fills role-specific onboarding/profile form
9. App persists base profile plus role-specific profile
10. Returning users skip onboarding and go to their role-aware experience

### Primary funding flow

1. Session is read
2. Role is known
3. Role maps to a funding type
4. Funding query helper fetches relevant rows
5. Matching logic optionally scores and ranks those rows
6. User sees funding list/detail pages
7. User can apply extra filters
8. Future saved preferences may refine defaults

### Dashboard flow

The dashboard is supposed to become a composition layer:

- profile summary
- funding summaries
- forum activity

Dev A owns the dashboard page, but it consumes Dev B's funding summary contract/export.

---

## 15. ETL / Ingestion Flow

### What the ETL pipeline does

The ETL pipeline should:

1. fetch source pages
2. parse the content
3. normalize into a shared funding shape
4. deduplicate against existing funding rows
5. update changed records
6. insert new records
7. expire outdated entries
8. record run/source metadata

### Where ETL writes

The ETL pipeline writes into Supabase, mainly:

- `funding`
- `funding_sources`
- `scrape_runs`

### How the website uses ETL output

The website does **not** scrape live pages during user requests.

Instead:

```text
external sources
-> scraper/etl
-> Supabase funding table
-> app query helpers
-> funding pages and dashboard tiles
-> user
```

This is important because:

- app performance stays predictable
- scraper failures do not break page requests
- data is normalized before UI code touches it

### ETL source list status

`LOCKED-FOR-V2` (2026-04-26). See §7.4 for the six official sources, the rejected aggregator list, and the CIHR-deferred decision.

---

## 16. Execution Model

### Broad sequence

#### V2.P1

Shared bootstrap and restructuring

- split mixed demo files
- create target folder structure
- add Supabase and env guards
- add migrations folder
- add CI/test setup
- add scraper skeleton
- lock cross-domain contracts

#### V2.P2

Parallel foundations

Dev A:

- auth
- callback/sign-out
- session helpers
- route policy merge system

Dev B:

- funding schema
- funding queries
- funding route policies
- funding pages with seed data

#### V2.P3

Parallel core delivery

Dev A:

- onboarding persistence
- role-specific profiles
- forum
- identity-side RLS

Dev B:

- matching
- ETL
- funding-side RLS

#### V2.P4

Controlled integration

- dashboard funding summaries
- shared composition points

#### V2.P5

Hardening

- tests
- cleanup
- demo isolation audit
- release readiness

### Important current reality

All of that exists as a plan, but the repo is still at the start of V2.P1.

---

## 17. Current Open Questions

These are the main discussion topics that still need attention.

### Open Question 1: Final onboarding field set

`RESOLVED 2026-04-26.` Locked per-role required-vs-deferred split is documented in §7.2 and `build/dev-a/buildflow.md` Step 2 task 1.

### Open Question 2: ETL sources

`RESOLVED 2026-04-26.` Source list locked in §7.4 to six official Canadian government sources (ISED ×2, EduCanada, Indigenous Bursaries, NSERC, SSHRC). CIHR deferred to post-V2.

---

## 18. Resume Flags

Use these flags to recover the state of the project quickly.

### Project state

- `PROJECT_STATE: ACTIVE PLANNING`
- `CURRENT_PHASE: V2.P1`
- `PHASE_STATUS: NOT STARTED`

### Product direction

- `USP_DIRECTION: PERSONALIZED FUNDING DISCOVERY`
- `PERSONALIZATION_MODEL: ONBOARDING + PROFILE + SAVED PREFERENCES + FILTERS`
- `FILTER_COOKIES_AS_PRIMARY_STRATEGY: REJECTED`
- `ONBOARDING_FIELDS_STATUS: LOCKED_FOR_V2 (2026-04-26)`
- `ONBOARDING_SCOPE_SPLIT_STATUS: LOCKED_FOR_V2 (2026-04-26)`
- `ONBOARDING_STUDENT_CITIZENSHIP_RESIDENCY: EXCLUDED_FROM_V2`
- `ROLE_SPECIFIC_FILTERS_DIRECTION: YES`
- `FUNDING_PREFERENCES_DIRECTION: LOCKED_INCLUDE_IN_V2`

### Auth direction

- `AUTH_SET: LOCKED`
- `AUTH_RECOMMENDATION: GOOGLE + EMAIL_OTP`
- `AUTH_OPTIONAL_PROVIDER: NONE_FOR_V2`
- `AUTH_DEFERRED_PROVIDER: GITHUB`
- `AUTH_DEFERRED_PROVIDER_2: MICROSOFT`
- `AUTH_DEFERRED_PROVIDER_3: EMAIL_PASSWORD`

### ETL direction

- `ETL_INCLUDED_IN_V2: YES`
- `ETL_SOURCE_LIST: LOCKED_FOR_V2 (2026-04-26)`
- `ETL_SOURCES_BUSINESS: ISED_BUSINESS_BENEFITS_FINDER + ISED_SUPPORTS_FOR_BUSINESS`
- `ETL_SOURCES_STUDENT: EDUCANADA_SCHOLARSHIPS + INDIGENOUS_BURSARIES_SEARCH_TOOL`
- `ETL_SOURCES_PROFESSOR: NSERC + SSHRC`
- `ETL_SOURCES_DEFERRED: CIHR (POST_V2)`
- `ETL_PRIVATE_AGGREGATORS: REJECTED_FOR_V2`

### Architecture direction

- `ARCHITECTURE_STYLE: DOMAIN_SPLIT_MONOLITH + BACKGROUND_ETL`
- `PRIMARY_BACKEND: SUPABASE`
- `FUNDING_MODEL: UNIFIED_FUNDING_TABLE`
- `CROSS_DOMAIN_INTEGRATION: TYPED_CONTRACTS`

---

## 19. If A Future Assistant Reads Only One File

If a future assistant is told to read only one file before helping, use this one first.

After reading this file, the next files to read should usually be:

1. `build/shared/buildflow.md`
2. `build/shared/ownership.md`
3. `build/dev-a/buildflow.md`
4. `build/dev-b/buildflow.md`
5. `build/contracts/*.ts`

If the task is product-strategy oriented, also read:

- `claude/ProjectSummary.md`

If the task is implementation-oriented, also read:

- `build/dev-a/progress.md`
- `build/dev-b/progress.md`

---

## 20. Suggested Next Discussion Pickup

When resuming product discussion, the next best topics are:

1. Finalize the onboarding field set per role.
2. Finalize the onboarding versus later profile-edit split.
3. Later, separately, finalize ETL sources.

That is the cleanest next step from the current state.
