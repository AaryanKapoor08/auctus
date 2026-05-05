import { beforeEach, describe, expect, it, vi } from "vitest";
import { getRoleProfile } from "@/lib/profile/queries";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

const baseProfile = {
  id: "user-1",
  display_name: "Ada User",
  email: "ada@example.com",
  avatar_url: null,
  created_at: "2026-04-30T00:00:00.000Z",
  updated_at: "2026-04-30T00:00:00.000Z",
};

function query(data: unknown) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data, error: null }),
  };
}

function mockTables(tables: Record<string, unknown>) {
  mocks.createClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-1", email: "ada@example.com" } },
      }),
    },
    from: vi.fn((table: string) => query(tables[table])),
  });
}

describe("getRoleProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns business role profiles", async () => {
    mockTables({
      profiles: { ...baseProfile, role: "business" },
      business_profiles: {
        id: "user-1",
        business_name: "Ada Labs",
        industry: "Technology",
        location: "NB",
        revenue: 250000,
        employees: 8,
        description: null,
        year_established: null,
        website: null,
      },
    });

    await expect(getRoleProfile("user-1")).resolves.toMatchObject({
      role: "business",
      base: { role: "business", email: "ada@example.com" },
      details: { business_name: "Ada Labs" },
    });
  });

  it("does not depend on selecting profile email from the public table", async () => {
    const select = vi.fn().mockReturnThis();
    const eq = vi.fn().mockReturnThis();
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { ...baseProfile, email: undefined, role: null },
      error: null,
    });
    mocks.createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-1", email: "ada@example.com" } },
        }),
      },
      from: vi.fn(() => ({ select, eq, maybeSingle })),
    });

    await getRoleProfile("user-1");

    expect(select).toHaveBeenCalledWith(
      "id, role, display_name, avatar_url, created_at, updated_at",
    );
  });

  it("returns student role profiles", async () => {
    mockTables({
      profiles: { ...baseProfile, role: "student" },
      student_profiles: {
        id: "user-1",
        education_level: "undergrad",
        field_of_study: "Computer Science",
        institution: "UNB",
        province: "NB",
        gpa: 3.8,
        graduation_year: null,
      },
    });

    await expect(getRoleProfile("user-1")).resolves.toMatchObject({
      role: "student",
      base: { role: "student" },
      details: { education_level: "undergrad" },
    });
  });

  it("returns professor role profiles", async () => {
    mockTables({
      profiles: { ...baseProfile, role: "professor" },
      professor_profiles: {
        id: "user-1",
        institution: "UNB",
        department: "Engineering",
        research_area: "Clean energy",
        career_stage: "mid",
        h_index: null,
        research_keywords: ["hydrogen", "storage"],
      },
    });

    await expect(getRoleProfile("user-1")).resolves.toMatchObject({
      role: "professor",
      base: { role: "professor" },
      details: { research_area: "Clean energy" },
    });
  });

  it("returns null before a user selects a role", async () => {
    mockTables({
      profiles: { ...baseProfile, role: null },
    });

    await expect(getRoleProfile("user-1")).resolves.toBeNull();
  });
});
