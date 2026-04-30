import type { FundingItem } from "../build/contracts/funding.js";
import type { ScrapedFunding } from "./types.js";

export type NormalizedFunding = Omit<FundingItem, "id" | "created_at" | "updated_at">;

export function normalize(scraped: ScrapedFunding, now: Date = new Date()): NormalizedFunding {
  const scrapedAt = now.toISOString();
  return {
    type: scraped.type,
    name: scraped.name,
    description: scraped.description,
    provider: scraped.provider,
    amount_min: scraped.amount_min,
    amount_max: scraped.amount_max,
    deadline: scraped.deadline,
    application_url: scraped.application_url,
    source_url: scraped.source_url,
    eligibility: scraped.eligibility,
    requirements: scraped.requirements,
    category: scraped.category,
    tags: scraped.tags,
    source: "scraped",
    scraped_from: scraped.scraped_from,
    scraped_at: scrapedAt,
    status: "active",
  };
}
