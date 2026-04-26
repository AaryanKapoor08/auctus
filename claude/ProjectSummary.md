# Auctus AI — Project Summary

**A multi-role Canadian funding platform that matches businesses with grants, students with scholarships, and professors with research funding — powered by automated scraping and AI.**

---

## Status

This file is **product vision** for V2. It is NOT the build plan. For execution, use:

- `build/gameplan.md` — committed scope
- `build/shared/buildflow.md` — phase tracker
- `build/shared/ownership.md` — domain boundaries
- `build/contracts/*.ts` — typed cross-domain interfaces (the data model below is the source for these files)

**LOCKED for V2:** D1, D2, D3, D4, D6, D7. The role enum (`business`, `student`, `professor`), unified funding table, Supabase, Google OAuth, GitHub Actions scraping, cheerio.

**EXPLORATORY (not locked for V2):** D5 (OpenRouter — AI chat is deferred), D8 (chatbot dynamic import — legacy chatbot stays mounted as-is).

The data model section (`Profile`, `BusinessProfile`, `StudentProfile`, `ProfessorProfile`, `FundingItem`, `FundingSummary`, `FundingQuery`) is **mirrored** in `build/contracts/*.ts`. The contract files are authoritative for execution; this file is authoritative for product intent. If they ever drift, fix the drift via the contract change protocol in `build/contracts/README.md`.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Browser (Client)                               │
│                                                                          │
│  ┌───────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────┐ ┌───────┐ │
│  │ Dashboard  │ │ Grants/      │ │ Research     │ │  Forum  │ │ AI    │ │
│  │ (per role) │ │ Scholarships │ │ Funding      │ │ (shared)│ │ Chat  │ │
│  └─────┬─────┘ └──────┬───────┘ └──────┬───────┘ └────┬────┘ └───┬───┘ │
│        │               │               │               │          │      │
│  ┌─────▼───────────────▼───────────────▼───────────────▼──────────▼───┐  │
│  │            Auth Context (Supabase session + role)                   │  │
│  └─────────────────────────────┬──────────────────────────────────────┘  │
│                                │                                         │
│  ┌─────────────────────────────▼──────────────────────────────────────┐  │
│  │         Next.js Middleware (role-based route protection)            │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │ HTTP (fetch)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Next.js Server (App Router)                          │
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────────────────────┐  │
│  │ Server          │  │  API Routes     │  │  Supabase Client          │  │
│  │ Components      │  │  /api/chat      │  │  (anon key + RLS)        │  │
│  └────────┬───────┘  └───────┬────────┘  └──────────┬────────────────┘  │
│           │                  │                       │                    │
└───────────┼──────────────────┼───────────────────────┼────────────────────┘
            │                  │                       │
            │                  │ HTTPS                 │ PostgreSQL (via Supabase JS)
            │                  ▼                       ▼
            │         ┌────────────────┐     ┌──────────────────────┐
            │         │  OpenRouter    │     │  Supabase             │
            │         │  (AI models)   │     │  ┌────────────────┐  │
            │         └────────────────┘     │  │ Auth (Google)   │  │
            │                                │  │ Database (PG)   │  │
            │                                │  │ RLS policies    │  │
            │                                │  └────────────────┘  │
            │                                └──────────┬───────────┘
            │                                           │
            │         ┌─────────────────────────────────┘
            │         │
            ▼         ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      GitHub Actions (Daily Cron)                         │
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │ Business Grant   │  │ Scholarship     │  │ Research Grant           │  │
│  │ Scrapers (5)     │  │ Scrapers (5)    │  │ Scrapers (5)            │  │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────────────┘  │
│           │                    │                     │                    │
│           └────────────────────┼─────────────────────┘                   │
│                                │                                         │
│                    ┌───────────▼───────────┐                             │
│                    │ Deduplicate + Expire   │                             │
│                    │ → INSERT/UPDATE Supabase│                            │
│                    └───────────────────────┘                             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Features

