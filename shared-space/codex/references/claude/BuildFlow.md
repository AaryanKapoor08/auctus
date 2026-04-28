# Build Flow

> Phase done = checkpoint passes, not code written.
> Each phase has a **Proof** line — what the student must demonstrate to pass the gate.

## Prerequisites
- [FILLED BY G0.6 — tools, versions, what NOT to install until which phase]

---

## P1 — Repo Setup `[GATE G1]`
**Goal:** Clean repo, .gitignore, folder structure, dependency setup
- [ ] Conventional initial commit
- [ ] .gitignore covers build artifacts, secrets, deps
- [ ] Folder structure matches ProjectSummary
- [ ] Config/env example file with all keys
- [ ] Dependencies install cleanly
**Proof:** `git log --oneline -1` shown. .gitignore contents shown. [G0.6 fills project-specific proof]

## P2 — [Data Layer] `[GATE G2 — requires G1]`
**Goal:** [G0.6 fills]
- [ ] [G0.6 fills]
- [ ] Config comes from env, not hardcoded
- [ ] Connection / access test passes
**Proof:** [G0.6 fills]

## P3 — [Data Setup] `[GATE G3 — requires G2]`
**Goal:** [G0.6 fills]
- [ ] [G0.6 fills]
- [ ] Repeatable without side effects
- [ ] Relationships / references intact
**Proof:** [G0.6 fills]

## P4 — [Core Entry Point] `[GATE G4 — requires G3]`
**Goal:** [G0.6 fills]
- [ ] [G0.6 fills]
- [ ] Basic health / smoke test passes
- [ ] Error path returns meaningful output
**Proof:** [G0.6 fills]

## P5 — [Core Logic + Tests] `[GATE G5 — requires G4]`
**Goal:** [G0.6 fills] + integration tests
- [ ] [G0.6 fills]
- [ ] Integration tests pass
- [ ] Invalid input handled correctly
**Proof:** Full test output shown. All passing.

## P6 — [Service / Module Extraction] `[GATE G6 — requires G5]`
**Goal:** Business logic extracted into testable units, test-first
- [ ] Core logic is pure where possible
- [ ] Unit tests pass
- [ ] Entry points are thin (delegate to services/modules)
**Proof:** Unit test output shown. Entry point reviewed — no business logic present.

## P7 — [Interface Skeleton] `[GATE G7 — requires G6]`
**Goal:** [G0.6 fills]
- [ ] [G0.6 fills]
- [ ] Navigates between primary sections
- [ ] Connects to core layer successfully
**Proof:** [G0.6 fills]

## P8 — [Main Feature] `[GATE G8 — requires G7]`
**Goal:** Primary user-facing feature working end-to-end with real data
- [ ] Works with real data (not stubs)
- [ ] Handles failure gracefully
- [ ] Meets core constraint from ProjectSummary
**Proof:** Feature demonstrated with real data. Failure case shown.

## P9 — [Secondary Features] `[GATE G9 — requires G8]`
**Goal:** [G0.6 fills]
- [ ] [G0.6 fills]
- [ ] Edge cases handled
- [ ] No regressions in primary feature
**Proof:** [G0.6 fills]

## P10 — [Auth / Access Control] `[GATE G10 — requires G9]`
**Goal:** [G0.6 fills]
- [ ] [G0.6 fills]
- [ ] Unauthorised access rejected
- [ ] Auth tests pass
**Proof:** Full auth flow demonstrated. Rejection case shown. Test output shown.

## P11 — [Integrations] `[GATE G11 — requires G10]`
**Goal:** [G0.6 fills]
- [ ] Works end-to-end
- [ ] Failure of external service handled
- [ ] [G0.6 fills verification]
**Proof:** Integration demonstrated. Failure case tested.

## P12 — [User-Scoped View] `[GATE G12 — requires G11]`
**Goal:** [G0.6 fills]
- [ ] Data / state scoped correctly to user or context
- [ ] No cross-context data leaks
- [ ] Loads within acceptable time
**Proof:** Demonstrated with at least two distinct users/contexts.

## P13 — [Environment] `[GATE G13 — requires G12]`
**Goal:** [G0.6 fills]
- [ ] [G0.6 fills]
- [ ] Matches expected behaviour from earlier phases
- [ ] Clean setup and teardown
**Proof:** [G0.6 fills]

## P14 — [Performance] `[GATE G14 — requires G13]`
**Goal:** [G0.6 fills]
- [ ] Measurable improvement shown
- [ ] Invalidation / refresh works
- [ ] Graceful when optimisation layer is absent
**Proof:** Before/after measurement shown.

## P15 — [Deploy — Backend / Core] `[GATE G15 — requires G14]`
**Goal:** [G0.6 fills]
- [ ] Live and reachable
- [ ] All core functionality works in production environment
- [ ] Secrets / config in host env only
**Proof:** Live access demonstrated. Core function tested in production.

## P16 — [Deploy — Frontend / Client] `[GATE G16 — requires G15]`
**Goal:** [G0.6 fills]
- [ ] Loads / runs at production target
- [ ] Connects to production backend / services
- [ ] Auth / state works in production
**Proof:** Production URL or store listing accessed. End-to-end flow confirmed.

## P17 — [CI/CD] `[GATE G17 — requires G16]`
**Goal:** Automated test and deploy pipeline
- [ ] Push triggers test run
- [ ] Merge to main triggers deploy
- [ ] Failed tests block deploy
**Proof:** CI run shown (triggered by PR). Deploy trigger confirmed.
