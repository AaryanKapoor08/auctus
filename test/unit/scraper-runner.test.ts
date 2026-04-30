import { describe, expect, it } from "vitest";
import { runSources } from "@/scraper/runner";
import type { DedupeStore, ExistingRow } from "@/scraper/deduplicate";
import type { NormalizedFunding } from "@/scraper/normalize";
import type {
  ScrapeContext,
  ScrapedFunding,
  SourceModule,
  SourceRunResult,
} from "@/scraper/types";

function makeSource(
  id: string,
  rows: ScrapedFunding[],
  opts: { throws?: boolean } = {},
): SourceModule {
  return {
    id,
    role: "business",
    type: "business_grant",
    listingUrl: `https://example.ca/${id}`,
    rateLimitMs: 0,
    scrape: async () => {
      if (opts.throws) throw new Error(`boom-${id}`);
      return rows;
    },
  };
}

function makeRow(name: string): ScrapedFunding {
  return {
    type: "business_grant",
    name,
    description: null,
    provider: "Gov of Canada",
    amount_min: null,
    amount_max: 10_000,
    deadline: "2026-12-01",
    application_url: `https://example.ca/${name}`,
    source_url: `https://example.ca/${name}`,
    eligibility: {},
    requirements: [],
    category: null,
    tags: [],
    scraped_from: "https://example.ca/list",
  };
}

class MemoryStore implements DedupeStore {
  rows = new Map<string, ExistingRow>();
  async findExisting(row: NormalizedFunding): Promise<ExistingRow | null> {
    return this.rows.get(`${row.name}|${row.provider}|${row.type}`) ?? null;
  }
  async insert(row: NormalizedFunding): Promise<void> {
    this.rows.set(`${row.name}|${row.provider}|${row.type}`, {
      id: `id-${this.rows.size + 1}`,
      name: row.name,
      provider: row.provider,
      type: row.type,
      description: row.description,
      amount_min: row.amount_min,
      amount_max: row.amount_max,
      deadline: row.deadline,
      application_url: row.application_url,
      source_url: row.source_url,
      eligibility: row.eligibility,
      requirements: row.requirements,
      category: row.category,
      tags: row.tags,
      status: row.status,
    });
  }
  async update(): Promise<void> {}
}

const ctx: ScrapeContext = {
  fetchHtml: async () => "",
  delay: async () => {},
};

describe("runSources", () => {
  it("isolates per-source failures and continues with the rest", async () => {
    const store = new MemoryStore();
    const sources = [
      makeSource("ok-1", [makeRow("a"), makeRow("b")]),
      makeSource("bad", [], { throws: true }),
      makeSource("ok-2", [makeRow("c")]),
    ];

    const results = await runSources({
      sources,
      context: ctx,
      dedupeStore: store,
      logger: { info() {}, error() {} },
    });

    expect(results).toHaveLength(3);
    const byId = Object.fromEntries(results.map((r) => [r.sourceId, r]));
    expect(byId["ok-1"].status).toBe("success");
    expect(byId["ok-1"].fetched).toBe(2);
    expect(byId["ok-1"].inserted).toBe(2);
    expect(byId["bad"].status).toBe("failed");
    expect(byId["bad"].errorMessages[0]).toContain("boom-bad");
    expect(byId["ok-2"].status).toBe("success");
    expect(byId["ok-2"].inserted).toBe(1);
  });

  it("invokes onResult for every source", async () => {
    const recorded: SourceRunResult[] = [];
    await runSources({
      sources: [
        makeSource("ok", [makeRow("x")]),
        makeSource("err", [], { throws: true }),
      ],
      context: ctx,
      dedupeStore: new MemoryStore(),
      logger: { info() {}, error() {} },
      onResult: (r) => {
        recorded.push(r);
      },
    });
    expect(recorded.map((r) => r.sourceId)).toEqual(["ok", "err"]);
    expect(recorded[1].status).toBe("failed");
  });

  it("calls expireStore after sources run", async () => {
    let expireCalledWith: Date | null = null;
    await runSources({
      sources: [makeSource("ok", [makeRow("y")])],
      context: ctx,
      dedupeStore: new MemoryStore(),
      expireStore: {
        async expirePastDeadlines(asOf) {
          expireCalledWith = asOf;
          return 0;
        },
      },
      logger: { info() {}, error() {} },
    });
    expect(expireCalledWith).toBeInstanceOf(Date);
  });
});
