import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const requireAdminSource = readFileSync(
  join(process.cwd(), "app/admin/_lib/require-admin.ts"),
  "utf8",
);
const reviewPageSource = readFileSync(
  join(process.cwd(), "app/admin/review/page.tsx"),
  "utf8",
);
const runsPageSource = readFileSync(
  join(process.cwd(), "app/admin/runs/page.tsx"),
  "utf8",
);
const routePolicySource = readFileSync(
  join(process.cwd(), "lib/auth/route-policies.ts"),
  "utf8",
);

describe("admin pages", () => {
  it("requires a server-side authenticated allowlisted user", () => {
    expect(requireAdminSource).toContain("supabase.auth.getUser()");
    expect(requireAdminSource).toContain("isAdminEmailAllowed(user.email)");
    expect(requireAdminSource).toContain("notFound()");
    expect(routePolicySource).toContain('{ path: "/admin", allowed_roles: null, require_auth: true }');
  });

  it("uses service-role reads only after the admin gate", () => {
    expect(reviewPageSource.indexOf("await requireAdmin()")).toBeLessThan(
      reviewPageSource.indexOf("createAdminClient()"),
    );
    expect(runsPageSource.indexOf("await requireAdmin()")).toBeLessThan(
      runsPageSource.indexOf("createAdminClient()"),
    );
  });
});
