import { ArrowRight, Building2 } from "lucide-react";
import { Business } from "@/lib/data-utils";
import Badge from "@/components/ui/Badge";

interface MatchCardProps {
  yourBusiness: Business;
  partnerBusiness: Business;
  reasoning: {
    youNeed: string[];
    theyOffer: string[];
    matchScore: number;
  };
  onConnect?: () => void;
}

export default function MatchCard({
  yourBusiness,
  partnerBusiness,
  reasoning,
  onConnect,
}: MatchCardProps) {
  // Get match score color
  const getMatchColor = (score: number): "green" | "yellow" | "gray" => {
    if (score >= 80) return "green";
    if (score >= 60) return "yellow";
    return "gray";
  };

  const matchColor = getMatchColor(reasoning.matchScore);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Two-column business layout */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 mb-4">
        {/* Your Business */}
        <div className="bg-primary-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-primary-600" />
            <span className="text-xs font-semibold text-primary-600 uppercase">
              Your Business
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">
            {yourBusiness.name}
          </h4>
          <p className="text-sm text-gray-600">{yourBusiness.industry}</p>
          <p className="text-xs text-gray-500 mt-1">{yourBusiness.location}</p>
        </div>

        {/* Arrow & Match Score */}
        <div className="flex flex-col items-center justify-center min-w-[80px]">
          <div className="hidden md:block">
            <ArrowRight className="h-8 w-8 text-gray-400" />
          </div>
          <Badge color={matchColor} size="sm" className="mt-2">
            {reasoning.matchScore}% match
          </Badge>
        </div>

        {/* Partner Business */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-green-600" />
            <span className="text-xs font-semibold text-green-600 uppercase">
              Partner Business
            </span>
          </div>
          <h4 className="font-semibold text-gray-900 mb-1">
            {partnerBusiness.name}
          </h4>
          <p className="text-sm text-gray-600">{partnerBusiness.industry}</p>
          <p className="text-xs text-gray-500 mt-1">
            {partnerBusiness.location}
          </p>
        </div>
      </div>

      {/* Reasoning Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h5 className="text-sm font-semibold text-gray-900 mb-3">
          Why this is a good match:
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* You Need */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">You need:</p>
            <ul className="space-y-1">
              {reasoning.youNeed.map((need, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>{need}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* They Offer */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">
              They offer:
            </p>
            <ul className="space-y-1">
              {reasoning.theyOffer.map((offer, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>{offer}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Connect Button */}
      {onConnect && (
        <button
          onClick={onConnect}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm font-medium"
        >
          Connect
        </button>
      )}
    </div>
  );
}
