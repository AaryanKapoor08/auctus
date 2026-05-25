import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FundingSummary } from "@contracts/funding";
import { EMPTY_FUNDING_SITE_STATS } from "@/lib/funding/site-stats-shared";
import { loadDashboard } from "@/lib/dashboard/load-dashboard";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  GetFundingSummariesForUser: vi.fn(),
  getFundingSiteStats: vi.fn(),
  getFundingRadarForRole: vi.fn(),
  listThreads: vi.fn(),
  getRoleProfile: vi.fn(),
}));

vi.mock("@/lib/session/get-session", () => ({
  getSession: mocks.getSession,
}));

vi.mock("@/lib/funding/queries", () => ({
  GetFundingSummariesForUser: mocks.GetFundingSummariesForUser,
}));

vi.mock("@/lib/funding/site-stats", () => ({
  getFundingSiteStats: mocks.getFundingSiteStats,
}));

vi.mock("@/lib/funding/enrichment", () => ({
  getFundingRadarForRole: mocks.getFundingRadarForRole,
}));

vi.mock("@/lib/forum/queries", () => ({
  listThreads: mocks.listThreads,
}));

vi.mock("@/lib/profile/queries", () => ({
  getRoleProfile: mocks.getRoleProfile,
}));

function summary(partial: Partial<FundingSummary> & { id: string }): FundingSummary {
  return {
    id: partial.id,
    type: partial.type ?? "scholarship",
    name: partial.name ?? `Funding ${partial.id}`,
    provider: partial.provider ?? "Provider",
    amount_max: partial.amount_max ?? null,
    deadline: partial.deadline ?? null,
    match_score: partial.match_score ?? null,
  };
}

describe("loadDashboard", () => {
  const asOf = new Date("2026-05-25T12:00:00.000Z");

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.GetFundingSummariesForUser.mockResolvedValue([]);
    mocks.getFundingSiteStats.mockResolvedValue(EMPTY_FUNDING_SITE_STATS);
    mocks.getFundingRadarForRole.mockResolvedValue({ coverage: 1, insights: [] });
    mocks.listThreads.mockResolvedValue([]);
    mocks.getRoleProfile.mockResolvedValue(null);
  });

  it("returns a signed-out state without loading dashboard data", async () => {
    mocks.getSession.mockResolvedValue(null);

    await expect(loadDashboard(asOf)).resolves.toEqual({ status: "signed_out" });
    expect(mocks.GetFundingSummariesForUser).not.toHaveBeenCalled();
  });

  it("returns an onboarding state for signed-in users without a role", async () => {
    const session = { user_id: "user-1", role: null };
    mocks.getSession.mockResolvedValue(session);

    await expect(loadDashboard(asOf)).resolves.toEqual({
      status: "needs_onboarding",
      session,
    });
    expect(mocks.GetFundingSummariesForUser).not.toHaveBeenCalled();
  });

  it("loads the dashboard through narrow runtime helpers", async () => {
    mocks.getSession.mockResolvedValue({ user_id: "user-1", role: "student" });
    mocks.GetFundingSummariesForUser.mockResolvedValue([
      summary({ id: "far", deadline: "2026-08-01", match_score: 70 }),
      summary({ id: "soon", deadline: "2026-05-31", match_score: 60 }),
    ]);

    const result = await loadDashboard(asOf);

    expect(result.status).toBe("ready");
    if (result.status !== "ready") return;
    expect(result.data.topMatches.map((item) => item.id)).toEqual(["far", "soon"]);
    expect(result.data.upcomingDeadlines.map((item) => item.id)).toEqual(["soon"]);
    expect(mocks.GetFundingSummariesForUser).toHaveBeenCalledWith("user-1", 80);
    expect(mocks.listThreads).toHaveBeenCalledWith({ limit: 5 });
    expect(mocks.getRoleProfile).toHaveBeenCalledWith("user-1");
    expect(mocks.getFundingRadarForRole).toHaveBeenCalledWith("student", { asOf });
  });
});
