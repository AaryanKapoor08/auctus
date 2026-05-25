import { describe, expect, it } from "vitest";
import { getNavLinksForSession } from "@/lib/session/navigation";
import type { Session } from "@contracts/session";

function namesFor(session: Session | null) {
  return getNavLinksForSession(session).map((link) => link.name);
}

describe("getNavLinksForSession", () => {
  it("shows all public discovery links to guests", () => {
    expect(namesFor(null)).toEqual([
      "Grants",
      "Scholarships",
      "Research",
      "Forum",
    ]);
  });

  it("shows only student funding navigation for onboarded students", () => {
    expect(namesFor({ user_id: "user-1", role: "student" })).toEqual([
      "Dashboard",
      "Scholarships",
      "Forum",
    ]);
  });

  it("shows only business funding navigation for onboarded businesses", () => {
    expect(namesFor({ user_id: "user-1", role: "business" })).toEqual([
      "Dashboard",
      "Grants",
      "Forum",
    ]);
  });

  it("shows only research funding navigation for onboarded professors", () => {
    expect(namesFor({ user_id: "user-1", role: "professor" })).toEqual([
      "Dashboard",
      "Research",
      "Forum",
    ]);
  });

  it("keeps onboarding explicit for signed-in users without a role", () => {
    expect(namesFor({ user_id: "user-1", role: null })).toEqual([
      "Grants",
      "Scholarships",
      "Research",
      "Forum",
      "Onboarding",
    ]);
  });
});
