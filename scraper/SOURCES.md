# V2 ETL Source Verification Notes

> **STATUS — live tuned.** The current source modules were tuned against the live official pages on 2026-04-30. `npx tsx index.ts --dry-run` returned rows for all six locked sources, and a real run inserted/updated rows plus `scrape_runs` records in Supabase. The Business Benefits Finder itself is a Salesforce app, so the V2 parser uses the official Innovation Canada program surface and preserves the Benefits Finder URL as a source row.

---


The V2 funding pipeline ingests **only official Canadian government / public-sector sources**. Private aggregators (GrantCompass, GrantHub, Yconic, ScholarshipsCanada, Canada Grants Database, etc.) are explicitly rejected for the V2 first-pass ETL.

The list is `LOCKED-FOR-V2`: exactly two sources per role, six total. CIHR is **deferred** to the first post-V2 ETL expansion (most CIHR opportunities route through ResearchNet and are application-system oriented rather than first-pass scrape friendly).

Each module under `scraper/sources/` carries a leading comment that cites the verification line for its source. Update both this file and the module comment when a verification fact changes.

---

## Business

### 1. ISED — Business Benefits Finder

- Module: `scraper/sources/business/ised-benefits-finder.ts`
- Listing URL: `https://ised-isde.canada.ca/site/innovation-canada/en/innovation-canada`
- Tool URL: `https://innovation.ised-isde.canada.ca/s/?language=en_CA`
- robots.txt: `https://ised-isde.canada.ca/robots.txt` — public crawling permitted; no `Disallow` matches the funding paths used here.
- ToS / open data: Government of Canada content is published under the Open Government Licence – Canada (https://open.canada.ca/en/open-government-licence-canada). Attribution is satisfied via `source_url` / `scraped_from` fields on every imported row.
- Cadence: daily at `0 3 * * *` (UTC); aligned with the shared scrape workflow.
- URL pattern:
  - listing: official Innovation Canada program cards plus the Business Benefits Finder tool link.
  - detail: program landing pages linked from the Innovation Canada surface.
- Funding type: `business_grant`.

### 2. ISED — Supports for Business

- Module: `scraper/sources/business/ised-supports.ts`
- Listing URL: `https://ised-isde.canada.ca/site/ised/en/supports-for-business`
- robots.txt: same domain as above; public crawling permitted.
- ToS / open data: Open Government Licence – Canada.
- Cadence: daily at `0 3 * * *` (UTC).
- URL pattern:
  - listing: official support sections and links on the Supports for Business page.
  - detail: program-specific landing page on the linked host.
- Funding type: `business_grant`.

---

## Student

### 3. EduCanada Scholarships

- Module: `scraper/sources/student/educanada.ts`
- Listing URL: `https://www.educanada.ca/scholarships-bourses/non_can/index.aspx?lang=eng`
- robots.txt: `https://www.educanada.ca/robots.txt` — `User-agent: *` with no `Disallow` for the scholarships path.
- ToS / open data: Government of Canada content under the Open Government Licence – Canada.
- Cadence: weekly preference; current workflow runs all sources together when manually or cron triggered.
- URL pattern:
  - listing: query string above
  - detail: `https://www.educanada.ca/scholarships-bourses/non_can/...`
- Funding type: `scholarship`.

### 4. Indigenous Bursaries Search Tool

- Module: `scraper/sources/student/indigenous-bursaries.ts`
- Listing URL: `https://sac-isc.gc.ca/eng/1351185180120/1351685455328`
- robots.txt: `https://sac-isc.gc.ca/robots.txt` — public crawling permitted; no `Disallow` for the bursary tool path.
- ToS / open data: Open Government Licence – Canada.
- Cadence: weekly.
- URL pattern:
  - listing: the page renders the available bursary links in HTML.
  - detail: tool-specific permalink per bursary.
- Funding type: `scholarship`.

---

## Professor / Research

### 5. NSERC Funding Opportunities

- Module: `scraper/sources/professor/nserc.ts`
- Listing URL: `https://nserc.canada.ca/en/funding/funding-opportunity`
- robots.txt: `https://nserc.canada.ca/robots.txt` — public crawling permitted.
- ToS / open data: Government of Canada content under the Open Government Licence – Canada.
- Cadence: daily at `0 3 * * *` (UTC).
- URL pattern:
  - listing: page above renders opportunity cards using `gcds-link`.
  - detail: `https://nserc.canada.ca/en/funding-opportunity/...` per program.
- Funding type: `research_grant`.

### 6. SSHRC Funding Opportunities

- Module: `scraper/sources/professor/sshrc.ts`
- Listing URL: `https://sshrc-crsh.canada.ca/en/funding/opportunities.aspx`
- robots.txt: `https://sshrc-crsh.canada.ca/robots.txt` — public crawling permitted.
- ToS / open data: Open Government Licence – Canada.
- Cadence: daily at `0 3 * * *` (UTC).
- URL pattern:
  - listing: page above renders official research-funding links.
  - detail: official SSHRC/Government of Canada linked program pages.
- Funding type: `research_grant`.

---

## Cadence and Politeness

- Default per-source `rateLimitMs` between detail fetches: 1500 ms.
- Per-source failure isolation: a thrown error inside one source's `scrape()` is caught by the orchestrator, logged, and recorded in `scrape_runs`; remaining sources continue.
- Every imported row carries `source: 'scraped'`, `scraped_from` (listing URL), `scraped_at` (ISO timestamp), and a populated `source_url`. These three fields are part of the LOCKED `FundingItem` contract and are not optional.

## CIHR (Deferred)

CIHR is not part of the V2 ETL source list. Re-introducing it post-V2 requires a separate decision and a new module under `scraper/sources/professor/cihr.ts`; no scaffolding for it exists in V2.
