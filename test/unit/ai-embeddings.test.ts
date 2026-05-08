import { describe, expect, it } from "vitest";
import {
  GEMINI_EMBEDDING_DIMENSIONS_DEFAULT,
  createMockEmbeddingProvider,
  parseEmbeddingDimensions,
} from "@/lib/ai/embeddings";
import { toVectorLiteral } from "@/lib/funding/semantic-search";

describe("AI embeddings", () => {
  it("keeps Gemini embedding dimensions fixed for pgvector storage", async () => {
    const provider = createMockEmbeddingProvider();
    const result = await provider.embed("startup export grant support");

    expect(result.dimensions).toBe(GEMINI_EMBEDDING_DIMENSIONS_DEFAULT);
    expect(result.embedding).toHaveLength(GEMINI_EMBEDDING_DIMENSIONS_DEFAULT);
    expect(toVectorLiteral(result.embedding)).toMatch(/^\[/);
  });

  it("falls back to 768 dimensions unless the env value is the locked size", () => {
    expect(parseEmbeddingDimensions("768")).toBe(768);
    expect(parseEmbeddingDimensions("1024")).toBe(768);
    expect(parseEmbeddingDimensions(undefined)).toBe(768);
  });
});
