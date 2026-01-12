"use client";

import { useMemo, useState } from "react";
import { useBusiness } from "@/lib/BusinessContext";
import {
  getMatchesWithBusinessDetails,
  getReciprocalMatches,
} from "@/lib/data-utils";
import MatchCard from "@/components/cards/MatchCard";
import { Users, Info } from "lucide-react";
import { SkeletonCard } from "@/components/ui/Skeleton";

type FilterTab = "all" | "you-need" | "you-offer" | "mutual";

export default function MatchmakerPage() {
  const { currentBusiness } = useBusiness();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  // Get all matches for current business
  const allMatches = useMemo(() => {
    if (!currentBusiness) return [];
    return getMatchesWithBusinessDetails(currentBusiness.id);
  }, [currentBusiness]);

  // Get reciprocal matches (where current business is the partner)
  const reciprocalMatches = useMemo(() => {
    if (!currentBusiness) return [];
    return getReciprocalMatches(currentBusiness.id);
  }, [currentBusiness]);

  // Filter matches based on active tab
  const filteredMatches = useMemo(() => {
    switch (activeTab) {
      case "all":
        // Combine all matches and reciprocal matches, sort by score
        const combined = [
          ...allMatches,
          ...reciprocalMatches.filter(
            (rm) =>
              !allMatches.some(
                (am) => am.partnerBusiness.id === rm.partnerBusiness.id
              )
          ),
        ];
        return combined.sort(
          (a, b) => b.reasoning.matchScore - a.reasoning.matchScore
        );

      case "you-need":
        // Primary matches: what you need and they offer
        return allMatches.filter((m) => m.reasoning.youNeed.length > 0);

      case "you-offer":
        // Reciprocal matches: what you offer and they need
        return reciprocalMatches;

      case "mutual":
        // High-scoring matches with mutual benefits
        return allMatches.filter(
          (m) =>
            m.reasoning.matchScore >= 75 ||
            m.reasoning.mutualBenefits.length >= 2
        );

      default:
        return allMatches;
    }
  }, [activeTab, allMatches, reciprocalMatches]);

  // Handle connect button click
  const handleConnect = (partnerName: string) => {
    alert(
      `Connection request sent to ${partnerName}!\n\n(Demo mode - request not actually sent)`
    );
  };

  if (!currentBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Skeleton */}
          <div className="mb-8 space-y-3">
            <div className="h-10 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>

          {/* Business Profile Skeleton */}
          <div className="bg-gray-100 rounded-lg p-6 mb-8">
            <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Tabs Skeleton */}
          <div className="flex gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 w-40 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>

          {/* Match Cards Skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tabs: Array<{ id: FilterTab; label: string; count: number }> = [
    { id: "all", label: "All Matches", count: allMatches.length + reciprocalMatches.filter(
        (rm) =>
          !allMatches.some(
            (am) => am.partnerBusiness.id === rm.partnerBusiness.id
          )
      ).length },
    {
      id: "you-need",
      label: "You Need / They Offer",
      count: allMatches.filter((m) => m.reasoning.youNeed.length > 0).length,
    },
    {
      id: "you-offer",
      label: "You Offer / They Need",
      count: reciprocalMatches.length,
    },
    {
      id: "mutual",
      label: "Mutual Benefits",
      count: allMatches.filter(
        (m) =>
          m.reasoning.matchScore >= 75 || m.reasoning.mutualBenefits.length >= 2
      ).length,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Business Matchmaker
          </h1>
          <p className="text-lg text-gray-600">
            Find partners and collaboration opportunities matched to{" "}
            <span className="font-semibold text-primary-600">
              {currentBusiness.name}
            </span>
          </p>
        </div>

        {/* Business Context Card */}
        <div className="bg-gradient-to-r from-primary-50 to-green-50 border-2 border-primary-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="bg-primary-600 rounded-full p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Your Business Profile
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    What you need:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentBusiness.needs.map((need: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white border border-primary-300 rounded-full text-sm text-gray-700"
                      >
                        {need}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    What you offer:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentBusiness.offers.map((offer: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white border border-green-300 rounded-full text-sm text-gray-700"
                      >
                        {offer}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <div className="flex flex-wrap gap-2 -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200
                    ${
                      activeTab === tab.id
                        ? "border-primary-600 text-primary-600 bg-primary-50"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                    }
                    rounded-t-lg
                  `}
                >
                  {tab.label}{" "}
                  <span
                    className={`
                    ml-2 px-2 py-0.5 rounded-full text-xs
                    ${
                      activeTab === tab.id
                        ? "bg-primary-100 text-primary-700"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info Box for Current Tab */}
        {activeTab !== "all" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">
              {activeTab === "you-need" && (
                <p>
                  <strong>You Need / They Offer:</strong> These businesses
                  provide services or products that match what you're looking
                  for.
                </p>
              )}
              {activeTab === "you-offer" && (
                <p>
                  <strong>You Offer / They Need:</strong> These businesses are
                  looking for services or products that you can provide.
                </p>
              )}
              {activeTab === "mutual" && (
                <p>
                  <strong>Mutual Benefits:</strong> High-potential partnerships
                  with strong complementary needs and offers (75%+ match or
                  multiple shared benefits).
                </p>
              )}
            </div>
          </div>
        )}

        {/* Matches List */}
        {filteredMatches.length > 0 ? (
          <div className="space-y-6">
            {filteredMatches.map((match, index) => (
              <MatchCard
                key={`${match.partnerBusiness.id}-${index}`}
                yourBusiness={match.yourBusiness}
                partnerBusiness={match.partnerBusiness}
                reasoning={match.reasoning}
                onConnect={() => handleConnect(match.partnerBusiness.name)}
              />
            ))}
          </div>
        ) : (
          // Empty State
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No matches found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {activeTab === "all"
                ? "No partnership opportunities available at this time."
                : activeTab === "you-need"
                ? "No businesses currently offer what you need. Try viewing All Matches."
                : activeTab === "you-offer"
                ? "No businesses are currently looking for what you offer. Try viewing All Matches."
                : "No high-potential mutual benefit partnerships found. Try viewing All Matches."}
            </p>
            {activeTab !== "all" && (
              <button
                onClick={() => setActiveTab("all")}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                View All Matches
              </button>
            )}
          </div>
        )}

        {/* Bottom Stats */}
        {filteredMatches.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Showing {filteredMatches.length}{" "}
            {filteredMatches.length === 1 ? "match" : "matches"} •{" "}
            {filteredMatches.filter((m) => m.reasoning.matchScore >= 80).length}{" "}
            high-quality matches (80%+)
          </div>
        )}
      </div>
    </div>
  );
}
