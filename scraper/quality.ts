import type { NormalizedFunding } from "./normalize.js";

export interface FundingRowSnapshot {
  id?: string;
  name: string;
  provider: string;
  type: NormalizedFunding["type"];
  amount_min: number | null;
  amount_max: number | null;
  deadline: string | null;
  status: NormalizedFunding["status"];
  source: NormalizedFunding["source"];
  source_url: string | null;
  scraped_from: string | null;
  scraped_at: string | null;
}

export interface QualityIssue {
  rule:
    | "amount_range"
    | "active_past_deadline"
    | "scraped_missing_metadata";
  rowId?: string;
  rowKey: string;
  detail: string;
}

function rowKey(row: FundingRowSnapshot): string {
  return `${row.name}|${row.provider}|${row.type}`;
}

export function checkAmountRange(row: FundingRowSnapshot): QualityIssue | null {
  if (row.amount_min == null || row.amount_max == null) return null;
  if (row.amount_min <= row.amount_max) return null;
  return {
    rule: "amount_range",
    rowId: row.id,
    rowKey: rowKey(row),
    detail: `amount_min (${row.amount_min}) > amount_max (${row.amount_max})`,
  };
}

export function checkActivePastDeadline(
  row: FundingRowSnapshot,
  asOf: Date,
): QualityIssue | null {
  if (row.status !== "active") return null;
  if (!row.deadline) return null;
  const due = Date.parse(row.deadline);
  if (!Number.isFinite(due)) return null;
  const today = Date.parse(asOf.toISOString().slice(0, 10));
  if (due >= today) return null;
  return {
    rule: "active_past_deadline",
    rowId: row.id,
    rowKey: rowKey(row),
    detail: `status=active but deadline ${row.deadline} is before ${asOf.toISOString().slice(0, 10)}`,
  };
}

export function checkScrapedMetadata(row: FundingRowSnapshot): QualityIssue | null {
  if (row.source !== "scraped") return null;
  const missing: string[] = [];
  if (!row.source_url) missing.push("source_url");
  if (!row.scraped_from) missing.push("scraped_from");
  if (!row.scraped_at) missing.push("scraped_at");
  if (missing.length === 0) return null;
  return {
    rule: "scraped_missing_metadata",
    rowId: row.id,
    rowKey: rowKey(row),
    detail: `scraped row missing: ${missing.join(", ")}`,
  };
}

export function checkRow(
  row: FundingRowSnapshot,
  asOf: Date = new Date(),
): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const r1 = checkAmountRange(row);
  if (r1) issues.push(r1);
  const r2 = checkActivePastDeadline(row, asOf);
  if (r2) issues.push(r2);
  const r3 = checkScrapedMetadata(row);
  if (r3) issues.push(r3);
  return issues;
}

export function runQualityChecks(
  rows: FundingRowSnapshot[],
  asOf: Date = new Date(),
): QualityIssue[] {
  return rows.flatMap((row) => checkRow(row, asOf));
}
