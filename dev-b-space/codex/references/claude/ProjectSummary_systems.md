# [PROJECT_NAME] — Project Summary (Systems / CLI / Pipeline)

> [TAGLINE]

**Purpose:** [WHAT it does, WHO runs it, WHEN/WHY they run it — 2-3 sentences]

---

## System Overview
```
[ASCII diagram — show data/control flow]
[e.g., Input Source → Parser → Transformer → Validator → Output Sink]
[e.g., CLI command → Config loader → Core engine → Reporter]
```
**Core Constraint:** [The one thing that MUST work correctly above all else]

---

## Entry Points
| Entry point | Type | Description |
|-------------|------|-------------|
| [e.g., `run`] | [CLI command / cron / event / import] | [what it triggers] |
| [e.g., `--dry-run` flag] | [CLI flag] | [what it modifies] |

---

## Core Modules
| Module | Responsibility | Depends on |
|--------|---------------|------------|
| [e.g., parser] | [reads and validates input] | [config] |
| [e.g., transformer] | [applies business logic] | [parser] |
| [e.g., reporter] | [formats and outputs results] | [transformer] |

[Each module should do ONE thing. If a module's description needs "and", split it.]

---

## Data Flow
```
Step 1: [Input — what comes in, format, source]
Step 2: [Validation — what is checked, what is rejected]
Step 3: [Transform — what logic is applied]
Step 4: [Output — what is produced, format, destination]
```

---

## External Dependencies
| Dependency | Purpose | Failure behaviour |
|------------|---------|-------------------|
| [e.g., Postgres DB] | [reads user records] | [fail fast with clear error] |
| [e.g., Third-party API] | [enriches data] | [skip + log, do not halt] |
| [e.g., filesystem path] | [reads config file] | [fail fast if missing] |

---

## Configuration
| Key | Source | Description | Required |
|-----|--------|------------|---------|
| [CONFIG_KEY] | [env var / config file / CLI flag] | [what it controls] | [yes/no] |

[Every required config must have a startup guard — if missing, the program refuses to run.]

---

## Output / Artifacts
| Output | Format | Destination |
|--------|--------|-------------|
| [e.g., report] | [JSON / CSV / stdout] | [file path / API / terminal] |
| [e.g., logs] | [structured JSON] | [stdout / file] |

---

## Error Handling Strategy
- **Fail fast:** [which errors abort immediately — e.g., missing config, invalid input schema]
- **Skip and log:** [which errors are non-fatal — e.g., one bad record in a batch]
- **Retry:** [which operations retry, how many times, backoff strategy]
- **Exit codes:** [0 = success, 1 = runtime error, 2 = bad input — define yours]

---

## Testing Strategy
| Layer | Tool | What it covers |
|-------|------|----------------|
| Unit | [Jest / pytest / Go test] | Pure transform/parse functions |
| Integration | [depends on stack] | Full pipeline with real/stubbed dependencies |
| Fixture data | [describe] | Sample inputs covering happy path + edge cases |

---

## File Structure
```
root/
├── src/
│   ├── cli/           # Entry points / argument parsing
│   ├── config/        # Config loading + validation
│   ├── core/          # Business logic / engine
│   ├── io/            # Readers, writers, external calls
│   └── utils/         # Pure helpers
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/      # Sample input data
├── claude/
└── .claude/commands/
```

---

## Environment / Config Variables
| Key | Description | Required |
|-----|------------|---------|
| [KEY] | [description] | [yes/no] |
