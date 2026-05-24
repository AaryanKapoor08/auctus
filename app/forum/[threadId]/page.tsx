import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ArrowLeft, MessageSquare, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ReplyCard from "@/components/forum/ReplyCard";
import {
  createReply,
  deleteReply,
  deleteThread,
  getThread,
  markReplyHelpful,
} from "@/lib/forum/queries";
import { getSession } from "@/lib/session/get-session";

type PageProps = {
  params: Promise<{ threadId: string }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function ThreadDetailPage({ params }: PageProps) {
  const { threadId } = await params;
  const [data, session] = await Promise.all([getThread(threadId), getSession()]);

  if (!data) {
    notFound();
  }

  const { thread, replies } = data;
  const currentUserId = session?.user_id ?? null;
  const canDeleteThread = Boolean(currentUserId) && thread.author.id === currentUserId;

  async function addReply(formData: FormData) {
    "use server";

    await createReply(threadId, formData);
    revalidatePath(`/forum/${threadId}`);
  }

  async function removeThread() {
    "use server";

    await deleteThread(threadId);
    revalidatePath("/forum");
    redirect("/forum");
  }

  return (
    <div className="auc-page min-h-screen py-12">
      <div className="auc-reference-section max-w-5xl">
        <Link
          href="/forum"
          className="mono mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.06em] text-[var(--auc-muted)] transition-colors hover:text-[var(--auc-ink)]"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to forum</span>
        </Link>

        <div className="space-y-6">
          <Card className="shadow-[6px_6px_0_var(--auc-ink)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <Badge variant="success">{thread.category}</Badge>
              {canDeleteThread && (
                <form action={removeThread}>
                  <button
                    type="submit"
                    className="mono inline-flex items-center gap-1.5 rounded-full border border-[var(--auc-coral)] bg-transparent px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.06em] text-[#912f26]"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete thread
                  </button>
                </form>
              )}
            </div>
            <h1 className="display text-5xl leading-[0.95] tracking-[-0.03em] md:text-6xl">{thread.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--auc-ink-2)]">
              <span className="font-black text-[var(--auc-ink)]">
                {thread.author.display_name || "Unknown user"}
              </span>
              <Badge variant="info" size="sm">
                {thread.author.role ?? "onboarding"}
              </Badge>
              <span>{formatDate(thread.created_at)}</span>
              <span>{replies.length} replies</span>
            </div>
            {thread.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {thread.tags.map((tag) => (
                  <Badge key={tag} variant="info" size="sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
            <p className="mt-6 whitespace-pre-wrap text-base leading-8 text-[var(--auc-ink-2)]">{thread.content}</p>
          </Card>

          <Card
            className="shadow-[4px_4px_0_var(--auc-ink)]"
            header={
              <h2 className="display text-3xl leading-none text-[var(--auc-ink)]">
                {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
              </h2>
            }
          >
            {replies.length > 0 ? (
              <div className="space-y-4">
                {replies.map((reply) => {
                  const canDeleteReply =
                    Boolean(currentUserId) && reply.author.id === currentUserId;

                  async function helpfulAction() {
                    "use server";

                    await markReplyHelpful(reply.id);
                    revalidatePath(`/forum/${threadId}`);
                  }

                  async function removeReply() {
                    "use server";

                    await deleteReply(reply.id);
                    revalidatePath(`/forum/${threadId}`);
                  }

                  return (
                    <ReplyCard
                      key={reply.id}
                      id={reply.id}
                      author={{
                        name: reply.author.display_name || "Unknown user",
                        role: reply.author.role,
                      }}
                      content={reply.content}
                      timestamp={formatDate(reply.created_at)}
                      helpfulCount={reply.helpful_count}
                      helpfulAction={currentUserId ? helpfulAction : undefined}
                      deleteAction={canDeleteReply ? removeReply : undefined}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-[var(--auc-muted)]">
                <MessageSquare className="mx-auto mb-3 h-12 w-12" />
                <p>No replies yet. Be the first to respond.</p>
              </div>
            )}
          </Card>

          {currentUserId ? (
            <Card className="shadow-[4px_4px_0_var(--auc-ink)]">
              <h2 className="auc-label mb-4">Add a reply</h2>
              <form action={addReply} className="space-y-4">
                <textarea
                  name="content"
                  required
                  rows={6}
                  placeholder="Share your experience or answer..."
                  className="auc-field w-full resize-none px-4 py-3"
                />
                <div className="flex justify-end">
                  <Button type="submit">Post reply</Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card className="bg-[var(--auc-purple-soft)] shadow-[4px_4px_0_var(--auc-ink)]">
              <h2 className="auc-label mb-3 text-[var(--auc-purple-deep)]">Join the conversation</h2>
              <p className="text-sm leading-6 text-[var(--auc-ink)]">
                Forum threads are public to read. Sign in to reply, mark answers helpful,
                or start a new thread.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/sign-in">
                  <Button size="sm" variant="outline">Sign in</Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm">Join</Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
