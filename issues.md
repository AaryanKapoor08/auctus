# Auctus — Known Issues

## Issue 1 — Navbar: wrong state when authenticated

**Page:** All pages (dashboard, forum, etc.)  
**Screenshot:** Dashboard after onboarding  

**Problems observed:**
- "Home" link in the navbar does not navigate to the landing page (`/`)
- "Sign in" link is still visible even when the user is logged in
- No user profile avatar / dropdown section
- Navbar is missing authenticated nav links: Forum, Grants, etc.
- "Sign out" button is shown as a standalone button (inconsistent with the rest of the nav)

**Expected behaviour:**
- Unauthenticated nav: Home · Sign in
- Authenticated nav: Home · Dashboard · Forum · Grants · [Profile avatar/dropdown] · Sign out (or inside dropdown)
- "Home" should always link to `/`

---

## Issue 2 — Logo not linked to landing page; no user profile concept

**Page:** All pages  

**Problems observed:**
- Clicking the "Auctus AI" logo/wordmark does nothing or goes to the wrong route — it should always navigate to `/` (landing page)
- User remains signed in when returning to `/` (session is preserved), but the navbar treats them as a guest
- There is no user profile concept anywhere in the app: no avatar, no profile page link, no display name shown, no dropdown menu
- General frontend UI polish issues across multiple pages (to be detailed as screenshots are provided)

**Expected behaviour:**
- Logo click → `/` (landing page), session intact, navbar reflects authenticated state
- A persistent user profile element (avatar or initials + dropdown) visible on every authenticated page, linking to `/profile` and containing Sign out

---

---

## Issue 3 — Landing page hard-redirects authenticated users; unreachable while signed in

**File:** `app/page.tsx:12`  

**Problem:**
```ts
if (session) {
  redirect("/dashboard");
}
```
Any authenticated user hitting `/` is immediately sent to `/dashboard`. There is no way to view the landing page while logged in, and no way to navigate "home" — clicking the logo or "Home" link does nothing useful for signed-in users.

**Expected behaviour:**
- Logo and "Home" nav link → `/dashboard` for authenticated users, `/` for guests
- OR: landing page renders an authenticated variant instead of redirecting

---

## Issue 4 — Hydration mismatch: `formatRelativeTime` date locale

**File:** `lib/demo/data.ts:485`, used at `app/dashboard/page.tsx:347,369`  

**Problem:**
`date.toLocaleDateString()` returns locale-specific strings. The server renders `2026-01-10` (ISO), the browser renders `1/10/2026` (en-US locale), causing a React hydration error and a full client re-render.

**Fix:** Replace `date.toLocaleDateString()` with a fixed-locale call, e.g. `date.toLocaleDateString("en-CA")`, so server and client always produce the same string.

---

## Issue 5 — No sign-up vs sign-in distinction; authenticated users can re-enter the auth flow

**Page:** `/sign-in`  
**Priority:** High — this is the user's first impression of the product. Must be clean and smooth.

**Problems observed:**

1. **Single page for both new and returning users.** The page is titled "Sign in" but new users also create their account here. There is no dedicated sign-up page, no welcome copy for new users, and no way to tell which action is happening.

2. **No redirect for already-authenticated users.** A logged-in user can navigate to `/sign-in` and see the form again. They should be redirected straight to `/dashboard` instead.

3. **Navbar shows "Sign in" to authenticated users (related to Issues 1 & 2).** The sign-in link remains visible in the nav even after login, giving the impression the user is not signed in.

**Expected behaviour:**
- `/sign-up` — dedicated page with new-user copy, leads into onboarding on success
- `/sign-in` — returning users only; if already authenticated, redirect to `/dashboard` immediately
- Both pages offer: Google OAuth button + email/password form (see Issue 21 — magic link is removed)
- After sign-up: new users go through onboarding wizard; after sign-in: returning users go straight to dashboard
- The distinction between new and returning user is determined by whether a profile/role exists in the database

---

## Issue 21 — Remove magic link; support Google OAuth and email/password only

**Pages affected:** `/sign-in`, `/sign-up`, `app/auth/callback/route.ts`  
**Priority:** High — blocks Issue 5 and Issue 11 resolution.

