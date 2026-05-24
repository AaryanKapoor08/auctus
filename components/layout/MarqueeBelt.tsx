import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

type MarqueeBeltProps = {
  items: string[];
  slow?: boolean;
  className?: string;
  trackClassName?: string;
  ariaLabel?: string;
};

export default function MarqueeBelt({
  items,
  slow = false,
  className,
  trackClassName,
  ariaLabel = "Live funding updates",
}: MarqueeBeltProps) {
  const visibleItems = items.filter(Boolean);

  if (visibleItems.length === 0) return null;

  return (
    <div className={cn("auc-marquee", className)} aria-label={ariaLabel}>
      <div
        className={cn(
          "auc-marquee-track mono text-[0.8rem] font-black uppercase tracking-[0.06em]",
          slow && "slow",
          trackClassName,
        )}
        style={
          {
            "--auc-marquee-duration": slow ? "60s" : "38s",
          } as CSSProperties
        }
      >
        {[0, 1].map((round) => (
          <div
            key={round}
            className="auc-marquee-group"
            aria-hidden={round === 1}
          >
            {visibleItems.map((item) => (
              <span key={`${round}-${item}`} className="inline-flex items-center gap-5">
                <span>* {item}</span>
                <span className="opacity-55">+</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