- Match businesses with eligible grants using weighted scoring (location, revenue, employees, industry)
- Match students with scholarships using weighted scoring (education level, field of study, GPA, province)
- Match professors with research grants using weighted scoring (research area, career stage, council alignment)
- Scrape 15 Canadian funding sources daily via GitHub Actions and auto-expire outdated entries
- Authenticate users via Google OAuth with three roles: business, student, professor
- Isolate content by role — each user only sees their funding type
- Advise users through an AI chatbot powered by OpenRouter, context-aware per role and page
- Discuss, collaborate, and share opportunities in a shared community forum
- Display role-specific dashboard with matched funding, expiring deadlines, and profile summary
- Show role-appropriate landing page with targeted CTAs before and after login

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Language | TypeScript 5 | Strict mode enabled, path aliases configured |
| Framework | Next.js 16 (App Router) | Server components, dynamic imports, middleware for auth |
| UI Library | React 19 | Latest with concurrent features |
| Styling | Tailwind CSS 4 | Via PostCSS plugin, utility-first |
| Icons | Lucide React | Tree-shakeable SVG icon library |
| Utilities | clsx + tailwind-merge | Conditional class composition without conflicts |
| Database | Supabase (PostgreSQL) | Free tier, RLS policies, hosted |
| Auth | Supabase Auth (Google OAuth) | Three roles, httpOnly session cookies, persistent login |
| AI | OpenRouter API | Free-tier models (Mistral 7B, Llama 3 8B), streaming responses |
| Scraping | cheerio + GitHub Actions | Daily cron, 15 sources, Node.js scripts |
| State | React Context API | Auth context (role + session), Toast context |
| Package Manager | npm | Lock file committed |
| Linting | ESLint 9 | Next.js config |
| Testing (planned) | Vitest + Playwright | Unit/integration with Vitest, E2E with Playwright |
| Deployment | Vercel | Already connected, auto-deploy on push to main |

---

## Architecture Decisions

**D1 — Next.js App Router over Pages Router**
- **Over:** Next.js Pages Router, Remix, plain React SPA
- **Why:** App Router provides server components by default (smaller client bundles), nested layouts, streaming SSR, and middleware for role-based route protection.

**D2 — Supabase over custom backend + Prisma**
- **Over:** Express + Prisma + self-hosted PostgreSQL, Firebase, MongoDB
- **Why:** Supabase provides database, auth (Google OAuth), RLS, and REST API in one free-tier package. Eliminates need to build a custom auth system or manage database hosting. The Supabase JS client works natively in Next.js server components and API routes.

**D3 — Unified funding table with JSONB eligibility**
- **Over:** Three separate tables (grants, scholarships, research_grants)
- **Why:** One `FundingPage` component serves all three roles. A unified table with a `type` discriminator and JSONB eligibility column keeps the schema simple while allowing role-specific criteria. Queries filter by `type` — same API, same UI, different data.

**D4 — GitHub Actions for scraping over Vercel Cron**
- **Over:** Vercel Cron Jobs, self-hosted cron server, AWS Lambda
- **Why:** Vercel Cron has 10-second timeout on free tier — useless for scraping. GitHub Actions gives 6 hours per run, free for public repos (2000 min/month), full Node.js environment with Puppeteer support.

**D5 — OpenRouter over direct model API**
- **Over:** Direct OpenAI API, Anthropic API, self-hosted models
- **Why:** OpenRouter provides free-tier access to multiple models (Mistral 7B, Llama 3 8B) through a single API. If one model goes offline, can switch to another without code changes. Cost: $0.

**D6 — Shared FundingPage component over three separate pages**
- **Over:** Building three completely separate page implementations
- **Why:** All three funding pages have identical UI (cards, filters, detail view, match scores). Only the data source, filter options, and matching algorithm weights differ. One component with a `type` prop eliminates code duplication.

**D7 — cheerio over Puppeteer for scraping**
- **Over:** Puppeteer, Playwright, Selenium
- **Why:** Most government grant sites (.gc.ca) are server-rendered static HTML. cheerio parses HTML without launching a browser — faster, lighter, no headless Chrome needed. Puppeteer reserved as fallback only for JS-rendered sites.

**D8 — Dynamic import for AI Chatbot**
- **Over:** Static import in layout
- **Why:** Chatbot is heavy (~13KB source + dependencies) and not needed for initial page render. Dynamic import reduces First Contentful Paint by 20-30%.

---

## Data Models

