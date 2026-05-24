import { describe, expect, it } from "vitest";
import type { FundingFactRow } from "@/lib/funding/site-stats-shared";
import {
  aggregateFundingFactRows,
  buildFundingMetricTickerItems,
  buildFundingNewsTickerItems,
  formatFundingStatCurrency,
} from "@/lib/funding/site-stats-shared";

const asOf = new Date("2026-05-24T12:00:00.000Z");

const rows: FundingFactRow[] = [
  {
    type: "business_grant",
    provider: "ISED",
    amount_min: 10000,
    amount_max: 100000,
    deadline: "2026-10-01",
    tags: ["Business", "Digital", "Growth", "Federal"],
    scraped_from: "ised",
  },
  {
    type: "scholarship",
    provider: "EduCanada",
    amount_min: null,
    amount_max: 25000,
    deadline: null,
    tags: ["Student", "Merit-based", "Need-based", "STEM"],
    scraped_from: "educanada",
  },
  {
    type: "research_grant",
    provider: "NSERC",
    amount_min: 5000,
    amount_max: 500000,
    deadline: "2026-11-01",
    tags: ["Professor", "NSERC", "Partnership", "Equipment"],
    scraped_from: "nserc",
  },
];

describe("funding site stats", () => {
  it("aggregates live-display counts from active funding facts", () => {
    const stats = aggregateFundingFactRows(rows, asOf);

    expect(stats.totalOpen).toBe(3);
    expect(stats.providerCount).toBe(3);
    expect(stats.sourceCount).toBe(3);
    expect(stats.maxListedAmount).toBe(500000);
    expect(stats.byType).toEqual({
      business_grant: 1,
      scholarship: 1,
      research_grant: 1,
    });
    expect(stats.rollingByType.scholarship).toBe(1);
    expect(stats.withDeadlinesByType).toEqual({
      business_grant: 1,
      scholarship: 0,
      research_grant: 1,
    });
    expect(stats.upcoming30ByType).toEqual({
      business_grant: 0,
      scholarship: 0,
      research_grant: 0,
    });
    expect(stats.maxListedAmountByType).toEqual({
      business_grant: 100000,
      scholarship: 25000,
      research_grant: 500000,
    });
  });

  it("selects only tags that exist in the current funding facts", () => {
    const stats = aggregateFundingFactRows(rows, asOf);

    expect(stats.topTagsByType.business_grant).toEqual([
      "Digital",
      "Growth",
      "Federal",
    ]);
    expect(stats.topTagsByType.scholarship).toEqual([
      "Merit-based",
      "STEM",
      "Need-based",
    ]);
    expect(stats.topTagsByType.research_grant).toEqual([
      "NSERC",
      "Partnership",
      "Equipment",
    ]);
  });

  it("flags data-quality issues without inflating displayed counts", () => {
    const stats = aggregateFundingFactRows(
      [
        ...rows,
        {
          type: "business_grant",
          provider: "Bad Row",
          amount_min: 200,
          amount_max: 100,
          deadline: "2026-05-01",
          tags: [],
          scraped_from: null,
        },
      ],
      asOf,
    );

    expect(stats.quality).toEqual({
      activePastDeadlineCount: 1,
      invalidAmountRangeCount: 1,
    });
    expect(stats.upcoming30ByType.business_grant).toBe(0);
    expect(stats.totalOpen).toBe(4);
  });

  it("builds ticker text from the same stats object used by page counts", () => {
    const stats = aggregateFundingFactRows(rows, asOf);

    expect(buildFundingMetricTickerItems(stats)).toEqual([
      "3 open opportunities",
      "3 providers indexed",
      "1 grants",
      "1 scholarships",
      "1 research funds",
    ]);
    expect(buildFundingNewsTickerItems(stats)).toContain(
      "$500,000 largest listed value",
    );
    expect(formatFundingStatCurrency(null)).toBe("Varies");
  });
});
