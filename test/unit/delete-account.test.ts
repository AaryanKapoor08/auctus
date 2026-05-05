import { describe, expect, it } from "vitest";
import {
  DELETE_ACCOUNT_CONFIRMATION,
  isDeleteAccountConfirmation,
} from "@/lib/profile/delete-account-confirmation";

describe("delete account confirmation", () => {
  it("accepts only the exact confirmation phrase", () => {
    expect(isDeleteAccountConfirmation(DELETE_ACCOUNT_CONFIRMATION)).toBe(true);
    expect(isDeleteAccountConfirmation("delete")).toBe(false);
    expect(isDeleteAccountConfirmation(" DELETE ")).toBe(false);
    expect(isDeleteAccountConfirmation(null)).toBe(false);
  });
});
