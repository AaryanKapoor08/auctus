import "server-only";

import { z } from "zod";

export const TASK_TYPES = [
  "summary",
  "tags",
  "checklist",
  "match_reasons",
  "data_quality",
  "radar",
] as const;

export type AiTaskType = (typeof TASK_TYPES)[number];

export const COMBINED_TASK_TYPES = [
  "summary",
  "tags",
  "checklist",
  "match_reasons",
  "data_quality",
] as const satisfies readonly AiTaskType[];

export const PROVIDER_PREFERENCES = [
  "auto",
  "gemini-only",
  "openrouter-only",
  "gemini-then-openrouter",
] as const;

export type AiProviderPreference = (typeof PROVIDER_PREFERENCES)[number];

export const ENRICHMENT_STATUSES = [
  "pending",
  "processing",
  "enriched",
  "needs_review",
  "failed_retryable",
  "failed_permanent",
] as const;

export const RUN_STATUSES = [
  "running",
  "success",
  "partial",
  "aborted_budget",
  "failed",
] as const;

export const COMBINED_PROMPT_VERSION = 2;

export const SCHEMA_VERSIONS: Record<AiTaskType, number> = {
  summary: 1,
  tags: 1,
  checklist: 1,
  match_reasons: 1,
  data_quality: 1,
  radar: 1,
};

export const CONFIDENCE_NEEDS_REVIEW_THRESHOLD = 0.6;
export const AI_INPUT_TEXT_LIMIT_CHARS = 6000;
export const AI_MONTHLY_TOKEN_BUDGET_DEFAULT = 2_000_000;
export const AI_MONTHLY_TOKEN_WARN_RATIO_DEFAULT = 0.8;
export const AI_MONTHLY_COST_BUDGET_CENTS_DEFAULT = 500;

const confidenceSchema = z.number().min(0).max(1);
const shortString = z.string().trim().min(1).max(1200);
const bulletString = z.string().trim().min(1).max(300);

export const summaryOutputSchema = z.object({
  task_type: z.literal("summary"),
  summary: shortString.max(700),
  eligibility_bullets: z.array(bulletString).max(8).default([]),
  best_fit_applicant: shortString.max(400).nullable().default(null),
  confidence: confidenceSchema,
});

export const tagsOutputSchema = z.object({
  task_type: z.literal("tags"),
  normalized_tags: z.array(bulletString).max(16),
  confidence: confidenceSchema,
});

export const checklistOutputSchema = z.object({
  task_type: z.literal("checklist"),
  application_checklist: z.array(bulletString).min(3).max(12),
  deadline_urgency: z.enum(["rolling", "soon", "dated", "unknown"]).default("unknown"),
  confidence: confidenceSchema,
});

export const matchReasonsOutputSchema = z.object({
  task_type: z.literal("match_reasons"),
  match_reason_templates: z
    .record(z.string(), z.union([z.string(), z.record(z.string(), z.string())]))
    .default({}),
  confidence: confidenceSchema,
});

export const dataQualityOutputSchema = z.object({
  task_type: z.literal("data_quality"),
  flags: z
    .array(
      z.object({
        code: z.string().trim().min(1).max(80),
        severity: z.enum(["info", "warning", "review"]),
        message: z.string().trim().min(1).max(500),
      }),
    )
    .max(20)
    .default([]),
  confidence: confidenceSchema,
});

export const radarOutputSchema = z.object({
  task_type: z.literal("radar"),
  insights: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(120),
        detail: z.string().trim().min(1).max(500),
      }),
    )
    .max(12),
  confidence: confidenceSchema,
});

export const taskOutputSchema = z.discriminatedUnion("task_type", [
  summaryOutputSchema,
  tagsOutputSchema,
  checklistOutputSchema,
  matchReasonsOutputSchema,
  dataQualityOutputSchema,
  radarOutputSchema,
]);

export type AiTaskOutput = z.infer<typeof taskOutputSchema>;

export const combinedEnrichmentResponseSchema = z.object({
  task_outputs: z.array(taskOutputSchema).min(1),
});

export type CombinedEnrichmentResponse = z.infer<
  typeof combinedEnrichmentResponseSchema
>;

export function schemaVersionFor(taskType: AiTaskType) {
  return SCHEMA_VERSIONS[taskType];
}

export function isNeedsReview(confidence: number, validatorFlagged = false) {
  return confidence < CONFIDENCE_NEEDS_REVIEW_THRESHOLD || validatorFlagged;
}

export function validateTaskTypes(values: readonly string[]): values is AiTaskType[] {
  const allowed = new Set<string>(TASK_TYPES);
  return values.length > 0 && values.every((value) => allowed.has(value));
}
