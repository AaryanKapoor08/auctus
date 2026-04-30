import type { FundingItem } from "@contracts/funding";
import type { StudentProfile } from "@contracts/profile";
import {
  clampScore,
  includesValue,
  itemHasText,
  numberInRange,
} from "./utils";

function scoreEducationLevel(profile: StudentProfile, item: FundingItem) {
  if (!profile.education_level) return 0;
  return includesValue(item.eligibility.education_level, profile.education_level)
    ? 30
    : 0;
}

function scoreField(profile: StudentProfile, item: FundingItem) {
  if (!profile.field_of_study) return 0;
  if (includesValue(item.eligibility.field_of_study, profile.field_of_study)) {
    return 25;
  }

  return itemHasText(item, profile.field_of_study) ? 25 : 0;
}

function scoreInstitution(profile: StudentProfile, item: FundingItem) {
  if (!profile.institution) return 0;
  if (includesValue(item.eligibility.institution, profile.institution)) {
    return 15;
  }

  return itemHasText(item, profile.institution) ? 15 : 0;
}

function scoreProvince(profile: StudentProfile, item: FundingItem) {
  if (!profile.province) return 0;
  if (includesValue(item.eligibility.province, profile.province)) return 15;

  return itemHasText(item, profile.province) ? 15 : 0;
}

function scoreGpa(profile: StudentProfile, item: FundingItem) {
  return numberInRange(profile.gpa, item.eligibility.gpa_min, item.eligibility.gpa_max)
    ? 15
    : 0;
}

export function scoreScholarship(profile: StudentProfile, item: FundingItem) {
  if (item.type !== "scholarship") return 0;

  return clampScore(
    scoreEducationLevel(profile, item) +
      scoreField(profile, item) +
      scoreInstitution(profile, item) +
      scoreProvince(profile, item) +
      scoreGpa(profile, item),
  );
}
