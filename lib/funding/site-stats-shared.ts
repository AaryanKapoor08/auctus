import type { FundingType } from "@contracts/funding";

export type FundingFactRow = {
  type: FundingType;
  provider: string | null;
  amount_min: number | null;
  amount_max: number | null;
  deadline: string | null;
  tags: string[] | null;
  scraped_from: string | null;
};

export type FundingSiteStats = {
  totalOpen: number;
  providerCount: number;
  sourceCount: number;
  maxListedAmount: number | null;
  byType: Record<FundingType, number>;
  topTagsByType: Record<FundingType, string[]>;
  quality: {
    activePastDeadlineCount: number;
    invalidAmountRangeCount: number;
  };
  checkedAt: string;
};

const FUNDING_TYPES: FundingType[] = [
  "business_grant",
  "scholarship",
  "research_grant",
];

const PREFERRED_LANE_TAGS: Record<FundingType, string[]> = {
  business_grant: ["Digital", "Growth", "Federal", "Women"],
  scholarship: ["Graduate", "Merit-based", "STEM", "Need-based"],
  research_grant: ["SSHRC", "NSERC", "Partnership", "Equipment"],
};

const GENERIC_TAGS = new Set([
  "Business",
  "Grant",
  "Professor",
  "Research",
  "Scholarship",
  "Student",
]);

export const EMPTY_FUNDING_SITE_STATS: FundingSiteStats = {
  totalOpen: 0,
  providerCount: 0,
  sourceCount: 0,
  maxListedAmount: null,
  byType: {
    business_grant: 0,
    scholarship: 0,
    research_grant: 0,
  },
  topTagsByType: {
    business_grant: [],
    scholarship: [],
    research_grant: [],
  },
  quality: {
    activePastDeadlineCount: 0,
    invalidAmountRangeCount: 0,
  },
  checkedAt: new Date(0).toISOString(),
};

function normalizeDateOnly(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function isPastDeadline(deadline: string | null, asOf: Date) {
  if (!deadline) return false;

  const parsed = new Date(`${deadline}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return false;

  return parsed < normalizeDateOnly(asOf);
}

function selectDisplayTags(
  type: FundingType,
  counts: Map<string, number>,
): string[] {
  const preferred = PREFERRED_LANE_TAGS[type].filter((tag) => counts.has(tag));
  const preferredSet = new Set(preferred);
  const fallback = [...counts.entries()]
    .filter(([tag]) => !preferredSet.has(tag) && !GENERIC_TAGS.has(tag))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);

  return [...preferred, ...fallback].slice(0, 4);
}

export function aggregateFundingFactRows(
  rows: FundingFactRow[],
  asOf: Date = new Date(),
): FundingSiteStats {
  const providers = new Set<string>();
  const sources = new Set<string>();
  const tagCountsByType = new Map<FundingType, Map<string, number>>();
  const byType = { ...EMPTY_FUNDING_SITE_STATS.byType };
  let maxListedAmount: number | null = null;
  let activePastDeadlineCount = 0;
  let invalidAmountRangeCount = 0;

  for (const type of FUNDING_TYPES) {
    tagCountsByType.set(type, new Map());
  }

  for (const row of rows) {
    byType[row.type] += 1;

    if (row.provider) providers.add(row.provider);
    if (row.scraped_from) sources.add(row.scraped_from);

    const amount = Math.max(row.amount_min ?? 0, row.amount_max ?? 0);
    if (amount > 0) {
      maxListedAmount =
        maxListedAmount === null ? amount : Math.max(maxListedAmount, amount);
    }

    if (
      row.amount_min !== null &&
      row.amount_max !== null &&
      row.amount_min > row.amount_max
    ) {
      invalidAmountRangeCount += 1;
    }

    if (isPastDeadline(row.deadline, asOf)) {
      activePastDeadlineCount += 1;
    }

    const tagCounts = tagCountsByType.get(row.type);
    if (!tagCounts) continue;

    for (const tag of row.tags ?? []) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    }
  }

  return {
    totalOpen: rows.length,
    providerCount: providers.size,
    sourceCount: sources.size,
    maxListedAmount,
    byType,
    topTagsByType: {
      business_grant: selectDisplayTags(
        "business_grant",
        tagCountsByType.get("business_grant") ?? new Map(),
      ),
      scholarship: selectDisplayTags(
        "scholarship",
        tagCountsByType.get("scholarship") ?? new Map(),
      ),
      research_grant: selectDisplayTags(
        "research_grant",
        tagCountsByType.get("research_grant") ?? new Map(),
      ),
    },
    quality: {
      activePastDeadlineCount,
      invalidAmountRangeCount,
    },
    checkedAt: asOf.toISOString(),
  };
}

export function formatFundingStatNumber(value: number) {
  return value.toLocaleString("en-CA");
}

export function formatFundingStatCurrency(value: number | null) {
  return value && value > 0 ? `$${value.toLocaleString("en-CA")}` : "Varies";
}

export function buildFundingMetricTickerItems(stats: FundingSiteStats) {
  return [
    `${formatFundingStatNumber(stats.totalOpen)} open opportunities`,
    `${formatFundingStatNumber(stats.providerCount)} providers indexed`,
    `${formatFundingStatNumber(stats.byType.business_grant)} grants`,
    `${formatFundingStatNumber(stats.byType.scholarship)} scholarships`,
    `${formatFundingStatNumber(stats.byType.research_grant)} research funds`,
  ];
}

export function buildFundingNewsTickerItems(stats: FundingSiteStats) {
  return [
    `${formatFundingStatNumber(stats.totalOpen)} active opportunities indexed`,
    `${formatFundingStatNumber(stats.providerCount)} Canadian providers indexed`,
    `${formatFundingStatNumber(stats.byType.business_grant)} business grants`,
    `${formatFundingStatNumber(stats.byType.scholarship)} scholarships`,
    `${formatFundingStatNumber(stats.byType.research_grant)} research funds`,
    `${formatFundingStatCurrency(stats.maxListedAmount)} largest listed value`,
  ];
}
