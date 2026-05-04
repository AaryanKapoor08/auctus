# Codex Task — Auctus Issue Resolution

## Your job

Read `issues.md` in this repo. It contains a numbered list of known issues with the Auctus web app.

**Step 1 — Plan.** Before writing a single line of code, produce a written implementation plan. For each issue you are going to fix, state:
- What files you will touch
- What you will change and why
- Any dependencies between issues (e.g. Issue 21 must land before Issue 5's UI is finalised)
- Any issues you are skipping and why

**Step 2 — Implement.** Execute your plan issue by issue. Commit after each issue using conventional commit format: `fix(scope): description`. Do not bundle multiple issues into one commit.

---

## Project overview

- **Framework:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Auth + DB:** Supabase (`@supabase/ssr`) — cookies-based session, SSR-safe
- **Key dirs:**
  - `app/` — all routes (App Router)
  - `app/(identity)/sign-in/` — current sign-in page
  - `app/(funding)/grants/`, `app/(funding)/scholarships/`, `app/(funding)/research-funding/` — funding routes
  - `app/dashboard/page.tsx` — dashboard
  - `app/forum/page.tsx` — forum listing
  - `app/onboarding/` — onboarding flow
  - `app/auth/callback/route.ts` — OAuth/auth callback
  - `components/` — shared components (layout, ui, funding, forum, dashboard, etc.)
  - `proxy.ts` — middleware; runs `supabase.auth.getUser()` on every request
  - `lib/supabase/client.ts` and `lib/supabase/server.ts` — Supabase client factories
  - `auctus-frontend/` — the OLD prototype app; use it as a **read-only design reference**

---

## Issues to fix

Work through every open issue in `issues.md`. Below is a summary of each with implementation guidance. Treat the full issue descriptions in `issues.md` as the authoritative spec.

---

### Issue 5 — Sign-up vs sign-in distinction (HIGH PRIORITY)

**Do this after Issue 21.**

- Create `app/(identity)/sign-up/page.tsx` — a dedicated sign-up page with new-user copy
- Update `app/(identity)/sign-in/page.tsx` — returning users only; redirect to `/dashboard` if session already exists
- Both pages must offer: Google OAuth button + email/password form
- After successful sign-up → onboarding. After successful sign-in → dashboard.
- Navbar "Sign in" link must only appear for unauthenticated users; authenticated users see their profile avatar/dropdown instead

---

### Issue 6 — User profile page

- Create `app/profile/page.tsx` — view-only profile showing display name, role, and all onboarding fields
- Create or expose a link to the existing `app/profile/edit` route from the profile page
- Add a profile avatar or initials button to the navbar that links to `/profile` and contains a "Sign out" option in a dropdown
- This is a standalone feature — scope it cleanly, do not couple it to other issues

---

### Issue 11 — Auth callback has no error handling

- File: `app/auth/callback/route.ts`
- Check for an `error` query param in the callback URL
- If `exchangeCodeForSession` throws or `error` is present, redirect to `/sign-in?error=link_expired` with a visible error message on the sign-in page
- After Issue 21 lands (magic link removed), this route will primarily handle Google OAuth callbacks — keep error handling for OAuth failures too

---

### Issue 14 — No 404 or error pages

- Create `app/not-found.tsx` — styled 404 page matching the app's design system
- Create `app/error.tsx` — styled error boundary page
- Both should link back to `/dashboard` (for authenticated users) or `/` (for guests)

---

### Issue 16 — Grant/scholarship filters return wrong results

- Audit the tag/keyword fields on all grant records in the Supabase database (or seeded data files if present)
- Define a canonical tag taxonomy based on what grants actually exist: e.g. `STEM`, `Arts`, `Health`, `Provincial`, `Federal`, `Need-based`, `Merit-based`, `International`
- Re-tag all existing records against that taxonomy
- Verify filter queries use the correct field and match logic (exact match or array contains)
- After re-tagging, selecting "STEM" or "Provincial" should return multiple results, not one or two

---

### Issue 17 — Restore funding page layout

- Reference: `auctus-frontend/app/funding/page.tsx` and any components it imports
- Restore the card layout, filter pill/chip bar (with active states), and placeholder/empty states to match the old prototype
- No backend changes — UI only
- The filter bar should use pill/chip style with clear visual active state
- Grant cards should have consistent padding, typography hierarchy, and amount/deadline badges

---

### Issue 18 — Restore dashboard layout

- Reference: `auctus-frontend/app/dashboard/page.tsx` and its components
- Restore tile/widget layout, section headers, card spacing, and overall visual hierarchy
- No backend changes — UI only
- Real data is already wired up (G11 complete); this is purely a layout/style restoration

---

### Issue 19 — Restore forum layout

- Reference: `auctus-frontend/app/forum/page.tsx` and its components
- Restore thread card design, filter/tag bar, post metadata (author, date, reply count), and empty states
- No backend changes — UI only

---

### Issue 20 — Redesign onboarding questions

- Read the grants/scholarships currently in the Supabase database and extract the actual tag taxonomy they use
- Redesign the onboarding questionnaire to ask only 3–5 questions whose answers map directly to those tags
- Every question must eliminate a meaningful slice of irrelevant grants and confirm relevance of others — treat it as a filter tree, not a profile form
- Typical question set: Role (already asked) → Field / Industry → Province → Stage (year of study / business stage)
- Store answers as structured keyword tags against the user's profile so they can be used directly in grant matching queries
- Do not ask for information that doesn't correspond to any grant tag in the database

---

### Issue 21 — Remove magic link; add email/password auth (HIGH PRIORITY — do this first)

**Do this before Issues 5 and 11.**

- Remove all magic link UI from `app/(identity)/sign-in/page.tsx` (the "Send magic link" button and email-only input)
- Add a standard email + password form using `supabase.auth.signInWithPassword()`
- Add email + password + confirm-password to the sign-up form (Issue 5) using `supabase.auth.signUp()`
- Keep the Google OAuth button — `signInWithOAuth({ provider: 'google' })` already works, do not touch it
- Update `app/auth/callback/route.ts` to handle OAuth callbacks only (Google); remove magic-link-specific token exchange if it is separate
- Add visible error messages for: wrong password, email not found, email already registered, passwords do not match

---

## Issues to SKIP (do not implement)

| Issue | Reason |
|---|---|
| 7 — Public grants page | Future scope, post-release |
| 8 — Full design pass | Ongoing; partially addressed by Issues 17–19 |
| 9 — Session persistence | Already works; no code change needed |
| 10 — Demo data on dashboard | Already resolved in G11 |
| 12 — Old demo routes | Already moved in G2; verify nav links only, no new code |
| 13 — Delete `auctus-frontend/` | **Do NOT delete** — it is the design reference for Issues 17, 18, 19. Delete it only after those three issues are fully implemented and verified |

---

## Constraints

1. **No backend schema changes.** Do not alter Supabase table definitions, RLS policies, or the scraper/ETL pipeline.
2. **Do not touch `proxy.ts` auth logic.** The `setAll` cookie forwarding must not be removed or simplified.
3. **Do not switch to a non-SSR Supabase client.** `createBrowserClient` and `createServerClient` must stay as-is.
4. **Use the existing design system.** Tailwind classes, existing UI components in `components/ui/`, and the colour/spacing tokens already in use. Do not introduce a new component library.
5. **Commit after each issue.** One conventional commit per issue: `fix(auth): remove magic link, add email/password`. Do not squash.
6. **Plan before implementing.** Produce the written plan first. If you find something in the code that changes your plan, update the plan and note the change before proceeding.

---

## Definition of done

- Every listed issue above (except the skipped ones) is implemented and committed
- `next build` passes with no type errors
- No console errors on the dashboard, forum, grants, sign-in, sign-up, onboarding, or profile pages
- Filters on the scholarships/grants pages return more than 2 results for common categories (STEM, Provincial)
- A new user can: land on `/sign-up` → create account with email/password or Google → complete onboarding (3–5 questions) → reach dashboard with relevant grants shown
- A returning user can: land on `/sign-in` → authenticate → reach dashboard, with no magic link option visible anywhere
