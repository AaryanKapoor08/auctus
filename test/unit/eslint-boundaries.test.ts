import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const eslintConfig = readFileSync(
  join(process.cwd(), "eslint.config.mjs"),
  "utf8",
);

describe("eslint architecture boundaries", () => {
  it("keeps AI and semantic runtimes isolated from identity/community imports", () => {
    expect(eslintConfig).toContain("no-restricted-imports");
    expect(eslintConfig).toContain("lib/ai/**/*.{ts,tsx}");
    expect(eslintConfig).toContain("jobs/**/*.{ts,tsx}");
    expect(eslintConfig).toContain("lib/funding/semantic-search.ts");
    expect(eslintConfig).toContain("@/lib/profile/**");
    expect(eslintConfig).toContain("@/lib/session/**");
    expect(eslintConfig).toContain("@/lib/forum/**");
  });
});
