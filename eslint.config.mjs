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
      "lib/ai/**/*.{ts,tsx}",
      "jobs/**/*.{ts,tsx}",
      "scraper/ai-enrich.ts",
      "lib/funding/enrichment.ts",
      "lib/funding/semantic-search.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/lib/auth/**",
                "@/lib/forum/**",
                "@/lib/profile/**",
                "@/lib/session/**",
                "@/app/(identity)/**",
                "@/app/dashboard/**",
                "@/app/forum/**",
                "@/app/onboarding/**",
                "@/app/profile/**",
                "../lib/auth/**",
                "../lib/forum/**",
                "../lib/profile/**",
                "../lib/session/**",
                "../auth/**",
                "../forum/**",
                "../profile/**",
                "../session/**",
                "../../auth/**",
                "../../forum/**",
                "../../profile/**",
                "../../session/**",
              ],
              message:
                "AI and funding semantic runtimes must not import identity, profile, session, forum, or app routes.",
            },
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
    "design/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
