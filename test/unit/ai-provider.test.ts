import { describe, expect, it } from "vitest";
import { AiProviderError, parseProviderJsonContent } from "@/lib/ai/provider";

describe("parseProviderJsonContent", () => {
  it("accepts strict JSON", () => {
    expect(parseProviderJsonContent("gemini", "{\"ok\":true}")).toEqual({ ok: true });
  });

  it("accepts fenced JSON", () => {
    expect(parseProviderJsonContent("gemini", "```json\n{\"ok\":true}\n```")).toEqual({
      ok: true,
    });
  });

  it("extracts a JSON object from surrounding text", () => {
    expect(parseProviderJsonContent("gemini", "Here is the JSON:\n{\"ok\":true}\nDone.")).toEqual({
      ok: true,
    });
  });

  it("throws a categorized provider error for invalid JSON", () => {
    expect(() => parseProviderJsonContent("gemini", "not json")).toThrow(AiProviderError);
    try {
      parseProviderJsonContent("gemini", "not json");
    } catch (error) {
      expect(error).toBeInstanceOf(AiProviderError);
      expect((error as AiProviderError).category).toBe("json_parse_error");
    }
  });
});
