import type {
  ProfessorProfile,
  StudentProfile,
} from "@contracts/profile";
import { isRole, type Role } from "@contracts/role";
import { createClient } from "@/lib/supabase/server";

export type BusinessOnboardingInput = {
  role: "business";
  display_name: string;
  business_name: string;
  industry: string | null;
  location: string | null;
  revenue: number | null;
  employees: number | null;
  match_tags: string[];
};

export type StudentOnboardingInput = {
  role: "student";
  display_name: string;
  education_level: StudentProfile["education_level"];
  field_of_study: string | null;
  institution: string | null;
  province: string | null;
  gpa: number | null;
  match_tags: string[];
};

export type ProfessorOnboardingInput = {
  role: "professor";
  display_name: string;
  institution: string | null;
  department: string | null;
  research_area: string | null;
  career_stage: ProfessorProfile["career_stage"];
  research_keywords: string[];
  match_tags: string[];
};

export type OnboardingInput =
  | BusinessOnboardingInput
  | StudentOnboardingInput
  | ProfessorOnboardingInput;

const educationLevels = new Set([
  "high_school",
  "college",
  "undergrad",
  "masters",
  "phd",
]);

const careerStages = new Set(["early", "mid", "senior", "emeritus"]);

function requireText(value: string, label: string) {
  if (!value.trim()) {
    throw new Error(`${label} is required`);
  }
}

function optionalText(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text.length > 0 ? text : null;
}

function optionalNumber(value: FormDataEntryValue | null) {
  const text = optionalText(value);
  if (text === null) return null;

  const numberValue = Number(text);
  if (!Number.isFinite(numberValue)) {
    throw new Error("Numeric fields must contain valid numbers");
  }

  return numberValue;
}

function uniqueTags(tags: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      tags
        .filter((tag): tag is string => Boolean(tag))
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
}

function tagsFromText(value: string | null | undefined) {
  const text = value?.toLowerCase() ?? "";
  const tags: string[] = [];

  if (/(technology|software|digital|computer|data|science|engineering|math|stem)/.test(text)) {
    tags.push("STEM");
  }
  if (/(art|arts|design|humanities|creative|social)/.test(text)) {
    tags.push("Arts");
  }
  if (/(health|medicine|nursing|kinesiology)/.test(text)) {
    tags.push("Health");
  }
  if (/(trade|trades|apprentice)/.test(text)) {
    tags.push("Trades");
  }
  if (/(export|international)/.test(text)) {
    tags.push("Export", "International");
  }
  if (/(clean|sustainability|energy|environment)/.test(text)) {
    tags.push("Sustainability", "STEM");
  }
  if (/(startup|start-up|venture)/.test(text)) {
    tags.push("Startup");
  }
  if (/(growth|scale|expansion)/.test(text)) {
    tags.push("Growth");
  }

  return tags;
}

function scopeTags(value: string | null) {
  if (!value) return [];
  const text = value.toLowerCase();
  if (text === "federal" || text.includes("canada")) return ["Federal"];
  return ["Provincial"];
}

