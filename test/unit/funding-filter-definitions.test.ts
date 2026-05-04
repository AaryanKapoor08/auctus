import { describe, expect, it } from "vitest";
import { FUNDING_FILTERS } from "@/lib/funding/filter-definitions";

function valuesFor(role: keyof typeof FUNDING_FILTERS) {
  return (
    FUNDING_FILTERS[role]
      .find((filter) => filter.key === "category")
      ?.options?.map((option) => option.value) ?? []
  );
}

describe("funding filter definitions", () => {
  it("covers high-signal business needs and founder audiences", () => {
    expect(valuesFor("business")).toEqual(
      expect.arrayContaining([
        "Startup",
        "Growth",
        "Financing",
        "Export",
        "Digital",
        "Innovation",
        "Advisory",
        "Indigenous",
        "Women",
        "Black Entrepreneurs",
      ]),
    );
  });

  it("covers student audience, award type, study level, and field facets", () => {
    expect(valuesFor("student")).toEqual(
      expect.arrayContaining([
        "Indigenous",
        "International",
        "Need-based",
        "Merit-based",
        "Graduate",
        "Undergraduate",
        "STEM",
        "Health",
        "Business",
        "Arts",
        "Education",
      ]),
    );
  });

  it("covers professor source, area, and program-focus facets", () => {
    expect(valuesFor("professor")).toEqual(
      expect.arrayContaining([
        "NSERC",
        "SSHRC",
        "STEM",
        "Social Sciences",
        "Quantum",
        "Partnership",
        "International",
        "Applied Research",
        "Training",
      ]),
    );
  });
});
