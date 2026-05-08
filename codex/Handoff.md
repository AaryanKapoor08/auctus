# Auctus V2 Handoff

**Last Updated:** 2026-05-08
**Current Gate:** G15 — Enrichment Outputs in Funding UX
**Branch:** `main`
**Status:** G13-G15 code is implemented and locally verified; production AI workflow runner is pushed. Gemini API Gemma now selects `gemma-4-31b-it`, but real runs still produce zero enriched rows. After timeout/retry, parser, and Gemma JSON-mode fixes, the latest `max_rows=1` run advanced to a validator failure. Per user request, pause Gemma/G15 proof work for now and carry it as an explicit blocker. G15 remains open pending real enriched-row browser proof.

## Read First

1. `codex/Handoff.md`
2. `codex/SoloProgress.md`
3. `AGENTS.md`
4. `codex/AIEnrichmentPlan.md`

`codex/SoloProgress.md` is the proof/history source of truth. `critique-followup.md` remains untracked review context and should stay uncommitted unless the user explicitly asks.

## Completed This Session

- Added `supabase/migrations/0025_ai_enrichment.sql` and applied it to the linked Supabase DB.
- Added deterministic trigger-maintained `funding.content_hash` including `source_url`.
- Added AI enums, enrichment/jobs/runs/quarantine tables, public active-parent enrichment SELECT policy, and service-role-only queue/run/quarantine posture.
- Added `lib/ai/**` validation/provider/mock/queue/redaction foundation with Zod schemas, combined-call versions, failover/escalation behavior, retry/budget helpers, and service-role DB runner.
- Added `lib/funding/enrichment.ts` current-version readers that hide stale-hash, stale-version, and `needs_review` rows.
- Added mock dry-run CLI `scraper/ai-enrich.ts` and workflow-dispatch stub `.github/workflows/ai-enrichment.yml`.
- Wired G15 visible surfaces:
  - funding cards optionally show validated enrichment summary subtitle.
  - funding detail pages show enrichment overview and prep checklist when current/review-cleared.
  - dashboard match-reason copy consumes enrichment through `lib/funding/enrichment.ts`, not direct `lib/ai/**`.
- Installed `zod` and updated `.env.example`, ESLint restricted-import boundaries, and tests.
- Replaced the dry-run-only Actions command with production `jobs/ai-enrich.ts`, which enqueues missing active scraped funding jobs, runs the service-role queue, and writes run results.
- Updated first-run model defaults to `gemini-2.5-flash` and `nvidia/nemotron-3-super-120b-a12b`.
- Pushed production workflow/runtime commit `da756b8` to `main`.
- Observed first real Gemini smoke run: 25 attempted, 1 enriched, 24 failed retryable; main error was Gemini rate limiting. The one visible row (`Alliance Society`) was useful as plumbing proof but too weak as product proof.
- Bumped `COMBINED_PROMPT_VERSION` to 2 and tightened prompt/schema/UI quality:
  - at least 3 checklist bullets are required.
  - generic one-line checklist output is hidden.
  - funding detail pages show best-fit applicant and eligibility signals.
  - active shell/footer copy now says `Auctus`, not `Auctus AI`.
- Investigated the user-triggered Gemini API Gemma smoke:
  - workflow correctly used `model=gemma-4-31b-it`.
  - latest Gemma run showed `status=failed`, `rows_attempted=5`, `rows_enriched=0`, `rows_failed=5`.
  - job errors included Gemini `500`, Gemini `429`, and local aborts.
- Added runtime hardening for slower/free Gemma provider runs:
  - Gemini default request timeout 30s -> 120s.
  - OpenRouter default request timeout 30s -> 60s.
  - queue now uses provider `Retry-After` when scheduling retryable failed jobs.
- Investigated the follow-up Gemma `max_rows=1` smoke:
  - latest run still failed 1/1 as `network_or_parse_error`.
  - provider adapter previously grouped timeout, fetch, and JSON parsing together, making the next fix ambiguous.
- Added provider parsing/error-classification hardening:
  - strict JSON parser now accepts fenced JSON and text-wrapped JSON object responses.
  - timeout failures are categorized as `timeout`.
  - fetch failures are categorized as `network_error`.
  - invalid provider JSON is categorized as `json_parse_error`.
- Investigated the next Gemma `max_rows=1` smoke:
  - latest run failed as an HTTP error before any model output was returned.
  - official structured-output docs list Gemini models as supported and do not list Gemma; Gemma API examples use plain `generateContent`.
- Added Gemma structured-output fallback:
  - `gemma-*` models no longer send `generationConfig.responseMimeType`.
  - Gemini models still request JSON mode.
  - Gemma output is parsed by the tolerant JSON parser added above.
- Latest user rerun after the Gemma JSON-mode fallback:
  - workflow used `provider=gemini`, `model=gemma-4-31b-it`, `max_rows=1`.
  - Supabase run row showed `status=failed`, `rows_attempted=1`, `rows_enriched=0`, `rows_needs_review=0`, `rows_failed=1`.
  - screenshot showed `error_summary.by_validator`, not HTTP/network/parse, so Gemma likely returned parseable JSON that failed local validation or missed required combined task outputs.
  - User explicitly asked to stop working this for now and document the fix path.

