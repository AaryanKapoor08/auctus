import { describe, expect, it } from "vitest";
import type { FundingItem } from "@contracts/funding";
import type { RoleProfile } from "@contracts/profile";
import {
  scoreBusinessGrant,
  scoreFor,
  scoreResearchGrant,
  scoreScholarship,
} from "@/lib/matching";

const baseItem: FundingItem = {
  id: "funding-1",
  type: "business_grant",
  name: "Perfect Grant",
  description: null,
  provider: "Auctus Manual Seed",
  amount_min: null,
  amount_max: 10000,
  deadline: null,
  application_url: null,
  source_url: null,
  eligibility: {},
  requirements: [],
  category: null,
  tags: [],
  source: "manual",
  scraped_from: null,
  scraped_at: null,
  status: "active",
  created_at: "2026-04-30T00:00:00.000Z",
  updated_at: "2026-04-30T00:00:00.000Z",
};

const baseProfile = {
  id: "user-1",
  role: "business" as const,
  display_name: "Ada User",
  email: "ada@example.com",
  avatar_url: null,
  created_at: "2026-04-30T00:00:00.000Z",
  updated_at: "2026-04-30T00:00:00.000Z",
};

describe("matching scorers", () => {
  it("scores business grants with perfect, partial, and no-match outcomes", () => {
    const profile = {
      id: "user-1",
      business_name: "Ada Labs",
      industry: "technology",
      location: "NB",
      revenue: 200000,
      employees: 12,
      description: null,
      year_established: null,
      website: null,
    };
    const perfect = {
      ...baseItem,
      eligibility: {
        province: "NB",
        revenue_min: 100000,
        revenue_max: 300000,
        employees_max: 25,
        industry: ["technology"],
      },
    };
    const partial = {
      ...baseItem,
      eligibility: { province: "NB", employees_max: 25 },
    };
    const none = {
      ...baseItem,
      eligibility: {
        province: "ON",
        revenue_min: 500000,
        employees_max: 5,
        industry: "agriculture",
      },
    };

    expect(scoreBusinessGrant(profile, perfect)).toBe(100);
    expect(scoreBusinessGrant(profile, partial)).toBe(45);
    expect(scoreBusinessGrant(profile, none)).toBe(0);
  });

  it("scores scholarships without citizenship or residency weighting", () => {
    const profile = {
      id: "user-1",
      education_level: "undergrad" as const,
      field_of_study: "Computer Science",
      institution: "UNB",
      province: "NB",
      gpa: 3.8,
      graduation_year: null,
    };
    const item = {
      ...baseItem,
      type: "scholarship" as const,
      eligibility: {
        education_level: "undergrad",
        field_of_study: "Computer Science",
        institution: "UNB",
        province: "NB",
        gpa_min: 3.5,
        citizenship: "Canadian",
        residency: "NB",
      },
    };

    expect(scoreScholarship(profile, item)).toBe(100);
  });

  it("scores research grants and dispatches all role variants", () => {
    const businessProfile: RoleProfile = {
      role: "business",
      base: { ...baseProfile, role: "business" },
      details: {
        id: "user-1",
        business_name: "Ada Labs",
        industry: "technology",
        location: "NB",
        revenue: 200000,
        employees: 12,
        description: null,
        year_established: null,
        website: null,
      },
    };
    const studentProfile: RoleProfile = {
      role: "student",
      base: { ...baseProfile, role: "student" },
      details: {
        id: "user-1",
        education_level: "undergrad",
        field_of_study: "Computer Science",
        institution: "UNB",
        province: "NB",
        gpa: 3.8,
        graduation_year: null,
      },
    };
    const professorProfile: RoleProfile = {
      role: "professor",
      base: { ...baseProfile, role: "professor" },
      details: {
        id: "user-1",
        institution: "UNB",
        department: "Engineering",
        research_area: "clean energy",
        career_stage: "mid",
        h_index: 12,
        research_keywords: ["NSERC"],
      },
    };
    const researchItem = {
      ...baseItem,
      type: "research_grant" as const,
      eligibility: {
        research_area: "clean energy",
        career_stage: ["early", "mid"],
        council: "NSERC",
        institution: "UNB",
        past_funding_required: true,
      },
    };

    expect(scoreResearchGrant(professorProfile.details, researchItem)).toBe(100);
    expect(scoreFor(businessProfile, baseItem)).toBeGreaterThanOrEqual(0);
    expect(scoreFor(studentProfile, { ...baseItem, type: "scholarship" })).toBeGreaterThanOrEqual(0);
    expect(scoreFor(professorProfile, researchItem)).toBe(100);
  });
});
