# Auctus V2 Critique

## Executive Summary

Auctus V2 is structurally further along than its docs suggest — auth, RLS, role profiles, matching, scraper ingestion, and a composed dashboard all exist and the test suite (25 files / 117 tests) is green. But the product is not demo-ready and is several specific, fixable steps away from public-beta-ready. The biggest risks, in order:

1. **PostgREST `.or()` filter injection** in `lib/funding/queries.ts` and `lib/forum/queries.ts`. User-supplied search strings are concatenated into filter expressions that PostgREST parses as DSL. This is real, exploitable, and easy to fix.
2. **Profile email leakage**. The `profiles authenticated read` RLS policy is `using (true)` and the `profiles` table contains `email`. Any signed-in user can list every other user's email. This is a privacy bug.
3. **Public funding read RLS is unbounded by role**. `0024_public_funding_reads.sql` opens funding reads to `anon, authenticated` with `using (status = 'active')` and drops the role-scoped policy. That is correct for guest browse, but it also means signed-in users can read every funding row across roles via the API directly, even though the dashboard composer asks for role-scoped data. The previous role-aware boundary is gone — the boundary now lives only in app code.
4. **Demo chatbot mounted on every page** (`app/layout.tsx` → `ChatbotWrapper`). The legacy AIChatbot, with hardcoded "Aroma Coffee House" demo context, renders on landing, dashboard, profile, sign-in, and funding pages. This is the most visible "this is a prototype" tell in the product.
5. **Stale demo routes still ship in the production build**: `/funding`, `/matchmaker`, `/talent`, `/test-cards`, `/test-components`, `/funding/[grantId]` are all reachable in `npm run build`. Guests typing those URLs hit unstyled prototype pages.
6. **Onboarding has no error UI**. If `complete_onboarding` throws, the user sees the generic Next error page instead of a usable form-level message.
7. **Auth callback landing-vs-onboarding logic is inconsistent** between `proxy.ts`, `app/auth/callback/route.ts`, `app/(identity)/sign-in/page.tsx`, and `app/(identity)/sign-up/page.tsx` — five different code paths derive role and decide where to redirect, and they disagree about edge cases (no profile row, role briefly null after sign-up).
8. **`auctus-frontend/` orphan directory** still ships in the repo with its own `node_modules` and `.next/`. It is documented as a design reference for issues 17–19 and tracked as Issue 13, but it inflates clones, complicates Turbopack root resolution, and is a confusion magnet.
9. **README and Handoff docs lie about the current product**: README still says "Google OAuth + magic link" (magic link was removed in Issue 21), the migration table omits 0011 and 0021–0024, and the metadata title still says "Business Growth Platform … Fredericton".
10. **The dashboard "redesign"** (`app/dashboard/page.tsx`) is uncommitted per Handoff and the modified file shows up in `git status`. It is a meaningful UX change — committing it on `main` should be deliberate, not slipped in with the next unrelated commit.

The build is structurally sound and the test net is good. The list below is intentionally specific and direct.

---

## Critical Findings

### C1. PostgREST `.or()` injection in funding and forum search
- **Severity:** Critical
- **Area:** Data layer
- **Files:** `lib/funding/queries.ts:51-55`, `lib/forum/queries.ts:135-139`
- **What is wrong:** Both queries do
  ```ts
  request.or(`name.ilike.%${query.search}%,provider.ilike.%${query.search}%,description.ilike.%${query.search}%`);
  ```
  PostgREST treats `,`, `(`, `)`, `:` and `.` as DSL syntax inside an `.or(...)` argument. A search string like `%,status.eq.expired` rewrites the OR clause and exposes archived/expired rows or returns unexpected joins. With public funding reads now on `anon, authenticated`, the only protection is the SELECT policy + the `status='active'` predicate, which is exactly what an injected fragment can override.
- **Why it matters:** Anyone — including an unauthenticated visitor on `/grants?search=...` — can craft search params that bypass intended filters. For the forum, a signed-in user can craft inputs that filter on fields not intended to be searched. Even where the underlying tables don't have secrets, this is a known antipattern that will get flagged by any security review.
- **Recommended fix:** Escape PostgREST reserved characters before interpolating, or rebuild the OR clause via individual `.or()` calls or a server-side RPC. At a minimum: strip `,`, `(`, `)`, `:`, leading `.` and `*` from `query.search` before substitution; consider `replace(/[,()*:]/g, "")` plus `replace(/\\/g, "")` and reject queries longer than ~128 characters.

### C2. Profile email visible to every authenticated user
- **Severity:** High
- **Area:** Identity / RLS
- **Files:** `supabase/migrations/0010_rls_identity.sql:9-14`, `lib/profile/queries.ts:30-34`, `app/profile/page.tsx:97-100`, `lib/session/get-session.ts`
- **What is wrong:** Policy `profiles authenticated read` is `using (true)`. The `profiles` table contains `email` (`0001_profiles_base.sql`). A signed-in user can `select id, email from profiles` for everyone.
- **Why it matters:** Email is PII. It's also the value the forum or any future feature could leak via `select` on profiles join. The forum thread author select already pulls `id, display_name, role` only — but nothing prevents a malicious client from selecting `email` directly.
- **Recommended fix:** Replace the blanket SELECT policy with either (a) a column-restricted view that exposes only `id, display_name, role, avatar_url` to other authenticated users and a stricter `using (id = auth.uid())` policy on the base table, or (b) an RLS predicate of `id = auth.uid()` plus a SECURITY DEFINER `get_public_profile(uuid)` function for forum lookups.

### C3. `0024` removed role-scoped funding RLS without a replacement
- **Severity:** High
- **Area:** Funding RLS / data isolation
- **File:** `supabase/migrations/0024_public_funding_reads.sql`
- **What is wrong:** The migration drops `funding role select` (the role-aware policy from `0020`) and replaces it with `funding active public select using (status = 'active')` to `anon, authenticated`. After this migration, an authenticated user can `select * from funding` and read all roles' rows directly, bypassing the role-aware boundary the rest of the app assumes.
- **Why it matters:** Public guest browse is a valid product decision (Issue 7), but signed-in users now have a strictly weaker isolation contract than the one called out in `AGENTS.md` ("Cross-domain rule"). If a future feature ever stores something role-private in the `funding` table (sponsor contacts, internal notes, draft programs), it will leak. It also means `lib/funding/queries.ts#ListFundingForRole` cannot rely on RLS for role isolation — the `eq("type", ...)` is the only filter, and an attacker who calls Supabase directly can omit it.
- **Recommended fix:** Either accept the documented behavior and add a doc comment in `0024` plus an explicit data-class column on `funding` that says "this table is public-readable", or split funding into a public-readable view and a service-role-private columns table for anything sensitive. For now, at minimum, add a SELECT policy on any future role-private columns.

