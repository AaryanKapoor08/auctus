import "server-only";

import { revalidatePath } from "next/cache";
import type { Role } from "@contracts/role";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/session/get-session";
import { buildIlikeOrFilter } from "@/lib/supabase/postgrest-filters";
import { timeServer } from "@/lib/perf/server-timing";

export const FORUM_CATEGORIES = [
  "Funding",
  "Collaboration",
  "Research",
  "Hiring",
  "Operations",
  "Announcements",
] as const;

export const FORUM_TITLE_MAX_CHARS = 160;
export const FORUM_THREAD_CONTENT_MAX_CHARS = 5000;
export const FORUM_REPLY_CONTENT_MAX_CHARS = 2500;
export const FORUM_TAG_MAX_CHARS = 32;

export type ForumAuthor = {
  id: string;
  display_name: string;
  role: Role | null;
};

export type ForumThread = {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  author: ForumAuthor;
  reply_count: number;
};

export type ForumReply = {
  id: string;
  thread_id: string;
  content: string;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  author: ForumAuthor;
};

type AuthorRow = ForumAuthor | ForumAuthor[] | null;
type CountRow = { count: number } | Array<{ count: number }> | null;

type ThreadRow = Omit<ForumThread, "author" | "reply_count"> & {
  author: AuthorRow;
  replies?: CountRow;
};

type ReplyRow = Omit<ForumReply, "author"> & {
  author: AuthorRow;
};

function first<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function fallbackAuthor(): ForumAuthor {
  return {
    id: "unknown",
    display_name: "Unknown user",
    role: null,
  };
}

function textLength(value: string) {
  return Array.from(value).length;
}

function requireBoundedText(value: FormDataEntryValue | null, label: string, maxChars: number) {
  const text = typeof value === "string" ? value.trim() : "";

  if (!text) {
    throw new Error(`${label} is required`);
  }

  if (textLength(text) > maxChars) {
    throw new Error(`${label} must be ${maxChars} characters or less`);
  }

  return text;
}

function mapThread(row: ThreadRow): ForumThread {
  const count = first(row.replies);

  return {
    id: row.id,
    title: row.title,
    content: row.content,
    category: row.category,
    tags: row.tags ?? [],
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: first(row.author) ?? fallbackAuthor(),
    reply_count: count?.count ?? 0,
  };
}

function mapReply(row: ReplyRow): ForumReply {
  return {
    id: row.id,
    thread_id: row.thread_id,
    content: row.content,
    helpful_count: row.helpful_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: first(row.author) ?? fallbackAuthor(),
  };
}

function parseTags(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];

  return value
    .split(",")
    .map((tag) =>
      Array.from(tag.trim().replace(/^#/, "").toLowerCase())
        .slice(0, FORUM_TAG_MAX_CHARS)
        .join(""),
    )
    .filter(Boolean)
    .slice(0, 5);
}

function parseCategory(value: FormDataEntryValue | null) {
  const category = String(value ?? "").trim();

  if (!FORUM_CATEGORIES.includes(category as (typeof FORUM_CATEGORIES)[number])) {
    throw new Error("Invalid forum category");
  }

  return category;
}

async function requireSession() {
  const session = await getSession();

  if (!session?.user_id || !session.role) {
    throw new Error("Onboarded authentication required");
  }

  return session;
}

function revalidateForumLists() {
  revalidatePath("/forum");
  revalidatePath("/dashboard");
}

export async function listThreads({
  category,
  search,
  limit,
}: {
  category?: string;
  search?: string;
  limit?: number;
} = {}): Promise<ForumThread[]> {
  return timeServer(
    "listThreads",
    async () => {
      const supabase = await createClient();
      let request = supabase
        .from("threads")
        .select(
          "id,title,content,category,tags,created_at,updated_at,author:profiles!threads_author_id_fkey(id,display_name,role),replies(count)",
        )
        .order("created_at", { ascending: false });

      if (category && category !== "All") {
        request = request.eq("category", category);
      }

      if (search) {
        const searchFilter = buildIlikeOrFilter(
          ["title", "content", "category"],
          search,
        );

        if (searchFilter) {
          request = request.or(searchFilter);
        }
      }

      if (limit) {
        request = request.limit(limit);
      }

      const { data, error } = await request;

      if (error) throw error;

      return ((data ?? []) as ThreadRow[]).map(mapThread);
    },
    { limit: limit ?? "all", hasSearch: Boolean(search), hasCategory: Boolean(category) },
  );
}

export async function getThread(threadId: string): Promise<{
  thread: ForumThread;
  replies: ForumReply[];
} | null> {
  const supabase = await createClient();
  const { data: thread, error: threadError } = await supabase
    .from("threads")
    .select(
      "id,title,content,category,tags,created_at,updated_at,author:profiles!threads_author_id_fkey(id,display_name,role),replies(count)",
    )
    .eq("id", threadId)
    .maybeSingle();

  if (threadError) throw threadError;
  if (!thread) return null;

  const { data: replies, error: repliesError } = await supabase
    .from("replies")
    .select(
      "id,thread_id,content,helpful_count,created_at,updated_at,author:profiles!replies_author_id_fkey(id,display_name,role)",
    )
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (repliesError) throw repliesError;

  return {
    thread: mapThread(thread as ThreadRow),
    replies: ((replies ?? []) as ReplyRow[]).map(mapReply),
  };
}

export async function createThread(formData: FormData) {
  const session = await requireSession();
  const title = requireBoundedText(
    formData.get("title"),
    "Title",
    FORUM_TITLE_MAX_CHARS,
  );
  const content = requireBoundedText(
    formData.get("content"),
    "Content",
    FORUM_THREAD_CONTENT_MAX_CHARS,
  );
  const category = parseCategory(formData.get("category"));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("threads")
    .insert({
      author_id: session.user_id,
      title,
      content,
      category,
      tags: parseTags(formData.get("tags")),
    })
    .select("id")
    .single();

  if (error) throw error;

  revalidateForumLists();

  return data.id as string;
}

export async function createReply(threadId: string, formData: FormData) {
  const session = await requireSession();
  const content = requireBoundedText(
    formData.get("content"),
    "Reply content",
    FORUM_REPLY_CONTENT_MAX_CHARS,
  );

  const supabase = await createClient();
  const { error } = await supabase.from("replies").insert({
    thread_id: threadId,
    author_id: session.user_id,
    content,
  });

  if (error) throw error;

  revalidateForumLists();
}

export async function markReplyHelpful(replyId: string) {
  await requireSession();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("mark_reply_helpful", {
    p_reply_id: replyId,
  });

  if (error) throw error;

  return data as number;
}

export async function deleteThread(threadId: string) {
  const session = await requireSession();

  const supabase = await createClient();
  const { error } = await supabase
    .from("threads")
    .delete()
    .eq("id", threadId)
    .eq("author_id", session.user_id);

  if (error) throw error;

  revalidateForumLists();
}

export async function deleteReply(replyId: string) {
  const session = await requireSession();

  const supabase = await createClient();
  const { error } = await supabase
    .from("replies")
    .delete()
    .eq("id", replyId)
    .eq("author_id", session.user_id);

  if (error) throw error;

  revalidateForumLists();
}
