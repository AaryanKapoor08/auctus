# Ownership Map

This file defines who owns what: folders, routes, database tables, migrations, and shared files.

For *typed integration contracts* (interfaces, function signatures), see `build/contracts/`.
For *coordination rules* (branching, PRs, commits, tests), see `build/shared/conventions.md`.
For *Phase V2.P1 shared setup work*, see `build/shared/bootstrap.md`.

The job of this file is to make overlap difficult and obvious.

---

## Core Rules

- Ownership is by **domain**, not by random file edits.
- Parallel work is the default.
- Dependencies must be **explicit** and tied to real deliverables (named contract, named module).
- No one edits the other developer's owned domain without a handoff PR.
- Shared files are changed only by the assigned owner or by explicit coordination.
- If logic belongs to a domain, add it in that domain folder. No new broad "everything" files.

---

## Developers

| Tag | Person | Domain |
|---|---|---|
| Dev A | **Aaryan** | identity & community |
| Dev B | **Priyan** | funding & pipelines |

Dev tags ("Dev A", "Dev B") are used throughout the docs because they read more clearly in cross-references than first names. The mapping above is authoritative.

---

## Domain Ownership

### Dev A — Identity and Community

- auth (Supabase auth wiring, sign-in, sign-out, session reads)
- roles (the role enum, role assignment, role gating)
- onboarding (first-login flow per role)
- profiles (Profile + per-role profile shapes, persistence, edits)
- forum (threads, replies, authorship)
- route protection (middleware + route policy registry)
- shell composition (root layout, providers, navbar, footer, landing, dashboard composer)

### Dev B — Funding and Pipelines

- funding domain (unified `funding` table, queries, listing/detail UI)
- funding preferences (DB-backed saved defaults for role-specific filters)
- matching (per-role match scoring algorithms)
- ETL and scraping (2 sources per role in V2; extensible toward the larger source roadmap)
- ingestion (normalize, dedupe, expire, upsert into funding table)
- funding visibility rules (RLS for funding table, role-aware queries)
- funding source metadata, scrape run tracking

---

## Folder Ownership (Target State)

### Dev A folders

```
app/(identity)/sign-in/**
app/(identity)/sign-out/**
app/(identity)/auth/callback/**
app/onboarding/**
app/profile/**
app/forum/**
app/dashboard/**            ← Dev A is the dashboard composer
app/page.tsx                 ← landing (role-aware)
app/layout.tsx
app/providers.tsx
app/globals.css              ← shared but Dev A is owner of last resort
middleware.ts
components/auth/**
components/profile/**
components/forum/**
components/layout/**         ← Navbar, Footer, role-aware shell pieces
lib/auth/**
lib/profile/**
lib/forum/**
lib/session/**               ← server + client session helpers (publishes contracts/session.ts)
supabase/migrations/0001_profiles_base.sql      ← V2.P2: profiles + nullable role
supabase/migrations/0002_role_profiles.sql      ← V2.P3: business/student/professor profiles
supabase/migrations/0005_forum.sql              ← V2.P3: threads + replies
supabase/migrations/0010_rls_identity.sql       ← V2.P3: identity-side RLS
.github/workflows/ci.yml     ← shared CI (build/lint/test); Dev A is owner of record
```

### Dev B folders

```
app/(funding)/grants/**
app/(funding)/scholarships/**
app/(funding)/research-funding/**
components/funding/**
lib/funding/**
lib/matching/**
scraper/**                   ← separate npm workspace (see bootstrap.md)
supabase/migrations/0003_funding.sql            ← V2.P2: unified funding + funding_preferences
supabase/migrations/0004_scrape_metadata.sql    ← V2.P3: funding_sources + scrape_runs
supabase/migrations/0020_rls_funding.sql        ← V2.P3: funding-side RLS
.github/workflows/scrape.yml
```

**Documented one-off exception (Dev A creates one Dev-B-owned file).** In V2.P2 Step 1, Dev A creates a single placeholder file `lib/funding/route-policies.ts` whose entire body is `export const fundingPolicies: RoutePolicyRegistry = []`. This unblocks `middleware.ts` from a static import before Dev B's V2.P2 Step 1 lands. Dev B overwrites the file with the real registry in their first funding PR. After that overwrite, `lib/funding/**` is purely Dev B-owned and Dev A returns to import-only.

### Demo / Legacy (frozen, no active development)

```
app/(demo)/funding/**         ← V1 single-business funding pages move here
app/(demo)/matchmaker/**
app/(demo)/talent/**
app/(demo)/test-cards/**
app/(demo)/test-components/**
components/demo/**            ← GrantCard (V1), JobCard, TalentCard, MatchCard, AIChatbot
lib/demo/**                   ← BusinessContext, ai-responses
data/demo/**                  ← all current data/*.json files
```

The legacy AIChatbot stays mounted in `app/layout.tsx` for now (vision feature, no V2 work). It imports only from `components/demo/` and `lib/demo/`.

---

## Route Ownership

### Dev A routes

