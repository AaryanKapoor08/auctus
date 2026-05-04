import { describe, expect, it } from "vitest";
import { normalize } from "@/scraper/normalize";
import type { ScrapedFunding } from "@/scraper/types";

const baseScraped: ScrapedFunding = {
  type: "research_grant",
  name: "Discovery Grant",
  description: "Operating funding for established researchers.",
  provider: "NSERC",
  amount_min: 25_000,
  amount_max: 100_000,
  deadline: "2026-11-01",
  application_url: "https://nserc.canada.ca/en/funding/discovery",
  source_url: "https://nserc.canada.ca/en/funding/discovery",
  eligibility: { audience: "professor", council: "NSERC" },
  requirements: [],
  category: "research",
  tags: ["nserc"],
  scraped_from: "https://nserc.canada.ca/en/funding/funding-opportunity",
};

describe("normalize", () => {
  it("sets source, scraped_at, and status to active", () => {
    const now = new Date("2026-04-30T10:00:00Z");
    const result = normalize(baseScraped, now);
    expect(result.source).toBe("scraped");
    expect(result.scraped_at).toBe(now.toISOString());
    expect(result.status).toBe("active");
    expect(result.scraped_from).toBe(baseScraped.scraped_from);
  });

  it("preserves all source fields needed by FundingItem", () => {
    const result = normalize(baseScraped, new Date("2026-04-30T10:00:00Z"));
    expect(result.name).toBe(baseScraped.name);
    expect(result.provider).toBe(baseScraped.provider);
    expect(result.amount_max).toBe(baseScraped.amount_max);
    expect(result.deadline).toBe(baseScraped.deadline);
    expect(result.eligibility).toEqual(baseScraped.eligibility);
    expect(result.tags).toEqual([
      "Professor",
      "Research",
      "Federal",
      "NSERC",
      "STEM",
      "Discovery",
    ]);
    expect(result.category).toBe("NSERC");
  });
});
