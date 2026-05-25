import type { FundingItem } from "@contracts/funding";

export type MatchableFundingItem = Pick<
  FundingItem,
  | "id"
  | "type"
  | "name"
  | "provider"
  | "amount_max"
  | "deadline"
  | "eligibility"
  | "requirements"
  | "category"
  | "tags"
>;
