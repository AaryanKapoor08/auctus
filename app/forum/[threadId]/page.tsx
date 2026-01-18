"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Eye, ThumbsUp, MessageSquare } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import ReplyCard from "@/components/cards/ReplyCard";
import {
  getThreadById,
  getBusinessById,
  getRepliesByThreadId,
  formatRelativeTime,
  getRelatedGrants,
  getRelatedThreads,
} from "@/lib/data-utils";
import { useBusiness } from "@/lib/BusinessContext";
import Link from "next/link";

interface ThreadDetailPageProps {
  params: Promise<{ threadId: string }>;
}

export default function ThreadDetailPage({ params }: ThreadDetailPageProps) {
  const router = useRouter();
  const { currentBusiness } = useBusiness();
  const resolvedParams = use(params);
  const { threadId } = resolvedParams;

  // Get thread data
  const thread = getThreadById(threadId);
  
  // Handle 404 - thread not found
  if (!thread) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <Card>
            <div className="p-12 text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Thread Not Found
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                The thread you're looking for doesn't exist or has been removed.
              </p>
              <Button variant="primary" onClick={() => router.push("/forum")}>
                Back to Forum
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Get related data
  const author = getBusinessById(thread.authorId);
  const replies = getRepliesByThreadId(threadId);
  const relatedGrants = currentBusiness 
    ? getRelatedGrants(thread, currentBusiness.id) 
    : [];
  const relatedThreads = getRelatedThreads(thread);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        <button
          onClick={() => router.push("/forum")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Forum</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thread Header Card */}
            <Card>
              <div className="p-6">
                {/* Category Badge */}
                <div className="mb-4">
                  <Badge variant="default" size="md">
                    {thread.category}
                  </Badge>
                </div>

                {/* Thread Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {thread.title}
                </h1>

                {/* Author Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-lg">
                      {author?.name.charAt(0) || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{author?.name}</p>
                    <p className="text-sm text-gray-600">{author?.name}</p>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatRelativeTime(thread.timestamp)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{thread.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{thread.helpful} helpful</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{replies.length} replies</span>
                  </div>
                </div>

                {/* Tags */}
                {thread.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {thread.tags.map((tag, index) => (
                      <Badge key={index} variant="info" size="sm">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Thread Content */}
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {thread.content}
                  </p>
                </div>
              </div>
            </Card>

            {/* Replies Section */}
            <Card>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
                </h2>

                {replies.length > 0 ? (
                  <div className="space-y-4">
                    {replies.map((reply) => {
                      const replyAuthor = getBusinessById(reply.authorId);
                      return (
                        <ReplyCard
                          key={reply.id}
                          id={reply.id}
                          author={{
                            name: replyAuthor?.name || "Unknown User",
                            businessName: replyAuthor?.name || "Unknown Business",
                          }}
                          content={reply.content}
                          timestamp={formatRelativeTime(reply.timestamp)}
                          helpfulCount={reply.helpfulCount}
                          onHelpful={() => {
                            // Demo functionality - show toast
                            alert("Marked as helpful! (Demo - not saved)");
                          }}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No replies yet. Be the first to respond!</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Reply Input Box */}
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Add Your Reply
                </h3>
                <textarea
                  placeholder="Share your thoughts, advice, or experience..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={6}
                />
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    Your reply will help other business owners
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      alert("Reply posted successfully! (Demo - not saved)");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Post Reply
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* AI Suggestions Card */}
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">✨</span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI Recommendations
                  </h3>
                </div>

                {/* Related Grants */}
                {relatedGrants.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Relevant Grants
                    </h4>
                    <div className="space-y-3">
                      {relatedGrants.map((grant) => (
                        <Link
                          key={grant.id}
                          href={`/funding/${grant.id}`}
                          className="block"
                        >
                          <div className="bg-green-50 hover:bg-green-100 rounded-lg p-3 transition-colors border border-green-200">
                            <p className="font-medium text-gray-900 text-sm mb-1">
                              {grant.name}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="success" size="sm">
                                {grant.matchPercentage}% match
                              </Badge>
                              <span className="text-xs text-gray-600">
                                ${grant.amount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Threads */}
                {relatedThreads.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Similar Discussions
                    </h4>
                    <div className="space-y-3">
                      {relatedThreads.map((relatedThread) => (
                        <Link
                          key={relatedThread.id}
                          href={`/forum/${relatedThread.id}`}
                          className="block"
                        >
                          <div className="bg-gray-100 hover:bg-gray-200 rounded-lg p-3 transition-colors border border-gray-300">
                            <p className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                              {relatedThread.title}
                            </p>
                            <Badge variant="info" size="sm">
                              {relatedThread.category}
                            </Badge>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {relatedGrants.length === 0 && relatedThreads.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No related content found
                  </p>
                )}
              </div>
            </Card>

            {/* Connect with Author Card */}
            {author && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    About the Author
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="font-semibold text-gray-900 mb-1">
                      {author.name}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {author.industry}
                    </p>
                    <p className="text-sm text-gray-600">
                      📍 {author.location}
                    </p>
                  </div>
                  <Link href="/matchmaker">
                    <Button variant="outline" className="w-full">
                      View in Matchmaker
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
