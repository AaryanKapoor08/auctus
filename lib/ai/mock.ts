import "server-only";

import type { AiProvider, AiProviderId, EnrichmentProviderInput, ProviderResult } from "./provider";

export function createMockProvider(
  model = "mock-enrichment-v1",
  id: AiProviderId = "mock",
): AiProvider {
  return {
    id,
    model,
    async enrich(input: EnrichmentProviderInput): Promise<ProviderResult> {
      const name = input.funding.name;
      const provider = input.funding.provider;
      const outputs = input.taskTypes.map((taskType) => {
        if (taskType === "summary") {
          return {
            task_type: "summary",
            summary: `${name} is a public funding opportunity from ${provider}.`,
            eligibility_bullets: ["Review published eligibility before applying."],
            best_fit_applicant: "Applicants aligned with the listed funding track.",
            confidence: 0.82,
          };
        }

        if (taskType === "tags") {
          return {
            task_type: "tags",
            normalized_tags: input.funding.tags.slice(0, 8),
            confidence: 0.78,
          };
        }

        if (taskType === "checklist") {
          return {
            task_type: "checklist",
            application_checklist: [
              "Confirm eligibility against the provider page.",
              "Gather organization or applicant details.",
              "Review required documents before opening the application.",
            ],
            deadline_urgency: input.funding.deadline ? "dated" : "rolling",
            confidence: 0.8,
          };
        }

        if (taskType === "match_reasons") {
          return {
            task_type: "match_reasons",
            match_reason_templates: {
              business: "Matched because this opportunity aligns with business funding signals.",
              student: "Matched because this opportunity aligns with student funding signals.",
              professor: "Matched because this opportunity aligns with research funding signals.",
            },
            confidence: 0.74,
          };
        }

        if (taskType === "data_quality") {
          return {
            task_type: "data_quality",
            flags: [],
            confidence: 0.9,
          };
        }

        return {
          task_type: "radar",
          insights: [
            {
              label: "Candidate opportunity",
              detail: `${name} may be useful in a future funding radar cycle.`,
            },
          ],
          confidence: 0.7,
        };
      });

      return {
        provider: id,
        model,
        output: { task_outputs: outputs },
        usage: {
          tokensIn: 200,
          tokensOut: 120,
          costInCents: 0,
          costOutCents: 0,
        },
      };
    },
  };
}
