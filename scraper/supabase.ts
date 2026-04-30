import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { NormalizedFunding } from "./normalize.js";
import type { DedupeStore, ExistingRow } from "./deduplicate.js";
import type { ExpireStore } from "./expire.js";
import type { SourceRunResult } from "./types.js";

let cached: SupabaseClient | null = null;

export function getServiceRoleClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Scraper requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.",
    );
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function createSupabaseDedupeStore(client: SupabaseClient): DedupeStore {
  return {
    async findExisting(row): Promise<ExistingRow | null> {
      const { data, error } = await client
        .from("funding")
        .select(
          "id, name, provider, type, description, amount_min, amount_max, deadline, application_url, source_url, eligibility, requirements, category, tags, status",
        )
        .eq("name", row.name)
        .eq("provider", row.provider)
        .eq("type", row.type)
        .maybeSingle();
      if (error) throw error;
      return (data as ExistingRow | null) ?? null;
    },
    async insert(row: NormalizedFunding): Promise<void> {
      const { error } = await client.from("funding").insert(row);
      if (error) throw error;
    },
    async update(id: string, row: NormalizedFunding): Promise<void> {
      const { error } = await client.from("funding").update(row).eq("id", id);
      if (error) throw error;
    },
  };
}

export function createSupabaseExpireStore(client: SupabaseClient): ExpireStore {
  return {
    async expirePastDeadlines(asOf: Date): Promise<number> {
      const cutoff = asOf.toISOString().slice(0, 10);
      const { data, error } = await client
        .from("funding")
        .update({ status: "expired" })
        .lt("deadline", cutoff)
        .eq("status", "active")
        .select("id");
      if (error) throw error;
      return data?.length ?? 0;
    },
  };
}

export async function recordScrapeRun(
  client: SupabaseClient,
  result: SourceRunResult,
): Promise<void> {
  const { error } = await client.from("scrape_runs").insert({
    source_id: result.sourceId,
    started_at: result.startedAt,
    finished_at: result.finishedAt,
    fetched: result.fetched,
    inserted: result.inserted,
    updated: result.updated,
    skipped: result.skipped,
    errors: result.errors,
    error_messages: result.errorMessages,
    status: result.status,
  });
  if (error) throw error;
}
