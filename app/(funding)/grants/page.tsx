import FundingBrowser, {
  type FundingBrowserDeadlineFilter,
  type FundingBrowserSortOption,
} from "@/components/funding/FundingBrowser";
import { ListFundingForRole } from "@/lib/funding/queries";
import { getRecommendedFundingTags } from "@/lib/funding/recommended-tags";
import {
  getSemanticSearchRankingForRole,
  rankFundingItemsBySemanticIds,
} from "@/lib/funding/semantic-search";
import { getSession } from "@/lib/session/get-session";

type SearchParams = Promise<{
  search?: string;
  category?: string | string[];
  deadline?: string;
  sort?: string;
}>;

function toArray(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parseDeadline(value: string | undefined): FundingBrowserDeadlineFilter {
  return value === "30" || value === "60" || value === "90" || value === "rolling"
    ? value
    : "all";
}

function parseSort(value: string | undefined): FundingBrowserSortOption {
  return value === "deadline" || value === "amount" || value === "newest"
    ? value
    : "relevance";
}

export default async function GrantsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [items, recommendedTags, session, semanticRanking] = await Promise.all([
    ListFundingForRole({ role: "business" }),
    getRecommendedFundingTags("business"),
    getSession(),
    getSemanticSearchRankingForRole({
      role: "business",
      query: params.search,
      limit: 100,
    }),
  ]);
  const rankedItems = semanticRanking.enabled
    ? rankFundingItemsBySemanticIds(items, semanticRanking.rankedIds)
    : items;

  return (
    <div className="auc-page min-h-screen pb-20">
      <section className="auc-reference-section pb-6 pt-14">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="auc-label">01 · Business funding</div>
            <h1 className="display mt-3 text-6xl leading-[0.92] tracking-[-0.035em] md:text-8xl">Business grants</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--auc-ink-2)]">
              Funding opportunities for growth, hiring, exports, digital adoption, innovation, and operations.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
            <span className="font-semibold text-gray-900">{rankedItems.length}</span> available
          </div>
        </div>
      </section>
      <div className="auc-reference-section">
        <FundingBrowser
          role="business"
          items={rankedItems}
          basePath="/grants"
          initialSearch={params.search}
          initialCategories={toArray(params.category)}
          initialDeadline={parseDeadline(params.deadline)}
          initialSort={parseSort(params.sort)}
          recommendedCategories={recommendedTags}
          semanticRankedIds={semanticRanking.enabled ? semanticRanking.rankedIds : []}
          showPersonalizationPrompt={!session}
        />
      </div>
    </div>
  );
}
