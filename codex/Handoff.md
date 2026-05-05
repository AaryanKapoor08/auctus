# Auctus V2 Handoff

**Last Updated:** 2026-05-05
**Current Gate:** G13 — AI Enrichment Foundation
**Branch:** `main`
**Status:** Ready to start G13 implementation after committing/pushing the AI planning docs.

## Read First

1. `codex/Handoff.md`
2. `codex/SoloProgress.md`
3. `AGENTS.md`
4. `codex/AIEnrichmentPlan.md`

`codex/SoloProgress.md` is the full proof/history source of truth. This handoff is intentionally short so the next window can start building without re-reading old G2-G12 detail.

## Current Decision

Replace the legacy chatbot/AI placeholder with offline AI enrichment for public funding records.

Build only the first narrow AI slice before expanding:

- **G13:** schema, deterministic `funding.content_hash`, AI enums/tables/RLS, typed validation/version constants, current-version enrichment readers.
- **G14:** provider adapters and queue runtime, mocked in CI, one combined row-level enrichment call where practical.
- **G15:** visible funding UX for validated enrichment only.

Do **not** start G16/G17 until G13-G15 are complete and proven on real rows.

Provider decision:

- Primary first-run target: Gemini 2.5 Flash-Lite for cheap offline public-data enrichment.
- Gemma is optional tiny-task/canary only; do not make it primary because its token/minute limit is too low for full funding records.
- OpenRouter/Nemotron is escalation/fallback only for low-confidence or failed rows.
- If free-tier data-use is unacceptable, disable real provider runs until paid/private provider usage is configured.

AI safety boundary:

- Send only public scraped funding text and public derived funding metadata to providers.
- Never send profile, forum, auth, email, session, or user-specific data.
- AI never edits canonical funding fields: deadline, amount, status, application URL, source URL, role/type filtering, or match score.
- Hide AI surfaces unless enrichment matches current `content_hash`, current prompt/schema versions, passes Zod validation, and `needs_review = false`.

## Files Changed In Planning

Planning/ownership docs staged for commit:

- `AGENTS.md`
- `codex/AIEnrichmentPlan.md`
- `codex/ClaudeAIPlanReviewPrompt.md`
- `codex/SoloProgress.md`
- `codex/Handoff.md`

Leave `critique-followup.md` untracked unless the user explicitly asks to commit it; it is review context, not product documentation.

## Exact Next Build Action

Start G13 from `codex/SoloProgress.md`:

1. Record G13 decisions in the Proof Log before implementation:
   - `content_hash` field set includes `source_url`.
   - trigger vs generated column.
   - AI enum values.
   - RLS shape for enrichment/jobs/runs/quarantine.
   - retention windows.
   - current-version reader behavior.
   - one combined row-level enrichment call as the G14 default.
2. Implement `supabase/migrations/0025_ai_enrichment.sql`.
3. Add `lib/ai/enrichment-schema.ts` with typed task/provider/version constants and Zod schemas.
4. Add `lib/funding/enrichment.ts` readers that return only current-hash/current-version/non-review rows.
5. Update `.env.example`.
6. Add SQL-text/unit tests listed under G13.

## Verification Target For G13

- `npx supabase db push --include-all --yes`
- `npm test`
- `npm run lint`
- `npm run build`
- `npx tsc -p scraper/tsconfig.json --noEmit`

If a command fails, record the exact failure in `codex/SoloProgress.md` and this file before moving on.

## Manual Blockers

These are parallel blockers, not G13 blockers:

- Google OAuth/email-password browser proof remains incomplete.
- First scheduled GitHub scrape cron proof remains pending.
- Real AI provider runs require GitHub Actions secrets/variables for provider keys and budget/model env values.

## Commit Note

Commit the planning docs as:

`docs(ai): plan staged enrichment rollout`

The commit touches shared/coordinated docs and funding-domain ownership rules; mention that in the commit body.
