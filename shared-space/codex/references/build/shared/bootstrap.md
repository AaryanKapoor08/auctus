# V2.P1 Shared Bootstrap

This is the shared setup work that must complete **before** Dev A and Dev B can start V2.P2. It is the only gate that legitimately blocks both tracks at once.

Each item names the **assigned owner** and the **deliverable that proves it is done**.

---

## Bootstrap Owner

**Default owner: Dev A.** Reason: most shared bootstrap touches identity/config files Dev A already owns. Dev B is reviewer on every bootstrap PR.

Exceptions:

- **B5 Scraper workspace skeleton** — Dev B.
- **C3 Scrape workflow stub** — Dev B.
- **B3a Supabase CLI per developer** — both devs run the steps locally; Dev A authors the README.

Sequence note: V2.P1 also requires a `develop` branch and branch protection on `main` and `develop`. Dev A creates `develop` from `main` and configures protection rules at the start of V2.P1 (see `build/shared/conventions.md` "Initial setup"). All bootstrap PRs target `develop`; the V2.P1 completion gate is the first `develop → main` release PR.

---

## A. Repo Restructuring

### A1 — Mixed-file surgery PR

- **Owner:** Dev A (single PR, Dev B reviews)
- **What:** Execute every move listed in `build/shared/ownership.md` "Mixed-File Surgery" table.
- **Deliverable:** PR titled `chore(restructure): split mixed demo files and create domain folders`. After merge:
  - `app/(demo)/**`, `components/demo/**`, `lib/demo/**`, `data/demo/**` populated.
  - Empty target folders exist with placeholder `index.ts` per domain.
  - `npm run build` and `npm run lint` still pass.
  - Demo URLs (`/(demo)/funding`, `/(demo)/matchmaker`, `/(demo)/talent`) reachable in dev.

### A2 — TypeScript path aliases for contracts

- **Owner:** Dev A
- **What:** Add `paths` entry to `tsconfig.json` so contracts import as `@contracts/*`.
- **Deliverable:**
  ```json
  "paths": {
    "@contracts/*": ["build/contracts/*"]
  }
  ```
  Test: a throwaway `lib/_check.ts` importing `@contracts/role` typechecks.

### A3 — Convert BusinessContext.jsx to .tsx

- **Owner:** Dev A
- **What:** Rename `lib/demo/BusinessContext.jsx` to `.tsx`, add minimal types.
- **Deliverable:** File renamed, no `any` types added, build passes. Optional; punt to Dev A's hardening if it bloats the surgery PR.

---

## B. Backend / Infra

### B1 — Supabase project provisioned

- **Owner:** Dev A
- **What:** Create a single shared Supabase project (free tier). Capture URL, anon key, service role key into a private credentials note (NOT committed). Add corresponding entries to `.env.example`. Invite Priyan as a project member from the Supabase dashboard's organization settings.
- **Deliverable:**
  - `.env.example` contains:
    ```
    NEXT_PUBLIC_SUPABASE_URL=
    NEXT_PUBLIC_SUPABASE_ANON_KEY=
    SUPABASE_SERVICE_ROLE_KEY=
    ```
  - Both devs can sign in to the Supabase dashboard for the shared project.
  - Both devs have a working local `.env.local` (verified by running `npm run dev` and reaching the home page without an env-guard crash).

### B2 — Supabase JS dependency installed

- **Owner:** Dev A
- **What:** Install `@supabase/supabase-js` and `@supabase/ssr` (App Router cookie helper).
- **Deliverable:** `package.json` updated, `package-lock.json` committed, `npm ci` clean. Dev B reviews the diff (single-purpose PR).

### B3 — Migration tooling decision

- **Decision:** Use **raw SQL files in `supabase/migrations/`** applied via `supabase db push` from the Supabase CLI. No Prisma. Numbered `NNNN_description.sql`.
- **Owner:** Dev A
- **Deliverable:** `supabase/migrations/.gitkeep`, a `supabase/README.md` explaining the convention and migration numbering protocol (see `conventions.md`), and a sample no-op migration `0000_init.sql` that lands in the shared dev DB.

### B3a — Supabase CLI per developer

- **Owner:** Dev A authors the README; both devs execute the steps locally.
- **What:** Each dev installs the Supabase CLI, runs `supabase login`, then `supabase link --project-ref <ref>` against the shared project. Both verify they can run `supabase db push` against the dev DB.
- **Deliverable:**
  - `supabase/README.md` lists the install command (`npm i -g supabase` or platform equivalent), the `login` and `link` flow, and how to apply migrations.
  - Both devs confirm in their `progress.md` Notes that `supabase db push` works locally.

### B4 — Env-guard helper

- **Owner:** Dev A
- **What:** `lib/env.ts` exports a typed `env` object that throws with a clear message on missing required vars. Imported by both Supabase client modules.
- **Deliverable:** `lib/env.ts` committed; `npm run dev` without `.env.local` fails with a clear "missing NEXT_PUBLIC_SUPABASE_URL" error instead of a runtime crash deeper in the app.

### B5 — Scraper workspace skeleton

- **Owner:** Dev B
- **What:** Create `scraper/` as a separate Node package with its own `package.json` and `tsconfig.json`. No npm workspaces; the scraper is invoked by GitHub Actions and not bundled with the Next.js app.
- **Deliverable:**
  - `scraper/package.json` with `cheerio` and `@supabase/supabase-js`.
  - `scraper/tsconfig.json`.
  - `scraper/index.ts` with a `console.log("scraper bootstrapped")` placeholder.
  - `scraper/README.md` explaining how the scraper is invoked.
  - `cd scraper && npm install && npx tsx index.ts` prints the placeholder line.

### B6 — Google OAuth provider configuration

