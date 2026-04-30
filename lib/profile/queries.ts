import type {
  BusinessProfile,
  OnboardedProfile,
  ProfessorProfile,
  RoleProfile,
  StudentProfile,
} from "@contracts/profile";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = OnboardedProfile & {
  role: "business" | "student" | "professor" | null;
};

function toBase(profile: ProfileRow): OnboardedProfile {
  return {
    id: profile.id,
    role: profile.role as OnboardedProfile["role"],
    display_name: profile.display_name,
    email: profile.email,
    avatar_url: profile.avatar_url,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  };
}

export async function getRoleProfile(user_id: string): Promise<RoleProfile | null> {
  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, display_name, email, avatar_url, created_at, updated_at")
    .eq("id", user_id)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile?.role) return null;

  const base = toBase(profile as ProfileRow);

  if (profile.role === "business") {
    const { data, error } = await supabase
      .from("business_profiles")
      .select(
        "id, business_name, industry, location, revenue, employees, description, year_established, website",
      )
      .eq("id", user_id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      role: "business",
      base,
      details: data as BusinessProfile,
    };
  }

  if (profile.role === "student") {
    const { data, error } = await supabase
      .from("student_profiles")
      .select(
        "id, education_level, field_of_study, institution, province, gpa, graduation_year",
      )
      .eq("id", user_id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      role: "student",
      base,
      details: data as StudentProfile,
    };
  }

  const { data, error } = await supabase
    .from("professor_profiles")
    .select(
      "id, institution, department, research_area, career_stage, h_index, research_keywords",
    )
    .eq("id", user_id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    role: "professor",
    base,
    details: data as ProfessorProfile,
  };
}
