import { describe, expect, it } from "vitest";
import {
  ROLE_FUNDING_ROUTE,
  ROLE_FUNDING_TYPE,
  getFundingTypeForRole,
} from "@/lib/funding/role-mapping";
import { fundingPolicies } from "@/lib/funding/route-policies";

describe("funding role mapping", () => {
  it("maps roles to funding types", () => {
    expect(ROLE_FUNDING_TYPE).toEqual({
      business: "business_grant",
      student: "scholarship",
      professor: "research_grant",
    });
    expect(getFundingTypeForRole("student")).toBe("scholarship");
  });

  it("maps roles to funding routes", () => {
    expect(ROLE_FUNDING_ROUTE).toEqual({
      business: "/grants",
      student: "/scholarships",
      professor: "/research-funding",
    });
  });

  it("registers public funding browsing policies with signed-in role scoping", () => {
    expect(fundingPolicies).toEqual([
      { path: "/grants", allowed_roles: ["business"], require_auth: false },
      { path: "/scholarships", allowed_roles: ["student"], require_auth: false },
      {
        path: "/research-funding",
        allowed_roles: ["professor"],
        require_auth: false,
      },
    ]);
  });
});
