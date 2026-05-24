import { ThumbsUp, Trash2 } from "lucide-react";
import Image from "next/image";
import type { Role } from "@contracts/role";
import { cn } from "@/lib/utils";

interface ReplyCardProps {
  id: string;
  author: {
    name: string;
    role?: Role | null;
    businessName?: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  helpfulCount?: number;
  onHelpful?: () => void;
  helpfulAction?: () => Promise<void>;
  deleteAction?: () => Promise<void>;
  isNested?: boolean;
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

export default function ReplyCard({
  id,
  author,
  content,
  timestamp,
  helpfulCount = 0,
  onHelpful,
  helpfulAction,
  deleteAction,
  isNested = false,
}: ReplyCardProps) {
  const helpfulButton = (
    <button
      type={helpfulAction ? "submit" : "button"}
      onClick={onHelpful}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-2 border-[var(--auc-ink)] px-3 py-1.5 text-sm font-bold transition",
        helpfulCount > 0 ? "bg-[var(--auc-lime)] text-[var(--auc-ink)]" : "bg-transparent text-[var(--auc-ink)] hover:bg-[var(--auc-bg-warm)]",
      )}
    >
      <ThumbsUp className="h-4 w-4" />
      Helpful · {helpfulCount}
    </button>
  );

  return (
    <article
      data-reply-id={id}
      className={cn(
        "auc-card-flat p-5",
        isNested && "ml-8 bg-[var(--auc-bg-warm)]",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {author.avatar ? (
            <Image
              src={author.avatar}
              alt={author.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--auc-coral)] text-sm font-black text-white">
              {initials(author.name)}
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate font-black text-[var(--auc-ink)]">{author.name}</div>
            <div className="mono mt-1 truncate text-[0.68rem] font-bold uppercase tracking-[0.04em] text-[var(--auc-muted)]">
              {author.role ?? author.businessName ?? "onboarding"} · {timestamp}
            </div>
          </div>
        </div>
        {deleteAction && (
          <form action={deleteAction}>
            <button
              type="submit"
              className="mono inline-flex items-center gap-1 rounded-full border border-[var(--auc-coral)] px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.06em] text-[#912f26]"
              aria-label="Delete reply"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </form>
        )}
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[var(--auc-ink-2)]">
        {content}
      </p>

      {(helpfulAction || onHelpful) && (
        <div className="mt-4">
          {helpfulAction && <form action={helpfulAction}>{helpfulButton}</form>}
          {!helpfulAction && onHelpful && helpfulButton}
        </div>
      )}
    </article>
  );
}
