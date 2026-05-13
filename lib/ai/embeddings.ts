import "server-only";

import type { AiProviderId } from "./provider";
import { AiProviderError, parseRetryAfter } from "./provider";

export const GEMINI_EMBEDDING_MODEL_DEFAULT = "gemini-embedding-001";
export const GEMINI_EMBEDDING_DIMENSIONS_DEFAULT = 768;

export interface EmbeddingProviderResult {
  provider: AiProviderId;
  model: string;
  dimensions: number;
  embedding: number[];
  tokensIn: number;
}

export interface EmbeddingProvider {
  id: AiProviderId;
  model: string;
  dimensions: number;
  embed(text: string): Promise<EmbeddingProviderResult>;
}

export function parseEmbeddingDimensions(value: string | undefined): number {
  const parsed = Number(value);
  return parsed === GEMINI_EMBEDDING_DIMENSIONS_DEFAULT
    ? parsed
    : GEMINI_EMBEDDING_DIMENSIONS_DEFAULT;
}

export function createGeminiEmbeddingProvider(input: {
  apiKey: string;
  model?: string;
  dimensions?: number;
  timeoutMs?: number;
}): EmbeddingProvider {
  const model = input.model || GEMINI_EMBEDDING_MODEL_DEFAULT;
  const dimensions = input.dimensions ?? GEMINI_EMBEDDING_DIMENSIONS_DEFAULT;

  return {
    id: "gemini",
    model,
    dimensions,
    async embed(text: string): Promise<EmbeddingProviderResult> {
      const controller = new AbortController();
      const timeoutMs = input.timeoutMs ?? 60_000;
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent`,
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-goog-api-key": input.apiKey,
            },
            signal: controller.signal,
            body: JSON.stringify({
              content: { parts: [{ text }] },
              task_type: "SEMANTIC_SIMILARITY",
              output_dimensionality: dimensions,
            }),
          },
        );

        if (!response.ok) {
          throw new AiProviderError({
            provider: "gemini",
            message: `Gemini embedding request failed with ${response.status}`,
            category: response.status === 429 ? "rate_limit" : `http_${response.status}`,
            retryable: response.status === 429 || response.status >= 500,
            retryAfterSeconds: parseRetryAfter(response.headers.get("retry-after")),
          });
        }

        const json = await response.json();
        const values = json?.embedding?.values ?? json?.embeddings?.[0]?.values;
        if (!Array.isArray(values) || values.length !== dimensions) {
          throw new AiProviderError({
            provider: "gemini",
            message: "Gemini embedding response had an unexpected shape",
            category: "malformed_response",
            retryable: true,
          });
        }

        return {
          provider: "gemini",
          model,
          dimensions,
          embedding: values.map(Number),
          tokensIn: Number(json?.usageMetadata?.promptTokenCount ?? 0),
        };
      } catch (error) {
        if (error instanceof AiProviderError) throw error;
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new AiProviderError({
            provider: "gemini",
            message: `Gemini embedding request timed out after ${timeoutMs}ms`,
            category: "timeout",
            retryable: true,
          });
        }
        throw new AiProviderError({
          provider: "gemini",
          message: error instanceof Error ? error.message : "Gemini embedding request failed",
          category: "network_error",
          retryable: true,
        });
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

export function createMockEmbeddingProvider(input: {
  dimensions?: number;
  model?: string;
} = {}): EmbeddingProvider {
  const dimensions = input.dimensions ?? GEMINI_EMBEDDING_DIMENSIONS_DEFAULT;
  return {
    id: "mock",
    model: input.model ?? "mock-embedding",
    dimensions,
    async embed(text: string) {
      return {
        provider: "mock",
        model: input.model ?? "mock-embedding",
        dimensions,
        embedding: createDeterministicEmbedding(text, dimensions),
        tokensIn: text.split(/\s+/).filter(Boolean).length,
      };
    },
  };
}

export function createDeterministicEmbedding(text: string, dimensions: number): number[] {
  const vector = Array.from({ length: dimensions }, () => 0);
  for (const token of text.toLowerCase().match(/[a-z0-9]+/g) ?? []) {
    let hash = 2166136261;
    for (let i = 0; i < token.length; i += 1) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    vector[Math.abs(hash) % dimensions] += 1;
  }
  return normalizeVector(vector);
}

function normalizeVector(vector: number[]) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (magnitude === 0) return vector;
  return vector.map((value) => value / magnitude);
}
