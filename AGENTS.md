# Auctus V2 Solo Agent Instructions

This repository is now operated by one Codex agent acting as both original tracks:

- **Dev A:** identity, auth, onboarding, profiles, forum, session runtime, middleware, shell, dashboard composition.
- **Dev B:** funding schema, funding preferences, funding pages, matching, scraper, ETL, ingestion, funding RLS.

The two-track split still matters as an internal architecture boundary. Do not collapse everything into broad shared files. Keep identity/community logic in Dev A-owned folders and funding/pipeline logic in Dev B-owned folders. The solo agent may edit both domains, but imports must still flow through the published contracts so the two domains stay independently shippable.

## Session Start

At the start of every session, read these root files in order:

1. `codex/Handoff.md` — newest working context and exact next action.
2. `codex/SoloProgress.md` — active gate, checklist state, blockers, and proof records.
3. `AGENTS.md` — this instruction file.

## Reference Archives (load on demand)

Old workspace docs are reference archives. Do not implement app code inside them. Real implementation belongs in the root project.

Load on demand when their topic is touched:

- `dev-a-space/codex/references/build/shared/ownership.md` — domain ownership map, mixed-file surgery table, allowed blockers, migration ownership/ranges.
- `dev-a-space/codex/references/build/shared/conventions.md` — branching, commit format, PR rules, migration numbering, test commands.
- `dev-a-space/codex/references/build/shared/bootstrap.md` — V2.P1 bootstrap items A1–D2 and the V2.P1 completion gate.
- `dev-a-space/codex/references/build/shared/buildflow.md` — V2.P1–V2.P4 cross-domain dependency map.
- `dev-a-space/codex/references/build/contracts/*.ts` — typed integration contracts (`role`, `route-policy`, `profile`, `session`, `funding`).
- `dev-a-space/codex/references/build/contracts/README.md` — contract change protocol.
- `dev-a-space/codex/Migration.md` — direct-main vs workspace-draft migration modes.
- `dev-a-space/codex/BuildFlow.md`, `dev-b-space/codex/BuildFlow.md`, `shared-space/codex/BuildFlow.md` — phase-by-phase proof requirements broken into per-track checkpoints.
- `dev-a-space/codex/Progress.md`, `dev-b-space/codex/Progress.md`, `shared-space/codex/Progress.md` — historical trackers, useful when a SoloProgress checkbox needs source detail.
- `dev-a-space/codex/references/claude/CurrentStatus.md` — pre-V2 product context (also referenced by the old docs as `claude/CurrentStatus.md`, which is missing from root).

## Source Of Truth

Root `codex/SoloProgress.md` is the active tracker. The old Dev A, Dev B, and shared progress files are historical/reference trackers only.

Root `codex/Handoff.md` is the short-lived continuation note. Update it before ending a work session, especially after code edits, verification runs, blockers, or a context-heavy investigation.

## Gate Discipline

Proceed gate by gate. Do not start later product work until earlier structural gates are satisfied or explicitly recorded as manual blockers.

Every gate needs proof before it can be marked complete. For each closed gate, record in `codex/SoloProgress.md` Proof Log:

- files changed (real-project paths, never inside `dev-a-space/`, `dev-b-space/`, or `shared-space/`)
- verification command and observed result (or manual proof captured)
- commit hash or PR reference
- known blocker, if any

Some gates require external dashboard/admin work and cannot be completed by file edits alone:

- GitHub branch protection
- GitHub Actions secrets
- Supabase project creation
- Supabase CLI login/link proof
- Google OAuth provider setup (Google Cloud Console + Supabase Auth + Supabase URL Configuration)
- email OTP / magic-link deliverability

Record these as `manual proof required`; do not silently mark them done.

## Migration Mode (per `Migration.md`)

Every phase close picks one mode:

- **direct-main**: implementation lands directly in the real project. Default for app code, migrations, tests.
- **workspace-draft**: artifact drafted somewhere first (release notes, QA checklists, source-verification docs, risky SQL drafts), then copied/applied into the real project. Phase closes only after the real-project copy exists and is verified.

Each gate's Proof Log entry must name the mode, the real-project target paths, the verification command, and the commit/PR reference.

Never maintain two live versions of the same app code. The space folders are reference archives; do not fork implementation into them.

## Architecture Boundaries

Dev A internal ownership:

- `app/(identity)/**`
- `app/onboarding/**`
- `app/profile/**`
- `app/forum/**`
- `app/dashboard/**`
- `app/page.tsx`
- `app/layout.tsx`
- `app/providers.tsx`
- `middleware.ts`
- `components/auth/**`
- `components/profile/**`
- `components/forum/**`
- `components/layout/**`
- `lib/auth/**`
- `lib/profile/**`
- `lib/forum/**`
- `lib/session/**`
- identity/community migrations

Dev B internal ownership:

- `app/(funding)/**`
- `components/funding/**`
- `lib/funding/**`
- `lib/matching/**`
- `scraper/**`
- funding, scraper, and funding-RLS migrations
- `.github/workflows/scrape.yml`

Shared or coordinated files:

- `build/contracts/**`
- `components/ui/**`
- `app/globals.css`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `next.config.ts`
- `eslint.config.mjs`
- `postcss.config.mjs`
- `.env.example`
- `.github/workflows/ci.yml`
- `README.md`, `CLAUDE.md`, `AGENTS.md`, root docs

Even as a solo agent, treat shared files as deliberate coordination points and record in the commit message why they changed.

### Demo / Legacy (frozen)

`app/(demo)/**`, `components/demo/**`, `lib/demo/**`, `data/demo/**`. The legacy AIChatbot stays mounted in `app/layout.tsx` for now and may import only from `components/demo/` and `lib/demo/`. No V2 phase touches demo code.

### Cross-domain rule

