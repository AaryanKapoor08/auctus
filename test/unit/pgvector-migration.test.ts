import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const sql = readFileSync(
  join(process.cwd(), "supabase/migrations/0026_pgvector_funding.sql"),
  "utf8",
);

describe("0026_pgvector_funding.sql", () => {
  it("creates pgvector embedding storage with the locked Gemini dimension", () => {
    expect(sql).toContain("create extension if not exists vector");
    expect(sql).toContain("alter type public.ai_enrichment_task_type add value if not exists 'embedding'");
    expect(sql).toContain("create table if not exists public.funding_embeddings");
    expect(sql).toContain("embedding extensions.vector(768) not null");
    expect(sql).toContain("using hnsw (embedding extensions.vector_cosine_ops)");
  });

  it("keeps raw vectors service-role only and exposes ranked active IDs via RPC", () => {
    expect(sql).toContain("alter table public.funding_embeddings enable row level security");
    expect(sql).toContain("create or replace function public.match_funding_embeddings");
    expect(sql).toContain("security definer");
    expect(sql).toContain("grant execute on function public.match_funding_embeddings");
    expect(sql).toContain("to service_role");
    expect(sql).not.toMatch(/to anon, authenticated/);
  });
});
