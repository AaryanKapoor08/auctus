# Progress

**Current Gate:** G1
**Current Phase:** P1 — Bootstrap Access and Branch Protection
**Project Category:** web
**Last Updated:** 2026-04-28
**Session Notes:** Likit workspace filled from copied Auctus docs. Real repo state remains `V2.P1 — Shared Bootstrap & Restructuring (not started)`. This tracker mirrors only Dev A's role-safe execution path.

> Each gate (G) corresponds to a phase (P): G1 = P1, G2 = P2, etc.
> All checkboxes require proof before they can be marked `[x]`.

---

## G0 — Project Setup `[complete]`
- [x] G0.1 Identity captured from copied source docs
- [x] G0.2 Developer profile inferred and recorded for Aaryan
- [x] G0.3 Category locked as `web`
- [x] G0.4 Dev A features, routes, models, and integrations mapped
- [x] G0.5 Constraints and red lines recorded
- [x] G0.6 Critique and cross-check completed
- [x] `_fill_manifest.md` fully populated
- [x] `ProjectSummary.md`, `Codex_guide.md`, `BuildFlow.md`, and `Progress.md` generated
- [x] Placeholder audit completed for filled files
- [x] Obsolete `ProjectSummary_*` templates removed from `codex/`

---

## Contract and Handoff Notes

Add one line per exact upstream or downstream handoff. Use commit hashes or PR links whenever possible.

- None recorded yet

---

