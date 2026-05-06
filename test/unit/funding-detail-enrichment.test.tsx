import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { FundingItem } from "@contracts/funding";
import FundingDetail from "@/components/funding/FundingDetail";
import type { FundingEnrichmentBundle } from "@/lib/funding/enrichment";

const item: FundingItem = {
  id: "funding-1",
  type: "business_grant",
  name: "Growth Grant",
  description: "Canonical provider description.",
  provider: "Gov",
  amount_min: null,
  amount_max: 10000,
  deadline: null,
  application_url: "https://example.test/apply",
  source_url: "https://example.test/source",
  eligibility: {},
  requirements: ["Apply online"],
  category: "Growth",
  tags: ["Federal"],
  source: "scraped",
  scraped_from: "fixture",
  scraped_at: "2026-05-06T00:00:00.000Z",
  status: "active",
  created_at: "2026-05-06T00:00:00.000Z",
  updated_at: "2026-05-06T00:00:00.000Z",
};

const enrichment: FundingEnrichmentBundle = {
  summary: {
    funding_id: "funding-1",
    task_type: "summary",
    summary: "Validated enrichment summary.",
    eligibility_bullets: [],
    best_fit_applicant: null,
    normalized_tags: [],
    application_checklist: [],
    match_reason_templates: {},
    data_quality_flags: [],
    deadline_urgency: null,
    confidence: 0.8,
    provider: "mock",
    model: "mock",
    enriched_at: "2026-05-06T00:00:00.000Z",
  },
  checklist: {
    funding_id: "funding-1",
    task_type: "checklist",
    summary: null,
    eligibility_bullets: [],
    best_fit_applicant: null,
    normalized_tags: [],
    application_checklist: ["Confirm eligibility.", "Gather documents."],
    match_reason_templates: {},
    data_quality_flags: [],
    deadline_urgency: "rolling",
    confidence: 0.8,
    provider: "mock",
    model: "mock",
    enriched_at: "2026-05-06T00:00:00.000Z",
  },
};

describe("FundingDetail enrichment rendering", () => {
  it("renders validated enrichment summary and checklist when present", () => {
    const html = renderToStaticMarkup(
      <FundingDetail item={item} enrichment={enrichment} />,
    );

    expect(html).toContain("Overview");
    expect(html).toContain("Validated enrichment summary.");
    expect(html).toContain("Application prep checklist");
    expect(html).toContain("Preparation guidance, not legal or financial advice.");
    expect(html).not.toContain("Canonical provider description.");
  });

  it("falls back to canonical description when enrichment is missing", () => {
    const html = renderToStaticMarkup(<FundingDetail item={item} />);

    expect(html).toContain("Canonical provider description.");
    expect(html).not.toContain("Application prep checklist");
  });
});
