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
  const baseStyles = "mono inline-flex items-center rounded-full border font-bold";

  const variants = {
    default: "border-[var(--auc-rule-strong)] bg-[var(--auc-paper)] text-[var(--auc-ink)]",
    success: "border-[var(--auc-ink)] bg-[var(--auc-lime)] text-[var(--auc-ink)]",
    warning: "border-[var(--auc-rule-strong)] bg-[var(--auc-butter)] text-[var(--auc-ink)]",
    error: "bg-red-100 text-red-800",
    info: "border-[var(--auc-purple)] bg-[var(--auc-purple-soft)] text-[var(--auc-purple-deep)]",
  };

  const colors = {
    blue: "border-[var(--auc-ink)] bg-[var(--auc-ink)] text-white",
    green: "border-[var(--auc-ink)] bg-[var(--auc-lime)] text-[var(--auc-ink)]",
    purple: "border-[var(--auc-purple)] bg-[var(--auc-purple-soft)] text-[var(--auc-purple-deep)]",
    orange: "border-[var(--auc-coral)] bg-[var(--auc-coral-soft)] text-[#912f26]",
    yellow: "border-[var(--auc-rule-strong)] bg-[var(--auc-butter)] text-[var(--auc-ink)]",
    red: "bg-red-100 text-red-800",
    gray: "border-[var(--auc-rule-strong)] bg-[var(--auc-paper)] text-[var(--auc-ink-2)]",
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
