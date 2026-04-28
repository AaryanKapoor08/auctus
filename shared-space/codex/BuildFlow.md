# Build Flow

> This 17-gate flow is the **shared coordination translation** of the copied Auctus V2 docs.
> It does not create a third product track. It governs the work that belongs to both developers together: bootstrap, contracts, release gates, QA, and migration control.

## Prerequisites

- Read `ProjectSummary.md`, `Codex_guide.md`, `Progress.md`, `Migration.md`, and `references/README.md`
- Use shared-space only for genuinely shared work
- Keep feature implementation in Dev A or Dev B space unless the task is clearly a shared-file or release activity
- Do not skip owner/reviewer rules from `references/build/shared/conventions.md`

Every phase closes only after the matching migration checkbox in `Progress.md` is checked. The record must follow `Migration.md` and name either `direct-main` execution or `workspace-draft` migration with real-project target paths and a commit/PR reference.

---

## P1 — Shared Kickoff and Ownership Alignment `[GATE G1]`
**Goal:** confirm both developers are using the same shared rules before bootstrap starts
- [ ] ownership boundaries are re-read
- [ ] shared-space purpose is agreed
- [ ] migration mode expectations are agreed
**Proof:** show the kickoff notes referencing `ownership.md`, `conventions.md`, and `Migration.md`  
**Commit:** `docs(shared): align workspace rules and migration flow`

## P2 — Branch and Protection Setup `[GATE G2 — requires G1]`
**Goal:** establish `develop`, branch protection, and the release path
- [ ] `develop` exists
- [ ] branch protection is configured
- [ ] release path to `main` is documented
**Proof:** show the branch state and protection configuration  
**Commit:** `chore(shared): establish protected branch flow`

## P3 — Mixed-File Surgery Coordination `[GATE G3 — requires G2]`
**Goal:** close the shared restructure gate so parallel work can start safely
- [ ] surgery PR is merged
- [ ] demo URLs still work
- [ ] target folders exist for both domains
**Proof:** show the restructure PR and successful build/lint proof  
**Commit:** `docs(shared): verify mixed-file surgery completion`

## P4 — Shared Bootstrap Infrastructure `[GATE G4 — requires G3]`
**Goal:** complete shared env, Supabase, CI, workflow, and access setup
- [ ] shared Supabase project and env rules are working
- [ ] CI and scrape workflow stubs are green
- [ ] both developers have required repo and Supabase access
**Proof:** show bootstrap checklist proof and workflow success  
**Commit:** `chore(shared): verify bootstrap infrastructure`

## P5 — Contract Lock and V2.P1 Release Gate `[GATE G5 — requires G4]`
**Goal:** close the shared bootstrap phase formally
- [ ] all five contracts are LOCKED
- [ ] V2.P1 checklist is fully green
- [ ] `release: V2.P1 complete` is merged
**Proof:** show the contract states and the merged V2.P1 release PR  
**Commit:** `docs(release): close V2.P1 shared gate`

## P6 — V2.P2 Dependency Audit `[GATE G6 — requires G5]`
**Goal:** verify the real V2.P2 prerequisites and nothing extra
- [ ] Dev A and Dev B V2.P2 dependencies are named exactly
- [ ] no fake blockers are introduced
- [ ] progress trackers match the shared dependency map
**Proof:** show the dependency table in shared buildflow against both dev progress files  
**Commit:** `docs(shared): audit V2.P2 dependencies`

## P7 — Contract Consumption Check `[GATE G7 — requires G6]`
**Goal:** verify both tracks are consuming the shared contracts correctly
- [ ] role, profile, session, funding, and route-policy contracts are still aligned with the plan
- [ ] contract-change protocol is followed for any drift
- [ ] handoff notes are recorded where required
**Proof:** show the contract files and any corresponding progress notes  
**Commit:** `docs(contracts): verify shared contract consumption`

## P8 — V2.P2 Release Gate `[GATE G8 — requires G7]`
**Goal:** formally close the parallel domain-foundation phase
- [ ] Dev A V2.P2 proof requirements are green
- [ ] Dev B V2.P2 proof requirements are green
- [ ] `release: V2.P2 complete` is merged
**Proof:** show both dev proofs and the merged V2.P2 release PR  
**Commit:** `docs(release): close V2.P2 shared gate`

