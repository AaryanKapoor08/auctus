# Auctus Repo Context

Last consolidated: 2026-05-23

## Product

Auctus is a Next.js 16 app for Canadian funding discovery. It serves three roles:

- Business users browse grants and business support programs.
- Students browse scholarships and bursaries.
- Professors browse research grants and council/partnership funding.

The repo has moved past the original planning gates. The real implementation is in the root project, not in `files/dev-a-space`, `files/dev-b-space`, or `files/shared-space`.

## Current State

- Public landing page at `/` shows live funding counts and public opportunity previews.
- Public funding browse/detail routes are open to guests:
  - `/grants`
  - `/scholarships`
  - `/research-funding`
- Signed-in users get profile-based role routing, match scores, dashboard summaries, forum access, and profile pages.
- Supabase auth/profile/funding/forum schemas and RLS migrations exist.
- Scraper ingestion exists for six official Canadian sources.
- AI enrichment, embeddings, semantic search plumbing, admin review pages, and Vercel analytics are implemented in code.
- Some real-provider/browser proofs remain manual or deferred.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- Supabase Auth, Postgres, RLS
- Vitest
- GitHub Actions
- Scraper package using TypeScript, `cheerio`, and Supabase service-role writes
- AI provider adapters for Gemini/OpenRouter plus Gemini embeddings

Key commands:

```bash
npm run dev
npm run lint
npm test
npm run build
npx tsc -p scraper/tsconfig.json --noEmit
cd scraper && npx tsx index.ts --dry-run
```

Required env:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

AI/runtime env used by implemented code:

```bash
AI_ENRICHMENT_ENABLED=
AI_GEMINI_API_KEY=
AI_GEMINI_MODEL=
AI_OPENROUTER_API_KEY=
AI_OPENROUTER_MODEL=
AI_MONTHLY_TOKEN_BUDGET=
AI_MONTHLY_COST_BUDGET_CENTS=
AI_GEMINI_EMBEDDING_MODEL=
AI_EMBEDDING_DIMENSIONS=
ADMIN_ALLOWLIST=
NEXT_PUBLIC_SITE_URL=
```

## Architecture Boundaries

Keep these ownership lines intact even when one person edits both sides:

- Identity/community: `app/(identity)`, `app/onboarding`, `app/profile`, `app/forum`, `app/dashboard`, `components/profile`, `components/forum`, `components/layout`, `lib/auth`, `lib/profile`, `lib/forum`, `lib/session`.
- Funding/pipeline: `app/(funding)`, `components/funding`, `lib/funding`, `lib/matching`, `lib/ai`, `scraper`, `jobs`.
- Shared/coordinated: `components/ui`, `contracts`, `app/globals.css`, root config, README/docs, GitHub workflows.

Cross-domain consumption should go through published helpers:

- Dashboard/funding consumption: `lib/funding/queries.ts`, `components/funding/FundingSummaryTile.tsx`, `lib/funding/route-policies.ts`.
- Funding/profile consumption: `lib/session/get-session.ts`, `lib/session/use-session.ts`, `lib/profile/queries.ts#getRoleProfile`.

Known boundary wrinkle: `lib/funding/queries.ts` also imports `getProfileMatchTags` from `lib/profile/queries.ts`. Either keep this intentional and document it, or formalize it if contracts are revisited.

## Main Routes

- `/`: public landing page with live opportunity counts and previews.
- `/sign-in`, `/sign-up`, `/sign-out`: auth routes.
- `/auth/callback`: Supabase OAuth/code exchange callback.
- `/onboarding`, `/onboarding/[role]`: role selection and first profile form.
- `/dashboard`: authenticated role workspace.
- `/profile`, `/profile/edit`: profile view/edit and account deletion flow.
- `/forum`, `/forum/new`, `/forum/[threadId]`: authenticated forum.
- `/grants`, `/scholarships`, `/research-funding`: public role-specific funding browsers.
- `/grants/[id]`, `/scholarships/[id]`, `/research-funding/[id]`: public funding details.
- `/admin/review`, `/admin/runs`: admin-only review/observability surfaces gated by env allowlist.

Route protection is centralized through `proxy.ts`, `lib/auth/route-policies.ts`, and `lib/funding/route-policies.ts`.

## Data Model

Supabase migrations currently define:

- `profiles`: auth-linked identity row with nullable role until onboarding.
- `business_profiles`, `student_profiles`, `professor_profiles`: per-role profile details.
- `profile_match_tags`: derived tags from onboarding/profile answers.
- `funding`: unified table for business grants, scholarships, and research grants.
- `funding_preferences`: DB-backed saved filter preferences.
- `funding_sources`, `scrape_runs`: scraper metadata.
- `forum_threads`, `forum_replies`, `reply_helpful_votes`, `mark_reply_helpful`: forum.
- `funding_ai_enrichment`, `ai_enrichment_jobs`, `ai_enrichment_runs`: AI enrichment queue/results.
- `funding_embeddings`, `match_funding_embeddings`: pgvector-backed semantic search.

Important migrations:

- `0001` profiles base and auth trigger.
- `0002` role profiles.
- `0003` funding and preferences.
- `0004` scrape metadata.
- `0005` forum.
- `0010` identity/forum RLS.
- `0011` profile match tags.
- `0012` profile email access hardening.
- `0020` funding RLS.
- `0021`-`0024` canonical funding tags/public reads.
- `0025` AI enrichment.
- `0026` pgvector funding embeddings.

