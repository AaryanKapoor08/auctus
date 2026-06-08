import "server-only";

import type {
  FundingItem,
  FundingQuery,
  FundingSummary,
  GetFundingById as GetFundingByIdContract,
  GetFundingSummariesForUser as GetFundingSummariesForUserContract,
  ListFundingForRole as ListFundingForRoleContract,
} from "@contracts/funding";
import { createFundingReadClient } from "./supabase";
import { getFundingTypeForRole } from "./role-mapping";
import { scoreFor } from "@/lib/matching";
import type { MatchableFundingItem } from "@/lib/matching/types";
import { getProfileMatchTags, getRoleProfile } from "@/lib/profile/queries";
import { buildIlikeOrFilter } from "@/lib/supabase/postgrest-filters";
import { timeServer } from "@/lib/perf/server-timing";
import {
  FUNDING_CATEGORY_MAX_CHARS,
  FUNDING_MAX_CATEGORY_FILTERS,
  FUNDING_MAX_PAGE,
} from "./search-input";

const SUMMARY_MATCH_CANDIDATE_LIMIT = 100;
const FUNDING_LIST_COLUMNS =
  "id,type,name,description,provider,amount_min,amount_max,deadline,category,tags";
const FUNDING_SCORING_COLUMNS =
  "id,type,name,provider,amount_max,deadline,eligibility,requirements,category,tags";
const FUNDING_SUMMARY_COLUMNS = "id,type,name,provider,amount_max,deadline";
const FUNDING_PAGE_SIZE_DEFAULT = 36;
const FUNDING_PAGE_SIZE_MAX = 48;

export type FundingListDeadlineFilter = "all" | "30" | "60" | "90" | "rolling";
export type FundingListSortOption = "relevance" | "deadline" | "amount" | "newest";

export type FundingListItem = Pick<
  FundingItem,
  | "id"
  | "type"
  | "name"
  | "description"
  | "provider"
  | "amount_min"
  | "amount_max"
  | "deadline"
  | "category"
  | "tags"
>;

export type FundingPageQuery = Omit<FundingQuery, "category" | "limit" | "offset"> & {
  categories?: string[];
  deadline?: FundingListDeadlineFilter;
  sort?: FundingListSortOption;
  page?: number;
  pageSize?: number;
  semanticRankedIds?: string[];
};

export type FundingPageResult = {
  items: FundingListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

function toFundingSummary(
  item: Pick<
    FundingItem,
    "id" | "type" | "name" | "provider" | "amount_max" | "deadline"
  >,
  match_score: FundingSummary["match_score"] = null,
): FundingSummary {
  return {
    id: item.id,
    type: item.type,
    name: item.name,
    provider: item.provider,
    amount_max: item.amount_max,
    deadline: item.deadline,
    match_score,
  };
}

function parseCategoryFilters(category: string | undefined) {
  return (category ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => Array.from(value).slice(0, FUNDING_CATEGORY_MAX_CHARS).join(""))
    .slice(0, FUNDING_MAX_CATEGORY_FILTERS);
}

function parseCategoryList(categories: string[] | undefined) {
  return (categories ?? [])
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => Array.from(value).slice(0, FUNDING_CATEGORY_MAX_CHARS).join(""))
    .slice(0, FUNDING_MAX_CATEGORY_FILTERS);
}

function dateOnlyDaysFromNow(days: number) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function normalizePage(value: number | undefined) {
  return Number.isFinite(value) && value && value > 0
    ? Math.min(Math.floor(value), FUNDING_MAX_PAGE)
    : 1;
}

function normalizePageSize(value: number | undefined) {
  if (!Number.isFinite(value) || !value || value < 1) {
    return FUNDING_PAGE_SIZE_DEFAULT;
  }

  return Math.min(Math.floor(value), FUNDING_PAGE_SIZE_MAX);
}

async function listFundingScoringCandidates(query: {
  role: FundingQuery["role"];
  status?: FundingQuery["status"];
  limit: number;
}): Promise<MatchableFundingItem[]> {
  const supabase = await createFundingReadClient();
  const { data, error } = await supabase
    .from("funding")
    .select(FUNDING_SCORING_COLUMNS)
    .eq("type", getFundingTypeForRole(query.role))
    .eq("status", query.status ?? "active")
    .order("created_at", { ascending: false })
    .limit(query.limit);

  if (error) throw error;

  return (data ?? []) as MatchableFundingItem[];
}