## P9 — V2.P3 Handoff Readiness `[GATE G9 — requires G8]`
**Goal:** verify the named cross-domain handoffs needed during core delivery
- [ ] `getRoleProfile` handoff is named
- [ ] `0010_rls_identity.sql` dependency for funding RLS is named
- [ ] ETL source verification requirement is named
**Proof:** show the matching shared-buildflow dependency table and corresponding dev buildflow steps  
**Commit:** `docs(shared): verify V2.P3 handoff readiness`

## P10 — Shared Review of ETL and RLS Readiness `[GATE G10 — requires G9]`
**Goal:** coordinate shared review around the most coupling-heavy V2.P3 work
- [ ] ETL source verification PR exists or merged
- [ ] funding-side RLS is blocked only by named allowed blockers
- [ ] no shared-file drift exists in contracts or conventions
**Proof:** show the ETL verification artifact, blocker record if any, and shared-file diff review  
**Commit:** `docs(shared): review ETL and RLS readiness`

## P11 — V2.P3 Release Gate `[GATE G11 — requires G10]`
**Goal:** formally close the parallel core-delivery phase
- [ ] Dev A V2.P3 proof requirements are green
- [ ] Dev B V2.P3 proof requirements are green
- [ ] `release: V2.P3 complete` is merged
**Proof:** show both dev proofs and the merged V2.P3 release PR  
**Commit:** `docs(release): close V2.P3 shared gate`

## P12 — V2.P4 Integration Kickoff `[GATE G12 — requires G11]`
**Goal:** prepare the shared coordination surface for controlled integration
- [ ] inbound/outbound handoffs are named for dashboard integration
- [ ] direct-main vs workspace-draft mode is chosen for each shared artifact
- [ ] shared-file PR expectations are restated
**Proof:** show the integration kickoff notes referencing `Migration.md` and the shared buildflow  
**Commit:** `docs(shared): prepare V2.P4 integration workflow`

## P13 — V2.P4 Shared Integration Review `[GATE G13 — requires G12]`
**Goal:** verify that shared integration work respects contracts and ownership
- [ ] dashboard integration consumed published contracts only
- [ ] shared files changed through the right review path
- [ ] `release: V2.P4 complete` is ready or merged
**Proof:** show the integration PR references and the merged or ready V2.P4 release PR  
**Commit:** `docs(release): verify V2.P4 shared integration`

## P14 — Shared Hardening Docs and Release Notes `[GATE G14 — requires G13]`
**Goal:** coordinate shared hardening artifacts before final QA
- [ ] README or shared setup docs are updated
- [ ] demo-isolation audit results are captured
- [ ] release notes or checklist notes are drafted
**Proof:** show the updated shared docs and release-note artifacts  
**Commit:** `docs(shared): prepare hardening and release notes`

## P15 — Third-Project QA Prep `[GATE G15 — requires G14]`
**Goal:** prepare a clean validation environment and checklist
- [ ] third Supabase project plan exists
- [ ] QA checklist spans auth, profiles, funding, forum, ETL, and RLS
- [ ] owner assignments for the QA pass are explicit
**Proof:** show the QA checklist and fresh-environment setup notes  
**Commit:** `docs(qa): prepare third-project validation`

## P16 — Third-Project QA Execution `[GATE G16 — requires G15]`
**Goal:** run and record the shared end-to-end QA pass
- [ ] fresh-environment validation is executed
- [ ] failures are either fixed or logged as blockers
- [ ] both developers sign off on the results
**Proof:** show the QA results record and any linked fixes or blocker notes  
**Commit:** `docs(qa): record shared third-project results`

## P17 — Final Release Archive and Migration Ledger `[GATE G17 — requires G16]`
**Goal:** close the shared workflow with a clear release and migration record
- [ ] final release PR reference is recorded
- [ ] migration records exist for all shared phases
- [ ] the shared-space archive is sufficient after space-local `build/` and `claude/` copies are removed
**Proof:** show the final release reference, the migration ledger state, and the retained `codex/references/` tree  
**Commit:** `docs(shared): close release archive and migration ledger`
