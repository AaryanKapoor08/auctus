# Shared Contracts — Navigation

This file is the entry point for every cross-domain agreement in V2. Coordination concerns are deliberately split across four files so each one can be searched and edited cleanly. Use this map to find the right one.

## Where each concern lives

| Concern | File | Section / Symbol |
|---|---|---|
| The role enum (`Role`, `ROLES`, `ROLE_DEFAULT_ROUTE`) | `build/contracts/role.ts` | whole file |
| Profile shapes (`Profile` with nullable role, `OnboardedProfile`, `BusinessProfile`, `StudentProfile`, `ProfessorProfile`, `RoleProfile`) | `build/contracts/profile.ts` | whole file |
| Session shape Dev B may read (`Session`, `GetSession`, `useSession`) | `build/contracts/session.ts` | whole file |
| Funding shapes (`FundingItem`, `FundingQuery`, `FundingSummary`, `FundingPreferences`) and runtime function signatures (`ListFundingForRole`, `GetFundingById`, `GetFundingSummariesForUser`, preference helpers) | `build/contracts/funding.ts` | whole file |
| Per-route gating registry (`RoutePolicy`, `RoutePolicyRegistry`) | `build/contracts/route-policy.ts` | whole file |
| Folder ownership (target tree, per-domain boundaries) | `build/shared/ownership.md` | "Folder Ownership (Target State)" |
| Route ownership (per-route allowed roles) | `build/shared/ownership.md` | "Route Ownership" |
| Database / schema ownership (per-table) | `build/shared/ownership.md` | "Database Ownership" |
| Migration ownership (numeric ranges per dev) | `build/shared/ownership.md` | "Migration Ownership" |
| RLS policy ownership | `build/shared/ownership.md` | "RLS policy ownership" |
| No-touch zones (frozen-unless-coordinated files) | `build/shared/ownership.md` | "Shared Zones → Frozen unless coordinated" |
| Demo / legacy isolation (`talent`, `matchmaker`, V1 funding) | `build/shared/ownership.md` | "Demo / Legacy" + "Demo Scope Isolation" |
| Mixed-file surgery owner table | `build/shared/ownership.md` | "Mixed-File Surgery" |
| Handoff rules (what counts as a real dependency) | `build/shared/ownership.md` | "Handoff Rules" + "Blocking Policy" |
| Branch naming, PR review, commit format | `build/shared/conventions.md` | "Branching", "Pull Requests", "Commits" |
| Migration numbering & collision protocol | `build/shared/conventions.md` | "Migration numbering" |
| Test commands, CI requirements | `build/shared/conventions.md` | "Tests" |
| Contract change protocol (how to edit a `build/contracts/*.ts` file) | `build/contracts/README.md` | "Change protocol" |
| Status legend (LOCKED / DRAFT / STUB) | `build/contracts/README.md` | "Status legend" |
| Phase order, phase gates, true dependencies | `build/shared/buildflow.md` | per phase |
| V2.P1 shared bootstrap checklist | `build/shared/bootstrap.md` | "V2.P1 Completion Gate" |

## What a "contract" means in V2

We use the word in two senses; do not conflate them.

1. **Typed contract** — a `.ts` file under `build/contracts/`. The TypeScript compiler enforces it. If the implementation drifts from the contract, `tsc` fails. This is how we keep `Profile`, `FundingItem`, `Session`, etc. honest.

2. **Coordination contract** — a markdown rule under `build/shared/`. Humans enforce it. This is how we agree that Dev A owns `middleware.ts` or that `package.json` edits need both devs' approval.

The split exists because the compiler can enforce one but not the other. If you find yourself writing prose in a `.ts` file or types in a `.md` file, you have the wrong file open.

## When to read what

| If you are about to… | Read first |
|---|---|
| Start a new step in your buildflow | `build/dev-{a,b}/buildflow.md` step entry |
| Touch another dev's folder | `build/shared/ownership.md` (you probably should not) |
| Add or change a shared type | `build/contracts/README.md` change protocol, then edit the `.ts` |
| Open a PR | `build/shared/conventions.md` "Pull Requests" |
| Add a migration | `build/shared/ownership.md` "Migration Ownership" + `conventions.md` "Migration numbering" |
| Declare a phase complete | `build/shared/buildflow.md` "Completion Gate" for that phase |
| File a blocker | `build/shared/ownership.md` "Blocking Policy" first; only log it if it qualifies |

## What this file is NOT

- Not a buildflow. Phase steps live in `build/shared/buildflow.md` and the dev buildflows.
- Not a place to put new prose contracts. New ownership rules belong in `ownership.md`; new typed contracts belong in `build/contracts/*.ts`.
- Not authoritative on its own — every row in the table above points at the file that IS authoritative.

If something is missing from the table above, that means the concern is unowned. File it as a blocker.
