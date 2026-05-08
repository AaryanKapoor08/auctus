# Auctus AI Enrichment Plan

**Date:** 2026-05-05
**Decision:** Remove the legacy chatbot as the AI placeholder. Auctus should present AI as offline enrichment and discovery intelligence, not as a live assistant.
**Review status:** Implementation plan closed locally on 2026-05-08 for G13-G17. G15 real-provider/browser proof remains a deferred manual blocker; Gemma proof work is intentionally paused.

## Product Direction

Auctus does not need a chatbot to justify AI. The useful AI layer is a scheduled enrichment pipeline that improves funding records, search, matching explanations, and data quality.

Use copy such as:

- AI-assisted funding discovery
- AI-enriched funding matches
- Smarter funding search for Canadian businesses, students, and researchers

Avoid implying a real-time AI advisor unless one is actually shipped. Wordmark decision: drop "Auctus AI" now and use "Auctus" in shell/navigation until G15 has visible enrichment surfaces. Product copy may say "AI-assisted" only where the shipped surface is actually AI-enriched.

## Provider Strategy

First release rule: ship G13-G15 as one narrow AI slice before starting semantic search, monthly radar, or chatbot-like work. G13-G15 must prove schema safety, queue safety, and visible funding-page value on real rows before G16/G17 expands the feature set.

Primary provider for the first real run: Gemini 2.5 Flash, for better quality on the first proof run while still staying in the Flash price/performance family. Use one combined enrichment call per funding row instead of six separate task calls. The output can populate multiple fields, but provider work should stay one row-level enrichment request where practical.

The model name "Gemini 2.5 Flash" is a **recommended default**, not a hardcode. Set it in `.env.example` as `AI_GEMINI_MODEL=gemini-2.5-flash`; runtime code reads it via env only.

**Combined-call mechanics.** One job per `(funding_id, content_hash)` enqueues one provider call per attempt. The call returns a single structured response covering all active task types for that row (initial scope: `summary`, `tags`, `checklist`, `match_reasons`, `data_quality`). Per-task outputs are then written as separate `funding_ai_enrichment` rows discriminated by `task_type` so readers can hide a single task without losing the others. The job table tracks the union of task outputs the call will produce, not a single task type — see `ai_enrichment_jobs.task_types` below.

Use Gemini Flash or Flash-Lite for:

- short funding summaries
- first-pass normalized tag suggestions
- application checklist drafts
- obvious data-quality flags
- simple eligibility extraction

Do not rely on Gemini Flash for high-judgment work. Treat its output as low-confidence unless validated against deterministic rules.

Gemma is not used in G13-G15. Its TPM ceiling is too low for full funding records. If a future helper/canary path needs it, add it as a separate provider adapter at that time; do not pre-wire it now.

Fallback/escalation provider: OpenRouter Nemotron Super (`nvidia/nemotron-3-super-120b-a12b`).

Use Nemotron Super for:

- messy eligibility text
- conflicting deadline or amount information
- rows Gemini marks low-confidence
- match-reason quality pass
- final cleanup of monthly role insights

Provider/model strings must be env-driven, not hardcoded:

- `AI_GEMINI_MODEL`
- `AI_OPENROUTER_MODEL`

Do not rotate multiple API keys to bypass rate limits. Gemini limits are per project, not per key, and OpenRouter documents that additional accounts or keys do not change global rate limits. Multiple keys are acceptable for environment separation, credential rotation, or provider failover only.

Never send private user data, emails, profile records, forum content, or auth identifiers to free-tier providers. Free Gemini tier content may be used to improve Google products. Send only public scraped funding text and derived public metadata.

## Provider Runtime Rules

Separate failover from escalation:

- **Failover:** Gemini HTTP 5xx, quota/rate-limit, timeout, or malformed provider response can retry with the fallback provider if budget allows.
- **Escalation:** Gemini returns valid structured output but the local validator flags low confidence, contradiction, or incomplete fields. Escalation uses a separate retry budget because it is a quality decision, not an outage.

Every provider call must observe:

- per-run row cap
- per-run token cap
- month-to-date token cap
- month-to-date combined cost cap across all providers
- timeout
- max provider failures before abort
- `Retry-After` support
- structured error category

Required env:

