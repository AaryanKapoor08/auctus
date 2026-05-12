import { describe, expect, it } from "vitest";
import { ROLE_DEFAULT_ROUTE, type Role } from "@contracts/role";

describe("contract imports", () => {
  it("imports a contract type through @contracts", () => {
    const role: Role = "business";

    expect(ROLE_DEFAULT_ROUTE[role]).toBe("/grants");
  });

  it("keeps the expected default routes", () => {
    expect(ROLE_DEFAULT_ROUTE).toEqual({
      business: "/grants",
      student: "/scholarships",
      professor: "/research-funding",
    });
  });
});