## Verification Run

- `npx supabase db push --include-all --yes` => applied `0025_ai_enrichment.sql` after fixing one backfill alias error.
- Supabase metadata query => RLS true on `funding_ai_enrichment`, `ai_enrichment_jobs`, `ai_enrichment_runs`, `ai_enrichment_quarantine`.
- Supabase enum query => expected task/status/provider/run enum values present.
- `npm test` => 30 files / 155 tests passed.
- `npm run lint` => success with 20 known legacy demo warnings only.
- `npm run build` => success.
- `npx tsc -p scraper/tsconfig.json --noEmit` => success.
- `npx tsx ai-enrich.ts --dry-run --provider mock --max-rows 3` from `scraper/` => emitted 3 deterministic mock rows.
- Temporary ESLint violation in `lib/ai/__restricted-import-test.ts` importing `@/lib/profile/queries` => rejected by `no-restricted-imports`; temp file removed.
- `git diff --check` => no whitespace errors; CRLF warnings only.
- `npx tsx jobs/ai-enrich.ts --help` with `NODE_OPTIONS=--conditions=react-server` => success.
- `npm test` => 30 files / 155 tests passed.
- `npm run lint` => success with 20 known legacy demo warnings only.
- `npx tsc -p scraper/tsconfig.json --noEmit` => success.
- `npm run build` => success after deleting stale generated `.next` output.
- `git push origin main` => pushed `da756b8` to `main`; branch protection was bypassed by the GitHub account.
- Supabase run query => latest AI run `partial`, `rows_attempted=25`, `rows_enriched=1`, `rows_failed=24`, `gemini.rate_limit=20`.
- Focused prompt/UI tests initially hit local Windows `spawn EPERM`; elevated rerun => 2 files / 7 tests passed.
- `npm run lint` => success with 20 known legacy demo warnings only.
- `npm run build` => success.
- Active app `Auctus AI` grep outside frozen demo/archive paths => no matches.
- `npm test -- --run test/unit/ai-queue.test.ts` => 1 file / 5 tests passed.
- `npm run lint` => success with 20 known legacy demo warnings only.
- `npm run build` => success.
- `npm test -- --run test/unit/ai-provider.test.ts test/unit/ai-queue.test.ts` => 2 files / 9 tests passed.
- `npm run lint` => success with 20 known legacy demo warnings only.
- `npm run build` => success.
- `npm test -- --run test/unit/ai-provider.test.ts test/unit/ai-queue.test.ts` => 2 files / 11 tests passed.
- `npm run lint` => success with 20 known legacy demo warnings only.
- `npm run build` => success.

## Manual Blockers

- Real AI provider quality proof is not complete: first run proved the queue writes rows, but only 1/25 enriched and the result was too thin. Prompt v2 must be rerun.
- G15 browser proof on real enriched rows is pending. Need at least one G14 real enrichment cycle producing >= 50 enriched rows, then verify one visible row and one deliberate `needs_review=true` hidden row.
- Gemini API Gemma 4 is not currently producing valid persisted enrichment for the combined-call schema. Current state after fixes: provider reaches validator stage, then fails. Do not count Gemma runs toward G15 until at least one row writes current-version `funding_ai_enrichment` rows with `needs_review=false`.
- Existing external auth/browser blockers from prior gates remain: Google OAuth/email-password proof and multi-role browser walkthrough.

## Exact Next Action

User wants to stop Gemma/G15 proof work for now and continue next session toward G16/G17/finalization. Preserve this caveat: by the gate rules, G16 should not start until G15 is complete unless the next session explicitly records G15 real-provider proof as a deferred manual blocker.

If returning to Gemma later, fix in this order:

1. Query validator/quarantine detail for the latest failed job:
   - `ai_enrichment_runs.error_summary`
   - `ai_enrichment_jobs.last_error`
   - `ai_enrichment_quarantine.redacted_payload`
2. Improve validation observability without logging full provider payloads: record missing task names and Zod issue paths/categories in `error_summary.by_validator`.
3. If Gemma is omitting fields/tasks, either tighten the prompt for `gemma-*` specifically or run a narrower Gemma task set first (`summary` + `checklist`) instead of the full combined task set.
4. If Gemma still fails validator, switch G15 proof back to Gemini Flash/OpenRouter/Nemotron or a paid Gemini model for the required 50-row proof.
5. Only after rows exist, run the website query for current `needs_review=false` summary rows and browser-check visible/hidden AI surfaces.

## Assumptions To Preserve

- G13-G15 use one combined row-level enrichment call by default, with per-task rows written afterward.
- `source='manual'` rows are excluded from queue claims until a separate public-safety policy exists.
- AI never receives profile, forum, auth, session, email, or user-specific data.
- G16 semantic search/pgvector remains deferred until real enriched-row quality is proven.