### C4. Demo chatbot mounted on every page in production
- **Severity:** High
- **Area:** UX / branding
- **Files:** `app/layout.tsx:7,44`, `components/demo/ChatbotWrapper.tsx`, `lib/demo/BusinessContext.jsx`
- **What is wrong:** `ChatbotWrapper` wraps `<AIChatbot />` in a `BusinessProvider` and mounts it under `<Providers>` for every route, including the public landing page, sign-in, sign-up, dashboard, profile, forum, and all funding pages. The chatbot pulls hardcoded business demo data.
- **Why it matters:** This is the single most "this is a prototype" thing in the app. A business owner, student, or professor will see a generic AI chatbot bubble pushing demo content; that breaks the seriousness of a funding product. The `AGENTS.md` "documented one-off exception" was supposed to keep the chatbot alive for legacy demo, not glue it to the multi-role V2 shell.
- **Recommended fix:** Either remove the chatbot from the V2 layout entirely, or restrict it to `app/(demo)/**` routes via the demo group's `layout.tsx`. Do not ship it to public users.

### C5. Stale demo routes are still publicly reachable
- **Severity:** High
- **Area:** Routing / hardening
- **Files:** `app/(demo)/funding/**`, `app/(demo)/matchmaker/**`, `app/(demo)/talent/**`, `app/(demo)/test-cards/**`, `app/(demo)/test-components/**`
- **What is wrong:** `npm run build` lists `/funding`, `/funding/[grantId]`, `/matchmaker`, `/talent`, `/test-cards`, `/test-components`, `/test-components/store-test` as functional routes. They are not in the navbar, but typing the URL works and shows old demo prototype content.
- **Why it matters:** Search engines and curious users will find them. They look broken next to the real pages and can confuse anyone debugging "why does `/funding` not match `/grants`."
- **Recommended fix:** Delete the demo routes from `app/(demo)/**` entirely now that V2 has real funding pages. If the AIChatbot is the only thing keeping them around, replace its data dependency or move the demo to a clearly separate `/demo/...` URL prefix that returns 404 in production.

### C6. Onboarding has no error UI
- **Severity:** High
- **Area:** Onboarding UX
- **File:** `app/onboarding/[role]/page.tsx:166-172`
- **What is wrong:** `completeOnboarding` is a server action that calls `parseOnboardingForm` (throws on invalid input) and `upsertRoleProfile` (throws on RLS / RPC failure). There is no try/catch and no error param routing. Validation failures bubble up as `app/error.tsx` "Something went wrong."
- **Why it matters:** Onboarding is one of the first three screens a new user sees. A NaN GPA, a missing business name (the DB enforces `not null`), or a unique-violation race produces a bare error screen with no way to fix the input.
- **Recommended fix:** Wrap the server action in `try { ... } catch (err) { redirect("/onboarding/${role}?error=...") }`, add a query-param-driven error banner pattern like `/sign-in` already has, and surface field-level messages for the DB CHECK constraints.

### C7. Auth callback / role landing logic duplicated 4× and inconsistent
- **Severity:** Medium
- **Area:** Auth
- **Files:** `proxy.ts:42-63`, `app/auth/callback/route.ts:36-46`, `app/(identity)/sign-in/page.tsx:54-71`, `app/(identity)/sign-up/page.tsx:64-79`
- **What is wrong:** Five different places ask "is the user signed in, do they have a role, where should they go." `proxy.ts` redirects null-role users to `/onboarding`; sign-in's server action also redirects to `/onboarding`; sign-up redirects to `/onboarding` after `signUp`; the auth callback redirects to `/onboarding`; sign-in/sign-up server components also redirect onboarded sessions to `/dashboard`. They use slightly different conditions: e.g. sign-up redirects to `/onboarding` even if Supabase returned `signUp` with no session and password sign-in failed because email confirmation is required (`/sign-in?notice=check_email`). The proxy then runs again and may redirect again.
- **Why it matters:** Edge cases (email-confirm-required, profile row missing because the trigger raced with the first request, brief role-null window) cause redirect loops or "wrong landing page" symptoms that are very hard to debug in a fresh browser.
- **Recommended fix:** Centralize in one helper (e.g. `lib/session/post-auth-route.ts`) that takes `(user, profile)` and returns the canonical next route. Use it from all four entry points so behavior never drifts.

### C8. Dashboard redesign is uncommitted but live
- **Severity:** Medium
- **Area:** Release hygiene
- **File:** `app/dashboard/page.tsx` (M in git status)
- **What is wrong:** Per Handoff: "Dashboard role-workspace redesign on 2026-05-04 is implemented but not yet committed." The diff covers role-specific copy, deadline outlook, profile context, opportunity mix, and forum activity. It is the most user-visible UI change in the project and is sitting in the working tree on `main`.
- **Why it matters:** Any unrelated next commit silently bundles this. The Issue 18 expectation was a deliberate UI restoration; this is a deliberate UI evolution beyond that. It deserves its own commit, screenshot proof, and a Handoff line.
- **Recommended fix:** Commit it as `feat(dashboard): role workspace redesign` with a short body explaining the scope, then update Handoff.

### C9. Application URL rendered as raw `<a href>` from scraped content
- **Severity:** Medium
- **Area:** Defense-in-depth / XSS
- **File:** `components/funding/FundingDetail.tsx:46-50`
- **What is wrong:** `<a href={item.application_url} target="_blank" rel="noreferrer">Apply</a>` renders the URL straight from the funding row. Although today writes are service-role only and sources are official, a single bad scraper run or admin paste can introduce `javascript:` or `data:` URLs that browsers will execute when clicked.
- **Why it matters:** It's a one-line risk that costs nothing to close. If anyone ever opens write access for moderation, it becomes a stored XSS.
- **Recommended fix:** Validate scheme is `http(s):` before rendering; otherwise drop or label the link. Apply the same check in any place `application_url` or `source_url` are output as a clickable link.

### C10. Scraper falls back to `rejectUnauthorized: false` on TLS chain failures
- **Severity:** Medium
- **Area:** ETL / supply chain
- **File:** `scraper/index.ts:42-77`
- **What is wrong:** `fetchHtml` retries with `rejectUnauthorized: false` when the chain can't be verified. This is silently no-MITM-protection.
- **Why it matters:** Scraped data lands in `funding` and is shown to every user. A MITM upstream of the scraper runner could inject malicious `application_url`s or descriptions. Government source intermediate certs occasionally need refresh — fix the trust store, don't disable verification.
- **Recommended fix:** Log loudly and bail by default; require an explicit `--insecure-source <id>` opt-in for known-broken intermediate-cert sources; record per-row that the row came from an insecure fetch.

