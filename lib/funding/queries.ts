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
import { getProfileMatchTags, getRoleProfile } from "@/lib/profile/queries";

function toFundingSummary(
  item: FundingItem,
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

export const ListFundingForRole: ListFundingForRoleContract = async (
  query: FundingQuery,
) => {
  const supabase = await createFundingReadClient();
  let request = supabase
    .from("funding")
    .select("*")
    .eq("type", getFundingTypeForRole(query.role))
    .eq("status", query.status ?? "active")
    .order("created_at", { ascending: false });

  if (query.category) {
    request = request.contains("tags", [query.category]);
  }

  if (query.search) {
    request = request.or(
      `name.ilike.%${query.search}%,provider.ilike.%${query.search}%,description.ilike.%${query.search}%`,
    );
  }

  if (query.limit) {
    const offset = query.offset ?? 0;
    request = request.range(offset, offset + query.limit - 1);
  }

  const { data, error } = await request;

  if (error) throw error;

  return (data ?? []) as FundingItem[];
};

export const GetFundingById: GetFundingByIdContract = async (id) => {
  const supabase = await createFundingReadClient();
  const { data, error } = await supabase
    .from("funding")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;

  return data as FundingItem | null;
};

export const GetFundingSummariesForUser: GetFundingSummariesForUserContract = async (
  user_id,
  limit = 5,
) => {
  const roleProfile = await getRoleProfile(user_id);

  if (!roleProfile) {
    const supabase = await createFundingReadClient();
    const { data, error } = await supabase
      .from("funding")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return ((data ?? []) as FundingItem[]).map((item) =>
      toFundingSummary(item),
    );
  }

  const items = await ListFundingForRole({
    role: roleProfile.role,
    status: "active",
    limit,
  });
  const profileTags = await getProfileMatchTags(user_id);

  return items
    .map((item) => toFundingSummary(item, scoreFor(roleProfile, item, profileTags)))
    .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
};
