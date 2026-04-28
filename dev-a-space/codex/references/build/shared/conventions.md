# Conventions

Coordination rules for V2. Branching, PRs, commits, migrations, tests.

---

## Branching

- `main` is reserved for **stable milestones** only. Each V2 phase completion gate produces one merge into `main`.
- `develop` is the **integration buffer**. All feature work merges into `develop` first.
- Feature branches: `dev-a/<short-description>` or `dev-b/<short-description>`. Examples: `dev-a/auth-supabase`, `dev-b/funding-listing`. Branched from `develop`, PR'd into `develop`.
- Shared bootstrap branches: `shared/<short-description>` (used in V2.P1 only). Branched from `develop`, PR'd into `develop`.
- No direct pushes to `main` or `develop`. Every change goes through a PR.

### Promotion to `main`

A `develop` → `main` PR happens at each phase completion gate. The PR title is `release: V2.PN complete`. Both devs approve. The merge into `main` is the canonical "phase shipped" event.

### Initial setup

The repo currently does not have a `develop` branch (it was created fresh today). The first action of V2.P1 is for Aaryan (Dev A) to create `develop` from `main` and push it. Branch protection on both `main` and `develop` should be set up at the same time.

## Pull Requests

- PR title uses the same commit format as below: `type(scope): description`.
- PR base branch: `develop` for feature work; `main` only for phase-completion releases (`develop` → `main`).
- PR body must include:
  - The V2 phase number this work belongs to (`V2.P2`, `V2.P3`, etc.).
  - Which buildflow step this completes (e.g., "Dev A Step 2 — Identity Foundation").
  - Any contract change (point at `build/contracts/*.ts` diff).
- **Same-domain PR:** owner self-merges into `develop` after CI green.
- **Shared-file PR** (anything in `build/shared/ownership.md` "Frozen unless coordinated"): requires the other dev's approval.
- **Cross-domain PR** (touches the other dev's owned folders): requires the owner's approval. Strongly preferred: file an issue and let the owner do the work.
- **Phase-completion PR** (`develop` → `main`): both devs approve.

## Commits

Format: `type(scope): description`. Imperative, present tense, ≤ 72 chars.

Allowed types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`.

Scope examples: `auth`, `funding`, `forum`, `profile`, `matching`, `scraper`, `db`, `ci`, `restructure`.

Examples:

```
feat(auth): add Supabase Google OAuth callback
feat(funding): add list-by-role query helper
chore(restructure): split mixed demo files and create domain folders
fix(forum): replies persist after page reload
docs(contracts): lock profile and session shapes
```

## Migration numbering

`supabase/migrations/NNNN_description.sql` where `NNNN` is a 4-digit zero-padded integer.

When you need a new number:

1. Check the latest committed number in `supabase/migrations/` AND the latest open PR adding a migration.
2. Take the next integer.
3. If a collision happens at merge time (you both took `0007`), the second-merger renumbers in a one-commit fixup.

The owner ranges in `ownership.md` are the **default** ranges. Crossing a range needs a one-line note in your PR.

## Tests

- `npm test` — Vitest (unit/integration).
- `npm run test:watch` — Vitest watch mode.
- `npm run lint` — ESLint.
- `npm run build` — Next.js build.
- (Future) `npm run e2e` — Playwright once added.

Required for PR merge: `lint`, `build`, `test` all green via CI.

Required for buildflow phase completion: phase-specific tests listed in each dev's buildflow under "Tests" per step.

## Contract changes

Defined in `build/contracts/README.md`. Summary:

1. PR edits the `.ts` file.
2. Other dev approves.
3. PR description names the gate at which the change becomes effective.
4. Both dev `progress.md` files get a one-line entry under "Contract changes consumed."

## Working in shared files

If you must touch a "frozen unless coordinated" file:

1. Open a single-purpose PR with just that change.
2. Tag the other dev as required reviewer.
3. Wait for approval before merge — even if CI is green.

## When you are blocked

1. Check whether the blocker is in `ownership.md` "Allowed blockers."
2. If yes: log it in your `progress.md` "Blockers" section with the named missing deliverable.
3. If no: do not wait. Pick another step in your buildflow that does not depend on the missing piece.

## Deploy gates

- The repo is **not currently deployed** to any hosting provider. There is no production exposure during the V2 build.
- `main` is reserved for stable milestones (one merge per V2 phase completion). `develop` is the working integration branch.
- Demo routes under `/(demo)/` are kept working in dev but explicitly out of V2 scope.
- During V2.P2-P4 the new identity and funding features will be reachable in dev but unfinished. That is acceptable as long as `npm run build` succeeds on every PR and no V1 demo regressions ship.
- When deployment is wired up later (likely Vercel; out of current scope), promote from `main` only — never from `develop` or feature branches. Update this section at that time.
