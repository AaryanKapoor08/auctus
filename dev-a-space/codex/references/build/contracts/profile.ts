// STATUS: DRAFT (LOCKED at V2.P1 completion gate)
// Owner: Dev A
//
// Profile shapes consumed by Dev B for funding matching.
// Dev B's matching logic reads only these fields. Any field Dev B's matcher needs
// MUST appear here; otherwise add it via the contract change protocol.

import type { Role } from "./role";

export interface Profile {
  id: string; // UUID, references Supabase auth.users(id)
  // Nullable to handle the gap between sign-in (a profiles row is auto-created by trigger)
  // and onboarding completion (role gets set). A profile with `role: null` has not picked
  // a role yet — middleware redirects them to /onboarding. This matches `Session.role`.
  role: Role | null;
  display_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string; // ISO timestamp
  updated_at: string;
}

// Profile after onboarding completes. Use this in code paths that have already verified
// `role` is non-null (e.g. anything that branches by role, or any handler downstream of
// a route protected by `require_auth + role`-checking middleware).
export type OnboardedProfile = Profile & { role: Role };

export interface BusinessProfile {
  id: string; // FK -> Profile.id
  business_name: string;
  industry: string | null;
  location: string | null; // free-form for now; province-normalization TBD by Dev B in matching
  revenue: number | null; // CAD, annual
  employees: number | null;
  description: string | null;
  year_established: number | null;
  website: string | null;
}

export interface StudentProfile {
  id: string;
  education_level:
    | "high_school"
    | "college"
    | "undergrad"
    | "masters"
    | "phd"
    | null;
  field_of_study: string | null;
  institution: string | null;
  province: string | null;
  gpa: number | null;
  graduation_year: number | null;
}

export interface ProfessorProfile {
  id: string;
  institution: string | null;
  department: string | null;
  research_area: string | null;
  career_stage: "early" | "mid" | "senior" | "emeritus" | null;
  h_index: number | null;
  research_keywords: string[];
}

// Discriminated view that Dev B's matcher receives.
// Dev A's `getRoleProfile(user_id)` returns one of these shapes for an onboarded user,
// or `null` if the user has not picked a role yet. The `base` is `OnboardedProfile`
// because matching only runs once the role is set.
export type RoleProfile =
  | { role: "business"; base: OnboardedProfile; details: BusinessProfile }
  | { role: "student"; base: OnboardedProfile; details: StudentProfile }
  | { role: "professor"; base: OnboardedProfile; details: ProfessorProfile };
