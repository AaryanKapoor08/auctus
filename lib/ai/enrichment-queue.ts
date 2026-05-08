import "server-only";

import type { FundingItem } from "@contracts/funding";
import { createFundingServiceClient } from "@/lib/funding/supabase";
import {
  AI_INPUT_TEXT_LIMIT_CHARS,
  COMBINED_PROMPT_VERSION,
  SCHEMA_VERSIONS,
  combinedEnrichmentResponseSchema,
  isNeedsReview,
  schemaVersionFor,
  validateTaskTypes,
  type AiTaskOutput,
  type AiTaskType,
} from "./enrichment-schema";
import {
  AiProviderError,
  normalizeProviderPreference,
  type AiProvider,
  type AiProviderId,
  type ProviderResult,
} from "./provider";
import { redactAiLogValue } from "./redact";

export interface AiEnrichmentJob {
  id: string;
  funding_id: string;
  content_hash: string;
  task_types: string[];
  status: "pending" | "processing" | "enriched" | "needs_review" | "failed_retryable" | "failed_permanent";
  attempt_count: number;
  provider_preference: "auto" | "gemini-only" | "openrouter-only" | "gemini-then-openrouter";
  next_attempt_at: string;
  last_error: string | null;
}

export interface AiEnrichmentRunBudget {
  monthlyTokenBudget: number;
  monthlyCostBudgetCents: number;
  monthToDateTokens: number;
  monthToDateCostCents: number;
}

export interface AiEnrichmentRowInput {
  funding_id: string;
  task_type: AiTaskType;
  content_hash: string;
  summary: string | null;
  eligibility_bullets: string[];
  best_fit_applicant: string | null;
  normalized_tags: string[];
  application_checklist: string[];
  match_reason_templates: Record<string, unknown>;
  data_quality_flags: unknown[];
  deadline_urgency: string | null;
  confidence: number;
  needs_review: boolean;
  provider: string;
  model: string;
  prompt_version: number;
  schema_version: number;
}

export interface QueueRunResult {
  status: "success" | "partial" | "aborted_budget" | "failed";
  abortedReason: "token_budget" | "cost_budget" | null;
  rowsAttempted: number;
  rowsEnriched: number;
  rowsNeedsReview: number;
  rowsFailed: number;
  tokensIn: number;
  tokensOut: number;
  costInCents: number;
  costOutCents: number;
  enrichmentRows: AiEnrichmentRowInput[];
  quarantinedPayloads: Array<{
    jobId: string;
    fundingId: string;
    errorCategory: string;
    redactedPayload: string;
  }>;
  updatedJobs: AiEnrichmentJob[];
  errorSummary: {
    by_provider: Record<string, Record<string, number>>;
    by_validator: Record<string, number>;
  };
}

export function computeBudgetAbortReason(
  budget: AiEnrichmentRunBudget,
): "token_budget" | "cost_budget" | null {
  if (budget.monthToDateTokens >= budget.monthlyTokenBudget) return "token_budget";
  if (budget.monthToDateCostCents >= budget.monthlyCostBudgetCents) return "cost_budget";
  return null;
}

export function nextRetryAt(
  now: Date,
  attemptCount: number,
  retryAfterSeconds: number | null = null,
) {
  const backoffMinutes = attemptCount <= 1 ? 1 : attemptCount === 2 ? 5 : 30;
  const delayMs = retryAfterSeconds === null
    ? backoffMinutes * 60_000
    : retryAfterSeconds * 1000;
  return new Date(now.getTime() + delayMs).toISOString();
}

function incrementError(
  target: Record<string, Record<string, number>>,
  provider: string,
  category: string,
) {
  target[provider] = {
    ...(target[provider] ?? {}),
    [category]: (target[provider]?.[category] ?? 0) + 1,
  };
}