Dashboard code consumes funding ONLY through the published runtime: `lib/funding/queries.ts` (`ListFundingForRole`, `GetFundingById`, `GetFundingSummariesForUser`), `components/funding/FundingSummaryTile.tsx`, and `lib/funding/route-policies.ts`. Funding/matching code consumes profile/session ONLY through `lib/session/get-session.ts`, `lib/session/use-session.ts`, and `lib/profile/queries.ts#getRoleProfile`. No direct table queries across the boundary.

### Documented one-off exception

In G5 (Session/Middleware) the agent creates a placeholder `lib/funding/route-policies.ts` whose body is `export const fundingPolicies: RoutePolicyRegistry = []`. This unblocks `middleware.ts` from a static import before G6 lands. G6 overwrites the file with the real registry. After G6 the file is purely Dev B-domain.

## Migration Numbering

`supabase/migrations/NNNN_description.sql`. Locked filenames and ranges:

| File | Domain | Lands at |
|---|---|---|
| `0000_init.sql` | shared bootstrap | G3 |
| `0001_profiles_base.sql` | identity | G5 |
| `0002_role_profiles.sql` | identity | G7 |
| `0003_funding.sql` | funding (`funding` + `funding_preferences`) | G6 |
| `0004_scrape_metadata.sql` | funding (`funding_sources` + `scrape_runs`) | G10 |
| `0005_forum.sql` | identity (`threads` + `replies` + `reply_helpful_votes` + `mark_reply_helpful`) | G9 |
| `0010_rls_identity.sql` | identity RLS | G9 (must land before `0020`) |
| `0020_rls_funding.sql` | funding RLS | G11 |

Range ownership for any future migration: `0000–0002` and `0005–0019` identity; `0003–0004` and `0020–0029` funding. Do not free-form rename or renumber existing locked files.

## Commit Format

`type(scope): description` (imperative, present tense, ≤ 72 chars).

Allowed types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`. Scope examples: `auth`, `funding`, `forum`, `profile`, `matching`, `scraper`, `db`, `ci`, `restructure`, `bootstrap`, `dashboard`, `shell`, `rls`, `release`.

The original two-dev review rules (other dev approves shared-file or cross-domain PRs) collapse into one rule for solo: when a commit touches a shared/coordinated file or crosses a domain boundary, name it explicitly in the commit body and in the Proof Log.

## Contract Change Protocol

Contracts live in `build/contracts/` and follow `dev-a-space/codex/references/build/contracts/README.md`:

1. The five contracts (`role`, `route-policy`, `profile`, `session`, `funding`) are LOCKED at G4. Edits after that need a deliberate one-purpose commit and a one-line entry in `SoloProgress.md` "Contract changes consumed."
2. PR/commit body names the gate at which the change becomes effective.
3. Do not add fields to a contract speculatively — only when a real consumer needs them.

## Required Build Strategy

The original repo is a demo shell. V2 turns it into a real multi-role product.

The solo gate order in `codex/SoloProgress.md` (G1–G12) maps to the original two-track work as follows:

- G1 — Solo bootstrap and control-plane docs.
- G2 — Mixed-file surgery, demo isolation, domain skeletons, `@contracts/*` alias, root `build/contracts/**` (was original P2 + P3 partial).
- G3 — Supabase env, `lib/env.ts`, `0000_init.sql`, Vitest, CI, scraper bootstrap, OAuth + magic-link config (was original V2.P1 bootstrap B1–B7, C1–C5).
- G4 — Promote all five contracts to LOCKED (was D1–D2 / shared P5).
- G5 — Auth routes, server/browser Supabase clients, `0001_profiles_base.sql`, session helpers, route-policy registry, middleware, placeholder funding route registry.
- G6 — `0003_funding.sql`, seed, helpers, role mapping, filter definitions, preferences, queries, listing/detail pages, `FundingSummaryTile`, `fundingPolicies` (real, overwrites placeholder).
- G7 — Onboarding selector + per-role first-run forms, `lib/profile/upsert.ts`, `lib/profile/queries.ts#getRoleProfile`, `0002_role_profiles.sql`.
- G8 — Matching scorers, `scoreFor` dispatcher, runtime wiring of `match_score` into `GetFundingSummariesForUser`.
- G9 — `0005_forum.sql` (threads, replies, helpful-vote function), `0010_rls_identity.sql`, forum runtime + pages, role-aware shell/landing/providers.
- G10 — ETL source verification docs, scraper core (types, utils, normalize, dedupe, expire), `0004_scrape_metadata.sql`, six locked source modules, scheduled workflow.
- G11 — `0020_rls_funding.sql` (after `0010_rls_identity.sql` is applied), dashboard funding summary tile composition, expiring deadlines, forum activity tile.
- G12 — Hardening: demo-import audits, data-quality assertions, missing tests, README/setup updates, final QA.

Contracts come before cross-domain runtime consumption. Identity RLS lands before funding RLS (the funding RLS join reads `profiles.role`).

## Verification

Use these checks whenever relevant:

- `npm run lint`
- `npm run build`
- `npm test` once Vitest is installed
- `npm run test:watch` for focused work
- `cd scraper && npx tsx index.ts` for scraper bootstrap
- `supabase db push` for migrations
- focused tests for changed domains

If a verification command fails, record the exact failure in `codex/Handoff.md` and `codex/SoloProgress.md` before moving on.

## Handoff Updates

Before ending a session, update `codex/Handoff.md` with:

- current gate and status
- latest completed work
- files changed (real-project paths)
- commands run and results
- migration mode used for the latest closed phase
- open blockers (named per `ownership.md` allowed-blocker list)
- exact next action
- any assumptions the next session must preserve

The next session should be able to continue from `codex/Handoff.md` without re-discovering the whole repository.