---

## Product And UX Findings

### Landing (`app/page.tsx`)
- The landing page is content-rich and clearly communicates the value prop (browse first, personalize later). Stats counts are real. This page is the strongest in the app.
- The big "{N} active funding opportunities" badge fetches `ListFundingForRole` three times in `Promise.all`. Each call hits Supabase and pulls full rows just to count. This is expensive and slow. Replace with a single `select count` per type, or one query grouped by type.
- The `<main>` element wrapping in `app/layout.tsx` plus the `<main className="min-h-screen ...">` in `app/dashboard/page.tsx`, `app/profile/page.tsx`, `app/profile/edit/page.tsx` produces nested `<main>` elements. Invalid HTML; trips axe and a11y reviewers.
- The "Live opportunities" preview shows the first two from each category. Sorting is by `created_at desc`, so what guests see is whatever the scraper last inserted, not anything curated. It looks fine today but a bad scraper run can poison the landing.
- There is no clear story about what `Auctus AI` does — the wordmark says AI but the product currently has no AI features beyond a demo chatbot.

### Sign-in / Sign-up
- Reasonable. Both pages redirect already-onboarded users to `/dashboard`.
- The sign-up flow's fallback path is brittle (see C7). The "Create account" button is `variant="outline"` and Google is `variant="primary"` — visually that's right (encourage Google) but gives sign-up a weaker affordance than sign-in. Consider re-balancing.
- No "forgot password" link, no password-reset route. This is required before any real public beta.
- Password input has no minimum length / strength UI. The 8-char minimum is enforced by Supabase server-side; the user gets a generic error instead of a clear inline rule.
- `/sign-out` is POST-only and is invoked from the navbar via `<form action="/sign-out" method="post">`. There is no CSRF token. This is acceptable because Supabase cookies use SameSite=Lax and `sign-out` only logs the current user out, but it is worth noting.

### Onboarding (`/onboarding`, `/onboarding/[role]`)
- Role selector is clean.
- The role forms are short (good) but business and student ask for fields that are then ignored by matching: `business_stage` is parsed for tags but not saved (`toDetails` ignores it); `funding_basis` is used only to derive Need/Merit tags, not stored. Users will not understand why answers don't appear in their profile later.
- Business form has no `industry` Input — it has only a `SelectField` with five generic options ("Technology / software", etc.). The `business_profiles.industry` column then contains those literal strings. Matching against the funding `eligibility.industry` array becomes nearly random because scraped rows use different vocab.
- Validation is minimal. GPA and revenue accept any numeric value (negative GPAs, $-1000 revenue). DB CHECK constraints will catch only `education_level` and `career_stage`.
- Onboarding does not give the user any "what funding will I see?" preview. With only 5 questions, it should be possible to show "you'll see ~N matching scholarships" before they submit, which is what Issue 20 is asking for.
- After submission, the user is dropped on `/dashboard` cold. There is no welcome state, no "tour", no first-run banner.

### Dashboard (`app/dashboard/page.tsx`, uncommitted redesign)
- Strong improvement over the old layout. Header, stat cards, top-matches list, deadline outlook, profile sidebar, opportunity mix, and forum activity all feel coherent.
- The "Best current match" hero shows `bestScore || "New"`. With the way matching can default to 0 when nothing matches, "New" is a misleading label — that score is `null`, not "new opportunity."
- The `Largest listed amount` stat is computed from `allRoleFunding` (up to 200 rows). For students, 485 active rows are loaded just to compute one number. The dashboard is doing two big reads (`fundingSummaries` 80, `allRoleFunding` 200) per page load.
- Deadline outlook uses `ceil((due - asOf) / day)` in UTC and `daysUntil` in `FundingBrowser` uses local `setHours(0,0,0,0)`. Two different "today" reference points → off-by-one on dashboards vs filter results around UTC midnight.
- Profile highlights show "Not set" for many fields the user never had a chance to fill. Onboarding does not prompt for `description`, `year_established`, `website`, `graduation_year`, `h_index`, `department`. The dashboard then says "Department: Not set" until the user finds `/profile/edit`. This makes the profile look unfinished by default.

### Funding browse (`/grants`, `/scholarships`, `/research-funding`)
- `FundingBrowser` is the strongest piece of the V2 UI. The grouped facets, profile-recommended chips, deadline radio, and sort dropdown work well.
- The browser does ALL filtering client-side after a single fetch. For 500+ scholarships this is a lot of HTML; first paint shows everything before filters apply. Consider paginating or virtualizing.
- Each role page does its own `getRecommendedFundingTags(role)` and `getSession()` even though `getSession()` is also computed in `app/layout.tsx` and the navbar. Server-side fetches stack up.
- `FundingDetail` shows the deadline as a raw ISO string in a Badge: `<Badge variant="success">{item.deadline ?? "Rolling deadline"}</Badge>` (line 18). Cards format dates correctly, detail pages do not.
- `FundingFilters.tsx` is unused dead code now that `FundingBrowser` does everything client-side. Drop it or repurpose it.
- Empty state is functional but tells the user only "Try clearing one category or widening the deadline range." Without a "show me an example" link, a user who lands on a strict filter combo just bounces.
- "Apply" button opens the application URL in a new tab. There is no save / track functionality. A funding discovery product without "save grant" is the single biggest missing feature.

### Forum (`/forum`, `/forum/[threadId]`, `/forum/new`)
- Forum requires auth (route policy `/forum require_auth: true`). Issue 8 anticipates guest read-only forum; that is not implemented.
- No moderation: no flag/report, no admin delete, no rate limit. A signed-in user can post unlimited threads.
- `parseTags` strips `#` and lowercases — fine. There is no cap on body length.
- Helpful-vote is well done at the SQL level (atomic RPC, idempotent insert).
- Search uses the same vulnerable `.or()` pattern as funding (see C1).
- Thread/reply rendering uses raw text. It is safe (React escapes), but there is no markdown / line break rendering, so multi-paragraph threads collapse into a wall of text.

### Profile (`/profile`, `/profile/edit`)
- Profile page exists and is decent. The "Delete account" card is unusually prominent and high-stakes for a product still in dev — consider tucking it behind a Danger Zone tab once polish lands.
- Edit form has no error handling — same pattern as onboarding (C6).
- `/profile/edit` shows raw schema field names like `Year Established`, `Graduation Year`, `H Index` that onboarding never asks about, so users are forced to guess.
- The profile page renders `email` from `profile.base.email` even though that column may be empty from social sign-up depending on Supabase trigger handling. Worth verifying after Google OAuth proof.

