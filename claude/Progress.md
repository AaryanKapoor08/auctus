# Auctus AI — Progress Tracker

Update this file as you complete each phase.

**Current Phase: V2 phases TBD — engineering spec complete, phase breakdown next session**

---

## V1 Frontend (Complete)

### PHASE 1 — Project Scaffold [complete]

- [x] `npm run build` succeeds with zero errors
- [x] `npm run dev` starts dev server on localhost:3000
- [x] `npm run lint` passes with no warnings
- [x] TypeScript strict mode enabled in tsconfig.json
- [x] Tailwind CSS classes render correctly
- [x] Commit: `chore(config): initialize Next.js project with TypeScript and Tailwind`
- Notes: Project initialized with Next.js 16, React 19, TypeScript 5, Tailwind CSS 4.

### PHASE 2 — Layout & Navigation [complete]

- [x] Navbar renders with all navigation links
- [x] Business switcher dropdown works
- [x] Footer renders on all pages
- [x] Mobile responsive layout (hamburger menu or collapsible nav)
- [x] ErrorBoundary catches and displays errors gracefully
- [x] All routes navigate without full page reload
- [x] Commit: `feat(ui): add layout shell with Navbar, Footer, and routing`
- Notes: Root layout includes Navbar, Footer, ErrorBoundary, Providers wrapper. AIChatbot dynamically imported.

### PHASE 3 — Static Data Layer [complete]

- [x] All 7 JSON data files contain realistic demo data
- [x] TypeScript interfaces match JSON structure exactly
- [x] `getAllGrants()`, `getBusinessById()`, etc. return typed data
- [x] `calculateGrantMatch()` returns scores 0-100 for any business/grant pair
- [x] BusinessContext provides and updates active business across pages
- [x] ToastContext shows success/error/info/warning notifications
- [x] Commit: `feat(db): add static data layer with type-safe access functions`
- Notes: 7 JSON files with 7 businesses, 30 grants, 18 threads, 50+ replies, matches, 15 jobs, 10 talents. data-utils.ts is the centralized access layer.

### PHASE 4 — Grant Discovery [complete]

- [x] Grants page loads and displays all 30 grants
- [x] Match scores display correctly for the active business
- [x] Filtering by category, amount, and match score works
- [x] Grant detail page shows eligibility breakdown
- [x] Deadline countdown shows days remaining
- [x] Color coding: green >80%, yellow 60-80%, gray <60%
- [x] Commit: `feat(grants): add grant discovery with matching and filtering`
- Notes: Full grant matching algorithm with weighted scoring (location 25, revenue 25, employees 20, industry 30).

### PHASE 5 — Community Forum [complete]

- [x] Forum page lists all 18 threads grouped by category
- [x] Category filter shows correct thread count
- [x] Search filters threads by title, content, and tags
- [x] Thread detail shows thread content and all replies
- [x] New thread form creates a thread (client-side)
- [x] Sort options reorder threads correctly
- [x] Commit: `feat(forum): add community forum with categories and search`
- Notes: 6 categories, real-time search, AI suggestions for related grants and threads.

### PHASE 6 — Business Matchmaking [complete]

- [x] Matchmaker page displays all matching businesses
- [x] Match scores calculate correctly from needs/offers overlap
- [x] 4 filter tabs show correct subsets
- [x] MatchCard shows reasoning with youNeed, theyOffer, mutualBenefits
- [x] Switching business in context updates all matches
- [x] Commit: `feat(matchmaker): add business matchmaking with scoring`
- Notes: Smart algorithm with 4 tab views, detailed reasoning per match. **TO BE REMOVED in V2 — matchmaker page is being deleted.**

### PHASE 7 — Dashboard, AI Chatbot & Talent [complete]

- [x] Dashboard displays business stats and quick actions
- [x] AI Chatbot opens/closes and accepts messages
- [x] Chatbot responds contextually based on current page and business
- [x] Suggestion cards navigate to relevant pages
- [x] Talent page shows jobs and talent profiles
- [x] Filtering by skills and job type works
- [x] Chatbot is dynamically imported (not in initial bundle)
- [x] Commit: `feat(dashboard): add dashboard, AI chatbot, and talent marketplace`
- Notes: AI chatbot has 8+ query handlers, typing simulation, quick actions. Talent marketplace with dual hiring/seeking view. **V2: chatbot will be replaced with OpenRouter API. Dashboard will become role-specific. Talent page deferred.**

---

## V2 Multi-Role Platform (Phases TBD)

> V2 engineering spec is complete in `claude/BuildFlow.md`. Phase breakdown will be defined in the next session.
>
> **Planned work:**
> - Supabase database setup (PostgreSQL, profiles, unified funding table)
> - Google OAuth authentication with 3 roles (business, student, professor)
> - Remove matchmaker page
> - Scholarships page (shared FundingPage component)
> - Professor research grants page (shared FundingPage component)
> - Scraping pipeline (15 sources, GitHub Actions daily cron, auto-expire)
> - OpenRouter AI chatbot integration
> - Role-specific landing page and dashboard
> - Content isolation via Next.js middleware
> - Talent page marked as "Coming Soon" (deferred)
