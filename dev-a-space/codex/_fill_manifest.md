# Fill Manifest
# Canonical filled record for the Dev A Likit workspace.

workspace_scope: Dev A execution lens on the full Auctus V2 project; canonical project summary stays identical across all spaces

---

## IDENTITY
name: Auctus
tagline: Identity and community track for the real multi-role Auctus V2 platform
problem: Auctus must stop behaving like a business-only frontend demo and become a real role-aware product. Dev A's track solves the identity and community side of that problem by implementing sign-in, role assignment, onboarding, profile persistence, protected routing, shared forum behavior, and dashboard composition without crossing into Dev B's funding and scraper ownership.
type: production
category: web
core_constraint: A signed-in user must always be routed according to their real session and role state; unauthenticated users cannot reach protected pages, null-role users cannot bypass onboarding, and onboarded users cannot access the wrong role's protected routes.

---

## DEVELOPER
dev_name: Aaryan
dev_level: intermediate
dev_knows: TypeScript, React, Next.js App Router, Tailwind, Git
dev_gaps: Supabase auth wiring, raw SQL migrations, RLS, cross-domain route-policy composition
dev_goal: independently ship the identity and community track of Auctus V2 while respecting Dev B ownership boundaries

---

## TECH STACK
| Layer | Technology | Host |
|---|---|---|
| Frontend | Next.js 16 + React 19 + Tailwind CSS 4 | local dev now; production host deferred |
| Backend runtime | Next.js App Router server components and route handlers | same Next.js app |
| Database | Supabase Postgres | Supabase |
| Auth | Supabase Auth (Google OAuth + email OTP / magic link) | Supabase |
| Testing | Vitest | local dev + GitHub Actions |
| CI/CD | GitHub Actions | GitHub |

---

## COMMIT CONFIG
scopes: auth, session, profile, forum, shell, dashboard, db, ci, restructure, docs
tdd_targets: GetSession, combineRegistries, onboarding validation, profile upsert rules, getRoleProfile, markReplyHelpful behavior
docker_phase: not in current V2 scope
ci_phase: P3

---

## ARCHITECTURE DECISIONS
D1_title: App Router + middleware for role-aware routing
D1_decision: Keep protected-route enforcement inside Next.js via middleware and route-policy registries instead of adding a separate auth gateway.
D1_why: The UI shell, auth callback, and dashboard composition already live in the Next.js app; a second runtime would add complexity without improving the locked V2 workflow.

D2_title: Supabase for auth, session persistence, and RLS
D2_decision: Use Supabase Auth and Supabase Postgres for identity and persistence.
D2_why: The project already committed to Supabase in shared docs, and Dev A directly benefits from one provider handling sessions, profile tables, and access rules.

D3_title: Nullable role during onboarding gap
D3_decision: Allow `profiles.role` and `Session.role` to be `null` until onboarding completes.
D3_why: A first-login user needs a valid account and profile row before they can choose business, student, or professor.

D4_title: Combined route-policy registries
D4_decision: Dev A owns `middleware.ts` and merges Dev A auth policies with Dev B funding policies through published registries.
D4_why: This preserves ownership boundaries and prevents funding-route edits from turning into middleware merge conflicts.

D5_title: Shared forum across all roles
D5_decision: Keep one persisted forum for business, student, and professor accounts.
D5_why: This is a locked product decision in `codex/references/build/gameplan.md` and supports the shared community behavior described in product vision docs.

D6_title: Demo isolation instead of mutation
D6_decision: Move legacy demo code into `(demo)` and stop iterating on it during V2.
D6_why: Dev A needs a clean identity/community track without reusing V1 assumptions as active architecture.

---

## DATA / STRUCTURE

### web: Models
model_1: Profile | id: uuid required ref auth.users.id | role: Role|null required default null | display_name: text required | email: text required | avatar_url: text optional | created_at: timestamp required | updated_at: timestamp required
model_2: BusinessProfile | id: uuid required ref profiles.id | business_name: text required | industry: text optional | location: text optional | revenue: number optional | employees: number optional | description: text optional | year_established: number optional | website: text optional
model_3: StudentProfile | id: uuid required ref profiles.id | education_level: enum optional | field_of_study: text optional | institution: text optional | province: text optional | gpa: number optional | graduation_year: number optional
model_4: ProfessorProfile | id: uuid required ref profiles.id | institution: text optional | department: text optional | research_area: text optional | career_stage: enum optional | h_index: number optional | research_keywords: text[] required
model_5: Thread | id: uuid required | author_id: uuid required ref profiles.id | title: text required | body: text required | category: text required | created_at: timestamp required | updated_at: timestamp required
model_6: Reply | id: uuid required | thread_id: uuid required ref threads.id | author_id: uuid required ref profiles.id | body: text required | helpful_count: integer required default 0 | created_at: timestamp required | updated_at: timestamp required
model_7: ReplyHelpfulVote | reply_id: uuid required ref replies.id | user_id: uuid required ref profiles.id | created_at: timestamp required | unique(reply_id,user_id)