**Decision:**
Magic link authentication is being removed entirely. The two supported auth methods going forward are:
1. **Google OAuth** — one-click, preferred path
2. **Email + password** — standard fallback

**What needs to change:**
- Remove all magic link UI (the email input + "Send magic link" button)
- Remove or repurpose the `/auth/callback` route — it currently exists solely for magic link token exchange; if Google OAuth uses a different callback it may need updating, but the magic-link-specific `exchangeCodeForSession` logic goes
- Add a password field to the sign-in form
- Add email + password + confirm-password fields to the sign-up form
- Wire up Supabase `signInWithPassword` and `signUp` (with password) methods
- Google OAuth button remains — `signInWithOAuth({ provider: 'google' })` already works, keep it
- Error states: wrong password, email not found, email already registered — all need visible user-facing messages

**Note:** Issue 11 (silent auth callback failure) becomes partially moot once magic link is removed, but the callback route should still handle OAuth errors gracefully.

---

## Issue 6 — No user profile page

**Pages affected:** Entire app  

**Context:** By "user profile" the user means a dedicated page (like GitHub or Instagram) — not just an avatar. A full profile page or sidebar that shows:
- Display name
- Role (Business / Student / Professor)
- Profile details filled during onboarding (business name, institution, field of study, etc.)
- Ability to edit those details

**What exists today:**
- `/profile/edit` route exists in the auth policies but there is no visible link to it from anywhere in the app
- No `/profile` view-only page exists
- The navbar only shows a small role badge (e.g. "business") with no way to reach a profile

**Expected behaviour:**
- Navbar has a profile avatar or initials button that links to `/profile`
- `/profile` shows the user's name, role, and all onboarding fields in a readable layout
- A clear "Edit profile" button leads to the existing `/profile/edit` form
- Optionally: a sidebar on dashboard/forum pages with a compact profile card

**Note:** Building the `/profile` page is a **separate feature addition** and should be scoped and implemented as its own standalone task, not bundled into navbar or onboarding fixes.

---

## Issue 7 — Grants/funding not publicly browsable (requires sign-in)

**Pages affected:** All funding/grants routes  

**Problem:**
All grant and funding pages are behind auth. A visitor who has not signed in cannot see any funding opportunities. This creates a poor first impression — users have no reason to sign up if they can't see what they're signing up for.

**Expected behaviour:**
- A public `/grants` (or `/explore`) page accessible without an account
- Shows a mixed feed of all funding types: business grants, student scholarships, professor/research grants
- Each card shows key details (name, amount, category, deadline)
- Clicking a grant card shows a public detail view
- A soft CTA ("Sign in to see your match score and save grants") nudges unauthenticated users toward sign-up without blocking them
- Authenticated users additionally see their personalised match score on each card

**Why this matters:**
This is a core discovery feature. Without it, the landing page has no proof-of-value — visitors see marketing copy but cannot verify the grants exist before committing to sign up.

---

## Issue 8 — User flows and UI architecture need a full design pass

**Type:** Design / planning — not a code bug  

**Problem:**
The app has been built feature by feature without a defined end-to-end user flow. As a result, individual pages work in isolation but the overall journey feels disconnected and unintuitive. Issues 1–7 above are all symptoms of this.

**What needs to be thought through before more features are built:**

- **Guest flow:** lands on `/` → browses public grants → gets nudged to sign up → creates account → onboarding → dashboard
- **Returning user flow:** lands on `/` → logo/nav takes them to dashboard → they can access grants, forum, profile from nav
- **Onboarding flow:** role selection → profile form → confirmation → dashboard (should feel like a welcome wizard, not a bare form)
- **Navigation model:** what lives in the top nav vs a sidebar vs a profile dropdown — consistent across all pages
- **Profile flow:** where do users see and edit their info, how do they switch roles if needed
- **Grant discovery flow:** browse → filter → view detail → save / apply → track deadlines
- **Forum flow:** browse threads → post → reply → get notified

**Questions to answer before implementing:**
1. Should the app use a top nav + sidebar layout (like GitHub) or top nav only (like Stripe)?
2. Should the dashboard be the "home" for logged-in users, or should `/` adapt based on auth state?
3. What does a first-time user see vs a returning user — should onboarding be a multi-step wizard?
4. Where does the profile avatar live and what does clicking it reveal (dropdown vs full page)?

