# Fill Manifest
# Canonical filled record for the shared Likit workspace.

---

## IDENTITY
name: Auctus
tagline: Shared coordination workspace for the real multi-role Auctus V2 platform
problem: Auctus V2 depends on strict ownership, shared bootstrap, typed contracts, release gates, and clean migration from planning artifacts into the real project. The shared workspace exists to manage the truly shared tasks without turning shared work into a third implementation silo.
type: production
category: web
core_constraint: shared coordination must reduce ambiguity without bypassing Dev A and Dev B ownership boundaries.

---

## DEVELOPER
dev_name: Aaryan + Priyan
dev_level: intermediate pair
dev_knows: Git PR workflow, TypeScript/Next.js product work, role-split execution
dev_gaps: release-discipline drift, vague blockers, migration ambiguity, shared-file conflict risk
dev_goal: coordinate bootstrap, contracts, releases, and QA cleanly across both developers

---

## TECH STACK
| Layer | Technology | Host |
|---|---|---|
| Frontend | Next.js 16 + React 19 + Tailwind CSS 4 | local dev now; production host deferred |
| Backend runtime | Next.js App Router server components and route handlers | same Next.js app |
| Database | Supabase Postgres | Supabase |
| Auth | Supabase Auth | Supabase |
| Scraping / ETL | TypeScript Node workspace + cheerio | GitHub Actions + local dev |
| Testing | Vitest | local dev + GitHub Actions |
| CI/CD | GitHub Actions | GitHub |

---

## COMMIT CONFIG
scopes: shared, contracts, bootstrap, release, qa, docs, ci
tdd_targets: role contract stability, profile contract stability, session contract stability, funding contract stability, route-policy registry assumptions, migration logging discipline
docker_phase: not in current V2 scope
ci_phase: bootstrap phase

---

## ARCHITECTURE DECISIONS
D1_title: Shared-space governs coordination only
D1_decision: keep shared-space focused on shared bootstrap, contracts, release gates, shared docs, QA, and migration control.
D1_why: this prevents it from becoming a shadow implementation path that cuts across Dev A and Dev B ownership.

D2_title: One full-project summary across all spaces
D2_decision: use the same `ProjectSummary.md` in dev-a, dev-b, and shared spaces.
D2_why: migration back into the real project is easier when everyone refers to one common project definition.

D3_title: Space folders are planning/control planes
D3_decision: default to implementing code directly in the real project and use the spaces for planning, proofs, and controlled drafts.
D3_why: duplicate live code in spaces would create confusion and drift.

---

## DATA / STRUCTURE

### web: Models
model_1: Shared coordination artifact | phase: text required | mode: direct-main|workspace-draft required | target_paths: text[] required | verification: text required | reference: commit|pr required
model_2: Contract handoff record | deliverable: text required | producer: text required | consumer: text required | release_ref: text required
model_3: QA record | environment: text required | checklist: text[] required | result: pass|fail required | notes: text optional

---

## SEED / FIXTURES / TEST DATA
strategy: shared-space does not own product seed data; it owns checklists, release notes, migration records, QA matrices, and copied reference docs needed after space-local `build/` and `claude/` folders are removed.

---

## CORE LOGIC
logic: 1) read the copied shared docs and contracts; 2) identify whether the current task is truly shared; 3) choose direct-main or workspace-draft mode from `Migration.md`; 4) execute or prepare the shared artifact; 5) verify the named deliverable, review path, and release reference; 6) record migration completion in `Progress.md`.

---

## FEATURES
feature_1: shared bootstrap and branch-protection coordination
feature_2: contract lock/change governance
feature_3: release-gate preparation and verification
feature_4: shared QA and third-project validation
feature_5: migration-mode decisions and records
feature_6: shared-file PR planning and review discipline

---

## ROUTES / ENTRY POINTS / SCREENS

### web: Routes
public_routes:
  - none specific to the shared workspace; this workspace coordinates the real project rather than defining a separate app surface

auth_routes:
  - none specific to the shared workspace

