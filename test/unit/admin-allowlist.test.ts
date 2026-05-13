import { describe, expect, it } from "vitest";
import {
  isAdminEmailAllowed,
  parseAdminAllowlist,
} from "@/lib/auth/admin-allowlist";

describe("admin allowlist", () => {
  it("normalizes comma-separated admin emails", () => {
    expect(parseAdminAllowlist(" AaryanKapoor008@gmail.com , admin@example.com ")).toEqual([
      "aaryankapoor008@gmail.com",
      "admin@example.com",
    ]);
  });

  it("rejects missing and non-allowlisted emails", () => {
    expect(isAdminEmailAllowed(null, "aaryankapoor008@gmail.com")).toBe(false);
    expect(isAdminEmailAllowed("other@example.com", "aaryankapoor008@gmail.com")).toBe(false);
    expect(isAdminEmailAllowed("AARYANKAPOOR008@gmail.com", "aaryankapoor008@gmail.com")).toBe(true);
  });
});
