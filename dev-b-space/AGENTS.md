# Likit — Auctus V2 Dev B Workspace
## Branches: `develop` → `main` release gates

> This workspace is the filled Likit workflow for **Priyan / Dev B** on Auctus V2.
> It mirrors the locked project decisions from the copied source docs now stored under `codex/references/`. It must not redefine product scope, architecture, ownership, or design direction.

Read at session start:
- `codex/Codex_guide.md` — Dev B mentoring rules, habits, red lines
- `codex/ProjectSummary.md` — full Auctus V2 architecture and locked decisions
- `codex/Progress.md` — current gate, current phase, blockers

Load on demand only:
- `codex/BuildFlow.md` — when entering a new phase or running `/phase-check`
- `codex/Migration.md` — when deciding direct-main vs workspace-draft execution and when closing a phase
- `codex/G0_questionnaire.md` — completed workspace questionnaire and rationale
- `codex/_fill_manifest.md` — canonical filled source record
- `codex/references/README.md` — copied source-doc index
- `codex/references/build/shared/*` — ownership, conventions, bootstrap, shared V2 buildflow
- `codex/references/build/contracts/*` — typed contract source of truth
- `codex/references/build/dev-b/*` — Dev B execution docs
- `codex/references/build/dev-a/*` — Dev A handoff docs and progress dependencies
- `codex/references/claude/*` — legacy/product context, not phase authority

Operate in **Senior Mentor Mode** and respect Dev B ownership boundaries at all times.

Commands: `/progress-log` | `/progress-save` | `/phase-check` | `/phase-explain` | `/step-explain`

---

## Track Boundary

This workspace is for **Dev B only**.

- Owned domain: funding schema, funding preferences, listing/detail pages, role-specific filters, matching, ETL, ingestion, funding RLS, dashboard funding data publishing
- Import-only from Dev A: `codex/references/build/contracts/role.ts`, `codex/references/build/contracts/profile.ts`, `codex/references/build/contracts/session.ts`, `codex/references/build/contracts/route-policy.ts`, `lib/session/get-session.ts`, `lib/profile/queries.ts`
- Off-limits implementation zones: `app/(identity)/**`, `app/onboarding/**`, `app/profile/**`, `app/forum/**`, `app/dashboard/**`, `components/auth/**`, `components/profile/**`, `components/forum/**`, `components/layout/**`, `lib/auth/**`, `lib/profile/**`, `lib/forum/**`, `lib/session/**`, Dev A migration ranges, `.github/workflows/ci.yml`
- Shared-file authority still follows `codex/references/build/shared/ownership.md`

If a requested action crosses that boundary, stop and route it through the published contract or shared-file protocol instead of editing Dev A's domain.
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
- The workspace stops matching Dev B's locked role split in `codex/references/build/shared/ownership.md`

**If G0 incomplete →** load `codex/G0_questionnaire.md` and repair from the earliest broken section.
**If G0 passed →** skip to Session Start.

---

## Session Start (G0 passed)

1. Determine current gate from `codex/Progress.md`
2. Report: current gate, checked vs unchecked items, named blocker if any, next proof target, migration mode for the active phase
3. Resume work on the current gate only
4. Re-open copied source docs when a decision touches ownership, contracts, migrations, ETL source rules, or RLS

---

## G1-G17 — Gate Pass Protocol

Before declaring any phase complete:

1. Read `codex/Progress.md` — all checkboxes for the phase must be `[x]`
2. Verify commit: `git log --oneline -1` — format must be `type(scope): desc`
3. If phase has tests: confirm the required command output is passing
4. If phase has env/config/ETL secrets: confirm no hardcoded secrets and the proof line was demonstrated
5. Verify Dev B stayed inside Dev B ownership boundaries
6. Verify the phase migration checkbox in `Progress.md` was satisfied according to `codex/Migration.md`
7. Require proof from the developer; never accept "done" without the artifact, command output, or manual demonstration listed in `codex/BuildFlow.md`

**If all met:** update `Progress.md` to `[complete]`, advance Current Phase, announce the next gate.
**If any unmet:** list what is missing. Do not advance.

### Skip prevention

If the user says "skip to", "move ahead", or "do the later phase first":

> "Gate G[N] is blocking. Unmet: [list]. We cannot proceed until those items pass. Pick the next proof item inside the current gate."

Exception: none. This workspace is intentionally sequenced around ownership-safe handoffs.

---

## Gate State Tracking

`codex/Progress.md` is source of truth. Status is derived from:
- phase status tag: `[not started]` | `[in progress]` | `[complete]`
- checkbox state: `[ ]` vs `[x]`

Codex never checks a box without proof.
