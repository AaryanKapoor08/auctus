# Claude Review Context

Use this file when asking Claude to critique the current Auctus V2 planning docs with fresh eyes.

## Review Goal

Critique the current V2 planning set for:

- scope clarity
- sequencing quality
- contradictions
- missing prerequisites
- ownership overlap
- dependency risks
- realism against the current repository state

The goal is not to implement anything yet. The goal is to stress-test the plan before execution starts.

## Current Repo Reality

The repository is currently still a V1-style frontend demo.

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

Important: some things are only documented as future work and are not yet reflected in the codebase.

## Canonical V2 Docs

These are the current source-of-truth planning docs:

- [build/gameplan.md](../gameplan.md) — scope and locked decisions
- [build/shared/buildflow.md](./buildflow.md) — master phase tracker
- [build/shared/ownership.md](./ownership.md) — folder/route/DB/migration ownership
- [build/shared/contracts.md](./contracts.md) — pointer to typed contracts
- [build/shared/conventions.md](./conventions.md) — branching/PR/commit/migration rules
- [build/shared/bootstrap.md](./bootstrap.md) — V2.P1 shared setup checklist
- [build/contracts/](../contracts/) — typed cross-domain interfaces (`role.ts`, `profile.ts`, `session.ts`, `funding.ts`, `route-policy.ts`)
- [build/dev-a/buildflow.md](../dev-a/buildflow.md)
- [build/dev-a/progress.md](../dev-a/progress.md)
- [build/dev-b/buildflow.md](../dev-b/buildflow.md)
- [build/dev-b/progress.md](../dev-b/progress.md)

## Vision Input, Not Build Plan

This file is product vision and future direction only:

- [claude/ProjectSummary.md](../../claude/ProjectSummary.md)

It should not be treated as the finalized implementation plan.

## Legacy Context Only

These files are legacy V1/demo planning docs:

- [claude/BuildFlow.md](../../claude/BuildFlow.md)
- [claude/Progress.md](../../claude/Progress.md)

These may still be useful for historical context, but they are not the current V2 execution docs.

## Helpful Current-State Reference

- [claude/CurrentStatus.md](../../claude/CurrentStatus.md)

This summarizes what the codebase currently has versus what is still missing.

## Locked Product Decisions

These decisions were intentionally locked before writing the V2 docs:

- Build the real product, not another demo.
- Support all 3 roles from the start:
  - business
  - student
  - professor
- Use one unified funding system with role-aware views.
- Keep one shared forum across all roles.
- Leave AI chat for a later phase.
- Leave `talent` and `matchmaker` out of current scope.
- During restructuring, `talent` and `matchmaker` should move to a demo/legacy area.
- Do not make major design exploration part of the current phase.
- Start with a restructuring/setup phase first.
- Two developers must be able to work independently with minimal overlap.

## Locked Team Split

- Dev A owns:
  - auth
  - roles
  - onboarding
  - profiles
  - forum
- Dev B owns:
  - funding
  - matching
  - ETL
  - ingestion

The shared buildflow is intentionally written to be parallel-first. Only real prerequisites should create dependencies.

## Important Review Questions

Claude should pressure-test the plan against these questions:

- Does the gameplan clearly define the current scope?
- Is anything still ambiguous that should have been locked first?
- Are there contradictions between the gameplan, contracts, and buildflows?
- Are the phases sequenced well?
- Are there hidden blockers that would cause one developer to wait too often?
- Do the contracts actually protect separation, or are there overlap risks?
- Are any areas too vague to implement safely?
- Are any areas too rigid too early?
- Does the plan account properly for the fact that the current repo is still a demo?
- Are there missing restructuring tasks before parallel work starts?
- Are there missing shared contracts for auth/funding/forum/dashboard integration?
- Should anything move between `gameplan`, `contracts`, and `buildflow` docs?

## What The Critique Should Focus On

Focus on:

- execution risk
- ambiguity
- domain overlap
- phase ordering
- integration risk
- mismatch between docs and current repo reality

Do not spend most of the review on:

- writing style
- phrasing polish
- grammar-only edits

unless wording is so unclear that it creates execution risk.

## Preferred Review Output

Ask Claude to respond in this order:

1. Findings, ordered by severity
2. Open questions or assumptions
3. Recommended doc changes
4. Optional improved structure suggestions

Each finding should ideally include:

- severity
- affected file(s)
- why it is a problem
- what should change
