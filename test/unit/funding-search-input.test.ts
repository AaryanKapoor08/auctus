import { describe, expect, it } from "vitest";
import {
  FUNDING_MAX_PAGE,
  FUNDING_SEARCH_MAX_CHARS,
  normalizeFundingSearchInput,
  parseFundingCategories,
  parseFundingPageSearchParams,
} from "@/lib/funding/search-input";

describe("funding search input parsing", () => {
  it("normalizes repeated and oversized search params before provider use", () => {
    const normalized = normalizeFundingSearchInput([
      `  export\u0000${"a".repeat(FUNDING_SEARCH_MAX_CHARS + 20)}`,
      "ignored second value",
    ]);

    expect(normalized).toHaveLength(FUNDING_SEARCH_MAX_CHARS);
    expect(normalized).toContain("export");
    expect(normalized).not.toContain("\u0000");
    expect(normalized).not.toContain("ignored second value");
  });

  it("keeps only role-valid categories and caps extreme page offsets", () => {
    const parsed = parseFundingPageSearchParams(
      {
        search: ["growth grants", "second"],
        category: ["Federal,Invalid", "Innovation", "x".repeat(120)],
        deadline: ["30", "90"],
        sort: ["amount", "deadline"],
        page: "999999",
      },
      "business",
    );

    expect(parsed).toEqual({
      search: "growth grants",
      categories: ["Federal", "Innovation"],
      deadline: "30",
      sort: "amount",
      page: FUNDING_MAX_PAGE,
    });
  });

  it("deduplicates comma-separated categories after trimming", () => {
    expect(parseFundingCategories(" Federal, Federal ,STEM", "student")).toEqual([
      "Federal",
      "STEM",
    ]);
  });
});