---

## SEED / FIXTURES / TEST DATA
strategy: use real Supabase auth test accounts for business, student, and professor flows; forum starts empty and is populated through real CRUD tests; Vitest fixtures cover Session, RoleProfile, onboarding payloads, and forum helpful-vote cases; dashboard later consumes Dev B funding summaries without Dev A owning funding seed data.

---

## CORE LOGIC
logic: 1) user signs in through Google or email OTP/magic link; 2) Supabase creates or resumes the auth session and Dev A creates/reads the corresponding profiles row; 3) GetSession returns user_id plus role which may be null; 4) middleware consults the merged route-policy registry and redirects unauthenticated, null-role, or wrong-role requests; 5) onboarding persists profiles.role plus the matching role-profile row in one transaction; 6) forum helpers persist threads and replies under RLS and mutate helpful votes only through the SECURITY DEFINER function; 7) dashboard later composes Dev B funding summaries through published exports only.

---

## FEATURES
feature_1: Google OAuth plus email OTP / magic-link sign-in
feature_2: Session helpers publishing the locked Session shape to both server and client consumers
feature_3: Role selection and per-role onboarding forms with locked required-vs-deferred field splits
feature_4: Persisted role-specific profiles and `getRoleProfile` runtime helper
feature_5: Middleware and merged route-policy registry for protected navigation
feature_6: Shared forum with persisted threads, replies, and helpful votes
feature_7: Role-aware landing, navbar, providers, and dashboard composition

---

## ROUTES / ENTRY POINTS / SCREENS

### web: Routes
public_routes:
  - GET / | public | public landing; signed-in users redirect to dashboard
  - GET /sign-in | public | renders Google and email OTP / magic-link sign-in UI
  - GET /auth/callback | public | exchanges auth result and redirects to onboarding or dashboard

auth_routes:
  - POST /sign-out | protected | clears the Supabase session and returns to the public landing

protected_routes:
  - GET /onboarding | protected | role selector for authenticated users with role not yet chosen
  - GET /onboarding/[role] | protected | role-specific first-run profile form
  - GET /profile | protected | view persisted profile data
  - GET /profile/edit | protected | edit deferred profile fields
  - GET /forum | protected | list persisted threads
  - GET /forum/[threadId] | protected | view thread and replies
  - GET /forum/new | protected | create a thread
  - GET /dashboard | protected | compose profile, forum activity, and later Dev B funding summaries
  - export lib/session/get-session.ts#GetSession | protected context | canonical server session helper
  - export lib/session/use-session.ts#useSession | protected context | canonical client session helper
  - export lib/profile/queries.ts#getRoleProfile | protected context | publish RoleProfile to Dev B
  - export lib/auth/route-policies.ts#combineRegistries | shared runtime | merge Dev A and Dev B route registries

---

## RED LINES
redline_1: never edit Dev B-owned funding, matching, scraper, or Dev-B migration files except through an approved shared-file or contract protocol
redline_2: never allow a null-role user to bypass onboarding
redline_3: never expose another user's writable profile or forum data through broken RLS
redline_4: never mutate replies.helpful_count directly from client code; use the `mark_reply_helpful` function
redline_5: never reactivate deferred auth providers, AI-chat scope, or legacy demo iteration inside active Dev A phases

---

## ENV VARS
env_1: NEXT_PUBLIC_SUPABASE_URL | shared Supabase project URL used by browser and server helpers | yes
env_2: NEXT_PUBLIC_SUPABASE_ANON_KEY | anon key for client access and RLS-safe reads | yes
env_3: SUPABASE_SERVICE_ROLE_KEY | privileged key for admin/server workflows and CI secrets | yes

---

## PHASES

phase_1_name: Bootstrap Access and Branch Protection
phase_1_goal: create the safe starting point for shared V2 work before any feature coding
phase_1_checkboxes:
  - `develop` exists and both devs can work through PRs
  - branch protection on `main` and `develop` is configured
  - Dev A and Dev B ownership mapping is re-read before bootstrap starts
