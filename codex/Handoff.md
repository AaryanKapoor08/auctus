# Auctus V2 Handoff

**Last Updated:** 2026-05-08
**Current Gate:** G17 — AI Release Hardening
**Branch:** `main`
**Status:** G16/G17 code is implemented and locally verified. G15 remains open as an explicit deferred manual blocker: real-provider enrichment quality/browser proof is still not complete, and Gemma proof work remains paused per user request.

## Read First

1. `codex/Handoff.md`
2. `codex/SoloProgress.md`
3. `AGENTS.md`
4. `codex/AIEnrichmentPlan.md`

`codex/SoloProgress.md` is the proof/history source of truth. `critique-followup.md` remains untracked review context and should stay uncommitted unless the user explicitly asks.

## Completed This Session

- User locked G16/G17 decisions: Supabase `pgvector`, Gemini embeddings, admin allowlist `aaryankapoor008@gmail.com`, delete existing auth user for that email first, and commit.
- Deleted Supabase auth user `4873cd6e-05e2-4c71-bfe6-37c5b495cf5b` / `aaryankapoor008@gmail.com`; follow-up query confirmed zero matching auth users.
- Added `supabase/migrations/0026_pgvector_funding.sql`:
  - enables `vector` extension;
  - extends `ai_enrichment_task_type` with `embedding`;
  - creates service-role-only `funding_embeddings` with `extensions.vector(768)`;
  - adds HNSW cosine index;
  - adds service-role-only `match_funding_embeddings` RPC for active current-hash funding IDs.
- Added Gemini embedding runtime:
  - `lib/ai/embeddings.ts` with Gemini and mock providers;
  - `lib/funding/semantic-search.ts` with coverage-gated semantic ranking and embedding upsert helpers;
  - `jobs/ai-enrich.ts --mode embeddings`.
- Wired funding browsers to accept server-provided semantic ranked IDs while preserving substring fallback.
- Added coverage-gated dashboard radar via `lib/funding/enrichment.ts`; dashboard hides radar until current enrichment coverage is high enough.
- Updated `.github/workflows/ai-enrichment.yml` with scheduled runs and embedding refresh.
- Added G17 admin surfaces:
  - `app/admin/review/page.tsx`;
  - `app/admin/runs/page.tsx`;
  - `app/admin/_lib/require-admin.ts`;
  - `lib/auth/admin-allowlist.ts`;
  - `/admin` route policy.
- Updated docs: `.env.example`, `README.md`, `supabase/README.md`, and `codex/AIEnrichmentPlan.md`.
- Added focused tests for embeddings, semantic search helpers, dashboard radar, admin allowlist/pages, and `0026` SQL.

## Verification Run

- `npx supabase db push --include-all --yes`:
  - first failed on unqualified pgvector HNSW opclass;
  - second failed on `funding_type = text`;
  - fixed both and reran successfully; `0026_pgvector_funding.sql` is applied.
- Supabase metadata query => `embedding` enum true, `funding_embeddings` RLS true, `match_funding_embeddings` exists.
- Supabase auth query => `aaryankapoor008@gmail.com` auth user count `0` after deletion.
- `npm test` => 37 files / 177 tests passed.
- `npm run lint` => success with 20 known legacy demo warnings only.
- Deliberate temp `jobs/__restricted-import-test.ts` importing `@/lib/profile/queries` => lint rejected via `no-restricted-imports`; temp file removed.
- `npm run lint` rerun after temp removal => success with 20 known legacy demo warnings only.
- `npm run build` => success.
- `npx tsc -p scraper/tsconfig.json --noEmit` => success.
- `NODE_OPTIONS=--conditions=react-server npx tsx jobs/ai-enrich.ts --help` => success.
- `git diff --check` => no whitespace errors; CRLF warnings only.

## Manual Blockers

- G15 real AI provider quality proof is still not complete. Need at least one real enrichment cycle producing >= 50 useful enriched rows before counting G15 browser proof.
- Gemma/G15 proof work remains paused. Current known state: Gemma reaches validator failure, but does not persist valid combined-call rows.
- G16 semantic coverage proof is pending: run Gemini embedding refresh enough times to reach >= 80% embedding coverage on at least one role.
- First scheduled GitHub AI workflow cron proof is pending.
- `ADMIN_ALLOWLIST=aaryankapoor008@gmail.com` must be set in deployment/runtime env.
- Admin-only browser proof is pending after re-creating/signing in the allowlisted user.
- Existing external auth/browser blockers from prior gates remain: Google OAuth/email-password proof and multi-role browser walkthrough.

## Exact Next Action

Push the G16/G17 implementation. After that, either:

1. re-create/sign in `aaryankapoor008@gmail.com` and browser-check `/admin/review` plus `/admin/runs`; or
2. run real Gemini embeddings with `NODE_OPTIONS=--conditions=react-server npx tsx jobs/ai-enrich.ts --mode embeddings --provider gemini --max-rows 50` until one role reaches >= 80% coverage; or
3. return to G15 provider proof with Gemini Flash/OpenRouter rather than Gemma.

## Assumptions To Preserve

- G15 is not closed; G16/G17 proceeded only because the user explicitly approved carrying the G15 proof as a deferred manual blocker.
- `source='manual'` rows remain excluded from enrichment/embedding queueing until a public-safety policy exists.
- AI never receives profile, forum, auth, session, email, or user-specific data.
- Raw embeddings stay service-role-only; public pages receive ranked funding IDs only through server-side code.
