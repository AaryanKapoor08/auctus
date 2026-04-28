# Dev A Buildflow — Identity & Community

**Owner: Aaryan**

## Mission

Own everything related to who the user is and how the community runs:

- auth (Supabase + Google OAuth + email OTP / magic link)
- roles (the role enum, role assignment, role gating)
- onboarding
- profiles (`Profile` + `BusinessProfile` + `StudentProfile` + `ProfessorProfile`)
- forum (threads, replies)
- route protection (middleware + combined route policy registry)
- shell composition (root layout, providers, navbar, footer, landing, dashboard composer)

## Working Rule

Stay inside Dev A folders unless you are following a contract change protocol or executing an explicit shared-file PR.

## Off-Limits Folders (do NOT touch)

These belong to Dev B. Any change here requires Dev B's explicit approval on a PR you opened — and almost every time, the right move is to file an issue and let Dev B do it.

```
app/(funding)/grants/**
app/(funding)/scholarships/**
app/(funding)/research-funding/**
components/funding/**            ← exception: import only, never edit
lib/funding/**                   ← exception: import the published exports, never edit. ONE-OFF EXCEPTION: in V2.P2 Step 1, Dev A creates a placeholder `lib/funding/route-policies.ts` (`export const fundingPolicies: RoutePolicyRegistry = []`). Dev B overwrites it in their V2.P2 Step 1.
lib/matching/**
scraper/**
supabase/migrations/0003_*.sql, 0004_*.sql, 0020_*.sql (and 0020-0029 range)
.github/workflows/scrape.yml
```

Demo folders (`app/(demo)/**`, `components/demo/**`, `lib/demo/**`, `data/demo/**`) are Dev A's *only* during the V2.P1 surgery PR. After that PR merges, demo is frozen — neither dev edits it.

## Owned Folders

```
app/(identity)/sign-in/**, sign-out/**, auth/callback/**
app/onboarding/**
app/profile/**
app/forum/**
app/dashboard/**
app/page.tsx
app/layout.tsx
app/providers.tsx
app/globals.css        ← shared but Dev A is owner of last resort
middleware.ts
components/auth/**
components/profile/**
components/forum/**
components/layout/**
lib/auth/**
lib/profile/**
lib/forum/**
lib/session/**
lib/env.ts             ← shared but Dev A maintains
supabase/migrations/0001_profiles_base.sql
supabase/migrations/0002_role_profiles.sql
supabase/migrations/0005_forum.sql
supabase/migrations/0010_rls_identity.sql
.github/workflows/ci.yml
```

## Contracts Dev A Publishes