- `AI_ENRICHMENT_ENABLED`
- `AI_MONTHLY_TOKEN_BUDGET`
- `AI_MONTHLY_TOKEN_WARN_RATIO` default `0.8`
- `AI_GEMINI_API_KEY`
- `AI_GEMINI_MODEL`
- `AI_OPENROUTER_API_KEY`
- `AI_OPENROUTER_MODEL`
- `AI_MONTHLY_COST_BUDGET_CENTS`

`AI_MONTHLY_TOKEN_BUDGET` and `AI_MONTHLY_COST_BUDGET_CENTS` are single combined caps across Gemini and OpenRouter. `provider_preference` never bypasses either cap. Cost is the hard cap because token prices differ by provider/model; token budget is a second guardrail and reporting signal.

When either month-to-date budget reaches the warning ratio, record a warning in `ai_enrichment_runs`. When either reaches the hard cap, stop claiming jobs and mark the run `aborted_budget`.

Provider preference values are fixed:

- `auto`
- `gemini-only`
- `openrouter-only`
- `gemini-then-openrouter`

Tests and CI must never call live providers. The runner must support a mock provider mode, and deterministic fixtures should live under `test/fixtures/ai/`.

## Scheduling Strategy

Do not run enrichment as one monthly all-at-once job. Run it as a rolling 2-3 day queue so provider limits are an operational constraint rather than a failure mode.

Suggested monthly schedule:

1. Day 1: changed/new business grants
2. Day 2: scholarships, likely the largest corpus and may bleed into day 3
3. Day 3: research grants, retries, and quality audit
4. Optional daily mini-run: newest 25-50 changed or failed rows

Each run should enforce:

- max rows per run
- max requests per minute
- max tokens per run
- max provider failures before abort
- retry-after timestamp for rate-limit failures
- max attempts per job, default `3`
- backoff schedule, default `1m`, `5m`, `30m`
- idempotency via funding `content_hash`

If a run partially completes, later runs resume from `pending` and `failed_retryable` rows where `next_attempt_at <= now()`. The queue must never reprocess unchanged enriched rows unless the prompt version, schema version, model, or content hash changed.

Bumping `COMBINED_PROMPT_VERSION` or any `SCHEMA_VERSIONS[task]` in code requires the next queue run to enqueue pending jobs for active scraped funding rows whose latest enrichment row does not match the new version constants. Each combined call produces all targeted task outputs in one row write, so any version bump invalidates the whole row. Otherwise version columns are stale metadata and not a freshness mechanism.

## Data Model

Add a future migration, likely `0025_ai_enrichment.sql`, with the following shape.

### `funding.content_hash`

`funding.content_hash` does not exist today and must be added before AI queueing can be idempotent.

The hash should be deterministic over public funding fields:

- `name`
- `provider`
- `source_url`
- `description`
- `eligibility`
- `requirements`
- `tags`
- `deadline`
- `amount_min`
- `amount_max`
- `application_url`

Use a generated column or trigger. The implementation decision must be made before G13 starts. The hash must not include user/profile/forum data.

Input to providers must be capped before prompt assembly. Truncate long public text fields to roughly 6 KB of combined description/eligibility/requirements text, and emit a `data_quality` flag when truncation occurs.

### Enums

Add Postgres enums:

- `ai_enrichment_status`: `pending`, `processing`, `enriched`, `needs_review`, `failed_retryable`, `failed_permanent`
- `ai_enrichment_task_type`: `summary`, `tags`, `checklist`, `match_reasons`, `data_quality`, `radar`
- `ai_provider_preference`: `auto`, `gemini-only`, `openrouter-only`, `gemini-then-openrouter`
- `ai_enrichment_run_status`: `running`, `success`, `partial`, `aborted_budget`, `failed`

G16 extends `ai_enrichment_task_type` with `embedding` if semantic search chooses an embedding-backed implementation.

### Version Constants

`lib/ai/enrichment-schema.ts` is the source of truth for runtime versions and fixed values:

- `TASK_TYPES`
- `PROVIDER_PREFERENCES`
- `COMBINED_PROMPT_VERSION: number` — single integer covering the row-level combined call
- `SCHEMA_VERSIONS: Record<TaskType, number>` — per-task output schemas, evolved independently
- `CONFIDENCE_NEEDS_REVIEW_THRESHOLD`

Database enum values and tests must match these constants.

