import FundingBrowser, {
  type FundingBrowserDeadlineFilter,
  type FundingBrowserSortOption,
} from "@/components/funding/FundingBrowser";
import { ListFundingPageForRole } from "@/lib/funding/queries";
import { getRecommendedFundingTags } from "@/lib/funding/recommended-tags";
import { getSemanticSearchRankingForRole } from "@/lib/funding/semantic-search";
import { getSession } from "@/lib/session/get-session";

type SearchParams = Promise<{
  search?: string;
  category?: string | string[];
  deadline?: string;
  sort?: string;
  page?: string;
}>;

const PAGE_SIZE = 36;

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

function parsePage(value: string | undefined) {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export default async function GrantsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const categories = toArray(params.category);
  const deadline = parseDeadline(params.deadline);
  const sort = parseSort(params.sort);
  const page = parsePage(params.page);
  const [recommendedTags, session, semanticRanking] = await Promise.all([
    getRecommendedFundingTags("business"),
    getSession(),
    getSemanticSearchRankingForRole({
      role: "business",
      query: params.search,
      limit: 200,
    }),
  ]);
  const activeCategories = categories.length > 0 ? categories : recommendedTags;
  const fundingPage = await ListFundingPageForRole({
    role: "business",
    search: params.search,
    categories: activeCategories,
    deadline,
    sort,
    page,
    pageSize: PAGE_SIZE,
    semanticRankedIds: semanticRanking.enabled ? semanticRanking.rankedIds : [],
  });

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
            <span className="font-semibold text-gray-900">{fundingPage.totalCount}</span> available
          </div>
        </div>
      </section>
      <div className="auc-reference-section">
        <FundingBrowser
          key={`${params.search ?? ""}:${activeCategories.join(",")}:${deadline}:${sort}:${fundingPage.page}`}
          role="business"
          items={fundingPage.items}
          totalCount={fundingPage.totalCount}
          page={fundingPage.page}
          pageCount={fundingPage.pageCount}
          basePath="/grants"
          initialSearch={params.search}
          initialCategories={activeCategories}
          initialDeadline={deadline}
          initialSort={sort}
          recommendedCategories={recommendedTags}
          showPersonalizationPrompt={!session}
        />
      </div>
    </div>
  );
}
