import { describe, expect, it } from "vitest";
import {
  cleanText,
  parseAmount,
  parseAmountRange,
  parseDate,
  resolveUrl,
} from "@/scraper/utils";

describe("cleanText", () => {
  it("collapses whitespace and non-breaking spaces", () => {
    expect(cleanText("  hello  world  \n  there ")).toBe("hello world there");
  });

  it("returns empty string for null/undefined", () => {
    expect(cleanText(null)).toBe("");
    expect(cleanText(undefined)).toBe("");
  });
});

describe("parseAmount", () => {
  it("parses plain integers and currency formatting", () => {
    expect(parseAmount("$50,000")).toBe(50_000);
    expect(parseAmount(" 1,234 ")).toBe(1_234);
  });

  it("supports k / m / b suffixes", () => {
    expect(parseAmount("$25k")).toBe(25_000);
    expect(parseAmount("2.5M")).toBe(2_500_000);
    expect(parseAmount("1B")).toBe(1_000_000_000);
  });

  it("returns null for unparseable input", () => {
    expect(parseAmount("")).toBe(null);
    expect(parseAmount(null)).toBe(null);
    expect(parseAmount("varies")).toBe(null);
  });
});

describe("parseAmountRange", () => {
  it("returns max when only one value is present", () => {
    expect(parseAmountRange("Up to $50,000")).toEqual({ min: null, max: 50_000 });
  });

  it("returns min and max when a range is present", () => {
    expect(parseAmountRange("$10,000 to $50,000")).toEqual({ min: 10_000, max: 50_000 });
    expect(parseAmountRange("$5k - $25k")).toEqual({ min: 5_000, max: 25_000 });
  });

  it("returns nulls when nothing parses", () => {
    expect(parseAmountRange("varies")).toEqual({ min: null, max: null });
    expect(parseAmountRange(null)).toEqual({ min: null, max: null });
  });
});

describe("parseDate", () => {
  it("parses ISO dates", () => {
    expect(parseDate("2026-08-15")).toBe("2026-08-15");
  });

  it("parses common natural-language dates", () => {
    expect(parseDate("August 15, 2026")).toBe("2026-08-15");
  });

  it("returns null for rolling/ongoing markers", () => {
    expect(parseDate("Rolling")).toBe(null);
    expect(parseDate("ongoing")).toBe(null);
    expect(parseDate("Open call")).toBe(null);
  });

  it("returns null for unparseable input", () => {
    expect(parseDate(null)).toBe(null);
    expect(parseDate("not a date")).toBe(null);
  });
});

describe("resolveUrl", () => {
  it("resolves relative URLs against the base", () => {
    expect(resolveUrl("/funding/123", "https://example.ca/list")).toBe(
      "https://example.ca/funding/123",
    );
  });

  it("returns absolute URLs unchanged", () => {
    expect(resolveUrl("https://other.ca/x", "https://example.ca/list")).toBe(
      "https://other.ca/x",
    );
  });

  it("returns null for empty href", () => {
    expect(resolveUrl(null, "https://example.ca/list")).toBe(null);
    expect(resolveUrl("", "https://example.ca/list")).toBe(null);
  });
});