Note: README and `supabase/README.md` may lag behind `0025` and `0026`; verify before editing docs.

## Funding UX Runtime

- `lib/funding/role-mapping.ts` maps roles to funding types and routes.
- `lib/funding/filter-definitions.ts` defines role-specific grouped filters.
- `components/funding/FundingBrowser.tsx` does client-side search/filter/sort on preloaded role data.
- `components/funding/FundingCard.tsx` and `FundingDetail.tsx` render public opportunity cards/details.
- `lib/matching/*` scores opportunities using role profile data plus match tags.
- `lib/funding/recommended-tags.ts` supplies profile-derived default filter chips.
- `lib/funding/enrichment.ts` reads current, non-review AI enrichment and builds coverage-gated radar insights.
- `lib/funding/semantic-search.ts` can rank by embeddings when coverage is high enough; otherwise browse falls back to deterministic filtering.

## Scraper

Entry point: `scraper/index.ts`.

Pipeline:

1. Source modules scrape official pages.
2. `normalize.ts` maps rows into the unified funding shape.
3. `canonical-tags.ts` normalizes role/category tags.
4. `deduplicate.ts` upserts by source/dedupe key.
5. `expire.ts` expires past-deadline rows.
6. `runner.ts` records scrape run results.

Locked sources:

- ISED Business Benefits Finder
- ISED Supports for Business
- EduCanada Scholarships
- Indigenous Bursaries Search Tool
- NSERC
- SSHRC

Historical proof from planning docs: dry run found 566 rows; real ingestion produced roughly 20 business grants, 485 scholarships, and 22 research grants at that time. Recheck live counts before relying on numbers in UI copy.

## AI Enrichment

Direction: AI is offline enrichment and discovery intelligence, not a chatbot.

Implemented pieces:

- `lib/ai/enrichment-schema.ts`: task types, versions, validation.
- `lib/ai/gemini.ts`, `lib/ai/openrouter.ts`, `lib/ai/provider.ts`: provider adapters and error categories.
- `lib/ai/enrichment-queue.ts`: combined row-level enrichment queue runtime with budget checks and retry handling.
- `jobs/ai-enrich.ts`: CLI for enrichment and embedding modes.
- `lib/ai/embeddings.ts`: Gemini embedding provider.
- `lib/funding/semantic-search.ts`: embedding upsert and semantic ranked IDs.
- `.github/workflows/ai-enrichment.yml`: scheduled/dispatch AI workflow.
- Admin pages for review/runs.

Rules to preserve:

- Never send profile, auth, forum, session, email, or private user data to AI providers.
- Only public scraped funding text and derived public metadata may be sent.
- Tests and CI must not call live providers.
- Funding pages must work when enrichment is missing.
- Raw embeddings stay service-role-only; public UI receives ranked IDs/server-derived summaries only.

Manual/deferred blockers from old docs:

- G15 real-provider enrichment quality proof was not closed.
- Gemma provider proof was paused after validator failures.
- Embedding coverage proof needs enough Gemini embedding runs to reach at least 80 percent for a role.
- Admin-only browser proof remains pending after allowlisted user sign-in.
- First scheduled AI cron proof may still need verification.

## Tests

Coverage is broad and mostly unit/SQL-text based:

- contracts and env sanity
- route policy/session behavior
- profile upsert/query behavior
- funding mapping, summaries, filters, enrichment, semantic search, RLS SQL
- matching scorers
- forum queries and SQL
- dashboard composition/radar
- AI provider/schema/queue/embedding helpers
- scraper CLI, runner, sources, normalize, dedupe, expire, quality
- admin allowlist/pages

Historical green proof from old planning docs:

- `npm test`: 37 files / 174-177 tests passed depending on commit.
- `npm run lint`: passed with known legacy demo warnings.
- `npm run build`: passed.
- `npx tsc -p scraper/tsconfig.json --noEmit`: passed.

Always rerun current verification after code changes; do not rely only on historical proof.

## Known Technical Risks

- Funding browser filters client-side over the full fetched role list. This is acceptable now but needs pagination/virtualization if corpus grows.
- Landing page counts currently load role lists instead of cheap count queries.
- Dashboard may perform large reads for inventory stats.
- Date handling is mostly normalized, but dashboard/browser deadline calculations use different helper implementations.
- Auth uses email/password and Google in code/docs direction, while older planning docs mention magic link. Treat current code as source of truth.
- Some docs still mention old migration/state details and should be corrected when touched.
- No forgot-password flow is implemented.
- Forum lacks moderation, reporting, and rate limits.
- Save/track funding is not implemented; this is a core product gap.
- Design system is lightweight Tailwind/component primitives, not a full design token system.

## Working Rules

- Read code first; old planning files were archived context, not source of truth.
- Do not edit archive copies or duplicate implementations.
- Keep UI changes aligned with existing components unless deliberately redesigning.
- Preserve public browse before sign-up.
- Preserve role-specific paths and copy.
- Do not widen Supabase service-role usage beyond server/job/scraper paths.
- Treat `.env.local` and provider keys as secrets.