- `build/contracts/role.ts` (LOCKED by V2.P1)
- `build/contracts/profile.ts` (LOCKED by V2.P1)
- `build/contracts/session.ts` (LOCKED by V2.P1)
- `build/contracts/route-policy.ts` (LOCKED by V2.P1)
- Runtime: `lib/session/get-session.ts` exports `GetSession` (server) and `useSession` (client).
- Runtime: `lib/auth/route-policies.ts` exports the merged `RoutePolicyRegistry` (its own + Dev B's).

## Contracts Dev A Consumes

- `build/contracts/funding.ts` — for dashboard tile and any landing teaser.
- Runtime: `lib/funding/queries.ts` `GetFundingSummariesForUser` (consumed in V2.P4 only).
- Runtime: `lib/funding/route-policies.ts` (imported by `lib/auth/route-policies.ts` to compose the merged registry).

---

## Step 0 — Shared Bootstrap (V2.P1)

Dev A is the bootstrap executor. Follow `build/shared/bootstrap.md` end-to-end.

Key items Dev A personally drives:

- A1 mixed-file surgery PR (single PR, Dev B reviews).
- A2 `@contracts/*` path alias.
- B1-B4 Supabase project, `.env.example`, `lib/env.ts`, `supabase/migrations/0000_init.sql`.
- C1, C2 Vitest + CI workflow.
- D2 promote `Profile`, `Session`, `Funding` contracts to LOCKED with Dev B.

**Tests for V2.P1:** `npm run lint`, `npm run build`, `npm test`, CI green on a PR.

**Proof for V2.P1:** every box in `bootstrap.md` "V2.P1 Completion Gate" is ticked.

---

## Step 1 — Identity Foundation (V2.P2)

### Coupling

- **Inbound:** none. This step is fully independent.
- **Outbound to Dev B:** publishes the runtime `GetSession` (server) and `useSession` (client) per the LOCKED `Session` shape. Publishes the merged `RoutePolicyRegistry` mechanism so Dev B can register funding routes.

### Tasks

1. Add `lib/env.ts` env-guarded reads of all Supabase vars (already from bootstrap; reuse).
2. Create `lib/supabase/client.ts` (browser, anon key) and `lib/supabase/server.ts` (server-side cookie-based client via `@supabase/ssr`).
3. Create `app/(identity)/sign-in/page.tsx` — "Sign in with Google" plus email OTP / magic-link form. Do not add GitHub, Microsoft, or email-password auth in V2.
4. Create `app/auth/callback/route.ts` — exchange OAuth code or verify email OTP callback, redirect to `/onboarding` on first login (no profile row or null role) or `/dashboard` (profile exists with role).
5. Create `app/(identity)/sign-out/route.ts` — POST sign-out.
6. Create `lib/session/get-session.ts` — server-side `GetSession`. Reads Supabase session, joins `profiles` for `role`, returns `Session | null` per the LOCKED `Session` contract.
7. Create `lib/session/use-session.ts` — client-side `useSession` hook with the same shape.
8. Create `lib/auth/route-policies.ts`:
   - Export `authPolicies: RoutePolicyRegistry` covering Dev A's routes:
     - `/` — public, no auth required.
     - `/sign-in`, `/auth/callback` — public, no auth required.
     - `/sign-out` — `require_auth: true`.
     - `/onboarding` — `require_auth: true`, all roles allowed (handles `role: null` case).
     - `/profile`, `/profile/edit` — `require_auth: true`, all roles allowed.
     - `/forum` (and subpaths) — `require_auth: true`, all roles allowed.
     - `/dashboard` — `require_auth: true`, all roles allowed.
   - Export `combineRegistries(...registries: RoutePolicyRegistry[]): RoutePolicyRegistry` that concatenates and orders by descending `path.length` so most-specific matches first.
   - Inside this file, statically import Dev B's registry: `import { fundingPolicies } from "@/lib/funding/route-policies"`. If Dev B's file is not yet committed, ship a placeholder `lib/funding/route-policies.ts` that exports `export const fundingPolicies: RoutePolicyRegistry = []` (one-line file, owned by Dev A only as a temporary stub; deleted in Dev B's first PR that lands the real registry). This avoids the dynamic-import / try-catch pattern.
9. Create `middleware.ts` — calls `combineRegistries(authPolicies, fundingPolicies)`, picks the most-specific match for the request URL, and applies redirects: `null role + path !== /onboarding → /onboarding`; `role not in allowed_roles → /` (or `ROLE_DEFAULT_ROUTE[role]` if set); `require_auth + no session → /sign-in`.

### Migrations

- `supabase/migrations/0001_profiles_base.sql` (V2.P2 only):
  - `profiles` table: `id uuid PK references auth.users`, `role text NULL CHECK (role IS NULL OR role IN ('business','student','professor'))`, `display_name`, `email`, `avatar_url`, `created_at`, `updated_at`.
  - Trigger to insert a `profiles` row on `auth.users` insert.
  - Do NOT add the role-specific tables here — they land in `0002_role_profiles.sql` during V2.P3 Step 2.

### Outputs / Deliverables

- `GetSession` runtime export — Dev B can import it.
- Empty merged `RoutePolicyRegistry` — Dev B can register entries against it.
- A user can complete the sign-in round-trip and end up with a `profiles` row.

### Tests

- Vitest: `lib/session/get-session.test.ts` mocks Supabase and asserts shape conforms to `Session`.
- Manual: Google sign-in and email magic-link sign-in tested against the real Supabase project; profile row appears.

### Proof for completion

- [ ] Sign in with Google works end-to-end on a fresh browser; profile row appears.
- [ ] Sign in with email OTP / magic link works end-to-end on a fresh browser; profile row appears.
- [ ] `profiles` row created automatically on first sign-in (trigger verified by inserting into `auth.users` from the Supabase dashboard SQL editor).
- [ ] `GetSession()` returns `{ user_id, role }` with `role: null` until onboarding completes.
- [ ] `middleware.ts` does not crash when `lib/funding/route-policies.ts` is the temporary placeholder (empty registry); requests pass through unchanged for unregistered routes.
- [ ] `npm run lint`, `npm run build`, `npm test` green.
- [ ] Commit: `feat(auth): add Supabase auth and session contract`

---

## Step 2 — Role Selection & Onboarding (V2.P2 → V2.P3)

### Coupling

- **Inbound:** none. `Session.role: Role | null` is already locked in `build/contracts/session.ts` at V2.P1; just verify in passing.
- **Outbound to Dev B:** publishes `lib/profile/queries.ts` exporting `getRoleProfile(user_id): Promise<RoleProfile | null>`. This is what Dev B's matching needs in Step 3.

### Can work in parallel with

- Dev B's V2.P3 Step 4 (ETL) and Step 5 (funding RLS — but that one waits for `0010_rls_identity.sql`). Do not block waiting for them.

### Tasks

1. **First-run field set (LOCKED).** All onboarding fields are a strict subset of `build/contracts/profile.ts`. Adding any new field requires the contract change protocol first.

   **Business — required at first-run:** `display_name`, `business_name`, `industry`, `location`, `revenue`, `employees`.
   **Business — deferred to `/profile/edit`:** `description`, `year_established`, `website`.

   **Student — required at first-run:** `display_name`, `education_level`, `field_of_study`, `institution`, `province`, `gpa`.
   **Student — deferred to `/profile/edit`:** `graduation_year`.
   Citizenship/residency is **not** part of V2 onboarding. It is not in `StudentProfile`; adding it requires a contract change PR. Until then, student matching does not depend on citizenship/residency (see Dev B Step 3 weights).

   **Professor — required at first-run:** `display_name`, `institution`, `department`, `research_area`, `career_stage`, `research_keywords`.
   **Professor — deferred to `/profile/edit`:** `h_index`.

   The PR description for this step must restate the required-vs-deferred split per role for review.
2. Create `app/onboarding/page.tsx` — role selector form.
3. Create `app/onboarding/[role]/page.tsx` — per-role profile form (business / student / professor). Form validation enforces the required first-run set decided in Task 1; deferred fields are not asked here.
4. Create `lib/profile/upsert.ts` — server actions to upsert `profiles` (set `role`) and the role-specific table in a single transaction.
5. Create `lib/profile/queries.ts` — exports `getRoleProfile(user_id: string): Promise<RoleProfile | null>`. **This is the runtime helper Dev B's matching consumes (Dev B Step 3).** Publish it as part of this step.
6. Wire callback redirect: `role IS NULL` → `/onboarding`; `role IS NOT NULL` → `/dashboard`.

### Migrations

- `supabase/migrations/0002_role_profiles.sql`:
  - `business_profiles`, `student_profiles`, `professor_profiles` tables, each with `id uuid PK references profiles(id) ON DELETE CASCADE` and the fields listed in `build/contracts/profile.ts`.
- `supabase/migrations/0010_rls_identity.sql`:
  - RLS on `profiles`: SELECT all authenticated users (display_name + role visible for forum badges); UPDATE/INSERT/DELETE own row only.
  - RLS on `business_profiles`, `student_profiles`, `professor_profiles`: SELECT/UPDATE/INSERT/DELETE own row only.
  - Forum-table policies are added in this same migration (or the same PR) once `0005_forum.sql` lands — see Step 3 below.

> Note: `Session.role: Role | null` is **already** the agreed shape in `build/contracts/session.ts`. The V2.P1 D2 lock just confirms it; no contract change protocol is needed for that field.

### Tests

- Vitest: `lib/profile/upsert.test.ts` — happy path + invalid role + already-onboarded.
- Vitest: `lib/profile/queries.test.ts` — `getRoleProfile` returns the discriminated `RoleProfile` per the LOCKED contract for each role; returns `null` when role is unset.
- Manual: sign-in → onboarding → land on `/dashboard`.

### Proof for completion

- [ ] First-run required fields vs later editable fields are documented in the PR description.
- [ ] User picks a role, fills profile, profile rows persist.
- [ ] Returning user skips onboarding and lands on `/dashboard`.
- [ ] `getRoleProfile(user_id)` returns the LOCKED `RoleProfile` discriminated union; entry logged under "Contract changes consumed" in `build/dev-b/progress.md` so Dev B can unblock Step 3 wiring.
- [ ] RLS verified: querying another user's profile rows returns nothing.
- [ ] Commit: `feat(profile): add per-role onboarding and profile persistence`

---

## Step 3 — Forum Domain (V2.P3)

### Coupling

- **Inbound:** none.
- **Outbound to Dev B:** none.

### Tasks

1. `app/forum/page.tsx` — list threads, sort by recency.
2. `app/forum/[threadId]/page.tsx` — thread + replies + new reply form.
3. `app/forum/new/page.tsx` — new thread form.
4. `lib/forum/queries.ts` — `listThreads`, `getThread`, `createThread`, `createReply`, `markReplyHelpful`. The `markReplyHelpful(reply_id)` helper calls the `mark_reply_helpful` SECURITY DEFINER function (see Migrations); it does NOT issue a direct UPDATE on `replies`.
5. `components/forum/ThreadCard.tsx`, `ReplyCard.tsx` (move from `components/demo/` per surgery — already done in V2.P1; adapt to real data).
6. Show `Profile.role` as a badge on author.

### Migrations

- `supabase/migrations/0005_forum.sql`:
  - `threads` (`id`, `author_id` FK to `profiles.id`, `title`, `body`, `category`, `created_at`, `updated_at`).
  - `replies` (`id`, `thread_id` FK, `author_id` FK, `body`, `helpful_count` int default 0, `created_at`, `updated_at`).
  - `reply_helpful_votes` (`reply_id` FK, `user_id` FK to `profiles.id`, `created_at`); **unique key on (`reply_id`, `user_id`)** to prevent double-voting.
  - `mark_reply_helpful(reply_id uuid)` **SECURITY DEFINER** function. Body:
    1. Reject if `auth.uid()` is null.
    2. (If feasible) Reject if the caller is the reply's author — read `replies.author_id` and compare; raise an exception otherwise.
    3. `INSERT INTO reply_helpful_votes (reply_id, user_id) VALUES (reply_id, auth.uid()) ON CONFLICT DO NOTHING`. If `INSERT` did nothing (duplicate), exit without incrementing.
    4. Otherwise `UPDATE replies SET helpful_count = helpful_count + 1 WHERE id = reply_id`.
  - `GRANT EXECUTE ON FUNCTION mark_reply_helpful(uuid) TO authenticated`.

- Extend `supabase/migrations/0010_rls_identity.sql` (or add it now if not yet committed) so forum tables get policies:
  - `threads`: SELECT for any authenticated user; INSERT where `author_id = auth.uid()`; UPDATE/DELETE only by author.
  - `replies`: SELECT for any authenticated user; INSERT where `author_id = auth.uid()`; UPDATE/DELETE only by author. **No client-side UPDATE on `helpful_count`** — that field is mutated only via `mark_reply_helpful()`.
  - `reply_helpful_votes`: SELECT only by `user_id = auth.uid()` (used to render "you marked this helpful" UI); INSERT/UPDATE/DELETE forbidden to clients (only the SECURITY DEFINER function writes here).

> Why SECURITY DEFINER instead of a permissive UPDATE policy on `helpful_count`: it prevents accidental edits to other reply fields, gives one place to enforce duplicate-vote rules, and lets us optionally block self-helpful votes server-side.

### Tests

- Vitest: forum query helpers (mocked Supabase).
- Vitest / SQL: `mark_reply_helpful` covers — authenticated user can mark another user's reply helpful; second call by same user does not double-increment; unauthenticated call fails; (if implemented) self-mark fails.
- Manual: post thread → reply → both visible after reload.

### Proof for completion

- [ ] Thread persists, reply persists, reload shows them.
- [ ] Author role badge renders.
- [ ] RLS verified on edit attempt by another user (UPDATE on someone else's reply returns `0 rows`).
- [ ] Authenticated user can mark another user's reply helpful via `mark_reply_helpful`; `helpful_count` increments by exactly 1.
- [ ] Duplicate `mark_reply_helpful` call by the same user does not increment `helpful_count` again.
- [ ] Unauthenticated call to `mark_reply_helpful` fails.
- [ ] User cannot mutate arbitrary fields on `replies` (RLS blocks direct UPDATE; `helpful_count` only changes via the function).
- [ ] (If implemented) Own-reply helpful vote is blocked.
- [ ] Commit: `feat(forum): add persisted threads and replies`

---

## Step 4 — Shell & Navigation (V2.P3)

### Coupling

- **Inbound:** consumes only the LOCKED `Role` enum + `ROLE_DEFAULT_ROUTE` from `build/contracts/role.ts`. No runtime dependency on Dev B.
- **Outbound to Dev B:** none.

### Tasks

1. Update `components/layout/Navbar.tsx` to be role-aware: signed-out → public CTAs; signed-in → role's funding link from `ROLE_DEFAULT_ROUTE`, profile, forum, dashboard.
2. Update `app/page.tsx` (landing) — signed-in users redirect to `/dashboard`; signed-out shows role-targeted CTAs.
3. Update `app/layout.tsx` — wrap with `<Providers>` (auth + toast contexts).
4. Update `app/providers.tsx` — add the auth context using `useSession` from Step 1.

### Tests

- Manual: signed-out user sees public landing; signed-in user redirected to dashboard; navbar shows role-correct funding link.

### Proof for completion

- [ ] Three role accounts each see correct navbar link.
- [ ] Sign-out returns user to public landing.
- [ ] Commit: `feat(shell): add role-aware navbar and landing redirect`

---

## Step 5 — Integration Consumption (V2.P4)

### Coupling (this is the heavy one)

- **Inbound from Dev B:** `lib/funding/queries.ts` exports `GetFundingSummariesForUser(user_id, limit)` returning `FundingSummary[]` with real ETL data. `components/funding/FundingSummaryTile.tsx` exported as a presentation component taking `summaries: FundingSummary[]`.
- **Inbound trigger:** the V2.P3 release PR has merged into `main` (so Dev B's `lib/funding/queries.ts` runtime exports are shipped against real ETL data) AND Dev B has posted a "Contract changes consumed" entry in Dev A's `progress.md` naming the merge commit. Do NOT start Step 5 before both conditions are true.
- **Outbound to Dev B:** none. The composition lives entirely in Dev A's `app/dashboard/page.tsx`.

### Tasks

1. Wait for the V2.P3 release PR to merge to `main` and Dev B's "Contract changes consumed" entry naming that merge commit to appear in Dev A's `progress.md`.
2. `app/dashboard/page.tsx` composes (server component, role-aware):
   - Profile summary tile (Dev A's data).
   - Funding summary tile — `await GetFundingSummariesForUser(session.user_id, 5)` rendered with `components/funding/FundingSummaryTile.tsx` (lives in Dev B's `components/funding/`; Dev A imports only).
   - Expiring deadlines tile — calls `GetFundingSummariesForUser(session.user_id, N)` (where N is large enough to find 30-day matches, e.g. 25) inside the dashboard's server component, then filters and sorts in-memory on the server for items with `deadline` within the next 30 days before rendering. (Per `claude/ProjectSummary.md` "expiring deadlines" feature; no new contract needed because `FundingSummary.deadline` is already exposed. If 25 turns out to be too small a window for any role's empty-state to be meaningful, raise N rather than introducing a new query helper.)
     - When matches exist: render the rows.
     - When no rows match: render the **empty-state CTA** — text `No upcoming deadlines.` plus a role-aware CTA link to `ROLE_DEFAULT_ROUTE[session.role]` (business → `/grants`, student → `/scholarships`, professor → `/research-funding`). Use the `ROLE_DEFAULT_ROUTE` map from `build/contracts/role.ts`; do not hard-code the role→route mapping in the tile.
   - Forum activity tile (Dev A's data).
3. Landing teaser (`app/page.tsx`): out of scope for V2 unless trivially achievable. Do **not** call `GetFundingSummariesForUser` for unauthenticated visitors; that helper is keyed by `user_id`. Skip.

### Tests

- Manual: dashboard renders with real funding tiles for each role.
- Vitest: dashboard server component test mocking `GetFundingSummariesForUser`.

### Proof for completion

- [ ] Three role accounts each see role-appropriate funding summary tile on dashboard.
- [ ] Expiring-deadlines tile renders rows when matching items exist (deadline within 30 days).
- [ ] Expiring-deadlines tile, when empty, renders `No upcoming deadlines.` plus a CTA link to the role's funding route from `ROLE_DEFAULT_ROUTE`:
  - business account → CTA points at `/grants`
  - student account → CTA points at `/scholarships`
  - professor account → CTA points at `/research-funding`
- [ ] Commit: `feat(dashboard): integrate funding summaries`

---

## Step 6 — Hardening (V2.P5)

### Coupling

- **Inbound:** none.
- **Outbound to Dev B:** none. Each dev hardens their own surface independently.

### Tasks

1. Audit Dev A owned files for any imports from `lib/demo/` or `components/demo/`. Remove all.
2. Add Vitest coverage for: sign-in callback, onboarding upsert, forum CRUD, dashboard composer.
3. Add Playwright (optional, if added to bootstrap): sign-in → onboarding → post-thread happy path.
4. Update README with Dev A's flows.

### Proof for completion

- [ ] Zero `from "@/lib/demo"` or `from "@/components/demo"` in Dev A files.
- [ ] All Vitest suites green.
- [ ] Commit: `chore(hardening): remove demo imports and add identity tests`

---

## Done Criteria for Dev A's Track

- Users can sign in via Google or email OTP / magic link and hold one of the 3 roles.
- Onboarding completes and writes per-role profile data.
- Returning users land on the correct role-aware experience.
- Route protection works (other-role and unauthenticated access blocked).
- Forum threads and replies persist.
- Role-aware shell + landing redirect work.
- Dev B can consume `Role`, `Profile`, `Session`, `RoutePolicy` without ambiguity.

## When You Are Blocked

Check `build/shared/conventions.md` "When you are blocked" first. Allowed blockers list is in `build/shared/ownership.md` "Blocking Policy."

Most likely real blocker for Dev A: none in V2.P2-P3. Dev A's track has no upstream dependency on Dev B until V2.P4 dashboard integration. If you find yourself waiting on Dev B before V2.P4, you have the wrong blocker — pick another step.
