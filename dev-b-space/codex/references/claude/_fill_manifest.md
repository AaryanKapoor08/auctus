# Fill Manifest
# Generated during G0.6. This is the single source of truth for all file generation.
# Claude writes this FIRST, user reviews and corrects HERE, then Claude fills all templates from this.
# Do not touch any template file until this manifest is confirmed by the user.

---

## IDENTITY
name: [project name]
tagline: [one sentence — what it does and for whom]
problem: [2-3 sentences — who is the user, what pain, why it matters]
type: [portfolio / production / learning / side]
category: [web / systems / creative]
core_constraint: [the one thing that must work above all else]

---

## DEVELOPER
dev_name: [name]
dev_level: [beginner / intermediate / advanced]
dev_knows: [languages and frameworks they're comfortable with]
dev_gaps: [what they are not experienced with yet]
dev_goal: [what they should be able to do independently by the end]

---

## TECH STACK
# Remove rows that don't apply. Add rows for anything not listed.
| Layer | Technology | Host |
|-------|-----------|------|
| [e.g. Frontend] | [e.g. React + Vite] | [e.g. Vercel] |
| [e.g. Backend] | [e.g. Node + Express] | [e.g. Render] |
| [e.g. Database] | [e.g. MongoDB Atlas] | [e.g. Atlas] |
| [e.g. Cache] | | |
| [e.g. Auth] | | — |
| [e.g. CI/CD] | | — |

---

## COMMIT CONFIG
scopes: [comma-separated list — e.g. auth, api, ui, db, docker, ci, seed]
tdd_targets: [pure functions that need test-first — e.g. buildSankeyData, validateInput]
docker_phase: [phase number when Docker is introduced]
ci_phase: [phase number when CI/CD is introduced]

---

## ARCHITECTURE DECISIONS
# One block per decision. Add as many as needed.
D1_title: [e.g. JWT in Authorization header, not cookies]
D1_decision: [what was chosen]
D1_why: [why this over the alternative]

D2_title:
D2_decision:
D2_why:

---

## DATA / STRUCTURE
# web → data models
# systems → modules with input/output
# creative → screens/scenes + systems

### web: Models
# Format: ModelName | field: Type required/optional default/enum/ref | ...
model_1: [ModelName | field1: Type | field2: Type | ...]
model_2:

### systems: Modules
# Format: ModuleName | input: description | transform: description | output: description
module_1:
module_2:

### creative: Screens + Systems
# Format: ScreenName | purpose | navigates_to | auth_required
screen_1:
screen_2:
# Format: SystemName | responsibility | key_interactions
system_1:
system_2:

---

## SEED / FIXTURES / TEST DATA
strategy: [what gets seeded, how many records, realistic vs synthetic, idempotency approach]

---

## CORE LOGIC
# Main business logic — aggregation pipeline, calculation, data transform, game loop, etc.
logic: [step-by-step description]

---

## FEATURES
feature_1: [one line]
feature_2:
feature_3:
# Add as needed

---

## ROUTES / ENTRY POINTS / SCREENS

### web: Routes
# Format: METHOD /path | auth_level | purpose
public_routes:
  - GET /api/health | public | health check
  - [add routes]

auth_routes:
  - POST /api/auth/register | public | create user, return token
  - POST /api/auth/login | public | verify credentials, return token

protected_routes:
  - [add routes]

### systems: Entry Points
# Format: command/trigger | type | what it does
entry_1:
entry_2:

### creative: Screens
# Already covered in DATA/STRUCTURE section above

---

## RED LINES
# Project-specific things that must NEVER happen
redline_1:
redline_2:
redline_3:
# Add as needed

---

## ENV VARS
# Format: KEY | description | required (yes/no)
env_1: [KEY] | [description] | [yes/no]
env_2: [KEY] | [description] | [yes/no]
# Add as needed

---

## PHASES
# One block per phase. Names and proofs are project-specific — fill precisely.
# proof = exact command(s) the student must run and show output for to pass the gate

phase_1_name: Repo Setup
phase_1_goal: Clean repo, .gitignore, folder structure, deps installed
phase_1_checkboxes:
  - Conventional initial commit
  - .gitignore covers secrets, deps, build artifacts
  - Folder structure matches ProjectSummary
  - Config/env example file with all keys
  - Dependencies install cleanly
phase_1_proof: Show `git log --oneline -1`. Show .gitignore contents.
phase_1_commit: chore(init): initialise project structure

phase_2_name: [e.g. MongoDB Setup]
phase_2_goal:
phase_2_checkboxes:
  -
  -
phase_2_proof:
phase_2_commit:

phase_3_name:
phase_3_goal:
phase_3_checkboxes:
  -
  -
phase_3_proof:
phase_3_commit:

# Continue for all phases...