export function parseOnboardingForm(role: string, formData: FormData): OnboardingInput {
  if (!isRole(role)) {
    throw new Error("Invalid role");
  }

  const display_name = optionalText(formData.get("display_name")) ?? "";
  requireText(display_name, "Display name");

  if (role === "business") {
    const business_name = optionalText(formData.get("business_name")) ?? "";
    requireText(business_name, "Business name");

    return {
      role,
      display_name,
      business_name,
      industry: optionalText(formData.get("industry")),
      location: optionalText(formData.get("location")),
      revenue: optionalNumber(formData.get("revenue")),
      employees: optionalNumber(formData.get("employees")),
      match_tags: uniqueTags([
        "Business",
        ...tagsFromText(optionalText(formData.get("industry"))),
        ...tagsFromText(optionalText(formData.get("business_stage"))),
        ...scopeTags(optionalText(formData.get("funding_scope")) ?? optionalText(formData.get("location"))),
      ]),
    };
  }

  if (role === "student") {
    const education_level = optionalText(formData.get("education_level"));
    if (education_level && !educationLevels.has(education_level)) {
      throw new Error("Invalid education level");
    }

    return {
      role,
      display_name,
      education_level: education_level as StudentProfile["education_level"],
      field_of_study: optionalText(formData.get("field_of_study")),
      institution: optionalText(formData.get("institution")),
      province: optionalText(formData.get("province")),
      gpa: optionalNumber(formData.get("gpa")),
      match_tags: uniqueTags([
        "Student",
        "Scholarship",
        ...tagsFromText(optionalText(formData.get("field_of_study"))),
        ...scopeTags(optionalText(formData.get("province"))),
        optionalText(formData.get("funding_basis")) === "need" ? "Need-based" : null,
        optionalText(formData.get("funding_basis")) === "merit" ? "Merit-based" : null,
        education_level === "masters" || education_level === "phd" ? "Graduate" : null,
      ]),
    };
  }

  const career_stage = optionalText(formData.get("career_stage"));
  if (career_stage && !careerStages.has(career_stage)) {
    throw new Error("Invalid career stage");
  }

  return {
    role,
    display_name,
    institution: optionalText(formData.get("institution")),
    department: optionalText(formData.get("department")),
    research_area: optionalText(formData.get("research_area")),
    career_stage: career_stage as ProfessorProfile["career_stage"],
    research_keywords: (optionalText(formData.get("research_keywords")) ?? "")
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    match_tags: uniqueTags([
      "Professor",
      "Research",
      ...tagsFromText(optionalText(formData.get("research_area"))),
      ...tagsFromText(optionalText(formData.get("research_focus"))),
      optionalText(formData.get("research_focus")) === "discovery" ? "Discovery" : null,
      optionalText(formData.get("research_focus")) === "partnership" ? "Partnership" : null,
      optionalText(formData.get("research_focus")) === "equipment" ? "Equipment" : null,
      optionalText(formData.get("research_focus")) === "interdisciplinary"
        ? "Interdisciplinary"
        : null,
      optionalText(formData.get("research_area")) === "social_sciences"
        ? "Social Sciences"
        : null,
      "Federal",
    ]),
  };
}

function toDetails(input: OnboardingInput) {
  if (input.role === "business") {
    return {
      business_name: input.business_name,
      industry: input.industry,
      location: input.location,
      revenue: input.revenue,
      employees: input.employees,
    };
  }

  if (input.role === "student") {
    return {
      education_level: input.education_level,
      field_of_study: input.field_of_study,
      institution: input.institution,
      province: input.province,
      gpa: input.gpa,
    };
  }

  return {
    institution: input.institution,
    department: input.department,
    research_area: input.research_area,
    career_stage: input.career_stage,
    research_keywords: input.research_keywords,
  };
}

async function upsertProfileMatchTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user_id: string,
  input: OnboardingInput,
) {
  const { error } = await supabase
    .from("profile_match_tags")
    .upsert(
      {
        user_id,
        role: input.role,
        tags: input.match_tags,
      },
      { onConflict: "user_id" },
    );

  if (error) throw error;
}

export async function upsertRoleProfile(input: OnboardingInput) {
  if (!isRole(input.role)) {
    throw new Error("Invalid role");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw profileError;

  if (profile?.role) {
    throw new Error("Profile is already onboarded");
  }

  const { error } = await supabase.rpc("complete_onboarding", {
    p_role: input.role satisfies Role,
    p_display_name: input.display_name,
    p_details: toDetails(input),
  });

  if (error) throw error;

  await upsertProfileMatchTags(supabase, user.id, input);
}

export async function updateRoleProfile(input: OnboardingInput) {
  if (!isRole(input.role)) {
    throw new Error("Invalid role");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) throw profileError;

  if (profile?.role !== input.role) {
    throw new Error("Profile role cannot be changed here");
  }

  const { error: baseError } = await supabase
    .from("profiles")
    .update({ display_name: input.display_name })
    .eq("id", user.id);

  if (baseError) throw baseError;

  const details = toDetails(input);

  if (input.role === "business") {
    const { error } = await supabase
      .from("business_profiles")
      .update(details)
      .eq("id", user.id);
    if (error) throw error;
    await upsertProfileMatchTags(supabase, user.id, input);
    return;
  }

  if (input.role === "student") {
    const { error } = await supabase
      .from("student_profiles")
      .update(details)
      .eq("id", user.id);
    if (error) throw error;
    await upsertProfileMatchTags(supabase, user.id, input);
    return;
  }

  const { error } = await supabase
    .from("professor_profiles")
    .update(details)
    .eq("id", user.id);

  if (error) throw error;
  await upsertProfileMatchTags(supabase, user.id, input);
}
