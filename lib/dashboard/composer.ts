import type { FundingSummary } from "@contracts/funding";
import type { Role } from "@contracts/role";
import type { FundingEnrichmentBundle } from "@/lib/funding/enrichment";
import type { ForumThread } from "@/lib/forum/queries";

export const EXPIRING_DEADLINE_WINDOW_DAYS = 30;
export const NO_UPCOMING_DEADLINES_TEXT = "No upcoming deadlines.";

export function isWithinNextDays(
  deadline: string | null,
  asOf: Date,
  windowDays: number,
): boolean {
  if (!deadline) return false;
  const dueMs = parseDeadlineDay(deadline);
  if (!Number.isFinite(dueMs)) return false;
  const nowMs = Date.UTC(
    asOf.getUTCFullYear(),
    asOf.getUTCMonth(),
    asOf.getUTCDate(),
  );
  const cutoffMs = nowMs + windowDays * 24 * 60 * 60 * 1000;
  return dueMs >= nowMs && dueMs <= cutoffMs;
}

function parseDeadlineDay(deadline: string): number {
  const isoDate = deadline.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDate) {
    const [, year, month, day] = isoDate;
    return Date.UTC(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) return Number.NaN;
  return Date.UTC(
    parsed.getUTCFullYear(),
    parsed.getUTCMonth(),
    parsed.getUTCDate(),
  );
}

export function selectUpcomingDeadlines(
  summaries: FundingSummary[],
  asOf: Date,
  windowDays: number = EXPIRING_DEADLINE_WINDOW_DAYS,
): FundingSummary[] {
  return summaries
    .filter((item) => isWithinNextDays(item.deadline, asOf, windowDays))
    .slice()
    .sort((a, b) => {
      const ad = a.deadline ? parseDeadlineDay(a.deadline) : Number.NaN;
      const bd = b.deadline ? parseDeadlineDay(b.deadline) : Number.NaN;
      if (!Number.isFinite(ad) && !Number.isFinite(bd)) return 0;
      if (!Number.isFinite(ad)) return 1;
      if (!Number.isFinite(bd)) return -1;
      return ad - bd;
    });
}

export interface DashboardData {
  topMatches: FundingSummary[];
  topMatchReasons: Record<string, string>;
  upcomingDeadlines: FundingSummary[];
  recentThreads: ForumThread[];
}

function roleLabel(role: Role) {
  if (role === "business") return "business";
  if (role === "student") return "student";
  return "research";
}

export function renderMatchReason(input: {
  role: Role;
  bundle: FundingEnrichmentBundle | null | undefined;
}): string | null {
  const templates = input.bundle?.match_reasons?.match_reason_templates;
  const template = templates?.[input.role] ?? templates?.default;
  if (typeof template !== "string") return null;

  return template.replaceAll("{role}", roleLabel(input.role));
}

export function composeDashboard(input: {
  topMatches: FundingSummary[];
  candidateDeadlines: FundingSummary[];
  threads: ForumThread[];
  asOf: Date;
  role?: Role;
  enrichmentByFundingId?: Record<string, FundingEnrichmentBundle>;
  forumLimit?: number;
}): DashboardData {
  const {
    topMatches,
    candidateDeadlines,
    threads,
    asOf,
    role,
    enrichmentByFundingId = {},
    forumLimit = 5,
  } = input;
  const topMatchReasons = role
    ? Object.fromEntries(
        topMatches
          .map((item) => [
            item.id,
            renderMatchReason({
              role,
              bundle: enrichmentByFundingId[item.id],
            }),
          ] as const)
          .filter((entry): entry is readonly [string, string] => Boolean(entry[1])),
      )
    : {};

  return {
    topMatches,
    topMatchReasons,
    upcomingDeadlines: selectUpcomingDeadlines(candidateDeadlines, asOf),
    recentThreads: threads.slice(0, forumLimit),
  };
}
