# Progress

**Current Gate:** G1
**Current Phase:** P1 — Shared Kickoff and Ownership Alignment
**Project Category:** web
**Last Updated:** 2026-04-28
**Session Notes:** Likit workspace filled from copied Auctus docs. Real repo state remains `V2.P1 — Shared Bootstrap & Restructuring (not started)`. This tracker mirrors only the shared bootstrap/contract/release/QA workflow.

> Each gate (G) corresponds to a phase (P): G1 = P1, G2 = P2, etc.
> All checkboxes require proof before they can be marked `[x]`.

---

## G0 — Project Setup `[complete]`
- [x] G0.1 Identity captured from copied source docs
- [x] G0.2 Shared developer profile recorded for Aaryan + Priyan
- [x] G0.3 Category locked as `web`
- [x] G0.4 Shared workspace purpose and artifacts mapped
- [x] G0.5 Constraints and red lines recorded
- [x] G0.6 Critique and cross-check completed
- [x] `_fill_manifest.md` fully populated
- [x] `ProjectSummary.md`, `Codex_guide.md`, `BuildFlow.md`, and `Progress.md` generated
- [x] Placeholder audit completed for filled files
- [x] Obsolete `ProjectSummary_*` templates removed from `codex/`

---

## Release and Coordination Notes

Use this section for shared release PR references, cross-space QA notes, and coordination-only decisions.

- None recorded yet

---