function taskOutputToRow(input: {
  output: AiTaskOutput;
  fundingId: string;
  contentHash: string;
  providerResult: ProviderResult;
  validatorFlagged: boolean;
}): AiEnrichmentRowInput {
  const { output, fundingId, contentHash, providerResult, validatorFlagged } = input;
  const base = {
    funding_id: fundingId,
    task_type: output.task_type,
    content_hash: contentHash,
    summary: null,
    eligibility_bullets: [],
    best_fit_applicant: null,
    normalized_tags: [],
    application_checklist: [],
    match_reason_templates: {},
    data_quality_flags: [],
    deadline_urgency: null,
    confidence: output.confidence,
    needs_review: isNeedsReview(output.confidence, validatorFlagged),
    provider: providerResult.provider,
    model: providerResult.model,
    prompt_version: COMBINED_PROMPT_VERSION,
    schema_version: schemaVersionFor(output.task_type),
  };

  if (output.task_type === "summary") {
    return {
      ...base,
      summary: output.summary,
      eligibility_bullets: output.eligibility_bullets,
      best_fit_applicant: output.best_fit_applicant,
    };
  }

  if (output.task_type === "tags") {
    return { ...base, normalized_tags: output.normalized_tags };
  }

  if (output.task_type === "checklist") {
    return {
      ...base,
      application_checklist: output.application_checklist,
      deadline_urgency: output.deadline_urgency,
    };
  }

  if (output.task_type === "match_reasons") {
    return { ...base, match_reason_templates: output.match_reason_templates };
  }

  if (output.task_type === "data_quality") {
    const flags = output.flags;
    return {
      ...base,
      data_quality_flags: flags,
      needs_review: isNeedsReview(
        output.confidence,
        flags.some((flag) => flag.severity === "review"),
      ),
    };
  }

  return { ...base, data_quality_flags: output.insights };
}

async function callAndValidate(input: {
  provider: AiProvider;
  funding: FundingItem & { content_hash?: string };
  taskTypes: AiTaskType[];
  repairMode?: boolean;
}) {
  const providerResult = await input.provider.enrich({
    funding: input.funding,
    taskTypes: input.taskTypes,
    promptVersion: COMBINED_PROMPT_VERSION,
    schemaVersions: SCHEMA_VERSIONS,
    maxInputChars: AI_INPUT_TEXT_LIMIT_CHARS,
    repairMode: input.repairMode,
  });
  return {
    providerResult,
    parsed: combinedEnrichmentResponseSchema.parse(providerResult.output),
  };
}