| Route | Owner | Notes |
|---|---|---|
| `/` | Dev A | Landing page, role-aware before/after auth. |
| `/sign-in`, `/sign-out`, `/auth/callback` | Dev A | Supabase Auth flows. |
| `/onboarding` | Dev A | First-login profile setup per role. |
| `/profile`, `/profile/edit` | Dev A | Per-role profile pages. |
| `/dashboard` | Dev A | Composes funding tiles (via Dev B contracts) + forum activity. |
| `/forum`, `/forum/[threadId]`, `/forum/new` | Dev A | Persisted threads/replies. |

### Dev B routes

| Route | Allowed roles | Notes |
|---|---|---|
| `/grants`, `/grants/[id]` | business | Lives in `app/(funding)/grants/**`. |
| `/scholarships`, `/scholarships/[id]` | student | Lives in `app/(funding)/scholarships/**`. |
| `/research-funding`, `/research-funding/[id]` | professor | Lives in `app/(funding)/research-funding/**`. |

The `(funding)` route group is purely organizational; it does NOT appear in URLs.

### Route gating (no cross-domain edits)

Dev A owns `middleware.ts` and never branches on funding paths. Dev B registers funding gates in `lib/funding/route-policies.ts` per the `RoutePolicy` shape in `build/contracts/route-policy.ts`. Dev A's `lib/auth/route-policies.ts` imports and concatenates Dev B's registry.

---

## Database Ownership

### Dev A tables

- `profiles` (extends `auth.users`; `role` is nullable until onboarding completes)
- `business_profiles`
- `student_profiles`
- `professor_profiles`
- `threads`
- `replies`
- `reply_helpful_votes` (one row per (`reply_id`, `user_id`); written only by the `mark_reply_helpful` SECURITY DEFINER function)

### Dev B tables

- `funding` (unified, type discriminator)
- `funding_preferences` (saved default filters per user + role)
- `funding_sources` (scraper metadata)
- `scrape_runs` (per-run summary)
- `funding_dedupe` (if needed; otherwise inline in `funding`)

### Shared tables

None for V2. Cross-domain references use foreign keys only (`threads.author_id -> profiles.id`).

### RLS policy ownership

- Identity-side RLS (`profiles`, `*_profiles`, `threads`, `replies`) → Dev A.
- Funding-side RLS (`funding`, `funding_preferences`, `funding_sources`, `scrape_runs`) → Dev B.
- RLS for funding visibility-by-role reads `auth.uid()` → joins `profiles.role`. Dev B writes the policy using the role enum from `build/contracts/role.ts`. The query shape Dev B relies on (`profiles.id` and `profiles.role` being present) is part of the LOCKED `Profile` contract.

---

## Migration Ownership

Migration files live in `supabase/migrations/` with the numeric prefix convention `NNNN_description.sql`. Ranges are exclusive — a number lives in exactly one range.

| Range | Owner | Purpose |
|---|---|---|
| `0000`-`0002` | Dev A | Init + base profiles + role profiles |
| `0003`-`0004` | Dev B | Funding schema + scrape metadata |
| `0005`-`0009` | Dev A | Identity/community schema (forum etc.) |
| `0010`-`0019` | Dev A | Identity-side RLS |
| `0020`-`0029` | Dev B | Funding-side RLS |

Currently planned migration filenames (lock these names; do not free-form rename):

| File | Owner | Lands at |
|---|---|---|
| `0000_init.sql` | Dev A | V2.P1 |
| `0001_profiles_base.sql` | Dev A | V2.P2 |
| `0002_role_profiles.sql` | Dev A | V2.P3 |
| `0003_funding.sql` (includes `funding` + `funding_preferences`) | Dev B | V2.P2 |
| `0004_scrape_metadata.sql` (`funding_sources` + `scrape_runs`) | Dev B | V2.P3 |
| `0005_forum.sql` (`threads` + `replies`) | Dev A | V2.P3 |
| `0010_rls_identity.sql` | Dev A | V2.P3 |
| `0020_rls_funding.sql` | Dev B | V2.P3 |

Each migration file has exactly one owner per the prefix. The two devs MUST coordinate the next available number when both have a pending migration to avoid collisions; see `build/shared/conventions.md` "Migration numbering."

---

## Shared Zones

### Frozen unless coordinated

Edits to these files require a PR with the other dev's review:

- `components/ui/**` — primitives shared by both domains
- `app/globals.css`
- `package.json`, `package-lock.json`
- `tsconfig.json`
- `next.config.ts`
- `eslint.config.mjs`
- `postcss.config.mjs`
- `.env.example`
- root-level docs that affect both tracks (`README.md`, `CLAUDE.md`)

### Shared integration surfaces (TYPED)

Live in `build/contracts/`. See that folder's README for the change protocol.

- `role.ts` — owner Dev A
- `profile.ts` — owner Dev A
- `session.ts` — owner Dev A
- `funding.ts` — owner Dev B
- `route-policy.ts` — registry shape Dev A; entries from both devs

---

## Mixed-File Surgery