export const ListFundingForRole: ListFundingForRoleContract = async (
  query: FundingQuery,
) => {
  return timeServer(
    "ListFundingForRole",
    async () => {
      const supabase = await createFundingReadClient();
      let request = supabase
        .from("funding")
        .select("*")
        .eq("type", getFundingTypeForRole(query.role))
        .eq("status", query.status ?? "active")
        .order("created_at", { ascending: false });

      for (const category of parseCategoryFilters(query.category)) {
        request = request.contains("tags", [category]);
      }

      if (query.search) {
        const searchFilter = buildIlikeOrFilter(
          ["name", "provider", "description"],
          query.search,
        );

        if (searchFilter) {
          request = request.or(searchFilter);
        }
      }

      if (query.limit) {
        const offset = query.offset ?? 0;
        request = request.range(offset, offset + query.limit - 1);
      }

      const { data, error } = await request;

      if (error) throw error;

      return (data ?? []) as FundingItem[];
    },
    {
      role: query.role,
      limit: query.limit ?? "all",
      hasSearch: Boolean(query.search),
      hasCategory: Boolean(query.category),
    },
  );
};

export async function ListFundingPageForRole(
  query: FundingPageQuery,
): Promise<FundingPageResult> {
  return timeServer(
    "ListFundingPageForRole",
    async () => {
      const page = normalizePage(query.page);
      const pageSize = normalizePageSize(query.pageSize);
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const categories = parseCategoryList(query.categories);
      const semanticRankedIds = [...new Set(query.semanticRankedIds ?? [])].slice(0, 500);
      const supabase = await createFundingReadClient();
      let request = supabase
        .from("funding")
        .select(FUNDING_LIST_COLUMNS, { count: "exact" })
        .eq("type", getFundingTypeForRole(query.role))
        .eq("status", query.status ?? "active");

      for (const category of categories) {
        request = request.contains("tags", [category]);
      }

      if (query.deadline === "rolling") {
        request = request.is("deadline", null);
      } else if (query.deadline && query.deadline !== "all") {
        request = request
          .not("deadline", "is", null)
          .gte("deadline", dateOnlyDaysFromNow(0))
          .lte("deadline", dateOnlyDaysFromNow(Number(query.deadline)));
      }

      if (semanticRankedIds.length > 0) {
        request = request.in("id", semanticRankedIds);
      } else if (query.search) {
        const searchFilter = buildIlikeOrFilter(
          ["name", "provider", "description"],
          query.search,
        );

        if (searchFilter) {
          request = request.or(searchFilter);
        }
      }

      if (semanticRankedIds.length === 0) {
        if (query.sort === "deadline") {
          request = request.order("deadline", {
            ascending: true,
            nullsFirst: false,
          });
        } else if (query.sort === "amount") {
          request = request.order("amount_max", {
            ascending: false,
            nullsFirst: false,
          });
        } else {
          request = request.order("created_at", { ascending: false });
        }

        request = request.range(from, to);
      }

      const { data, error, count } = await request;

      if (error) throw error;

      if (semanticRankedIds.length > 0) {
        const order = new Map(semanticRankedIds.map((id, index) => [id, index]));
        const rankedRows = ((data ?? []) as FundingListItem[]).sort(
          (a, b) =>
            (order.get(a.id) ?? Number.POSITIVE_INFINITY) -
            (order.get(b.id) ?? Number.POSITIVE_INFINITY),
        );
        const totalCount = rankedRows.length;

        return {
          items: rankedRows.slice(from, to + 1),
          totalCount,
          page,
          pageSize,
          pageCount: Math.max(1, Math.ceil(totalCount / pageSize)),
        };
      }

      const totalCount = count ?? 0;

      return {
        items: (data ?? []) as FundingListItem[],
        totalCount,
        page,
        pageSize,
        pageCount: Math.max(1, Math.ceil(totalCount / pageSize)),
      };
    },
    {
      role: query.role,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? FUNDING_PAGE_SIZE_DEFAULT,
      hasSearch: Boolean(query.search),
      categoryCount: query.categories?.length ?? 0,
    },
  );
}

export const GetFundingById: GetFundingByIdContract = async (id) => {
  return timeServer("GetFundingById", async () => {
    const supabase = await createFundingReadClient();
    const { data, error } = await supabase
      .from("funding")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    return data as FundingItem | null;
  });
};

export const GetFundingSummariesForUser: GetFundingSummariesForUserContract = async (
  user_id,
  limit = 5,
) => {
  return timeServer(
    "GetFundingSummariesForUser",
    async () => {
      const roleProfile = await getRoleProfile(user_id);

      if (!roleProfile) {
        const supabase = await createFundingReadClient();
        const { data, error } = await supabase
          .from("funding")
          .select(FUNDING_SUMMARY_COLUMNS)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(limit);

        if (error) throw error;

        return ((data ?? []) as FundingItem[]).map((item) =>
          toFundingSummary(item),
        );
      }

      const items = await listFundingScoringCandidates({
        role: roleProfile.role,
        status: "active",
        limit: Math.max(limit, SUMMARY_MATCH_CANDIDATE_LIMIT),
      });
      const profileTags = await getProfileMatchTags(user_id);

      return items
        .map((item) =>
          toFundingSummary(item, scoreFor(roleProfile, item, profileTags)),
        )
        .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0))
        .slice(0, limit);
    },
    { limit },
  );
};