## P1 — Shared Kickoff and Ownership Alignment `[not started]`
- [ ] read `references/build/shared/ownership.md` end-to-end as the authoritative ownership map
- [ ] read `references/build/shared/conventions.md` end-to-end as the authoritative branch and PR rule set
- [ ] read `references/build/shared/bootstrap.md` end-to-end as the authoritative V2.P1 setup checklist
- [ ] read `references/build/shared/buildflow.md` end-to-end as the authoritative V2 phase dependency map
- [ ] read root `claude/CurrentStatus.md` and confirm the repo is still at the pre-bootstrap planning-only state
- [ ] confirm Dev A maps to Aaryan and Dev B maps to Priyan everywhere in shared workflow notes
- [ ] confirm shared-space is for bootstrap, contracts, release gates, QA, and migration control only
- [ ] confirm feature implementation still belongs in Dev A or Dev B owned files unless the task is explicitly shared
- [ ] confirm direct-main vs workspace-draft migration modes are understood before phase work begins
- [ ] record kickoff notes naming the docs used for alignment
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P2 — Branch and Protection Setup `[locked — requires P1]`
- [ ] wait until both developers have completed the shared kickoff reading and alignment
- [ ] confirm Aaryan creates `develop` from `main`
- [ ] confirm `develop` is pushed to the shared repo
- [ ] confirm branch protection exists on `main`
- [ ] confirm branch protection exists on `develop`
- [ ] confirm no direct pushes are allowed to `main`
- [ ] confirm no direct pushes are allowed to `develop`
- [ ] confirm feature branches follow `dev-a/<short-description>` and `dev-b/<short-description>`
- [ ] confirm bootstrap-only shared branches follow `shared/<short-description>`
- [ ] confirm all feature PRs target `develop`
- [ ] confirm phase-release PRs use the title format `release: V2.PN complete`
- [ ] capture branch screenshots or other proof showing the protected-branch and release path state
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P3 — Mixed-File Surgery Coordination `[locked — requires P2]`
- [ ] wait for Dev A to open the single-purpose restructure PR
- [ ] confirm Dev B is assigned as reviewer on the restructure PR
- [ ] compare the PR against the `ownership.md` mixed-file surgery table line by line
- [ ] verify the legacy app funding routes moved under `app/(demo)/funding/**`
- [ ] verify matchmaker and talent routes moved under `app/(demo)/**`
- [ ] verify test routes moved under `app/(demo)/**`
- [ ] verify demo cards moved into `components/demo/**`
- [ ] verify forum cards moved into `components/forum/**`
- [ ] verify `StatsCard` moved into `components/ui/**`
- [ ] verify `lib/BusinessContext`, `lib/ai-responses`, and other demo helpers moved into `lib/demo/**`
- [ ] verify static JSON data moved into `data/demo/**`
- [ ] verify the target domain folders and stub files were created for both tracks
- [ ] verify `npm run lint` passes after the surgery
- [ ] verify `npm run build` passes after the surgery
- [ ] verify `/(demo)/funding`, `/(demo)/matchmaker`, and `/(demo)/talent` still load
- [ ] verify Dev B did not make overlapping day-one edits in the surgery areas
- [ ] confirm the restructure PR merged into `develop`
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P4 — Shared Bootstrap Infrastructure `[locked — requires P3]`
- [ ] verify `.env.example` contains the three required Supabase keys
- [ ] verify the shared Supabase project exists
- [ ] verify Priyan has been invited to the shared Supabase project
- [ ] verify both developers can reach the shared Supabase dashboard
- [ ] verify `@supabase/supabase-js` and `@supabase/ssr` are installed in the root app
- [ ] verify `npm ci` is clean after the dependency install
- [ ] verify `supabase/migrations/.gitkeep` exists
- [ ] verify `supabase/migrations/0000_init.sql` exists
- [ ] verify `supabase/README.md` documents install, login, link, and migration commands
- [ ] verify both developers can run `supabase login`
- [ ] verify both developers can run `supabase link`
- [ ] verify both developers can run `supabase db push`
- [ ] verify `lib/env.ts` exists and fails clearly on missing required vars
- [ ] verify Dev B's `scraper/` bootstrap package exists with README and bootstrap entrypoint
- [ ] verify the Google OAuth provider is configured through Google Cloud and Supabase Auth
- [ ] verify a throwaway Google provider test succeeds
- [ ] verify email OTP / magic-link is configured and a test email reaches a real inbox
- [ ] verify Vitest is installed with a passing sanity test
- [ ] verify `.github/workflows/ci.yml` exists and has a green real PR run
- [ ] verify `.github/workflows/scrape.yml` exists and can run manually from GitHub UI
- [ ] verify GitHub Actions secrets were added and are readable by workflows without exposing values
- [ ] verify Priyan's repo collaborator access works through a real access-check PR
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P5 — Contract Lock and V2.P1 Release Gate `[locked — requires P4]`
- [ ] verify `build/contracts/role.ts` is locked
- [ ] verify `build/contracts/route-policy.ts` is locked
- [ ] verify `build/contracts/profile.ts` is locked after Dev A and Dev B review
- [ ] verify `build/contracts/session.ts` is locked after Dev A and Dev B review
- [ ] verify `build/contracts/funding.ts` is locked after Dev A and Dev B review
- [ ] verify every bootstrap gate item in `references/build/shared/bootstrap.md` is checked
- [ ] open the shared phase-release PR `release: V2.P1 complete`
- [ ] get both approvals on the release PR
- [ ] verify the release PR merges from `develop` into `main`
- [ ] record the V2.P1 merge commit in shared notes
- [ ] confirm both developers can now start their V2.P2 tracks without ownership ambiguity
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P6 — V2.P2 Dependency Audit `[locked — requires P5]`
- [ ] compare `references/build/shared/buildflow.md` V2.P2 dependency table against Dev A and Dev B buildflows
- [ ] confirm the only real V2.P2 dependencies are the locked `Role`, `RoutePolicy`, and `Session` shapes
- [ ] confirm Dev A has no inbound runtime dependency on Dev B for V2.P2
- [ ] confirm Dev B may proceed using route-specific role assumptions if `GetSession()` is not yet published
- [ ] confirm no note, checklist, or blocker introduces a fake wait on unrelated work
- [ ] compare both per-dev `Progress.md` trackers against the shared dependency map
- [ ] correct any shared coordination note that implies "wait for the other dev" without a named deliverable
- [ ] record the V2.P2 dependency audit result in shared notes
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P7 — Contract Consumption Check `[locked — requires P6]`
- [ ] compare current use of `role.ts` against the locked role enum and `ROLE_DEFAULT_ROUTE`
- [ ] compare current use of `profile.ts` against the locked profile and role-profile shapes
- [ ] compare current use of `session.ts` against the locked nullable-session shape
- [ ] compare current use of `funding.ts` against the locked funding item, summary, and query shapes
- [ ] compare current route-policy usage against the locked registry contract
- [ ] verify no unapproved contract edits landed outside the change protocol
- [ ] verify both per-dev trackers have a place for exact handoff notes
- [ ] verify route gating still uses the registry pattern rather than ad hoc middleware branching
- [ ] verify shared planning still follows root `build/` and `claude/CurrentStatus.md` rather than template-only Claude files
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P8 — V2.P2 Release Gate `[locked — requires P7]`
- [ ] wait for Dev A's V2.P2 proof items to be green: auth routes, session helpers, route registry, and base profiles
- [ ] wait for Dev B's V2.P2 proof items to be green: funding schema, preferences, helpers, listing pages, and route policies
- [ ] verify Dev A's `GetSession()` and empty-bootstrap route-registry composition are shipped on `develop`
- [ ] verify Dev B's `fundingPolicies`, listing pages, and saved preferences are shipped on `develop`
- [ ] verify `npm run lint`, `npm run build`, and `npm test` are green for the integrated V2.P2 state
- [ ] open the shared phase-release PR `release: V2.P2 complete`
- [ ] get both approvals on the release PR
- [ ] verify the V2.P2 release merges into `main`
- [ ] record the V2.P2 merge commit and shared proof references
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P9 — V2.P3 Handoff Readiness `[locked — requires P8]`
- [ ] confirm `Profile` and `RoleProfile` are already locked before Dev B matching wiring starts
- [ ] confirm the named runtime handoff `lib/profile/queries.ts#getRoleProfile` exists in the Dev A plan
- [ ] confirm the named DB handoff `0010_rls_identity.sql` exists as Dev B's funding-RLS unblock
- [ ] confirm the ETL verification docs PR is a named precondition before source modules land
- [ ] confirm Dev B's ETL data is an outbound handoff for Dev A dashboard work in V2.P4 rather than a V2.P3 dependency
- [ ] verify both per-dev trackers use only named blockers from `ownership.md`
- [ ] record the V2.P3 handoff map in shared notes
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P10 — Shared Review of ETL and RLS Readiness `[locked — requires P9]`
- [ ] wait for the docs PR `docs(scraper): verify V2 ETL sources` to open or merge
- [ ] review the six-source list against the locked V2 decision
- [ ] confirm the list includes only ISED Business Benefits Finder, ISED Supports for Business, EduCanada Scholarships, Indigenous Bursaries Search Tool, NSERC, and SSHRC
- [ ] confirm CIHR remains deferred
- [ ] confirm no private aggregators appear in ETL files, notes, or tracker steps
- [ ] review Dev B's blocker usage and ensure only allowed blockers are being logged
- [ ] check whether `0010_rls_identity.sql` has landed or is correctly blocking `0020_rls_funding.sql`
- [ ] review any shared-file diffs in contracts, conventions, or README for ownership compliance
- [ ] record the ETL/RLS review findings or explicitly record "no drift found"
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P11 — V2.P3 Release Gate `[locked — requires P10]`
- [ ] wait for Dev A's V2.P3 proof items to be green: onboarding persistence, role profiles, RLS, forum, and shell
- [ ] wait for Dev B's V2.P3 proof items to be green: matching, ETL docs, ETL pipeline, source modules, and funding RLS
- [ ] verify Dev A proof includes a real persisted user flow for onboarding, forum, and route protection
- [ ] verify Dev B proof includes role-appropriate funding visibility and at least one ETL-produced funding row
- [ ] verify both domains have happy-path tests attached to the V2.P3 state
- [ ] open the shared phase-release PR `release: V2.P3 complete`
- [ ] get both approvals on the release PR
- [ ] verify the V2.P3 release merges into `main`
- [ ] record the V2.P3 merge commit and note that V2.P4 may now start
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P12 — V2.P4 Integration Kickoff `[locked — requires P11]`
- [ ] wait for the V2.P3 release merge to `main`
- [ ] confirm Dev B's runtime exports on `main` are backed by real ETL data
- [ ] confirm Dev A's `Role`, `Profile`, `Session`, and route-registry contracts are locked and shipped on `main`
- [ ] restate the V2.P4 PR order: Dev B stable summary endpoint on `develop`, then Dev A dashboard integration PR, then shared phase release
- [ ] choose `direct-main` or `workspace-draft` mode for each shared artifact touched during integration
- [ ] confirm integration work will target `develop` rather than `main`
- [ ] confirm no dev will edit the other dev's owned domain directly during integration
- [ ] record the integration kickoff note with exact allowed composition files
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P13 — V2.P4 Shared Integration Review `[locked — requires P12]`
- [ ] wait for Dev B to publish the named handoff note with the V2.P3 release commit hash
- [ ] review Dev A's dashboard PR to ensure it consumes `GetFundingSummariesForUser` and `FundingSummaryTile` only through published contracts
- [ ] review Dev A's expiring-deadlines implementation for use of `ROLE_DEFAULT_ROUTE` rather than hard-coded mappings
- [ ] verify navbar and landing changes remain inside Dev A-owned files
- [ ] verify Dev B reviewed the dashboard PR without editing `app/dashboard/**`
- [ ] verify the combined user flow matches the shared V2.P4 completion gate for all three roles
- [ ] open or confirm the shared phase-release PR `release: V2.P4 complete`
- [ ] get both approvals and merge the release PR
- [ ] record the V2.P4 integration proof references and merge commit
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P14 — Shared Hardening Docs and Release Notes `[locked — requires P13]`
- [ ] collect README or setup-document updates from Dev A
- [ ] collect scraper and funding docs updates from Dev B
- [ ] collect demo-isolation audit proof from Dev A
- [ ] collect demo-isolation audit proof from Dev B
- [ ] collect release-note inputs naming runtime exports, migrations, and QA focus areas
- [ ] verify shared docs still say the repo is not currently deployed
- [ ] assemble a shared release-note draft or hardening checklist
- [ ] record the hardening-doc bundle in shared notes
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P15 — Third-Project QA Prep `[locked — requires P14]`
- [ ] create the plan for a fresh third Supabase project
- [ ] assign ownership for auth, onboarding, profile, forum, and dashboard checks
- [ ] assign ownership for funding, preferences, matching, ETL, and RLS checks
- [ ] define the role test users needed for business, student, and professor validation
- [ ] define the setup sequence for env vars, project linking, migrations, and seed/ETL prep
- [ ] build the shared QA checklist covering auth, profiles, funding, forum, ETL, and RLS
- [ ] define how bugs or blockers discovered during QA will be logged
- [ ] distribute the fresh-environment setup notes to both developers
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P16 — Third-Project QA Execution `[locked — requires P15]`
- [ ] wait until the shared QA checklist and third-project credentials are ready
- [ ] bootstrap the third Supabase project environment using the documented setup sequence
- [ ] run auth and onboarding QA on the third project
- [ ] run profile and route-protection QA on the third project
- [ ] run forum persistence and helpful-vote QA on the third project
- [ ] run dashboard summary and expiring-deadlines QA on the third project
- [ ] run funding listing, filter, detail, and saved-default QA on the third project
- [ ] run matching-summary QA on the third project
- [ ] run funding RLS and anonymous-denial QA on the third project
- [ ] run scraper/ETL metadata and service-role ingestion QA on the third project
- [ ] record every failure and either link the fix or log it as an allowed blocker
- [ ] collect sign-off from both developers once the QA pass is acceptable
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

## P17 — Final Release Archive and Migration Ledger `[locked — requires P16]`
- [ ] record the final shared release PR reference and merge commit
- [ ] verify every shared phase above has a completed migration record
- [ ] verify Dev A and Dev B handoff notes are preserved in their respective trackers
- [ ] verify the shared QA notes are preserved in shared notes or linked artifacts
- [ ] verify `dev-a-space/codex/references/**`, `dev-b-space/codex/references/**`, and `shared-space/codex/references/**` are sufficient after root planning-folder deletion
- [ ] verify the three workspaces remain self-contained without needing space-local `build/` or `claude/` copies outside `codex/references/`
- [ ] verify the shared blockers section is empty or all items are explicitly resolved
- [ ] capture the final migration-ledger status for shared work
- [ ] migration record completed per `Migration.md` with mode, real-project target paths, and commit/PR reference

---

## Blockers

Use only named blockers from `references/build/shared/ownership.md`.

- None recorded yet
