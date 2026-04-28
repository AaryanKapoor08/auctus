# Progress

**Current Gate:** G0 (Project Setup)
**Current Phase:** —
**Project Category:** [web / systems / creative — set by G0.3]
**Last Updated:** [DATE]
**Session Notes:** [status]

> Each gate (G) corresponds to a phase (P): G1 = P1, G2 = P2, etc.
> ALL checkboxes must be `[x]` with proof shown to pass a gate.

---

## G0 — Project Setup `[not started]`
- [ ] G0.1 Identity — all questions answered + confirmed
- [ ] G0.2 Developer Profile — all questions answered + confirmed
- [ ] G0.3 Architecture + category detected + confirmed
- [ ] G0.4 Features & Structure — all questions answered + confirmed
- [ ] G0.5 Constraints & Red Lines — all questions answered + confirmed
- [ ] G0.6 Critique + cross-check — all concerns resolved
- [ ] G0.6 Fill manifest — all fields populated, user confirmed
- [ ] G0.6 Files generated — ProjectSummary, Claude_guide, BuildFlow, Progress
- [ ] G0.6 Verification — zero placeholders in any claude/ file
- [ ] Unused ProjectSummary templates deleted

---

## P1 — Repo Setup `[locked — requires G0]`
- [ ] Conventional initial commit
- [ ] .gitignore covers secrets, deps, build artifacts
- [ ] Folder structure matches ProjectSummary
- [ ] Config/env example file with all keys
- [ ] Dependencies install cleanly

## P2 — [Data Layer] `[locked — requires P1]`
- [ ] [G0.6 fills]
- [ ] Config from env, not hardcoded
- [ ] Connection / access test passes

## P3 — [Data Setup] `[locked — requires P2]`
- [ ] [G0.6 fills]
- [ ] Repeatable without side effects
- [ ] Relationships / references intact

## P4 — [Core Entry Point] `[locked — requires P3]`
- [ ] [G0.6 fills]
- [ ] Basic smoke test passes
- [ ] Error path returns meaningful output

## P5 — [Core Logic + Tests] `[locked — requires P4]`
- [ ] [G0.6 fills]
- [ ] Integration tests pass
- [ ] Invalid input handled

## P6 — [Service / Module Extraction] `[locked — requires P5]`
- [ ] Core logic pure where possible
- [ ] Unit tests pass
- [ ] Entry points are thin

## P7 — [Interface Skeleton] `[locked — requires P6]`
- [ ] [G0.6 fills]
- [ ] Navigates between sections
- [ ] Connects to core layer

## P8 — [Main Feature] `[locked — requires P7]`
- [ ] Works with real data
- [ ] Handles failure gracefully
- [ ] Meets core constraint

## P9 — [Secondary Features] `[locked — requires P8]`
- [ ] [G0.6 fills]
- [ ] Edge cases handled
- [ ] No regressions

## P10 — [Auth / Access Control] `[locked — requires P9]`
- [ ] [G0.6 fills]
- [ ] Unauthorised access rejected
- [ ] Auth tests pass

## P11 — [Integrations] `[locked — requires P10]`
- [ ] Works end-to-end
- [ ] External failure handled
- [ ] [G0.6 fills verification]

## P12 — [User-Scoped View] `[locked — requires P11]`
- [ ] Data scoped correctly
- [ ] No cross-context leaks
- [ ] Acceptable load time

## P13 — [Environment] `[locked — requires P12]`
- [ ] [G0.6 fills]
- [ ] Matches earlier phase behaviour
- [ ] Clean setup and teardown

## P14 — [Performance] `[locked — requires P13]`
- [ ] Measurable improvement shown
- [ ] Invalidation works
- [ ] Graceful without optimisation layer

## P15 — [Deploy — Backend / Core] `[locked — requires P14]`
- [ ] Live and reachable
- [ ] Core functionality works in production
- [ ] Secrets in host env only

## P16 — [Deploy — Frontend / Client] `[locked — requires P15]`
- [ ] Loads at production target
- [ ] Connects to production services
- [ ] Auth / state works in production

## P17 — [CI/CD] `[locked — requires P16]`
- [ ] Push triggers tests
- [ ] Merge deploys
- [ ] Failed tests block deploy
