import type { FundingType } from "../build/contracts/funding.js";

export type SourceRole = "business" | "student" | "professor";

export interface ScrapedFunding {
  type: FundingType;
  name: string;
  description: string | null;
  provider: string;
  amount_min: number | null;
  amount_max: number | null;
  deadline: string | null;
  application_url: string | null;
  source_url: string;
  eligibility: Record<string, unknown>;
  requirements: string[];
  category: string | null;
  tags: string[];
  scraped_from: string;
}

export interface ScrapeContext {
  fetchHtml: (url: string) => Promise<string>;
  delay: (ms: number) => Promise<void>;
}

export interface SourceModule {
  id: string;
  role: SourceRole;
  type: FundingType;
  listingUrl: string;
  rateLimitMs: number;
  scrape: (ctx: ScrapeContext) => Promise<ScrapedFunding[]>;
}

export interface SourceCounts {
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
}

export interface SourceRunResult extends SourceCounts {
  sourceId: string;
  status: "success" | "failed";
  errorMessages: string[];
  startedAt: string;
  finishedAt: string;
}
