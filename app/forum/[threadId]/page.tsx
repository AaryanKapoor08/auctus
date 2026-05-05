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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-6">
        <Link
          href="/forum"
          className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to forum</span>
        </Link>

        <div className="space-y-6">
          <Card className="border border-gray-200">
            <div className="mb-4 flex items-center justify-between gap-3">
              <Badge variant="default">{thread.category}</Badge>
              {canDeleteThread && (
                <form action={removeThread}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete thread
                  </button>
                </form>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{thread.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="font-medium text-gray-900">
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
            <p className="mt-6 whitespace-pre-wrap text-gray-700">{thread.content}</p>
          </Card>

          <Card
            className="border border-gray-200"
            header={
              <h2 className="text-xl font-semibold text-gray-900">
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
                      helpfulAction={helpfulAction}
                      deleteAction={canDeleteReply ? removeReply : undefined}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <MessageSquare className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <p>No replies yet. Be the first to respond.</p>
              </div>
            )}
          </Card>

          <Card className="border border-gray-200">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Add a reply</h2>
            <form action={addReply} className="space-y-4">
              <textarea
                name="content"
                required
                rows={6}
                placeholder="Share your experience or answer..."
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex justify-end">
                <Button type="submit">Post reply</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
