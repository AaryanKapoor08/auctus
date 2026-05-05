import { describe, expect, it } from "vitest";
import { mapSession } from "@/lib/session/get-session";
import { getPostAuthRoute } from "@/lib/session/post-auth-route";

describe("mapSession", () => {
  it("returns null without an auth user", () => {
    expect(mapSession(null, null)).toBeNull();
  });

  it("keeps role null before onboarding", () => {
    expect(mapSession({ id: "user-1" }, null)).toEqual({
      user_id: "user-1",
      role: null,
    });
  });

  it("maps an onboarded role", () => {
    expect(mapSession({ id: "user-1" }, { role: "student" })).toEqual({
      user_id: "user-1",
      role: "student",
    });
  });
});

describe("getPostAuthRoute", () => {
  it("sends onboarded users to the dashboard", () => {
    expect(getPostAuthRoute("business")).toBe("/dashboard");
  });

  it("sends missing or null roles to onboarding", () => {
    expect(getPostAuthRoute(null)).toBe("/onboarding");
    expect(getPostAuthRoute(undefined)).toBe("/onboarding");
  });
});
