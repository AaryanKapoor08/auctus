import "server-only";

import type { Role } from "@contracts/role";
import { COMBINED_PROMPT_VERSION, SCHEMA_VERSIONS, type AiTaskType } from "@/lib/ai/enrichment-schema";
import { createFundingReadClient } from "./supabase";
import { getFundingTypeForRole } from "./role-mapping";

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
