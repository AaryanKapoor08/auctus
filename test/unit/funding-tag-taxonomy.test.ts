import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const seedSql = readFileSync("supabase/seeds/funding_seed.sql", "utf8");
const canonicalSql = readFileSync(
  "supabase/migrations/0022_canonical_funding_filters.sql",
  "utf8",
);

function tagCount(tag: string) {
  const matches = seedSql.match(new RegExp(`'${tag.replace("-", "\\-")}'`, "g"));
  return matches?.length ?? 0;
}

describe("funding tag taxonomy", () => {
  it("retags seeded opportunities with common canonical filters", () => {
    expect(tagCount("STEM")).toBeGreaterThanOrEqual(3);
    expect(tagCount("Provincial")).toBeGreaterThanOrEqual(3);
    expect(tagCount("Federal")).toBeGreaterThanOrEqual(3);
  });

  it("keeps role-specific seeded records tagged by audience", () => {
    expect(tagCount("Business")).toBeGreaterThanOrEqual(5);
    expect(tagCount("Student")).toBeGreaterThanOrEqual(5);
    expect(tagCount("Professor")).toBeGreaterThanOrEqual(5);
  });

  it("backfills scraped rows into the expanded canonical filter taxonomy", () => {
    for (const tag of [
      "Financing",
      "Advisory",
      "Indigenous",
      "Undergraduate",
      "NSERC",
      "SSHRC",
      "Quantum",
      "Applied Research",
      "Equity / Diversity",
    ]) {
      expect(canonicalSql).toContain(`'${tag}'`);
    }
  });
});
