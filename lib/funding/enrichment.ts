import "server-only";

import type { Role } from "@contracts/role";
import { COMBINED_PROMPT_VERSION, SCHEMA_VERSIONS, type AiTaskType } from "@/lib/ai/enrichment-schema";
import { createFundingReadClient } from "./supabase";
import { getFundingTypeForRole } from "./role-mapping";
import type { FundingItem } from "@contracts/funding";

export interface FundingTaskEnrichment {
  funding_id: string;
  task_type: AiTaskType;
  summary: string | null;
  eligibility_bullets: string[];
  best_fit_applicant: string | null;
  normalized_tags: string[];
  application_checklist: string[];
  match_reason_templates: Record<string, unknown>;
  data_quality_flags: unknown[];
  deadline_urgency: string | null;
  confidence: number;
  provider: string;
  model: string;
  enriched_at: string;
}

export type FundingEnrichmentBundle = Partial<Record<AiTaskType, FundingTaskEnrichment>>;

export const RADAR_COVERAGE_THRESHOLD = 0.8;

export interface FundingRadarInsight {
  key: "new_this_month" | "closing_soon" | "high_value" | "underused" | "recently_updated";
  label: string;
  value: string;
  detail: string;
}

export interface FundingRadar {
  coverage: number;
  insights: FundingRadarInsight[];
}

type RawEnrichmentRow = FundingTaskEnrichment & {
  content_hash: string;
  needs_review: boolean;
  prompt_version: number;
  schema_version: number;
  funding: {
    content_hash: string;
    type?: string;
    status?: string;
  } | null;
};

function isCurrentRow(row: RawEnrichmentRow) {
  return (
    !row.needs_review &&
    row.funding?.content_hash === row.content_hash &&
    row.prompt_version === COMBINED_PROMPT_VERSION &&
    row.schema_version === SCHEMA_VERSIONS[row.task_type]
  );
}

function bundleRows(rows: RawEnrichmentRow[]): Record<string, FundingEnrichmentBundle> {
  const output: Record<string, FundingEnrichmentBundle> = {};
  for (const row of rows.filter(isCurrentRow)) {
    output[row.funding_id] = {
      ...(output[row.funding_id] ?? {}),
      [row.task_type]: {
        funding_id: row.funding_id,
        task_type: row.task_type,
        summary: row.summary,
        eligibility_bullets: row.eligibility_bullets ?? [],
        best_fit_applicant: row.best_fit_applicant,
        normalized_tags: row.normalized_tags ?? [],
        application_checklist: row.application_checklist ?? [],
        match_reason_templates: row.match_reason_templates ?? {},
        data_quality_flags: row.data_quality_flags ?? [],
        deadline_urgency: row.deadline_urgency,
        confidence: Number(row.confidence),
        provider: row.provider,
        model: row.model,
        enriched_at: row.enriched_at,
      },
    };
  }
  return output;
}

export async function getEnrichmentForFunding(
  id: string,
): Promise<FundingEnrichmentBundle | null> {
  const rowsByFunding = await getEnrichmentForFundingIds([id]);
  return rowsByFunding[id] ?? null;
}

export async function getEnrichmentForFundingIds(
  ids: string[],
): Promise<Record<string, FundingEnrichmentBundle>> {
  if (ids.length === 0) return {};

  const supabase = await createFundingReadClient();
  const { data, error } = await supabase
    .from("funding_ai_enrichment")
    .select("*, funding!inner(content_hash,status)")
    .in("funding_id", ids)
    .eq("needs_review", false)
    .eq("prompt_version", COMBINED_PROMPT_VERSION);

  if (error) throw error;

  return bundleRows((data ?? []) as RawEnrichmentRow[]);
}

