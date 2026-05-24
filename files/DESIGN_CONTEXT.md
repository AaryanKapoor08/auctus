# Auctus Design Context

Last consolidated: 2026-05-23

## Design Role

The user is responsible for designing the product. Use this file to keep product flow, current UI state, and design backlog clear while implementation continues.

## Product Positioning

Auctus should feel like a focused funding workspace, not a generic SaaS landing page or chatbot wrapper.

Current strongest positioning:

- Browse real Canadian funding first.
- Sign up only when personalization is valuable.
- Use role profile data to clean up discovery into a shortlist.
- AI should appear as enrichment/search intelligence only where shipped.

Avoid implying a live AI advisor. The legacy "Auctus AI" framing was intentionally dropped in favor of "Auctus".

## Current User Flows

Guest:

1. Lands on `/`.
2. Sees live opportunity counts and role tracks.
3. Browses `/grants`, `/scholarships`, or `/research-funding` without an account.
4. Opens public detail pages.
5. Sees soft prompts to create a profile for better matching.

New user:

1. Goes to `/sign-up`.
2. Uses Google or email/password.
3. Lands in `/onboarding`.
4. Picks business, student, or professor.
5. Completes a short role-specific profile form.
6. Lands on `/dashboard`.

Returning user:

1. Can open `/` without being hard-redirected.
2. Navbar reflects session state.
3. Uses Dashboard, Forum, role funding link, or Profile from the top nav/avatar menu.

Authenticated user with no role:

1. Protected routes redirect to `/onboarding`.
2. Navbar shows public funding links plus Onboarding.

Admin:

1. Must be signed in.
2. Must pass `ADMIN_ALLOWLIST`.
3. Can access `/admin/review` and `/admin/runs`.

## Current Screens

Landing:

- Public, content-rich, real funding counts/previews.
- Uses a large headline, role track panel, stats, opportunity cards, and feature blocks.
- Current copy focuses on browse-first discovery and later personalization.

Funding browse:

- Role-specific pages use `FundingBrowser`.
- Left filter rail with search, sort, deadline, grouped category facets, and profile chips.
- Cards show amount/deadline/tags/match context.
- Filtering and sorting are client-side.

Funding detail:

- Shows opportunity data, eligibility, requirements, application link, and AI enrichment when current/validated.
- Detail deadline formatting has been flagged before; verify current output when redesigning.

Dashboard:

- Authenticated role workspace.
- Role-specific heading/copy.
- Stats, top matches, deadlines, profile context, top tags/opportunity mix, forum activity.
- Useful but read-heavy and still needs visual hierarchy polish.

Navbar:

- Wordmark links to `/`.
- Guests see Home, Grants, Scholarships, Research, Sign in, plus Sign up button.
- Signed-in users see Home, Dashboard, Forum, role-specific funding link, and profile dropdown.
- Profile menu links to profile/onboarding and sign out.

Profile:

- `/profile` shows role and onboarding/profile details.
- `/profile/edit` edits expanded profile fields.
- Delete account exists and is visually prominent.

Forum:

- Authenticated only.
- Threads, replies, tags, helpful votes.
- No moderation/reporting/rate limit yet.

Auth:

- `/sign-in` and `/sign-up` are separate.
- Current implementation should be treated as Google OAuth plus email/password.
- Forgot-password/reset flow is missing.

Admin:

- Functional admin pages exist for AI review/runs, but browser proof/polish may still be pending.

## Design Principles For Next Work

- Funding discovery is the core experience. The app should show useful opportunities before asking for commitment.
- Role specificity matters. Business, student, and professor surfaces should not feel like copy-swapped clones.
- UI should be dense enough for repeated funding review, not marketing-heavy after the landing page.
- Prefer clear workflows over decorative sections.
- Use the existing component layer first: `Button`, `Card`, `Badge`, `Input`, `Select`, `Modal`, `Toast`, `Skeleton`, `StatsCard`.
- Use lucide icons where controls need icons.
- Keep public browse, signed-in personalization, and admin-only review visually distinct.
- Avoid "AI" labels unless the visible surface is actually AI-enriched.

## Design Backlog

High priority:

- Add save/track funding. A funding discovery product needs saved opportunities, deadline tracking, and a way back to chosen items.
- Add forgot-password and password recovery UX.
- Improve onboarding into a more guided first-run flow with a clear completion state.
- Add better profile completion cues without making users feel incomplete by default.
- Rework dashboard data density and hierarchy once save/track exists.
- Add pagination or virtualization for scholarship-heavy funding browse.
- Make landing counts cheap and reliable through count queries, not full list reads.
- Add forum moderation/reporting/rate-limit UX before wider use.

Medium priority:

- Standardize date/deadline formatting across cards, detail, browser, and dashboard.
- Tighten navbar/avatar loading behavior to avoid flicker and multiple sources of truth.
- Make funding empty states more useful with suggested filters or example paths.
- Add visible state for "AI enrichment unavailable/pending" only where it helps users.
- Make admin pages visually operational: queues, failed buckets, review decisions, run health.
- Reconsider the delete account UI placement; move toward a quieter danger zone.

Data/design risks:

- Scholarship data is heavily weighted toward Indigenous bursaries in historical runs; student UX should not overpromise broad coverage without filters.
- Research funding corpus is small; professor UX should set expectations and surface source/council context.
- Matching is tag/substr based and can produce low or zero scores; avoid treating low scores as user failure.
- Maximum amount can be misleading; label as "largest listed value" or show ranges carefully.

## Open Product Decisions

- Should signed-in `/` remain a public landing page with authenticated nav, or become an adaptive home?
- Should dashboard become the signed-in home, or remain one workspace among several?
- Should the product use top nav only, or add a role workspace sidebar?
- Should onboarding be a single page per role or a short multi-step wizard?
- Where should saved funding live: dashboard tile, dedicated `/saved`, or both?
- Should forum be authenticated-only forever, or public read/auth write?
- Should profile avatar open a dropdown only, or lead to a richer account/profile hub?
- How visible should AI enrichment be before real-provider quality proof is complete?

## Copy Guidelines

Use:

- "Canadian funding discovery"
- "Browse funding before you sign up"
- "Personalized matches"
- "Role-aware funding shortlist"
- "AI-assisted funding discovery" only on enriched/search surfaces

Avoid:

- "AI advisor"
- "Guaranteed match"
- "Apply automatically"
- "Complete funding database"
- Any copy suggesting private profile/forum data is sent to AI providers

## Current Visual Tone

The implementation currently uses:

- White/gray surfaces with restrained borders and shadows.
- Rounded `lg` cards and controls.
- Role icons from lucide.
- Occasional primary/accent/secondary color utilities.
- Conventional responsive grids.

Before major visual redesign, inspect `app/globals.css` and `components/ui/*` so changes do not fight the existing Tailwind theme.
