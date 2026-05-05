import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

describe("forum and identity RLS migrations", () => {
  const identityRlsSql = readFileSync(
    join(root, "supabase/migrations/0010_rls_identity.sql"),
    "utf8",
  );
  const profileEmailSql = readFileSync(
    join(root, "supabase/migrations/0012_restrict_profile_email_select.sql"),
    "utf8",
  );

  it("defines helpful votes through a duplicate-safe security definer function", () => {
    const sql = readFileSync(
      join(root, "supabase/migrations/0005_forum.sql"),
      "utf8",
    );

    expect(sql).toContain("security definer");
    expect(sql).toContain("on conflict do nothing");
    expect(sql).toContain("get diagnostics v_inserted = row_count");
    expect(sql).toContain("grant execute on function public.mark_reply_helpful(uuid) to authenticated");
  });

  it("blocks direct helpful-vote client writes while allowing forum reads and author writes", () => {
    expect(identityRlsSql).toContain("alter table public.reply_helpful_votes enable row level security");
    expect(identityRlsSql).not.toContain("on public.reply_helpful_votes\nfor insert");
    expect(identityRlsSql).toContain("threads authenticated read");
    expect(identityRlsSql).toContain("threads author insert");
    expect(identityRlsSql).toContain("replies author insert");
    expect(identityRlsSql).toContain("business profiles owner all");
    expect(identityRlsSql).toContain("student profiles owner all");
    expect(identityRlsSql).toContain("professor profiles owner all");
  });

  it("removes email from authenticated profile select privileges", () => {
    expect(identityRlsSql).toContain("0012_restrict_profile_email_select.sql");
    expect(profileEmailSql).toContain("revoke select on public.profiles from authenticated");
    expect(profileEmailSql).toContain("0010_rls_identity.sql");
    expect(profileEmailSql).toContain("grant select (");
    expect(profileEmailSql).not.toMatch(/grant select \([^)]*email[^)]*\) on public\.profiles to authenticated/s);
    expect(profileEmailSql).toMatch(/email,\s+avatar_url/s);
    expect(profileEmailSql).toContain("on public.profiles to service_role");
  });

  it("pins the exact authenticated profile directory columns", () => {
    expect(profileEmailSql).toMatch(
      /grant select \(\s+id,\s+role,\s+display_name,\s+avatar_url,\s+created_at,\s+updated_at\s+\) on public\.profiles to authenticated;/,
    );
  });
});
