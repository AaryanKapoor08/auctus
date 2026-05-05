import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FundingItem } from "@contracts/funding";
import type { RoleProfile } from "@contracts/profile";
import {
  GetFundingSummariesForUser,
  ListFundingForRole,
} from "@/lib/funding/queries";

const mocks = vi.hoisted(() => ({
  createFundingReadClient: vi.fn(),
  getRoleProfile: vi.fn(),
  getProfileMatchTags: vi.fn(),
}));

vi.mock("@/lib/funding/supabase", () => ({
  createFundingReadClient: mocks.createFundingReadClient,
}));

vi.mock("@/lib/profile/queries", () => ({
  getRoleProfile: mocks.getRoleProfile,
  getProfileMatchTags: mocks.getProfileMatchTags,
}));

const baseItem: FundingItem = {
  id: "funding-1",
  type: "business_grant",
  name: "Partial Grant",
  description: null,
  provider: "Auctus Manual Seed",
  amount_min: null,
  amount_max: 10000,
  deadline: null,
  application_url: null,
  source_url: null,
  eligibility: { province: "NB" },
  requirements: [],
  category: null,
  tags: [],
  source: "manual",
  scraped_from: null,
  scraped_at: null,
  status: "active",
  created_at: "2026-04-30T00:00:00.000Z",
  updated_at: "2026-04-30T00:00:00.000Z",
};

const businessProfile: RoleProfile = {
  role: "business",
  base: {
    id: "user-1",
    role: "business",
    display_name: "Ada Founder",
    email: "ada@example.com",
    avatar_url: null,
    created_at: "2026-04-30T00:00:00.000Z",
    updated_at: "2026-04-30T00:00:00.000Z",
  },
  details: {
    id: "user-1",
    business_name: "Ada Labs",
    industry: "technology",
    location: "NB",
    revenue: 200000,
    employees: 12,
    description: null,
    year_established: null,
    website: null,
  },
};

function createQuery(data: FundingItem[]) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue({ data, error: null }),
    limit: vi.fn().mockResolvedValue({ data, error: null }),
  };
}

describe("GetFundingSummariesForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getProfileMatchTags.mockResolvedValue([]);
  });

  it("returns scored and sorted summaries for onboarded users", async () => {
    const perfect = {
      ...baseItem,
      id: "funding-2",
      name: "Perfect Grant",
      amount_max: 25000,
      eligibility: {
        province: "NB",
        revenue_min: 100000,
        revenue_max: 300000,
        employees_max: 25,
        industry: "technology",
      },
    };
    mocks.getRoleProfile.mockResolvedValue(businessProfile);
    mocks.createFundingReadClient.mockResolvedValue({
      from: vi.fn(() => createQuery([baseItem, perfect])),
    });

    const summaries = await GetFundingSummariesForUser("user-1", 2);

    expect(summaries.map((summary) => summary.id)).toEqual([
      "funding-2",
      "funding-1",
    ]);
    expect(summaries[0].match_score).toBe(100);
    expect(summaries[1].match_score).toBe(25);
  });

  it("uses onboarding match tags to boost relevant funding summaries", async () => {
    mocks.getRoleProfile.mockResolvedValue(businessProfile);
    mocks.getProfileMatchTags.mockResolvedValue(["Digital", "STEM"]);
    mocks.createFundingReadClient.mockResolvedValue({
      from: vi.fn(() =>
        createQuery([
          {
            ...baseItem,
            tags: ["Digital", "STEM"],
          },
        ]),
      ),
    });

    const summaries = await GetFundingSummariesForUser("user-1", 1);

    expect(summaries[0].match_score).toBe(45);
  });

  it("returns recent active rows with null scores when role profile is missing", async () => {
    mocks.getRoleProfile.mockResolvedValue(null);
    mocks.createFundingReadClient.mockResolvedValue({
      from: vi.fn(() => createQuery([baseItem])),
    });

    await expect(GetFundingSummariesForUser("user-1", 5)).resolves.toEqual([
      {
        id: "funding-1",
        type: "business_grant",
        name: "Partial Grant",
        provider: "Auctus Manual Seed",
        amount_max: 10000,
        deadline: null,
        match_score: null,
      },
    ]);
  });

  it("filters listing pages by canonical tags", async () => {
    const query = createQuery([baseItem]);
    mocks.createFundingReadClient.mockResolvedValue({
      from: vi.fn(() => query),
    });

    await ListFundingForRole({
      role: "student",
      category: "STEM",
    });

    expect(query.contains).toHaveBeenCalledWith("tags", ["STEM"]);
    expect(query.eq).not.toHaveBeenCalledWith("category", "STEM");
  });

  it("supports multiple canonical tag filters as an AND query", async () => {
    const query = createQuery([baseItem]);
    mocks.createFundingReadClient.mockResolvedValue({
      from: vi.fn(() => query),
    });

    await ListFundingForRole({
      role: "student",
      category: "STEM,Provincial",
    });

    expect(query.contains).toHaveBeenCalledWith("tags", ["STEM"]);
    expect(query.contains).toHaveBeenCalledWith("tags", ["Provincial"]);
  });

  it("sanitizes search input before passing it to PostgREST or filters", async () => {
    const query = createQuery([baseItem]);
    mocks.createFundingReadClient.mockResolvedValue({
      from: vi.fn(() => query),
    });

    await ListFundingForRole({
      role: "business",
      search: "%,status.eq.expired",
    });

    expect(query.or).toHaveBeenCalledWith(
      "name.ilike.%status eq expired%,provider.ilike.%status eq expired%,description.ilike.%status eq expired%",
    );
  });
});