phase_1_proof: Show the new `develop` branch, the protection/rules screenshots or equivalent admin confirmation, and the linked `ownership.md` sections used for kickoff.
phase_1_commit: chore(bootstrap): initialize protected V2 branch flow

phase_2_name: Mixed-File Surgery and Domain Skeleton
phase_2_goal: split legacy mixed files into `(demo)` and create the owned domain folders without breaking the current app shell
phase_2_checkboxes:
  - every move listed in `ownership.md` Mixed-File Surgery is completed
  - demo URLs still load after the move
  - `@contracts/*` alias resolves in a throwaway typecheck
phase_2_proof: Show the restructure PR diff, run `npm run build` and `npm run lint`, and show the `@contracts/*` import resolving in a check file.
phase_2_commit: chore(restructure): split mixed demo files and create domain folders

phase_3_name: Shared Supabase and Quality Bootstrap
phase_3_goal: finish the shared env, auth-provider, migration, test, CI, and contract-lock setup needed before Dev A feature work
phase_3_checkboxes:
  - `.env.example`, `lib/env.ts`, Supabase project access, and `supabase db push` all work
  - Google OAuth and email OTP / magic-link are configured in Supabase
  - Vitest, CI, and the five LOCKED contracts are in place
phase_3_proof: Run `npm test`, `npm run build`, and `npm run lint`; show a successful `supabase db push`; show provider setup proof and contract lock confirmation.
phase_3_commit: chore(bootstrap): complete shared Supabase and CI setup

phase_4_name: Auth Entry Routes
phase_4_goal: add the sign-in, sign-out, and callback entry points for real Supabase auth
phase_4_checkboxes:
  - browser and server Supabase clients exist
  - `/sign-in`, `/auth/callback`, and `/sign-out` flows are wired
  - both Google and email OTP / magic-link round-trips complete
phase_4_proof: Demonstrate both sign-in methods in a fresh browser and show the callback redirect behavior plus `git log --oneline -1`.
phase_4_commit: feat(auth): add sign-in callback and sign-out routes

phase_5_name: Session Runtime and Route Registry
phase_5_goal: publish the locked Session runtime helpers and the merged routing mechanism
phase_5_checkboxes:
  - `GetSession` and `useSession` return the locked shape
  - `authPolicies` and `combineRegistries` are exported
  - `middleware.ts` handles unauthenticated, null-role, and wrong-role redirects
phase_5_proof: Run the `get-session` tests, show middleware behavior against the placeholder empty funding registry, and show `GetSession()` returning `{ user_id, role: null }`.
phase_5_commit: feat(session): add session helpers and route-policy middleware

phase_6_name: Base Profile Schema
phase_6_goal: create the base `profiles` table and first-login trigger that supports the onboarding gap
phase_6_checkboxes:
  - `0001_profiles_base.sql` is applied
  - `profiles.role` allows `null`
  - first sign-in auto-creates a `profiles` row
phase_6_proof: Run `supabase db push`, then show the latest `profiles` row in SQL after a fresh sign-in.
phase_6_commit: feat(db): add base profiles schema and trigger

phase_7_name: Role Selection and First-Run Forms
phase_7_goal: implement the locked role selector and required first-run field set for each role
phase_7_checkboxes:
  - `/onboarding` role selector exists
  - `/onboarding/[role]` forms match the locked required-vs-deferred split
  - no unapproved extra onboarding fields are introduced
phase_7_proof: Show the forms for business, student, and professor and the PR text restating required vs deferred fields.
phase_7_commit: feat(onboarding): add role selection and first-run forms

phase_8_name: Profile Persistence Runtime
phase_8_goal: persist the selected role and role-specific details and publish the runtime query Dev B needs
phase_8_checkboxes:
  - `lib/profile/upsert.ts` writes `profiles.role` and the role table in one transaction
  - `getRoleProfile(user_id)` returns the discriminated union or null
  - returning users skip onboarding and land on `/dashboard`
phase_8_proof: Run the profile tests, complete an onboarding flow end-to-end, and show Dev B's progress note recording the published `getRoleProfile` helper.
phase_8_commit: feat(profile): add onboarding persistence and role profile queries

phase_9_name: Role Profile Schema and Identity RLS
phase_9_goal: add role-profile tables and identity-side RLS enforcement
phase_9_checkboxes:
  - `0002_role_profiles.sql` is applied
  - `0010_rls_identity.sql` is applied
  - cross-user profile reads or writes are denied as designed
