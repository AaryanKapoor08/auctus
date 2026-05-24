import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildFundingEmbeddingText,
  rankFundingItemsBySemanticIds,
  toVectorLiteral,
} from "@/lib/funding/semantic-search";

const fundingPageSources = [
  "app/(funding)/grants/page.tsx",
  "app/(funding)/scholarships/page.tsx",
  "app/(funding)/research-funding/page.tsx",
].map((path) => readFileSync(join(process.cwd(), path), "utf8"));

describe("funding semantic search helpers", () => {
  it("builds provider input only from public funding fields", () => {
    const text = buildFundingEmbeddingText({
      id: "funding-1",
      name: "Export Grant",
      provider: "ISED",
      category: "Innovation",
      tags: ["Federal", "Export"],
      description: "Supports export growth.",
      eligibility: { country: "Canada" },
      requirements: ["Business plan"],
      content_hash: "hash",
    });

    expect(text).toContain("Export Grant");
    expect(text).toContain("Supports export growth.");
    expect(text).not.toContain("email");
  });

  it("orders funding rows by semantic rank while preserving unranked rows", () => {
    const ranked = rankFundingItemsBySemanticIds(
      [{ id: "a" }, { id: "b" }, { id: "c" }],
      ["c", "a"],
    );

    expect(ranked.map((item) => item.id)).toEqual(["c", "a", "b"]);
  });

  it("rejects vectors that do not fit the locked pgvector dimension", () => {
    expect(() => toVectorLiteral([0.1, 0.2])).toThrow(/768/);
  });

  it("wires server-side semantic rankings into every funding browser", () => {
    for (const source of fundingPageSources) {
      expect(source).toContain("getSemanticSearchRankingForRole");
      expect(source).toContain("rankFundingItemsBySemanticIds");
      expect(source).toContain("semanticRankedIds=");
    }
  });
});
