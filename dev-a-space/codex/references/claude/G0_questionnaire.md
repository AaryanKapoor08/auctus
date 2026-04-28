# G0 — Project Setup Questionnaire

> Loaded on demand by CLAUDE.md when G0 is incomplete.
> 6 sub-gates, each must pass in order.

---

## G0.1 — Identity
Ask. Wait. Do NOT proceed until all answered.
```
1. Project name?
2. One-line description — what does it do and for whom?
3. What problem does it solve? (who uses it, what pain)
4. Project type? (portfolio / production / learning / side project)
```
**Pass:** All 4 answered. Confirm: "Here's what I have for identity: [summary]. Correct?" User confirms → G0.2.

---

## G0.2 — Developer Profile
Ask. Wait. Do NOT proceed until all answered.
```
1. Your name?
2. Experience level? (beginner / intermediate / advanced)
3. Languages and frameworks you're comfortable with?
4. What are you NOT experienced with yet?
5. What should you be able to do independently by the end of this project?
```
**Pass:** All 5 answered. Confirm summary. User confirms → G0.3.

---

## G0.3 — Architecture + Category Detection
Ask. Wait. Do NOT proceed until all answered.
```
1. What are you building? Describe in plain terms — not the tech, the thing itself.
2. Tech stack? (all tools, languages, frameworks, services)
3. How do the pieces connect? Describe data/control flow.
4. Key architecture decisions and WHY each.
5. What does your data look like? (models, schemas, files, datasets)
6. Config or environment variables needed?
```

Classify into exactly one category:

| Category | Classify as this if… |
|----------|----------------------|
| **web** | Frontend (browser UI) + backend + database. Includes SPAs, full-stack apps. API-only projects with a database also belong here. |
| **systems** | No browser UI. CLI tool, script, pipeline, library, batch job, automation, or background service. |
| **creative** | Game engine (Unity, Godot), mobile framework (Flutter, React Native, Swift, Kotlin), or desktop GUI (Electron, Tauri, wxPython). |

State: "Based on your answers, this is a **[category]** project. I'll use the [category] template. Correct?"

**Pass:** All 6 answered. Category confirmed. No contradictions. → G0.4.

---

## G0.4 — Features & Structure
Ask the question set for the locked category. Wait until all answered.

**web:**
```
1. Core features — bullet list, one line each
2. Frontend pages — name, route, auth level (public / protected / optionalAuth)
3. API routes — method, path, auth level, purpose
4. Core constraint — what MUST work above all else?
5. Third-party integrations? (webhooks, external APIs, OAuth)
```
Pass: Every feature → at least one route. Every route → a model.

**systems:**
```
1. Core features / capabilities — bullet list, one line each
2. Entry points — how is it invoked? (CLI, cron, event, import, API trigger)
3. Core modules — main components and what each does
4. Data flow — what comes in, transforms, comes out
5. External dependencies — files, DBs, APIs it reads/writes
```
Pass: Every feature → a module. Every module → clear input and output.

**creative:**
```
1. Core features / gameplay / interactions — bullet list, one line each
2. Screens or scenes — name, purpose, navigation to/from
3. Core systems or modules — main components and what each does
4. State — what persists and where
5. External services? (auth, leaderboard, push notifications, analytics, IAP)
```
Pass: Every feature → a screen or system. State persistence defined.

Confirm summary. User confirms → G0.5.

---

## G0.5 — Constraints & Red Lines
Ask the question set for the locked category. Wait until all answered.

**All categories:**
```
1. What must NEVER happen in this project? (project-specific red lines)
2. Performance constraints? (speed, size, memory, concurrent users)
3. Anything else I should know?
```

**Web additionally:** `4. Routes that must NEVER have auth?` `5. Routes that must ALWAYS have auth?`
**Systems additionally:** `4. Which errors: fail fast vs skip-and-log vs retry?` `5. Exit codes?`
**Creative additionally:** `4. Platform constraints? (bundle size, min OS, device targets)` `5. What must NEVER break the core loop?`

**Pass:** All answered. No contradictions with G0.4. Confirm summary. User confirms → G0.6.

---

## G0.6 — Critique, Cross-Check, Finalize

> **Model recommendation:** Tell the user: "G0.6 is the most complex step. For best results, switch to the most capable model available (`/model`). You can switch back after verification." Proceed after acknowledgement.

Complete ALL steps in order.

**Step 1 — Critique.** Find and present every issue:
- *All:* contradictions across G0.1–G0.5, missing definitions, scope gaps, config/secret issues
- *Web:* security holes (admin routes without auth), models with no route, routes with no model
- *Systems:* modules with undefined I/O, external deps with no failure behaviour, missing exit codes
- *Creative:* orphaned screens, state without persistence, external services without fallback

**Step 2 — Resolve.** Discuss until EVERY concern is resolved.

**Step 3 — Cross-check.**
- *Web:* feature → route → model → auth rule consistency
- *Systems:* feature → module → I/O → failure behaviour → exit codes
- *Creative:* feature → screen/system → navigation → persistence → fallback
- *All:* phases cover all features, red lines cover all constraints

**Step 4 — Final summary.** Present: name + tagline + category, stack, structure, phases, red lines. Ask: "Confirm to generate all files?"

**Step 5 — User confirms.** Explicit confirmation only.

**Step 6 — Write `claude/_fill_manifest.md`.** Fill every section from G0.1–G0.5 answers. Actual values only — no placeholders. Must contain: IDENTITY, DEVELOPER, TECH STACK, COMMIT CONFIG, ARCHITECTURE DECISIONS, DATA/STRUCTURE, SEED/FIXTURES, CORE LOGIC, FEATURES, ROUTES/ENTRY POINTS, RED LINES, ENV VARS, PHASES (each with name, goal, checkboxes, proof, commit). Do not touch other files until manifest is complete.

**Step 7 — User reviews manifest.** "Review the fill manifest. Correct anything before I generate files." Wait for confirmation.

**Step 8 — Generate files from manifest.** One at a time, in order:
1. **ProjectSummary.md** — select template by category, fill, save as `ProjectSummary.md`, delete unused templates
2. **Claude_guide.md** — developer profile, scopes, TDD targets, red lines from manifest
3. **BuildFlow.md** — all phases with name, goal, checkboxes, proof, commit
4. **Progress.md** — phase names and checkboxes, category noted

At each file: re-read manifest → read template → write. Do not rely on memory.

**Step 9 — Verify.** Read each generated file. Grep for every placeholder pattern listed in CLAUDE.md G0 status check — none may remain. Confirm unused templates deleted. Confirm every BuildFlow phase has a real proof command. Keep `_fill_manifest.md` as reference.

**Step 10 — Store `Claude_guide.md` in memory.**

**G0 pass condition:** Manifest complete. ProjectSummary.md populated. Unused templates deleted. Zero placeholders in any claude/ file. User confirmed manifest before generation.
