import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  PROFILE_DISPLAY_NAME_MAX_CHARS,
  PROFILE_KEYWORD_MAX_CHARS,
  PROFILE_KEYWORD_MAX_COUNT,
  PROFILE_REQUIRED_TEXT_MAX_CHARS,
  parseOnboardingForm,
  upsertRoleProfile,
} from "@/lib/profile/upsert";

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

  it("rejects missing role-required student fields", () => {
    const form = new FormData();
    form.set("display_name", "Ada Student");
    form.set("education_level", "undergrad");

    expect(() => parseOnboardingForm("student", form)).toThrow(
      "Field of study is required",
    );
  });

  it("rejects missing professor matching fields", () => {
    const form = new FormData();
    form.set("display_name", "Ada Professor");
    form.set("career_stage", "early");

    expect(() => parseOnboardingForm("professor", form)).toThrow(
      "Research area is required",
    );
  });

  it("rejects negative numeric fields", () => {
    const form = new FormData();
    form.set("display_name", "Ada Founder");
    form.set("business_name", "Ada Labs");
    form.set("employees", "-1");

    expect(() => parseOnboardingForm("business", form)).toThrow(
      "Numeric fields must contain non-negative valid numbers",
    );
  });

  it("rejects oversized profile fields before persistence", () => {
    const form = new FormData();
    form.set("display_name", "a".repeat(PROFILE_DISPLAY_NAME_MAX_CHARS + 1));
    form.set("business_name", "Ada Labs");

    expect(() => parseOnboardingForm("business", form)).toThrow(
      `Display name must be ${PROFILE_DISPLAY_NAME_MAX_CHARS} characters or less`,
    );

    const business = new FormData();
    business.set("display_name", "Ada Founder");
    business.set("business_name", "a".repeat(PROFILE_REQUIRED_TEXT_MAX_CHARS + 1));

    expect(() => parseOnboardingForm("business", business)).toThrow(
      `Business name must be ${PROFILE_REQUIRED_TEXT_MAX_CHARS} characters or less`,
    );
  });

  it("bounds professor research keyword storage", () => {
    const tooManyKeywords = new FormData();
    tooManyKeywords.set("display_name", "Ada Professor");
    tooManyKeywords.set("research_area", "Computer Science");
    tooManyKeywords.set("career_stage", "early");
    tooManyKeywords.set(
      "research_keywords",
      Array.from({ length: PROFILE_KEYWORD_MAX_COUNT + 1 }, (_, index) => `kw${index}`).join(","),
    );

    expect(() => parseOnboardingForm("professor", tooManyKeywords)).toThrow(
      `Research keywords must include ${PROFILE_KEYWORD_MAX_COUNT} items or fewer`,
    );

    const longKeyword = new FormData();
    longKeyword.set("display_name", "Ada Professor");
    longKeyword.set("research_area", "Computer Science");
    longKeyword.set("career_stage", "early");
    longKeyword.set("research_keywords", "a".repeat(PROFILE_KEYWORD_MAX_CHARS + 1));

    expect(() => parseOnboardingForm("professor", longKeyword)).toThrow(
      `Research keyword must be ${PROFILE_KEYWORD_MAX_CHARS} characters or less`,
    );
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