**Recommended user flow (baseline — to be refined):**

The following is a starting point based on what a comfortable, intuitive experience should feel like. It is intentionally left open-ended so that a model with extended thinking capability can reason further, fill in gaps, and improve upon it before implementation begins.

> **First-time visitor (guest):**
> Lands on `/` → sees a clear headline and three role paths (Business / Student / Professor) → browses real grants without signing up → sees a soft CTA ("Sign in to see your match score") → clicks "Get started" → account creation page (not "Sign in") → onboarding wizard (role confirm → short profile form → "You're all set") → lands on personalised dashboard with first grant matches already shown.

> **Returning user:**
> Lands on `/` or types the URL → navbar detects session → logo and nav immediately reflect authenticated state → one click to dashboard, grants, forum, or profile. No re-authentication, no confusion.

> **Navigation model:**
> Top nav for primary destinations (Grants, Forum). Profile avatar top-right with a dropdown (My Profile, Sign out). Logo goes to dashboard if logged in, landing page if guest.

> **Grant discovery:**
> Browse → filter by role/category/deadline → click card for detail view → save or note interest → deadline tracker on dashboard.

> **Forum:**
> Browse threads as guest (read-only) → sign in to post or reply → notifications for replies.

**This flow is a recommendation, not a specification.** When implementing, use a model with thinking/reasoning capability to critically evaluate this flow, identify gaps or friction points, and improve it before writing any UI code. The goal is a user experience that feels obvious and effortless — not one that needs explaining.

---

## Issue 9 — Session persistence: user should stay logged in across visits

**Type:** Verify + guard against regression  

**What the user expects:**
- Log in once → stay logged in every time they return to the app
- Only get logged out if: they manually sign out, they clear browser cookies/storage, or the server-side refresh token expires (default: 60 days in Supabase)
- Should NOT be asked to re-authenticate on every visit or every browser restart

**Current state:**
The infrastructure is already correct:
- `lib/supabase/client.ts` uses `createBrowserClient` from `@supabase/ssr` — stores session in cookies (not localStorage), so it survives browser restarts
- `lib/supabase/server.ts` uses `createServerClient` — reads and writes those same cookies on the server
- `proxy.ts` calls `supabase.auth.getUser()` on every request, which automatically refreshes the access token (expires in 1 hour) using the refresh token (expires in 60 days) and writes the updated cookies back to the response

**What to verify / watch for:**
1. After logging in and closing the browser, reopening the app should land directly on the dashboard — not the sign-in page
2. The proxy must always forward updated cookies back in the response (currently does this via `setAll`) — do not remove or simplify this logic
3. If the magic link flow breaks (as happened during testing), check that the `/auth/callback` route is correctly exchanging the token and setting cookies — a failed exchange leaves the user with no session cookie
4. Do not switch to localStorage-based auth or a non-SSR Supabase client — that would break persistence across server-rendered pages

---

## Issue 10 — Dashboard shows hardcoded demo data, not real user data (critical)

**File:** `app/dashboard/page.tsx`, `lib/demo/data.ts`, `lib/demo/BusinessContext.tsx`  
**Resolved by:** G11 (dashboard funding tile + expiring deadlines + forum activity tile)

The entire dashboard is powered by `lib/demo/data.ts` — fake businesses, fake grants, fake threads. The logged-in user's real Supabase profile is not used anywhere on the dashboard. "Aroma Coffee House" is a hardcoded demo entry, not the user's actual business.

This is intentional for now — the real dashboard will be assembled in G11 once the ETL pipeline (G10) is complete. Do not try to fix this before that gate.

---

## Issue 11 — Auth callback has no error handling for failed/expired magic links

**File:** `app/auth/callback/route.ts`  
**Resolved by:** Not in G10–G12. Needs its own fix, ideally in G4 hardening or a standalone task.

If `exchangeCodeForSession` fails (expired link, already-used link, network error), the callback silently falls through and redirects to `/dashboard` with no session. The user has no idea what went wrong. This is the root cause of the "magic link fucked up" incident during testing.

**Fix needed:** check for an `error` param in the callback URL and redirect to `/sign-in?error=link_expired` (or similar) with a visible error message.

