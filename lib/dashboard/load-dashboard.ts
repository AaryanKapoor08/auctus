import "server-only";

import type { Role } from "@contracts/role";
import type { FundingSummary } from "@contracts/funding";
import type { RoleProfile } from "@contracts/profile";
import type { Session } from "@contracts/session";
import { getFundingRadarForRole, type FundingRadar } from "@/lib/funding/enrichment";
import { GetFundingSummariesForUser } from "@/lib/funding/queries";
import { getFundingSiteStats } from "@/lib/funding/site-stats";
import type { FundingSiteStats } from "@/lib/funding/site-stats-shared";
import { listThreads, type ForumThread } from "@/lib/forum/queries";
import { getRoleProfile } from "@/lib/profile/queries";
import { getSession } from "@/lib/session/get-session";
import { timeServer } from "@/lib/perf/server-timing";
import { composeDashboard, type DashboardData } from "./composer";

const TOP_MATCHES_LIMIT = 6;
const FUNDING_CANDIDATE_LIMIT = 80;

export type DashboardLoadResult =
  | { status: "signed_out" }
  | { status: "needs_onboarding"; session: Session }
  | {
      status: "ready";
      session: Session & { role: Role };
      asOf: Date;
      fundingSummaries: FundingSummary[];
      threads: ForumThread[];
      roleProfile: RoleProfile | null;
      fundingRadar: FundingRadar;
      fundingStats: FundingSiteStats;
      data: DashboardData;
    };

export async function loadDashboard(
  asOf: Date = new Date(),
): Promise<DashboardLoadResult> {
  return timeServer("loadDashboard", async () => {
    const session = await getSession();

    if (!session) {
      return { status: "signed_out" };
    }

    if (!session.role) {
      return { status: "needs_onboarding", session };
    }

    const [
      fundingSummaries,
      threads,
      roleProfile,
      fundingRadar,
      fundingStats,
    ] = await Promise.all([
      GetFundingSummariesForUser(session.user_id, FUNDING_CANDIDATE_LIMIT),
      listThreads({ limit: 5 }),
      getRoleProfile(session.user_id),
      getFundingRadarForRole(session.role, { asOf }),
      getFundingSiteStats(),
    ]);

    const data = composeDashboard({
      topMatches: fundingSummaries.slice(0, TOP_MATCHES_LIMIT),
      candidateDeadlines: fundingSummaries,
      threads,
      asOf,
    });

    return {
      status: "ready",
      session: session as Session & { role: Role },
      asOf,
      fundingSummaries,
      threads,
      roleProfile,
      fundingRadar,
      fundingStats,
      data,
    };
  });
}