export async function getEnrichmentForRole(
  role: Role,
): Promise<Record<string, FundingEnrichmentBundle>> {
  const supabase = await createFundingReadClient();
  const { data, error } = await supabase
    .from("funding_ai_enrichment")
    .select("*, funding!inner(content_hash,status,type)")
    .eq("funding.status", "active")
    .eq("funding.type", getFundingTypeForRole(role))
    .eq("needs_review", false)
    .eq("prompt_version", COMBINED_PROMPT_VERSION);

  if (error) throw error;

  return bundleRows((data ?? []) as RawEnrichmentRow[]);
}

export function getCardEnrichment(
  bundle: FundingEnrichmentBundle | null | undefined,
) {
  const summary = bundle?.summary?.summary;
  return summary ? { summary } : null;
}

function parseDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sameUtcMonth(a: Date, b: Date) {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth();
}

function daysUntil(deadline: string | null, asOf: Date) {
  const date = parseDate(deadline);
  if (!date) return null;
  const start = Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate());
  const due = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.ceil((due - start) / 86_400_000);
}

function formatCompactCurrency(value: number | null) {
  if (value === null) return "Not listed";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    notation: value >= 1000000 ? "compact" : "standard",
    maximumFractionDigits: 0,
  }).format(value);
}

export function buildFundingRadar(input: {
  items: FundingItem[];
  enrichmentByFundingId: Record<string, FundingEnrichmentBundle>;
  asOf: Date;
}): FundingRadar {
  const eligibleItems = input.items.filter((item) => item.status === "active");
  if (eligibleItems.length === 0) return { coverage: 1, insights: [] };

  const enrichedCount = eligibleItems.filter(
    (item) => Boolean(input.enrichmentByFundingId[item.id]?.summary),
  ).length;
  const coverage = enrichedCount / eligibleItems.length;
  if (coverage < RADAR_COVERAGE_THRESHOLD) {
    return { coverage, insights: [] };
  }

  const newThisMonth = eligibleItems.filter((item) => {
    const created = parseDate(item.created_at);
    return created ? sameUtcMonth(created, input.asOf) : false;
  }).length;
  const closingSoon = eligibleItems.filter((item) => {
    const days = daysUntil(item.deadline, input.asOf);
    return days !== null && days >= 0 && days <= 30;
  }).length;
  const highValue = eligibleItems.reduce<number | null>((max, item) => {
    if (item.amount_max === null) return max;
    return max === null ? item.amount_max : Math.max(max, item.amount_max);
  }, null);
  const rolling = eligibleItems.filter((item) => item.deadline === null).length;
  const recentlyUpdated = eligibleItems.filter((item) => {
    const updated = parseDate(item.updated_at);
    if (!updated) return false;
    return input.asOf.getTime() - updated.getTime() <= 14 * 86_400_000;
  }).length;

  return {
    coverage,
    insights: [
      {
        key: "new_this_month",
        label: "New this month",
        value: String(newThisMonth),
        detail: "Recently added active opportunities.",
      },
      {
        key: "closing_soon",
        label: "Closing soon",
        value: String(closingSoon),
        detail: "Deadlines within the next 30 days.",
      },
      {
        key: "high_value",
        label: "Highest listed value",
        value: formatCompactCurrency(highValue),
        detail: "Largest maximum award in this role track.",
      },
      {
        key: "underused",
        label: "Rolling programs",
        value: String(rolling),
        detail: "No fixed deadline published.",
      },
      {
        key: "recently_updated",
        label: "Recently updated",
        value: String(recentlyUpdated),
        detail: "Changed in the last 14 days.",
      },
    ],
  };
}

export async function getFundingRadarForRole(
  role: Role,
  options: { asOf?: Date } = {},
): Promise<FundingRadar> {
  const supabase = await createFundingReadClient();
  const { data, error } = await supabase
    .from("funding")
    .select("*")
    .eq("status", "active")
    .eq("type", getFundingTypeForRole(role))
    .limit(500);

  if (error) throw error;
  const items = (data ?? []) as FundingItem[];
  const enrichmentByFundingId = await getEnrichmentForFundingIds(
    items.map((item) => item.id),
  );
  return buildFundingRadar({
    items,
    enrichmentByFundingId,
    asOf: options.asOf ?? new Date(),
  });
}