```typescript
// === Profiles (extends Supabase auth.users) ===
interface Profile {
  id: string;                    // UUID, references auth.users(id)
  role: 'business' | 'student' | 'professor';
  display_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface BusinessProfile {
  id: string;                    // References profiles(id)
  business_name: string;
  industry: string | null;
  location: string | null;
  revenue: number | null;        // Annual revenue in CAD
  employees: number | null;
  description: string | null;
  needs: string[];               // For potential future matchmaking
  offers: string[];
  year_established: number | null;
  website: string | null;
}

interface StudentProfile {
  id: string;                    // References profiles(id)
  education_level: 'high_school' | 'college' | 'undergrad' | 'masters' | 'phd' | null;
  field_of_study: string | null;
  institution: string | null;
  province: string | null;
  gpa: number | null;
  graduation_year: number | null;
}

interface ProfessorProfile {
  id: string;                    // References profiles(id)
  institution: string | null;
  department: string | null;
  research_area: string | null;
  career_stage: 'early' | 'mid' | 'senior' | 'emeritus' | null;
  h_index: number | null;
  research_keywords: string[];
}

// === Unified Funding (business grants + scholarships + research grants) ===
interface FundingItem {
  id: string;                    // UUID
  type: 'business_grant' | 'scholarship' | 'research_grant';
  name: string;
  description: string | null;
  provider: string;              // e.g., "NSERC", "Government of Canada"
  amount_min: number | null;     // Minimum funding amount (CAD)
  amount_max: number | null;     // Maximum funding amount (CAD)
  deadline: string | null;       // ISO date, null = rolling/ongoing
  application_url: string | null;
  source_url: string | null;     // Where it was scraped from
  eligibility: Record<string, unknown>;  // JSONB, role-specific criteria
  requirements: string[];
  category: string | null;
  tags: string[];
  source: 'scraped' | 'manual';
  scraped_from: string | null;   // Which scraper (e.g., "nserc")
  scraped_at: string | null;
  status: 'active' | 'expired' | 'archived';
  created_at: string;
  updated_at: string;
}

// === Forum (shared across all roles) ===
interface Thread {
  id: string;
  title: string;
  author_id: string;             // References profiles(id)
  category: string;
  content: string;
  tags: string[];
  views: number;
  helpful: number;
  created_at: string;
}

interface Reply {
  id: string;
  thread_id: string;             // References threads(id)
  author_id: string;             // References profiles(id)
  content: string;
  helpful_count: number;
  created_at: string;
}

// === Scraper Types (used in GitHub Actions, not stored in DB) ===
interface ScrapedFunding {
  name: string;
  description: string;
  provider: string;
  amount_min: number | null;
  amount_max: number | null;
  deadline: string | null;
  application_url: string;
  source_url: string;
  type: 'business_grant' | 'scholarship' | 'research_grant';
  eligibility: Record<string, unknown>;
  requirements: string[];
  category: string;
  tags: string[];
}

interface Scraper {
  name: string;                  // e.g., "nserc"
  type: 'business_grant' | 'scholarship' | 'research_grant';
  run(): Promise<ScrapedFunding[]>;
}
```

---

## Core Service Logic

### Funding Match Pipeline (all roles)

1. **User logs in** — Supabase Auth provides session, profile loaded with role + role-specific profile
2. **Load funding** — query Supabase `funding` table filtered by `type` matching user's role and `status = 'active'`
3. **Calculate match scores** — `calculateFundingMatch(profile, funding)` scores each item:
   - **Business:** province (25), revenue threshold (25), employee count (20), industry match (30)
   - **Student:** education level (30), field of study (25), province (15), GPA threshold (15), citizenship (15)
   - **Professor:** research area (30), career stage (25), council alignment (20), institution eligibility (15), past funding (10)
   - **On failure:** returns 0 score, item still displayed but flagged as low match
4. **Sort and filter** — funding sorted by match score, user applies role-specific filters
5. **Display results** — FundingCard components show match percentage with color coding (green >80%, yellow 60-80%, gray <60%)
6. **Detail view** — clicking an item shows full eligibility breakdown and application link

### Scraping Pipeline (daily, GitHub Actions)

