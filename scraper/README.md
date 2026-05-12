# Auctus Scraper

The scraper ingests official Canadian funding sources into Supabase. It runs as a separate Node package; the Next.js app does not import from it.

## Layout

```text
scraper/
  index.ts                 CLI entry point
  runner.ts                per-source runner with failure isolation
  types.ts                 shared scraper types
  utils.ts                 parsing helpers
  normalize.ts             maps scraped rows to database rows
  deduplicate.ts           insert, update, or skip existing funding rows
  expire.ts                expires active rows past their deadline
  supabase.ts              service-role Supabase client and stores
  sources/                 source modules
  SOURCES.md               source verification notes
```

Current sources:

- ISED Business Benefits Finder
- ISED business supports
- EduCanada scholarships
- Indigenous bursaries
- NSERC funding opportunities
- SSHRC funding opportunities

## Setup

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
  --bootstrap-only        Print a startup check and exit.
  --dry-run               Scrape and normalize rows without database writes.
  --source <id>           Limit the run to one source. Repeatable.
  -h, --help              Show help.
```

Source ids:

```text
ised-benefits-finder
ised-supports
educanada
indigenous-bursaries
nserc
sshrc
```

Run without database writes:

```bash
npx tsx index.ts --dry-run
```

Run one source:

```bash
npx tsx index.ts --dry-run --source nserc
```

Run with database writes:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
npx tsx index.ts
```

## Tests

Scraper tests live in `test/unit/scraper-*.test.ts` and run from the repository root:

```bash
npm test
```
