"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import type { Role } from "@contracts/role";
import { FUNDING_FILTERS } from "@/lib/funding/filter-definitions";
import Button from "@/components/ui/Button";
import FundingCard, { type FundingCardItem } from "./FundingCard";
import { cn } from "@/lib/utils";

type DeadlineFilter = "all" | "30" | "60" | "90" | "rolling";
type SortOption = "relevance" | "deadline" | "amount" | "newest";

export type FundingBrowserDeadlineFilter = DeadlineFilter;
export type FundingBrowserSortOption = SortOption;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function toQueryString(input: {
  search: string;
  selectedTags: string[];
  deadline: DeadlineFilter;
  sort: SortOption;
  page: number;
}) {
  const params = new URLSearchParams();
  if (input.search) params.set("search", input.search);
  input.selectedTags.forEach((tag) => params.append("category", tag));
  if (input.deadline !== "all") params.set("deadline", input.deadline);
  if (input.sort !== "relevance") params.set("sort", input.sort);
  if (input.page > 1) params.set("page", String(input.page));
  return params.toString();
}

export default function FundingBrowser({
  role,
  items,
  totalCount,
  page,
  pageCount,
  basePath,
  initialSearch = "",
  initialCategories = [],
  initialDeadline = "all",
  initialSort = "relevance",
  recommendedCategories = [],
  showPersonalizationPrompt = false,
}: {
  role: Role;
  items: FundingCardItem[];
  totalCount: number;
  page: number;
  pageCount: number;
  basePath: string;
  initialSearch?: string;
  initialCategories?: string[];
  initialDeadline?: DeadlineFilter;
  initialSort?: SortOption;
  recommendedCategories?: string[];
  showPersonalizationPrompt?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const filters = FUNDING_FILTERS[role];
  const categoryFilter = filters.find((filter) => filter.key === "category");
  const options = useMemo(() => categoryFilter?.options ?? [], [categoryFilter]);
  const optionGroups = useMemo(() => {
    const groups = new Map<string, typeof options>();
    for (const option of options) {
      const group = option.group ?? "Other";
      groups.set(group, [...(groups.get(group) ?? []), option]);
    }
    return Array.from(groups.entries());
  }, [options]);
  const optionValues = useMemo(
    () => new Set(options.map((option) => option.value)),
    [options],
  );
  const profileCategories = useMemo(
    () => recommendedCategories.filter((tag) => optionValues.has(tag)),
    [optionValues, recommendedCategories],
  );
  const startingCategories =
    initialCategories.length > 0 ? initialCategories : profileCategories;

  const [searchDraft, setSearchDraft] = useState(initialSearch);
  const [search, setSearch] = useState(initialSearch);
  const [selectedTags, setSelectedTags] = useState<string[]>(startingCategories);
  const [deadline, setDeadline] = useState<DeadlineFilter>(initialDeadline);
  const [sort, setSort] = useState<SortOption>(initialSort);

  const recommendedSet = useMemo(
    () => new Set(profileCategories.map(normalize)),
    [profileCategories],
  );

  function navigate(input: {
    search?: string;
    selectedTags?: string[];
    deadline?: DeadlineFilter;
    sort?: SortOption;
    page?: number;
  }) {
    const query = toQueryString({
      search: input.search ?? search,
      selectedTags: input.selectedTags ?? selectedTags,
      deadline: input.deadline ?? deadline,
      sort: input.sort ?? sort,
      page: input.page ?? page,
    });
    const href = query ? `${basePath}?${query}` : basePath;
    startTransition(() => router.push(href));
  }

  function toggleTag(tag: string) {
    const nextTags = selectedTags.includes(tag)
      ? selectedTags.filter((value) => value !== tag)
      : [...selectedTags, tag];
    setSelectedTags(nextTags);
    navigate({ selectedTags: nextTags, page: 1 });
  }

  function clearFilters() {
    setSearch("");
    setSearchDraft("");
    setSelectedTags([]);
    setDeadline("all");
    setSort("relevance");
    navigate({
      search: "",
      selectedTags: [],
      deadline: "all",
      sort: "relevance",
      page: 1,
    });
  }

  function useProfileFilters() {
    setSelectedTags(profileCategories);
    setSort("relevance");
    navigate({ selectedTags: profileCategories, sort: "relevance", page: 1 });
  }

  const hasFilters =
    search || selectedTags.length > 0 || deadline !== "all" || sort !== "relevance";
  const roleLabel =
    role === "business" ? "business grants" : role === "student" ? "scholarships" : "research funding";
  const sortLabels: Record<SortOption, string> = {
    relevance: "Best match",
    deadline: "Soonest deadline",
    amount: "Highest amount",
    newest: "Newest",
  };
  const deadlineLabels: Record<DeadlineFilter, string> = {
    all: "All deadlines",
    "30": "Next 30 days",
    "60": "Next 60 days",
    "90": "Next 90 days",
    rolling: "Rolling only",
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[296px_1fr]">
      <aside className="auc-card-flat p-5 lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:self-start lg:overflow-y-auto">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="auc-label flex items-center gap-2 text-[var(--auc-ink)]">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mono inline-flex items-center gap-1 text-[0.68rem] font-black uppercase tracking-[0.06em] text-[var(--auc-coral)] hover:text-[#912f26]"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            const nextSearch = searchDraft.trim();
            setSearch(nextSearch);
            navigate({ search: nextSearch, page: 1 });
          }}
          className="mb-5"
        >
          <label className="auc-label mb-2 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--auc-muted)]" />
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Name, provider, keyword..."
              className="auc-field w-full py-2 pl-9 pr-3 text-sm"
            />
          </div>
        </form>

        {profileCategories.length > 0 && (
          <div className="mb-5 rounded-xl border-2 border-[var(--auc-purple)] bg-[var(--auc-purple-soft)] p-3">
            <p className="mono text-[0.68rem] font-black uppercase tracking-[0.06em] text-[var(--auc-purple-deep)]">
              From your profile
            </p>
            <p className="mt-2 text-sm leading-5 text-[var(--auc-ink)]">
              These tags come from your onboarding answers and can be reapplied anytime.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {profileCategories.map((tag) => (
                <span
                  key={tag}
                  className="mono rounded bg-white px-2.5 py-1 text-[0.68rem] font-black text-[var(--auc-purple-deep)]"
                >
                  {tag}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={useProfileFilters}
              className="mt-3 w-full rounded-lg bg-[var(--auc-purple)] px-3 py-2 text-sm font-black text-white"
            >
              Reapply profile filters
            </button>
          </div>
        )}

        <div className="mb-5">
          <label className="auc-label mb-2 block">Sort</label>
          <select
            value={sort}
            onChange={(event) => {
              const nextSort = event.target.value as SortOption;
              setSort(nextSort);
              navigate({ sort: nextSort, page: 1 });
            }}
            className="auc-field w-full px-3 py-2 text-sm"
          >
            <option value="relevance">Best match</option>
            <option value="deadline">Soonest deadline</option>
            <option value="amount">Highest amount</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        <div className="mb-5">
          <label className="auc-label mb-2 block">Deadline</label>
          <div className="space-y-2">
            {[
              ["all", "All deadlines"],
              ["30", "Next 30 days"],
              ["60", "Next 60 days"],
              ["90", "Next 90 days"],
              ["rolling", "Rolling only"],
            ].map(([value, label]) => (
              <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-[var(--auc-ink-2)]">
                <input
                  type="radio"
                  name="deadline"
                  checked={deadline === value}
                  onChange={() => {
                    const nextDeadline = value as DeadlineFilter;
                    setDeadline(nextDeadline);
                    navigate({ deadline: nextDeadline, page: 1 });
                  }}
                  className="accent-[var(--auc-purple)]"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="auc-label block">Categories</label>
            <div className="flex items-center gap-2 text-xs">
              {profileCategories.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={useProfileFilters}
                    className="font-bold text-[var(--auc-purple-deep)] hover:text-[var(--auc-purple)]"
                  >
                    Profile
                  </button>
                  <span className="text-[var(--auc-rule-strong)]">|</span>
                </>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedTags([]);
                  navigate({ selectedTags: [], page: 1 });
                }}
                className="font-bold text-[var(--auc-muted)] hover:text-[var(--auc-ink)]"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="space-y-4 pr-1">
            {optionGroups.map(([group, groupOptions]) => (
              <div key={group}>
                <p className="mono mb-2 text-[0.68rem] font-black uppercase tracking-[0.06em] text-[var(--auc-muted)]">
                  {group}
                </p>
                <div className="space-y-2">
                  {groupOptions.map((option) => {
                    const checked = selectedTags.includes(option.value);
                    const recommended = recommendedSet.has(normalize(option.value));

                    return (
                      <label
                        key={option.value}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 px-1 py-1.5 text-sm transition",
                          checked
                            ? "text-[var(--auc-ink)]"
                            : "text-[var(--auc-ink-2)]",
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTag(option.value)}
                          className="accent-[var(--auc-purple)]"
                        />
                        <span className="min-w-0 flex-1 truncate">{option.label}</span>
                        {recommended && (
                          <span
                            className={cn(
                              "mono rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.04em]",
                              "bg-[var(--auc-purple)] text-white",
                            )}
                          >
                            profile
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <section>
        {showPersonalizationPrompt && (
          <div className="mb-5 rounded-[14px] bg-[var(--auc-ink)] px-5 py-4 text-white">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mono text-[0.68rem] font-black uppercase tracking-[0.06em] text-[var(--auc-lime)]">
                  Browsing as guest
                </p>
                <p className="mt-1 text-sm text-white/80">
                  Sign in to create a profile, preselect relevant filters, and rank {roleLabel} on your dashboard.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href="/sign-in"
                  className="rounded-lg border border-white/35 px-3 py-2 text-sm font-bold text-white hover:bg-white/10"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-[var(--auc-lime)] px-3 py-2 text-sm font-black text-[var(--auc-ink)]"
                >
                  Create profile
                </Link>
              </div>
            </div>
          </div>
        )}

        {hasFilters && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="auc-label">Filters:</span>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSearchDraft("");
                  navigate({ search: "", page: 1 });
                }}
                className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--auc-ink)] bg-[var(--auc-paper)] px-3 py-1.5 text-sm font-bold"
              >
                search: {search}
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {deadline !== "all" && (
              <button
                type="button"
                onClick={() => {
                  setDeadline("all");
                  navigate({ deadline: "all", page: 1 });
                }}
                className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--auc-ink)] bg-[var(--auc-paper)] px-3 py-1.5 text-sm font-bold"
              >
                {deadlineLabels[deadline]}
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {sort !== "relevance" && (
              <button
                type="button"
                onClick={() => {
                  setSort("relevance");
                  navigate({ sort: "relevance", page: 1 });
                }}
                className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--auc-ink)] bg-[var(--auc-paper)] px-3 py-1.5 text-sm font-bold"
              >
                sort: {sortLabels[sort]}
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            {selectedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--auc-ink)] bg-[var(--auc-paper)] px-3 py-1.5 text-sm font-bold"
              >
                {tag}
                <X className="h-3.5 w-3.5" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="mono ml-auto text-[0.68rem] font-black uppercase tracking-[0.06em] text-[var(--auc-coral)]"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="mono text-sm text-[var(--auc-ink-2)]">
            Showing <span className="font-black text-[var(--auc-ink)]">{items.length}</span>{" "}
            of <span className="font-black text-[var(--auc-ink)]">{totalCount}</span> results
          </p>
          <p className="mono text-[0.68rem] font-bold uppercase tracking-[0.06em] text-[var(--auc-muted)]">
            {isPending ? "Updating results" : `Page ${page} of ${pageCount}`}
          </p>
        </div>

        {items.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <FundingCard
                  key={item.id}
                  item={item}
                  href={`${basePath}/${item.id}`}
                />
              ))}
            </div>
            {pageCount > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page <= 1 || isPending}
                  onClick={() => navigate({ page: page - 1 })}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= pageCount || isPending}
                  onClick={() => navigate({ page: page + 1 })}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="auc-card-flat border-dashed bg-[var(--auc-paper)] px-6 py-14 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-[var(--auc-muted)]" />
            <h2 className="display text-3xl leading-tight text-[var(--auc-ink)]">
              Nothing matches yet.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--auc-ink-2)]">
              Try clearing one category, widening the deadline range, or resetting your filters.
            </p>
            <Button type="button" variant="outline" className="mt-6" onClick={clearFilters}>
              Reset filters
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