phase_9_proof: Run `supabase db push`, show SQL or test proof that another user's role-profile rows are not readable/writable, and show the passing Vitest suite.
phase_9_commit: feat(db): add role profiles and identity RLS

phase_10_name: Forum Schema and Helpful-Vote Function
phase_10_goal: land the forum tables plus the safe server-side helpful-vote path
phase_10_checkboxes:
  - `0005_forum.sql` creates `threads`, `replies`, `reply_helpful_votes`, and `mark_reply_helpful`
  - forum policies are added to the identity RLS migration
  - duplicate helpful votes are prevented at the database level
phase_10_proof: Show the migration SQL, the unique key on `(reply_id, user_id)`, and the SQL/function tests for duplicate and unauthenticated cases.
phase_10_commit: feat(db): add forum schema and helpful vote function

phase_11_name: Forum Runtime and Pages
phase_11_goal: expose persisted forum CRUD through Dev A-owned pages and helpers
phase_11_checkboxes:
  - list, thread, and new-thread pages are wired to real data
  - forum query helpers create threads and replies
  - role badge rendering is present on authored content
phase_11_proof: Demonstrate thread create -> reply -> reload, and show cross-user edit denial plus the last commit.
phase_11_commit: feat(forum): add persisted forum pages and helpers

phase_12_name: Shell, Landing, and Providers
phase_12_goal: make the visible shell role-aware without crossing into funding implementation
phase_12_checkboxes:
  - navbar uses `ROLE_DEFAULT_ROUTE`
  - signed-in landing redirects to `/dashboard`
  - providers wire the client session context
phase_12_proof: Show three role accounts with the correct navbar link and the post-sign-out return to `/`.
phase_12_commit: feat(shell): add role-aware navbar and landing redirect

phase_13_name: Funding Handoff Readiness
phase_13_goal: verify the inbound Dev B runtime contract is stable before dashboard composition begins
phase_13_checkboxes:
  - V2.P3 release for Dev B is merged to `main`
  - Dev B records the stable `GetFundingSummariesForUser` handoff in Dev A progress notes
  - Dev A confirms no contract change is needed for dashboard composition
phase_13_proof: Show the release PR merge reference, the handoff note naming the commit, and the current `codex/references/build/contracts/funding.ts` shape.
phase_13_commit: docs(dashboard): confirm funding handoff readiness

phase_14_name: Dashboard Funding Summary Tile
phase_14_goal: compose the published funding summary tile into Dev A's dashboard without editing Dev B's files
phase_14_checkboxes:
  - `app/dashboard/page.tsx` calls `GetFundingSummariesForUser`
  - `FundingSummaryTile` is imported from Dev B as presentation only
  - three roles each receive the correct summary surface
phase_14_proof: Demonstrate dashboard summaries for business, student, and professor accounts and run the dashboard composer test.
phase_14_commit: feat(dashboard): integrate funding summary tile

phase_15_name: Expiring Deadlines and Forum Activity
phase_15_goal: finish the full Dev A dashboard composition using published funding summaries and Dev A forum data
phase_15_checkboxes:
  - dashboard renders expiring-deadlines rows for items within 30 days
  - empty state shows `No upcoming deadlines.` with the correct role CTA
  - forum activity tile is composed alongside profile and funding data
phase_15_proof: Demonstrate both populated and empty deadline states for each role and show the CTA targets using `ROLE_DEFAULT_ROUTE`.
phase_15_commit: feat(dashboard): add expiring deadlines and forum activity tiles

phase_16_name: Hardening and Test Coverage
phase_16_goal: remove demo bleed, increase test coverage, and document Dev A flows
phase_16_checkboxes:
  - no active Dev A file imports from `lib/demo` or `components/demo`
  - auth, onboarding, forum, and dashboard tests are green
  - README or equivalent setup docs cover Dev A flows
phase_16_proof: Run the grep check for demo imports, run `npm test`, and show the updated doc section or README diff.
phase_16_commit: chore(hardening): remove demo imports and add identity tests

phase_17_name: Release Gate and Third-Project QA
phase_17_goal: complete Dev A's contribution to the shared release and verification gate
phase_17_checkboxes:
  - Dev A checklist is fully green on `develop`
  - the `release: V2.PN complete` PR receives both approvals and merges
  - third Supabase project QA succeeds for sign-in, onboarding, forum, and dashboard composition
phase_17_proof: Show the release PR merge, the third-project QA notes, and the final `git log --oneline -1`.
phase_17_commit: docs(qa): record Dev A release and QA verification
