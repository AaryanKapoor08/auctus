import FundingBrowser, {
  type FundingBrowserDeadlineFilter,
  type FundingBrowserSortOption,
} from "@/components/funding/FundingBrowser";
import { ListFundingForRole } from "@/lib/funding/queries";
import { getRecommendedFundingTags } from "@/lib/funding/recommended-tags";
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

export default async function ResearchFundingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [items, recommendedTags, session] = await Promise.all([
    ListFundingForRole({ role: "professor" }),
    getRecommendedFundingTags("professor"),
    getSession(),
  ]);

  return (
    <div className="auc-page min-h-screen pb-20">
      <section className="auc-reference-section pb-6 pt-14">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="auc-label">03 · Research funding</div>
            <h1 className="display mt-3 text-6xl leading-[0.92] tracking-[-0.035em] md:text-8xl">Research funding</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--auc-ink-2)]">
              Research grants, equipment funds, training programs, and partnership opportunities.
            </p>
          </div>
          <div className="rounded-[14px] bg-[var(--auc-ink)] px-5 py-4 text-white">
            <span className="display text-4xl leading-none">{items.length.toLocaleString("en-CA")}</span>
            <span className="mono ml-2 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-white/60">
              loaded
            </span>
          </div>
        </div>
      </section>
      <div className="auc-reference-section">
        <FundingBrowser
          role="professor"
          items={items}
          basePath="/research-funding"
          initialSearch={params.search}
          initialCategories={toArray(params.category)}
          initialDeadline={parseDeadline(params.deadline)}
          initialSort={parseSort(params.sort)}
          recommendedCategories={recommendedTags}
          showPersonalizationPrompt={!session}
        />
      </div>
    </div>
  );
}
