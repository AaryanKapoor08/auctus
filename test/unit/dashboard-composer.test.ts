import { describe, expect, it } from "vitest";
import {
  composeDashboard,
  isWithinNextDays,
  selectUpcomingDeadlines,
  NO_UPCOMING_DEADLINES_TEXT,
} from "@/lib/dashboard/composer";
import type { FundingSummary } from "@contracts/funding";
import type { ForumThread } from "@/lib/forum/queries";

const now = new Date("2026-04-30T00:00:00.000Z");

function summary(partial: Partial<FundingSummary> & { id: string }): FundingSummary {
  return {
    id: partial.id,
    type: partial.type ?? "business_grant",
    name: partial.name ?? `Grant ${partial.id}`,
    provider: partial.provider ?? "Gov of Canada",
    amount_max: partial.amount_max ?? null,
    deadline: partial.deadline ?? null,
    match_score: partial.match_score ?? null,
  };
}

function thread(partial: Partial<ForumThread> & { id: string }): ForumThread {
  return {
    id: partial.id,
    title: partial.title ?? `Thread ${partial.id}`,
    content: partial.content ?? "",
    category: partial.category ?? "Funding",
    tags: partial.tags ?? [],
    created_at: partial.created_at ?? now.toISOString(),
    updated_at: partial.updated_at ?? now.toISOString(),
    author: partial.author ?? {
      id: `author-${partial.id}`,
      display_name: "Test User",
      role: "business",
    },
    reply_count: partial.reply_count ?? 0,
  };
}

describe("isWithinNextDays", () => {
  it("returns true when the deadline falls inside the window", () => {
    expect(isWithinNextDays("2026-05-15", now, 30)).toBe(true);
  });

  it("returns false for past deadlines", () => {
    expect(isWithinNextDays("2026-04-01", now, 30)).toBe(false);
  });

  it("keeps date-only deadlines for the current day through the whole day", () => {
    const afternoon = new Date("2026-04-30T18:30:00.000Z");
    expect(isWithinNextDays("2026-04-30", afternoon, 30)).toBe(true);
  });

  it("returns false beyond the window", () => {
    expect(isWithinNextDays("2026-07-01", now, 30)).toBe(false);
  });

  it("returns false for null or unparseable input", () => {
    expect(isWithinNextDays(null, now, 30)).toBe(false);
    expect(isWithinNextDays("rolling", now, 30)).toBe(false);
  });
});

describe("selectUpcomingDeadlines", () => {
  it("filters to the next 30 days and sorts nearest first", () => {
    const items = [
      summary({ id: "far", deadline: "2026-08-01" }),
      summary({ id: "soon", deadline: "2026-05-05" }),
      summary({ id: "later", deadline: "2026-05-25" }),
      summary({ id: "past", deadline: "2026-04-01" }),
      summary({ id: "rolling", deadline: null }),
    ];
    const upcoming = selectUpcomingDeadlines(items, now);
    expect(upcoming.map((s) => s.id)).toEqual(["soon", "later"]);
  });
});

describe("composeDashboard", () => {
  it("returns top matches verbatim, filtered upcoming deadlines, and trimmed threads", () => {
    const topMatches = [summary({ id: "m1" }), summary({ id: "m2" })];
    const candidates = [
      summary({ id: "soon", deadline: "2026-05-05" }),
      summary({ id: "far", deadline: "2026-09-01" }),
    ];
    const threads = Array.from({ length: 8 }, (_, i) => thread({ id: `t${i}` }));

    const data = composeDashboard({
      topMatches,
      candidateDeadlines: candidates,
      threads,
      asOf: now,
      forumLimit: 5,
    });

    expect(data.topMatches).toEqual(topMatches);
    expect(data.upcomingDeadlines.map((s) => s.id)).toEqual(["soon"]);
    expect(data.recentThreads).toHaveLength(5);
  });

  it("returns an empty upcomingDeadlines array when nothing falls in the window", () => {
    const data = composeDashboard({
      topMatches: [],
      candidateDeadlines: [summary({ id: "x", deadline: "2026-09-01" })],
      threads: [],
      asOf: now,
    });
    expect(data.upcomingDeadlines).toEqual([]);
  });
});

describe("NO_UPCOMING_DEADLINES_TEXT", () => {
  it("matches the spec wording exactly", () => {
    expect(NO_UPCOMING_DEADLINES_TEXT).toBe("No upcoming deadlines.");
  });
});