## P1 — Bootstrap Access and Branch Protection `[not started]`
- [ ] read `references/build/shared/ownership.md` core rules, Dev A ownership, mixed-file surgery, and blocking policy
- [ ] read `references/build/shared/conventions.md` branching, PR, migration, and phase-release rules
- [ ] read `references/build/shared/bootstrap.md` and isolate the Dev A-owned bootstrap items: A1, A2, B1-B4, B6-B7, C1-C2, C4-C5, D1-D2
- [ ] confirm root `claude/CurrentStatus.md` still says V2 code has not started and bootstrap is the current entry gate
- [ ] create `develop` from `main` and push it to the shared repo
- [ ] configure branch protection on `main` and `develop`
- [ ] confirm both Dev A and Dev B will work only through PRs into `develop`
- [ ] confirm shared bootstrap branches will use `shared/<short-description>` and Dev A feature branches will use `dev-a/<short-description>`
- [ ] capture kickoff proof showing protected branches and the exact ownership sections used for setup
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P2 — Mixed-File Surgery and Domain Skeleton `[locked — requires P1]`
- [ ] open the single-purpose restructure PR targeting `develop` with Dev B as required reviewer
- [ ] move `lib/data-utils.ts` legacy demo helpers into the demo area required by `ownership.md`
- [ ] move `lib/BusinessContext.jsx` into `lib/demo/BusinessContext.jsx` or record an explicit deferral-to-P16 note if `.tsx` conversion is postponed
- [ ] move `lib/ai-responses.ts` into `lib/demo/ai-responses.ts`
- [ ] move `components/cards/GrantCard.tsx` into `components/demo/GrantCard.tsx`
- [ ] move `components/cards/MatchCard.tsx` into `components/demo/MatchCard.tsx`
- [ ] move `components/cards/JobCard.tsx` into `components/demo/JobCard.tsx`
- [ ] move `components/cards/TalentCard.tsx` into `components/demo/TalentCard.tsx`
- [ ] move `components/cards/ThreadCard.tsx` into `components/forum/ThreadCard.tsx`
- [ ] move `components/cards/ReplyCard.tsx` into `components/forum/ReplyCard.tsx`
- [ ] move `components/cards/StatsCard.tsx` into `components/ui/StatsCard.tsx`
- [ ] move `app/funding/**` into `app/(demo)/funding/**`
- [ ] move `app/matchmaker/**` into `app/(demo)/matchmaker/**`
- [ ] move `app/talent/**` into `app/(demo)/talent/**`
- [ ] move `app/test-cards/**` and `app/test-components/**` into `app/(demo)/**`
- [ ] move `data/*.json` into `data/demo/*.json`
- [ ] move `components/AIChatbot.tsx` and `components/ChatbotWrapper.tsx` into `components/demo/**`
- [ ] create empty target domain folders and stub `index.ts` files for `lib/auth`, `lib/profile`, `lib/forum`, `lib/funding`, `lib/matching`, and `lib/session`
- [ ] create empty target component folders for `components/auth`, `components/profile`, `components/forum`, and `components/funding`
- [ ] create the `@contracts/*` path alias in `tsconfig.json`
- [ ] verify a throwaway contract import typechecks after the alias change
- [ ] verify `npm run lint` and `npm run build` both pass after the surgery
- [ ] verify demo URLs under `/(demo)/funding`, `/(demo)/matchmaker`, and `/(demo)/talent` still load
- [ ] get Dev B review on the restructure PR before merge
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P3 — Shared Supabase and Quality Bootstrap `[locked — requires P2]`
- [ ] create the shared Supabase project and store credentials in a private note outside the repo
- [ ] add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to `.env.example`
- [ ] invite Priyan to the shared Supabase project and confirm dashboard access works for both devs
- [ ] install `@supabase/supabase-js` and `@supabase/ssr`
- [ ] verify `package.json`, lockfile, and `npm ci` are clean after the dependency install
- [ ] create `supabase/migrations/.gitkeep`
- [ ] create `supabase/migrations/0000_init.sql`
- [ ] create `supabase/README.md` with install, `supabase login`, `supabase link`, and `supabase db push` instructions
- [ ] ensure both devs can run `supabase login`
- [ ] ensure both devs can run `supabase link --project-ref <ref>`
- [ ] ensure both devs can run `supabase db push` against the shared dev DB
- [ ] implement `lib/env.ts` typed env-guard reads used by Supabase clients
- [ ] verify removing `.env.local` causes a clear missing-var failure instead of a deep runtime crash
- [ ] create the Google OAuth client in Google Cloud Console with only the Supabase callback URL
- [ ] paste the Google client ID and secret into Supabase Auth and enable the provider
- [ ] configure Supabase URL settings so the app callback URL includes `http://localhost:3000/auth/callback`
- [ ] verify a throwaway Google sign-in attempt succeeds at the provider configuration layer
- [ ] enable email OTP / magic-link in Supabase Auth
- [ ] verify the test magic-link arrives in a real inbox
- [ ] install Vitest and coverage support
- [ ] add `npm test` and `npm run test:watch` scripts
- [ ] add one sanity contract test and verify it passes
- [ ] create `.github/workflows/ci.yml` running `npm ci`, `npm run lint`, `npm run build`, and `npm test`
- [ ] add GitHub Actions secrets for Supabase URL, anon key, and service-role key
- [ ] invite Priyan as a GitHub collaborator and confirm a `dev-b/_access-check` PR can run CI
- [ ] confirm `build/contracts/role.ts` and `build/contracts/route-policy.ts` are explicitly locked
- [ ] review `profile.ts`, `session.ts`, and `funding.ts` with Dev B and move them to locked status
- [ ] run `npm run lint`, `npm run build`, and `npm test` on the bootstrap state
- [ ] confirm the first bootstrap PR shows CI green
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P4 — Auth Entry Routes `[locked — requires P3]`
- [ ] confirm V2.P1 bootstrap is fully closed before adding auth runtime code
- [ ] create `lib/supabase/client.ts` for browser-side Supabase access
- [ ] create `lib/supabase/server.ts` for App Router server-side cookie-based Supabase access
- [ ] create `app/(identity)/sign-in/page.tsx`
- [ ] keep the sign-in surface limited to Google OAuth and email OTP / magic-link
- [ ] explicitly avoid GitHub OAuth, Microsoft OAuth, and password-based auth in V2
- [ ] create `app/auth/callback/route.ts`
- [ ] make the callback send first-login or null-role users to `/onboarding`
- [ ] make the callback send already-onboarded users to `/dashboard`
- [ ] create `app/(identity)/sign-out/route.ts` as the POST sign-out path
- [ ] verify the sign-in page is reachable and server/client Supabase clients load correctly
- [ ] verify Google sign-in works end-to-end in a fresh browser
- [ ] verify email OTP / magic-link sign-in works end-to-end in a fresh browser
- [ ] capture redirect proof for onboarding-vs-dashboard behavior
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P5 — Session Runtime and Route Registry `[locked — requires P4]`
- [ ] create `lib/session/get-session.ts`
- [ ] make `GetSession()` read the Supabase auth session and join `profiles.role`
- [ ] make `GetSession()` return `Session | null` exactly per `references/build/contracts/session.ts`
- [ ] create `lib/session/use-session.ts`
- [ ] make `useSession()` expose the same session shape client-side
- [ ] create `lib/auth/route-policies.ts`
- [ ] add `authPolicies` for `/`, `/sign-in`, `/auth/callback`, and `/sign-out`
- [ ] add `authPolicies` for `/onboarding`, `/profile`, `/profile/edit`, `/forum`, and `/dashboard`
- [ ] export `combineRegistries(...registries)` and sort by descending `path.length`
- [ ] create the temporary empty `lib/funding/route-policies.ts` registry file if Dev B has not landed the real file yet
- [ ] make `middleware.ts` combine `authPolicies` with `fundingPolicies`
- [ ] make `middleware.ts` redirect unauthenticated users on protected routes to `/sign-in`
- [ ] make `middleware.ts` redirect signed-in users with `role: null` to `/onboarding`
- [ ] make `middleware.ts` redirect wrong-role users to `/` or `ROLE_DEFAULT_ROUTE[role]`
- [ ] verify the temporary empty funding registry does not crash unregistered routes
- [ ] add and pass the `get-session` Vitest suite
- [ ] verify `GetSession()` returns `{ user_id, role: null }` before onboarding finishes
- [ ] add a handoff note telling Dev B that `GetSession`, `useSession`, and the registry-composition mechanism are available on `develop`
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P6 — Base Profile Schema `[locked — requires P5]`
- [ ] create `supabase/migrations/0001_profiles_base.sql`
- [ ] add the `profiles` table with `id`, `role`, `display_name`, `email`, `avatar_url`, `created_at`, and `updated_at`
- [ ] keep `profiles.role` nullable to match the locked onboarding-gap contract
- [ ] keep the role check limited to `business`, `student`, `professor`, or `null`
- [ ] add the trigger that creates a `profiles` row from `auth.users`
- [ ] explicitly avoid role-specific profile tables in this migration
- [ ] apply the migration with `supabase db push`
- [ ] verify a fresh sign-in auto-creates a `profiles` row
- [ ] verify the trigger also works via a direct `auth.users` insert test in the dashboard SQL editor
- [ ] verify `GetSession()` still returns `role: null` until onboarding completes
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P7 — Role Selection and First-Run Forms `[locked — requires P6]`
- [ ] restate the required-vs-deferred first-run field split in the PR description before coding
- [ ] create `app/onboarding/page.tsx` as the role selector entry page
- [ ] create `app/onboarding/[role]/page.tsx`
- [ ] implement the business first-run fields: `display_name`, `business_name`, `industry`, `location`, `revenue`, `employees`
- [ ] keep `description`, `year_established`, and `website` out of the business first-run form
- [ ] implement the student first-run fields: `display_name`, `education_level`, `field_of_study`, `institution`, `province`, `gpa`
- [ ] keep `graduation_year` out of the student first-run form
- [ ] do not add citizenship or residency fields because they are not in the locked contract
- [ ] implement the professor first-run fields: `display_name`, `institution`, `department`, `research_area`, `career_stage`, `research_keywords`
- [ ] keep `h_index` out of the professor first-run form
- [ ] make validation enforce only the locked required fields for each role
- [ ] confirm no unapproved extra onboarding fields are introduced anywhere in the flow
- [ ] verify all three role forms render correctly before persistence wiring begins
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P8 — Profile Persistence Runtime `[locked — requires P7]`
- [ ] create `lib/profile/upsert.ts`
- [ ] write profile persistence as one transaction updating `profiles.role` and the role-specific table together
- [ ] prevent invalid role writes inside the persistence layer
- [ ] create `lib/profile/queries.ts`
- [ ] export `getRoleProfile(user_id)` returning the locked discriminated `RoleProfile` union or `null`
- [ ] wire null-role users to `/onboarding` after auth callback resolution
- [ ] wire onboarded users to `/dashboard`
- [ ] add `lib/profile/upsert.test.ts` covering happy path, invalid role, and already-onboarded cases
- [ ] add `lib/profile/queries.test.ts` covering business, student, professor, and null-role results
- [ ] verify a user can pick a role, submit the form, persist rows, and then skip onboarding on the next sign-in
- [ ] add a named handoff note telling Dev B that `lib/profile/queries.ts#getRoleProfile` is published on `develop`
- [ ] do not wait for Dev B ETL or funding RLS here; those are parallel tracks
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P9 — Role Profile Schema and Identity RLS `[locked — requires P8]`
- [ ] create `supabase/migrations/0002_role_profiles.sql`
- [ ] make `business_profiles` match the locked `BusinessProfile` field set
- [ ] make `student_profiles` match the locked `StudentProfile` field set
- [ ] make `professor_profiles` match the locked `ProfessorProfile` field set
- [ ] create `supabase/migrations/0010_rls_identity.sql`
- [ ] add `profiles` RLS so authenticated users can read the display name and role surface but can only write their own row
- [ ] add own-row-only RLS for `business_profiles`
- [ ] add own-row-only RLS for `student_profiles`
- [ ] add own-row-only RLS for `professor_profiles`
- [ ] keep forum-table RLS in the same migration or the same PR once `0005_forum.sql` is present
- [ ] apply both migrations to the shared dev DB
- [ ] verify another user's profile rows cannot be read or written through authenticated queries
- [ ] add a named handoff note telling Dev B that `0010_rls_identity.sql` is applied and the funding-RLS blocker is cleared
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P10 — Forum Schema and Helpful-Vote Function `[locked — requires P9]`
- [ ] create `supabase/migrations/0005_forum.sql`
- [ ] add the `threads` table with the locked authorship and timestamp fields
- [ ] add the `replies` table with `helpful_count`
- [ ] add the `reply_helpful_votes` table
- [ ] enforce the unique key on `(reply_id, user_id)` so helpful votes cannot double-increment
- [ ] create the `mark_reply_helpful(reply_id uuid)` SECURITY DEFINER function
- [ ] make the function reject unauthenticated calls
- [ ] make the function insert the vote row with `ON CONFLICT DO NOTHING`
- [ ] make the function increment `helpful_count` only when a new vote row is inserted
- [ ] block client-side direct mutation of `replies.helpful_count`
- [ ] grant execute on the function to `authenticated`
- [ ] extend `0010_rls_identity.sql` so `threads` and `replies` allow authenticated reads and author-only writes
- [ ] keep `reply_helpful_votes` client writes blocked outside the function path
- [ ] add proof or tests for duplicate-vote prevention, unauthenticated failure, and optional self-vote blocking
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P11 — Forum Runtime and Pages `[locked — requires P10]`
- [ ] create `app/forum/page.tsx` against real thread data
- [ ] create `app/forum/[threadId]/page.tsx` against real thread and reply data
- [ ] create `app/forum/new/page.tsx`
- [ ] implement `lib/forum/queries.ts`
- [ ] publish `listThreads`, `getThread`, `createThread`, `createReply`, and `markReplyHelpful`
- [ ] make `markReplyHelpful` call the database function rather than a direct row update
- [ ] adapt `components/forum/ThreadCard.tsx` to real persisted data
- [ ] adapt `components/forum/ReplyCard.tsx` to real persisted data
- [ ] render the author role badge on thread and reply content
- [ ] verify thread creation, reply creation, and reload persistence end-to-end
- [ ] verify cross-user edit attempts are blocked by RLS
- [ ] verify the helpful-vote flow increments exactly once per user
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P12 — Shell, Landing, and Providers `[locked — requires P11]`
- [ ] update `components/layout/Navbar.tsx` for signed-out public navigation
- [ ] update `components/layout/Navbar.tsx` for signed-in role-aware navigation
- [ ] use `ROLE_DEFAULT_ROUTE` rather than hard-coded role-to-route branching
- [ ] update `app/page.tsx` so signed-in users are redirected to `/dashboard`
- [ ] keep the signed-out landing page public and role-aware without pulling funding data
- [ ] wrap the app tree with `<Providers>` in `app/layout.tsx`
- [ ] wire the auth context in `app/providers.tsx` using `useSession`
- [ ] verify business, student, and professor accounts each see the correct funding link in the navbar
- [ ] verify sign-out returns the user to `/`
- [ ] do not start dashboard funding composition yet; that waits for the Dev B handoff in P13
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P13 — Funding Handoff Readiness `[locked — requires P12]`
- [ ] wait for the shared `release: V2.P3 complete` PR to merge to `main`
- [ ] wait for Dev B to add a named handoff entry with the V2.P3 release commit hash
- [ ] verify the handoff explicitly names `GetFundingSummariesForUser`
- [ ] verify the handoff explicitly names `GetFundingById`, `ListFundingForRole`, and `FundingSummaryTile`
- [ ] verify the handoff confirms the runtime is now backed by real ETL data rather than only seed rows
- [ ] compare the published runtime surface against `references/build/contracts/funding.ts`
- [ ] confirm no contract change is required before dashboard composition starts
- [ ] decide whether the dashboard work will be `direct-main` or `workspace-draft` per `Migration.md`
- [ ] capture the exact real-project files the next phase is allowed to touch
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P14 — Dashboard Funding Summary Tile `[locked — requires P13]`
- [ ] do not start until every P13 handoff box is checked
- [ ] import `GetFundingSummariesForUser` from Dev B's published runtime surface
- [ ] import `components/funding/FundingSummaryTile.tsx` without editing Dev B-owned files
- [ ] read the current session's `user_id` in the dashboard server component
- [ ] call `GetFundingSummariesForUser(session.user_id, 5)` for the summary tile surface
- [ ] compose the profile summary area with the funding summary tile inside `app/dashboard/page.tsx`
- [ ] keep the dashboard on published exports only; no direct Dev A query into funding tables
- [ ] verify business, student, and professor dashboards each render the correct summary surface
- [ ] add or update the dashboard composer test by mocking the funding runtime helper
- [ ] confirm no contract drift or cross-domain file edits were required
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P15 — Expiring Deadlines and Forum Activity `[locked — requires P14]`
- [ ] keep using Dev B's published helper rather than inventing a new funding query
- [ ] call `GetFundingSummariesForUser(session.user_id, N)` with a large enough limit to support a 30-day deadline filter
- [ ] filter the returned summaries server-side for deadlines within the next 30 days
- [ ] sort the matching summaries so the nearest deadlines appear first
- [ ] render the populated expiring-deadlines tile
- [ ] render the exact empty-state text `No upcoming deadlines.` when no rows match
- [ ] make the empty-state CTA use `ROLE_DEFAULT_ROUTE[session.role]`
- [ ] verify the CTA points to `/grants` for business users
- [ ] verify the CTA points to `/scholarships` for student users
- [ ] verify the CTA points to `/research-funding` for professor users
- [ ] compose the forum activity tile alongside profile and funding data
- [ ] verify both populated and empty states for all three roles
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P16 — Hardening and Test Coverage `[locked — requires P15]`
- [ ] grep Dev A-owned files for imports from `lib/demo` and remove them
- [ ] grep Dev A-owned files for imports from `components/demo` and remove them
- [ ] audit remaining Dev A flows for demo-only alerts or fake persistence
- [ ] add test coverage for the sign-in callback path
- [ ] add test coverage for onboarding upsert behavior
- [ ] add test coverage for `getRoleProfile`
- [ ] add test coverage for forum CRUD
- [ ] add test coverage for the dashboard composer
- [ ] add a Playwright happy path only if the repo has already adopted it by this point
- [ ] update setup docs or README sections that explain Dev A flows, env vars, and migration expectations
- [ ] run `npm run lint`, `npm run build`, and `npm test` green on the hardening state
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P17 — Release Gate and Third-Project QA `[locked — requires P16]`
- [ ] wait for the shared-space QA checklist and third-project setup notes to be ready
- [ ] verify the Dev A checklist is fully green on `develop`
- [ ] run third-project QA for Google sign-in
- [ ] run third-project QA for email OTP / magic-link sign-in
- [ ] run third-project QA for onboarding and role persistence
- [ ] run third-project QA for profile loading and route protection
- [ ] run third-project QA for forum thread creation, reply creation, and helpful-vote behavior
- [ ] run third-project QA for dashboard funding summary composition and expiring-deadlines behavior
- [ ] attach QA notes and the final phase release PR reference
- [ ] verify the shared `release: V2.PN complete` PR merges with both approvals
- [ ] record the final `git log --oneline -1` or merge commit reference for this phase close
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

---

## Blockers

Use only named blockers from `references/build/shared/ownership.md`.

- None recorded yet
