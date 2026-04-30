# Auctus V2 Handoff

**Last Updated:** 2026-04-30
**Current Gate:** G3 — Shared Tooling and Infrastructure Bootstrap
**Status:** G2 complete and merged to `develop`; G3 ready to start

## Start Here

Future sessions must read, in this order:

1. `codex/Handoff.md` — this file.
2. `codex/SoloProgress.md` — active gate state and proof log.
3. `AGENTS.md` — solo agent rules, references, migration discipline.

Root implementation is the real project. `dev-a-space/`, `dev-b-space/`, and `shared-space/` remain reference archives only. Preserve Dev A/Dev B domain boundaries even though one agent is doing the work.

## Latest Completed Work

G2 (Root Baseline and Demo Isolation) was completed on branch `g2-demo-isolation`.

G2 merged through PR #5 as `e95dc4d` (`refactor(restructure): isolate legacy demo surface`). Required `App checks` passed on PR #5.

Completed:

- Preserved nested duplicate `auctus-frontend/` outside lint/build scope. It remains ignored by git; TypeScript now excludes it too.
- Moved legacy routes into `app/(demo)/**`: funding, matchmaker, talent, test-cards, and test-components.
- Moved static JSON data into `data/demo/**`.
- Moved legacy data/context/AI helpers into `lib/demo/**`.
- Moved AI chatbot and V1 demo cards into `components/demo/**`.
- Moved `ThreadCard` and `ReplyCard` into `components/forum/**`.
- Moved `StatsCard` into `components/ui/StatsCard.tsx`.
- Added root `build/contracts/**` from the reference contract archive.
- Added `@contracts/*` path alias in `tsconfig.json` with `baseUrl: "."`.
- Added domain skeleton `index.ts` files under `lib/{auth,profile,forum,funding,matching,session}` and `components/{auth,profile,forum,funding}`.
- Updated app imports so the legacy AIChatbot mounted in `app/layout.tsx` imports only from `components/demo` and `lib/demo`.

## Files Changed

Real-project targets:

- `.gitignore`
- `tsconfig.json`
- `build/contracts/{README.md,role.ts,route-policy.ts,profile.ts,session.ts,funding.ts}`
- `app/(demo)/**`
- `app/layout.tsx`
- `app/providers.tsx`
- `app/dashboard/page.tsx`
- `app/forum/**`
- `components/demo/**`
- `components/forum/**`
- `components/ui/StatsCard.tsx`
- `components/layout/Navbar.tsx`
- `components/{auth,profile,funding}/index.ts`
- `data/demo/**`
- `lib/demo/**`
- `lib/{auth,profile,forum,funding,matching,session}/index.ts`
- `codex/SoloProgress.md`
- `codex/Handoff.md`

Deleted/moved from old locations:

- `app/funding/**`, `app/matchmaker/**`, `app/talent/**`, `app/test-cards/**`, `app/test-components/**`
- `components/AIChatbot.tsx`, `components/ChatbotWrapper.tsx`, `components/cards/**`
- `data/*.json`
- `lib/BusinessContext.jsx`, `lib/ai-responses.ts`, `lib/data-utils.ts`

## Verification

Commands run:

- `npx tsc --noEmit --pretty false` => failed first with `TS5090: Non-relative paths are not allowed when 'baseUrl' is not set`; fixed by adding `baseUrl: "."`.
- `npx tsc --noEmit --pretty false` => failed again because direct `tsc` read stale `.next/types` entries for old route paths, nested `auctus-frontend/**` duplicate TypeScript files, and a missing `./data-utils` import in `lib/demo/ai-responses.ts`; fixed by excluding `auctus-frontend` from `tsconfig.json`, correcting demo imports, and using Next build as the authoritative final typecheck.
- `npm run build` with temporary `lib/_check.ts` importing `@contracts/role` => success; this verified the `@contracts/*` alias. The throwaway file was removed afterward.
- `npm run lint` => success with 25 legacy warnings and 0 errors.
- `npm run build` => success. Build warning remains: Next inferred workspace root from an extra lockfile at `C:\Users\Jaska\package-lock.json`.
- Dev server smoke on `http://localhost:3000`: `/funding` => 200, `/matchmaker` => 200, `/talent` => 200.

Route note: `(demo)` is a Next route group, so browser URLs remain `/funding`, `/matchmaker`, and `/talent`; `/(demo)/...` is not a real URL segment.

## Migration Mode

G2 used `direct-main`: implementation landed directly in real-project root paths. No app code was edited inside `dev-a-space/`, `dev-b-space/`, or `shared-space/`.

## Open Blockers

No G2 blockers remain.

Manual proof still needed later:

- Google OAuth provider setup.
- Email OTP / magic-link deliverability.
- GitHub scrape workflow manual trigger proof.

## Exact Next Action

Start G3 from `develop`. The next code tasks are `lib/env.ts`, Vitest + `npm test` / `npm run test:watch`, and a sanity contract import test.

## Assumptions To Preserve

- Real implementation belongs in root only.
- Demo code is frozen under `app/(demo)`, `components/demo`, `lib/demo`, and `data/demo`.
- The nested `auctus-frontend/` duplicate is preserved but excluded from lint/build and ignored by git.
- Five contracts exist in root `build/contracts/**` but are not all locked until G4.
- Do not start real auth/funding runtime work until G3 and G4 are closed.
