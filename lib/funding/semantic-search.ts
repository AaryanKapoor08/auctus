import "server-only";

import type { FundingItem } from "@contracts/funding";
import type { Role } from "@contracts/role";
import {
  GEMINI_EMBEDDING_DIMENSIONS_DEFAULT,
  GEMINI_EMBEDDING_MODEL_DEFAULT,
  createGeminiEmbeddingProvider,
  parseEmbeddingDimensions,
  type EmbeddingProvider,
} from "@/lib/ai/embeddings";
import { AI_INPUT_TEXT_LIMIT_CHARS } from "@/lib/ai/enrichment-schema";
import { createFundingServiceClient } from "./supabase";
import { getFundingTypeForRole } from "./role-mapping";

export const SEMANTIC_SEARCH_COVERAGE_THRESHOLD = 0.8;
export const SEMANTIC_SEARCH_MIN_QUERY_LENGTH = 3;

export interface SemanticSearchRanking {
  enabled: boolean;
  coverage: number;
  rankedIds: string[];
  reason:
    | "ranked"
    | "short_query"
    | "config_missing"
    | "coverage_below_threshold"
    | "provider_error"
    | "database_error";
}

type FundingEmbeddingRow = Pick<
  FundingItem,
  | "id"
  | "name"
  | "provider"
  | "description"
  | "eligibility"
  | "requirements"
  | "category"
  | "tags"
> & {
  content_hash?: string;
};

export function buildFundingEmbeddingText(
  item: FundingEmbeddingRow,
  maxChars = AI_INPUT_TEXT_LIMIT_CHARS,
) {
  return [
    item.name,
    item.provider,
    item.category ?? "",
    item.tags.join(", "),
    item.description ?? "",
    JSON.stringify(item.eligibility ?? {}),
    item.requirements.join("\n"),
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, maxChars);
}

export function toVectorLiteral(embedding: number[]) {
  if (embedding.length !== GEMINI_EMBEDDING_DIMENSIONS_DEFAULT) {
    throw new Error(`Expected ${GEMINI_EMBEDDING_DIMENSIONS_DEFAULT} embedding dimensions.`);
  }
  if (!embedding.every((value) => Number.isFinite(value))) {
    throw new Error("Embedding includes a non-finite value.");
  }
  return `[${embedding.join(",")}]`;
}

export function rankFundingItemsBySemanticIds<T extends { id: string }>(
  items: T[],
  rankedIds: string[],
) {
  if (rankedIds.length === 0) return items;
  const order = new Map(rankedIds.map((id, index) => [id, index]));
  return items.slice().sort((a, b) => {
    const ai = order.get(a.id) ?? Number.POSITIVE_INFINITY;
    const bi = order.get(b.id) ?? Number.POSITIVE_INFINITY;
    if (ai !== bi) return ai - bi;
    return 0;
  });
}

async function getCoverage(input: {
  role: Role;
  model: string;
  dimensions: number;
}) {
  const supabase = createFundingServiceClient();
  const type = getFundingTypeForRole(input.role);
  const { data: fundingRows, error: fundingError } = await supabase
    .from("funding")
    .select("id,content_hash")
    .eq("type", type)
    .eq("status", "active")
    .limit(2000);

  if (fundingError) throw fundingError;
  const rows = (fundingRows ?? []) as Array<{ id: string; content_hash: string }>;
  if (rows.length === 0) return { activeCount: 0, currentCount: 0, coverage: 1 };

  const { data: embeddingRows, error: embeddingError } = await supabase
    .from("funding_embeddings")
    .select("funding_id,content_hash")
    .eq("model", input.model)
    .eq("dimensions", input.dimensions)
    .in("funding_id", rows.map((row) => row.id));

  if (embeddingError) throw embeddingError;
  const currentById = new Map(rows.map((row) => [row.id, row.content_hash]));
  const currentCount = (embeddingRows ?? []).filter(
    (row) => currentById.get(row.funding_id) === row.content_hash,
  ).length;

  return {
    activeCount: rows.length,
    currentCount,
    coverage: currentCount / rows.length,
  };
}

