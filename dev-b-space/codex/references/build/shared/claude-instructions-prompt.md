# Claude Detailed Instructions Prompt

Use this prompt after the critique pass is complete and you want Claude to turn the current V2 planning docs into detailed execution instructions.

---

You have already reviewed the Auctus V2 planning docs and critiqued them.

This next task is to convert the planning docs into detailed build instructions.

This is still a documentation task. Do not implement application code yet unless I explicitly ask for that in a separate step.

## Core Objective

Using:

- the current V2 docs
- your critique findings
- the current repo reality

rewrite and strengthen the planning docs so they become proper instruction-grade execution docs for two developers.

The goal is to make the docs detailed enough that each developer knows exactly:

- what to build
- where to build it
- what order to build it in
- what they are allowed to touch
- what they must not touch
- what prerequisites are real
- what handoffs are required
- how to track progress cleanly

## Important Context

The repo is currently still a V1-style frontend demo.

What exists today:

- Next.js frontend shell
- demo pages
- static JSON data
- local matching logic
- local rule-based chatbot

What does not exist yet:

- real auth
- real user profiles
- real persisted forum data
- real funding storage
- real ETL ingestion
- real multi-role product behavior

Important:

- `claude/ProjectSummary.md` is product vision only
- it is not the final build plan
- the current V2 planning docs under `build/` are the real source of truth
- old docs in `claude/BuildFlow.md` and `claude/Progress.md` are legacy V1/demo docs only

## Locked Product Decisions

Treat these as already decided unless there is a severe execution issue:

- We are building the real product, not another demo.
- We support 3 roles from the start:
  - business
  - student
  - professor
- We use one unified funding system with role-aware views.
- We keep one shared forum across all roles.
- AI chat is later, not current scope.
- `talent` and `matchmaker` are out of current scope.
- During restructuring they should move into a demo/legacy area.
- Major design exploration is not current scope.
- We start with a restructuring/setup phase first.
- Two developers must work independently with minimal overlap.

## Locked Developer Split

- Dev A owns identity/community:
  - auth
  - roles
  - onboarding
  - profiles
  - forum
- Dev B owns funding/pipelines:
  - funding
  - matching
  - ETL
  - ingestion

The shared buildflow must be parallel-first.

Only real prerequisites should create dependency chains.

## Files To Read And Then Update

Primary files:

1. `build/gameplan.md`
2. `build/shared/buildflow.md`
3. `build/shared/ownership.md`
4. `build/shared/contracts.md` (pointer file) and the typed contracts under `build/contracts/`
5. `build/shared/conventions.md`
6. `build/shared/bootstrap.md`
7. `build/dev-a/buildflow.md`
8. `build/dev-a/progress.md`
9. `build/dev-b/buildflow.md`
10. `build/dev-b/progress.md`

Support files:

11. `build/shared/claude-review-context.md`
12. `build/shared/claude-review-prompt.md`
13. `claude/ProjectSummary.md`
14. `claude/CurrentStatus.md`
15. your own critique findings from the previous review

## What You Need To Produce

I want you to edit the docs in place and make them instruction-grade.

### 1. `build/gameplan.md`

Keep this as:

- scope
- goals
- in-scope/out-of-scope
- high-level phases

Do not turn this into a low-level build checklist.

Do not turn this into a discussion log.

This file should stay strategic and clean.

### 2. `build/shared/ownership.md` + `build/shared/contracts.md` + `build/contracts/*.ts`

Ownership prose lives in `build/shared/ownership.md`:

- folder ownership
- route ownership
- database/schema ownership
- migration ownership
- no-touch zones
- shared-file rules
- handoff rules
- mixed-file breakup assignments

`build/shared/contracts.md` is a thin pointer; do NOT put prose contracts here.

Real cross-domain interfaces are TypeScript files under `build/contracts/` (`role.ts`, `profile.ts`, `session.ts`, `funding.ts`, `route-policy.ts`). Each carries a `// STATUS:` header (`LOCKED` / `DRAFT` / `STUB`). The compiler enforces the boundary.

Branch/merge/PR/commit/migration rules live in `build/shared/conventions.md`.

Together these should make overlap difficult and obvious.

### 3. `build/shared/buildflow.md`

This should become the master project execution map.

It must define:

- exact shared setup work
- exact restructuring work
- exact prerequisites for parallel work
- parallel work tracks
- true dependencies only
- handoff points with named deliverables
- integration phases
- validation/hardening phases

Most importantly:

- it must minimize blocking between Dev A and Dev B
- it must not create vague waiting
- every dependency must name the exact thing required

If a task can be independent, write it as independent.

### 4. `build/dev-a/buildflow.md`

This must become a proper coding guide for Dev A.

It should include:

- objective
- owned scope
- exact folders/files/modules to create, move, split, or refactor
- exact step order
- expected outputs per step
- what contracts Dev A publishes
- what contracts Dev A consumes
- tests/validation to perform
- done criteria

Make it concrete enough that Dev A can execute without guessing.

### 5. `build/dev-b/buildflow.md`

This must become a proper coding guide for Dev B.

It should include:

- objective
- owned scope
- exact folders/files/modules to create, move, split, or refactor
- exact step order
- expected outputs per step
- what contracts Dev B publishes
- what contracts Dev B consumes
- tests/validation to perform
- done criteria

Make it concrete enough that Dev B can execute without guessing.

### 6. `build/dev-a/progress.md` and `build/dev-b/progress.md`

These should mirror the buildflows as actionable progress trackers.

They should be:

- checklist-based
- aligned step-for-step with each developer's buildflow
- easy to update during execution
- clear about blockers and handoffs

## Important Constraints

- Do not collapse the docs into one file.
- Do not move buildflow-level detail into the gameplan.
- Do not turn the contracts doc into a second buildflow.
- Do not assume implementation details that contradict the current repo reality.
- Do not quietly expand scope beyond what has already been locked.
- Do not bring AI chat, talent, or matchmaker back into active scope.
- Do not create developer overlap in shared files unless absolutely necessary.

## Specific Things I Want You To Add

Where appropriate, make the docs more explicit about:

- what the restructuring phase must physically do to the repo
- what happens to current mixed demo files like broad utilities or global demo state
- what folders should exist after restructuring
- where `talent` and `matchmaker` move in the demo area
- what exact contracts are needed between identity/profile and funding visibility
- what exact contracts are needed for dashboard integration
- what exact shared deliverables unblock the next phase
- what tests or validation steps belong to each phase

## Style Requirements

Write the docs in a direct, execution-focused way.

Prefer:

- explicit steps
- concrete deliverables
- named prerequisites
- named outputs
- named handoffs

Avoid:

- vague management language
- motivational filler
- open-ended planning language where execution detail is needed

## Output Format

1. First, briefly summarize what you are changing and why.
2. Then update the files directly.
3. After editing, provide:
   - a short summary of the strongest improvements
   - any remaining unresolved assumptions that still need human decision

## Final Quality Bar

When you are done, the docs should be good enough that:

- two developers can start work with minimal overlap
- both know exactly what they own
- both know the order of work
- both know the true dependencies
- the shared buildflow coordinates the project without micromanaging both people into blocking each other
- the gameplan stays high-level while the buildflows become properly actionable

---