---

## Issue 12 — Old demo routes still publicly accessible

**Pages:** `/funding`, `/matchmaker`, `/talent`, `/test-cards`, `/test-components`  
**Resolved by:** G2 (Mixed-File Surgery) — these moves have already been done in the current codebase (files are under `app/(demo)/`). Verify the routes are not linked from anywhere in the real nav.

These were prototype pages. They still load if someone types the URL directly. They should not appear in any nav link and ideally should be removed entirely once G12 hardening runs.

---

## Issue 13 — `auctus-frontend/` is an orphaned old app inside the repo

**Path:** `auctus-frontend/`  
**Resolved by:** Not in any gate — cleanup task.

A complete old Next.js app (with its own `node_modules`, pages, components, layout) sits inside the repo root. It is not imported or used anywhere in the V2 app. It should be deleted. The memory note confirms it is intentionally kept for now ("kept in repo, not referenced by V2 docs") but it adds noise and confusion.

---

## Issue 14 — No 404 or error pages

**Resolved by:** Not in G10–G12. Should be added as a small standalone task before release.

No `not-found.tsx` or `error.tsx` exists anywhere in the app. Unknown routes show Next.js's default unstyled error page, which looks broken and unprofessional.

---

## Issue 15 — `formatRelativeTime` shows negative timestamps for future-dated demo data

**File:** `lib/demo/data.ts:473`  
**Resolved by:** G11 (forum moves to real data) and G12 (demo import removal). Low priority.

The function does not guard against future dates — if a demo timestamp is ahead of `Date.now()`, `diffMins` is negative and the output is something like `-352190 minutes ago`. A simple `if (diffMs < 0) return "just now"` guard would fix it in the interim.

---

## Gate resolution summary

**Note on gate numbering:** the solo build (`codex/SoloProgress.md`) runs G1–G12. G10 = ETL Pipeline, G11 = RLS + Dashboard Integration, G12 = Hardening + Release QA. References to G13–G17 below belong to the archived Dev A split-build flow and are not relevant to the solo build.

| Issue | Description | Resolved by (solo gates) |
|---|---|---|
| 1 | Navbar wrong state when authenticated | **G9** (already done in G9 shell work) |
| 2 | Logo not linked correctly | **G9** (already done in G9 shell work) |
| 3 | Landing page redirect for authenticated users | **G9** (intentional per spec; logo already fixed to go to dashboard) |
| 4 | Hydration date mismatch | **Already fixed** |
| 5 | No sign-up vs sign-in distinction | Standalone task |
| 6 | No user profile page | Standalone feature |
| 7 | Grants not publicly browsable | Future scope (post G12) |
| 8 | User flow design pass | **G9 + G11** partially; ongoing |
| 9 | Session persistence | Already works via Supabase SSR |
| 10 | Dashboard shows demo data | **G11** |
| 11 | Auth callback no error handling | Standalone fix |
| 12 | Old demo routes accessible | **G2** (already done); verify nav links |
| 13 | `auctus-frontend/` orphaned directory | Cleanup task |
| 14 | No 404 / error pages | Standalone task |
| 15 | Negative timestamps in demo data | **G11 + G12** |

---

## Issue 16 — Grant/scholarship filters return wrong results (keyword mismatch)

**Pages affected:** Grants / Scholarships browsing page  

**Problem:**
The filter system does not correctly match funding opportunities to their selected categories. A student browsing scholarships sees many results with no filters applied, but selecting a filter like "STEM" or "Provincial" collapses the results to one or two entries. The filter tags assigned to grants in the database (or seeded data) do not reflect the actual content of the grant — e.g. a STEM scholarship is not tagged as STEM, a provincial grant is not tagged as provincial.

**Root cause (suspected):**
The keywords/tags stored against each grant record are incomplete, inconsistent, or were seeded without care. The filtering logic itself may be correct, but it is matching against bad data.

**Expected behaviour:**
- Selecting "STEM" should surface all grants that are science/technology/engineering/math focused
- Selecting "Provincial" should surface all grants scoped to a province
- Filter combinations (e.g. STEM + Provincial) should narrow correctly, not collapse to near-zero
- Every grant in the database should have accurate, complete tags before filters are considered usable

