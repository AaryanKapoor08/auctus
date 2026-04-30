import type { FundingItem } from "@contracts/funding";
import type { RoleProfile } from "@contracts/profile";
import { scoreBusinessGrant } from "./business";
import { scoreResearchGrant } from "./professor";
import { scoreScholarship } from "./student";

export { scoreBusinessGrant } from "./business";
export { scoreResearchGrant } from "./professor";
export { scoreScholarship } from "./student";

export function scoreFor(roleProfile: RoleProfile, item: FundingItem) {
  if (roleProfile.role === "business") {
    return scoreBusinessGrant(roleProfile.details, item);
  }

  if (roleProfile.role === "student") {
    return scoreScholarship(roleProfile.details, item);
  }

  return scoreResearchGrant(roleProfile.details, item);
}
