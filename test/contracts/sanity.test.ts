import { describe, expect, it } from "vitest";
import { ROLE_DEFAULT_ROUTE, type Role } from "@contracts/role";

describe("contract imports", () => {
  it("imports a contract type through @contracts", () => {
    const role: Role = "business";

    expect(ROLE_DEFAULT_ROUTE[role]).toBe("/grants");
  });
});