### Sign-out
- POST-only route works. The navbar form correctly posts. After sign-out, redirect goes to `/`, which is correct.
- Mobile menu has the same form duplicated. Clicking sign-out in the mobile menu while it is open does not close the menu first; should ensure the menu closes on submit.

### 404 / error pages
- `app/not-found.tsx` and `app/error.tsx` exist and are styled. Good. `app/error.tsx` uses `digest` in the type but never displays it — for production debugging, log the digest somewhere visible to engineers.
- Many `notFound()` calls (e.g. `app/onboarding/[role]/page.tsx`) trigger `not-found.tsx`. The "Back to dashboard" CTA assumes the user is signed in — for the role 404 case the user IS signed in but pre-onboarding, and "Back to dashboard" sends them to `/dashboard` which then proxies to `/onboarding`. Loop is benign but ugly.

---

## Security And Auth Findings

- **OAuth scope and redirect URIs** are fine on paper (Supabase callback only in Google, app callback only in Supabase URL Configuration). But `manual.md` records that the Google client secret was visible in a screenshot on 2026-05-04. Treat that secret as compromised: rotate before any external proof.
- **Service role key**: only consumed in `lib/supabase/admin.ts` and `lib/funding/supabase.ts#createFundingServiceClient`. Both call `getServerEnv()` and do not log the value. `.env.example` has the right names. Good. The scraper Action workflow uses `SUPABASE_SERVICE_ROLE_KEY` from secrets; logs do not echo. Good.
- **`rejectUnauthorized: false` fallback** in the scraper (C10) is the one place service-impacting trust is silently lowered.
- **Email exposed via `profiles authenticated read`** (C2) — biggest privacy gap.
- **PostgREST `.or()` injection** (C1) in two queries.
- **Public funding RLS** is now `to anon, authenticated using (status='active')` (C3); the role boundary is gone for signed-in users at the DB level.
- **Cookie persistence**: `lib/supabase/server.ts` setAll is wrapped in `try/catch {}` to swallow errors when called from a Server Component. This is correct per @supabase/ssr guidance, but if you ever lose middleware refresh, sessions can expire silently. The proxy does refresh, so OK.
- **CSRF**: no explicit token. Server Actions and API routes rely on SameSite=Lax. Sign-out via POST is safe. `complete_onboarding` and account deletion run inside server actions which Next.js protects with origin checks. Acceptable, but document this in `manual.md`.
- **Open redirect**: none observed. Auth callback ignores any `next` param and redirects to fixed `/onboarding` or `/dashboard`. Good — but lose flexibility for deep-link returns.
- **Password sign-up**: no client-side strength UI; relies on Supabase server limits.
- **Forgot password**: not implemented anywhere. This is a release blocker for email/password users.
- **Email verification**: behavior depends on dashboard toggle. UI handles `notice=check_email` but there is no resend-email-verification action, no "wrong inbox" recovery, no verify-token landing.
- **Profile trigger**: `handle_new_user()` with `on conflict (id) do nothing` is correct. Trigger is `security definer set search_path = public`. Good.
- **Account deletion**: uses service-role admin client. The form posts a server action, but server action protection is the only thing preventing CSRF here. A confirmation field of `DELETE` is a fine UX guard.
- **Rate limiting**: none anywhere — sign-in, sign-up, forum post, helpful-vote can all be hammered. Acceptable for now; flag it.
- **Logging**: there is no audit trail anywhere. Every server action throws on failure but does not log who, when, or why.

---

## Data, Matching, And Scraper Findings

- **Match scoring** is mostly substring-style: `text.includes(text)` and `Array.includes(value)`. Score weights are reasonable per role, but the scorers are extremely sensitive to vocabulary mismatches. A student who picks "STEM" gets matched well; a student who picks "Health" gets few matches because the corpus uses "Indigenous Bursaries" / "Merit-based" tags more than field tags. Tag boost (`tagBoost` in `lib/matching/index.ts`) caps at +30, so a wholly tag-driven rank is impossible.
- **Score 0 vs score null**: The dashboard UI treats null as "Unscored" but treats 0 as a valid score (warning color). Many real items will score 0 because the scoring functions return 0 when the role-specific predicate fails. The "Best current match: 0%" experience is very common for a student whose `field_of_study` is not exactly STEM/Arts/Health/Trades/Leadership. Consider clamping scores below 10 to "no fit" with copy.
- **Scholarship corpus is dominated by Indigenous bursaries** (478 rows of 485). The dashboard for any non-Indigenous student will look thin — even though the system correctly says "you have 485 opportunities." This is data quality, not code, but the product needs to surface "filter by your field" prominently or the dashboard will feel empty.
- **Business funding**: 25 Federal, 21 Innovation, 15 Financing, 14 Advisory, 13 Digital, 12 Growth — small corpus per facet. Weighting `industry` 30 means a New Brunswick founder picking "Technology / software" can easily land at 30/100 and feel underserved.
- **Research funding**: 22 active rows total, with NSERC / SSHRC heavily over-represented. The professor's research_keywords get mapped to council scoring which expects council names — a professor entering "machine learning, fairness" will score 0 on council unless one of those words happens to appear in `eligibility.council`. This scorer is doing the wrong thing.
- **`numberInRange`**: returns `false` when both min and max are null, even though `null,null` should mean "no range constraint = pass." This is a subtle bug — it disqualifies revenue and employee scoring on funding rows that don't publish thresholds.
- **`itemHasText` substring trick**: matches `"art"` against `"smart manufacturing"`. False positives are baked in. Switch to whole-word match or canonical tags.
- **Dedupe key** is `(name|provider|type)` lowercased. Two scrape runs that pull the same opportunity with slightly different display names ("ISED Business Benefits Finder — application 2026" vs "ISED Business Benefits Finder") will create duplicate rows.
- **`expirePastDeadlines`** runs but uses today's date in the runner's TZ; in production the GitHub Action runs at 03:00 UTC so it expires anything past UTC midnight, which is fine, but document it.
- **Scraper certificate fallback** (C10).
- **`amount_max` for value display**: dashboard surfaces "Largest listed amount" using `amount_max`. Many rows have null `amount_max`. The user sees "Largest amount: $200,000" and assumes that is offered to everyone — it is the largest single grant in the role, not what they could win. Consider relabeling.
- **Rolling deadlines**: deadline = null is rendered as "Rolling" or "Rolling deadline" inconsistently. Matching does not penalize null deadline. OK but inconsistent copy.
- **Funding tags**: 0021–0023 backfills do good work, but the canonical taxonomy is duplicated across `lib/funding/filter-definitions.ts`, `scraper/canonical-tags.ts`, and the SQL backfills. Three copies will drift.
- **No test data isolation**: tests use mocks for queries, fine. But the seed file `funding_seed.sql` lives next to live data and can be re-applied by a careless `supabase db push --include-all`. Add a guard.