Bumping `COMBINED_PROMPT_VERSION` or any `SCHEMA_VERSIONS[task]` triggers a full-row re-enrichment because each row is produced by one combined call. Per-task prompt independence is intentionally not supported; if a single task needs prompt drift independent of the rest, split it out of the combined call first and document it in the plan.

### `funding_ai_enrichment`

- `funding_id`
- `task_type`
- `content_hash`
- `summary`
- `eligibility_bullets`
- `best_fit_applicant`
- `normalized_tags`
- `application_checklist`
- `match_reason_templates`
- `deadline_urgency`
- `confidence`
- `needs_review`
- `provider`
- `model`
- `prompt_version`
- `schema_version`
- `enriched_at`
- `created_at`
- `updated_at`

Required constraints:

- unique `(funding_id, task_type, content_hash, prompt_version, schema_version)`
- `confidence >= 0 and confidence <= 1`
- FK to `funding(id)` with cascade delete

Reader rule:

`getEnrichmentForFunding(id)` and `getEnrichmentForRole(role)` read only rows whose `content_hash` equals the current `funding.content_hash`, whose `prompt_version` equals `COMBINED_PROMPT_VERSION`, whose `schema_version` equals `SCHEMA_VERSIONS[task_type]`, and whose `needs_review = false`. Rows for older hashes or versions are stale and ignored.

`needs_review` is a queue-runtime computed boolean, not a generated column and not a database CHECK expression. The queue writes `needs_review = confidence < CONFIDENCE_NEEDS_REVIEW_THRESHOLD OR validator_flagged`.

`match_reason_templates` may be partial. Missing role/tag maps are accepted; UI falls back to deterministic match copy for missing templates.

`updated_at` is advanced only by admin overrides of `needs_review` (e.g., reviewer clears a flagged row in G17). Re-enrichment under a new `COMBINED_PROMPT_VERSION` or `SCHEMA_VERSIONS[task]` writes a new row instead of updating the existing one — the unique key includes the version columns, so history is preserved.

### `ai_enrichment_jobs`

One job represents one combined call against `(funding_id, content_hash)`. The job's `task_types` array names which task outputs the call is expected to produce; the queue runtime writes one `funding_ai_enrichment` row per task type after a successful call.

- `id`
- `funding_id`
- `content_hash`
- `task_types text[]` — subset of `ai_enrichment_task_type` values the combined call will produce; non-empty
- `status`
- `attempt_count`
- `provider_preference`
- `next_attempt_at`
- `last_error`
- `created_at`
- `updated_at`

Required constraints:

- FK to `funding(id)` with cascade delete
- unique pending/current job key that prevents duplicate work for the same `funding_id` and `content_hash` — one combined-call job per row at a time
- `attempt_count >= 0`
- `provider_preference` must be one of the `ai_provider_preference` enum values
- `task_types` must be a non-empty subset of `ai_enrichment_task_type` values; enforced in code (Postgres array-vs-enum constraints are clumsy, so validate at insert)

Cleanup:

- delete completed `enriched` and `failed_permanent` jobs older than 90 days
- keep retryable failed jobs while `next_attempt_at` is relevant

### `ai_enrichment_runs`

- `id`
- `started_at`
- `finished_at`
- `provider`
- `model`
- `rows_attempted`
- `rows_enriched`
- `rows_needs_review`
- `rows_failed`
- `tokens_in`
- `tokens_out`
- `cost_in_cents`
- `cost_out_cents`
- `status`
- `aborted_reason text` — populated only when `status = 'aborted_budget'`; one of `token_budget`, `cost_budget`, `provider_failure_cap`
- `error_summary jsonb`
- `created_at`

Required constraints:

- `status` uses `ai_enrichment_run_status`
- token and cost counters are non-negative
- `error_summary` shape is `{by_provider: {gemini: {...}, openrouter: {...}}, by_validator: {...}}`
- `aborted_reason` is `null` unless `status = 'aborted_budget'`

Cleanup:

- keep 180 days of runs for budget and reliability reporting

### `ai_enrichment_quarantine`

Store rejected malformed provider output only when it helps prompt/schema iteration:

- `id`
- `funding_id`
- `task_type`
- `provider`
- `model`
- `content_hash`
- `prompt_version`
- `schema_version`
- `error_category`
- `redacted_payload`
- `created_at`

Rules:

- service-role-only RLS
- truncate `redacted_payload` to a small bounded size, suggested 32 KB
- redact email-like strings and URL query strings before insert
- keep 30 days by default

