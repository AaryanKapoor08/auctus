import FundingBrowser, {
  type FundingBrowserDeadlineFilter,
  type FundingBrowserSortOption,
} from "@/components/funding/FundingBrowser";
import { ListFundingForRole } from "@/lib/funding/queries";
import { getEnrichmentForRole } from "@/lib/funding/enrichment";
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

export default async function ScholarshipsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const [items, recommendedTags, session, enrichmentByFundingId] = await Promise.all([
    ListFundingForRole({ role: "student" }),
    getRecommendedFundingTags("student"),
    getSession(),
    getEnrichmentForRole("student"),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Scholarships</h1>
            <p className="mt-2 text-lg text-gray-600">
              Scholarships, bursaries, and awards aligned to your studies.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
            <span className="font-semibold text-gray-900">{items.length}</span> available
          </div>
        </div>
        <FundingBrowser
          role="student"
          items={items}
          basePath="/scholarships"
          initialSearch={params.search}
          initialCategories={toArray(params.category)}
          initialDeadline={parseDeadline(params.deadline)}
          initialSort={parseSort(params.sort)}
          recommendedCategories={recommendedTags}
          showPersonalizationPrompt={!session}
          enrichmentByFundingId={enrichmentByFundingId}
        />
      </div>
    </div>
  );
}
