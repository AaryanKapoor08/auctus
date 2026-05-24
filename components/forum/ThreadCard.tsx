import { MessageSquare } from "lucide-react";
import Link from "next/link";
import type { Role } from "@contracts/role";
import { cn } from "@/lib/utils";

interface ThreadCardProps {
  id: string;
  title: string;
  author: {
    name: string;
    role?: Role | null;
    businessName?: string;
  };
  category: string;
  preview: string;
  tags: string[];
  replyCount: number;
  timestamp: string;
  href?: string;
  onClick?: () => void;
}

function initials(name: string) {
  return (
    name
      .split(/[\s.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "A"
  );
}

export default function ThreadCard({
  id,
  title,
  author,
  category,
  preview,
  tags,
  replyCount,
  timestamp,
  href,
  onClick,
}: ThreadCardProps) {
  const content = (
    <div
      data-thread-id={id}
      onClick={onClick}
      className={cn(
        "auc-card-flat h-full p-5 text-[var(--auc-ink)] shadow-[3px_3px_0_var(--auc-ink)]",
        (href || onClick) && "auc-card-hover cursor-pointer",
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="mono rounded bg-[var(--auc-lime)] px-2 py-1 text-[0.68rem] font-black uppercase tracking-[0.06em] text-[var(--auc-ink)]">
          {category}
        </span>
        <span className="mono text-xs font-bold text-[var(--auc-muted)]">
          {timestamp}
        </span>
      </div>

      <h3 className="line-clamp-2 text-lg font-black leading-tight transition-colors hover:text-[var(--auc-purple-deep)]">
        {title}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--auc-ink-2)]">
        {preview}
      </p>

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="mono rounded border border-[var(--auc-rule)] px-2 py-1 text-[0.68rem] font-bold text-[var(--auc-ink-2)]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--auc-rule)] pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--auc-purple)] text-xs font-black text-white">
            {initials(author.name)}
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-black">{author.name}</div>
            <div className="mono truncate text-[0.68rem] font-bold uppercase tracking-[0.04em] text-[var(--auc-muted)]">
              {author.role ?? author.businessName ?? "onboarding"}
            </div>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="mono flex items-center gap-1 text-xs font-black">
            <MessageSquare className="h-3.5 w-3.5" />
            {replyCount}
          </div>
          <div className="mono mt-1 text-[0.62rem] font-bold uppercase tracking-[0.04em] text-[var(--auc-muted)]">
            replies
          </div>
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
