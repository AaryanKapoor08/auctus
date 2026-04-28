# Shared Buildflow — Master Phase Tracker

The single source of truth for V2 phase order, true prerequisites, parallel tracks, handoffs, and integration points.

Phases are numbered `V2.P1` through `V2.P5` to avoid collision with the legacy V1 P1-P7.

---

## Coordination Rules

- **Parallel is the default.** A dependency exists only when a real prerequisite exists.
- Every dependency names the **exact deliverable**.
- "Wait for the other dev" without a named deliverable is not a valid blocker.
- Shared bootstrap (V2.P1) and integration (V2.P4) are the only legitimately coordination-heavy moments.
- Most feature work happens inside owned domains.
- All work merges to `develop` first; `main` only receives the `release: V2.PN complete` PR at each phase gate. See `build/shared/conventions.md` "Branching."
- **Phase-gate semantics.** A phase is satisfied when (a) every checklist item below is `[x]` with proof on `develop`, and (b) the `release: V2.PN complete` PR from `develop` into `main` is green and merged. "Green on `main`" in any gate or handoff means "the release PR for this phase merged" — not "an arbitrary commit on `main`."
- **Cross-phase handoffs** (e.g. Dev A's V2.P4 Step 5 waiting on Dev B's V2.P3 funding queries) trigger only after the upstream phase's `release: V2.PN complete` PR merges to `main`. Until then, the next phase has not started.

---

## V2.P1 — Shared Bootstrap & Restructuring

### Purpose

Make the repo safe for two developers to work in parallel without overlap.

### Owner

Shared. Default executor: Dev A. Reviewer: Dev B. Scraper skeleton item is owned by Dev B.

### Required Outputs

All checklist items in `build/shared/bootstrap.md`. Highlights:

- Mixed-file surgery PR merged. Demo URLs work. Build green.
- `app/`, `components/`, `lib/` reorganized to the target shape in `ownership.md`.
- `supabase/migrations/` exists; baseline `0000_init.sql` applied to shared dev DB.
- `.env.example` complete; `lib/env.ts` env-guard shipping.
- `@supabase/supabase-js` and `@supabase/ssr` installed.
- `tsconfig.json` resolves `@contracts/*`.
- `npm test` green with one sanity test.
- `.github/workflows/ci.yml` green on a real PR.
- `scraper/` skeleton runs end-to-end.
- All five contract files at `// STATUS: LOCKED`.

### Completion Gate

Every checkbox in `bootstrap.md` "V2.P1 Completion Gate" is ticked. Both devs can `git pull main` and start their V2.P2 step 1 with zero ambiguity about what they own.

### Unblocks

V2.P2 for both tracks.

---

## V2.P2 — Parallel Domain Foundation

### Purpose

Both devs build skeletons inside their owned folders. No cross-domain code yet.

### Dev A Track (see `build/dev-a/buildflow.md` Step 1)