---

## Architecture And Code Quality Findings

- The contract-first split (`build/contracts/**`) is genuinely well done. Domain boundaries are respected at the import level.
- **Cross-domain leak**: `lib/funding/queries.ts` imports `@/lib/profile/queries` (`getProfileMatchTags`, `getRoleProfile`). Per `AGENTS.md`: "Funding/matching code consumes profile/session ONLY through `lib/session/get-session.ts`, `lib/session/use-session.ts`, and `lib/profile/queries.ts#getRoleProfile`." `getProfileMatchTags` was added later and is not in the published contract list. Either add it to the contract or proxy it through `getRoleProfile`.
- **Cross-domain leak (mild)**: `app/dashboard/page.tsx` calls `getRoleProfile`, `GetFundingSummariesForUser`, `ListFundingForRole`, `listThreads`. That is correct; it consumes published runtimes only. Good.
- **`Navbar.tsx` direct profile fetch**: the navbar reads `profiles` directly via `createClient().from("profiles").select(...)`. That is identity-domain code in a layout component — fine — but it bypasses `getRoleProfile`/`getSession`. Now there are three sources of truth for "who am I": `getSession` (server), `useSession` (client), and the navbar's direct profile read. They will get out of sync.
- **`useSession` re-runs on every pathname change** (`useEffect([pathname])`). This is cheap but causes a noticeable re-fetch flicker on the navbar avatar. Consider keying on `user.id` only and using `onAuthStateChange` for everything else.
- **Server / client boundaries**: `lib/forum/queries.ts` mixes server-only Supabase clients with non-React utilities. `requireSession` calls `getSession` which calls `cookies()`. That is server-only — fine — but the file does not declare `"use server"` or `"server-only"`. A future client component importing `listThreads` will fail at build with a confusing message. Add `import "server-only"` at the top.
- **Funding queries** also do not have `import "server-only"`.
- **File-level layering**: `app/dashboard/page.tsx` is 533 lines and contains a half-dozen helpers (`formatDate`, `formatCurrency`, `getTopTags`, `getNextDeadlines`, `getProfileHighlights`, `StatCard`). Move to `components/dashboard/*` — the dashboard composer module already exists (`lib/dashboard/composer.ts`). The "header / stats / two-column" body should be three components.
- **Type assertions**: `data as FundingItem[]`, `data as ProfileRow`, `data as RoleProfile["details"]`, `as ThreadRow[]`, `as ReplyRow[]`. Lots of `as` casts where Supabase's typed client could give safe types if a `Database` type were generated and threaded through. This is a future TypeScript debt item.
- **Tests**: 117 unit tests, but no integration tests against a real Supabase instance. The `funding-rls-sql.test.ts` is a static SQL diff test, not behavior. `route-policies.test.ts` covers the redirect logic. The "no integration test" gap means C2/C3 would not have been caught by tests.
- **Lint warnings**: 20 legacy demo warnings only. Drop them by deleting the demo code per C5.
- **`handoff.md` and `SoloProgress.md`** are exhaustive and well-maintained, but very long. They tell two different stories of the same week — consolidate.
- **`auctus-frontend/` orphan** (Issue 13). Large `node_modules`, separate `.next/`, separate `tsconfig`. This is what forced the `turbopack.root` pin. Delete it after the design references in Issues 17–19 are no longer needed.

---

## UI, Visual Design, And Accessibility Findings

- **Palette is monotonous**: every page is `bg-gray-50` with `bg-white` cards and `border-gray-200`. The few accent colors (`bg-orange-50/70` for deadlines, `bg-green-50` for "From your profile") are isolated. Result: nothing pops. The product reads as competent-but-bland.
- **Typography**: only Geist. No specimen treatment for headlines, no display weight contrast on hero pages. Heading sizes (`text-3xl` / `text-4xl`) are fine; line-height and tracking on the hero `text-6xl` ("Browse funding first…") feel cramped on desktop.
- **Card overload**: many sections wrap content in a `Card` with the same border treatment. Stack three or four and it feels like a settings page.
- **Spacing inconsistencies**: `app/dashboard/page.tsx` uses `gap-6 lg:grid-cols-[minmax(0,1fr)_360px]`, profile uses `lg:grid-cols-[280px,1fr]`. Pick a layout system and stick to it.
- **Icons**: `lucide-react` everywhere; the dashboard imports 14 icons. They are rendered at slightly different sizes (h-4, h-5, h-7) without a consistent rule. Define a sizing convention in `components/ui/`.
- **Mobile**: the navbar has a hamburger with mobile menu — works. The `FundingBrowser` filter sidebar stacks vertically below the cards on mobile (`lg:grid-cols-[280px_1fr]` defaults to 1-col). Fine, but the filter panel is large; on a phone, a user has to scroll past 20 facet rows before reaching results. Consider a collapsed accordion for mobile.
- **Tap targets**: chip filters at `py-1.5 px-3` are below the 44px tap target. Bump on mobile.
- **Accessibility**:
  - Avatar `<img alt="">` is decorative-only; OK with `alt=""` but the icon-only sign-out button should add `aria-label`.
  - The thread search uses `<input>` without an explicit label — the `Search` icon serves visually but not for screen readers.
  - The radio group "Deadline" uses `<input type="radio" name="deadline">` without a `<fieldset>`/`<legend>`. AX-Tree readers will hear "All deadlines, Next 30 days" but not the group name.
  - `Card` uses `border-orange-100 bg-orange-50/70 text-orange-700`. Contrast borderline on small text — verify with axe.
  - `<select>` elements have no visible chevron and no border on focus differentiation in dark mode (no dark mode anyway).
- **Loading states**: server components are blocking; the user sees a blank page until the funding query returns. Consider streaming with `<Suspense>` on the funding browser.
- **Empty states**: dashboard "No matches yet. Update your profile details to improve recommendations." is good copy. Forum empty state says "Start a discussion or adjust the current filters." — fine.
- **Footer**: present (`components/layout/Footer.tsx`). Was not reviewed in detail.
- **Branding tension**: "Auctus AI" wordmark suggests AI features. The product currently has none beyond a demo chatbot. Either add an AI surface (e.g. AI-summarized eligibility) or drop "AI" from the name.

---

## Missing Features

Prioritized; "core" = release blocker, "nice" = post-beta.

