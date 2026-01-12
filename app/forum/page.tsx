"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ThreadCard from "@/components/cards/ThreadCard";
import {
  getAllThreads,
  getThreadsByCategory,
  getBusinessById,
  getRepliesByThreadId,
  formatRelativeTime,
  getForumCategories,
} from "@/lib/data-utils";

type SortOption = "recent" | "replies" | "helpful";

export default function ForumPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  // Get all forum categories
  const categories = getForumCategories();

  // Filter and sort threads
  const displayedThreads = useMemo(() => {
    // Step 1: Get threads by category
    let threads = activeCategory === "All" 
      ? getAllThreads() 
      : getThreadsByCategory(activeCategory);

    // Step 2: Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      threads = threads.filter(
        (thread) =>
          thread.title.toLowerCase().includes(query) ||
          thread.content.toLowerCase().includes(query) ||
          thread.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Step 3: Apply sorting
    const sortedThreads = [...threads];
    switch (sortBy) {
      case "recent":
        sortedThreads.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        break;
      case "replies":
        sortedThreads.sort(
          (a, b) =>
            getRepliesByThreadId(b.id).length -
            getRepliesByThreadId(a.id).length
        );
        break;
      case "helpful":
        sortedThreads.sort((a, b) => b.helpful - a.helpful);
        break;
    }

    return sortedThreads;
  }, [activeCategory, searchQuery, sortBy]);

  // Calculate thread count per category for tabs
  const getCategoryCount = (category: string) => {
    if (category === "All") return getAllThreads().length;
    return getThreadsByCategory(category).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Community Forum
            </h1>
            <p className="text-lg text-gray-600">
              Connect with Fredericton business owners
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => router.push("/forum/new")}
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Thread
          </Button>
        </div>

        {/* Search & Sort Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search threads by title, content, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="w-full md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
              >
                <option value="recent">Most Recent</option>
                <option value="replies">Most Replies</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {categories.map((category) => {
              const count = getCategoryCount(category);
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200
                    ${
                      isActive
                        ? "bg-primary-600 text-white shadow-md"
                        : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    }
                  `}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Thread Grid */}
        {displayedThreads.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedThreads.map((thread) => {
              const author = getBusinessById(thread.authorId);
              const replyCount = getRepliesByThreadId(thread.id).length;
              const preview =
                thread.content.length > 150
                  ? thread.content.substring(0, 150) + "..."
                  : thread.content;

              return (
                <ThreadCard
                  key={thread.id}
                  id={thread.id}
                  title={thread.title}
                  author={{
                    name: author?.name || "Unknown",
                    businessName: author?.name || "Unknown Business",
                  }}
                  category={thread.category}
                  preview={preview}
                  tags={thread.tags}
                  replyCount={replyCount}
                  timestamp={formatRelativeTime(thread.timestamp)}
                  onClick={() => router.push(`/forum/${thread.id}`)}
                />
              );
            })}
          </div>
        ) : (
          // Empty State
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No threads found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? `No threads match "${searchQuery}". Try a different search term.`
                  : `No threads in the ${activeCategory} category yet. Be the first to start a discussion!`}
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (searchQuery) {
                    setSearchQuery("");
                  } else {
                    router.push("/forum/new");
                  }
                }}
              >
                {searchQuery ? "Clear Search" : "Start a Thread"}
              </Button>
            </div>
          </div>
        )}

        {/* Load More Button (Optional - for demo purposes) */}
        {displayedThreads.length > 0 && displayedThreads.length >= 10 && (
          <div className="mt-8 text-center">
            <Button variant="outline" size="md">
              Load More Threads
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
