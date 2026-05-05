# Claude Prompt: AI Enrichment Plan Review

You are reviewing the Auctus V2 AI enrichment plan. Work in read-only review mode unless explicitly instructed otherwise. Do not edit app code, migrations, workflow files, or implementation files during the review.

## Context

Auctus is a Canadian funding discovery app for three roles: business, student, and professor.

The legacy chatbot/demo routes are deferred. Product direction is shifting away from a live chatbot and toward offline AI enrichment of public funding records.

Read:

1. `codex/AIEnrichmentPlan.md`
2. `codex/SoloProgress.md`
3. `codex/Handoff.md`
4. `AGENTS.md`

## Constraints

- Do not invent or preserve a live chatbot requirement.
- Do not send private user/profile/forum/auth data to free-tier AI providers.
- Only public scraped funding text and derived public funding metadata may be sent to AI providers.
- Gemini free tier is for simple public-data extraction only.
- Gemini Flash/Flash-Lite quality is not trusted for judgment-heavy work.
- Gemini 2.5 Flash-Lite is the first primary provider target for one combined row-level enrichment call.
- Gemma may be reviewed as an optional tiny-task/canary helper only; it must not become the primary model for full funding records.
- OpenRouter Nemotron Super can be used as fallback/escalation.
- Do not rely on multiple API keys to bypass rate limits.
- Do not split first release enrichment into six provider calls per row unless quality proof shows one combined call is not viable.
- The enrichment job must run as a rolling 2-3 day queue, not one monthly all-at-once job.
- The scraper remains responsible for raw funding ingestion; AI enrichment runs later.
- Pages must work when enrichment is missing.
- Deterministic logic remains source of truth for role/type filtering, deadlines, amounts, status, URL safety, and match scoring.

## Task

Cross-check `codex/AIEnrichmentPlan.md` for product, technical, privacy, operational, data-model, implementation, and verification gaps.

Then propose concrete updates to `codex/SoloProgress.md` that add post-G12 implementation phases for AI enrichment work.

## Review Areas

1. Product fit: usefulness, misleading copy, unnecessary features.
2. Data/privacy: prompt/log/provider trace leakage, private data boundaries, confidence gating.
3. Provider strategy: Gemini vs OpenRouter roles, rate limits, failover, escalation, spend caps.
4. Scheduling: 2-3 day queue capacity, retries, idempotency, partial-run recovery.
5. Schema: tables, enums, indexes, uniqueness, RLS, cleanup, prompt/schema versioning.
6. Integration boundaries: Dev A/Dev B ownership, `lib/ai/**`, funding/dashboard consumption.
7. Verification: unit tests, SQL-text tests, dry runs, linked DB proof, manual blockers.
8. Rollout: feature flags, hidden/admin-only states, first visible surfaces.
9. Staging: G13-G15 must be completed and proven before semantic search, monthly radar, admin review surfaces, or any chatbot-like work starts.

## Required Output

Return:

### Findings

Issues ordered by severity, with file/path references where possible.

### Missing Decisions

Decisions required before implementation starts.

### Recommended Phase Plan

Post-G12 phases such as:

- G13 — AI enrichment foundation
- G14 — Provider adapters and queue runtime
- G15 — Enrichment outputs in funding UX
- G16 — Semantic search and monthly radar
- G17 — AI release hardening

For each phase include goal, target files, migration mode, checklist items, proof requirements, manual blockers, and verification commands.

### Suggested SoloProgress Patch

Provide exact markdown that can be added to `codex/SoloProgress.md`.

Do not modify files yourself unless explicitly instructed after the review.

## Quality Bar

Be skeptical. Surface risks early, especially hidden costs, data leakage, quota failures, hallucinated metadata, schema drift, provider lock-in, broken fallback UX, and maintainability.
