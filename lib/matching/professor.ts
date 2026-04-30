import type { FundingItem } from "@contracts/funding";
import type { ProfessorProfile } from "@contracts/profile";
import {
  clampScore,
  includesValue,
  itemHasText,
} from "./utils";

function scoreResearchArea(profile: ProfessorProfile, item: FundingItem) {
  if (!profile.research_area) return 0;
  if (includesValue(item.eligibility.research_area, profile.research_area)) {
    return 30;
  }

  return itemHasText(item, profile.research_area) ? 30 : 0;
}

function scoreCareerStage(profile: ProfessorProfile, item: FundingItem) {
  if (!profile.career_stage) return 0;
  return includesValue(item.eligibility.career_stage, profile.career_stage) ? 25 : 0;
}

function scoreCouncil(profile: ProfessorProfile, item: FundingItem) {
  const council = item.eligibility.council;
  if (!council) return 0;

  return profile.research_keywords.some((keyword) => includesValue(council, keyword))
    ? 20
    : 0;
}

function scoreInstitution(profile: ProfessorProfile, item: FundingItem) {
  if (!profile.institution) return 0;
  if (includesValue(item.eligibility.institution, profile.institution)) return 15;

  return itemHasText(item, profile.institution) ? 15 : 0;
}

function scorePastFunding(profile: ProfessorProfile, item: FundingItem) {
  if (!item.eligibility.past_funding_required) return 10;
  return profile.h_index !== null && profile.h_index > 0 ? 10 : 0;
}

export function scoreResearchGrant(profile: ProfessorProfile, item: FundingItem) {
  if (item.type !== "research_grant") return 0;

  return clampScore(
    scoreResearchArea(profile, item) +
      scoreCareerStage(profile, item) +
      scoreCouncil(profile, item) +
      scoreInstitution(profile, item) +
      scorePastFunding(profile, item),
  );
}
