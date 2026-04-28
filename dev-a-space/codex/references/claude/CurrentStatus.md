# Auctus AI - Current Project Status

This document reflects the code that currently exists in this repository, not the larger future-state architecture described in [ProjectSummary.md](./ProjectSummary.md).

---

## Session Handoff — 2026-04-25 (planning, not coding)

### Where we are

V2 planning docs are essentially complete. No V2 code has been written yet. The repo is at the "ready to start V2.P1 bootstrap" line. Both progress.md files show `V2.P1 — not started`. Repo is NOT currently deployed (Vercel link from old repo is dead; this repo was recreated fresh today).

### What was done this session

- Locked the 8 open assumptions (branching = `develop`/`main` split, single shared Supabase project, 2 scrapers per role for V2 with extensible design, chatbot stays mounted in `(demo)`, `Session.role` nullable during onboarding gap, legacy folders kept, Dev A = Aaryan / Dev B = Priyan).
- Updated `build/shared/conventions.md` (branching + deploy gates), `build/dev-a/buildflow.md` + `build/dev-b/buildflow.md` (owner names, Off-Limits sections, per-step Inbound/Outbound coupling), `build/shared/ownership.md` (Developers table), `build/gameplan.md`, both `progress.md` files, and `build/dev-b/buildflow.md` Step 4 (scraper extensibility proof).
- Updated memory: `reference_repo_deploy.md` (no longer deployed), `project_v2_rebuild.md` (decisions locked), `MEMORY.md`.

### Dangling items (resolve before V2.P1 starts)

These are gaps in the buildflows — code would still ship without them, but bootstrap will hit friction:

1. **Google OAuth provider registration.** No step covers registering an OAuth app at console.cloud.google.com and pasting client ID/secret into Supabase Auth. ~15 min of human setup, currently unowned. Should be added to `build/shared/bootstrap.md` section B.
2. **Supabase CLI setup per dev.** B3 says "use `supabase db push`" but no step covers `supabase login` / `supabase link --project-ref` for both Aaryan and Priyan.
3. **GitHub Actions secrets.** Dev B Step 4 references `SUPABASE_SERVICE_ROLE_KEY` from secrets but no checklist item covers actually adding it in Settings → Secrets.
4. **Repo + Supabase access for Priyan.** Aaryan needs to add Priyan as a GitHub collaborator and a Supabase project member. Not in any doc.
5. **Expiring-deadlines dashboard tile.** ProjectSummary lists it as a core feature; Dev A Step 5 only specifies a funding-summaries tile. Scope decision: add it to Step 5 or explicitly drop from V2.
6. **Stale Vercel line in `build/shared/buildflow.md` line 199.** Says "Vercel env vars set in production" — contradicts the locked "not currently deployed" decision. Mechanical fix.

### What to do next session

Open with: "Resume from `claude/CurrentStatus.md` Session Handoff. Patch dangling items 1-4 into `build/shared/bootstrap.md`, fix item 6, and ask me about item 5." That should be ~30 min of doc work, after which V2.P1 is genuinely ready to start.

### Nothing else is blocking

No code is broken, no commits half-done, no migrations half-applied, no PRs open. Working tree has the doc edits from this session uncommitted (visible in `git status`). Safe to leave.

---


## Current Reality

The repository is currently a **single-role demo application for businesses** built with **Next.js 16, React 19, TypeScript, and Tailwind CSS 4**.

It already includes a working frontend shell, static demo data, reusable UI components, and several complete pages. It is **not yet** the full multi-role platform with Supabase, Google OAuth, scraping, or real LLM-backed chat.

## What Is Already Done

### App Shell and Shared Frontend

- Root layout with navbar, footer, global styles, error boundary, providers, and chatbot wrapper
- Shared UI components such as `Button`, `Card`, `Badge`, `Input`, `Select`, `Modal`, `Toast`, and `Skeleton`
- Shared content cards such as `GrantCard`, `ThreadCard`, `ReplyCard`, `MatchCard`, `JobCard`, `TalentCard`, and `StatsCard`
- Global business context and toast context

### Demo Data Layer

- Static JSON datasets for businesses, grants, matches, threads, replies, jobs, and talents
- Centralized data utilities in `lib/data-utils.ts`
- Business-to-grant matching logic for the current business demo
- Search, filtering, helper formatting, related-content lookup, and eligibility breakdown helpers

### Implemented Pages

- Landing page at `/`
- Dashboard at `/dashboard`
- Forum list at `/forum`
- Forum thread detail at `/forum/[threadId]`
- New thread page at `/forum/new`
- Funding list at `/funding`
- Funding detail page at `/funding/[grantId]`
- Matchmaker page at `/matchmaker`
- Talent page at `/talent`
- Internal component/test pages at `/test-cards`, `/test-components`, and `/test-components/store-test`

### Chatbot

- Floating chatbot UI is built and integrated into the layout
- Chatbot is context-aware by page and current business
- Responses come from local keyword/pattern logic in `lib/ai-responses.ts`
- Quick actions and navigation suggestions are implemented

### Project Documentation

- Phase-based build and validation docs already exist in `components/context_hub/`
- Project planning docs already exist in `claude/`

## What Is Partially Done or Demo-Only

- Business switching is local React context only, not real login or profile management
- Forum posting, replies, helpful actions, and similar interactions are demo flows and use alerts rather than persistence
- Matchmaker connect actions are demo-only
- Talent actions such as posting jobs or contacting talent are demo-only
- AI chatbot is simulated logic only, not connected to OpenRouter or any live model
- Data is loaded from local JSON files, not from a live database

## What Is Still Left

### Auth and User Model

- Supabase integration
- Google OAuth sign-in
- Real user profiles
- Multi-role support for business, student, and professor
- Onboarding flow and persistent sessions
- Route protection middleware

### Data and Backend

- Replace static JSON data with Supabase/Postgres tables
- Add unified funding model for grants, scholarships, and research funding
- Add real CRUD flows for forum threads, replies, profiles, and saved state
- Add server-side data access instead of client-only demo utilities

### AI and APIs

- Build `/api/chat`
- Connect chatbot to OpenRouter
- Add streaming responses
- Add fallback and prompt logic around real user/profile context

### Scraping and Automation

- Add scraper workspace and source modules
- Add daily GitHub Actions workflow
- Add deduplication and expiry pipeline
- Add ingestion of scraped funding into the database

### Product Scope From ProjectSummary

- Split funding into role-based experiences for businesses, students, and professors
- Add separate grants, scholarships, and research-funding sections
- Add role-specific dashboards and filtering
- Add profile/settings pages
- Add auth callback and onboarding routes
- Remove or redesign legacy demo sections that no longer fit the multi-role product plan

### Quality and Cleanup

- Clean up lint issues in current source files
- Remove remaining demo alerts and replace them with real UI flows
- Add real tests instead of relying mainly on manual validation docs
- Review and simplify old phase documentation once the product direction is finalized

## Bottom Line

**Current repo status:** polished frontend demo for a single business-focused Auctus experience.

**Target repo status:** full multi-role Canadian funding platform with real auth, database, scraping, and AI.

The UI foundation is already strong. The missing work is mostly backend integration, auth, role architecture, automation, and replacing demo behavior with real product behavior.
