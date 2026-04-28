# [APP_NAME] — Project Summary (Web)

> [TAGLINE]

**Problem:** [WHO the user is, WHAT pain this solves, WHY it matters — 2-3 sentences]

---

## System Overview
```
[ASCII diagram — frontend → backend → database → cache etc.]
```
**Core Constraint:** [The one thing that MUST work above all else]

---

## Features
- [Feature 1]
- [Feature 2]
- [Feature 3]

---

## Tech Stack
| Layer | Technology | Host |
|-------|-----------|------|
| Frontend | | |
| Backend | | |
| Database | | |
| Cache | | |
| Auth | | |
| Email | | |
| CI/CD | | |

---

## Architecture Decisions
[D1 — Title: Decision + WHY over the alternative]
[D2 — Title: Decision + WHY]
[Add as needed]

---

## Data Models
```
[ModelName]
  field:   Type     required/optional  default/enum/ref
```
[One block per model]

---

## Seed Data
[Record counts per model. Strategy: realistic vs synthetic. Relationships to preserve. Idempotency approach.]

---

## Core Service Logic
[Main business logic steps — aggregation pipeline, calculation algorithm, data transformation, etc.]

---

## Frontend Pages
| Page | Route | Auth | Guard behaviour |
|------|-------|------|-----------------|
| | | public / protected / optionalAuth | |

---

## API Reference

### Public (no auth)
| Method | Path | Purpose |
|--------|------|---------|
| GET | /api/health | Health check |

### Auth Routes
| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/auth/register | |
| POST | /api/auth/login | |

### Protected (requires auth)
| Method | Path | Purpose |
|--------|------|---------|

---

## File Structure
```
root/
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── services/      # API calls
│       └── utils/
├── server/
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/      # Business logic
│       └── utils/
├── claude/
└── .claude/commands/
```

---

## Environment Variables
| Key | Description | Required |
|-----|------------|---------|
| PORT | Server port | yes |
| NODE_ENV | Environment | yes |
| [DB_URI] | Database connection | yes |
| [JWT_SECRET] | Token signing key | yes |
