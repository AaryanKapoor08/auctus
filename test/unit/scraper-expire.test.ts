import { describe, expect, it } from "vitest";
import { expirePastDeadlines } from "@/scraper/expire";

describe("expirePastDeadlines", () => {
  it("delegates to the store with the asOf date and returns the row count", async () => {
    let received: Date | null = null;
    const store = {
      async expirePastDeadlines(asOf: Date) {
        received = asOf;
        return 7;
      },
    };
    const asOf = new Date("2026-05-01T00:00:00Z");
    const count = await expirePastDeadlines(store, asOf);
    expect(count).toBe(7);
    expect(received).toEqual(asOf);
  });
});
