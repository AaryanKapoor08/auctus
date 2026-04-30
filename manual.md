# Manual Setup Checklist

Do these external setup steps before the next implementation window needs real Supabase or GitHub Actions proof.

## Supabase

1. Create a Supabase project. `[done]`
2. Copy these values from the Supabase dashboard. `[done]`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Add the same values to local `.env.local` when runtime wiring begins. `[done]`
4. Supabase CLI setup. `[done]`
   - `supabase login`
   - `supabase init`
   - `supabase link --project-ref kwfoxklfbrbgbmgyyfcl`
   - `supabase db push`

## GitHub Actions

Add these repository secrets in GitHub:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The workflows already exist in `.github/workflows/`.

Status: `[done]`

The secrets were set with GitHub CLI and verified by listing secret names only.

## Deferred

Google OAuth setup is intentionally deferred for now.

Email magic-link provider verification is still pending.

Branch protection on `main` and `develop` is done.
