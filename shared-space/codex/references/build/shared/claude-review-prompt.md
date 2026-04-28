# Claude Review Prompt

Use the prompt below when asking Claude to critique the current Auctus V2 planning docs.

---

You are reviewing the Auctus repository with fresh eyes.

This is a critique/review task only. Do not implement changes yet.

I want you to pressure-test the current V2 planning docs and tell me what is weak, unclear, risky, contradictory, or missing before we start building.

Important context:

- The current repository is still a V1-style frontend demo.
- The V2 docs are planning docs for the next real phase.
- `claude/ProjectSummary.md` is only the future product vision and idea direction.
- `claude/ProjectSummary.md` is not the finalized build plan.
- The actual V2 planning docs are under `build/`.
- Old docs under `claude/BuildFlow.md` and `claude/Progress.md` are legacy V1/demo docs only.

Locked decisions that you should treat as intentional unless you think they are a serious mistake:

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
- The shared buildflow is supposed to be parallel-first, with only real prerequisites creating dependency chains.

Files to read first:

1. `build/gameplan.md`
2. `build/shared/buildflow.md`
3. `build/shared/ownership.md`
4. `build/shared/contracts.md` and the typed contracts under `build/contracts/`
5. `build/shared/conventions.md`
6. `build/shared/bootstrap.md`
7. `build/dev-a/buildflow.md`
8. `build/dev-a/progress.md`
9. `build/dev-b/buildflow.md`
10. `build/dev-b/progress.md`
11. `build/shared/claude-review-context.md`

Context/reference files:

9. `claude/ProjectSummary.md`
10. `claude/CurrentStatus.md`
11. `claude/BuildFlow.md`
12. `claude/Progress.md`

What I want from you:

1. Review whether the V2 docs are actually coherent together.
2. Review whether the plan matches the current repo reality.
3. Review whether the phase order is good.
4. Review whether the two-developer split is clean enough.
5. Review whether the contracts are strong enough to prevent overlap.
6. Review whether the shared buildflow really minimizes blocking.
7. Identify anything missing before two people start working in parallel.
8. Flag anything that should move between gameplan/contracts/buildflow docs.
9. Flag any hidden assumptions that are dangerous.
10. Tell me where the plan is too vague or too rigid.

Be critical. Challenge weak assumptions. Do not just summarize the docs back to me.

I want the response in this order:

1. Findings, ordered by severity
2. Open questions / assumptions that still need clarification
3. Recommended changes to the docs
4. Optional better structure if you think the current structure can be improved

For each finding, include:

- severity
- affected file(s)
- the specific problem
- why it matters
- what I should change

Focus on execution risk, ownership overlap, sequencing problems, and mismatch between plan and real repo state.

Do not spend most of the answer on wording polish or style unless the wording causes execution confusion.

If the docs are strong in some areas, say that too, but prioritize weaknesses first.

---