**What needs to be done:**
1. Audit all grant/scholarship records — check what tags/keywords are currently stored
2. Define a canonical tag taxonomy (e.g. STEM, Arts, Provincial, Federal, Need-based, Merit-based, International, etc.)
3. Re-tag all existing records against that taxonomy
4. Verify filter queries use exact-match or contains logic against the corrected tags
5. Add a test: for each filter, assert at least N results are returned against the seeded dataset

---

## Issue 17 — Funding page layout: restore old design

**Pages affected:** `/grants` (or `/funding`) — the main grant browsing page  

**Problem:**
The current funding page layout is less polished than the original Auctus prototype. The old design had a cleaner card layout, better filter UI (pills/chips, clear active states), and better placeholder states. The current version looks rougher and less finished.

**Expected behaviour:**
- Restore or closely mirror the card, filter, and placeholder layout from `auctus-frontend/` (the archived prototype inside the repo root)
- No backend changes required — this is purely a frontend/UI task
- Key elements to recover:
  - Filter bar: pill/chip style with clear active/selected state
  - Grant cards: consistent padding, typography hierarchy, amount/deadline badges
  - Empty/loading states: proper placeholder skeletons or copy, not blank space
  - Overall spacing and visual polish matching the prototype

**Note:** The source of truth for the old design is the `auctus-frontend/` directory still present in the repo root. Use it as direct reference — do not delete it until this restoration is complete.

---

## Issue 18 — Dashboard layout: restore old design

**Pages affected:** `/dashboard`  

**Problem:**
The current dashboard is visually rougher and less polished than the original Auctus prototype. The old design had a better information hierarchy, cleaner card/tile layout, and a more finished feel overall.

**Expected behaviour:**
- Restore or closely mirror the dashboard layout from `auctus-frontend/`
- No backend changes required — purely a frontend/UI task
- Key elements to recover: tile/card spacing, typography hierarchy, section headers, widget layout, and overall visual polish

**Note:** Reference `auctus-frontend/` directly. Do not delete it until this restoration is complete.

---

## Issue 19 — Forum layout: restore old design

**Pages affected:** `/forum`  

**Problem:**
The current forum page layout is less polished than the original prototype. The old design had cleaner thread cards, better use of spacing, and a more readable layout for post previews and metadata (author, date, reply count).

**Expected behaviour:**
- Restore or closely mirror the forum layout from `auctus-frontend/`
- No backend changes required — purely a frontend/UI task
- Key elements to recover: thread card design, filter/tag bar, post metadata layout, empty states, and overall spacing

**Note:** Reference `auctus-frontend/` directly. Do not delete it until this restoration is complete.

---

## Issue 20 — Onboarding questions are generic and not aligned to available grants

**Pages affected:** Onboarding flow  

**Problem:**
The current onboarding questionnaire asks generic profile questions that are not meaningfully tied to the grants we actually have in the database. As a result, the keyword mapping is loose and personalisation is weak — users answer questions whose answers don't reliably translate into grant matches.

**What should change:**
- Read the ETL pipeline output (the actual grants in the database) and extract the real keyword/tag taxonomy from them
- Design the onboarding questions specifically to map user answers to those keywords — every question should directly inform which grants are surfaced
- Keep the questionnaire short: aim for 3–5 questions maximum. The goal is precision, not comprehensiveness
- Each question should eliminate large segments of irrelevant grants and confirm relevance of others — think of it as a fast filter tree, not a profile form

**Example logic:**
- Role (Business / Student / Professor) → filters to the right grant category entirely
- Field of study or industry → maps to STEM / Arts / Health / etc. tags
- Province → maps to provincial vs federal scope
- Stage or year (for students) or business size/stage (for businesses) → maps to eligibility tags

**Expected outcome:**
A user who completes 3–5 onboarding questions should land on a dashboard where every visible grant is a plausible match — no irrelevant results, no empty state. The questions are derived from the grant data, not invented independently.

**Dependencies:** ETL pipeline (G10) must be complete and grant tags must be accurate (see Issue 16) before the new questions can be properly designed.

---

## General — Frontend UI polish (ongoing)

**Status:** Issues to be listed as screenshots are provided.  
Items will be added here as they are identified.
