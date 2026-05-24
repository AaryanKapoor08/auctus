import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-full border-2 font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[var(--auc-bg)] disabled:cursor-not-allowed disabled:opacity-50";

    const variants = {
      primary:
        "border-[var(--auc-ink)] bg-[var(--auc-ink)] text-white hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--auc-ink)]",
      secondary:
        "border-[var(--auc-ink)] bg-[var(--auc-lime)] text-[var(--auc-ink)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--auc-ink)]",
      outline:
        "border-[var(--auc-ink)] bg-transparent text-[var(--auc-ink)] hover:bg-[var(--auc-paper)]",
      ghost:
        "border-transparent bg-transparent text-[var(--auc-ink)] hover:bg-[rgba(14,14,16,0.06)]",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
