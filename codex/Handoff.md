# Auctus V2 Handoff

**Last Updated:** 2026-04-30
**Current Gate:** G2 — Root Baseline and Demo Isolation
**Status:** ready to start

## Start Here

Future sessions must read, in this order:

1. `codex/Handoff.md` — this file.
2. `codex/SoloProgress.md` — active gate state and proof log.
3. `AGENTS.md` — solo agent rules, references, migration discipline.

The agent is now both original Dev A and Dev B. Preserve their domain split internally, but use root `codex/SoloProgress.md` as the active tracker. Real implementation lives in the root project; `dev-a-space/`, `dev-b-space/`, and `shared-space/` are reference archives only.

## Where Reference Material Lives

When a phase touches a topic, load from the archives:

- Domain ownership map and migration ranges → `dev-a-space/codex/references/build/shared/ownership.md`.
- Branch/commit/PR/migration-numbering rules → `dev-a-space/codex/references/build/shared/conventions.md`.
- V2.P1 bootstrap items A1–D2 and the V2.P1 completion gate → `dev-a-space/codex/references/build/shared/bootstrap.md`.
- Cross-domain dependency table for V2.P1–V2.P4 → `dev-a-space/codex/references/build/shared/buildflow.md`.
- Locked typed contracts (`role`, `route-policy`, `profile`, `session`, `funding`) → `dev-a-space/codex/references/build/contracts/`. The contracts have NOT yet been copied to root `build/contracts/` — that is part of G2.
- Migration mode discipline (`direct-main` vs `workspace-draft`) → `dev-a-space/codex/Migration.md`.
- Per-track phase BuildFlow proofs → `dev-a-space/codex/BuildFlow.md`, `dev-b-space/codex/BuildFlow.md`, `shared-space/codex/BuildFlow.md`.
- Pre-V2 product context → `dev-a-space/codex/references/claude/CurrentStatus.md` (root has no `claude/` folder; old docs reference `claude/CurrentStatus.md` but it lives only in the archives).

## Current Context

The old workspace files were read and analyzed:

- `dev-a-space/AGENTS.md`, `dev-b-space/AGENTS.md`
- Dev A / Dev B / shared progress files
- shared ownership, conventions, bootstrap, migration, buildflow docs
- reference contracts

Root repo state observed:

- Git branch: `develop` exists locally and on origin.
- Branch protection is enabled on `main` and `develop`: PRs required, force pushes/deletes disabled, required status check `App checks`.
- First CI run on pushed `develop` succeeded: run `25150670259`.
- PR #3 (`docs(shared): record branch protection setup`) merged into `develop`: `e2caebc5f874f9d50a414cac7dfd0c46189931e6`.
- PR #4 (`Develop`) merged `develop` into `main`: `b493a5802c99c1a401938af4b4b48f5ebd034948`.
- G1 is effectively closed. The only old-doc reference issue is that root `claude/CurrentStatus.md` is absent; use archived `dev-a-space/codex/references/claude/CurrentStatus.md` as the source.
- Root app is still legacy/demo state. No demo isolation has been performed yet.
- No root `build/contracts/**` yet — the locked references at `dev-a-space/codex/references/build/contracts/` need to be copied/relocated as part of G2.
- A nested duplicate folder `auctus-frontend/` exists. ESLint now ignores `auctus-frontend/**`. The folder itself has not been removed/decided yet.
- Supabase baseline files exist: `.env.example`, `supabase/README.md`, `supabase/migrations/.gitkeep`, `supabase/migrations/0000_init.sql`.
- Local `.env.local` exists with Supabase project values and is ignored by git.
- Supabase CLI is installed via Scoop (`2.95.4`), authenticated, initialized, linked to `kwfoxklfbrbgbmgyyfcl`, and `supabase db push` applied `0000_init.sql`.
- Root Supabase packages installed: `@supabase/supabase-js`, `@supabase/ssr`.
- Scraper bootstrap package exists under `scraper/`.
- `lib/env.ts` typed env-guard NOT yet added.
- Vitest NOT yet installed; no `npm test` script; no sanity contract test.
- `.github/workflows/ci.yml` and `.github/workflows/scrape.yml` exist as stubs.
- GitHub Actions secrets are set and verified by name: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

Verification observed:

- `npm run build` passed after the Supabase/workflow setup.
- `npm run lint` now exits successfully; warnings remain in legacy demo code.
- `cd scraper && npx tsx index.ts` prints `scraper bootstrapped` when run outside the sandbox.
- `supabase db push` succeeded and applied `0000_init.sql` to the remote project.

Resolved lint baseline:

- `auctus-frontend/**` is ignored by ESLint.
- Baseline lint errors were fixed. Remaining lint output is warnings only in legacy demo code.

## Files Added In This Setup Step

