import { MessageSquare, Clock } from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Role } from "@contracts/role";

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

const categoryColors: Record<string, "blue" | "green" | "purple" | "orange" | "yellow" | "red" | "gray"> = {
  "Ask for Help": "blue",
  "Collaboration Opportunities": "green",
  "Hiring & Local Talent": "purple",
  "Marketplace": "orange",
  "Business Ideas": "yellow",
  "Announcements": "red",
};

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
  const categoryColor = (categoryColors[category] || "gray") as "blue" | "green" | "purple" | "orange" | "yellow" | "red" | "gray";

  const content = (
    <div
      data-thread-id={id}
      onClick={onClick}
      className={cn(
        "h-full rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200",
        (href || onClick) && "cursor-pointer hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md",
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
            {title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">{author.name}</span>
            <span className="text-gray-400">•</span>
            {author.role ? (
              <Badge variant="info" size="sm">
                {author.role}
              </Badge>
            ) : (
              <span>{author.businessName ?? "onboarding"}</span>
            )}
          </div>
        </div>
        <Badge color={categoryColor} size="sm">
          {category}
        </Badge>
      </div>

      {/* Preview */}
      <p className="mb-4 line-clamp-2 text-sm leading-6 text-gray-600">{preview}</p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-500">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
