import { describe, expect, it } from "vitest";
import {
  COMBINED_PROMPT_VERSION,
  PROVIDER_PREFERENCES,
  SCHEMA_VERSIONS,
  TASK_TYPES,
  combinedEnrichmentResponseSchema,
  isNeedsReview,
} from "@/lib/ai/enrichment-schema";

describe("AI enrichment schema", () => {
  it("keeps fixed runtime constants explicit", () => {
    expect(COMBINED_PROMPT_VERSION).toBe(1);
    expect(TASK_TYPES).toEqual([
      "summary",
      "tags",
      "checklist",
      "match_reasons",
      "data_quality",
      "radar",
    ]);
    expect(PROVIDER_PREFERENCES).toEqual([
      "auto",
      "gemini-only",
      "openrouter-only",
      "gemini-then-openrouter",
    ]);
    expect(Object.keys(SCHEMA_VERSIONS).sort()).toEqual([...TASK_TYPES].sort());
  });

  it("validates all task output shapes", () => {
    const parsed = combinedEnrichmentResponseSchema.parse({
      task_outputs: [
        {
          task_type: "summary",
          summary: "Short public summary.",
          eligibility_bullets: ["Eligible applicants should verify details."],
          best_fit_applicant: "A qualified applicant.",
          confidence: 0.9,
        },
        {
          task_type: "tags",
          normalized_tags: ["STEM", "Federal"],
          confidence: 0.8,
        },
        {
          task_type: "checklist",
          application_checklist: ["Review eligibility."],
          deadline_urgency: "dated",
          confidence: 0.75,
        },
        {
          task_type: "match_reasons",
          match_reason_templates: { business: "Matched for {role} funding." },
          confidence: 0.7,
        },
        {
          task_type: "data_quality",
          flags: [{ code: "truncated", severity: "info", message: "Input was capped." }],
          confidence: 0.95,
        },
        {
          task_type: "radar",
          insights: [{ label: "Closing soon", detail: "Review this month." }],
          confidence: 0.65,
        },
      ],
    });

    expect(parsed.task_outputs).toHaveLength(6);
  });

  it("rejects malformed confidence and unknown task types", () => {
    expect(() =>
      combinedEnrichmentResponseSchema.parse({
        task_outputs: [{ task_type: "summary", summary: "x", confidence: 2 }],
      }),
    ).toThrow();

    expect(() =>
      combinedEnrichmentResponseSchema.parse({
        task_outputs: [{ task_type: "embedding", confidence: 0.9 }],
      }),
    ).toThrow();
  });

  it("marks low confidence or validator-flagged rows for review", () => {
    expect(isNeedsReview(0.59)).toBe(true);
    expect(isNeedsReview(0.9, true)).toBe(true);
    expect(isNeedsReview(0.6)).toBe(false);
  });
});