1. **Trigger** — GitHub Actions cron fires at 3 AM UTC daily
2. **Run all scrapers** — each source module fetches its page, parses HTML with cheerio
3. **Normalize** — extracted data mapped to `ScrapedFunding` interface
4. **Deduplicate** — compare by name + provider + type against existing DB entries:
   - New → INSERT with `source: 'scraped'`, `status: 'active'`
   - Changed → UPDATE (description, amount, deadline, etc.)
   - Same → skip
5. **Auto-expire** — `UPDATE funding SET status='expired' WHERE deadline < NOW() AND status='active'`
6. **Log summary** — per-source counts: new, updated, expired, errors
7. **On failure:** individual source failure logged but doesn't stop other scrapers

### AI Chatbot Pipeline (OpenRouter)

1. **User sends message** — captured from chat input
2. **Build context** — current page, user role, user profile, recent funding matches
3. **Construct system prompt** — role-aware, page-aware, references specific funding by name
4. **Call OpenRouter API** — POST to `openrouter.ai/api/v1/chat/completions` with free model
5. **Stream response** — deliver with typing animation
6. **On failure:** fall back to hardcoded responses from `lib/ai-responses.ts`

### Auth Flow

1. **User clicks "Sign in with Google"** — Supabase Auth handles OAuth
2. **First login** — role selection modal ("I am a Business / Student / Professor")
3. **Create profile** — insert into `profiles` + role-specific table
4. **Onboarding** — brief profile form (business details / education info / research area)
5. **Return visits** — session cookie auto-refreshes, redirect to role-specific dashboard
6. **Middleware** — enforces route access based on role (business→/grants, student→/scholarships, professor→/research-funding)

---

## File Structure

```
auctus/
├── app/                              # Next.js App Router pages
│   ├── layout.tsx                    # Root layout — Navbar, Footer, Providers, ErrorBoundary
│   ├── page.tsx                      # Landing page (role selector before login, redirect after)
│   ├── providers.tsx                 # Context provider wrapper (Auth + Toast)
│   ├── globals.css                   # Global styles (Tailwind imports)
│   ├── middleware.ts                 # Role-based route protection
│   ├── auth/
│   │   └── callback/route.ts        # Supabase OAuth callback handler
│   ├── onboarding/
│   │   └── page.tsx                  # First-login profile setup
│   ├── dashboard/
│   │   └── page.tsx                  # Role-specific dashboard
│   ├── grants/
│   │   ├── page.tsx                  # Business grants (FundingPage type="business_grant")
│   │   └── [id]/page.tsx            # Grant detail
│   ├── scholarships/
│   │   ├── page.tsx                  # Student scholarships (FundingPage type="scholarship")
│   │   └── [id]/page.tsx            # Scholarship detail
│   ├── research-funding/
│   │   ├── page.tsx                  # Professor grants (FundingPage type="research_grant")
│   │   └── [id]/page.tsx            # Research grant detail
│   ├── forum/
│   │   ├── page.tsx                  # Forum listing (shared across all roles)
│   │   ├── [threadId]/page.tsx       # Thread detail with replies
│   │   └── new/page.tsx             # Create new thread
│   ├── profile/
│   │   └── page.tsx                  # User profile settings
│   ├── talent/
│   │   └── page.tsx                  # Talent marketplace (deferred — "Coming Soon")
│   └── api/
│       └── chat/route.ts            # OpenRouter AI chatbot endpoint
├── components/
│   ├── ui/                           # Reusable UI primitives
│   │   ├── Button.tsx, Card.tsx, Badge.tsx, Input.tsx, Select.tsx
│   │   ├── Modal.tsx, Toast.tsx, Skeleton.tsx
│   │   └── RoleSelector.tsx          # Role selection component (login + onboarding)
│   ├── cards/
│   │   ├── FundingCard.tsx           # Unified funding card (replaces GrantCard)
│   │   ├── ThreadCard.tsx, ReplyCard.tsx, StatsCard.tsx
│   │   ├── JobCard.tsx, TalentCard.tsx  # (deferred)
│   │   └── MatchCard.tsx             # (to be removed)
│   ├── funding/
│   │   ├── FundingPage.tsx           # Shared component for all 3 funding pages
│   │   ├── FundingFilters.tsx        # Role-specific filter panel
│   │   └── FundingDetail.tsx         # Shared detail view
│   ├── layout/
│   │   ├── Navbar.tsx                # Role-aware navigation
│   │   └── Footer.tsx
│   ├── AIChatbot.tsx                 # AI advisor (dynamically imported, OpenRouter)
│   └── ErrorBoundary.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client (anon key)
│   │   ├── server.ts                 # Server Supabase client (service key)
│   │   └── middleware.ts             # Supabase session helpers for middleware
│   ├── data-utils.ts                 # Centralized data access (Supabase queries)
│   ├── matching.ts                   # Funding match algorithms (all 3 roles)
│   ├── ai-responses.ts              # Hardcoded fallback responses (kept for fallback)
│   ├── AuthContext.tsx               # Auth state + role context provider
│   ├── ToastContext.tsx              # Toast notification context provider
│   └── utils.ts                      # Helper utilities
├── scraper/                          # Runs in GitHub Actions, NOT in Next.js
│   ├── package.json                  # Separate deps: cheerio, @supabase/supabase-js
│   ├── tsconfig.json
│   ├── index.ts                      # Main entry — runs all scrapers + expiry
│   ├── types.ts                      # ScrapedFunding, Scraper interfaces
│   ├── deduplicate.ts                # Upsert logic
│   ├── expire.ts                     # Auto-expiry logic
│   ├── supabase.ts                   # Supabase client (service key)
│   ├── utils.ts                      # parseAmount, parseDate, cleanText
│   └── sources/
│       ├── business/                 # 5 business grant scrapers
│       ├── student/                  # 5 scholarship scrapers
│       └── professor/               # 5 research grant scrapers
├── data/                             # Static JSON (legacy, to be replaced by Supabase)
│   ├── businesses.json, grants.json, threads.json, replies.json
│   ├── matches.json                  # To be deleted (matchmaker removed)
│   ├── jobs.json, talents.json       # Kept for deferred talent page
│   └── README.md                     # "Legacy data — see Supabase for live data"
├── .github/
│   └── workflows/
│       └── scrape.yml                # Daily scraper cron job
├── public/                           # Static assets
├── .env.example                      # Environment variable template
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── eslint.config.mjs
└── tsconfig.json
```

