# G0 — Completed Questionnaire Record

This record was filled from the copied Auctus planning docs, not invented ad hoc.

Primary source order:
- `references/build/shared/buildflow.md`
- `references/build/shared/ownership.md`
- `references/build/shared/bootstrap.md`
- `references/build/shared/conventions.md`
- `references/build/dev-a/buildflow.md`
- `references/build/dev-b/buildflow.md`
- `references/build/gameplan.md`
- `references/build/productvision.md`
- `references/build/resume_session_context.md`
- `references/build/contracts/*.ts`
- `references/claude/CurrentStatus.md`
- `references/claude/*.md` as archived template/mentor context copied from the root `claude/` folder

This shared workspace keeps the **full-project summary** identical to the other spaces. Its execution scope is only the work that is truly shared between Dev A and Dev B.

---

## G0.1 — Identity

1. Project name: `Auctus`
2. One-line description: a real multi-role Canadian funding platform for businesses, students, and professors
3. Problem it solves: the repo must evolve from a demo shell into a real product with clear ownership boundaries, shared contracts, release gates, and migration discipline. The shared workspace handles the cross-cutting bootstrap, contract, release, QA, and coordination work that neither Dev A nor Dev B should own alone.
4. Project type: `production`

---

## G0.2 — Developer Profile

1. Developers: `Aaryan + Priyan`
2. Execution level: `intermediate pair`
3. Comfortable with: TypeScript/Next.js product work, Git PR workflow, role-based split execution
4. Gaps to guard against: shared-file conflicts, vague blockers, undocumented handoffs, release ambiguity, duplicate-work migrations
5. End-state goal: both developers can use the shared workspace to coordinate bootstrap, contracts, releases, and QA without violating domain ownership

---

## G0.3 — Architecture + Category Detection

1. What is being built:
   A shared coordination layer for the same Auctus V2 product. It does not define a new product surface; it governs shared bootstrap, contracts, branch/release gates, shared docs, and QA.
2. Tech stack:
   Same full Auctus V2 stack: Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Supabase, GitHub Actions, cheerio, raw SQL migrations, Vitest.
3. How the pieces connect:
   Dev A and Dev B build in owned domains. Shared docs define ownership, contracts, blockers, and release gates. Shared-space turns those rules into an operational workspace for planning, release, and migration control.
4. Key architecture decisions and why:
   - strict domain ownership
   - typed contracts for integration
   - `develop` as integration buffer and `main` as release target
   - shared bootstrap before parallel feature work
   - shared release gates and third-project QA before final signoff
5. Data in this workspace:
   no new product models; instead it references the full project models and adds coordination artifacts such as migration records, release notes, QA notes, and shared checklists
6. Config or environment variables:
   same three required vars, plus GitHub Actions secret handling for shared workflows

Category result:
- This is a `web` project
- Reason: the shared workspace coordinates the same full-stack web product rather than a separate CLI/pipeline project

---

## G0.4 — Features & Structure

1. Shared workspace functions:
   - bootstrap and branch-protection coordination
   - shared contract lock and change governance
   - release-gate preparation and verification
   - shared QA and third-project validation
   - migration-mode decisions and records
   - shared-file PR planning and review discipline

2. Main shared artifacts:
   - `codex/references/build/shared/*.md`
   - `codex/references/build/contracts/*.ts`
   - `codex/references/build/dev-a/*.md` and `codex/references/build/dev-b/*.md` as handoff references
   - release PR notes, QA logs, migration records, and checklist docs inside `codex/`

3. Core constraint:
   Shared-space must reduce ambiguity, not create a shadow implementation path. It exists to coordinate the real project, not replace Dev A or Dev B workspaces.

4. Third-party/shared integrations:
   - GitHub repo settings and Actions
   - shared Supabase project access and third-project QA setup

---

## G0.5 — Constraints & Red Lines

1. What must never happen:
   - shared-space must never be used to bypass Dev A/Dev B ownership
   - shared-file or contract edits must never land without the required review path
   - release gates must never be treated as complete without named proof
   - migration must never be recorded without real-project targets and verification
2. Performance constraints:
   shared coordination should reduce context-switch cost and release confusion; it should not duplicate or slow normal feature delivery
3. Anything else to know:
   the space-local copied source folders are being replaced by `codex/references/` so the spaces remain self-contained after those copies are removed
4. Routes that must never have auth:
   not applicable to the shared workspace itself
5. Routes that must always have auth:
   not applicable to the shared workspace itself

---

## G0.6 — Critique, Cross-Check, Finalize

### Main issues found and resolved

1. The stock shared-space Likit files were still untouched templates.
2. Shared-space needed to coordinate the full project, not act like a third feature-owner track.
3. Migration needed an explicit direct-main vs workspace-draft rule.
4. The final self-contained workspace needed copied shared references before the space-local `build/` and `claude/` folders could be removed.

### Final result

- Shared-space uses the same full-project `ProjectSummary.md` as the other spaces.
- Shared-space owns only shared bootstrap, contract, release, QA, and migration-control tasks.
- `Migration.md` defines how work closes back into the real project.
- The copied references in `codex/references/` are the retained local source material after the space-local `build/` and `claude/` folders are removed.
