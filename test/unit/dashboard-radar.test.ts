import { describe, expect, it } from "vitest";
import type { FundingItem } from "@contracts/funding";
import {
  RADAR_COVERAGE_THRESHOLD,
  buildFundingRadar,
  type FundingEnrichmentBundle,
} from "@/lib/funding/enrichment";

function item(input: Partial<FundingItem> & { id: string }): FundingItem {
  return {
    id: input.id,
    type: "business_grant",
    name: input.name ?? input.id,
    description: "",
    provider: "Provider",
    amount_min: null,
    amount_max: input.amount_max ?? null,
    deadline: input.deadline ?? null,
    application_url: null,
    source_url: null,
    eligibility: {},
    requirements: [],
    category: null,
    tags: [],
    source: "scraped",
    scraped_from: null,
    scraped_at: null,
    status: input.status ?? "active",
    created_at: input.created_at ?? "2026-05-01T00:00:00.000Z",
    updated_at: input.updated_at ?? "2026-05-02T00:00:00.000Z",
  };
}

const summaryBundle: FundingEnrichmentBundle = {
  summary: {
    funding_id: "x",
    task_type: "summary",
    summary: "AI summary",
    eligibility_bullets: [],
    best_fit_applicant: null,
    normalized_tags: [],
    application_checklist: [],
    match_reason_templates: {},
    data_quality_flags: [],
    deadline_urgency: null,
    confidence: 0.9,
    provider: "mock",
    model: "mock",
    enriched_at: "2026-05-01T00:00:00.000Z",
  },
};

describe("dashboard funding radar", () => {
  it("hides radar when current enrichment coverage is below threshold", () => {
    const radar = buildFundingRadar({
      items: [item({ id: "a" }), item({ id: "b" })],
      enrichmentByFundingId: { a: summaryBundle },
      asOf: new Date("2026-05-08T00:00:00.000Z"),
    });

    expect(RADAR_COVERAGE_THRESHOLD).toBe(0.8);
    expect(radar.coverage).toBe(0.5);
    expect(radar.insights).toHaveLength(0);
  });

  it("renders role radar insights when coverage reaches threshold", () => {
    const radar = buildFundingRadar({
      items: [
        item({ id: "a", amount_max: 100000, deadline: "2026-05-20" }),
        item({ id: "b", amount_max: 50000 }),
      ],
      enrichmentByFundingId: { a: summaryBundle, b: summaryBundle },
      asOf: new Date("2026-05-08T00:00:00.000Z"),
    });

    expect(radar.coverage).toBe(1);
    expect(radar.insights.map((insight) => insight.key)).toEqual([
      "new_this_month",
      "closing_soon",
      "high_value",
      "underused",
      "recently_updated",
    ]);
  });
});