export async function runMockableEnrichmentQueue(input: {
  jobs: AiEnrichmentJob[];
  fundingById: Map<string, FundingItem & { content_hash?: string }>;
  providers: Partial<Record<AiProviderId, AiProvider>>;
  budget: AiEnrichmentRunBudget;
  now?: Date;
  maxRows?: number;
}): Promise<QueueRunResult> {
  const now = input.now ?? new Date();
  const abortReason = computeBudgetAbortReason(input.budget);
  const selectedJobs = input.jobs
    .filter((job) => ["pending", "failed_retryable"].includes(job.status))
    .filter((job) => new Date(job.next_attempt_at).getTime() <= now.getTime())
    .slice(0, input.maxRows ?? input.jobs.length);

  const result: QueueRunResult = {
    status: abortReason ? "aborted_budget" : "success",
    abortedReason: abortReason,
    rowsAttempted: 0,
    rowsEnriched: 0,
    rowsNeedsReview: 0,
    rowsFailed: 0,
    tokensIn: 0,
    tokensOut: 0,
    costInCents: 0,
    costOutCents: 0,
    enrichmentRows: [],
    quarantinedPayloads: [],
    updatedJobs: [],
    errorSummary: { by_provider: {}, by_validator: {} },
  };

  if (abortReason) {
    result.updatedJobs = selectedJobs.map((job) => ({
      ...job,
      next_attempt_at: firstOfNextMonth(now),
      last_error: `aborted:${abortReason}`,
    }));
    return result;
  }

  for (const job of selectedJobs) {
    const funding = input.fundingById.get(job.funding_id);
    if (!funding || funding.source !== "scraped") continue;
    if (!validateTaskTypes(job.task_types)) {
      result.rowsFailed += 1;
      result.updatedJobs.push({
        ...job,
        status: "failed_permanent",
        last_error: "invalid task_types",
      });
      continue;
    }

    result.rowsAttempted += 1;
    const providerOrder = normalizeProviderPreference(job.provider_preference)
      .map((providerId) => input.providers[providerId])
      .filter((provider): provider is AiProvider => Boolean(provider));

    let finalRows: AiEnrichmentRowInput[] | null = null;
    let lastError = "no provider available";
    let retryAfterSeconds: number | null = null;

    for (const provider of providerOrder) {
      try {
        const call = await callAndValidate({
          provider,
          funding,
          taskTypes: job.task_types,
        });

        const missingTask = job.task_types.find(
          (taskType) =>
            !call.parsed.task_outputs.some((output) => output.task_type === taskType),
        );
        if (missingTask) {
          throw new Error(`missing task output: ${missingTask}`);
        }

        const lowConfidence = call.parsed.task_outputs.some((output) =>
          isNeedsReview(output.confidence),
        );
        if (lowConfidence && provider.id === "gemini" && providerOrder.some((p) => p.id === "openrouter")) {
          incrementError(result.errorSummary.by_provider, provider.id, "escalated_low_confidence");
          continue;
        }

        result.tokensIn += call.providerResult.usage.tokensIn;
        result.tokensOut += call.providerResult.usage.tokensOut;
        result.costInCents += call.providerResult.usage.costInCents;
        result.costOutCents += call.providerResult.usage.costOutCents;
        finalRows = call.parsed.task_outputs.map((output) =>
          taskOutputToRow({
            output,
            fundingId: job.funding_id,
            contentHash: job.content_hash,
            providerResult: call.providerResult,
            validatorFlagged: false,
          }),
        );
        break;
      } catch (error) {
        if (!(error instanceof AiProviderError)) {
          try {
            const repairCall = await callAndValidate({
              provider,
              funding,
              taskTypes: job.task_types,
              repairMode: true,
            });
            finalRows = repairCall.parsed.task_outputs.map((output) =>
              taskOutputToRow({
                output,
                fundingId: job.funding_id,
                contentHash: job.content_hash,
                providerResult: repairCall.providerResult,
                validatorFlagged: false,
              }),
            );
            break;
          } catch (repairError) {
            result.errorSummary.by_validator.zod =
              (result.errorSummary.by_validator.zod ?? 0) + 1;
            result.quarantinedPayloads.push({
              jobId: job.id,
              fundingId: job.funding_id,
              errorCategory: "validation_failed",
              redactedPayload: redactAiLogValue(repairError),
            });
          }
        } else {
          incrementError(result.errorSummary.by_provider, error.provider, error.category);
          lastError = error.message;
          retryAfterSeconds = error.retryAfterSeconds;
          if (!error.retryable) break;
        }
      }
    }

    if (finalRows) {
      result.enrichmentRows.push(...finalRows);
      result.rowsEnriched += finalRows.some((row) => !row.needs_review) ? 1 : 0;
      result.rowsNeedsReview += finalRows.some((row) => row.needs_review) ? 1 : 0;
      result.updatedJobs.push({
        ...job,
        status: finalRows.some((row) => row.needs_review) ? "needs_review" : "enriched",
        attempt_count: job.attempt_count + 1,
        last_error: null,
      });
    } else {
      const attemptCount = job.attempt_count + 1;
      const permanent = attemptCount >= 4;
      result.rowsFailed += 1;
      result.updatedJobs.push({
        ...job,
        status: permanent ? "failed_permanent" : "failed_retryable",
        attempt_count: attemptCount,
        next_attempt_at: permanent ? job.next_attempt_at : nextRetryAt(now, attemptCount, retryAfterSeconds),
        last_error: lastError,
      });
    }
  }

  if (result.rowsFailed > 0 || result.rowsNeedsReview > 0) {
    result.status = result.rowsEnriched > 0 ? "partial" : "failed";
  }

  return result;
}

