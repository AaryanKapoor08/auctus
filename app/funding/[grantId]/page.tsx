"use client";

import { useParams, useRouter } from "next/navigation";
import { useBusiness } from "@/lib/BusinessContext";
import {
  getGrantById,
  getDaysUntilDeadline,
  calculateGrantMatch,
  getSimilarGrants,
  getEligibilityBreakdown,
} from "@/lib/data-utils";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  ArrowLeft,
  Calendar,
  Check,
  X,
  HelpCircle,
  Sparkles,
  DollarSign,
  ExternalLink,
  Target,
  Clock,
} from "lucide-react";

export default function GrantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentBusiness } = useBusiness();

  const grantId = params.grantId as string;
  const grant = getGrantById(grantId);

  // Loading state
  if (!currentBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Grant not found
  if (!grant) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <Card className="py-16">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Grant Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                The grant you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push("/funding")}>
                Back to Funding
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate match percentage and eligibility
  const matchPercentage = calculateGrantMatch(currentBusiness, grant);
  const eligibility = getEligibilityBreakdown(currentBusiness.id, grantId);
  const similarGrants = getSimilarGrants(grantId, currentBusiness.id, 3);
  const daysRemaining = getDaysUntilDeadline(grant.deadline);
  const deadlinePassed = daysRemaining < 0;

  // Match percentage badge color
  const getMatchColor = (percentage: number) => {
    if (percentage >= 70) return "bg-green-100 text-green-800";
    if (percentage >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  // Deadline color
  const getDeadlineColor = () => {
    if (deadlinePassed) return "text-red-600";
    if (daysRemaining <= 15) return "text-red-600";
    if (daysRemaining <= 30) return "text-orange-600";
    return "text-green-600";
  };

  // Format deadline
  const formattedDeadline = new Date(grant.deadline).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" }
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => router.push("/funding")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Funding</span>
        </button>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Grant Header */}
            <Card>
              <div className="space-y-4">
                {/* Title and Provider */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {grant.name}
                  </h1>
                  <p className="text-lg text-gray-600">{grant.provider}</p>
                </div>

                {/* Badges Row */}
                <div className="flex flex-wrap gap-3">
                  {/* Amount */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-primary-600" />
                    <span className="text-xl font-bold text-primary-900">
                      ${grant.amount.toLocaleString()}
                    </span>
                  </div>

                  {/* Match Percentage */}
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getMatchColor(
                      matchPercentage
                    )}`}
                  >
                    <Target className="h-5 w-5" />
                    <span className="font-semibold">
                      {matchPercentage}% Match
                    </span>
                  </div>

                  {/* Category */}
                  <Badge variant="default">{grant.category}</Badge>
                </div>

                {/* Deadline Countdown */}
                <div
                  className={`flex items-center gap-2 ${getDeadlineColor()}`}
                >
                  <Calendar className="h-5 w-5" />
                  {deadlinePassed ? (
                    <span className="font-semibold">Deadline Passed</span>
                  ) : (
                    <span className="font-semibold">
                      {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}{" "}
                      remaining • Deadline: {formattedDeadline}
                    </span>
                  )}
                </div>
              </div>
            </Card>

            {/* Description */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                About This Grant
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {grant.description}
              </p>
            </Card>

            {/* Eligibility Checklist */}
            <Card>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Eligibility Requirements
                </h2>
                <p className="text-gray-600">
                  Based on your business profile ({currentBusiness.name})
                </p>
              </div>

              {/* Overall Score */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Overall Eligibility
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {eligibility.metCount}/{eligibility.totalCount} requirements
                    met
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${eligibility.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  {eligibility.percentage}% eligible
                </p>
              </div>

              {/* Requirements List */}
              <div className="space-y-3">
                {eligibility.requirements.map((req, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {req.icon === "check" && (
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                      {req.icon === "x" && (
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                          <X className="h-4 w-4 text-red-600" />
                        </div>
                      )}
                      {req.icon === "question" && (
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                          <HelpCircle className="h-4 w-4 text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Requirement Text */}
                    <div className="flex-1">
                      <p
                        className={`text-sm ${
                          req.met === true
                            ? "text-gray-900"
                            : req.met === false
                            ? "text-red-900"
                            : "text-gray-600"
                        }`}
                      >
                        {req.text}
                      </p>
                      {req.met === null && (
                        <p className="text-xs text-gray-500 mt-1">
                          Unable to verify automatically
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* How to Apply */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                How to Apply
              </h2>
              <div className="space-y-4">
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Review all eligibility requirements above</li>
                  <li>Prepare required documentation and business plan</li>
                  <li>
                    Visit the official application portal using the button below
                  </li>
                  <li>Complete the online application form</li>
                  <li>Submit all required supporting documents</li>
                  <li>
                    Track your application status through the provider's portal
                  </li>
                </ol>

                <div className="pt-4">
                  <a
                    href={grant.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full sm:w-auto">
                      <span>Start Application</span>
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </a>
                  <p className="text-xs text-gray-500 mt-2">
                    Opens in a new tab at {grant.provider} website
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar (1/3 width on desktop) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Similar Grants */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Similar Grants
              </h2>

              {similarGrants.length > 0 ? (
                <div className="space-y-4">
                  {similarGrants.map((similarGrant) => (
                    <button
                      key={similarGrant.id}
                      onClick={() =>
                        router.push(`/funding/${similarGrant.id}`)
                      }
                      className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {similarGrant.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">
                          ${similarGrant.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`text-xs font-medium px-2 py-1 rounded ${getMatchColor(
                            similarGrant.matchPercentage
                          )}`}
                        >
                          {similarGrant.matchPercentage}% match
                        </div>
                        <Badge color="gray" size="sm">
                          {similarGrant.category}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  No similar grants found in this category.
                </p>
              )}
            </Card>

            {/* AI Assistant Prompt */}
            <Card className="sticky top-6 bg-gradient-to-br from-primary-50 to-purple-50 border-primary-200">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    AI Advisor
                  </h3>
                  <p className="text-sm text-gray-600">
                    Need help with this application?
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={() =>
                  alert(
                    "AI Advisor feature coming in Phase 6!\n\nThis will provide personalized guidance on:\n• Application requirements\n• Documentation preparation\n• Eligibility optimization\n• Similar funding opportunities"
                  )
                }
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Ask AI Advisor
              </Button>
            </Card>

            {/* Quick Stats */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${grant.amount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {grant.category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Match Score</span>
                  <span
                    className={`text-sm font-semibold ${
                      matchPercentage >= 70
                        ? "text-green-600"
                        : matchPercentage >= 40
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {matchPercentage}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Requirements Met
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {eligibility.metCount}/{eligibility.totalCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Days Left</span>
                  <span
                    className={`text-sm font-semibold ${getDeadlineColor()}`}
                  >
                    {deadlinePassed ? "Expired" : `${daysRemaining} days`}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
