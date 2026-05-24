import Link from "next/link";
import { Plus, Search, X } from "lucide-react";
import Button from "@/components/ui/Button";
import ThreadCard from "@/components/forum/ThreadCard";
import { FORUM_CATEGORIES, listThreads } from "@/lib/forum/queries";
import { cn } from "@/lib/utils";

type SearchParams = Promise<{ category?: string; search?: string }>;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function ForumPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const threads = await listThreads({
    category: params.category,
    search: params.search,
  });
  const baseParams = new URLSearchParams();
  if (params.search) baseParams.set("search", params.search);

  return (
    <div className="auc-page min-h-screen pb-20">
      <div className="auc-reference-section py-14">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="auc-label">04 · Forum</div>
            <h1 className="display mt-3 text-6xl leading-[0.92] tracking-[-0.035em] md:text-8xl">Community forum</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--auc-ink-2)]">
              Real notes from people who have applied. Compare reviewer feedback,
              share templates, and tag the questions that actually got answered.
            </p>
          </div>
          <Link href="/forum/new">
            <Button className="gap-2 px-5 py-4">
              New thread
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--auc-lime)] text-[var(--auc-ink)]">
                <Plus className="h-4 w-4" />
              </span>
            </Button>
          </Link>
        </div>

        <form className="auc-card-flat mb-4 p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--auc-muted)]" />
              <input
                name="search"
                defaultValue={params.search}
                placeholder="Search threads, authors, tags..."
                className="auc-field w-full py-2 pl-10 pr-4"
              />
              {params.category && (
                <input type="hidden" name="category" value={params.category} />
              )}
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </div>
        </form>

        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href={params.search ? `?${baseParams.toString()}` : "?"}
            className={cn(
              "rounded-full border-2 px-4 py-2 text-sm font-bold transition",
              !params.category
                ? "border-[var(--auc-ink)] bg-[var(--auc-ink)] text-white"
                : "border-[var(--auc-rule-strong)] bg-[var(--auc-paper)] text-[var(--auc-ink)] hover:bg-[var(--auc-bg-warm)]",
            )}
          >
            All
          </Link>
          {FORUM_CATEGORIES.map((category) => {
            const query = new URLSearchParams(baseParams);
            query.set("category", category);
            const active = params.category === category;

            return (
              <Link
                key={category}
                href={`?${query.toString()}`}
                className={cn(
                  "rounded-full border-2 px-4 py-2 text-sm font-bold transition",
                  active
                    ? "border-[var(--auc-ink)] bg-[var(--auc-ink)] text-white"
                    : "border-[var(--auc-rule-strong)] bg-[var(--auc-paper)] text-[var(--auc-ink)] hover:bg-[var(--auc-bg-warm)]",
                )}
              >
                {category}
              </Link>
            );
          })}
          {(params.search || params.category) && (
            <Link
              href="?"
              className="mono inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.06em] text-[var(--auc-coral)]"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Link>
          )}
        </div>

        {threads.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {threads.map((thread) => (
              <ThreadCard
                key={thread.id}
                id={thread.id}
                title={thread.title}
                author={{
                  name: thread.author.display_name || "Unknown user",
                  role: thread.author.role,
                }}
                category={thread.category}
                preview={thread.content}
                tags={thread.tags}
                replyCount={thread.reply_count}
                timestamp={formatDate(thread.created_at)}
                href={`/forum/${thread.id}`}
              />
            ))}
          </div>
        ) : (
          <div className="auc-card-flat border-dashed p-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-[var(--auc-muted)]" />
            <h2 className="display text-3xl leading-tight text-[var(--auc-ink)]">No threads found</h2>
            <p className="mt-3 text-[var(--auc-ink-2)]">
              Start a discussion or adjust the current filters.
            </p>
            <Link href="/forum/new" className="mt-6 inline-flex">
              <Button>Start a thread</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
