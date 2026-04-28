# Migration Workflow

This project uses the space folders as **planning and control planes**, not as long-lived duplicate codebases.

The least confusing workflow is:

1. Read and track the phase in the relevant space's `codex/` docs.
2. Decide whether the phase should be executed directly in the real project or drafted in the space first.
3. Close the phase only after the corresponding migration checkbox in `Progress.md` is checked.

---

## Two Valid Execution Modes

### 1. Direct-main execution mode

Use this by default for:
- normal app code changes
- migrations
- tests
- shared-file edits that are clearly owned and already approved by the workflow

What it means:
- implementation happens directly in the real project outside the space folder
- the space folder remains the source of planning, proofs, and phase tracking
- the phase's migration checkbox is satisfied by recording that the work already landed directly in the main project

Record for the migration checkbox:
- target path(s) in the real project
- verification command or proof
- commit hash or PR reference

### 2. Workspace-draft mode

Use this only when drafting inside the space is less confusing than touching the real project immediately, for example:
- release notes
- QA checklists
- source-verification docs
- PR text
- risky SQL drafts or scraper reconnaissance notes that need review before landing

What it means:
- draft the artifact inside the space first
- once approved, copy or adapt it into the real project
- the phase's migration checkbox is satisfied only after the real-project copy exists and is verified

Record for the migration checkbox:
- space source path
- real project target path
- verification command or proof
- commit hash or PR reference

---

## Default Rule by Workspace

- `dev-a-space`: default to direct-main execution for Dev A-owned code; use workspace-draft mode for notes, QA artifacts, or review text only.
- `dev-b-space`: default to direct-main execution for Dev B-owned code and ETL code; use workspace-draft mode for source-verification notes, release notes, or risky drafts only.
- `shared-space`: usually direct-main execution for approved shared-file work, or workspace-draft mode for shared docs, release checklists, and QA matrices.

Never maintain two live versions of the same app code on purpose. If the real project already has the canonical implementation, the space folder should only point to it and record proof, not fork it.

---

## Phase-Close Checklist

Every phase must satisfy all of these before its migration checkbox can be checked:

1. The phase proof in `BuildFlow.md` has passed.
2. The execution mode is named: `direct-main` or `workspace-draft`.
3. The real-project target path(s) are named.
4. Verification was run against the real-project result.
5. A commit hash or PR reference exists.

Suggested note format in `Progress.md` or session notes:

```text
Migration record:
- mode: direct-main
- target: app/dashboard/page.tsx, lib/funding/queries.ts
- verify: npm test && npm run build
- reference: <commit-or-pr>
```

---

## What Not To Do

- Do not build a second permanent app implementation inside a space folder.
- Do not mark a phase complete if the draft exists only in the space and has not been applied or intentionally recorded as direct-main work.
- Do not copy files back into the main project blindly; verify ownership and target paths first.
- Do not use the shared space to bypass Dev A / Dev B ownership boundaries.
