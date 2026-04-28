# Build Flow

> This 17-gate flow is a **Dev A translation** of the copied Auctus V2 docs.
> It does not change the real project phases; it breaks Dev A's locked track into proof-driven checkpoints that stay inside Dev A ownership.

## Prerequisites

- Read `ProjectSummary.md`, `Codex_guide.md`, `Progress.md`, and `references/README.md` before starting work
- Read `Migration.md` before choosing where the phase implementation should live
- Node/npm compatible with the repo, GitHub repo access, and shared Supabase access are required before feature work
- Supabase CLI is part of bootstrap; do not skip it
- Do not add Docker, Prisma, extra auth providers, new roles, AI-chat work, or new design-system exploration in this workspace
- Do not edit Dev B-owned folders except through an approved shared-file or contract protocol

Every phase closes only after the matching migration checkbox in `Progress.md` is checked. The record must follow `Migration.md` and name either `direct-main` execution or `workspace-draft` migration with real-project target paths and a commit/PR reference.

---

## P1 — Bootstrap Access and Branch Protection `[GATE G1]`
**Goal:** create the safe shared starting point before any Dev A feature code lands
- [ ] `develop` exists and branch protection is configured for `main` and `develop`
- [ ] both developers can work through PRs instead of direct pushes
- [ ] Dev A re-reads ownership boundaries before opening bootstrap work
**Proof:** show the protected branch setup and the exact `ownership.md` sections used for kickoff  
**Commit:** `chore(bootstrap): initialize protected V2 branch flow`

## P2 — Mixed-File Surgery and Domain Skeleton `[GATE G2 — requires G1]`
**Goal:** isolate legacy demo code and create the target folder skeleton without breaking the current app shell
- [ ] every move in `ownership.md` Mixed-File Surgery is completed
- [ ] demo URLs still load after the move
- [ ] `@contracts/*` resolves in a typecheck
**Proof:** show the surgery PR, run `npm run build` and `npm run lint`, and show the alias import resolving  
**Commit:** `chore(restructure): split mixed demo files and create domain folders`

## P3 — Shared Supabase and Quality Bootstrap `[GATE G3 — requires G2]`
**Goal:** complete the shared env, provider, migration, test, CI, and contract-lock setup
- [ ] `.env.example`, `lib/env.ts`, Supabase access, and `supabase db push` work
- [ ] Google OAuth plus email OTP / magic-link are configured
- [ ] Vitest, CI, and LOCKED contracts are in place
**Proof:** run `npm test`, `npm run build`, `npm run lint`, and show successful Supabase/provider setup proof  
**Commit:** `chore(bootstrap): complete shared Supabase and CI setup`

## P4 — Auth Entry Routes `[GATE G4 — requires G3]`
**Goal:** add real sign-in, sign-out, and callback entry points for Dev A's auth track
- [ ] browser and server Supabase clients exist
- [ ] `/sign-in`, `/auth/callback`, and `/sign-out` are wired
- [ ] both Google and email OTP / magic-link round-trips complete
**Proof:** demonstrate both sign-in methods in a fresh browser and show the redirect behavior  
**Commit:** `feat(auth): add sign-in callback and sign-out routes`

## P5 — Session Runtime and Route Registry `[GATE G5 — requires G4]`
**Goal:** publish the locked session helpers and the merged registry mechanism
- [ ] `GetSession` and `useSession` return the locked `Session` shape
- [ ] `authPolicies` and `combineRegistries` are exported
- [ ] `middleware.ts` handles unauthenticated, null-role, and wrong-role redirects
**Proof:** run the session tests and show `GetSession()` returning `{ user_id, role: null }` before onboarding  
**Commit:** `feat(session): add session helpers and route-policy middleware`

## P6 — Base Profile Schema `[GATE G6 — requires G5]`
**Goal:** land the base `profiles` table and first-login trigger
- [ ] `0001_profiles_base.sql` is applied
- [ ] `profiles.role` allows `null`
- [ ] first sign-in auto-creates a `profiles` row
**Proof:** run `supabase db push` and show the latest `profiles` row after fresh sign-in  
**Commit:** `feat(db): add base profiles schema and trigger`

## P7 — Role Selection and First-Run Forms `[GATE G7 — requires G6]`
**Goal:** implement the locked role selector and per-role required first-run forms
- [ ] `/onboarding` role selector exists
- [ ] `/onboarding/[role]` forms match the locked required-vs-deferred split
- [ ] no unapproved extra onboarding fields were introduced
**Proof:** show the business, student, and professor forms plus the PR note restating required vs deferred fields  
**Commit:** `feat(onboarding): add role selection and first-run forms`

