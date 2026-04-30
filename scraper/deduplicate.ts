import type { NormalizedFunding } from "./normalize.js";

export type DedupeAction = "insert" | "update" | "skip";

export interface DedupeDecision {
  action: DedupeAction;
  existingId: string | null;
  fields: NormalizedFunding;
}

export interface ExistingRow {
  id: string;
  name: string;
  provider: string;
  type: NormalizedFunding["type"];
  description: string | null;
  amount_min: number | null;
  amount_max: number | null;
  deadline: string | null;
  application_url: string | null;
  source_url: string | null;
  eligibility: Record<string, unknown>;
  requirements: string[];
  category: string | null;
  tags: string[];
  status: NormalizedFunding["status"];
}

const COMPARED_FIELDS: Array<keyof NormalizedFunding> = [
  "description",
  "amount_min",
  "amount_max",
  "deadline",
  "application_url",
  "source_url",
  "eligibility",
  "requirements",
  "category",
  "tags",
  "status",
];

export function dedupeKey(row: { name: string; provider: string; type: string }): string {
  return [normalizeKey(row.name), normalizeKey(row.provider), row.type].join("|");
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, i) => deepEqual(item, b[i]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const keysA = Object.keys(a as object).sort();
    const keysB = Object.keys(b as object).sort();
    if (keysA.length !== keysB.length) return false;
    if (keysA.some((k, i) => k !== keysB[i])) return false;
    return keysA.every((k) =>
      deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
    );
  }
  return false;
}

export function decide(
  incoming: NormalizedFunding,
  existing: ExistingRow | null,
): DedupeDecision {
  if (!existing) {
    return { action: "insert", existingId: null, fields: incoming };
  }

  const allMatch = COMPARED_FIELDS.every((field) =>
    deepEqual(incoming[field], (existing as unknown as Record<string, unknown>)[field]),
  );

  return {
    action: allMatch ? "skip" : "update",
    existingId: existing.id,
    fields: incoming,
  };
}

export interface DedupeStore {
  findExisting(row: NormalizedFunding): Promise<ExistingRow | null>;
  insert(row: NormalizedFunding): Promise<void>;
  update(id: string, row: NormalizedFunding): Promise<void>;
}

export interface DedupeResult {
  inserted: number;
  updated: number;
  skipped: number;
}

export async function dedupeAndUpsert(
  rows: NormalizedFunding[],
  store: DedupeStore,
): Promise<DedupeResult> {
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const existing = await store.findExisting(row);
    const decision = decide(row, existing);
    if (decision.action === "insert") {
      await store.insert(decision.fields);
      inserted += 1;
    } else if (decision.action === "update" && decision.existingId) {
      await store.update(decision.existingId, decision.fields);
      updated += 1;
    } else {
      skipped += 1;
    }
  }

  return { inserted, updated, skipped };
}
