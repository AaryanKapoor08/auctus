import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  variant?: "default" | "success" | "warning";
}

const variantStyles = {
  default: {
    iconBg: "bg-primary-100",
    iconColor: "text-primary-600",
    trendUp: "text-green-600",
    trendDown: "text-red-600",
  },
  success: {
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    trendUp: "text-green-600",
    trendDown: "text-red-600",
  },
  warning: {
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    trendUp: "text-green-600",
    trendDown: "text-red-600",
  },
};

export default function StatsCard({
  icon: Icon,
  title,
  value,
  trend,
  variant = "default",
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.direction === "up" ? styles.trendUp : styles.trendDown
                )}
              >
                {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 ml-2">vs last month</span>
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-lg",
            styles.iconBg
          )}
        >
          <Icon className={cn("h-6 w-6", styles.iconColor)} />
        </div>
      </div>
    </div>
  );
}
