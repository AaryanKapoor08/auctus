import React from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

const Card = ({ children, className, header, footer }: CardProps) => {
  return (
    <div className={cn("auc-card-flat", className)}>
      {header && (
        <div className="border-b border-[var(--auc-rule)] px-6 py-4">
          {header}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="rounded-b-[12px] border-t border-[var(--auc-rule)] bg-[var(--auc-bg-warm)] px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
