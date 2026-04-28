# Reference Index — Dev B Workspace

This folder contains copied source material used to fill the Dev B Likit workspace.
It is the retained source snapshot after root planning cleanup.

Use this order when you need to verify or refresh context:

1. `build/shared/buildflow.md`
   Master V2 phase tracker and real prerequisite map.
2. `build/shared/ownership.md`
   Folder, route, migration, and handoff ownership. This is the main anti-overlap document.
3. `build/shared/bootstrap.md`
   Shared V2.P1 gate and bootstrap checklist.
4. `build/shared/conventions.md`
   Branching, PR, commit, migration, and blocker rules.
5. `build/contracts/*.ts`
   Typed integration contracts. These are the execution truth for cross-domain shapes.
6. `build/dev-b/*.md`
   Dev B execution details.
7. `build/dev-a/*.md`
   Dev A handoff/progress details that Dev B may need during integration and blocker checks.
8. `build/gameplan.md`, `build/productvision.md`, `build/resume_session_context.md`
   Strategic scope, locked decisions, and high-context resume notes.
9. `CLAUDE.md`
   Root mentoring/gate wrapper copied exactly from the source snapshot before cleanup.
10. `claude/*.md`
   Root `claude/` archive copied exactly from the source snapshot before cleanup. `CurrentStatus.md` is the main repo-state snapshot; the rest are retained mentor/template/archive context and are not the first execution authority when they conflict with `build/`.

Copied contents:

- `build/`
  - `gameplan.md`
  - `productvision.md`
  - `resume_session_context.md`
  - `shared/`
  - `contracts/`
  - `dev-b/`
  - `dev-a/`
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
- the workspace can be used without leaving `codex/`
- this reference tree is what remains useful after the root `build/`, `claude/`, and `CLAUDE.md` copies are removed
- cross-domain rules, contracts, ETL constraints, and handoff docs are available locally for phase checks