- **(core)** Forgot password / reset-password flow.
- **(core)** Email-verification resend + status page.
- **(core)** Save funding / "My funding" list.
- **(core)** Application tracking ("Applied", "Drafting", "Won/Lost") on saved funding.
- **(core)** Deadline reminders — at least an in-app "due in 7 days" badge; ideally email digest.
- **(core)** Account settings: change email, change password, manage active sessions, delete-account confirmation banner. `/profile` has Delete; nothing else.
- **(core)** Profile completeness meter so users feel a reason to fill `description`, `year_established`, `website`, `graduation_year`, `h_index`, `department`.
- **(core)** Saved filters / preferences UI bound to `funding_preferences`. The DB table exists; no UI ever writes to it.
- **(core)** Funding source badges on cards (Federal vs Provincial vs Council). Tags exist; the chip styling does not differentiate visually.
- **(core)** Public guest read-only forum (Issue 8 baseline expectation).
- **(core)** Search engine basics: meta descriptions per route, OpenGraph image, robots.txt. Currently only the root metadata exists and is wrong.
- **(core)** Production deployment plan: domain, hosting (Vercel?), Supabase prod project, secret rotation, error monitoring (Sentry/PostHog), uptime check.
- **(core)** Onboarding "preview matches before commit" (Issue 20).
- **(nice)** Role switching for users who span tracks (a professor who also runs a startup).
- **(nice)** Forum moderation: report, soft-delete, admin queue.
- **(nice)** AI summaries of long eligibility blocks (the only place "Auctus AI" would feel earned).
- **(nice)** Notifications: new matching opportunities, replies on your threads.
- **(nice)** Analytics: feature usage, funnel for sign-up → onboarding → first save.
- **(nice)** Admin / data moderation tooling for funding rows (correct typos, archive duplicates).
- **(nice)** Funding source attribution panel on detail pages: where the row came from, last scraped, license.
- **(nice)** Export / share: copy link, export saved list to CSV.

---

## Recommended Roadmap

### Must fix before demo
1. C1 — sanitize `.or()` search input in funding and forum.
2. C4 — remove demo chatbot from V2 layout.
3. C5 — delete legacy demo routes from `app/(demo)/**`.
4. C6 — add error UI to onboarding and profile-edit server actions.
5. C8 — commit the dashboard redesign explicitly.
6. README + metadata cleanup: drop "Business Growth Platform / Fredericton", drop "magic link", add 0011 / 0021–0024 to the migration table.
7. Decide on landing-page chatbot replacement (or remove it cleanly).
8. Rotate the leaked Google OAuth client secret.

### Must fix before public beta
1. C2 — restrict `profiles` SELECT to non-PII columns or move email out of broadly-readable shape.
2. C3 — re-add a role-aware funding policy or move any role-private columns out of `funding`.
3. C7 — centralize post-auth routing.
4. C9 — validate `application_url` scheme.
5. C10 — fix scraper TLS fallback.
6. Forgot-password flow.
7. Save-funding feature.
8. Account settings (change email/password).
9. Profile-edit error handling.
10. Deadline reminders surface (at least in-app).
11. Issue 13 — delete `auctus-frontend/`.
12. Server-only marker on `lib/funding/queries.ts` and `lib/forum/queries.ts`.
13. Tighten matcher: cap noisy substring matches, replace `numberInRange(null,null)` semantics, separate "no fit" from "0%".
14. Mobile tap-target audit, fieldset on radio groups, axe pass.
15. Production deploy: domain, env, monitoring, uptime, error reporting.

### Should fix after beta
1. Public read-only forum.
2. Forum moderation tools.
3. Notifications + email digests.
4. Saved filter UI bound to `funding_preferences`.
5. Onboarding preview ("we'll show you ~N matches").
6. AI summaries of eligibility (justify the "AI" in the wordmark).
7. Admin tooling.
8. Analytics, funnels, content metrics.
9. Generated Supabase types to remove `as` casts.
10. Integration tests with a test Supabase project.

---

## Render Performance Findings

The app feels slow because nearly every page is forced dynamic, every request triggers redundant auth round-trips, and large data payloads are sent to the client up front. None of this is unfixable — most of it is two-line changes — but together they make a meaningful difference.

### P1. Every route is `ƒ (Dynamic) — server-rendered on demand`
- **Where:** Build output. No `loading.tsx` anywhere. No route exports `revalidate`. Only `app/dashboard/page.tsx` explicitly sets `export const dynamic = "force-dynamic"`, but every other route is *implicitly* dynamic because `getSession()` calls `cookies()` in `app/layout.tsx`.
- **Why it matters:** Static rendering is free at the CDN edge; dynamic rendering costs a full Node SSR + Supabase round trips per request. The public landing page, public funding listings, and funding detail pages should be statically renderable (or ISR with a 60–300s revalidate) for guests.
- **Fix:** Move the per-request `getSession()` call out of the root layout into a small client component (the navbar already has `useSession`, so the server-side `getSession()` in the layout is largely redundant for guest pages). Then add `export const revalidate = 60` (or longer) to `app/page.tsx`, the three `app/(funding)/<role>/page.tsx` listings, and the detail pages. Use route-level `force-dynamic` only for `/dashboard`, `/profile`, `/profile/edit`, `/forum*`, `/onboarding*`, `/sign-in`, `/sign-up`, `/auth/callback`.

### P2. Auth runs twice per request (proxy + layout) and again on the client
- **Where:** `proxy.ts:39-49` (`supabase.auth.getUser()` + `profiles.select("role")`) and `lib/session/get-session.ts:25-40` called from `app/layout.tsx:31`.
- **Why it matters:** `auth.getUser()` is *not* a free local JWT decode — it makes a network round trip to Supabase Auth to validate the access token. Doing it twice per page request adds ~100–300 ms of latency before HTML starts streaming. Then `useSession` and the navbar each fetch profile data again on the client, so you also pay two more round trips after hydration.
- **Fix:**
  - In `app/layout.tsx`, replace the server-side `getSession()` with reading `request.cookies` only when needed, or accept a `null` initial session and let the client `useSession` hydrate it.
  - In `proxy.ts`, skip the profile read for routes whose policy doesn't depend on `role` (e.g. `/`, `/grants`, `/scholarships`, `/research-funding`, `/auth/callback`, `/sign-in`, `/sign-up`). Today the policy lookup happens *after* the DB call; flip the order.
  - Consider caching `profiles.role` keyed by `user.id` for the duration of one request via React's `cache()` so layout + page + navbar share one fetch.