- **Owner:** Dev A
- **What:** Google OAuth uses two separate redirect-URL surfaces. Configure each in the right place:
  1. **Google Cloud Console** (this is the "what URLs may Google redirect a successful auth back to" list). Create an OAuth 2.0 Client (Web Application). Authorized redirect URIs **must contain only the Supabase callback URL** for this project: `https://<project-ref>.supabase.co/auth/v1/callback`. Do NOT add `http://localhost:3000/auth/callback` here — Google redirects to Supabase, not to the app.
  2. **Supabase dashboard → Authentication → Providers → Google** — paste the Google Client ID + Secret from step 1 and enable the provider.
  3. **Supabase dashboard → Authentication → URL Configuration** (this is the "what app URLs may Supabase redirect users back to after it finishes the OAuth handshake" list). Set Site URL to `http://localhost:3000` for dev. Add `http://localhost:3000/auth/callback` to the additional redirect URLs list. (When real hosting is wired up post-V2, the production `https://<host>/auth/callback` is added here too.)
- **Deliverable:** A throwaway sign-in attempt from the Supabase dashboard "Try sign-in" tool (or a curl-based OAuth flow) returns to a Supabase-hosted success page without provider errors. No app code is needed for this verification — this step is configuration only.

### B7 — Email OTP / magic-link provider configuration

- **Owner:** Dev A
- **What:**
  1. In Supabase dashboard → Authentication → Providers → Email: ensure the email provider is enabled, "Confirm email" is on, and magic-link sign-in is enabled.
  2. Configure the email template (default is fine for V2; just verify deliverability to a real test inbox).
- **Deliverable:** A test magic-link from the Supabase dashboard "Send test email" tool arrives in a real inbox and clicking it returns to the configured redirect URL.

---

## C. Quality / Tooling

### C1 — Vitest installed and wired

- **Owner:** Dev A
- **What:** Install `vitest` + `@vitest/coverage-v8`. Add `npm test` and `npm run test:watch` to root `package.json`. Add a single sanity test that imports a contract type.
- **Deliverable:** `npm test` runs and reports 1 pass.

### C2 — CI workflow

- **Owner:** Dev A
- **What:** `.github/workflows/ci.yml` runs `npm ci`, `npm run lint`, `npm run build`, `npm test` on push and PR.
- **Deliverable:** Workflow file committed; first PR after merge shows a green CI run.

### C3 — Scrape workflow stub

- **Owner:** Dev B
- **What:** `.github/workflows/scrape.yml` with cron schedule disabled by default and a manual `workflow_dispatch` trigger that runs `cd scraper && npm ci && npx tsx index.ts`.
- **Deliverable:** Workflow file committed. Manual run from GitHub UI succeeds and prints the placeholder line.

### C4 — GitHub Actions secrets

- **Owner:** Dev A (admin); Dev B verifies the scrape workflow can read them.
- **What:** Add the following secrets in GitHub Settings → Secrets and variables → Actions:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- **Deliverable:** A manual run of `scrape.yml` after C3 succeeds and the workflow logs confirm the secrets are visible (do not echo their values).

### C5 — Repo collaborator access

- **Owner:** Dev A
- **What:** Invite Priyan to the GitHub repository with `Maintain` (or higher) permission so he can open PRs, run workflows, and review without being a forked-PR dance.
- **Deliverable:** Priyan accepts the invite; he can push a branch named `dev-b/_access-check` and open a PR against `develop` that CI runs on.

---

## D. Contract Lock-in

### D1 — Lock the LOCKED contracts

- **Owner:** Dev A (role, route-policy)
- **What:** Confirm `build/contracts/role.ts` and `build/contracts/route-policy.ts` are LOCKED. No further edits without the protocol.
- **Deliverable:** Both files contain `// STATUS: LOCKED`. Confirmed in Dev A's progress.md "Contract changes consumed" section.

### D2 — Promote DRAFT contracts to LOCKED

- **Owner:** Dev A (profile, session), Dev B (funding)
- **What:** Walk through each DRAFT contract, agree on field set, change `// STATUS: DRAFT` to `// STATUS: LOCKED`.
- **Deliverable:** All five contract files at LOCKED. This is the V2.P1 completion gate.

---

## V2.P1 Completion Gate (proof required)

Tick all of these to advance to V2.P2:

- [ ] **A1** — surgery PR merged; demo URLs work; build green.
- [ ] **A2** — `@contracts/*` import resolves.
- [ ] **B1** — both devs hit Supabase dashboard; `.env.example` complete; Priyan invited to the Supabase project.
- [ ] **B2** — `npm ci` clean with supabase-js installed.
- [ ] **B3** — `supabase/migrations/0000_init.sql` applied to shared dev DB.
- [ ] **B3a** — both devs ran `supabase login` and `supabase link`; both can `supabase db push` against the shared dev DB.
- [ ] **B4** — `lib/env.ts` shipping, missing-var error verified.
- [ ] **B5** — `cd scraper && npx tsx index.ts` works.
- [ ] **B6** — Google OAuth provider configured in Supabase; throwaway sign-in returns a success page.
- [ ] **B7** — Email OTP / magic-link provider configured; test magic-link delivered to a real inbox.
- [ ] **C1** — `npm test` green with one sanity test.
- [ ] **C2** — CI workflow green on a real PR.
- [ ] **C3** — scrape workflow runs from GitHub UI.
- [ ] **C4** — GitHub Actions secrets added (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`); manual scrape run reads them.
- [ ] **C5** — Priyan accepted as repo collaborator; access verified via a `dev-b/_access-check` PR.
- [ ] **D2** — all five contract files at LOCKED.

Only after every box is ticked do Dev A and Dev B start their V2.P2 tracks.
