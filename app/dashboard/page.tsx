import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Calendar,
  Clock3,
  DollarSign,
  FlaskConical,
  GraduationCap,
  ListChecks,
  MessageSquare,
  Target,
  UserRound,
} from "lucide-react";
import { ROLE_DEFAULT_ROUTE, type Role } from "@contracts/role";
import type { FundingItem, FundingSummary } from "@contracts/funding";
import type { RoleProfile } from "@contracts/profile";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { getSession } from "@/lib/session/get-session";
import { GetFundingSummariesForUser, ListFundingForRole } from "@/lib/funding/queries";
import { getFundingSiteStats } from "@/lib/funding/site-stats";
import { getFundingTypeForRole } from "@/lib/funding/role-mapping";
import { getFundingRadarForRole } from "@/lib/funding/enrichment";
import { listThreads } from "@/lib/forum/queries";
import {
  EXPIRING_DEADLINE_WINDOW_DAYS,
  NO_UPCOMING_DEADLINES_TEXT,
  composeDashboard,
} from "@/lib/dashboard/composer";
import { getRoleProfile } from "@/lib/profile/queries";

export const dynamic = "force-dynamic";

const TOP_MATCHES_LIMIT = 6;
const FUNDING_CANDIDATE_LIMIT = 80;
const FUNDING_INVENTORY_LIMIT = 200;

const ROLE_DASHBOARD: Record<
  Role,
  {
    eyebrow: string;
    title: string;
    description: string;
    primaryLabel: string;
    matchesLabel: string;
    inventoryLabel: string;
    icon: typeof BriefcaseBusiness;
  }
> = {
  business: {
    eyebrow: "Business funding",
    title: "Grant command centre",
    description:
      "Track business grants, advisory programs, and growth funding that match your company profile.",
    primaryLabel: "Browse grants",
    matchesLabel: "Grant matches",
    inventoryLabel: "Active grants",
    icon: BriefcaseBusiness,
  },
  student: {
    eyebrow: "Student funding",
    title: "Scholarship workspace",
    description:
      "Review scholarships and bursaries aligned with your study profile, province, and award preferences.",
    primaryLabel: "Browse scholarships",
    matchesLabel: "Scholarship matches",
    inventoryLabel: "Active scholarships",
    icon: GraduationCap,
  },
  professor: {
    eyebrow: "Research funding",
    title: "Research funding board",
    description:
      "Monitor research grants, council programs, and partnership funding tied to your research profile.",
    primaryLabel: "Browse research funding",
    matchesLabel: "Research matches",
    inventoryLabel: "Active research funds",
    icon: FlaskConical,
  },
};

function formatDate(value: string | null): string {
  if (!value) return "Rolling";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(value: number | null): string {
  if (value === null) return "Not listed";
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
    notation: value >= 1000000 ? "compact" : "standard",
  }).format(value);
}

function fundingHref(item: Pick<FundingSummary, "id" | "type">) {
  if (item.type === "business_grant") return `/grants/${item.id}`;
  if (item.type === "scholarship") return `/scholarships/${item.id}`;
  return `/research-funding/${item.id}`;
}

function scoreVariant(score: number | null) {
  if (score === null) return "default";
  if (score >= 70) return "success";
  if (score >= 45) return "info";
  return "warning";
}

function daysUntil(deadline: string | null, asOf: Date): number | null {
  if (!deadline) return null;
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return null;
  const start = Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), asOf.getUTCDate());
  const due = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  return Math.ceil((due - start) / (24 * 60 * 60 * 1000));
}

function getProfileHighlights(roleProfile: RoleProfile | null): Array<[string, string]> {
  if (!roleProfile) return [];

  if (roleProfile.role === "business") {
    const details = roleProfile.details;
    return [
      ["Business", details.business_name],
      ["Focus", details.industry ?? "Not set"],
      ["Location", details.location ?? "Not set"],
      ["Employees", details.employees === null ? "Not set" : String(details.employees)],
    ];
  }

  if (roleProfile.role === "student") {
    const details = roleProfile.details;
    return [
      ["Education", details.education_level ?? "Not set"],
      ["Field", details.field_of_study ?? "Not set"],
      ["Province", details.province ?? "Not set"],
      ["Institution", details.institution ?? "Not set"],
    ];
  }

  const details = roleProfile.details;
  return [
    ["Institution", details.institution ?? "Not set"],
    ["Research area", details.research_area ?? "Not set"],
    ["Career stage", details.career_stage ?? "Not set"],
    [
      "Keywords",
      details.research_keywords.length > 0 ? details.research_keywords.join(", ") : "Not set",
    ],
  ];
}

