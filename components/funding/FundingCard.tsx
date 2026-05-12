import Link from "next/link";
import { ArrowRight, Calendar, DollarSign, Tag } from "lucide-react";
import type { FundingItem } from "@contracts/funding";
import Badge from "@/components/ui/Badge";

function formatAmount(item: FundingItem) {
  if (item.amount_min && item.amount_max) {
    return `$${item.amount_min.toLocaleString()} - $${item.amount_max.toLocaleString()}`;
  }

  if (item.amount_max) {
    return `Up to $${item.amount_max.toLocaleString()}`;
  }

  return "Amount varies";
}

function formatDeadline(deadline: string | null) {
  if (!deadline) return "Rolling deadline";

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(deadline));
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
      className="group flex h-full flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {item.category && <Badge color="gray">{item.category}</Badge>}
          <h2 className="mt-3 line-clamp-2 text-lg font-semibold text-gray-900 transition group-hover:text-primary-700">
            {item.name}
          </h2>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{item.provider}</p>
        </div>
        <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-700" />
      </div>

      {item.description && (
        <p className="mb-5 line-clamp-3 flex-1 text-sm leading-6 text-gray-700">
          {item.description}
        </p>
      )}

      <div className="mt-auto flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
          <DollarSign className="h-4 w-4" />
          {formatAmount(item)}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">
          <Calendar className="h-4 w-4" />
          {formatDeadline(item.deadline)}
        </span>
        {item.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700"
          >
            <Tag className="h-3.5 w-3.5" />
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
