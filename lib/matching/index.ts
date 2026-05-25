import type { RoleProfile } from "@contracts/profile";
import { scoreBusinessGrant } from "./business";
import { scoreResearchGrant } from "./professor";
import { scoreScholarship } from "./student";
import type { MatchableFundingItem } from "./types";

export { scoreBusinessGrant } from "./business";
export { scoreResearchGrant } from "./professor";
export { scoreScholarship } from "./student";

function tagBoost(profileTags: string[], item: MatchableFundingItem) {
  if (profileTags.length === 0 || item.tags.length === 0) {
    return 0;
  }

  const itemTags = new Set(item.tags.map((tag) => tag.toLowerCase()));
  const matches = profileTags.filter((tag) => itemTags.has(tag.toLowerCase()));

  return Math.min(matches.length * 10, 30);
}

export function scoreFor(
  roleProfile: RoleProfile,
  item: MatchableFundingItem,
  profileTags: string[] = [],
) {
  const boost = tagBoost(profileTags, item);
  let score: number;

  if (roleProfile.role === "business") {
    score = scoreBusinessGrant(roleProfile.details, item);
  } else if (roleProfile.role === "student") {
    score = scoreScholarship(roleProfile.details, item);
  } else {
    score = scoreResearchGrant(roleProfile.details, item);
  }

  return Math.min(score + boost, 100);
}
