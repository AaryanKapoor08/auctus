import type { FundingItem } from "@contracts/funding";
import type { BusinessProfile } from "@contracts/profile";
import {
  clampScore,
  includesValue,
  itemHasText,
  numberInRange,
  text,
} from "./utils";

const atlanticProvinces = new Set(["nb", "ns", "pe", "pei", "nl", "new brunswick"]);

function scoreLocation(profile: BusinessProfile, item: FundingItem) {
  const location = text(profile.location);
  const eligibility = item.eligibility;

  if (!location) return 0;
  if (includesValue(eligibility.location, location)) return 25;
  if (includesValue(eligibility.province, location)) return 25;
  if (text(eligibility.location).includes("atlantic") && atlanticProvinces.has(location)) {
    return 25;
  }

  return itemHasText(item, location) ? 25 : 0;
}

function scoreRevenue(profile: BusinessProfile, item: FundingItem) {
  const eligibility = item.eligibility;
  return numberInRange(
    profile.revenue,
    eligibility.revenue_min,
    eligibility.revenue_max,
  )
    ? 25
    : 0;
}

function scoreEmployees(profile: BusinessProfile, item: FundingItem) {
  const eligibility = item.eligibility;
  return numberInRange(
    profile.employees,
    eligibility.employees_min,
    eligibility.employees_max,
  )
    ? 20
    : 0;
}

function scoreIndustry(profile: BusinessProfile, item: FundingItem) {
  const industry = profile.industry;
  if (!industry) return 0;

  if (includesValue(item.eligibility.industry, industry)) return 30;

  return itemHasText(item, industry) ? 30 : 0;
}

export function scoreBusinessGrant(profile: BusinessProfile, item: FundingItem) {
  if (item.type !== "business_grant") return 0;

  return clampScore(
    scoreLocation(profile, item) +
      scoreRevenue(profile, item) +
      scoreEmployees(profile, item) +
      scoreIndustry(profile, item),
  );
}