protected_routes:
  - coordination entry shared-space/codex/BuildFlow.md | planning artifact | shared phase tracker
  - coordination entry shared-space/codex/Progress.md | planning artifact | migration-gated progress tracker
  - coordination entry shared-space/codex/Migration.md | planning artifact | direct-main vs workspace-draft control document

---

## RED LINES
redline_1: never use shared-space to bypass Dev A or Dev B ownership
redline_2: never mark a shared phase complete without a named proof artifact and migration record
redline_3: never change a typed contract without the change protocol and the required review
redline_4: never keep duplicate live implementation in the space when the real-project target exists

---

## ENV VARS
env_1: NEXT_PUBLIC_SUPABASE_URL | shared project URL used in bootstrap and QA verification | yes
env_2: NEXT_PUBLIC_SUPABASE_ANON_KEY | anon key referenced by app/QA verification | yes
env_3: SUPABASE_SERVICE_ROLE_KEY | workflow and ETL secret referenced by shared release and QA checks | yes

---

## PHASES

phase_1_name: Shared Kickoff and Ownership Alignment
phase_1_goal: confirm both developers are using the same shared rules before bootstrap starts
phase_1_checkboxes:
  - ownership boundaries are re-read
  - shared-space purpose is agreed
  - migration mode expectations are agreed
phase_1_proof: Show the kickoff notes referencing `ownership.md`, `conventions.md`, and `Migration.md`.
phase_1_commit: docs(shared): align workspace rules and migration flow

phase_2_name: Branch and Protection Setup
phase_2_goal: establish `develop`, branch protection, and the release path
phase_2_checkboxes:
  - `develop` exists
  - branch protection is configured
  - release path to `main` is documented
phase_2_proof: Show the branch state and protection configuration.
phase_2_commit: chore(shared): establish protected branch flow

phase_3_name: Mixed-File Surgery Coordination
phase_3_goal: close the shared restructure gate so parallel work can start safely
phase_3_checkboxes:
  - surgery PR is merged
  - demo URLs still work
  - target folders exist for both domains
phase_3_proof: Show the restructure PR and successful build/lint proof.
phase_3_commit: docs(shared): verify mixed-file surgery completion

phase_4_name: Shared Bootstrap Infrastructure
phase_4_goal: complete shared env, Supabase, CI, workflow, and access setup
phase_4_checkboxes:
  - shared Supabase project and env rules are working
  - CI and scrape workflow stubs are green
  - both developers have required repo and Supabase access
phase_4_proof: Show bootstrap checklist proof and workflow success.
phase_4_commit: chore(shared): verify bootstrap infrastructure

phase_5_name: Contract Lock and V2.P1 Release Gate
phase_5_goal: close the shared bootstrap phase formally
phase_5_checkboxes:
  - all five contracts are LOCKED
  - V2.P1 checklist is fully green
  - `release: V2.P1 complete` is merged
phase_5_proof: Show the contract states and the merged V2.P1 release PR.
phase_5_commit: docs(release): close V2.P1 shared gate

phase_6_name: V2.P2 Dependency Audit
phase_6_goal: verify the real V2.P2 prerequisites and nothing extra
phase_6_checkboxes:
  - Dev A and Dev B V2.P2 dependencies are named exactly
  - no fake blockers are introduced
  - progress trackers match the shared dependency map
phase_6_proof: Show the dependency table in shared buildflow against both dev progress files.
phase_6_commit: docs(shared): audit V2.P2 dependencies

phase_7_name: Contract Consumption Check
phase_7_goal: verify both tracks are consuming the shared contracts correctly
phase_7_checkboxes:
  - role, profile, session, funding, and route-policy contracts are still aligned with the plan
  - contract-change protocol is followed for any drift
  - handoff notes are recorded where required
phase_7_proof: Show the contract files and any corresponding progress notes.
phase_7_commit: docs(contracts): verify shared contract consumption

phase_8_name: V2.P2 Release Gate
phase_8_goal: formally close the parallel domain-foundation phase
phase_8_checkboxes:
  - Dev A V2.P2 proof requirements are green
  - Dev B V2.P2 proof requirements are green
  - `release: V2.P2 complete` is merged
