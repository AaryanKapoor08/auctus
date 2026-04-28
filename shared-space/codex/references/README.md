# Reference Index — Shared Workspace

This folder contains copied source material used to fill the shared Likit workspace.
It is the retained source snapshot after root planning cleanup.

Use this order when you need to verify or refresh context:

1. `build/shared/buildflow.md`
   Master V2 phase tracker and real prerequisite map.
2. `build/shared/ownership.md`
   Folder, route, migration, and handoff ownership.
3. `build/shared/bootstrap.md`
   Shared V2.P1 checklist and completion gate.
4. `build/shared/conventions.md`
   Branching, PR, commit, migration, test, and blocker rules.
5. `build/contracts/*.ts`
   Typed integration contracts.
6. `build/dev-a/*.md` and `build/dev-b/*.md`
   Domain-specific execution docs used for handoff and release checks.
7. `build/gameplan.md`, `build/productvision.md`, `build/resume_session_context.md`
   Strategic scope and high-context project state.
8. `CLAUDE.md`
   Root mentoring/gate wrapper copied exactly from the source snapshot before cleanup.
9. `claude/*.md`
   Root `claude/` archive copied exactly from the source snapshot before cleanup. `CurrentStatus.md` is the main repo-state snapshot; the rest are retained mentor/template/archive context and are not first execution authority.

Copied contents:

- `build/`
  - `gameplan.md`
  - `productvision.md`
  - `resume_session_context.md`
  - `shared/`
  - `contracts/`
  - `dev-a/`
  - `dev-b/`
- `CLAUDE.md`
- `claude/`
  - `BuildFlow.md`
  - `Claude_guide.md`
  - `CurrentStatus.md`
  - `G0_questionnaire.md`
  - `Progress.md`
  - `ProjectSummary.md`
  - `ProjectSummary_creative.md`
  - `ProjectSummary_systems.md`
  - `ProjectSummary_web.md`
  - `_fill_manifest.md`
  - `github.md`

Reason these copies exist:

- the root planning docs can be removed without losing any source material
- the shared Likit workspace remains self-contained after the root `build/`, `claude/`, and `CLAUDE.md` copies are removed
- release gates, handoffs, and QA checks can be validated without leaving `codex/`
