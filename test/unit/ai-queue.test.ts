import { describe, expect, it } from "vitest";
import type { FundingItem } from "@contracts/funding";
import { COMBINED_TASK_TYPES } from "@/lib/ai/enrichment-schema";
import { runMockableEnrichmentQueue, type AiEnrichmentJob } from "@/lib/ai/enrichment-queue";
import { createMockProvider } from "@/lib/ai/mock";
import { AiProviderError, type AiProvider } from "@/lib/ai/provider";

const now = new Date("2026-05-06T12:00:00.000Z");

const funding: FundingItem & { content_hash: string } = {
  id: "funding-1",
  type: "business_grant",
  name: "Growth Grant",
  description: "Public program text.",
  provider: "Gov",
  amount_min: null,
  amount_max: 10000,
  deadline: null,
  application_url: "https://example.test/apply",
  source_url: "https://example.test/source",
  eligibility: {},
  requirements: ["Apply online"],
  category: null,
  tags: ["Federal"],
  source: "scraped",
  scraped_from: "fixture",
  scraped_at: now.toISOString(),
  status: "active",
  created_at: now.toISOString(),
  updated_at: now.toISOString(),
  content_hash: "hash-1",
};

function job(partial: Partial<AiEnrichmentJob> = {}): AiEnrichmentJob {
  return {
    id: "job-1",
    funding_id: "funding-1",
    content_hash: "hash-1",
    task_types: [...COMBINED_TASK_TYPES],
    status: "pending",
    attempt_count: 0,
    provider_preference: "auto",
    next_attempt_at: now.toISOString(),
    last_error: null,
    ...partial,
  };
}

const budget = {
  monthlyTokenBudget: 2_000_000,
  monthlyCostBudgetCents: 500,
  monthToDateTokens: 0,
  monthToDateCostCents: 0,
};

