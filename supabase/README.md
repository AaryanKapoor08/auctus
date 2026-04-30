# Supabase Setup

Auctus V2 uses Supabase Auth, Postgres, and RLS.

## Required Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Do not commit `.env.local` or real secrets.

## CLI Setup

Install the Supabase CLI using the official method for your machine, or with npm:

```bash
npm i -g supabase
```

Authenticate:

```bash
supabase login
```

Link this repo to the Supabase project:

```bash
supabase link --project-ref <project-ref>
```

Apply migrations:

```bash
supabase db push
```

## Migration Rules

- Migrations live in `supabase/migrations/`.
- File names use `NNNN_description.sql`.
- `0000_init.sql` is a no-op bootstrap migration.
- Identity/community migrations use the ranges documented in the V2 ownership references.
- Funding/pipeline migrations use the funding ranges documented in the V2 ownership references.

## Manual Proof Needed

Record proof in `codex/SoloProgress.md` after:

- the Supabase project exists
- the env values are available locally
- `supabase login` works
- `supabase link --project-ref <project-ref>` works
- `supabase db push` applies migrations to the shared dev DB