export async function runEnrichmentQueue(input: {
  providers: Partial<Record<AiProviderId, AiProvider>>;
  budget: AiEnrichmentRunBudget;
  now?: Date;
  maxRows?: number;
}): Promise<QueueRunResult> {
  const now = input.now ?? new Date();
  const supabase = createFundingServiceClient();
  const { data: jobs, error: jobsError } = await supabase
    .from("ai_enrichment_jobs")
    .select("*")
    .in("status", ["pending", "failed_retryable"])
    .lte("next_attempt_at", now.toISOString())
    .order("next_attempt_at", { ascending: true })
    .limit(input.maxRows ?? 25);

  if (jobsError) throw jobsError;

  const typedJobs = (jobs ?? []) as AiEnrichmentJob[];
  const fundingIds = [...new Set(typedJobs.map((job) => job.funding_id))];
  const fundingById = new Map<string, FundingItem & { content_hash?: string }>();

  if (fundingIds.length > 0) {
    const { data: fundingRows, error: fundingError } = await supabase
      .from("funding")
      .select("*")
      .in("id", fundingIds)
      .eq("source", "scraped");

    if (fundingError) throw fundingError;
    for (const row of fundingRows ?? []) {
      const funding = row as FundingItem & { content_hash?: string };
      fundingById.set(funding.id, funding);
    }
  }

  const result = await runMockableEnrichmentQueue({
    jobs: typedJobs,
    fundingById,
    providers: input.providers,
    budget: input.budget,
    now,
    maxRows: input.maxRows,
  });

  if (result.enrichmentRows.length > 0) {
    const { error } = await supabase
      .from("funding_ai_enrichment")
      .upsert(result.enrichmentRows, {
        onConflict: "funding_id,task_type,content_hash,prompt_version,schema_version",
      });
    if (error) throw error;
  }

  if (result.quarantinedPayloads.length > 0) {
    const rows = result.quarantinedPayloads.map((payload) => ({
      funding_id: payload.fundingId,
      task_type: null,
      provider: "validator",
      model: "zod",
      content_hash: typedJobs.find((job) => job.id === payload.jobId)?.content_hash ?? "",
      prompt_version: COMBINED_PROMPT_VERSION,
      schema_version: SCHEMA_VERSIONS.summary,
      error_category: payload.errorCategory,
      redacted_payload: payload.redactedPayload,
    }));
    const { error } = await supabase.from("ai_enrichment_quarantine").insert(rows);
    if (error) throw error;
  }

  await Promise.all(
    result.updatedJobs.map((job) =>
      supabase
        .from("ai_enrichment_jobs")
        .update({
          status: job.status,
          attempt_count: job.attempt_count,
          next_attempt_at: job.next_attempt_at,
          last_error: job.last_error,
        })
        .eq("id", job.id),
    ),
  );

  const { error: runError } = await supabase.from("ai_enrichment_runs").insert({
    started_at: now.toISOString(),
    finished_at: new Date().toISOString(),
    provider: Object.keys(input.providers).join(",") || null,
    model: Object.values(input.providers)
      .filter((provider): provider is AiProvider => Boolean(provider))
      .map((provider) => provider.model)
      .join(",") || null,
    rows_attempted: result.rowsAttempted,
    rows_enriched: result.rowsEnriched,
    rows_needs_review: result.rowsNeedsReview,
    rows_failed: result.rowsFailed,
    tokens_in: result.tokensIn,
    tokens_out: result.tokensOut,
    cost_in_cents: result.costInCents,
    cost_out_cents: result.costOutCents,
    status: result.status,
    aborted_reason: result.abortedReason,
    error_summary: result.errorSummary,
  });

  if (runError) throw runError;
  return result;
}

function firstOfNextMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1)).toISOString();
}