- `AGENTS.md`
- `codex/SoloProgress.md`
- `codex/Handoff.md`
- `.env.example`
- `.github/workflows/ci.yml`
- `.github/workflows/scrape.yml`
- `supabase/README.md`
- `supabase/config.toml`
- `supabase/.gitignore`
- `supabase/migrations/.gitkeep`
- `supabase/migrations/0000_init.sql`
- `scraper/package.json`
- `scraper/package-lock.json`
- `scraper/tsconfig.json`
- `scraper/index.ts`
- `scraper/README.md`
- `manual.md`

Files modified:

- `.gitignore`
- `eslint.config.mjs`
- `package.json`
- `package-lock.json`
- `components/ui/Input.tsx`
- `components/ui/Select.tsx`
- `lib/BusinessContext.jsx`
- `app/dashboard/page.tsx`
- `components/AIChatbot.tsx`
- `app/talent/page.tsx`

## Next Action

Start G2 (Root Baseline and Demo Isolation) from a new feature branch off `develop`. Do not collapse these or skip ahead:

1. Decide the fate of `auctus-frontend/`: ignore-only, remove, or move outside lint scope. Record the decision.
2. Copy the five locked contracts and `README.md` from `dev-a-space/codex/references/build/contracts/` into root `build/contracts/`.
3. Add `@contracts/*` path alias to `tsconfig.json` and verify with a throwaway `lib/_check.ts` import.
4. Execute the mixed-file surgery per the table in `dev-a-space/codex/references/build/shared/ownership.md`: legacy demo routes into `app/(demo)/**`; demo cards into `components/demo/**`; forum cards into `components/forum/**`; `StatsCard` into `components/ui/`; demo helpers into `lib/demo/**`; `data/*.json` into `data/demo/*.json`; `AIChatbot`/`ChatbotWrapper` into `components/demo/**` (the legacy AIChatbot stays mounted in `app/layout.tsx`).
5. Create empty domain skeleton folders with stub `index.ts`: `lib/auth`, `lib/profile`, `lib/forum`, `lib/funding`, `lib/matching`, `lib/session`, `components/auth`, `components/profile`, `components/forum`, `components/funding`.
6. Reverify `npm run lint` and `npm run build`. Demo URLs `/(demo)/funding`, `/(demo)/matchmaker`, `/(demo)/talent` must still load in dev.

After G2, G3 still needs: `lib/env.ts` typed env-guard with missing-var test, Vitest install + sanity contract test + `npm test`/`npm run test:watch` scripts, workflow verification, and deferred OAuth/email proof (see `manual.md`).

## Manual Proof Still Needed

These cannot be completed by file edits alone (see `manual.md` for the user-facing checklist):

- Supabase project creation and credentials confirmation.
- Google OAuth: Cloud Console redirect URI = `https://<project-ref>.supabase.co/auth/v1/callback` ONLY (do NOT add localhost there); Supabase Auth Provider config; Supabase URL Configuration sets Site URL = `http://localhost:3000` and adds `http://localhost:3000/auth/callback` to additional redirects.
- Email OTP / magic-link deliverability to a real inbox.
- Triggering `.github/workflows/scrape.yml` from the GitHub UI to confirm secrets are visible without printing values.

## Assumptions To Preserve

- Real implementation belongs in the root project. Do not implement inside `dev-a-space`, `dev-b-space`, or `shared-space` — they are reference archives only.
- Even as a solo agent, keep Dev A and Dev B domains architecturally separate. Dashboard code consumes funding ONLY through `lib/funding/queries.ts` and `components/funding/FundingSummaryTile.tsx`. Funding/matching code consumes profile/session ONLY through `lib/session/get-session.ts`, `lib/session/use-session.ts`, and `lib/profile/queries.ts#getRoleProfile`. No direct cross-domain table queries.
- Do not skip contracts and demo isolation before real auth/funding work. Migration order is also locked: `0001_profiles_base` → `0002_role_profiles` → `0003_funding` → `0004_scrape_metadata` → `0005_forum` → `0010_rls_identity` → `0020_rls_funding` (`0010` MUST land before `0020` because the funding RLS join reads `profiles.role`).
- Auth surface is Google OAuth + email OTP / magic-link only. Do NOT add GitHub OAuth, Microsoft OAuth, or password auth.
- Onboarding required vs deferred fields are locked per role; do not introduce extra fields, citizenship, or residency anywhere.
- Matching weights are locked per role (see G8 in SoloProgress).
- ETL source set is locked at exactly six official sources; CIHR is deferred; no private aggregators.
- Forum helpful-vote increments only through the `mark_reply_helpful` SECURITY DEFINER function; never via direct row updates.
- Five contracts (`role`, `route-policy`, `profile`, `session`, `funding`) become LOCKED at G4. After that, contract changes follow the protocol in `dev-a-space/codex/references/build/contracts/README.md` and get one line in SoloProgress "Contract Changes Consumed."
- Use the legacy AIChatbot only as demo (mounted in `app/layout.tsx`, importing only from `components/demo/`/`lib/demo/`). It is not part of V2 work.