function getNextDeadlines(
  items: FundingItem[],
  asOf: Date,
  limit = 4,
  windowDays?: number,
) {
  return items
    .map((item) => ({ item, days: daysUntil(item.deadline, asOf) }))
    .filter((entry): entry is { item: FundingItem; days: number } => entry.days !== null && entry.days >= 0)
    .filter((entry) => windowDays === undefined || entry.days <= windowDays)
    .sort((a, b) => a.days - b.days)
    .slice(0, limit);
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <Card>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--auc-ink)] text-white">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--auc-ink-2)]">{label}</p>
          <p className="display mt-1 text-3xl leading-none text-[var(--auc-ink)]">{value}</p>
          <p className="mt-2 text-sm text-[var(--auc-muted)]">{detail}</p>
        </div>
      </div>
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }
  if (!session.role) {
    redirect("/onboarding");
  }

  const asOf = new Date();
  const [
    fundingSummaries,
    allRoleFunding,
    threads,
    roleProfile,
    fundingRadar,
    fundingStats,
  ] = await Promise.all([
    GetFundingSummariesForUser(session.user_id, FUNDING_CANDIDATE_LIMIT),
    ListFundingForRole({ role: session.role, status: "active", limit: FUNDING_INVENTORY_LIMIT }),
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

  const fundingHomeRoute = ROLE_DEFAULT_ROUTE[session.role];
  const roleFundingType = getFundingTypeForRole(session.role);
  const roleCopy = ROLE_DASHBOARD[session.role];
  const RoleIcon = roleCopy.icon;
  const displayName = roleProfile?.base.display_name ?? session.role;
  const currentDate = new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(asOf);
  const strongMatches = fundingSummaries.filter((item) => (item.match_score ?? 0) >= 45);
  const bestScore = fundingSummaries[0]?.match_score;
  const trackCount = fundingStats.byType[roleFundingType];
  const maxAmount = fundingStats.maxListedAmountByType[roleFundingType];
  const rollingCount = fundingStats.rollingByType[roleFundingType];
  const deadlineCount = fundingStats.withDeadlinesByType[roleFundingType];
  const upcoming30Count = fundingStats.upcoming30ByType[roleFundingType];
  const nextDeadlines = getNextDeadlines(
    allRoleFunding,
    asOf,
    4,
    EXPIRING_DEADLINE_WINDOW_DAYS,
  );
  const trackTags = fundingStats.topTagsByType[roleFundingType];
  const profileHighlights = getProfileHighlights(roleProfile);

  return (
    <main className="auc-page min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="auc-card mb-8 overflow-hidden p-0">
          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_340px] lg:p-8">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-[var(--auc-ink)] bg-[var(--auc-lime)] px-3 py-1 text-sm font-black text-[var(--auc-ink)]">
                <RoleIcon className="h-4 w-4" />
                {roleCopy.eyebrow}
              </div>
              <h1 className="display text-5xl leading-none text-[var(--auc-ink)] md:text-6xl">
                {roleCopy.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--auc-ink-2)]">
                Welcome back, {displayName}. {roleCopy.description}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-bold text-[var(--auc-ink-2)]">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {currentDate}
                </span>
                <span className="inline-flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  {trackCount} opportunities in your track
                </span>
              </div>
            </div>

            <div className="rounded-[14px] border-2 border-[var(--auc-ink)] bg-[var(--auc-bg)] p-4">
              <p className="auc-label">Best current match</p>
              <p className="display mt-2 text-5xl leading-none text-[var(--auc-ink)]">
                {bestScore === null || bestScore === undefined ? "New" : `${bestScore}%`}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--auc-ink-2)]">
                {data.topMatches[0]?.name ?? "Complete your profile to improve recommendations."}
              </p>
              <Link href={fundingHomeRoute} className="mt-5 block">
                <Button className="w-full gap-2">
                  <Target className="h-4 w-4" />
                  {roleCopy.primaryLabel}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Award}
            label={roleCopy.matchesLabel}
            value={String(strongMatches.length)}
            detail="Scored at 45% or higher"
          />
          <StatCard
            icon={BookOpen}
            label={roleCopy.inventoryLabel}
            value={String(trackCount)}
            detail={`${rollingCount} rolling or ongoing`}
          />
          <StatCard
            icon={Clock3}
            label="30-day deadlines"
            value={String(upcoming30Count)}
            detail="Across all active records"
          />
          <StatCard
            icon={DollarSign}
            label="Largest listed amount"
            value={formatCurrency(maxAmount)}
            detail="Among active opportunities"
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-6">
            <Card
              header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="display text-3xl leading-none text-[var(--auc-ink)]">Recommended for you</h2>
                    <p className="mt-2 text-sm text-[var(--auc-ink-2)]">
                      Ranked from your onboarding profile and available funding tags.
                    </p>
                  </div>
                  <Link href={fundingHomeRoute} className="text-sm font-black text-[var(--auc-ink)] hover:underline">
                    View all
                  </Link>
                </div>
              }
            >
              {data.topMatches.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[var(--auc-rule-strong)] p-6 text-sm text-[var(--auc-ink-2)]">
                  No matches yet. Update your profile details to improve recommendations.
                </div>
              ) : (
                <ul className="space-y-3">
                  {data.topMatches.map((item) => (
                    <li key={item.id} className="rounded-lg border border-[var(--auc-rule)] bg-white p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <Link
                            href={fundingHref(item)}
                            className="text-lg font-black text-[var(--auc-ink)] hover:underline"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-1 text-sm text-[var(--auc-muted)]">{item.provider}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Badge variant={scoreVariant(item.match_score)}>
                              {item.match_score === null ? "Unscored" : `${item.match_score}% match`}
                            </Badge>
                            <Badge color="gray">{formatCurrency(item.amount_max)}</Badge>
                            <Badge color="gray">Deadline: {formatDate(item.deadline)}</Badge>
                          </div>
                        </div>
                        <Link
                          href={fundingHref(item)}
                          className="inline-flex shrink-0 items-center gap-2 rounded-full border-2 border-[var(--auc-ink)] px-3 py-2 text-sm font-black text-[var(--auc-ink)] hover:bg-[var(--auc-bg-warm)]"
                        >
                          Details
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card
              header={<h2 className="display text-3xl leading-none text-[var(--auc-ink)]">Deadline outlook</h2>}
            >
              {upcoming30Count === 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="font-black text-[var(--auc-ink)]">{NO_UPCOMING_DEADLINES_TEXT}</p>
                    <p className="mt-2 text-sm text-[var(--auc-ink-2)]">
                      Nothing in your track closes within the next {EXPIRING_DEADLINE_WINDOW_DAYS} days.
                    </p>
                  </div>
                  <div className="rounded-lg border border-[var(--auc-rule)] bg-[var(--auc-bg)] p-4">
                    <p className="text-sm font-bold text-[var(--auc-ink-2)]">Next known deadlines</p>
                    {nextDeadlines.length === 0 ? (
                      <p className="mt-2 text-sm text-[var(--auc-ink-2)]">
                        Most visible opportunities are rolling or do not publish a deadline.
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {nextDeadlines.slice(0, 3).map(({ item, days }) => (
                          <li key={item.id} className="text-sm">
                            <Link href={fundingHref(item)} className="font-black text-[var(--auc-ink)] hover:underline">
                              {item.name}
                            </Link>
                            <p className="text-[var(--auc-ink-2)]">
                              {formatDate(item.deadline)} · {days === 0 ? "today" : `${days} days`}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="mb-3 text-sm text-[var(--auc-ink-2)]">
                    {upcoming30Count} active opportunit{upcoming30Count === 1 ? "y" : "ies"} close within the next {EXPIRING_DEADLINE_WINDOW_DAYS} days.
                  </p>
                  {nextDeadlines.length === 0 ? (
                    <Link href={fundingHomeRoute} className="font-black text-[var(--auc-ink)] hover:underline">
                      Open the browser to review current deadlines.
                    </Link>
                  ) : (
                    <ul className="grid gap-3 md:grid-cols-2">
                      {nextDeadlines.map(({ item, days }) => (
                        <li key={item.id} className="rounded-lg border border-[var(--auc-coral)] bg-[var(--auc-coral-soft)] p-4">
                          <Link href={fundingHref(item)} className="font-black text-[var(--auc-ink)] hover:underline">
                            {item.name}
                          </Link>
                          <p className="mt-1 text-sm text-[var(--auc-ink-2)]">{item.provider}</p>
                          <p className="mt-3 text-sm font-black text-[#912f26]">
                            Due {formatDate(item.deadline)} · {days === 0 ? "today" : `${days} days`}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </Card>
          </section>

          <aside className="space-y-6">
            <Card
              header={
                <div className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 text-[var(--auc-ink)]" />
                  <h2 className="display text-2xl leading-none text-[var(--auc-ink)]">Matching profile</h2>
                </div>
              }
            >
              <dl className="space-y-3">
                {profileHighlights.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-[var(--auc-rule)] pb-3 last:border-0 last:pb-0">
                    <dt className="text-sm text-[var(--auc-ink-2)]">{label}</dt>
                    <dd className="max-w-44 text-right text-sm font-black text-[var(--auc-ink)]">{value}</dd>
                  </div>
                ))}
              </dl>
              <Link href="/profile/edit" className="mt-5 block">
                <Button variant="outline" className="w-full">Edit profile</Button>
              </Link>
            </Card>

            <Card
              header={
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[var(--auc-ink)]" />
                  <h2 className="display text-2xl leading-none text-[var(--auc-ink)]">Opportunity mix</h2>
                </div>
              }
            >
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-[var(--auc-bg)] p-3">
                  <p className="text-[var(--auc-ink-2)]">With deadlines</p>
                  <p className="display mt-1 text-3xl leading-none text-[var(--auc-ink)]">
                    {deadlineCount}
                  </p>
                </div>
                <div className="rounded-lg bg-[var(--auc-bg)] p-3">
                  <p className="text-[var(--auc-ink-2)]">Rolling</p>
                  <p className="display mt-1 text-3xl leading-none text-[var(--auc-ink)]">{rollingCount}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-bold text-[var(--auc-ink)]">Common live tags</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {trackTags.length === 0 ? (
                    <span className="text-sm text-[var(--auc-ink-2)]">No tags available yet.</span>
                  ) : (
                    trackTags.map((tag) => (
                      <Badge key={tag} color="gray">
                        {tag}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </Card>

            {fundingRadar.insights.length > 0 && (
              <Card
                className="border border-gray-200"
                header={
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-gray-700" />
                    <h2 className="text-xl font-bold text-gray-950">Funding radar</h2>
                  </div>
                }
              >
                <dl className="space-y-3">
                  {fundingRadar.insights.map((insight) => (
                    <div
                      key={insight.key}
                      className="border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                    >
                      <dt className="text-sm font-medium text-gray-950">
                        {insight.label}
                      </dt>
                      <dd className="mt-1 flex items-start justify-between gap-4">
                        <span className="text-sm text-gray-600">{insight.detail}</span>
                        <span className="shrink-0 text-lg font-bold text-gray-950">
                          {insight.value}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </Card>
            )}

            <Card
              header={
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[var(--auc-ink)]" />
                  <h2 className="display text-2xl leading-none text-[var(--auc-ink)]">Forum activity</h2>
                </div>
              }
            >
              {data.recentThreads.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--auc-ink-2)]">No forum activity yet.</p>
                  <Link href="/forum/new" className="text-sm font-black text-[var(--auc-ink)] hover:underline">
                    Start a thread
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {data.recentThreads.slice(0, 4).map((thread) => (
                    <li key={thread.id} className="border-b border-[var(--auc-rule)] pb-3 last:border-0 last:pb-0">
                      <Link href={`/forum/${thread.id}`} className="font-black text-[var(--auc-ink)] hover:underline">
                        {thread.title}
                      </Link>
                      <p className="mt-1 text-xs text-[var(--auc-muted)]">
                        {thread.category} · {thread.reply_count} repl{thread.reply_count === 1 ? "y" : "ies"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