The current repo has three legacy mixed files plus a mixed `components/cards/` folder. They must be split before parallel work begins.

| Current file | Lines | Move target | Surgery owner |
|---|---|---|---|
| `lib/data-utils.ts` | 644 | Split: business + match helpers → `lib/demo/data.ts`; types extracted to `build/contracts/` already | **Dev A** (single PR) |
| `lib/BusinessContext.jsx` | 46 | `lib/demo/BusinessContext.jsx` (or convert to .tsx if trivial) | **Dev A** |
| `lib/ai-responses.ts` | 563 | `lib/demo/ai-responses.ts` | **Dev A** |
| `components/cards/GrantCard.tsx` | — | `components/demo/GrantCard.tsx` | **Dev A** |
| `components/cards/MatchCard.tsx` | — | `components/demo/MatchCard.tsx` | **Dev A** |
| `components/cards/JobCard.tsx` | — | `components/demo/JobCard.tsx` | **Dev A** |
| `components/cards/TalentCard.tsx` | — | `components/demo/TalentCard.tsx` | **Dev A** |
| `components/cards/ThreadCard.tsx` | — | `components/forum/ThreadCard.tsx` | **Dev A** |
| `components/cards/ReplyCard.tsx` | — | `components/forum/ReplyCard.tsx` | **Dev A** |
| `components/cards/StatsCard.tsx` | — | `components/ui/StatsCard.tsx` (shared primitive) | **Dev A** |
| `app/funding/[grantId]/page.tsx` | — | `app/(demo)/funding/[grantId]/page.tsx` | **Dev A** |
| `app/funding/page.tsx` | — | `app/(demo)/funding/page.tsx` | **Dev A** |
| `app/matchmaker/**` | — | `app/(demo)/matchmaker/**` | **Dev A** |
| `app/talent/**` | — | `app/(demo)/talent/**` | **Dev A** |
| `app/test-cards/**`, `app/test-components/**` | — | `app/(demo)/test-cards/**`, `app/(demo)/test-components/**` | **Dev A** |
| `data/*.json` | — | `data/demo/*.json` | **Dev A** |
| `components/AIChatbot.tsx` | — | `components/demo/AIChatbot.tsx` | **Dev A** |
| `components/ChatbotWrapper.tsx` | — | `components/demo/ChatbotWrapper.tsx` | **Dev A** |

**Why one owner:** these moves cross every dev's territory. Doing it in one PR with Dev B as reviewer avoids day-one merge conflicts. Dev B does NOT touch these files in V2.P1.

After this surgery lands:

- `lib/auth/`, `lib/profile/`, `lib/forum/`, `lib/funding/`, `lib/matching/`, `lib/session/` exist as empty folders with placeholder `index.ts` files
- `components/auth/`, `components/profile/`, `components/forum/`, `components/funding/` exist as empty folders
- `scraper/` exists as an empty folder with its own `package.json` (see `bootstrap.md`)
- `supabase/migrations/` exists as an empty folder
- The app still builds and the demo pages still work at `/(demo)/...` URLs

---

## Demo Scope Isolation

`talent`, `matchmaker`, V1 `funding` (single-business), `test-cards`, `test-components`, the rule-based AI chatbot, and the static JSON data layer are **legacy**. They live under `app/(demo)/`, `components/demo/`, `lib/demo/`, `data/demo/`. No V2 phase touches them. They remain present so the running app does not regress.

---

## Handoff Rules

- A dependency is valid only if it names the **exact deliverable** needed (a contract file, a module export, a route, a migration filename, an interface).
- "Waiting on the other dev" without a named deliverable is not a valid blocker.
- A handoff points to a contract, module, route, schema, or interface that is ready to consume.
- Bug fixes inside another developer's domain are filed as PR requests back to the owner unless both agree otherwise.

---

## Blocking Policy

### Allowed blockers

A blocker is logged in `progress.md` with the **exact missing deliverable name**. The complete list of valid blockers in V2:

- V2.P1 shared bootstrap not complete (any item in `bootstrap.md` "V2.P1 Completion Gate" unticked)
- Mixed-file surgery PR (A1) not merged
- A contract listed in `build/contracts/*.ts` still at `// STATUS: DRAFT` past the gate at which it should be LOCKED
- `0010_rls_identity.sql` not landed → blocks Dev B's `0020_rls_funding.sql` (the funding RLS join reads `profiles.role`)
- `lib/profile/queries.ts` `getRoleProfile` not published → blocks Dev B from wiring `GetFundingSummariesForUser` to scoring
- `lib/funding/queries.ts` runtime exports not yet shipped on `main` (V2.P3 release PR not yet merged) against real ETL data → blocks Dev A's V2.P4 dashboard tile
- A required migration named in `Migration Ownership` not yet applied to the shared dev DB (blocks code that queries that table)

### Not allowed as blockers

- Vague uncertainty
- Convenience waits
- "I thought they were handling this"
- Random edits in shared files instead of routed coordination

---

## Workflow Pointers

Branching, commits, PR review, test commands, migration numbering: see `build/shared/conventions.md`.
