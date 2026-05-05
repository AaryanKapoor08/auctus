import { describe, expect, it } from "vitest";
import {
  buildIlikeOrFilter,
  sanitizePostgrestSearch,
} from "@/lib/supabase/postgrest-filters";

describe("PostgREST filter helpers", () => {
  it("strips PostgREST DSL syntax from user search text", () => {
    expect(sanitizePostgrestSearch("%,status.eq.expired")).toBe(
      "status eq expired",
    );
  });

  it("returns null when the search contains no searchable text", () => {
    expect(buildIlikeOrFilter(["name"], "*,(),:")).toBeNull();
  });

  it("builds an ilike OR filter from trusted column names", () => {
    expect(buildIlikeOrFilter(["name", "provider"], " clean energy ")).toBe(
      "name.ilike.%clean energy%,provider.ilike.%clean energy%",
    );
  });
});
