import { describe, expect, it } from "vitest";
import { parseArgs, selectSources } from "@/scraper/cli";
import type { SourceModule } from "@/scraper/types";

function fakeSource(id: string): SourceModule {
  return {
    id,
    role: "business",
    type: "business_grant",
    listingUrl: `https://example.ca/${id}`,
    rateLimitMs: 0,
    scrape: async () => [],
  };
}

describe("parseArgs", () => {
  it("recognizes the standalone flags", () => {
    const opts = parseArgs(["--bootstrap-only"]);
    expect(opts.bootstrapOnly).toBe(true);
    expect(opts.dryRun).toBe(false);
  });

  it("collects --source ids", () => {
    const opts = parseArgs(["--source", "nserc", "--source=sshrc"]);
    expect(opts.sourceIds).toEqual(["nserc", "sshrc"]);
  });

  it("flags --source without an id", () => {
    const opts = parseArgs(["--source"]);
    expect(opts.unknown).toContain("--source requires an id");
  });

  it("captures unknown flags", () => {
    const opts = parseArgs(["--whoa"]);
    expect(opts.unknown).toContain("--whoa");
  });

  it("supports --dry-run combined with --source", () => {
    const opts = parseArgs(["--dry-run", "--source", "nserc"]);
    expect(opts.dryRun).toBe(true);
    expect(opts.sourceIds).toEqual(["nserc"]);
  });
});

describe("selectSources", () => {
  const all = [fakeSource("a"), fakeSource("b"), fakeSource("c")];

  it("returns every source when no ids are given", () => {
    expect(selectSources(all, []).selected.map((s) => s.id)).toEqual(["a", "b", "c"]);
  });

  it("filters in the requested order", () => {
    const { selected, unknown } = selectSources(all, ["c", "a"]);
    expect(selected.map((s) => s.id)).toEqual(["c", "a"]);
    expect(unknown).toEqual([]);
  });

  it("reports unknown ids without throwing", () => {
    const { selected, unknown } = selectSources(all, ["a", "missing"]);
    expect(selected.map((s) => s.id)).toEqual(["a"]);
    expect(unknown).toEqual(["missing"]);
  });
});
