import { describe, expect, it } from "vitest";
import { canonicalFundingTags, primaryFundingCategory } from "@/scraper/canonical-tags";
import type { ScrapedFunding } from "@/scraper/types";

function scraped(partial: Partial<ScrapedFunding>): ScrapedFunding {
  return {
    type: "scholarship",
    name: "Award",
    description: null,
    provider: "Provider",
    amount_min: null,
    amount_max: null,
    deadline: null,
    application_url: null,
    source_url: "https://example.com",
    eligibility: {},
    requirements: [],
    category: null,
    tags: [],
    scraped_from: "https://example.com",
    ...partial,
  };
}

describe("canonicalFundingTags", () => {
  it("retags raw Indigenous scholarship rows into useful student facets", () => {
    const tags = canonicalFundingTags(
      scraped({
        name: "Yukon Nursing Education Bursary for Indigenous Students",
        provider: "Indigenous Services Canada",
        category: "indigenous",
        tags: ["indigenous"],
        scraped_from: "https://sac-isc.gc.ca/eng/1351185180120/1351685455328",
      }),
    );

    expect(tags).toEqual(
      expect.arrayContaining([
        "Student",
        "Scholarship",
        "Federal",
        "Provincial",
        "Indigenous",
        "Need-based",
        "Health",
        "Education",
      ]),
    );
  });

  it("classifies business support rows by business need and audience", () => {
    const tags = canonicalFundingTags(
      scraped({
        type: "business_grant",
        name: "Women Entrepreneurship Strategy",
        description: "Supports women entrepreneurs through funding, mentorship, training and growth opportunities.",
        provider: "Innovation, Science and Economic Development Canada",
        category: "business",
        tags: ["business-support"],
        scraped_from: "https://ised-isde.canada.ca/site/ised/en/supports-for-business",
      }),
    );

    expect(tags).toEqual(
      expect.arrayContaining([
        "Business",
        "Federal",
        "Growth",
        "Financing",
        "Advisory",
        "Women",
      ]),
    );
  });

  it("classifies research opportunities by council and program focus", () => {
    const tags = canonicalFundingTags(
      scraped({
        type: "research_grant",
        name: "Alliance International Catalyst Quantum grants",
        description: "Support researchers in Canada to initiate international collaborations in quantum science.",
        provider: "NSERC",
        category: "research",
        tags: ["nserc", "closed"],
        scraped_from: "https://nserc.canada.ca/en/funding/funding-opportunity",
      }),
    );

    expect(tags).toEqual(
      expect.arrayContaining([
        "Professor",
        "Research",
        "Federal",
        "NSERC",
        "STEM",
        "Quantum",
        "Partnership",
        "International",
      ]),
    );
    expect(primaryFundingCategory("research_grant", tags)).toBe("NSERC");
  });
});
