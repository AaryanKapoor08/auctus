import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FundingItem } from "@contracts/funding";
import type { RoleProfile } from "@contracts/profile";
import {
  GetFundingSummariesForUser,
  ListFundingPageForRole,
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
    not: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockResolvedValue({ data, error: null, count: data.length }),
    limit: vi.fn().mockResolvedValue({ data, error: null }),
    then: vi.fn((resolve) =>
      Promise.resolve({ data, error: null, count: data.length }).then(resolve),
    ),
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

  it("scores the candidate set before applying the requested summary limit", async () => {
    const perfect = {
      ...baseItem,
      id: "funding-2",
      name: "Older Perfect Grant",
      eligibility: {
        province: "NB",
        revenue_min: 100000,
        revenue_max: 300000,
        employees_max: 25,
        industry: "technology",
      },
      created_at: "2026-01-01T00:00:00.000Z",
    };
    mocks.getRoleProfile.mockResolvedValue(businessProfile);
    mocks.createFundingReadClient.mockResolvedValue({
      from: vi.fn(() => createQuery([baseItem, perfect])),
    });

    const summaries = await GetFundingSummariesForUser("user-1", 1);

    expect(summaries).toHaveLength(1);
    expect(summaries[0].id).toBe("funding-2");
    expect(summaries[0].match_score).toBe(100);
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
    expect(query.eq).toHaveBeenCalledWith("type", "scholarship");
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

  it("caps category filters before building chained tag predicates", async () => {
    const query = createQuery([baseItem]);
    mocks.createFundingReadClient.mockResolvedValue({
      from: vi.fn(() => query),
    });

    await ListFundingForRole({
      role: "business",
      category: Array.from({ length: 20 }, (_, index) => `Tag${index}`).join(","),
    });

    expect(query.contains).toHaveBeenCalledTimes(12);
    expect(query.contains).not.toHaveBeenCalledWith("tags", ["Tag12"]);
  });

  it.each([
    ["business" as const, "business_grant"],
    ["student" as const, "scholarship"],
    ["professor" as const, "research_grant"],
  ])("always scopes %s listing queries by funding type", async (role, type) => {
    const query = createQuery([baseItem]);
    mocks.createFundingReadClient.mockResolvedValue({
      from: vi.fn(() => query),
    });

    await ListFundingForRole({ role });

    expect(query.eq).toHaveBeenCalledWith("type", type);
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

  it("paginates funding browser queries with narrow card fields", async () => {
    const query = createQuery([baseItem]);
    mocks.createFundingReadClient.mockResolvedValue({
      from: vi.fn(() => query),
    });

    const result = await ListFundingPageForRole({
      role: "student",
      page: 2,
      pageSize: 36,
    });

    expect(query.select).toHaveBeenCalledWith(
      "id,type,name,description,provider,amount_min,amount_max,deadline,category,tags",
      { count: "exact" },
    );
    expect(query.eq).toHaveBeenCalledWith("type", "scholarship");
    expect(query.range).toHaveBeenCalledWith(36, 71);
    expect(result).toMatchObject({
      items: [baseItem],
      totalCount: 1,
      page: 2,
      pageSize: 36,
      pageCount: 1,
    });
  });

  it("applies server-side search, categories, deadline, and sort filters", async () => {
    const query = createQuery([baseItem]);
    mocks.createFundingReadClient.mockResolvedValue({
      from: vi.fn(() => query),
    });

    await ListFundingPageForRole({
      role: "business",
      categories: ["Digital", "Federal"],
      deadline: "30",
      sort: "deadline",
      search: "%,status.eq.expired",
      pageSize: 100,
    });

    expect(query.contains).toHaveBeenCalledWith("tags", ["Digital"]);
    expect(query.contains).toHaveBeenCalledWith("tags", ["Federal"]);
    expect(query.not).toHaveBeenCalledWith("deadline", "is", null);
    expect(query.gte).toHaveBeenCalledWith("deadline", expect.any(String));
    expect(query.lte).toHaveBeenCalledWith("deadline", expect.any(String));
    expect(query.or).toHaveBeenCalledWith(
      "name.ilike.%status eq expired%,provider.ilike.%status eq expired%,description.ilike.%status eq expired%",
    );
    expect(query.order).toHaveBeenCalledWith("deadline", {
      ascending: true,
      nullsFirst: false,
    });
    expect(query.range).toHaveBeenCalledWith(0, 47);
  });

  it("sorts semantic ranked funding pages without dumping the full role corpus", async () => {
    const first = { ...baseItem, id: "first" };
    const second = { ...baseItem, id: "second" };
    const query = createQuery([second, first]);
    mocks.createFundingReadClient.mockResolvedValue({
      from: vi.fn(() => query),
    });

    const result = await ListFundingPageForRole({
      role: "business",
      semanticRankedIds: ["first", "second"],
      pageSize: 1,
    });

    expect(query.in).toHaveBeenCalledWith("id", ["first", "second"]);
    expect(query.range).not.toHaveBeenCalled();
    expect(result.items.map((item) => item.id)).toEqual(["first"]);
    expect(result.totalCount).toBe(2);
    expect(result.pageCount).toBe(2);
  });
});
