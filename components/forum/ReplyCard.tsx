import { Clock, ThumbsUp, Trash2, User } from "lucide-react";
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
  return (
    <div
      data-reply-id={id}
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-5 transition-shadow duration-200",
        isNested ? "ml-8 bg-gray-50" : "hover:shadow-sm"
      )}
    >
      {/* Author Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {author.avatar ? (
            <Image
              src={author.avatar}
              alt={author.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-5 w-5 text-primary-600" />
            </div>
          )}
        </div>

        {/* Author Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">{author.name}</span>
            <span className="text-gray-400">•</span>
            {author.role ? (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                {author.role}
              </span>
            ) : (
              <span className="text-sm text-gray-600">
                {author.businessName ?? "onboarding"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
            <Clock className="h-3 w-3" />
            <span>{timestamp}</span>
          </div>
        </div>
      </div>

      {/* Reply Content */}
      <div className="ml-13 mb-3">
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="ml-13 flex items-center gap-4">
        {helpfulAction && (
          <form action={helpfulAction}>
            <button
              type="submit"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors duration-200",
                helpfulCount > 0
                  ? "bg-primary-50 text-primary-700 hover:bg-primary-100"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="font-medium">
                {helpfulCount > 0 ? `Helpful (${helpfulCount})` : "Helpful"}
              </span>
            </button>
          </form>
        )}
        {!helpfulAction && onHelpful && (
          <button
            onClick={onHelpful}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors duration-200",
              helpfulCount > 0
                ? "bg-primary-50 text-primary-700 hover:bg-primary-100"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <ThumbsUp className="h-4 w-4" />
            <span className="font-medium">
              {helpfulCount > 0 ? `Helpful (${helpfulCount})` : "Helpful"}
            </span>
          </button>
        )}
        {deleteAction && (
          <form action={deleteAction} className="ml-auto">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-700 transition-colors duration-200 hover:bg-red-50"
              aria-label="Delete reply"
            >
              <Trash2 className="h-4 w-4" />
              <span className="font-medium">Delete</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
