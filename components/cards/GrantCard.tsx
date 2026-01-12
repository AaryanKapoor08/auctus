import { Calendar, DollarSign, Tag } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface GrantCardProps {
  id: string;
  name: string;
  amount: number;
  matchPercentage: number;
  deadline: string;
  description: string;
  category: string;
  onClick?: () => void;
}

export default function GrantCard({
  id,
  name,
  amount,
  matchPercentage,
  deadline,
  description,
  category,
  onClick,
}: GrantCardProps) {
  // Match percentage color coding
  const getMatchColor = (percentage: number): "green" | "yellow" | "gray" => {
    if (percentage > 70) return "green";
    if (percentage >= 40) return "yellow";
    return "gray";
  };

  const matchColor = getMatchColor(matchPercentage);

  // Format amount
  const formattedAmount = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
  }).format(amount);

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-6 shadow-sm transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1 hover:text-primary-600 transition-colors">
          {name}
        </h3>
        <Badge color={matchColor} size="sm" className="ml-2 whitespace-nowrap">
          {matchPercentage}% match
        </Badge>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="h-5 w-5 text-green-600" />
        <span className="text-2xl font-bold text-green-600">
          {formattedAmount}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Closes: {deadline}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Tag className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{category}</span>
          </div>
        </div>
      </div>

      {/* Learn More Button */}
      {onClick && (
        <button
          className="mt-4 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm font-medium"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Learn More
        </button>
      )}
    </div>
  );
}
