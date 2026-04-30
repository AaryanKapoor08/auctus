# Auctus Scraper

ETL pipeline that ingests funding rows for the Auctus V2 multi-role platform.

The scraper is a separate Node package that talks to Supabase via the service-role key. It is run locally for development or through GitHub Actions in production. The Next.js app never imports from this package.

## Layout

```
scraper/
  index.ts                 entry point (CLI)
  runner.ts                generic per-source orchestrator with failure isolation
  types.ts                 ScrapedFunding, ScrapeContext, SourceModule, SourceRunResult
  utils.ts                 cleanText, parseAmount, parseAmountRange, parseDate, resolveUrl
  normalize.ts             ScrapedFunding -> NormalizedFunding (sets source/scraped_at/status)
  deduplicate.ts           (name, provider, type) keyed insert/update/skip
  expire.ts                expire active rows whose deadline has passed
  supabase.ts              service-role client factory + Supabase-backed dedupe/expire stores
  sources/index.ts         the locked SOURCES array (one entry per locked source)
  sources/business/        ised-benefits-finder, ised-supports
  sources/student/         educanada, indigenous-bursaries
  sources/professor/       nserc, sshrc
  SOURCES.md               per-source verification notes (robots.txt, ToS, cadence, URL pattern)
```

The locked V2 source list is **official Canadian government / public-sector sources only** (six total, two per role). Private aggregators are explicitly rejected. CIHR is deferred to the first post-V2 ETL expansion. See `SOURCES.md` for verification notes.

## Local Bootstrap

```bash
npm install
npx tsx index.ts --bootstrap-only
```

Expected output:

```text
scraper bootstrapped
```

## CLI

```text
Options:
  --bootstrap-only        Print "scraper bootstrapped" and exit (no DB access).
  --dry-run               Run the scrape pipeline but do not write to Supabase.
                          Prints normalized rows + per-source counts to stdout.
  --source <id>           Limit the run to one source (repeatable).
                          Ids: ised-benefits-finder, ised-supports,
                               educanada, indigenous-bursaries, nserc, sshrc.
  -h, --help              Show this message.
```

A real run requires the Supabase env vars below and writes to the linked Supabase project:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
npx tsx index.ts
```

To iterate on a source's selectors against the live HTML without touching the database:

```bash
npx tsx index.ts --dry-run --source nserc
```

`--dry-run` calls each selected source's `scrape(...)` and `normalize(...)`, then prints one normalized JSON row per line plus per-source counts. No Supabase env vars are required for `--dry-run` (or `--bootstrap-only` / `--help`).

> **Live tuned:** the six locked source modules were tuned against their official live pages on 2026-04-30. Re-run `--dry-run` after any source-site redesign and update `SOURCES.md` if selectors or source surfaces change.

For each registered source the scraper:

1. fetches the listing page (rate-limited, polite User-Agent header),
2. parses it with cheerio into `ScrapedFunding[]`,
3. normalizes (sets `source='scraped'`, `scraped_from`, `scraped_at`, `status='active'`),
4. deduplicates by `(name, provider, type)` against `public.funding` — insert / update / skip,
5. records per-source counts to `public.scrape_runs` via `recordScrapeRun`.

After every source has run, expired-deadline rows are flipped from `active` to `expired`.

## Adding a Future Source

1. Drop a new module under `sources/<role>/<slug>.ts` exporting a `SourceModule`.
2. Append the module to the array in `sources/index.ts`.
3. Add a row to the `funding_sources` seed in `supabase/migrations/0004_scrape_metadata.sql` (or insert it on the live DB).
4. No changes to `index.ts`, `runner.ts`, `deduplicate.ts`, `expire.ts`, or any other source.

## GitHub Actions

The manual `Scrape` workflow runs this package from `.github/workflows/scrape.yml`.

Required repository secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Tests

Vitest tests live at the repo root under `test/unit/scraper-*.test.ts`:

- `scraper-utils.test.ts` — parsing helpers
- `scraper-normalize.test.ts` — metadata stamping
- `scraper-dedupe.test.ts` — insert / update / skip logic
- `scraper-expire.test.ts` — expire delegation
- `scraper-runner.test.ts` — failure isolation, per-source counts, onResult, expire hook
- `scraper-sources.test.ts` — fixture-backed parsing for all six locked sources
- `scraper-quality.test.ts` — `runQualityChecks` rules: no `amount_min > amount_max`, no `status='active'` past deadline, scraped rows preserve `source_url`/`scraped_from`/`scraped_at`

Run with `npm test` from the repo root.

## Data-quality Rules

`scraper/quality.ts` exports `runQualityChecks(rows, asOf?)`. The same rules are documented in `supabase/README.md` as raw SQL for spot-checking the live dev DB after a scrape run.
