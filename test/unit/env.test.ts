import { describe, expect, it } from "vitest";
import { getPublicEnv, getServerEnv } from "@/lib/env";

const validEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
};

describe("env guard", () => {
  it("returns typed public env values", () => {
    expect(getPublicEnv(validEnv)).toEqual({
      NEXT_PUBLIC_SUPABASE_URL: validEnv.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: validEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  });

  it("returns typed server env values", () => {
    expect(getServerEnv(validEnv)).toEqual(validEnv);
  });

  it("throws a clear missing-var error", () => {
    expect(() => getServerEnv({})).toThrow(
      "Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL",
    );
  });
});
