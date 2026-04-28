# Dev A Progress — Aaryan

Mirror of `build/dev-a/buildflow.md`. Update each box as it passes its proof line. A step is `[x]` only when **proof** is shown, not when code is written.

**Owner:** Aaryan
**Domain:** identity & community (auth, roles, onboarding, profiles, forum, route protection, shell, dashboard composition)

## Current Phase

V2.P1 — Shared Bootstrap & Restructuring (not started)

## Contract Changes Consumed

(One line per locked-contract change Dev A consumed. Initially empty.)

---

## Step 0 — Shared Bootstrap (V2.P1)

Drives `build/shared/bootstrap.md`. Each box matches the bootstrap completion gate.

- [ ] **(pre-bootstrap)** — `develop` branch created from `main`; branch protection on `main` and `develop`.
- [ ] **A1** — mixed-file surgery PR merged; `/(demo)/...` URLs reachable; build green.
- [ ] **A2** — `@contracts/*` import resolves in a throwaway `lib/_check.ts`.
- [ ] **A3** — `BusinessContext` converted to `.tsx` (optional; can defer).
- [ ] **B1** — Supabase project provisioned; `.env.example` complete; Priyan invited to the Supabase project; both devs verified `npm run dev` boots locally.
- [ ] **B2** — `@supabase/supabase-js` and `@supabase/ssr` installed; `npm ci` clean.
- [ ] **B3** — `supabase/migrations/0000_init.sql` applied to shared dev DB; `supabase/README.md` committed.
- [ ] **B3a** — both devs ran `supabase login` + `supabase link`; `supabase db push` works locally for both.
- [ ] **B4** — `lib/env.ts` shipping; missing-var error verified by deleting `.env.local` and rerunning `npm run dev`.
- [ ] **B6** — Google OAuth configured in Google Cloud Console + Supabase Auth; throwaway sign-in succeeds against the Supabase test tool.
- [ ] **B7** — Email OTP / magic-link enabled in Supabase Auth; test magic-link arrives in a real inbox.
- [ ] **C1** — Vitest installed; `npm test` green with 1 sanity test.
- [ ] **C2** — `.github/workflows/ci.yml` green on a real PR.
- [ ] **C4** — GitHub Actions secrets present (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- [ ] **C5** — Priyan accepted as repo collaborator; `dev-b/_access-check` PR ran CI green.
- [ ] **D2** — `Profile`, `Session`, `Funding` contracts at `// STATUS: LOCKED` with Dev B's review.

**Phase commit (in `release: V2.P1 complete` PR):** `chore(bootstrap): complete V2.P1 shared bootstrap`

---

## Step 1 — Identity Foundation (V2.P2)

- [ ] `lib/supabase/client.ts` and `lib/supabase/server.ts` added.
- [ ] `app/(identity)/sign-in/page.tsx` renders Google sign-in and email OTP / magic-link form.
- [ ] `app/auth/callback/route.ts` exchanges OAuth code or verifies email OTP callback and redirects (onboarding vs dashboard).
- [ ] `app/(identity)/sign-out/route.ts` clears session.
- [ ] `lib/session/get-session.ts` exports `GetSession`; returns `Session | null`.
- [ ] `lib/session/use-session.ts` exports `useSession` hook.
- [ ] `lib/auth/route-policies.ts` exports `authPolicies` (covering `/`, `/sign-in`, `/auth/callback`, `/sign-out`, `/onboarding`, `/profile`, `/profile/edit`, `/forum`, `/dashboard`) and `combineRegistries`.
- [ ] Placeholder `lib/funding/route-policies.ts` shipped (`export const fundingPolicies: RoutePolicyRegistry = []`) so middleware imports do not crash before Dev B's Step 1.
- [ ] `middleware.ts` calls `combineRegistries(authPolicies, fundingPolicies)`, applies most-specific-prefix-wins gate logic.
- [ ] `supabase/migrations/0001_profiles_base.sql` applied; `profiles` row trigger working.
- [ ] Vitest suite for `get-session` green.
- [ ] **Proof:** sign in with Google and email OTP / magic link on a fresh browser → `profiles` row exists → `GetSession()` returns `{ user_id, role: null }`.
- [ ] **Commit:** `feat(auth): add Supabase auth and session contract`

---

## Step 2 — Role Selection & Onboarding (V2.P3)

- [ ] PR description restates the LOCKED required-vs-deferred field split per role (business / student / professor — see buildflow Step 2 task 1).
- [ ] Onboarding form for each role asks for exactly the locked required fields, no more.
- [ ] `/profile/edit` exposes the deferred fields for later editing.
- [ ] No citizenship/residency field is asked or required for students (would need contract change PR first).
- [ ] `app/onboarding/page.tsx` role selector.
- [ ] `app/onboarding/[role]/page.tsx` per-role profile form (validates first-run set only).
- [ ] `lib/profile/upsert.ts` server actions persist `profiles.role` + role-specific row in one transaction.
- [ ] `lib/profile/queries.ts` exports `getRoleProfile(user_id): Promise<RoleProfile | null>`.
- [ ] Callback redirects null-role → `/onboarding`, set-role → `/dashboard`.
- [ ] `supabase/migrations/0002_role_profiles.sql` applied.
- [ ] `supabase/migrations/0010_rls_identity.sql` applied; cross-user read returns nothing.
- [ ] Vitest suite for `upsert` and `getRoleProfile` green.
- [ ] Dev B's `progress.md` "Contract changes consumed" updated with the `getRoleProfile` publish line.
- [ ] **Proof:** role pick → form fill → row persisted → returning user skips onboarding.
- [ ] **Commit:** `feat(profile): add per-role onboarding and profile persistence`

---

## Step 3 — Forum Domain (V2.P3)

- [ ] `app/forum/page.tsx` lists real threads.
- [ ] `app/forum/[threadId]/page.tsx` shows thread + replies + new-reply form.
- [ ] `app/forum/new/page.tsx` creates a thread.
- [ ] `lib/forum/queries.ts` exports CRUD helpers (`listThreads`, `getThread`, `createThread`, `createReply`, `markReplyHelpful`).
- [ ] `markReplyHelpful` calls the `mark_reply_helpful` SECURITY DEFINER function — no direct UPDATE on `replies` from the client.
- [ ] Author role badge renders.
- [ ] `supabase/migrations/0005_forum.sql` applied: `threads`, `replies`, `reply_helpful_votes` (unique on `(reply_id, user_id)`), and `mark_reply_helpful(reply_id uuid)` SECURITY DEFINER function granted to `authenticated`.
- [ ] Forum policies added to `0010_rls_identity.sql`: authenticated read on threads/replies; author-only write; no client UPDATE on `replies.helpful_count`; `reply_helpful_votes` is service/function-only writes.
- [ ] Vitest / SQL: authenticated user can mark another user's reply helpful; duplicate call no-ops; unauthenticated fails; (if implemented) self-mark blocked.
- [ ] **Proof:** post thread → reply → reload → both persist; cross-user edit blocked by RLS; helpful-count behaviour matches the test list.
- [ ] **Commit:** `feat(forum): add persisted threads and replies`

---

## Step 4 — Shell & Navigation (V2.P3)

- [ ] `components/layout/Navbar.tsx` role-aware (signed-in shows correct funding link from `ROLE_DEFAULT_ROUTE`).
- [ ] `app/page.tsx` redirects signed-in users to `/dashboard`.
- [ ] `app/layout.tsx` wraps tree with `<Providers>`.
- [ ] `app/providers.tsx` exposes auth context using `useSession`.
- [ ] **Proof:** three role accounts each see correct navbar link; sign-out returns to public landing.
- [ ] **Commit:** `feat(shell): add role-aware navbar and landing redirect`

---

## Step 5 — Integration Consumption (V2.P4)

- [ ] V2.P3 release PR merged to `main`.
- [ ] "Contract changes consumed" entry from Dev B above naming the V2.P3 release commit and confirming `GetFundingSummariesForUser` is shipped against real ETL data.
- [ ] `app/dashboard/page.tsx` composes profile + funding-summary tile + expiring-deadlines tile + forum activity tiles.
- [ ] Funding-summary tile uses `components/funding/FundingSummaryTile.tsx` (imported from Dev B's domain, no edits to Dev B's files).
- [ ] Expiring-deadlines tile filters `GetFundingSummariesForUser` results to `deadline` within 30 days.
- [ ] Empty state: when no rows match, tile renders `No upcoming deadlines.` plus role-aware CTA from `ROLE_DEFAULT_ROUTE` (business → `/grants`, student → `/scholarships`, professor → `/research-funding`).
- [ ] Vitest suite for dashboard composer green.
- [ ] **Proof:** for each role, both populated state (rows shown) and empty state (CTA pointing at the correct funding route) verified.
- [ ] **Commit:** `feat(dashboard): integrate funding summaries`

---

## Step 6 — Hardening (V2.P5)

- [ ] Zero `from "@/lib/demo"` or `from "@/components/demo"` in Dev A owned files.
- [ ] Vitest coverage on: sign-in callback, onboarding upsert, forum CRUD, dashboard composer.
- [ ] (Optional) Playwright happy-path: sign-in → onboarding → post-thread.
- [ ] README updated with Dev A flows.
- [ ] **Proof:** all suites green; `grep -r "lib/demo" app/(identity) app/onboarding app/profile app/forum app/dashboard lib/auth lib/profile lib/forum lib/session` returns nothing.
- [ ] **Commit:** `chore(hardening): remove demo imports and add identity tests`

---

## Blockers

(Log here only with a named missing deliverable per `ownership.md` "Allowed blockers." None recorded yet.)

## Notes

(Free-form. Use sparingly.)