## P8 — Profile Persistence Runtime `[GATE G8 — requires G7]`
**Goal:** persist role choice and publish the runtime query Dev B needs
- [ ] `lib/profile/upsert.ts` writes `profiles.role` and the role table in one transaction
- [ ] `getRoleProfile(user_id)` returns the discriminated union or `null`
- [ ] returning users skip onboarding and land on `/dashboard`
**Proof:** run profile tests, complete onboarding end-to-end, and show Dev B's note consuming `getRoleProfile`  
**Commit:** `feat(profile): add onboarding persistence and role profile queries`

## P9 — Role Profile Schema and Identity RLS `[GATE G9 — requires G8]`
**Goal:** add role-profile tables and identity-side RLS
- [ ] `0002_role_profiles.sql` is applied
- [ ] `0010_rls_identity.sql` is applied
- [ ] cross-user profile reads or writes are denied
**Proof:** run `supabase db push` and show SQL or test proof that another user's rows are inaccessible  
**Commit:** `feat(db): add role profiles and identity RLS`

## P10 — Forum Schema and Helpful-Vote Function `[GATE G10 — requires G9]`
**Goal:** land the persisted forum schema and safe helpful-vote path
- [ ] `0005_forum.sql` creates `threads`, `replies`, `reply_helpful_votes`, and `mark_reply_helpful`
- [ ] forum policies are present under identity RLS
- [ ] duplicate helpful votes are prevented at the database level
**Proof:** show the migration SQL and the duplicate/unauthenticated helpful-vote test cases  
**Commit:** `feat(db): add forum schema and helpful vote function`

## P11 — Forum Runtime and Pages `[GATE G11 — requires G10]`
**Goal:** expose real forum CRUD through Dev A-owned pages and helpers
- [ ] forum list, thread, and new-thread pages are wired to real data
- [ ] query helpers create threads and replies
- [ ] role badge rendering is present on authored content
**Proof:** demonstrate thread create -> reply -> reload and show cross-user edit denial  
**Commit:** `feat(forum): add persisted forum pages and helpers`

## P12 — Shell, Landing, and Providers `[GATE G12 — requires G11]`
**Goal:** make the visible shell role-aware without crossing into funding implementation
- [ ] navbar uses `ROLE_DEFAULT_ROUTE`
- [ ] signed-in landing redirects to `/dashboard`
- [ ] providers wire the client session context
**Proof:** show three role accounts with the correct navbar link and the post-sign-out return to `/`  
**Commit:** `feat(shell): add role-aware navbar and landing redirect`

## P13 — Funding Handoff Readiness `[GATE G13 — requires G12]`
**Goal:** verify the inbound Dev B runtime contract is stable before dashboard work begins
- [ ] Dev B's V2.P3 release has merged to `main`
- [ ] Dev B records the stable `GetFundingSummariesForUser` handoff in Dev A progress notes
- [ ] no contract change is required for dashboard composition
**Proof:** show the release merge reference, the handoff note, and the current `funding.ts` contract  
**Commit:** `docs(dashboard): confirm funding handoff readiness`

## P14 — Dashboard Funding Summary Tile `[GATE G14 — requires G13]`
**Goal:** compose Dev B's published funding summary tile into Dev A's dashboard
- [ ] `app/dashboard/page.tsx` calls `GetFundingSummariesForUser`
- [ ] `FundingSummaryTile` is imported from Dev B as presentation only
- [ ] all three roles receive the correct summary surface
**Proof:** demonstrate dashboard summaries for business, student, and professor accounts and run the dashboard composer test  
**Commit:** `feat(dashboard): integrate funding summary tile`

## P15 — Expiring Deadlines and Forum Activity `[GATE G15 — requires G14]`
**Goal:** finish full Dev A dashboard composition
- [ ] dashboard renders expiring-deadlines rows for items within 30 days
- [ ] empty state shows `No upcoming deadlines.` with the correct role CTA
- [ ] forum activity tile is composed alongside profile and funding data
**Proof:** demonstrate populated and empty deadline states for each role and show CTA targets from `ROLE_DEFAULT_ROUTE`  
**Commit:** `feat(dashboard): add expiring deadlines and forum activity tiles`

## P16 — Hardening and Test Coverage `[GATE G16 — requires G15]`
**Goal:** remove demo bleed, expand tests, and document Dev A flows
- [ ] no active Dev A file imports from `lib/demo` or `components/demo`
- [ ] auth, onboarding, forum, and dashboard tests are green
- [ ] setup docs cover Dev A flows
**Proof:** run the demo-import grep, run `npm test`, and show the updated documentation  
**Commit:** `chore(hardening): remove demo imports and add identity tests`

## P17 — Release Gate and Third-Project QA `[GATE G17 — requires G16]`
**Goal:** complete Dev A's contribution to the shared release and final verification gate
- [ ] Dev A checklist is fully green on `develop`
- [ ] the `release: V2.PN complete` PR merges with both approvals
- [ ] third Supabase project QA succeeds for sign-in, onboarding, forum, and dashboard composition
**Proof:** show the release PR merge, the third-project QA notes, and `git log --oneline -1`  
**Commit:** `docs(qa): record Dev A release and QA verification`
