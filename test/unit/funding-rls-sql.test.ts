import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const sql = readFileSync(
  join(root, "supabase/migrations/0020_rls_funding.sql"),
  "utf8",
);
const publicFundingSql = readFileSync(
  join(root, "supabase/migrations/0024_public_funding_reads.sql"),
  "utf8",
);

describe("0020_rls_funding.sql", () => {
  it("enables RLS on every funding-domain table", () => {
    expect(sql).toContain("alter table public.funding enable row level security");
    expect(sql).toContain("alter table public.funding_preferences enable row level security");
    expect(sql).toContain("alter table public.funding_sources enable row level security");
    expect(sql).toContain("alter table public.scrape_runs enable row level security");
  });

  it("publishes the role-to-funding-type SQL helper", () => {
    expect(sql).toContain("create or replace function public.funding_type_for_role");
    expect(sql).toContain("'business_grant'::public.funding_type");
    expect(sql).toContain("'scholarship'::public.funding_type");
    expect(sql).toContain("'research_grant'::public.funding_type");
  });

  it("initially restricts funding select to active rows of the caller's role", () => {
    expect(sql).toContain('create policy "funding role select"');
    expect(sql).toContain("status = 'active'");
    expect(sql).toContain("public.funding_type_for_role");
    expect(sql).toContain("auth.uid()");
  });

  it("opens active funding reads for public discovery in the follow-up migration", () => {
    expect(publicFundingSql).toContain(
      'create policy "funding active public select"',
    );
    expect(publicFundingSql).toContain("to anon, authenticated");
    expect(publicFundingSql).toContain("using (status = 'active')");
    expect(publicFundingSql).toContain('drop policy if exists "funding role select"');
  });

  it("does not publish authenticated insert/update/delete policies on funding", () => {
    expect(sql).not.toMatch(/on public\.funding\s+for insert/);
    expect(sql).not.toMatch(/on public\.funding\s+for update/);
    expect(sql).not.toMatch(/on public\.funding\s+for delete/);
  });

  it("publishes own-row + current-role policies for funding_preferences", () => {
    expect(sql).toContain('create policy "funding_preferences own row select"');
    expect(sql).toContain('create policy "funding_preferences own row insert"');
    expect(sql).toContain('create policy "funding_preferences own row update"');
    expect(sql).toContain('create policy "funding_preferences own row delete"');
    const ownerRolePattern =
      /user_id = auth\.uid\(\)\s*and role = \(select role from public\.profiles where id = auth\.uid\(\)\)/;
    expect(ownerRolePattern.test(sql)).toBe(true);
  });

  it("does not publish authenticated policies on funding_sources or scrape_runs", () => {
    expect(sql).not.toMatch(/on public\.funding_sources/);
    expect(sql).not.toMatch(/on public\.scrape_runs/);
  });
});
