import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createReply,
  createThread,
  deleteReply,
  deleteThread,
  getThread,
  listThreads,
  markReplyHelpful,
} from "@/lib/forum/queries";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  getSession: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

vi.mock("@/lib/session/get-session", () => ({
  getSession: mocks.getSession,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

const threadRow = {
  id: "thread-1",
  title: "Funding question",
  content: "How should I prepare?",
  category: "Funding",
  tags: ["grant"],
  created_at: "2026-04-30T00:00:00.000Z",
  updated_at: "2026-04-30T00:00:00.000Z",
  author: { id: "user-1", display_name: "Ada", role: "business" },
  replies: [{ count: 1 }],
};

const replyRow = {
  id: "reply-1",
  thread_id: "thread-1",
  content: "Start with eligibility.",
  helpful_count: 0,
  created_at: "2026-04-30T00:00:00.000Z",
  updated_at: "2026-04-30T00:00:00.000Z",
  author: { id: "user-2", display_name: "Grace", role: "professor" },
};

describe("forum queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({ user_id: "user-1", role: "business" });
  });

  it("loads a thread with replies and author role badges", async () => {
    mocks.createClient.mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === "threads") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: threadRow, error: null }),
          };
        }

        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [replyRow], error: null }),
        };
      }),
    });

    await expect(getThread("thread-1")).resolves.toMatchObject({
      thread: {
        id: "thread-1",
        author: { display_name: "Ada", role: "business" },
        reply_count: 1,
      },
      replies: [
        {
          id: "reply-1",
          author: { display_name: "Grace", role: "professor" },
        },
      ],
    });
  });

  it("creates threads and replies for the authenticated onboarded author", async () => {
    const insert = vi.fn().mockReturnThis();
    const select = vi.fn().mockReturnThis();
    const single = vi.fn().mockResolvedValue({ data: { id: "thread-1" }, error: null });
    const from = vi.fn(() => ({ insert, select, single }));
    mocks.createClient.mockResolvedValue({ from });

    const form = new FormData();
    form.set("title", "Funding question");
    form.set("content", "How should I prepare?");
    form.set("category", "Funding");
    form.set("tags", "grant, nb");

    await expect(createThread(form)).resolves.toBe("thread-1");
    expect(insert).toHaveBeenCalledWith({
      author_id: "user-1",
      title: "Funding question",
      content: "How should I prepare?",
      category: "Funding",
      tags: ["grant", "nb"],
    });

    const replyForm = new FormData();
    replyForm.set("content", "Start with eligibility.");
    await createReply("thread-1", replyForm);
    expect(insert).toHaveBeenLastCalledWith({
      thread_id: "thread-1",
      author_id: "user-1",
      content: "Start with eligibility.",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/forum");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("marks replies helpful through the RPC instead of direct row updates", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 1, error: null });
    mocks.createClient.mockResolvedValue({ rpc });

    await expect(markReplyHelpful("reply-1")).resolves.toBe(1);
    expect(rpc).toHaveBeenCalledWith("mark_reply_helpful", {
      p_reply_id: "reply-1",
    });
  });

  it("sanitizes forum search input before building PostgREST or filters", async () => {
    const query = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [threadRow], error: null }),
    };
    mocks.createClient.mockResolvedValue({
      from: vi.fn(() => query),
    });

    await listThreads({ search: "grant),category.eq.Admin", limit: 1 });

    expect(query.or).toHaveBeenCalledWith(
      "title.ilike.%grant category eq Admin%,content.ilike.%grant category eq Admin%,category.ilike.%grant category eq Admin%",
    );
  });

  it("revalidates forum and dashboard lists after author deletes", async () => {
    let eqCalls = 0;
    const query = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn(() => {
        eqCalls += 1;
        return eqCalls % 2 === 0 ? Promise.resolve({ error: null }) : query;
      }),
    };
    mocks.createClient.mockResolvedValue({
      from: vi.fn(() => query),
    });

    await deleteThread("thread-1");
    await deleteReply("reply-1");

    expect(mocks.revalidatePath).toHaveBeenCalledWith("/forum");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard");
    expect(mocks.revalidatePath).toHaveBeenCalledTimes(4);
  });
});
