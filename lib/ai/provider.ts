import "server-only";

import type { FundingItem } from "@contracts/funding";
import type { AiProviderPreference, AiTaskType, CombinedEnrichmentResponse } from "./enrichment-schema";

export type AiProviderId = "gemini" | "openrouter" | "mock";

export interface EnrichmentProviderInput {
  funding: FundingItem & { content_hash?: string };
  taskTypes: AiTaskType[];
  promptVersion: number;
  schemaVersions: Record<AiTaskType, number>;
  maxInputChars: number;
  repairMode?: boolean;
}

export interface ProviderUsage {
  tokensIn: number;
  tokensOut: number;
  costInCents: number;
  costOutCents: number;
}

export interface ProviderResult {
  provider: AiProviderId;
  model: string;
  output: unknown;
  usage: ProviderUsage;
}

export interface AiProvider {
  id: AiProviderId;
  model: string;
  enrich(input: EnrichmentProviderInput): Promise<ProviderResult>;
}

export class AiProviderError extends Error {
  readonly provider: AiProviderId;
  readonly retryAfterSeconds: number | null;
  readonly retryable: boolean;
  readonly category: string;

  constructor(input: {
    provider: AiProviderId;
    message: string;
    category: string;
    retryable: boolean;
    retryAfterSeconds?: number | null;
  }) {
    super(input.message);
    this.name = "AiProviderError";
    this.provider = input.provider;
    this.category = input.category;
    this.retryable = input.retryable;
    this.retryAfterSeconds = input.retryAfterSeconds ?? null;
  }
}

export function parseRetryAfter(value: string | null): number | null {
  if (!value) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 1000));
}

export function normalizeProviderPreference(
  preference: AiProviderPreference,
): AiProviderId[] {
  if (preference === "gemini-only") return ["gemini"];
  if (preference === "openrouter-only") return ["openrouter"];
  if (preference === "gemini-then-openrouter") return ["gemini", "openrouter"];
  return ["gemini", "openrouter"];
}

export function assertCombinedResponse(
  value: CombinedEnrichmentResponse,
): CombinedEnrichmentResponse {
  return value;
}
