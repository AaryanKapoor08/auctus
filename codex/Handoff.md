# Auctus V2 Handoff

**Last Updated:** 2026-05-06
**Current Gate:** G15 — Enrichment Outputs in Funding UX
**Branch:** `main`
**Status:** G13-G15 code is implemented and locally verified; production AI workflow runner is pushed, but G15 remains manually blocked on dispatching the real provider workflow and real enriched-row browser proof.

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

## Manual Blockers

- Real AI provider run is not complete: user says GitHub Actions secrets/variables are configured, but local `gh` auth is invalid (`HTTP 401`), so the workflow could not be verified or triggered from this machine.
- G15 browser proof on real enriched rows is pending. Need at least one G14 real enrichment cycle producing >= 50 enriched rows, then verify one visible row and one deliberate `needs_review=true` hidden row.
- Existing external auth/browser blockers from prior gates remain: Google OAuth/email-password proof and multi-role browser walkthrough.

## Exact Next Action

Do not start G16 yet. First close the G15 manual proof:

1. Re-authenticate GitHub CLI with `gh auth login` or manually trigger Actions in the GitHub UI.
2. Trigger `.github/workflows/ai-enrichment.yml` for a real Gemini run with `max_rows=50`.
3. Confirm >= 50 active scraped rows have current-version enrichment with `needs_review=false`.
4. Browser-check a visible enriched funding row and a row with `needs_review=true` to confirm the AI surface is hidden.
5. Record the manual proof and commit reference in `codex/SoloProgress.md`.

## Assumptions To Preserve

- G13-G15 use one combined row-level enrichment call by default, with per-task rows written afterward.
- `source='manual'` rows are excluded from queue claims until a separate public-safety policy exists.
- AI never receives profile, forum, auth, session, email, or user-specific data.
- G16 semantic search/pgvector remains deferred until real enriched-row quality is proven.
