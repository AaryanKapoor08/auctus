# Manual Setup And Proof Checklist

Use this file for dashboard/browser work that cannot be completed by code edits.
Do not paste OAuth client secrets, Supabase service keys, or test-user passwords into chat or commits.

## Current Project Values

- Local app URL: `http://localhost:3000`
- App auth callback URL: `http://localhost:3000/auth/callback`
- Supabase project ref: `kwfoxklfbrbgbmgyyfcl`
- Supabase project URL: `https://kwfoxklfbrbgbmgyyfcl.supabase.co`
- Supabase OAuth callback URL for Google: `https://kwfoxklfbrbgbmgyyfcl.supabase.co/auth/v1/callback`

## 1. Google OAuth Client

Goal: create the Google client ID/secret that Supabase Auth will use.

1. Open Google Cloud Console.
2. Go to Google Auth Platform / APIs & Services for the Auctus project.
3. If the OAuth consent screen is not configured, configure it first:
   - App name: `Auctus`
   - User support email: your admin email.
   - Developer contact email: your admin email.
   - Audience/user type: use `External` unless this is restricted to one Google Workspace.
   - If the app is in testing mode, add the Google account you will use for browser proof as a test user.
4. Go to Clients / Credentials.
5. Create or edit an OAuth client.
6. Application type: `Web application`.
7. Name: `Auctus local Supabase Auth`.
8. Authorized JavaScript origins:
   - `http://localhost:3000`
9. Authorized redirect URIs:
   - `https://kwfoxklfbrbgbmgyyfcl.supabase.co/auth/v1/callback`
10. Do not add `http://localhost:3000/auth/callback` to Google redirect URIs. That URL belongs in Supabase URL Configuration.
11. Save the client.
12. Copy the Google Client ID and Client Secret into a private place long enough to paste them into Supabase. Do not commit them.

Done proof to record:

- Google OAuth web client exists.
- JavaScript origin is exactly `http://localhost:3000`.
- Redirect URI is exactly `https://kwfoxklfbrbgbmgyyfcl.supabase.co/auth/v1/callback`.
- Test Google account is allowed if Google Auth Platform is in testing mode.

Session note:

- 2026-05-04: Google OAuth client was created, but the client secret was visible in a screenshot. Treat that secret as exposed. Rotate/regenerate the client secret in Google before configuring Supabase, and use only the newly generated secret.

## 2. Supabase URL Configuration

Goal: allow Supabase Auth to redirect back to the local Next app.

1. Open Supabase Dashboard.
2. Select project `kwfoxklfbrbgbmgyyfcl`.
3. Go to Authentication -> URL Configuration.
4. Set Site URL:
   - `http://localhost:3000`
5. Add Redirect URLs:
   - `http://localhost:3000/auth/callback`
6. Save.

Done proof to record:

- Site URL is `http://localhost:3000`.
- Redirect URLs include `http://localhost:3000/auth/callback`.

## 3. Supabase Google Provider

Goal: enable the Google provider in Supabase Auth.

1. In Supabase Dashboard, go to Authentication -> Providers.
2. Open Google.
3. Enable Google provider.
4. Paste the Google Client ID from Step 1.
5. Paste the Google Client Secret from Step 1.
6. Save.
7. Confirm the callback URL shown by Supabase for Google matches:
   - `https://kwfoxklfbrbgbmgyyfcl.supabase.co/auth/v1/callback`

Done proof to record:

- Google provider is enabled in Supabase.
- Client ID is present.
- Client Secret is present but not exposed.
- Provider callback URL matches the Google authorized redirect URI.

## 4. Supabase Email/Password Provider

Goal: enable email/password sign-up and sign-in for local role-account proof.

1. In Supabase Dashboard, go to Authentication -> Providers.
2. Open Email.
3. Enable Email provider: `on`.
4. Allow email-based sign up and log in: `on`.
5. Secure email change: `on`.
6. Secure password change: `on`.
7. Require current password when updating: `on` if available. This does not affect current sign-up/sign-in proof because the app does not expose password changes yet.
8. Prevent use of leaked passwords: `on` if the plan allows it; otherwise leave unavailable/disabled.
9. Minimum password length: `8` recommended. `6` works, but use 8+ for QA accounts.
10. Password requirements: `No required characters (default)` is acceptable for local QA. Use a stronger option only if you want stricter account policy.
11. Email OTP expiration: keep `3600`.
12. Email OTP length: keep `8`.
13. For fastest local QA, temporarily disable email confirmation if the dashboard exposes a `Confirm email` toggle.
14. If email confirmation stays enabled, use a real inbox and confirm the account before trying to sign in.
15. Save.

Important app behavior:

- `/sign-up` calls `supabase.auth.signUp({ email, password })`.
- If Supabase immediately returns a session, the app redirects to `/onboarding`.
- If email confirmation is required and no session is returned, the app tries password sign-in. If Supabase rejects that because the email is unconfirmed, the app redirects to `/sign-in?notice=check_email`.
- `/sign-in` uses `supabase.auth.signInWithPassword({ email, password })`.

Done proof to record:

- Email provider is enabled.
- Password sign-in is enabled.
- Email confirmation setting is known: either disabled for local QA, or enabled and inbox confirmation was verified.

## 5. Local App Preflight

Goal: make sure the local app is running against the configured Supabase project.