### P3. No `<Suspense>` streaming anywhere
- **Where:** No `app/**/loading.tsx`, no `<Suspense>` boundaries inside server components.
- **Why it matters:** Next 16 streams partial HTML out of the box only when you give it `<Suspense>` boundaries. Without them, the user stares at a blank page until the slowest query (200-row funding read on dashboard) returns. With them, the header + navbar paint immediately, then sections fill in.
- **Fix:** Add `app/dashboard/loading.tsx`, `app/(funding)/grants/loading.tsx`, `app/forum/loading.tsx` with skeletons. Inside `app/dashboard/page.tsx`, wrap the four sections in `<Suspense fallback={<TileSkeleton />}>` so the Recommended / Deadlines / Forum tiles each stream independently.

### P4. Dashboard pulls 280 funding rows + threads to render one screen
- **Where:** `app/dashboard/page.tsx:220-225` — `FUNDING_CANDIDATE_LIMIT = 80`, `FUNDING_INVENTORY_LIMIT = 200`. All four queries fire in a `Promise.all`, but the result HTML still serializes those rows.
- **Why it matters:** Two Supabase reads of 80 + 200 rows means the user waits for both before any pixel paints. Most of the 200-row read is used only for `maxAmount` and `topTags` aggregations — those should be SQL aggregations, not a client-side reduce.
- **Fix:**
  - Move "largest amount", "rolling count", "top tags by frequency", and "opportunity mix" into a single SQL view or RPC (`dashboard_role_summary(p_role)`) that returns one small row.
  - Drop `FUNDING_INVENTORY_LIMIT` to 50 or remove the inventory query entirely.
  - Use `<Suspense>` per tile (P3) so the recommended-list query doesn't block the page header.

### P5. Funding browse ships the entire role corpus to the client
- **Where:** `app/(funding)/grants/page.tsx`, `app/(funding)/scholarships/page.tsx`, `app/(funding)/research-funding/page.tsx` all call `ListFundingForRole({ role })` with no `limit`. `FundingBrowser.tsx` then filters in memory.
- **Why it matters:** Scholarships has 485 active rows. The full HTML payload is on the order of several hundred KB before any user interaction. First contentful paint and time-to-interactive both suffer; mobile users feel it especially.
- **Fix:**
  - Server-render the first ~30 rows; lazy-load more via cursor pagination on scroll.
  - Or keep the current "single fetch" model but move filtering into a server action so only matching rows are sent.
  - Strip unused columns from the query (`description` is the heaviest; the card only shows the first three lines via `line-clamp-3`).

### P6. Landing page does three full role fetches just for counts
- **Where:** `app/page.tsx:23-28` — `Promise.all([... ListFundingForRole("business"), ListFundingForRole("student"), ListFundingForRole("professor")])`.
- **Why it matters:** Each call returns full rows, then `.length` is computed. For students that's 485 rows fetched and discarded.
- **Fix:** Add a `getActiveFundingCounts()` runtime helper that does one `select count(*) from funding where status='active' group by type` and call it instead. Cache with `unstable_cache` keyed by `"funding:counts"` for 5 minutes.

### P7. No query memoization within a single request
- **Where:** `lib/funding/queries.ts`, `lib/profile/queries.ts`, `lib/forum/queries.ts` — every call hits Supabase fresh, even when the same row is queried twice during the same render (e.g. `getSession()` in layout, page, and child components).
- **Why it matters:** Within a single SSR pass, calling `getRoleProfile(user_id)` twice does two round trips. React 19 + Next 16 ship `React.cache()` which deduplicates within a request.
- **Fix:** Wrap the read helpers (`getSession`, `getRoleProfile`, `getProfileMatchTags`, `ListFundingForRole`, `GetFundingById`) in `React.cache()`. One-line change per function.

### P8. No HTTP cache headers on public routes
- **Where:** Funding listings and detail pages are publicly readable but every response goes through Node SSR with no `Cache-Control` header.
- **Why it matters:** A guest browsing five funding pages re-renders each one server-side. With ISR (P1) plus `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`, the same five pages serve from edge cache after the first request anywhere in the world.
- **Fix:** Set headers via `next.config.ts` `headers()` for `/grants`, `/scholarships`, `/research-funding`, `/grants/:id`, `/scholarships/:id`, `/research-funding/:id`, and the public `/`.

### P9. `useSession` re-fetches on every pathname change
- **Where:** `lib/session/use-session.ts:13-55` — `useEffect([pathname])` triggers `loadSession()` again. `onAuthStateChange` is also subscribed.
- **Why it matters:** Click-to-paint feels janky because every navigation triggers an avatar flicker while the client refetches identity. The route change does not change the user's identity.
- **Fix:** Drop `pathname` from the dep array; rely on `onAuthStateChange` plus a `router.refresh()` from the post-auth flow to re-read the session.

### P10. Navbar fetches the profile separately on the client
- **Where:** `components/layout/Navbar.tsx:75-101`.
- **Why it matters:** Layout already has `display_name` and `avatar_url` available via `getSession()`/`getRoleProfile()`. The client-side fetch is a third round trip for the same fact.
- **Fix:** Pass `initialProfile` as a prop from `app/layout.tsx`, mirror the `initialSession` pattern. Skip the client fetch unless the prop is missing.

### P11. AIChatbot's BusinessProvider wraps every page
- **Where:** `app/layout.tsx:44`, `components/demo/ChatbotWrapper.tsx`. Even though `AIChatbot` itself is `ssr: false`, `BusinessProvider` runs on every render.
- **Why it matters:** Adds React tree depth, demo data parsing, and a context subscription cost on every page including sign-in. Marginal but real.
- **Fix:** Per critical finding C4, remove the chatbot from V2 entirely. If it must stay, gate its mount on `pathname.startsWith("/(demo)")` only.

### P12. `<img>` instead of `<Image>` for avatar
- **Where:** `components/layout/Navbar.tsx:147-152` (`{/* eslint-disable-next-line @next/next/no-img-element */}`).
- **Why it matters:** `next.config.ts` configures `image/webp`, `image/avif`, and several device sizes — none of that applies to a raw `<img>`. Avatar URLs from Google OAuth are 96×96 PNGs by default; could be 4–8× smaller as AVIF.
- **Fix:** Use `next/image` with `width={32} height={32}`. Add the Google avatar host to `images.remotePatterns`.

### P13. Forum `listThreads` does an N+1-style count
- **Where:** `lib/forum/queries.ts:127` — `select("...,replies(count)")` returns a count subquery per thread.
- **Why it matters:** Performance is fine at 20 threads; quadratic-ish slowdown as the corpus grows because PostgREST issues a count per joined row server-side. Forum index becomes the slowest page once threads pass ~100.
- **Fix:** Either denormalize a `reply_count` column on `threads` (updated via reply insert/delete trigger), or run a single aggregate query alongside `listThreads`.

