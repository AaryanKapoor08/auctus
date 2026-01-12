"use client";

import { useBusiness } from "@/lib/BusinessContext";
import StatsCard from "@/components/cards/StatsCard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import {
  DollarSign,
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  Target,
  Briefcase,
  Sparkles,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { SkeletonGrid, SkeletonCard } from "@/components/ui/Skeleton";
import {
  getMatchedGrants,
  getAllThreads,
  getMatchesForBusiness,
  getBusinessById,
  getDaysUntilDeadline,
  formatRelativeTime,
  getAllGrants,
} from "@/lib/data-utils";
import Link from "next/link";

export default function DashboardPage() {
  const { currentBusiness } = useBusiness();

  // Guard against null currentBusiness during initialization
  if (!currentBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Skeleton */}
          <div className="mb-8 space-y-3">
            <div className="h-10 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <SkeletonGrid count={4} />

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <SkeletonCard />
            </div>
            <div>
              <SkeletonCard />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const matchedGrants = getMatchedGrants(currentBusiness.id);
  const highMatchGrants = matchedGrants.filter((g) => g.matchPercentage > 60);
  const allThreads = getAllThreads();
  const matches = getMatchesForBusiness(currentBusiness.id);
  const allGrants = getAllGrants();
  const upcomingDeadlines = allGrants.filter(
    (g) => getDaysUntilDeadline(g.deadline) <= 30 && getDaysUntilDeadline(g.deadline) > 0
  );

  // Get top recommendations
  const topGrants = matchedGrants.slice(0, 3);
  const topMatches = matches.slice(0, 2);

  // Get relevant threads (simplified keyword matching)
  const relevantThreads = allThreads
    .filter((thread) => {
      const keywords = [
        ...currentBusiness.needs,
        currentBusiness.industry.toLowerCase(),
      ];
      const threadText = `${thread.title} ${thread.content} ${thread.tags.join(" ")}`.toLowerCase();
      return keywords.some((keyword) => threadText.includes(keyword.toLowerCase()));
    })
    .slice(0, 3);

  // Generate activity feed
  const recentGrants = allGrants
    .filter((g) => {
      const posted = new Date(g.deadline);
      const daysAgo = Math.floor((Date.now() - posted.getTime()) / (1000 * 60 * 60 * 24));
      return daysAgo <= 7;
    })
    .slice(0, 3);

  const recentThreads = allThreads
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 3);

  const approachingDeadlines = allGrants
    .filter((g) => {
      const days = getDaysUntilDeadline(g.deadline);
      return days > 0 && days <= 14;
    })
    .sort((a, b) => getDaysUntilDeadline(a.deadline) - getDaysUntilDeadline(b.deadline))
    .slice(0, 3);

  // Format current date
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {currentBusiness.name}
          </h1>
          <p className="text-lg text-gray-600 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {currentDate}
          </p>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={DollarSign}
            title="New Grants Available"
            value={highMatchGrants.length}
            variant="success"
            trend={{ value: 12, direction: "up" }}
          />
          <StatsCard
            icon={MessageSquare}
            title="Active Forum Threads"
            value={allThreads.length}
            variant="default"
          />
          <StatsCard
            icon={Users}
            title="Business Matches"
            value={matches.length}
            variant="default"
            trend={{ value: 8, direction: "up" }}
          />
          <StatsCard
            icon={Clock}
            title="Upcoming Deadlines"
            value={upcomingDeadlines.length}
            variant="warning"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recommendations Widget - 2 columns */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Target className="h-6 w-6 text-primary-600" />
                    Recommended For You
                  </h2>
                </div>

                {/* Top Grants */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Top Grant Matches
                  </h3>
                  <div className="space-y-3">
                    {topGrants.map((grant) => (
                      <Link
                        key={grant.id}
                        href={`/funding/${grant.id}`}
                        className="block"
                      >
                        <div className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors duration-200 border border-gray-200">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900">
                                  {grant.name}
                                </h4>
                                <Badge
                                  variant={
                                    grant.matchPercentage > 80
                                      ? "success"
                                      : grant.matchPercentage > 60
                                      ? "warning"
                                      : "default"
                                  }
                                  size="sm"
                                >
                                  {grant.matchPercentage}% match
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="font-medium text-primary-600">
                                  ${grant.amount.toLocaleString()}
                                </span>
                                <Badge variant="default" size="sm">
                                  {grant.category}
                                </Badge>
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link href="/funding">
                    <Button variant="outline" className="w-full mt-3">
                      View All Grants
                    </Button>
                  </Link>
                </div>

                {/* Relevant Threads */}
                {relevantThreads.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Relevant Forum Discussions
                    </h3>
                    <div className="space-y-3">
                      {relevantThreads.map((thread) => {
                        const author = getBusinessById(thread.authorId);
                        return (
                          <Link
                            key={thread.id}
                            href={`/forum/${thread.id}`}
                            className="block"
                          >
                            <div className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 transition-colors duration-200 border border-gray-200">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 mb-1">
                                    {thread.title}
                                  </h4>
                                  <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <span>{author?.name}</span>
                                    <Badge variant="info" size="sm">
                                      {thread.category}
                                    </Badge>
                                    <span className="flex items-center gap-1">
                                      <MessageSquare className="h-3 w-3" />
                                      {thread.views} views
                                    </span>
                                  </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <Link href="/forum">
                      <Button variant="outline" className="w-full mt-3">
                        Browse Forum
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Potential Matches */}
                {topMatches.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Potential Business Partnerships
                    </h3>
                    <div className="space-y-3">
                      {topMatches.map((match) => {
                        const partner = getBusinessById(match.partnerId);
                        return (
                          <div
                            key={match.partnerId}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                          >
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">
                                  {partner?.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {partner?.industry}
                                </p>
                              </div>
                              <Badge variant="success" size="sm">
                                {match.matchScore}% match
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700">
                              <strong>You need:</strong>{" "}
                              {match.reasoning.youNeed.join(", ")}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                    <Link href="/matchmaker">
                      <Button variant="outline" className="w-full mt-3">
                        View All Matches
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Activity Feed Widget - 1 column */}
          <div>
            <Card>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-secondary-600" />
                  Recent Activity
                </h2>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {/* Recent Grants */}
                  {recentGrants.map((grant) => (
                    <div
                      key={`grant-${grant.id}`}
                      className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                        <DollarSign className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          New grant posted: {grant.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRelativeTime(grant.deadline)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Recent Threads */}
                  {recentThreads.map((thread) => {
                    const author = getBusinessById(thread.authorId);
                    return (
                      <div
                        key={`thread-${thread.id}`}
                        className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {author?.name} posted in {thread.category}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatRelativeTime(thread.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Approaching Deadlines */}
                  {approachingDeadlines.map((grant) => {
                    const daysLeft = getDaysUntilDeadline(grant.deadline);
                    return (
                      <div
                        key={`deadline-${grant.id}`}
                        className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0">
                          <Clock className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            Deadline approaching: {grant.name}
                          </p>
                          <p className="text-xs text-orange-600 font-medium">
                            {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/forum/new">
                <Button
                  variant="outline"
                  className="w-full h-auto py-6 flex flex-col items-center gap-2 hover:bg-primary-50 hover:border-primary-300 transition-colors"
                >
                  <MessageSquare className="h-8 w-8 text-primary-600" />
                  <span className="font-semibold">Post in Forum</span>
                  <span className="text-xs text-gray-500">Share with community</span>
                </Button>
              </Link>

              <Link href="/funding">
                <Button
                  variant="outline"
                  className="w-full h-auto py-6 flex flex-col items-center gap-2 hover:bg-secondary-50 hover:border-secondary-300 transition-colors"
                >
                  <DollarSign className="h-8 w-8 text-secondary-600" />
                  <span className="font-semibold">Browse Grants</span>
                  <span className="text-xs text-gray-500">Find funding</span>
                </Button>
              </Link>

              <Link href="/matchmaker">
                <Button
                  variant="outline"
                  className="w-full h-auto py-6 flex flex-col items-center gap-2 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                >
                  <Users className="h-8 w-8 text-purple-600" />
                  <span className="font-semibold">View Matches</span>
                  <span className="text-xs text-gray-500">Find partners</span>
                </Button>
              </Link>

              <Button
                variant="outline"
                className="w-full h-auto py-6 flex flex-col items-center gap-2 hover:bg-pink-50 hover:border-pink-300 transition-colors"
                onClick={() => alert("AI Advisor coming in Phase 6!")}
              >
                <Sparkles className="h-8 w-8 text-pink-600" />
                <span className="font-semibold">Ask AI Advisor</span>
                <span className="text-xs text-gray-500">Get help</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