1. Confirm `.env.local` contains:
   - `NEXT_PUBLIC_SUPABASE_URL=https://kwfoxklfbrbgbmgyyfcl.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=<project anon key>`
   - `SUPABASE_SERVICE_ROLE_KEY=<project service role key>`
2. Optional but explicit:
   - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
3. Start or reuse the dev server:
   - `npm run dev`
4. Open:
   - `http://localhost:3000`

Done proof to record:

- Dev server is reachable at `http://localhost:3000`.
- Public landing page loads.
- Public funding pages load while signed out:
  - `http://localhost:3000/grants`
  - `http://localhost:3000/scholarships`
  - `http://localhost:3000/research-funding`

Session proof:

- 2026-05-04: `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`; Supabase URL matches `https://kwfoxklfbrbgbmgyyfcl.supabase.co`.
- 2026-05-04: `NEXT_PUBLIC_SITE_URL` is not set, so the app uses its `http://localhost:3000` fallback.
- 2026-05-04: `GET /`, `GET /grants`, `GET /scholarships`, and `GET /research-funding` all returned HTTP 200 from `http://localhost:3000`.

## 6. Google OAuth Browser Proof

Goal: verify Google sign-in creates a session and routes correctly.

Use a fresh browser profile, incognito window, or clear localhost/Supabase cookies first.

1. Open `http://localhost:3000/sign-up`.
2. Click `Continue with Google`.
3. Complete Google consent.
4. Expected result for a new user:
   - Google redirects to Supabase.
   - Supabase redirects to `http://localhost:3000/auth/callback`.
   - The app exchanges the code for a session.
   - The app redirects to `/onboarding`.
5. Pick a role and complete onboarding.
6. Expected result:
   - Successful onboarding redirects to `/dashboard`.
7. Sign out.
8. Open `http://localhost:3000/sign-in`.
9. Click `Continue with Google` again with the same account.
10. Expected result for an onboarded returning user:
   - The app redirects to `/dashboard`, not `/onboarding`.

Done proof to record:

- New Google user reaches `/onboarding`.
- Onboarding persists and redirects to `/dashboard`.
- Returning Google user reaches `/dashboard`.
- Sign-out returns to `/`.

## 7. Email/Password Browser Proof

Goal: create three role accounts for later dashboard and RLS proof.

Use three real or disposable inboxes. Suggested names:

- Business account: `business-qa@...`
- Student account: `student-qa@...`
- Professor account: `professor-qa@...`

For each account:

1. Open `http://localhost:3000/sign-up`.
2. Enter email, password, and matching confirmation.
3. Submit.
4. If email confirmation is disabled, expected result is `/onboarding`.
5. If email confirmation is enabled:
   - Expected result may be `/sign-in?notice=check_email`.
   - Open the inbox.
   - Confirm the email.
   - Return to `http://localhost:3000/sign-in`.
   - Sign in with email/password.
   - Expected result is `/onboarding`.
6. Complete the role-specific onboarding form:
   - Business account chooses `business`.
   - Student account chooses `student`.
   - Professor account chooses `professor`.
7. Confirm each account lands on `/dashboard`.
8. Sign out before testing the next account.

Done proof to record:

- Business account exists and reaches `/dashboard`.
- Student account exists and reaches `/dashboard`.
- Professor account exists and reaches `/dashboard`.
- Returning sign-in for each account skips `/onboarding`.

## 8. Role Surface Browser Proof

Goal: verify the app behaves correctly after real auth works.

For each role account:

1. Sign in.
2. Confirm Home / Auctus AI link goes to `/`, not directly to `/dashboard`.
3. Confirm `/` remains accessible while signed in.
4. Confirm role-specific dashboard content appears on `/dashboard`.
5. Confirm public funding browse works for all signed-in roles:
   - `/grants`
   - `/scholarships`
   - `/research-funding`
6. Confirm personalization is on dashboard, not by blocking public browse.
7. Confirm the navbar does not treat a signed-in null-role user as a guest; null-role users should go to onboarding.
8. Sign out and confirm redirect to `/`.

Done proof to record:

- Business, student, and professor dashboards render correct summary surfaces.
- Public funding routes are readable by guests and all signed-in roles.
- Dashboard remains personalized by signed-in role.
- Sign-out returns to `/`.

## 9. GitHub Scrape Cron Proof

Goal: verify the scheduled GitHub Actions scraper run, not just manual dispatch.

1. Open GitHub repository Actions.
2. Open the `Scrape` workflow.
3. Find the first run triggered by the schedule after cron enablement.
4. Confirm it ran on `main`.
5. Confirm the run completed successfully.
6. In Supabase, query recent `scrape_runs`.
7. Confirm latest six source rows are recent and have status `success`.

Done proof to record:

- Scheduled `Scrape` workflow succeeded.
- Latest Supabase `scrape_runs` rows are fresh and successful.

## Research Sources Checked

- Supabase Google login setup: https://supabase.com/docs/guides/auth/social-login/auth-google
- Supabase redirect URL configuration: https://supabase.com/docs/guides/auth/redirect-urls
- Supabase password-based auth: https://supabase.com/docs/guides/auth/passwords
- Supabase passwordless auth behavior reference: https://supabase.com/docs/guides/auth/auth-email-passwordless
- Google OAuth client setup and URI rules: https://support.google.com/cloud/answer/15549257
