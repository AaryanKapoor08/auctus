# G0 — Completed Questionnaire Record

This record was filled from the copied Auctus planning docs, not invented ad hoc.
`ProjectSummary.md` is the same full-project summary used in every space. This questionnaire narrows execution to the Dev A workspace while keeping the project identity global.

Primary source order:
- `references/build/shared/buildflow.md`
- `references/build/shared/ownership.md`
- `references/build/shared/bootstrap.md`
- `references/build/shared/conventions.md`
- `references/build/dev-a/buildflow.md`
- `references/build/dev-a/progress.md`
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
3. Problem it solves: users should not have to manually hunt scattered funding opportunities without context. The Dev A track solves the identity and community side of that problem by making role, onboarding, profile persistence, protected navigation, and shared forum behavior real instead of demo-only.
4. Project type: `production`

Pass record:
- Locked by `references/build/gameplan.md`
- Workspace scope narrowed to Dev A only per `references/build/shared/ownership.md`

---

## G0.2 — Developer Profile

1. Developer name: `Aaryan`
2. Experience level: `intermediate` (working assumption; not explicitly stated in the source docs)
3. Comfortable with: TypeScript, React, Next.js App Router, Tailwind, Git-based feature work
4. Not yet experienced enough to treat as implicit: Supabase auth/SSR details, raw SQL migration flow, RLS design, cross-domain route-policy composition
5. End-state goal: independently ship the identity and community track of Auctus V2 without crossing into Dev B's funding and scraper ownership

Pass record:
- Owner mapping is locked in `references/build/shared/ownership.md`
- Skill assumptions were chosen conservatively to match the existing role split

---

## G0.3 — Architecture + Category Detection

1. What is being built:
   A role-aware identity and community layer inside a full-stack Next.js product. This workspace owns how users sign in, acquire or defer a role, complete onboarding, persist role-specific profiles, navigate protected routes, and participate in the shared forum.
2. Tech stack:
   Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Supabase Auth, Supabase Postgres, RLS, Vitest, GitHub Actions, raw SQL migrations.
3. How the pieces connect:
   Browser pages call App Router pages and route handlers. Supabase Auth creates the session. Dev A's server/client helpers read that session, join `profiles`, and feed middleware plus UI context. Middleware uses the merged route-policy registries to redirect unauthenticated users, null-role users, and wrong-role users. Forum and profile persistence write through Supabase tables guarded by RLS.
4. Key architecture decisions and why:
   - Next.js App Router with middleware: role-aware routing lives close to the UI shell.
   - Supabase instead of a custom backend: auth, database, and RLS are unified.
   - Nullable `Profile.role` during onboarding gap: first login can create a profile row before the role is chosen.
   - Combined route-policy registries: Dev B can publish funding routes without editing `middleware.ts`.
   - One shared forum across all roles: product decision locked in `gameplan.md`.
5. Data in this workspace:
   `Profile`, `BusinessProfile`, `StudentProfile`, `ProfessorProfile`, `Thread`, `Reply`, `ReplyHelpfulVote`, plus the `RoutePolicyRegistry` runtime contract.
6. Config or environment variables:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

Category result:
- This is a `web` project
- Reason: browser UI + Next.js server runtime + Supabase database/auth

---

## G0.4 — Features & Structure

1. Core features:
   - Google OAuth plus email OTP / magic-link sign-in
   - Session helpers that expose `{ user_id, role }`
   - Role selector and role-specific onboarding forms
   - Per-role profile persistence and query helpers
   - Route protection through a merged route-policy registry
   - Shared forum with threads, replies, and helpful votes
   - Role-aware shell and dashboard composition

2. Frontend pages:

| Page | Route | Auth |
|---|---|---|
| Landing | `/` | public |
| Sign in | `/sign-in` | public |
| Auth callback | `/auth/callback` | public |
| Sign out | `/sign-out` | protected |
| Onboarding role select | `/onboarding` | protected |
| Onboarding per role | `/onboarding/[role]` | protected |
| Profile | `/profile` | protected |
| Profile edit | `/profile/edit` | protected |
| Forum list | `/forum` | protected |
| Forum thread | `/forum/[threadId]` | protected |
| New forum thread | `/forum/new` | protected |
| Dashboard | `/dashboard` | protected |

3. Runtime routes and entry points owned by Dev A:

| Method | Path or export | Auth | Purpose |
|---|---|---|---|
| `GET` | `/auth/callback` | public | exchange OAuth or magic-link result |
| `POST` | `/sign-out` | protected | terminate session |
| runtime export | `lib/session/get-session.ts` | protected context | canonical server session shape |
| runtime export | `lib/session/use-session.ts` | protected context | canonical client session shape |
| runtime export | `lib/profile/queries.ts#getRoleProfile` | protected context | publish `RoleProfile` to Dev B |
| runtime export | `lib/auth/route-policies.ts#combineRegistries` | shared runtime | merge Dev A and Dev B route registries |

4. Core constraint:
   A signed-in user must always resolve to the correct role-aware route state. Unauthenticated users must be redirected to sign-in when required. Users with `role: null` must be forced through onboarding. Onboarded users must not access another role's protected funding routes.
5. Third-party integrations:
   - Supabase Auth
   - Supabase Postgres + RLS
   - Google OAuth provider configured through Supabase
   - Email OTP / magic-link through Supabase Auth

Coverage check:
- Every listed feature maps to at least one page or runtime export
- Every protected page maps to a model or a route-policy rule

---

## G0.5 — Constraints & Red Lines

1. What must never happen:
   - Dev A must not edit Dev B-owned funding, matching, or scraper files except through an approved shared-file or contract protocol
   - Null-role users must never bypass onboarding
   - Another user's profile or forum write path must never become writable through broken RLS
   - `helpful_count` must never be mutated through arbitrary client updates
   - Deferred providers and legacy demo features must not be pulled back into active V2 scope
2. Performance constraints:
   Middleware and session reads must remain cheap enough that protected navigation feels immediate in local dev and CI. Dashboard composition should consume published funding summaries rather than loading heavy funding detail payloads.
3. Anything else to know:
   The repo is still at `V2.P1 — not started`. This workspace is a filled planning layer for future execution, not evidence that the implementation already exists.
4. Routes that must never have auth:
   `/`, `/sign-in`, `/auth/callback`
5. Routes that must always have auth:
   `/sign-out`, `/onboarding`, `/onboarding/[role]`, `/profile`, `/profile/edit`, `/forum`, `/forum/[threadId]`, `/forum/new`, `/dashboard`

---

## G0.6 — Critique, Cross-Check, Finalize

### Step 1 — Issues found

1. `references/claude/CurrentStatus.md` is the main repo-state snapshot in the root `claude/` set; most of the other root `claude/` files are generic mentor/templates rather than Auctus-specific execution docs.
2. The real repo is still a business-focused demo and V2.P1 has not started, so the workspace must describe the target Dev A track without pretending the code is already there.
3. The stock Likit template expects unused `ProjectSummary_*` templates to be deleted; this workspace therefore deletes them instead of preserving them.
4. The stock Likit template is generic and student-oriented; Auctus requires explicit ownership boundaries and named handoffs.

### Step 2 — Resolutions applied

1. Execution truth is anchored to `codex/references/build/` docs and typed contracts.
2. `codex/references/claude/CurrentStatus.md` is used as the repo-state snapshot, while the rest of `codex/references/claude/` is kept as archived root template/mentor context.
3. Archive templates remain untouched and are excluded from G0 failure checks in `AGENTS.md`.
4. All generated files are role-scoped to Dev A and explicitly mark Dev B surfaces as import-only or off-limits.

### Step 3 — Cross-check

- Feature → route:
  auth maps to `/sign-in`, `/auth/callback`, `/sign-out`
  onboarding maps to `/onboarding` and `/onboarding/[role]`
  profiles map to `/profile`, `/profile/edit`, `getRoleProfile`
  forum maps to `/forum`, `/forum/[threadId]`, `/forum/new`
  shell/dashboard maps to `/`, `/dashboard`, `useSession`, `combineRegistries`
- Route → model:
  onboarding/profile routes map to `Profile` plus one role-specific profile table
  forum routes map to `Thread`, `Reply`, `ReplyHelpfulVote`
  dashboard consumes `FundingSummary` only through Dev B exports
- Auth rule consistency:
  public routes remain public
  protected identity/community routes require auth
  funding route enforcement is composed from Dev B's published registry, not hardcoded inside Dev A's domain

### Step 4 — Final summary

- Name: `Auctus`
- Workspace: `Dev A / Aaryan`
- Category: `web`
- Track goal: ship identity, onboarding, profiles, forum, route gating, shell, and dashboard composition without crossing into funding implementation
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