phase_8_proof: Show both dev proofs and the merged V2.P2 release PR.
phase_8_commit: docs(release): close V2.P2 shared gate

phase_9_name: V2.P3 Handoff Readiness
phase_9_goal: verify the named cross-domain handoffs needed during core delivery
phase_9_checkboxes:
  - `getRoleProfile` handoff is named
  - `0010_rls_identity.sql` dependency for funding RLS is named
  - ETL source verification requirement is named
phase_9_proof: Show the matching shared-buildflow dependency table and corresponding dev buildflow steps.
phase_9_commit: docs(shared): verify V2.P3 handoff readiness

phase_10_name: Shared Review of ETL and RLS Readiness
phase_10_goal: coordinate shared review around the most coupling-heavy V2.P3 work
phase_10_checkboxes:
  - ETL source verification PR exists or merged
  - funding-side RLS is blocked only by named allowed blockers
  - no shared-file drift exists in contracts or conventions
phase_10_proof: Show the ETL verification artifact, blocker record if any, and shared-file diff review.
phase_10_commit: docs(shared): review ETL and RLS readiness

phase_11_name: V2.P3 Release Gate
phase_11_goal: formally close the parallel core-delivery phase
phase_11_checkboxes:
  - Dev A V2.P3 proof requirements are green
  - Dev B V2.P3 proof requirements are green
  - `release: V2.P3 complete` is merged
phase_11_proof: Show both dev proofs and the merged V2.P3 release PR.
phase_11_commit: docs(release): close V2.P3 shared gate

phase_12_name: V2.P4 Integration Kickoff
phase_12_goal: prepare the shared coordination surface for controlled integration
phase_12_checkboxes:
  - inbound/outbound handoffs are named for dashboard integration
  - direct-main vs workspace-draft mode is chosen for each shared artifact
  - shared-file PR expectations are restated
phase_12_proof: Show the integration kickoff notes referencing `Migration.md` and the shared buildflow.
phase_12_commit: docs(shared): prepare V2.P4 integration workflow

phase_13_name: V2.P4 Shared Integration Review
phase_13_goal: verify that shared integration work respects contracts and ownership
phase_13_checkboxes:
  - dashboard integration consumed published contracts only
  - shared files changed through the right review path
  - `release: V2.P4 complete` is ready or merged
phase_13_proof: Show the integration PR references and the merged or ready V2.P4 release PR.
phase_13_commit: docs(release): verify V2.P4 shared integration

phase_14_name: Shared Hardening Docs and Release Notes
phase_14_goal: coordinate shared hardening artifacts before final QA
phase_14_checkboxes:
  - README or shared setup docs are updated
  - demo-isolation audit results are captured
  - release notes or checklist notes are drafted
phase_14_proof: Show the updated shared docs and release-note artifacts.
phase_14_commit: docs(shared): prepare hardening and release notes

phase_15_name: Third-Project QA Prep
phase_15_goal: prepare a clean validation environment and checklist
phase_15_checkboxes:
  - third Supabase project plan exists
  - QA checklist spans auth, profiles, funding, forum, ETL, and RLS
  - owner assignments for the QA pass are explicit
phase_15_proof: Show the QA checklist and fresh-environment setup notes.
phase_15_commit: docs(qa): prepare third-project validation

phase_16_name: Third-Project QA Execution
phase_16_goal: run and record the shared end-to-end QA pass
phase_16_checkboxes:
  - fresh-environment validation is executed
  - failures are either fixed or logged as blockers
  - both developers sign off on the results
phase_16_proof: Show the QA results record and any linked fixes or blocker notes.
phase_16_commit: docs(qa): record shared third-project results

phase_17_name: Final Release Archive and Migration Ledger
phase_17_goal: close the shared workflow with a clear release and migration record
phase_17_checkboxes:
  - final release PR reference is recorded
  - migration records exist for all shared phases
  - the shared-space archive is sufficient after space-local `build/` and `claude/` copies are removed
phase_17_proof: Show the final release reference, the migration ledger state, and the retained `codex/references/` tree.
phase_17_commit: docs(shared): close release archive and migration ledger
