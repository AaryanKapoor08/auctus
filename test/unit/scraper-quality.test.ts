import { describe, expect, it } from "vitest";
import {
  checkActivePastDeadline,
  checkAmountRange,
  checkScrapedMetadata,
  runQualityChecks,
  type FundingRowSnapshot,
} from "@/scraper/quality";

const baseRow: FundingRowSnapshot = {
  id: "id-1",
  name: "Test Grant",
  provider: "Gov of Canada",
  type: "business_grant",
  amount_min: 10_000,
  amount_max: 50_000,
  deadline: "2026-12-01",
  status: "active",
  source: "scraped",
  source_url: "https://example.ca/grant",
  scraped_from: "https://example.ca/list",
  scraped_at: "2026-04-30T10:00:00Z",
};

describe("checkAmountRange", () => {
  it("flags min greater than max", () => {
    const issue = checkAmountRange({ ...baseRow, amount_min: 100, amount_max: 50 });
    expect(issue?.rule).toBe("amount_range");
  });

  it("does not flag valid ranges", () => {
    expect(checkAmountRange(baseRow)).toBe(null);
  });

  it("does not flag rows missing one bound", () => {
    expect(checkAmountRange({ ...baseRow, amount_min: null })).toBe(null);
    expect(checkAmountRange({ ...baseRow, amount_max: null })).toBe(null);
  });
});

describe("checkActivePastDeadline", () => {
  const asOf = new Date("2026-04-30T00:00:00Z");

  it("flags active rows whose deadline has passed", () => {
    const issue = checkActivePastDeadline(
      { ...baseRow, deadline: "2026-04-01" },
      asOf,
    );
    expect(issue?.rule).toBe("active_past_deadline");
  });

  it("does not flag expired rows", () => {
    expect(
      checkActivePastDeadline(
        { ...baseRow, status: "expired", deadline: "2026-04-01" },
        asOf,
      ),
    ).toBe(null);
  });

  it("does not flag rolling rows", () => {
    expect(checkActivePastDeadline({ ...baseRow, deadline: null }, asOf)).toBe(null);
  });
});

describe("checkScrapedMetadata", () => {
  it("flags scraped rows missing source_url, scraped_from, or scraped_at", () => {
    const issue = checkScrapedMetadata({ ...baseRow, source_url: null });
    expect(issue?.rule).toBe("scraped_missing_metadata");
  });

  it("does not flag manual rows", () => {
    expect(
      checkScrapedMetadata({ ...baseRow, source: "manual", source_url: null }),
    ).toBe(null);
  });

  it("does not flag complete scraped rows", () => {
    expect(checkScrapedMetadata(baseRow)).toBe(null);
  });
});

describe("runQualityChecks", () => {
  it("returns the union of all rule violations across rows", () => {
    const issues = runQualityChecks(
      [
        baseRow,
        { ...baseRow, id: "bad-amounts", amount_min: 200, amount_max: 100 },
        { ...baseRow, id: "bad-active", deadline: "2026-04-01" },
        { ...baseRow, id: "bad-meta", source_url: null },
      ],
      new Date("2026-04-30T00:00:00Z"),
    );
    expect(issues.map((i) => i.rule).sort()).toEqual(
      ["active_past_deadline", "amount_range", "scraped_missing_metadata"].sort(),
    );
  });

  it("returns no issues for a clean dataset", () => {
    expect(runQualityChecks([baseRow], new Date("2026-04-30T00:00:00Z"))).toEqual([]);
  });
});
