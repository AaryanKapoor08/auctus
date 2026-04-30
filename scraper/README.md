# Auctus Scraper

This package is the V2 funding ingestion workspace. It is intentionally separate from the Next.js app and is run locally or through GitHub Actions.

## Local Bootstrap

```bash
npm install
npx tsx index.ts
```

Expected output:

```text
scraper bootstrapped
```

## GitHub Actions

The manual `Scrape` workflow runs this package from `.github/workflows/scrape.yml`.

Required repository secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

The bootstrap workflow verifies the secrets are present without printing their values.
