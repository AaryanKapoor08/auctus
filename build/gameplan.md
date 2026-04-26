# Auctus V2 Gameplan

The committed scope for the next real phase of Auctus.

This file is **strategic only**: scope, goals, locked decisions, doc map. For execution detail, follow the links at the bottom.

---

## Goal

Turn the current single-role frontend demo into a real multi-role product that supports:

- **Businesses** looking for grants
- **Students** looking for scholarships
- **Professors** looking for research funding

Real auth, real persistence, real ingestion. Not another demo.

---

## Current Starting Point

The repo today has:

- a working Next.js 16 frontend shell (App Router, React 19, Tailwind 4)
- demo pages, static JSON data, a local matching algorithm
- a rule-based local chatbot
- a single-business mental model wired into `lib/data-utils.ts` and `lib/BusinessContext.jsx`

It does NOT have:

- real authentication or sessions
- real user profiles
- persisted forum data
- a real funding store
- ETL ingestion
- multi-role product behavior

---

## Locked Product Decisions

These are agreed and should not be revisited without an explicit decision PR:

- Build the real platform, not another demo.
- Support all 3 roles from the start: business, student, professor.
- V2 auth is Google + email OTP / magic link. GitHub, Microsoft, and email-password auth are deferred.
- One unified `funding` table with role-aware views and queries.
- Personalization is driven by onboarding/profile data plus DB-backed saved funding preferences, not cookies as the primary strategy.
- Funding filters must be role-specific, with a shared filter framework where useful.
- One shared forum across all roles.
- Move `talent`, `matchmaker`, V1 funding pages, test pages, and the local chatbot into a `(demo)` legacy area. Keep them running, do not iterate.
- AI chat is deferred. The legacy chatbot stays mounted as-is.
- No major design exploration in V2. Existing UI primitives stay.
- Two developers work in parallel with strict ownership boundaries.
- Restructuring + bootstrap is the first phase. Nothing else starts until it lands.
- All work merges to `develop` first; `main` only receives the `release: V2.PN complete` PR at each phase gate. Branch protection is set up at the start of V2.P1.
- ETL source list is **LOCKED-FOR-V2** (2026-04-26): six official Canadian government sources — ISED Business Benefits Finder, ISED Supports for Business, EduCanada Scholarships, Indigenous Bursaries Search Tool, NSERC, SSHRC. CIHR deferred. Private aggregators rejected. Dev B verifies robots.txt / ToS per source before scraper modules land but does not re-open source selection.

---

## Two-Developer Working Model

| Dev | Person | Domain |
|---|---|---|
| **Dev A** | Aaryan | identity & community — auth, roles, onboarding, profiles, forum, route protection, shell composition, dashboard |
| **Dev B** | Priyan | funding & pipelines — funding domain, matching, ETL, ingestion, role-aware funding visibility |

Boundaries enforced by `build/shared/ownership.md`. Cross-domain coordination happens through typed contracts in `build/contracts/`, not through editing each other's folders.

---

## In Scope For This Phase

- Repo restructuring for two-developer parallel work.
- Shared backend bootstrap (Supabase, env, migrations, CI, tests).
- Real auth and session handling: Google plus email OTP / magic link.
- Role selection and onboarding for all 3 roles.
- Per-role profile flows.
- Route protection and role-aware navigation.
- Unified funding data model.
- Role-aware funding browsing, filtering, detail.
- DB-backed saved funding preferences (`funding_preferences`) with role-specific filter defaults.
- Real forum threads and replies.
- ETL pipeline for funding ingestion.
- Hardening, cleanup, tests.

## Out Of Scope For This Phase

- AI chat integration (legacy chatbot stays mounted; no work).
- Talent expansion (frozen in `(demo)`).
- Matchmaker expansion (frozen in `(demo)`).
- Major visual redesign.
- Anything not in the in-scope list above.

---

## Phase Map

V2 phases are numbered `V2.P1` through `V2.P5` to avoid collision with the legacy V1 P1-P7. Phase content and execution detail live in `build/shared/buildflow.md`. Quick map:

| Phase | Theme | Tracks |
|---|---|---|
| V2.P1 | Shared Bootstrap & Restructuring | Shared (Dev A leads, Dev B reviews) |
| V2.P2 | Parallel Domain Foundation | Dev A + Dev B in parallel |
| V2.P3 | Parallel Core Delivery | Dev A + Dev B in parallel |
| V2.P4 | Controlled Integration | Both, on named handoffs |
| V2.P5 | Hardening & Release Prep | Shared |

---

## Doc Map

Strategy and scope (this file): `build/gameplan.md`

Product context (re-entry brief, NOT a build plan):

- `build/productvision.md` — full product context, locked decisions, open questions

Execution:

- `build/shared/buildflow.md` — master phase tracker (single source of truth for phasing)
- `build/dev-a/buildflow.md` — Dev A's step-by-step coding guide
- `build/dev-b/buildflow.md` — Dev B's step-by-step coding guide
- `build/dev-a/progress.md` — Dev A progress checklist
- `build/dev-b/progress.md` — Dev B progress checklist

Coordination:

- `build/shared/ownership.md` — folder/route/DB/migration/shared-file ownership
- `build/shared/contracts.md` — pointer to typed contracts
- `build/contracts/*.ts` — actual typed cross-domain interfaces
- `build/contracts/README.md` — contract change protocol + status legend
- `build/shared/conventions.md` — branching, PRs, commits, migrations, tests
- `build/shared/bootstrap.md` — V2.P1 shared setup checklist

Vision input (do NOT treat as build plan):

- `claude/ProjectSummary.md` — product vision and architectural intent (legacy framing)
- `claude/CurrentStatus.md` — repo-state snapshot

Legacy:

- `claude/BuildFlow.md`, `claude/Progress.md` — V1 demo build docs, kept for history only
