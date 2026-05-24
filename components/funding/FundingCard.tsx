import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { FundingItem } from "@contracts/funding";

export function formatFundingAmount(item: FundingItem) {
  if (item.amount_min && item.amount_max) {
    return `$${item.amount_min.toLocaleString("en-CA")} - $${item.amount_max.toLocaleString("en-CA")}`;
  }

  if (item.amount_max) {
    return `Up to $${item.amount_max.toLocaleString("en-CA")}`;
  }

  return "Amount varies";
}

export function formatFundingDeadline(deadline: string | null) {
  if (!deadline) return "Rolling";
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return "Date varies";

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function kindLabel(item: FundingItem) {
  if (item.type === "business_grant") return "Grant";
  if (item.type === "scholarship") return "Scholarship";
  return "Research";
}

function kindClasses(item: FundingItem) {
  if (item.type === "business_grant") {
    return "bg-[var(--auc-purple-soft)] text-[var(--auc-purple-deep)]";
  }

  if (item.type === "scholarship") {
    return "bg-[var(--auc-coral-soft)] text-[#912f26]";
  }

  return "bg-[var(--auc-lime-soft)] text-[#40570b]";
}

export default function FundingCard({
  item,
  href,
}: {
  item: FundingItem;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="auc-card-flat auc-card-hover group flex h-full min-h-60 flex-col gap-2 p-5 text-[var(--auc-ink)] shadow-[3px_3px_0_var(--auc-ink)]"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className={`mono rounded px-2 py-1 text-[0.68rem] font-black uppercase tracking-[0.06em] ${kindClasses(item)}`}>
          {kindLabel(item)}
        </span>
        <span className="mono rounded-full border border-[var(--auc-rule)] bg-[var(--auc-bg)] px-3 py-1 text-[0.72rem] font-black text-[var(--auc-coral)]">
          {formatFundingDeadline(item.deadline)}
        </span>
      </div>

      <h2 className="line-clamp-2 text-lg font-black leading-tight transition group-hover:text-[var(--auc-purple-deep)]">
        {item.name}
      </h2>
      <p className="mt-2 line-clamp-2 text-sm text-[var(--auc-muted)]">{item.provider}</p>

      {item.description && (
        <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-[var(--auc-ink-2)]">
          {item.description}
        </p>
      )}

      <div className="mt-3 flex items-end justify-between gap-4 border-t border-[var(--auc-rule)] pt-4">
        <div>
          <div className="display text-2xl leading-none">{formatFundingAmount(item)}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(item.tags.length > 0 ? item.tags : item.category ? [item.category] : []).slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="mono rounded border border-[var(--auc-rule)] px-2 py-1 text-[0.65rem] font-bold text-[var(--auc-ink-2)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-[var(--auc-ink)] transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