### P14. Bundle size: full lucide-react and demo code shipped
- **Where:** `app/dashboard/page.tsx` imports 14 icons; `app/layout.tsx` ships the demo chatbot bundle even when not opened (it's dynamic-imported, but `BusinessProvider` is not).
- **Why it matters:** First load JavaScript is heavier than it needs to be.
- **Fix:** Modular imports for lucide are already tree-shaken by default. Bigger wins:
  - Delete `app/(demo)/**` (C5) → drops the entire demo data set + chatbot client bundle.
  - Delete `auctus-frontend/` orphan (Issue 13) → keeps Turbopack from scanning a duplicate tree.
  - Run `next build` with bundle analysis (`npx @next/bundle-analyzer`) to spot unexpected heavy deps.

### P15. Server actions over-revalidate
- **Where:** `app/forum/[threadId]/page.tsx` calls `revalidatePath('/forum/${threadId}')` on every helpful-vote, reply add, and (now) delete.
- **Why it matters:** Each `revalidatePath` invalidates the entire route's data cache. A helpful-vote that should bump one counter currently re-runs `getThread` + all replies fetches.
- **Fix:** Use `revalidateTag` with a per-thread tag (`thread:${threadId}`) instead of `revalidatePath`, and tag the `getThread` query.

### Summary table

| Issue | Approx user-visible cost | Effort | Priority |
|---|---|---|---|
| P1 forced dynamic | +200–600 ms TTFB on every page | Medium | High |
| P2 double auth round trip | +100–300 ms per nav | Low | High |
| P3 no Suspense | Blank screen until slowest query | Low | High |
| P4 dashboard 280-row read | +300–800 ms on dashboard | Medium | High |
| P5 full corpus to client | +200–800 KB HTML on funding pages | Medium | High |
| P6 3× landing fetch | +200–500 ms on first paint | Low | Medium |
| P7 no React `cache()` | Hidden 2× DB calls per page | Low | Medium |
| P8 no HTTP cache | Cold SSR for repeat guests | Low | Medium |
| P9 pathname-keyed `useSession` | Avatar flicker on every nav | Trivial | Medium |
| P10 navbar profile fetch | +1 round trip after hydrate | Low | Medium |
| P11 BusinessProvider on every page | Marginal | Trivial (with C4) | Low |
| P12 `<img>` not `<Image>` | Marginal per-image cost | Trivial | Low |
| P13 forum N+1 count | Slow once >100 threads | Low | Low (today) |
| P14 bundle weight | +40–80 KB JS first load | Low | Low |
| P15 over-revalidation | Extra DB calls per action | Low | Low |

Doing P1–P5 alone should cut typical page TTFB by roughly half and bring funding-listing payloads under 200 KB.

---

## Verification Performed

- `npm test` → 25 files / 117 tests passed (981ms).
- `npm run lint` → success with 20 legacy demo warnings only.
- `npm run build` → success. Build output lists `/grants`, `/scholarships`, `/research-funding`, `/dashboard`, `/profile`, `/profile/edit`, `/forum`, `/forum/[threadId]`, `/forum/new`, `/sign-in`, `/sign-up`, `/sign-out`, `/auth/callback`, AND legacy `/funding`, `/funding/[grantId]`, `/matchmaker`, `/talent`, `/test-cards`, `/test-components`, `/test-components/store-test`.
- `git status --short` → `M app/dashboard/page.tsx`, `M codex/Handoff.md`, `?? critique.md`. Dashboard redesign is uncommitted.
- File reads: all files in Critical Findings, plus `app/page.tsx`, `app/layout.tsx`, `app/providers.tsx`, `app/dashboard/page.tsx`, `app/profile/page.tsx`, `app/profile/edit/page.tsx`, `app/onboarding/page.tsx`, `app/onboarding/[role]/page.tsx`, `app/forum/page.tsx`, `app/(funding)/grants/page.tsx`, `app/(funding)/grants/[id]/page.tsx`, `app/(identity)/sign-in/page.tsx`, `app/(identity)/sign-up/page.tsx`, `app/(identity)/sign-out/route.ts`, `app/auth/callback/route.ts`, `app/not-found.tsx`, `app/error.tsx`, `proxy.ts`, `lib/env.ts`, `lib/supabase/{client,server,admin}.ts`, `lib/session/{get-session,use-session}.ts`, `lib/auth/route-policies.ts`, `lib/funding/{queries,role-mapping,filter-definitions,preferences,supabase,route-policies}.ts`, `lib/funding/recommended-tags.ts` (referenced), `lib/profile/{queries,upsert,delete-account}.ts`, `lib/matching/{index,business,student,professor,utils}.ts`, `lib/forum/queries.ts`, `lib/dashboard/composer.ts` (referenced), `components/funding/{FundingCard,FundingDetail,FundingFilters,FundingBrowser}.tsx`, `components/layout/Navbar.tsx`, `components/demo/ChatbotWrapper.tsx`, `scraper/{index,normalize,deduplicate,expire,quality}.ts`, `supabase/migrations/{0001_profiles_base,0002_role_profiles,0003_funding,0005_forum,0010_rls_identity,0011_profile_match_tags,0020_rls_funding,0024_public_funding_reads}.sql`, `manual.md`, `README.md`, `.env.example`, `AGENTS.md`, `codex/Handoff.md`, `codex/SoloProgress.md`, `issues.md`.

No destructive commands were run. No git, no migration, no scraper run.

---

## Open Questions

1. Is the `auctus-frontend/` orphan still needed for design reference, or can it be deleted now (Issue 13)?
2. What is the production target — Vercel + Supabase prod, or self-host? This affects env handling, secrets rotation, and `NEXT_PUBLIC_SITE_URL`.
3. Should the legacy AIChatbot stay anywhere in V2, or is V2 launching without an AI surface? The wordmark "Auctus AI" implies one.
4. After `0024`, is signed-in role isolation on the funding table intended to be app-only (since RLS is now flat)? If yes, document explicitly. If no, restore a role-aware SELECT policy.
5. Forgot-password and resend-verification routes — who owns them in the gate plan? They are not in any G-phase.
6. Is the dashboard supposed to default to "Best current match" being the first scored item even when the score is 0/null? Or should we hide that hero card until a real match exists?
7. Is forum guest-read a Phase G13+ feature, or release-blocking for beta? Issue 8 baseline assumes it.
8. Onboarding industry/field options are five literal labels — is a richer canonical taxonomy planned (Issue 20 dependency on tag corpus)?
9. Will the `funding_preferences` table get a UI in V2, or is it deferred?
10. Account email rotation, password reset, and admin tooling — which of these blocks public beta and which are post-beta?