- Supabase auth wiring (sign-in, sign-out, callback).
- Google OAuth plus email OTP / magic-link sign-in (providers configured in V2.P1 B6/B7). GitHub, Microsoft, and password auth stay deferred.
- Session helpers in `lib/session/` publishing `Session`, `GetSession`, `UseSession`.
- Migration `0001_profiles_base.sql` applied for base profile (with nullable role) + session support. Role-specific profile tables and forum schema wait for V2.P3.
- Route policy registry plumbing shipped (`authPolicies` populated; `combineRegistries` exposed; placeholder `lib/funding/route-policies.ts` exporting an empty registry so middleware does not crash before Dev B's Step 1 lands).
- Profile pages scaffolded (no persistence yet — that lands in V2.P3 Step 2).

### Dev B Track (see `build/dev-b/buildflow.md` Steps 1-2)

- Migration `0003_funding.sql` applied (unified `funding` table + `funding_preferences`, status enum, role-aware index).
- `lib/funding/queries.ts` publishes `ListFundingForRole`, `GetFundingById`, `GetFundingSummariesForUser` against a seeded dataset (`supabase/seeds/funding_seed.sql`); `GetFundingSummariesForUser` returns recent items without scoring at this stage.
- `lib/funding/preferences.ts` exposes read/upsert/clear helpers for `funding_preferences` (DB-backed; no cookie persistence).
- `lib/funding/filter-definitions.ts` ships role-specific filter definitions consumed by `FundingFilters.tsx`.
- Funding listing pages scaffolded under `app/(funding)/{grants,scholarships,research-funding}/page.tsx`. Show seed data; if `GetSession()` not yet on `develop`, hard-code the role per route as a temporary measure (replaced in a one-line follow-up).
- `lib/funding/route-policies.ts` overwrites Dev A's V2.P2 placeholder with the real `fundingPolicies` registering `/grants` (business), `/scholarships` (student), `/research-funding` (professor) per `RoutePolicy` shape.

### Real Dependencies in V2.P2

| Dependency | What unblocks | Owner |
|---|---|---|
| `Role` enum LOCKED | Dev B's funding query uses `role` field | Dev A → Dev B (already LOCKED in V2.P1) |
| `RoutePolicy` shape LOCKED | Dev B can register funding routes | Dev A → Dev B (already LOCKED in V2.P1) |
| `Session` shape LOCKED | Dev B's role-aware visibility code can read session | Dev A → Dev B (LOCKED in V2.P1 D2) |

That is it. There are no other true dependencies in V2.P2.

### Completion Gate

- Dev A: Google and email OTP / magic-link sign-in work end to end on a fresh browser; profile pages render placeholder data.
- Dev B: `/grants`, `/scholarships`, `/research-funding` render seed data; query helpers callable from a Vitest test; saved funding preferences round-trip for a test user.
- Both: typecheck, lint, build, test all green on `develop`, and the `release: V2.P2 complete` PR is green and merged to `main`.

### Unblocks

V2.P3 for both tracks.

---

## V2.P3 — Parallel Core Delivery

### Purpose

Real persistence inside each domain. Still no cross-domain code beyond the locked contracts.

### Dev A Core Delivery

- Real role selection during onboarding.
- First-run onboarding captures the locked minimum role-specific profile fields needed for matching; lower-priority fields can be deferred to profile editing.
- `business_profiles`, `student_profiles`, `professor_profiles` migrations + persistence (Dev A Steps 3-4).
- Real forum: `threads` + `replies` CRUD with real authorship.
- Route protection live: `middleware.ts` consults the combined `RoutePolicyRegistry` and gates routes by role.

### Dev B Core Delivery

- Real funding listing with role-aware filtering, saved defaults from `funding_preferences`, and detail page per type.
- `lib/matching/` per-role match scoring functions reading `RoleProfile` (the LOCKED shape).
- ETL pipeline: scrapers, normalize, dedupe, expire, upsert into `funding`.
- `funding`-side RLS migrations applied.
- Daily scrape workflow enabled (cron uncommented in `scrape.yml`).

### Real Dependencies in V2.P3

| Dependency | What unblocks | Owner |
|---|---|---|
| `Profile` + `RoleProfile` LOCKED | Dev B's `lib/matching/` can score real users | Dev A → Dev B (already LOCKED at V2.P1 D2) |
| `lib/profile/queries.ts` `getRoleProfile` published | Dev B can wire `GetFundingSummariesForUser` to scoring (Dev B Step 3 task 5) | Dev A → Dev B |
| `0010_rls_identity.sql` applied to shared dev DB | Dev B's funding RLS (`0020_rls_funding.sql`) can join `profiles.role` safely | Dev A → Dev B |
| `funding` table populated by ETL | Dev A's dashboard tile can call `GetFundingSummariesForUser` and get back real rows during V2.P4 | Dev B → Dev A (consumed in V2.P4, not V2.P3) |

Note: matching tasks 1-4 (the unit-tested scorer functions) are gated only on the LOCKED `Profile` shape, not on Dev A's runtime helpers. Dev B can implement and unit-test matchers immediately upon entering V2.P3. Only the wiring of `GetFundingSummariesForUser` to scoring (task 5) needs `getRoleProfile` from Dev A.

### Completion Gate

- Dev A: a real user signs in, picks a role, completes onboarding, edits profile, posts a thread, replies. All persisted.
- Dev B: a real user (created via Supabase dashboard with a manual role assignment) sees role-appropriate funding. ETL run produces ≥ 1 new funding row from at least one source.
- Both: tests cover their domain's happy path.

### Unblocks

V2.P4.

---

## V2.P4 — Controlled Integration

### Purpose

Wire cross-domain features. The only phase where both devs intentionally edit shared composition points.

### Integration Targets

| Target | Owner of composition | Consumes |
|---|---|---|
| Dashboard funding summary tile | Dev A (composer) | Dev B's `GetFundingSummariesForUser` + `FundingSummaryTile` |
| Dashboard expiring-deadlines tile | Dev A (composer) | Dev B's `GetFundingSummariesForUser` (filter on `deadline`) |
| Role-aware navbar (funding link per role) | Dev A | `Role` enum + `ROLE_DEFAULT_ROUTE` |
| Landing page CTAs | Dev A | none (static) |
| Forum role badge on author | Dev A | `Profile.role` (already inside Dev A's domain) |
| Funding RLS reading `profiles.role` | Dev B | `profiles` table (read-only via SQL) |
| Real session in funding listing | Dev B | `GetSession` from Dev A (replaces Step 2 hard-coded role) |
| Saved funding preferences | Dev B | `funding_preferences` rows keyed by `user_id` + `role` |

### Required Handoffs

- Dev A confirms: `Profile`, `Session`, `Role`, `RoutePolicyRegistry` are all LOCKED and shipped on `main` via the V2.P3 release PR.
- Dev B confirms: `FundingItem`, `FundingQuery`, `FundingSummary`, `ListFundingForRole`, `GetFundingSummariesForUser`, `GetFundingById` are shipped on `main` (via V2.P3 release) with real ETL data.
- Both confirm: V2.P4 integration PRs target `develop` and land in this order — (1) Dev B publishes summary endpoint stable on `develop`; (2) Dev A wires dashboard tile on `develop`. The `release: V2.P4 complete` PR promotes both at once.

### Shared Files Likely Touched

- `app/dashboard/page.tsx` — Dev A only.
- `components/layout/Navbar.tsx` — Dev A only.
- `app/page.tsx` — Dev A only.
- New shared types — added to `build/contracts/` per the change protocol, not invented in domain folders.

### Completion Gate

A real user of each role can:

1. Sign in with Google or email OTP / magic link.
2. Land on their role-appropriate dashboard.
3. See real funding summaries and expiring-deadlines tile on the dashboard.
4. Click through to the funding listing for their role.
5. Open a funding detail page and see real eligibility data.
6. Open the forum, post a thread, get a reply, see the role badge.

### What must NOT happen in V2.P4

- No new fields added to `build/contracts/*.ts` without the change protocol.
- No edits to the other dev's owned folders. Integration happens via published exports only.
- No commits straight to `main`. The phase-completion `develop → main` PR is the only path.

### Unblocks

V2.P5.

---

## V2.P5 — Hardening & Release Prep

### Purpose

Stabilize the new core platform after integration.

### Shared Outcomes

- Tests cover core user flows (sign-in, onboarding, profile edit, forum CRUD, funding list per role, dashboard render).
- ETL has a data-quality test (no funding row with `amount_min > amount_max`, no past-deadline rows with `status='active'`, etc.).
- Demo behavior in active scope is removed (no V2 page imports from `lib/demo/` or `components/demo/`).
- README updated with: env vars, dev setup, Supabase migration command, scraper run command.
- Deployment env vars documented for later hosting setup. The repo is not currently deployed, so no Vercel production configuration is required in V2.P5.

### Owners

- Dev A: identity/community test coverage, README, demo-import audit on owned files.
- Dev B: funding/ETL test coverage, scraper docs, demo-import audit on owned files.
- Shared: deployment readiness checklist.

### Completion Gate

- All checks in this phase tick.
- A QA pass by both devs against a third Supabase test project succeeds end-to-end.

---

## Deferred Beyond Current Window

- AI chat integration (legacy chatbot stays mounted as-is).
- Talent product work.
- Matchmaker product work.
- Major redesign exploration.

---

## Expected Handoff Deliverables

### Dev A → Dev B (named, by gate)

| Deliverable | Type | LOCKED by |
|---|---|---|
| `build/contracts/role.ts` | type | V2.P1 |
| `build/contracts/profile.ts` | type | V2.P1 |
| `build/contracts/session.ts` | type | V2.P1 |
| `build/contracts/route-policy.ts` | type | V2.P1 |
| `lib/session/get-session.ts` runtime export of `GetSession` | runtime | V2.P2 |
| `lib/auth/route-policies.ts` runtime export of `combineRegistries` + placeholder `lib/funding/route-policies.ts` | runtime | V2.P2 |
| `supabase/migrations/0001_profiles_base.sql` applied | DB | V2.P2 |
| `lib/profile/queries.ts` runtime export of `getRoleProfile` | runtime | V2.P3 |
| `supabase/migrations/0002_role_profiles.sql` applied | DB | V2.P3 |
| `supabase/migrations/0010_rls_identity.sql` applied | DB | V2.P3 |

### Dev B → Dev A (named, by gate)

| Deliverable | Type | LOCKED by |
|---|---|---|
| `build/contracts/funding.ts` | type | V2.P1 |
| `lib/funding/queries.ts` exports `ListFundingForRole`, `GetFundingById`, `GetFundingSummariesForUser` | runtime | V2.P2 (against seed); V2.P3 (against real ETL data) |
| `lib/funding/route-policies.ts` exports `fundingPolicies` registry | runtime | V2.P2 |
| `lib/funding/preferences.ts` exports preference helpers | runtime | V2.P2 |
| `components/funding/FundingSummaryTile.tsx` (consumed by Dev A's dashboard) | runtime | V2.P2 (presentation); V2.P4 (wired with real data) |
| `supabase/migrations/0003_funding.sql` applied (`funding` + `funding_preferences`) | DB | V2.P2 |
| `docs(scraper): verify V2 ETL sources` PR merged (per-source robots.txt + ToS notes for the six already-locked sources) | docs | V2.P3 (before Step 4 implementation) |
| `supabase/migrations/0004_scrape_metadata.sql` applied | DB | V2.P3 |
| `supabase/migrations/0020_rls_funding.sql` applied | DB | V2.P3 |
| `funding` table populated from ETL run | data | V2.P3 |

---

## Shared Success Condition

The project succeeds only if:

- Both devs work mostly independently through V2.P2 and V2.P3.
- The shared buildflow contains only real prerequisites.
- Ownership boundaries are respected.
- Integration in V2.P4 happens through contracts, not opportunistic edits.

## How Each Dev Knows They Are Done With A Phase

A phase is done when:

1. Every checkbox under the corresponding step in `build/dev-{a,b}/progress.md` is `[x]` with proof shown — not just code written.
2. The "Completion Gate" section above for that phase is satisfied.
3. The `develop → main` PR titled `release: V2.PN complete` has both devs' approvals.
4. The merge into `main` is the canonical "phase shipped" event; only then can the next phase start.
