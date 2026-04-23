import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  color?: "blue" | "green" | "purple" | "orange" | "yellow" | "red" | "gray";
  size?: "sm" | "md";
  className?: string;
}

const Badge = ({ children, variant, color, size = "md", className }: BadgeProps) => {
  const baseStyles = "inline-flex items-center rounded-full font-medium";

  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-secondary-100 text-secondary-800",
    warning: "bg-accent-100 text-accent-800",
    error: "bg-red-100 text-red-800",
    info: "bg-primary-100 text-primary-800",
  };

  const colors = {
    blue: "bg-gray-800 text-white",
    green: "bg-green-100 text-green-800",
    purple: "bg-purple-100 text-purple-800",
    orange: "bg-orange-100 text-orange-800",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-800",
    gray: "bg-gray-100 text-gray-800",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  // If color is specified, use it; otherwise use variant or default
  const colorClass = color ? colors[color] : (variant ? variants[variant] : variants.default);

  return (
    <span className={cn(baseStyles, colorClass, sizes[size], className)}>
      {children}
    </span>
  );
};

export default Badge;