export async function getSemanticSearchRankingForRole(input: {
  role: Role;
  query: string | undefined;
  limit?: number;
  provider?: EmbeddingProvider;
}): Promise<SemanticSearchRanking> {
  const query = input.query?.trim() ?? "";
  if (query.length < SEMANTIC_SEARCH_MIN_QUERY_LENGTH) {
    return { enabled: false, coverage: 0, rankedIds: [], reason: "short_query" };
  }

  const model = input.provider?.model ?? process.env.AI_GEMINI_EMBEDDING_MODEL ?? GEMINI_EMBEDDING_MODEL_DEFAULT;
  const dimensions = input.provider?.dimensions ?? parseEmbeddingDimensions(process.env.AI_EMBEDDING_DIMENSIONS);

  try {
    const coverage = await getCoverage({ role: input.role, model, dimensions });
    if (coverage.coverage < SEMANTIC_SEARCH_COVERAGE_THRESHOLD) {
      return {
        enabled: false,
        coverage: coverage.coverage,
        rankedIds: [],
        reason: "coverage_below_threshold",
      };
    }
  } catch {
    return { enabled: false, coverage: 0, rankedIds: [], reason: "database_error" };
  }

  const provider = input.provider ?? (() => {
    const apiKey = process.env.AI_GEMINI_API_KEY;
    if (!apiKey) return null;
    return createGeminiEmbeddingProvider({ apiKey, model, dimensions });
  })();

  if (!provider) {
    return { enabled: false, coverage: 0, rankedIds: [], reason: "config_missing" };
  }

  try {
    const embedded = await provider.embed(query);
    const supabase = createFundingServiceClient();
    const { data, error } = await supabase.rpc("match_funding_embeddings", {
      query_embedding: toVectorLiteral(embedded.embedding),
      match_type: getFundingTypeForRole(input.role),
      match_count: input.limit ?? 50,
      match_model: provider.model,
    });

    if (error) {
      return { enabled: false, coverage: 0, rankedIds: [], reason: "database_error" };
    }

    return {
      enabled: true,
      coverage: 1,
      rankedIds: ((data ?? []) as Array<{ funding_id: string }>).map((row) => row.funding_id),
      reason: "ranked",
    };
  } catch {
    return { enabled: false, coverage: 0, rankedIds: [], reason: "provider_error" };
  }
}

export async function upsertMissingFundingEmbeddings(input: {
  maxRows: number;
  provider: EmbeddingProvider;
}) {
  const supabase = createFundingServiceClient();
  const { data: fundingRows, error: fundingError } = await supabase
    .from("funding")
    .select("id,name,provider,description,eligibility,requirements,category,tags,content_hash")
    .eq("source", "scraped")
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(Math.max(input.maxRows * 3, input.maxRows));

  if (fundingError) throw fundingError;

  const rows = ((fundingRows ?? []) as FundingEmbeddingRow[]).filter(
    (row) => row.content_hash,
  );
  if (rows.length === 0) return { attempted: 0, embedded: 0, tokensIn: 0 };

  const { data: existingRows, error: existingError } = await supabase
    .from("funding_embeddings")
    .select("funding_id,content_hash,model,dimensions")
    .in("funding_id", rows.map((row) => row.id))
    .eq("model", input.provider.model)
    .eq("dimensions", input.provider.dimensions);

  if (existingError) throw existingError;

  const existing = new Map(
    (existingRows ?? []).map((row) => [
      `${row.funding_id}:${row.model}:${row.dimensions}`,
      row.content_hash,
    ]),
  );
  const candidates = rows
    .filter(
      (row) =>
        existing.get(`${row.id}:${input.provider.model}:${input.provider.dimensions}`) !==
        row.content_hash,
    )
    .slice(0, input.maxRows);

  const output = [];
  let tokensIn = 0;
  for (const row of candidates) {
    const result = await input.provider.embed(buildFundingEmbeddingText(row));
    tokensIn += result.tokensIn;
    output.push({
      funding_id: row.id,
      content_hash: row.content_hash,
      embedding: toVectorLiteral(result.embedding),
      model: result.model,
      dimensions: result.dimensions,
      generated_at: new Date().toISOString(),
    });
  }

  if (output.length > 0) {
    const { error } = await supabase.from("funding_embeddings").upsert(output, {
      onConflict: "funding_id",
    });
    if (error) throw error;
  }

  return { attempted: candidates.length, embedded: output.length, tokensIn };
}
