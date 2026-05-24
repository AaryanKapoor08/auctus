import "server-only";

import { unstable_cache } from "next/cache";
import { createFundingServiceClient } from "./supabase";
import {
  aggregateFundingFactRows,
  type FundingFactRow,
  type FundingSiteStats,
} from "./site-stats-shared";

const ACTIVE_FACT_COLUMNS =
  "type,provider,amount_min,amount_max,deadline,tags,scraped_from";
const FACT_PAGE_SIZE = 1000;

async function fetchActiveFundingFactRows(): Promise<FundingFactRow[]> {
  const supabase = createFundingServiceClient();
  const rows: FundingFactRow[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from("funding")
      .select(ACTIVE_FACT_COLUMNS)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .range(offset, offset + FACT_PAGE_SIZE - 1);

    if (error) throw error;

    const page = (data ?? []) as FundingFactRow[];
    rows.push(...page);

    if (page.length < FACT_PAGE_SIZE) break;
    offset += FACT_PAGE_SIZE;
  }

  return rows;
}

async function loadFundingSiteStats(): Promise<FundingSiteStats> {
  const rows = await fetchActiveFundingFactRows();
  return aggregateFundingFactRows(rows);
}

export const getFundingSiteStats = unstable_cache(
  loadFundingSiteStats,
  ["funding-site-stats-v1"],
  {
    revalidate: 300,
    tags: ["funding-site-stats"],
  },
);
