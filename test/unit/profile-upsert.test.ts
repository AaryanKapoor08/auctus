import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseOnboardingForm, upsertRoleProfile } from "@/lib/profile/upsert";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

function createProfileQuery(role: string | null) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: { role }, error: null }),
  };
}

function createSupabase(role: string | null) {
  const profileQuery = createProfileQuery(role);
  const rpc = vi.fn().mockResolvedValue({ error: null });
  const upsert = vi.fn().mockResolvedValue({ error: null });

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }),
    },
    from: vi.fn((table: string) => {
      if (table === "profile_match_tags") {
        return {
          upsert,
        };
      }

      return profileQuery;
    }),
    rpc,
    upsert,
  };
}

describe("profile onboarding upsert", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("parses and persists a business onboarding happy path", async () => {
    const form = new FormData();
    form.set("display_name", "Ada Founder");
    form.set("business_name", "Ada Labs");
    form.set("industry", "Technology");
    form.set("location", "NB");
    form.set("revenue", "250000");
    form.set("employees", "8");
    const supabase = createSupabase(null);
    mocks.createClient.mockResolvedValue(supabase);

    const input = parseOnboardingForm("business", form);
    await upsertRoleProfile(input);

    expect(input).toMatchObject({
      role: "business",
      display_name: "Ada Founder",
      business_name: "Ada Labs",
      revenue: 250000,
      employees: 8,
      match_tags: ["Business", "STEM", "Provincial"],
    });
    expect(supabase.rpc).toHaveBeenCalledWith("complete_onboarding", {
      p_role: "business",
      p_display_name: "Ada Founder",
      p_details: {
        business_name: "Ada Labs",
        industry: "Technology",
        location: "NB",
        revenue: 250000,
        employees: 8,
      },
    });
    expect(supabase.upsert).toHaveBeenCalledWith(
      {
        user_id: "user-1",
        role: "business",
        tags: ["Business", "STEM", "Provincial"],
      },
      { onConflict: "user_id" },
    );
  });

  it("rejects invalid role writes", async () => {
    const form = new FormData();
    form.set("display_name", "Invalid User");

    expect(() => parseOnboardingForm("founder", form)).toThrow("Invalid role");
  });

  it("rejects already-onboarded profiles before the RPC write", async () => {
    const supabase = createSupabase("student");
    mocks.createClient.mockResolvedValue(supabase);

    await expect(
      upsertRoleProfile({
        role: "student",
        display_name: "Ada Student",
        education_level: "undergrad",
        field_of_study: "Computer Science",
        institution: "UNB",
        province: "NB",
        gpa: 3.8,
        match_tags: ["Student", "Scholarship", "STEM", "Provincial"],
      }),
    ).rejects.toThrow("Profile is already onboarded");

    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