### RLS

Enable RLS on every AI enrichment table.

`funding_ai_enrichment`:

- `anon` and `authenticated` may select only enrichment rows whose parent `funding.status = 'active'`
- write the public select policy as an EXISTS-join, not a redundant denormalized column:
  ```sql
  create policy "funding_ai_enrichment public select"
  on public.funding_ai_enrichment
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.funding f
      where f.id = funding_ai_enrichment.funding_id
        and f.status = 'active'
    )
  );
  ```
- do not store a redundant `funding_status` column
- no public insert/update/delete; service role owns writes

`ai_enrichment_jobs`, `ai_enrichment_runs`, and `ai_enrichment_quarantine`:

- service-role-only
- no anon/authenticated policies

## Feature Set

Build these features in order.

First release scope:

- G13-G15 only: schema, queue/runtime, and visible funding UX.
- Include summary, checklist, normalized tags, data-quality flags, and static match-reason templates.
- Keep deterministic matching, role filtering, deadlines, amounts, statuses, application URLs, and source URLs as the source of truth.
- Hide every AI surface unless the row is current-version, current-hash, validated, and `needs_review = false`.
- Defer semantic search, monthly radar, embeddings, admin review UI, and live/chatbot behavior until after G15 quality proof.

1. AI funding enrichment metadata

Generate public, static metadata per funding row: summary, eligibility bullets, normalized tags, best-fit applicant, confidence, and review flags.

2. Data-quality flags and review queue

Flag duplicate-looking programs, suspicious URLs, missing eligibility, stale deadline wording, contradictory amounts, and low-confidence scraper parses.

3. Match explanations

Render static explanations such as:

> Matched because this scholarship aligns with STEM, New Brunswick, and undergraduate study.

The score itself stays deterministic. AI only improves explanation text and metadata.

AI must not receive user profile data for match explanations. AI generates role/tag-keyed templates only; the app chooses and interpolates deterministic profile/match facts server-side at render time.

4. Monthly funding radar

Generate static role-specific insights:

- new this month
- closing soon
- high-value opportunities
- underused grants or scholarships
- recently updated programs

Default surface: existing role dashboard tiles. Do not build a dedicated `/radar` route until dashboard usage proves the feature. This is deferred until after G15 proof.

5. Semantic search

Add embeddings for funding rows so users can search by meaning, not only exact tags.

Examples:

- startup export help
- Indigenous nursing bursary
- early career partnership grant

Embedding storage decision: G16 uses Supabase `pgvector` with Gemini `gemini-embedding-001` at 768 dimensions. Raw vectors are service-role-only; public search pages receive ranked active funding IDs only after server-side coverage checks.

6. Application prep checklist

Show static checklists per opportunity:

- documents likely needed
- eligibility checks before applying
- questions to ask the provider
- common disqualifiers

Frame this as preparation guidance, not legal, financial, or eligibility advice.

## Implementation Shape

Suggested files:

- `lib/ai/provider.ts`
- `lib/ai/gemini.ts`
- `lib/ai/openrouter.ts`
- `lib/ai/enrichment-schema.ts`
- `lib/ai/enrichment-queue.ts`
- `lib/funding/enrichment.ts`
- `jobs/ai-enrich.ts` or `scraper/ai-enrich.ts`
- `.github/workflows/ai-enrichment.yml`
- `supabase/migrations/0025_ai_enrichment.sql`
- focused tests under `test/unit/ai-*.test.ts`
- deterministic fixtures under `test/fixtures/ai/`

The scraper remains responsible for raw funding ingestion. The AI job runs later and only enriches public funding records.

Ownership: treat `lib/ai/**` as funding-domain-internal for this phase. Only `lib/funding/**`, `scraper/**`, and `jobs/**` should import it. Dashboard/funding pages consume enrichment through `lib/funding/enrichment.ts`; profile/forum/session code must not import `lib/ai/**`.

Queue claim rules:

- only claim `funding.source = 'scraped'`
- only claim active or recently changed rows
- skip `source = 'manual'` until a future manual-row public-safety policy is designed and migrated
- do not import from `lib/profile/**`, `lib/forum/**`, or `lib/session/**`

## UI Fallback Rules

Pages must work when enrichment is missing.

If `funding_ai_enrichment` is absent or `needs_review = true`:

