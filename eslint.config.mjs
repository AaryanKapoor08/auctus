import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: [
      "lib/ai/**/*.ts",
      "lib/funding/semantic-search.ts",
      "jobs/**/*.ts",
      "scraper/ai-enrich.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@/lib/profile/**",
            "@/lib/forum/**",
            "@/lib/session/**",
            "@/app/(identity)/**",
            "@/app/profile/**",
            "@/app/forum/**",
            "@/app/dashboard/**",
            "@/app/onboarding/**",
            "../lib/profile/**",
            "../lib/forum/**",
            "../lib/session/**",
            "../app/(identity)/**",
            "../app/profile/**",
            "../app/forum/**",
            "../app/dashboard/**",
            "../app/onboarding/**",
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "auctus-frontend/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
