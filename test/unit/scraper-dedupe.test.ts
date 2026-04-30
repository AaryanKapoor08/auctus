import { describe, expect, it } from "vitest";
import {
  dedupeAndUpsert,
  dedupeKey,
  decide,
  type DedupeStore,
  type ExistingRow,
} from "@/scraper/deduplicate";
import type { NormalizedFunding } from "@/scraper/normalize";

const incoming: NormalizedFunding = {
  type: "scholarship",
  name: "Vanier Canada Graduate Scholarship",
  description: "Doctoral-level scholarship.",
  provider: "Government of Canada",
  amount_min: null,
  amount_max: 50_000,
  deadline: "2026-11-01",
  application_url: "https://example.ca/vanier",
  source_url: "https://example.ca/vanier",
  eligibility: { audience: "student" },
  requirements: [],
  category: "doctoral",
  tags: ["doctoral"],
  source: "scraped",
  scraped_from: "https://example.ca/list",
  scraped_at: "2026-04-30T10:00:00Z",
  status: "active",
};

function makeExisting(overrides: Partial<ExistingRow> = {}): ExistingRow {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    name: incoming.name,
    provider: incoming.provider,
    type: incoming.type,
    description: incoming.description,
    amount_min: incoming.amount_min,
    amount_max: incoming.amount_max,
    deadline: incoming.deadline,
    application_url: incoming.application_url,
    source_url: incoming.source_url,
    eligibility: incoming.eligibility,
    requirements: incoming.requirements,
    category: incoming.category,
    tags: incoming.tags,
    status: incoming.status,
    ...overrides,
  };
}

describe("dedupeKey", () => {
  it("normalizes case and whitespace", () => {
    expect(
      dedupeKey({ name: "  Vanier  ", provider: "Gov of Canada", type: "scholarship" }),
    ).toBe("vanier|gov of canada|scholarship");
  });
});

describe("decide", () => {
  it("returns insert when no existing row", () => {
    expect(decide(incoming, null).action).toBe("insert");
  });

  it("returns skip when fields match", () => {
    const result = decide(incoming, makeExisting());
    expect(result.action).toBe("skip");
    expect(result.existingId).toBe("11111111-1111-1111-1111-111111111111");
  });

  it("returns update when a tracked field differs", () => {
    const result = decide(incoming, makeExisting({ amount_max: 25_000 }));
    expect(result.action).toBe("update");
    expect(result.existingId).toBe("11111111-1111-1111-1111-111111111111");
  });
});

class FakeStore implements DedupeStore {
  existing = new Map<string, ExistingRow>();
  inserts: NormalizedFunding[] = [];
  updates: Array<{ id: string; row: NormalizedFunding }> = [];

  async findExisting(row: NormalizedFunding): Promise<ExistingRow | null> {
    return this.existing.get(dedupeKey(row)) ?? null;
  }
  async insert(row: NormalizedFunding): Promise<void> {
    this.inserts.push(row);
    this.existing.set(dedupeKey(row), {
      id: `id-${this.inserts.length}`,
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
  async update(id: string, row: NormalizedFunding): Promise<void> {
    this.updates.push({ id, row });
  }
}

describe("dedupeAndUpsert", () => {
  it("counts insert, update, and skip across runs", async () => {
    const store = new FakeStore();
    const first = await dedupeAndUpsert([incoming], store);
    expect(first).toEqual({ inserted: 1, updated: 0, skipped: 0 });

    const sameAgain = await dedupeAndUpsert([incoming], store);
    expect(sameAgain).toEqual({ inserted: 0, updated: 0, skipped: 1 });

    const changed = { ...incoming, amount_max: 75_000 };
    const updateRun = await dedupeAndUpsert([changed], store);
    expect(updateRun).toEqual({ inserted: 0, updated: 1, skipped: 0 });
    expect(store.updates).toHaveLength(1);
    expect(store.updates[0].id).toBe("id-1");
  });
});
