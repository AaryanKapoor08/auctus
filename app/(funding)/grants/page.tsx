import FundingBrowser from "@/components/funding/FundingBrowser";
import { ListFundingPageForRole } from "@/lib/funding/queries";
import { getRecommendedFundingTags } from "@/lib/funding/recommended-tags";
import {
  parseFundingPageSearchParams,
  type FundingPageSearchParams,
} from "@/lib/funding/search-input";
import { getSemanticSearchRankingForRole } from "@/lib/funding/semantic-search";
import { getSession } from "@/lib/session/get-session";

const PAGE_SIZE = 36;

export default async function GrantsPage({
  searchParams,
}: {
  searchParams: Promise<FundingPageSearchParams>;
}) {
  const params = await searchParams;
  const { search, categories, deadline, sort, page } =
    parseFundingPageSearchParams(params, "business");
  const [recommendedTags, session, semanticRanking] = await Promise.all([
    getRecommendedFundingTags("business"),
    getSession(),
    getSemanticSearchRankingForRole({
      role: "business",
      query: search,
      limit: 200,
    }),
  ]);
  const activeCategories = categories.length > 0 ? categories : recommendedTags;
  const fundingPage = await ListFundingPageForRole({
    role: "business",
    search,
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
            <h1 className="display mt-3 text-6xl leading-[0.92] tracking-[-0.035em] md:text-8xl">Business</h1>
            <p className="mt-4 max-w-none text-lg font-medium leading-8 text-[var(--auc-ink-2)] xl:whitespace-nowrap">
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
          key={`${search}:${activeCategories.join(",")}:${deadline}:${sort}:${fundingPage.page}`}
          role="business"
          items={fundingPage.items}
          totalCount={fundingPage.totalCount}
          page={fundingPage.page}
          pageCount={fundingPage.pageCount}
          basePath="/grants"
          initialSearch={search}
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
