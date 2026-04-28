# Likit — Auctus V2 Shared Workspace
## Branches: `develop` → `main` release gates

> This workspace is the filled Likit workflow for **shared Auctus V2 work** used by Aaryan and Priyan together.
> It mirrors the locked project decisions from the copied source docs now stored under `codex/references/`. It must not redefine product scope, architecture, ownership, or design direction.

Read at session start:
- `codex/Codex_guide.md` — shared coordination rules, habits, and red lines
- `codex/ProjectSummary.md` — full Auctus V2 architecture and locked decisions
- `codex/Progress.md` — current gate, current phase, blockers

Load on demand only:
- `codex/BuildFlow.md` — when entering a new phase or running `/phase-check`
- `codex/Migration.md` — when deciding direct-main vs workspace-draft execution and when closing a phase
- `codex/G0_questionnaire.md` — completed shared-workspace questionnaire
- `codex/_fill_manifest.md` — canonical filled source record
- `codex/references/README.md` — copied source-doc index
- `codex/references/build/shared/*` — ownership, conventions, bootstrap, shared V2 buildflow
- `codex/references/build/contracts/*` — typed contract source of truth
- `codex/references/build/dev-a/*` — Dev A execution and progress docs
- `codex/references/build/dev-b/*` — Dev B execution and progress docs
- `codex/references/claude/*` — legacy/product context, not phase authority

Operate in **Senior Mentor Mode** and keep this workspace limited to genuinely shared work.

Commands: `/progress-log` | `/progress-save` | `/phase-check` | `/phase-explain` | `/step-explain`

---

## Workspace Boundary

This workspace is for **shared tasks only**.

- Valid scope: shared bootstrap, branch/release rules, contract-change protocol, shared-file PR planning, release gates, shared QA, migration logs, release notes, coordination docs
- Import/reference scope: Dev A and Dev B buildflows, progress trackers, and typed contracts
- Off-limits as routine work: implementing normal Dev A-owned or Dev B-owned feature code from this workspace

If a task belongs clearly to Dev A or Dev B ownership, move it back to that space. Shared-space is not a bypass around ownership.

Implementation normally lands in the real project, not inside this space folder. Use `codex/Migration.md` to choose the execution mode and to close the phase correctly.

---

## Gate System

Every phase (P1-P17) has a corresponding gate (G1-G17). **G[N] = P[N].** Nothing proceeds until its gate passes.

- Each gate has pass conditions; every condition must be true
- Codex verifies conditions before declaring a gate passed
- Gates are sequential: G0 → G1 → ... → G17
- Blocked gate = stop, name the unmet deliverable, work on only that

---

## G0 — Project Setup

**Status check — G0 is incomplete if ANY of these are true:**
- `ProjectSummary_web.md`, `ProjectSummary_systems.md`, or `ProjectSummary_creative.md` still exist
- `ProjectSummary.md`, `BuildFlow.md`, `Progress.md`, `Codex_guide.md`, `G0_questionnaire.md`, or `_fill_manifest.md` still contain placeholders or contradict the copied source docs
- Required copied references under `codex/references/` are missing
- The workspace stops matching the shared authority defined in `codex/references/build/shared/*.md`

**If G0 incomplete →** load `codex/G0_questionnaire.md` and repair from the earliest broken section.
**If G0 passed →** skip to Session Start.

---

## Session Start (G0 passed)

1. Determine current gate from `codex/Progress.md`
2. Report: current gate, checked vs unchecked items, named blocker if any, next proof target, migration mode for the active phase
3. Resume work on the current gate only
4. Re-open copied source docs when a decision touches ownership, contracts, branch rules, release gates, or QA

---

## G1-G17 — Gate Pass Protocol

Before declaring any phase complete:

1. Read `codex/Progress.md` — all checkboxes for the phase must be `[x]`
2. Verify commit or PR reference: `git log --oneline -1` when code/docs landed, or the named PR/release reference when the work is coordination-first
3. If phase has tests or workflows: confirm the required command output is passing
4. If phase has shared files/contracts/releases: verify the required owner/reviewer approvals or handoff notes exist
5. Verify the phase migration checkbox in `Progress.md` was satisfied according to `codex/Migration.md`
6. Require proof from the developers; never accept "done" without the artifact, command output, or release note listed in `codex/BuildFlow.md`

**If all met:** update `Progress.md` to `[complete]`, advance Current Phase, announce the next gate.
**If any unmet:** list what is missing. Do not advance.

### Skip prevention

If the user says "skip to", "move ahead", or "do the later phase first":

> "Gate G[N] is blocking. Unmet: [list]. We cannot proceed until those items pass. Pick the next proof item inside the current gate."

Exception: none. Shared-space exists to reduce confusion, not create parallel unofficial release flow.

---

## Gate State Tracking

`codex/Progress.md` is source of truth. Status is derived from:
- phase status tag: `[not started]` | `[in progress]` | `[complete]`
- checkbox state: `[ ]` vs `[x]`

Codex never checks a box without proof.
