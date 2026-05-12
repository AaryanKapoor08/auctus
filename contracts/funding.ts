// Shared funding shapes used by funding pages, matching, preferences, and dashboard code.

import type { Role } from "./role";

export type FundingType = "business_grant" | "scholarship" | "research_grant";

export type FundingStatus = "active" | "expired" | "archived";

export interface FundingItem {
  id: string; // UUID
  type: FundingType;
  name: string;
  description: string | null;
  provider: string;
  amount_min: number | null; // CAD
  amount_max: number | null; // CAD
  deadline: string | null; // ISO date, null = rolling/ongoing
  application_url: string | null;
  source_url: string | null;
  eligibility: Record<string, unknown>; // JSONB
  requirements: string[];
  category: string | null;
  tags: string[];
  source: "scraped" | "manual";
  scraped_from: string | null;
  scraped_at: string | null;
  status: FundingStatus;
  created_at: string;
  updated_at: string;
}

// Compact shape used by dashboard tiles and recommendations.
export interface FundingSummary {
  id: string;
  type: FundingType;
  name: string;
  provider: string;
  amount_max: number | null;
  deadline: string | null;
  match_score: number | null; // 0-100, null if profile insufficient to score
}

export type FundingDefaultFilters = Record<string, unknown>;

export interface FundingPreferences {
  user_id: string; // UUID, references profiles.id / auth.users.id
  role: Role;
  default_filters: FundingDefaultFilters; // JSONB
  created_at: string;
  updated_at: string;
}

// Filter shape used by listing pages and dashboard queries.
export interface FundingQuery {
  role: Role;
  status?: FundingStatus; // default 'active'
  category?: string;
  min_match_score?: number; // 0-100
  search?: string;
  limit?: number;
  offset?: number;
}

// Function signatures implemented by the funding query layer.
export type ListFundingForRole = (
  query: FundingQuery,
) => Promise<FundingItem[]>;

export type GetFundingSummariesForUser = (
  user_id: string,
  limit?: number,
) => Promise<FundingSummary[]>;

export type GetFundingById = (id: string) => Promise<FundingItem | null>;

export type GetFundingPreferences = (
  user_id: string,
  role: Role,
) => Promise<FundingPreferences | null>;

export type UpsertFundingPreferences = (
  preferences: Pick<FundingPreferences, "user_id" | "role" | "default_filters">,
) => Promise<FundingPreferences>;

export type ClearFundingPreferences = (
  user_id: string,
  role: Role,
) => Promise<void>;