- hide AI summary/checklist/match-reason surfaces entirely
- render existing funding description, eligibility, requirements, and deterministic match score
- do not show "AI unavailable" empty states to end users

`needs_review = true` rows are admin/review-only until G17.

**Precedence between hide and partial-template fallback:** `needs_review = true` always wins. When the row is hidden, no AI surface renders regardless of which fields are populated. Partial `match_reason_templates` only matter on the path where the AI surface is rendered (row is current-version, current-hash, validated, and `needs_review = false`); on that path, missing role/tag entries fall back to deterministic copy.

Define:

- `confidence` is a number in `[0, 1]`
- `needs_review` is written by the queue runtime as `confidence < 0.6 OR validator_flagged`

## Guardrails

- Structured JSON output only.
- Validate every AI response with Zod in `lib/ai/enrichment-schema.ts`.
- Use discriminated unions per `task_type`.
- Treat funding text as untrusted data, not instructions. Upstream pages may contain prompt-injection prose; defense is static system prompts, structured output, strict Zod validation, and deterministic post-validation.
- Reject and quarantine invalid output; do not coerce malformed AI responses.
- Zod failure retry policy: one retry with a stricter repair prompt, then mark the job `failed_permanent`.
- Preserve deterministic role/type filtering and match scoring.
- Never let AI change canonical deadline, amount, status, application URL, or source URL without deterministic validation.
- Store provider, model, prompt version, schema version, and enrichment timestamp per output row.
- Record token usage, cost counters, and failure counts per run.
- Make enrichment optional at runtime; pages must still work when enrichment is missing.
- Keep human-readable fallback text for every UI surface.
- Never log full prompts or responses in production logs.
- All log writes and `ai_enrichment_quarantine` inserts go through `lib/ai/redact.ts`. Required redaction patterns:
  - email regex `\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b` → replaced with `[redacted-email]`
  - URLs: strip everything after the first `?` (drop query strings) before logging or quarantine insert
  - cap any single redacted string at 32 KB before storage; longer strings are truncated with a `[truncated]` suffix
- Do not send private user/profile/forum/auth data to providers.
- CI uses mock providers only.

GitHub Actions secrets required for real runs: configure `AI_GEMINI_API_KEY` and `AI_OPENROUTER_API_KEY` as repository secrets before manually triggering `.github/workflows/ai-enrichment.yml`.

## Missing Decisions Before G13

1. `funding.content_hash` implementation: generated column vs trigger.
2. Monthly budgets: suggested starting cap `2M` total tokens/month plus a single combined cost cap in cents across providers, with circuit-breaker at 100% and warning at 80%.
3. Job/run retention: suggested 90 days for completed jobs and 180 days for runs.
4. Confidence threshold: suggested `0.6`.
5. Embedding storage: decide at G16 only. Do not block G13-G15 on `pgvector` or semantic search.
6. Manual-row policy: only `source = 'scraped'` initially; future manual-row public-safety policy is out of scope for G13-G17 unless explicitly reopened.
7. Radar surface: dashboard tile first, `/radar` later only if needed.
8. Exact cost cap value: choose the G14 starting `AI_MONTHLY_COST_BUDGET_CENTS` before enabling real provider runs.

## Release SLO

First AI release criterion: at least 90% of active scraped funding rows enriched and at least 80% of enriched rows with `needs_review = false`. Current code supports the measurement and hides incomplete surfaces, but production proof is still blocked by real-provider quality and browser verification.

## Sources Checked

- Gemini billing and free/paid tier model: https://ai.google.dev/gemini-api/docs/billing/
- Gemini rate limits and per-project quota behavior: https://ai.google.dev/gemini-api/docs/rate-limits
- Gemini/Gemma pricing and free-tier data-use note: https://ai.google.dev/pricing
- OpenRouter rate-limit behavior: https://openrouter.ai/docs/api-reference/limits
- OpenRouter pricing and free-tier request limits: https://openrouter.ai/pricing
- OpenAI Batch API async processing pattern: https://platform.openai.com/docs/guides/batch/getting-started
- OpenAI embeddings use cases: https://platform.openai.com/docs/guides/embeddings/what-are-embeddings
- OpenAI Structured Outputs pattern: https://platform.openai.com/docs/guides/structured-outputs

The OpenAI links are informational architecture references only. Auctus AI enrichment scope is Gemini plus OpenRouter unless the user explicitly changes providers.
