"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useBusiness } from "@/lib/BusinessContext";
import {
  getMatchedGrants,
  getDaysUntilDeadline,
  getGrantCategories,
} from "@/lib/data-utils";
import GrantCard from "@/components/cards/GrantCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import {
  DollarSign,
  Calendar,
  Target,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import { SkeletonGrid } from "@/components/ui/Skeleton";

type SortOption = "match" | "amount" | "deadline";

export default function FundingPage() {
  const router = useRouter();
  const { currentBusiness } = useBusiness();

  // Filter state
  const [matchScoreFilter, setMatchScoreFilter] = useState<number>(0);
  const [amountRange, setAmountRange] = useState({ min: 0, max: 100000 });
  const [deadlineFilter, setDeadlineFilter] = useState<string>("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("match");

  // Get all categories (excluding "All")
  const allCategories = useMemo(() => {
    return getGrantCategories().filter((c) => c !== "All");
  }, []);

  // Get matched grants for current business
  const matchedGrants = useMemo(() => {
    if (!currentBusiness) return [];
    return getMatchedGrants(currentBusiness.id);
  }, [currentBusiness]);

  // Filter and sort grants
  const filteredAndSortedGrants = useMemo(() => {
    let filtered = matchedGrants;

    // Filter by match score
    filtered = filtered.filter(
      (grant) => grant.matchPercentage >= matchScoreFilter
    );

    // Filter by amount range
    filtered = filtered.filter(
      (grant) =>
        grant.amount >= amountRange.min && grant.amount <= amountRange.max
    );

    // Filter by deadline
    if (deadlineFilter !== "all") {
      const days = parseInt(deadlineFilter);
      filtered = filtered.filter(
        (grant) => getDaysUntilDeadline(grant.deadline) <= days
      );
    }

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((grant) =>
        selectedCategories.includes(grant.category)
      );
    }

    // Sort
    const sorted = [...filtered];
    if (sortBy === "match") {
      sorted.sort((a, b) => b.matchPercentage - a.matchPercentage);
    } else if (sortBy === "amount") {
      sorted.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === "deadline") {
      sorted.sort(
        (a, b) =>
          getDaysUntilDeadline(a.deadline) - getDaysUntilDeadline(b.deadline)
      );
    }

    return sorted;
  }, [
    matchedGrants,
    matchScoreFilter,
    amountRange,
    deadlineFilter,
    selectedCategories,
    sortBy,
  ]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalAvailable = matchedGrants.reduce(
      (sum, grant) => sum + grant.amount,
      0
    );
    const yourMatches = matchedGrants.filter(
      (grant) => grant.matchPercentage > 60
    ).length;
    const deadlinesThisMonth = matchedGrants.filter(
      (grant) => getDaysUntilDeadline(grant.deadline) <= 30
    ).length;
    
    return { totalAvailable, yourMatches, deadlinesThisMonth };
  }, [matchedGrants]);

  // Loading state
  if (!currentBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Skeleton */}
          <div className="mb-6 space-y-3">
            <div className="h-10 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>

          {/* Stats Banner Skeleton */}
          <SkeletonGrid count={3} />

          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reset all filters
  const resetFilters = () => {
    setMatchScoreFilter(0);
    setAmountRange({ min: 0, max: 100000 });
    setDeadlineFilter("all");
    setSelectedCategories([]);
    setSortBy("match");
  };

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Select/clear all categories
  const selectAllCategories = () => {
    setSelectedCategories(allCategories);
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Funding Opportunities
          </h1>
          <p className="text-lg text-gray-600">
            Grants matched to {currentBusiness.name}
          </p>
        </div>

        {/* Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalAvailable.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Target className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Your Matches</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.yourMatches} grants
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Deadlines This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.deadlinesThisMonth} grants
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filters
                </h2>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
              </div>

              {/* Match Score Slider */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Match Score: {matchScoreFilter}%+
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={matchScoreFilter}
                  onChange={(e) => setMatchScoreFilter(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Amount Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Range
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-600">Min:</label>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="5000"
                      value={amountRange.min}
                      onChange={(e) =>
                        setAmountRange((prev) => ({
                          ...prev,
                          min: Number(e.target.value),
                        }))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Max:</label>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="5000"
                      value={amountRange.max}
                      onChange={(e) =>
                        setAmountRange((prev) => ({
                          ...prev,
                          max: Number(e.target.value),
                        }))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-700 mt-2">
                  ${amountRange.min.toLocaleString()} - $
                  {amountRange.max.toLocaleString()}
                </div>
              </div>

              {/* Deadline Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline
                </label>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All Deadlines" },
                    { value: "30", label: "Next 30 days" },
                    { value: "60", label: "Next 60 days" },
                    { value: "90", label: "Next 90 days" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="deadline"
                        value={option.value}
                        checked={deadlineFilter === option.value}
                        onChange={(e) => setDeadlineFilter(e.target.value)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Checkboxes */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Categories
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAllCategories}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      All
                    </button>
                    <span className="text-xs text-gray-400">|</span>
                    <button
                      onClick={clearAllCategories}
                      className="text-xs text-gray-600 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allCategories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="text-primary-600 focus:ring-primary-500 rounded"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Sort and Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600">
                Showing {filteredAndSortedGrants.length} of{" "}
                {matchedGrants.length} grants
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="match">Best Match</option>
                  <option value="amount">Highest Amount</option>
                  <option value="deadline">Soonest Deadline</option>
                </select>
              </div>
            </div>

            {/* Grant Grid */}
            {filteredAndSortedGrants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAndSortedGrants.map((grant) => (
                  <GrantCard
                    key={grant.id}
                    id={grant.id}
                    name={grant.name}
                    amount={grant.amount}
                    matchPercentage={grant.matchPercentage}
                    deadline={new Date(grant.deadline).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                    description={grant.description}
                    category={grant.category}
                    onClick={() => router.push(`/funding/${grant.id}`)}
                  />
                ))}
              </div>
            ) : (
              // Empty State
              <Card className="py-16">
                <div className="text-center">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No grants match your current filters
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters to see more results
                  </p>
                  <Button onClick={resetFilters}>Reset Filters</Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