---

## Environment Variables

| Variable | Required | Description | Example |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key (safe for client) | `eyJhbGciOi...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (server only) | Supabase service key — bypasses RLS, never expose to client | `eyJhbGciOi...` |
| `OPENROUTER_API_KEY` | Yes (server only) | OpenRouter API key for AI chatbot | `sk-or-v1-...` |
| `NEXT_PUBLIC_APP_URL` | No | Application base URL | `http://localhost:3000` |
| `NODE_ENV` | No | Environment mode | `development` / `production` |

**Scraper (GitHub Actions secrets):**

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Same as NEXT_PUBLIC_SUPABASE_URL |
| `SUPABASE_SERVICE_KEY` | Same as SUPABASE_SERVICE_ROLE_KEY |

---

## API Reference

### Supabase (direct client queries, not REST endpoints)

Most data access goes through the Supabase JS client directly — no custom API routes needed for CRUD:

```typescript
// Fetch active scholarships
supabase.from('funding').select('*').eq('type', 'scholarship').eq('status', 'active')

// Fetch user profile with role-specific data
supabase.from('profiles').select('*, student_profiles(*)').eq('id', userId).single()

// Create forum thread
supabase.from('threads').insert({ title, content, category, author_id, tags })
```

RLS policies enforce that users can only read funding matching their role and only edit their own profiles/threads.

### Custom API Routes

**POST /api/chat** — AI chatbot endpoint
- Request: `{ message: string, context: { page: string, role: string, history: Message[] } }`
- Response: streaming text from OpenRouter
- Auth: requires valid Supabase session
- Fallback: hardcoded responses if OpenRouter fails

### Auth (Supabase Auth, not custom)

- Google OAuth sign-in/sign-out handled by Supabase client library
- Session managed via httpOnly cookies (automatic)
- Role stored in `profiles` table, read via Supabase client
- No custom auth API routes needed
