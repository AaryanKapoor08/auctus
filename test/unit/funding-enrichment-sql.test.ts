import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  COMBINED_PROMPT_VERSION,
  PROVIDER_PREFERENCES,
  RUN_STATUSES,
  TASK_TYPES,
} from "@/lib/ai/enrichment-schema";

const sql = readFileSync(
  join(process.cwd(), "supabase/migrations/0025_ai_enrichment.sql"),
  "utf8",
);
const readerSql = readFileSync(
  join(process.cwd(), "lib/funding/enrichment.ts"),
  "utf8",
);

describe("0025_ai_enrichment.sql", () => {
  it("adds trigger-maintained funding content_hash over public fields including source_url", () => {
    expect(sql).toContain("add column if not exists content_hash text");
    expect(sql).toContain("create or replace function public.compute_funding_content_hash");
    expect(sql).toContain("coalesce(p_row.source_url, '')");
    expect(sql).toContain("drop trigger if exists funding_set_content_hash");
    expect(sql).toContain("before insert or update of");
  });

  it("declares the locked enum values expected by runtime constants", () => {
    for (const taskType of TASK_TYPES) {
      expect(sql).toContain(`'${taskType}'`);
    }
    for (const preference of PROVIDER_PREFERENCES) {
      expect(sql).toContain(`'${preference}'`);
    }
    for (const status of RUN_STATUSES) {
      expect(sql).toContain(`'${status}'`);
    }
  });

  it("creates AI tables with cascade funding FKs and current-version uniqueness", () => {
    expect(sql).toContain("create table if not exists public.funding_ai_enrichment");
    expect(sql).toContain("funding_id uuid not null references public.funding(id) on delete cascade");
    expect(sql).toContain("unique (funding_id, task_type, content_hash, prompt_version, schema_version)");
    expect(sql).toContain("create table if not exists public.ai_enrichment_jobs");
    expect(sql).toContain("task_types text[] not null");
    expect(sql).toContain("create unique index if not exists ai_enrichment_jobs_current_key");
  });

  it("enables RLS on all AI tables and exposes only active parent enrichment reads", () => {
    expect(sql).toContain("alter table public.funding_ai_enrichment enable row level security");
    expect(sql).toContain("alter table public.ai_enrichment_jobs enable row level security");
    expect(sql).toContain("alter table public.ai_enrichment_runs enable row level security");
    expect(sql).toContain("alter table public.ai_enrichment_quarantine enable row level security");
    expect(sql).toContain('create policy "funding_ai_enrichment public select"');
    expect(sql).toContain("to anon, authenticated");
    expect(sql).toContain("and f.status = 'active'");
    expect(sql).not.toMatch(/create policy .*on public\.ai_enrichment_jobs/s);
  });

  it("documents run accounting, budget aborts, and quarantine bounds", () => {
    expect(sql).toContain("tokens_in integer not null default 0 check (tokens_in >= 0)");
    expect(sql).toContain("cost_out_cents integer not null default 0 check (cost_out_cents >= 0)");
    expect(sql).toContain("aborted_reason text check");
    expect(sql).toContain("redacted_payload text not null check (length(redacted_payload) <= 32780)");
  });
});

describe("funding enrichment readers", () => {
  it("hide stale hash, stale version, and review rows in code", () => {
    expect(readerSql).toContain("row.funding?.content_hash === row.content_hash");
    expect(readerSql).toContain("row.prompt_version === COMBINED_PROMPT_VERSION");
    expect(readerSql).toContain("row.schema_version === SCHEMA_VERSIONS[row.task_type]");
    expect(readerSql).toContain("!row.needs_review");
    expect(COMBINED_PROMPT_VERSION).toBe(1);
  });
});
