"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import type { FundingItem } from "@contracts/funding";
import type { Role } from "@contracts/role";
import { FUNDING_FILTERS } from "@/lib/funding/filter-definitions";
import Button from "@/components/ui/Button";
import FundingCard from "./FundingCard";
import { cn } from "@/lib/utils";

type DeadlineFilter = "all" | "30" | "60" | "90" | "rolling";
type SortOption = "relevance" | "deadline" | "amount" | "newest";

export type FundingBrowserDeadlineFilter = DeadlineFilter;
export type FundingBrowserSortOption = SortOption;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function itemTags(item: FundingItem) {
  return new Set(
    [...item.tags, item.category ?? ""]
      .map(normalize)
      .filter(Boolean),
  );
}

function matchesSearch(item: FundingItem, search: string) {
  if (!search) return true;

  const query = normalize(search);
  const haystack = [
    item.name,
    item.provider,
    item.description ?? "",
    item.category ?? "",
    item.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function daysUntil(deadline: string | null) {
  if (!deadline) return Number.POSITIVE_INFINITY;
  const due = new Date(deadline);
  if (Number.isNaN(due.getTime())) return Number.POSITIVE_INFINITY;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
}

function matchesDeadline(item: FundingItem, deadline: DeadlineFilter) {
  if (deadline === "all") return true;
  if (deadline === "rolling") return item.deadline === null;

  const days = daysUntil(item.deadline);
  return Number.isFinite(days) && days >= 0 && days <= Number(deadline);
}

function relevanceScore(item: FundingItem, tags: string[]) {
  const values = itemTags(item);
  return tags.reduce(
    (score, tag) => score + (values.has(normalize(tag)) ? 1 : 0),
    0,
  );
}

function toQueryString(input: {
  search: string;
  selectedTags: string[];
  deadline: DeadlineFilter;
  sort: SortOption;
}) {
  const params = new URLSearchParams();
  if (input.search) params.set("search", input.search);
  input.selectedTags.forEach((tag) => params.append("category", tag));
  if (input.deadline !== "all") params.set("deadline", input.deadline);
  if (input.sort !== "relevance") params.set("sort", input.sort);
  return params.toString();
}

export default function FundingBrowser({
  role,
  items,
  basePath,
  initialSearch = "",
  initialCategories = [],
  initialDeadline = "all",
  initialSort = "relevance",
  recommendedCategories = [],
  showPersonalizationPrompt = false,
}: {
  role: Role;
  items: FundingItem[];
  basePath: string;
  initialSearch?: string;
  initialCategories?: string[];
  initialDeadline?: DeadlineFilter;
  initialSort?: SortOption;
  recommendedCategories?: string[];
  showPersonalizationPrompt?: boolean;
}) {
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
  const optionGroupByValue = useMemo(
    () =>
      new Map(
        options.map((option) => [
          normalize(option.value),
          option.group ?? "Other",
        ]),
      ),
    [options],
  );
  const optionValues = new Set(options.map((option) => option.value));
  const profileCategories = recommendedCategories.filter((tag) =>
    optionValues.has(tag),
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

  const tagCounts = useMemo(() => {
    return Object.fromEntries(
      options.map((option) => [
        option.value,
        items.filter((item) => itemTags(item).has(normalize(option.value))).length,
      ]),
    );
  }, [items, options]);

  const visibleItems = useMemo(() => {
    const activeTagsByGroup = new Map<string, string[]>();
    for (const tag of selectedTags) {
      const normalized = normalize(tag);
      const group = optionGroupByValue.get(normalized) ?? normalized;
      activeTagsByGroup.set(group, [
        ...(activeTagsByGroup.get(group) ?? []),
        normalized,
      ]);
    }

    const filtered = items.filter((item) => {
      const tags = itemTags(item);
      return (
        matchesSearch(item, search) &&
        Array.from(activeTagsByGroup.values()).every((groupTags) =>
          groupTags.some((tag) => tags.has(tag)),
        ) &&
        matchesDeadline(item, deadline)
      );
    });

    return filtered.sort((a, b) => {
      if (sort === "deadline") {
        return daysUntil(a.deadline) - daysUntil(b.deadline);
      }

      if (sort === "amount") {
        return (b.amount_max ?? b.amount_min ?? 0) - (a.amount_max ?? a.amount_min ?? 0);
      }

      if (sort === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }

      const bScore = relevanceScore(b, [...profileCategories, ...selectedTags]);
      const aScore = relevanceScore(a, [...profileCategories, ...selectedTags]);
      if (bScore !== aScore) return bScore - aScore;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [deadline, items, optionGroupByValue, profileCategories, search, selectedTags, sort]);

  useEffect(() => {
    const query = toQueryString({ search, selectedTags, deadline, sort });
    const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  }, [deadline, search, selectedTags, sort]);

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((value) => value !== tag)
        : [...current, tag],
    );
  }

  function clearFilters() {
    setSearch("");
    setSearchDraft("");
    setSelectedTags([]);
    setDeadline("all");
    setSort("relevance");
  }

  function useProfileFilters() {
    setSelectedTags(profileCategories);
    setSort("relevance");
  }

  const hasFilters =
    search || selectedTags.length > 0 || deadline !== "all" || sort !== "relevance";

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:self-start">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(searchDraft.trim());
          }}
          className="mb-5"
        >
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Name, provider, keyword"
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <Button type="submit" variant="outline" className="mt-3 w-full">
            Search
          </Button>
        </form>

        {profileCategories.length > 0 && (
          <div className="mb-5 rounded-lg border border-green-100 bg-green-50 p-3">
            <p className="text-sm font-semibold text-green-900">From your profile</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {profileCategories.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-green-800"
                >
                  {tag}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={useProfileFilters}
              className="mt-3 text-xs font-semibold text-green-800 hover:text-green-950"
            >
              Reapply profile filters
            </button>
          </div>
        )}

        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Sort by
          </label>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="relevance">Best match</option>
            <option value="deadline">Soonest deadline</option>
            <option value="amount">Highest amount</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Deadline
          </label>
          <div className="space-y-2">
            {[
              ["all", "All deadlines"],
              ["30", "Next 30 days"],
              ["60", "Next 60 days"],
              ["90", "Next 90 days"],
              ["rolling", "Rolling only"],
            ].map(([value, label]) => (
              <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="radio"
                  name="deadline"
                  checked={deadline === value}
                  onChange={() => setDeadline(value as DeadlineFilter)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label className="block text-sm font-medium text-gray-700">
              Categories
            </label>
            <div className="flex items-center gap-2 text-xs">
              {profileCategories.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={useProfileFilters}
                    className="font-medium text-primary-700 hover:text-primary-900"
                  >
                    Profile
                  </button>
                  <span className="text-gray-300">|</span>
                </>
              )}
              <button
                type="button"
                onClick={() => setSelectedTags([])}
                className="font-medium text-gray-600 hover:text-gray-900"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="max-h-96 space-y-4 overflow-y-auto pr-1">
            {optionGroups.map(([group, groupOptions]) => (
              <div key={group}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
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
                          "flex cursor-pointer items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm transition",
                          checked
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleTag(option.value)}
                            className="rounded text-primary-600 focus:ring-primary-500"
                          />
                          <span className="truncate">{option.label}</span>
                          {recommended && (
                            <span className={cn(
                              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                              checked ? "bg-white/15 text-white" : "bg-green-50 text-green-700",
                            )}>
                              profile
                            </span>
                          )}
                        </span>
                        <span className={checked ? "text-gray-200" : "text-gray-400"}>
                          {tagCounts[option.value] ?? 0}
                        </span>
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
          <div className="mb-5 rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Browse everything now. Sign in when you want better matches.
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  Create a profile to preselect filters, personalize rankings, and keep funding aligned to your role.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href="/sign-in"
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
                >
                  Customize
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{visibleItems.length}</span>{" "}
            of <span className="font-semibold text-gray-900">{items.length}</span> results
          </p>
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1.5 text-sm font-medium text-white"
                >
                  {tag}
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          )}
        </div>

        {visibleItems.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {visibleItems.map((item) => (
              <FundingCard key={item.id} item={item} href={`${basePath}/${item.id}`} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center">
            <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-900">
              No funding opportunities found
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
              Try clearing one category or widening the deadline range.
            </p>
            <Button type="button" variant="outline" className="mt-5" onClick={clearFilters}>
              Reset filters
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