describe("runMockableEnrichmentQueue", () => {
  it("writes one current enrichment row per task from the mock provider", async () => {
    const result = await runMockableEnrichmentQueue({
      jobs: [job()],
      fundingById: new Map([[funding.id, funding]]),
      providers: { gemini: createMockProvider("mock") },
      budget,
      now,
    });

    expect(result.status).toBe("success");
    expect(result.rowsAttempted).toBe(1);
    expect(result.rowsEnriched).toBe(1);
    expect(result.enrichmentRows.map((row) => row.task_type).sort()).toEqual(
      [...COMBINED_TASK_TYPES].sort(),
    );
    expect(result.updatedJobs[0].status).toBe("enriched");
  });

  it("aborts before claiming jobs when the combined token budget is exhausted", async () => {
    const result = await runMockableEnrichmentQueue({
      jobs: [job()],
      fundingById: new Map([[funding.id, funding]]),
      providers: { gemini: createMockProvider() },
      budget: { ...budget, monthToDateTokens: 2_000_000 },
      now,
    });

    expect(result.status).toBe("aborted_budget");
    expect(result.abortedReason).toBe("token_budget");
    expect(result.rowsAttempted).toBe(0);
    expect(result.updatedJobs[0].next_attempt_at).toBe("2026-06-01T00:00:00.000Z");
  });

  it("fails over from retryable Gemini errors to OpenRouter", async () => {
    const gemini: AiProvider = {
      id: "gemini",
      model: "gemini-test",
      async enrich() {
        throw new AiProviderError({
          provider: "gemini",
          message: "rate limited",
          category: "rate_limit",
          retryable: true,
        });
      },
    };

    const result = await runMockableEnrichmentQueue({
      jobs: [job({ provider_preference: "gemini-then-openrouter" })],
      fundingById: new Map([[funding.id, funding]]),
      providers: { gemini, openrouter: createMockProvider("openrouter-mock", "openrouter") },
      budget,
      now,
    });

    expect(result.status).toBe("success");
    expect(result.enrichmentRows[0].provider).toBe("openrouter");
    expect(result.errorSummary.by_provider.gemini.rate_limit).toBe(1);
  });

  it("uses provider retry-after when scheduling failed retryable jobs", async () => {
    const gemini: AiProvider = {
      id: "gemini",
      model: "gemini-test",
      async enrich() {
        throw new AiProviderError({
          provider: "gemini",
          message: "rate limited",
          category: "rate_limit",
          retryable: true,
          retryAfterSeconds: 120,
        });
      },
    };

    const result = await runMockableEnrichmentQueue({
      jobs: [job({ provider_preference: "gemini-only" })],
      fundingById: new Map([[funding.id, funding]]),
      providers: { gemini },
      budget,
      now,
    });

    expect(result.status).toBe("failed");
    expect(result.updatedJobs[0].status).toBe("failed_retryable");
    expect(result.updatedJobs[0].next_attempt_at).toBe("2026-05-06T12:02:00.000Z");
  });

  it("escalates valid but low-confidence Gemini output to OpenRouter", async () => {
    const lowConfidenceGemini: AiProvider = {
      id: "gemini",
      model: "gemini-test",
      async enrich() {
        return {
          provider: "gemini",
          model: "gemini-test",
          output: {
            task_outputs: [
              { task_type: "summary", summary: "Weak", confidence: 0.2 },
            ],
          },
          usage: { tokensIn: 1, tokensOut: 1, costInCents: 0, costOutCents: 0 },
        };
      },
    };

    const result = await runMockableEnrichmentQueue({
      jobs: [job({ task_types: ["summary"], provider_preference: "gemini-then-openrouter" })],
      fundingById: new Map([[funding.id, funding]]),
      providers: {
        gemini: lowConfidenceGemini,
        openrouter: createMockProvider("openrouter-mock", "openrouter"),
      },
      budget,
      now,
    });

    expect(result.status).toBe("success");
    expect(result.enrichmentRows[0].model).toBe("openrouter-mock");
    expect(result.tokensIn).toBe(201);
    expect(result.tokensOut).toBe(121);
    expect(result.errorSummary.by_provider.gemini.escalated_low_confidence).toBe(1);
  });

  it("counts repair-call usage when validation repair succeeds", async () => {
    let calls = 0;
    const repairingProvider: AiProvider = {
      id: "gemini",
      model: "gemini-test",
      async enrich() {
        calls += 1;
        if (calls === 1) {
          return {
            provider: "gemini",
            model: "gemini-test",
            output: { task_outputs: [{ task_type: "summary", confidence: 0.9 }] },
            usage: { tokensIn: 5, tokensOut: 6, costInCents: 1, costOutCents: 2 },
          };
        }

        return {
          provider: "gemini",
          model: "gemini-test",
          output: {
            task_outputs: [
              {
                task_type: "summary",
                summary: "Repaired",
                eligibility_bullets: ["Eligible applicants should review criteria."],
                best_fit_applicant: "Applicants aligned with the program.",
                confidence: 0.9,
              },
            ],
          },
          usage: { tokensIn: 7, tokensOut: 8, costInCents: 3, costOutCents: 4 },
        };
      },
    };

    const result = await runMockableEnrichmentQueue({
      jobs: [job({ task_types: ["summary"], provider_preference: "gemini-only" })],
      fundingById: new Map([[funding.id, funding]]),
      providers: { gemini: repairingProvider },
      budget,
      now,
    });

    expect(result.status).toBe("success");
    expect(result.enrichmentRows).toHaveLength(1);
    expect(result.tokensIn).toBe(7);
    expect(result.tokensOut).toBe(8);
    expect(result.costInCents).toBe(3);
    expect(result.costOutCents).toBe(4);
  });

  it("does not mark a repaired job complete when requested tasks are still missing", async () => {
    const incompleteProvider: AiProvider = {
      id: "gemini",
      model: "gemini-test",
      async enrich() {
        return {
          provider: "gemini",
          model: "gemini-test",
          output: {
            task_outputs: [
              {
                task_type: "summary",
                summary: "Only summary",
                eligibility_bullets: ["Review criteria."],
                best_fit_applicant: "Applicants.",
                confidence: 0.9,
              },
            ],
          },
          usage: { tokensIn: 3, tokensOut: 4, costInCents: 0, costOutCents: 0 },
        };
      },
    };

    const result = await runMockableEnrichmentQueue({
      jobs: [job({ task_types: ["summary", "tags"], provider_preference: "gemini-only" })],
      fundingById: new Map([[funding.id, funding]]),
      providers: { gemini: incompleteProvider },
      budget,
      now,
    });

    expect(result.status).toBe("failed");
    expect(result.enrichmentRows).toHaveLength(0);
    expect(result.updatedJobs[0].status).toBe("failed_retryable");
    expect(result.updatedJobs[0].last_error).toBe("missing task output: tags");
  });
});
