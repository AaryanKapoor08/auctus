/**
 * Data Utilities for Auctus AI Platform
 * 
 * This module provides centralized data access functions for all JSON data files.
 * All functions are optimized for the demo environment with static JSON data.
 * 
 * Main Features:
 * - Business, Grant, Thread, Reply, Match, Job, and Talent data access
 * - Smart grant matching algorithm based on business eligibility
 * - Advanced filtering and search capabilities
 * - Related content suggestions for AI features
 * - Eligibility checking and breakdown for grants
 * 
 * @module data-utils
 */

import businessesData from "@/data/businesses.json";
import grantsData from "@/data/grants.json";
import threadsData from "@/data/threads.json";
import repliesData from "@/data/replies.json";
import matchesData from "@/data/matches.json";
import jobsData from "@/data/jobs.json";
import talentsData from "@/data/talents.json";

// Type definitions
export interface Business {
  id: string;
  name: string;
  industry: string;
  location: string;
  revenue: number;
  employees: number;
  description: string;
  needs: string[];
  offers: string[];
  yearEstablished: number;
  website: string;
  eligibility: {
    isNewBrunswick: boolean;
    revenueUnder500k: boolean;
    employeesUnder50: boolean;
    industries: string[];
  };
}

export interface Grant {
  id: string;
  name: string;
  amount: number;
  deadline: string;
  category: string;
  description: string;
  provider: string;
  eligibility: {
    isNewBrunswick: boolean;
    revenueUnder500k: boolean;
    employeesUnder50: boolean;
    industries: string[];
  };
  requirements: string[];
  applicationUrl: string;
}

export interface Thread {
  id: string;
  title: string;
  authorId: string;
  category: string;
  content: string;
  tags: string[];
  timestamp: string;
  views: number;
  helpful: number;
}

export interface Reply {
  id: string;
  threadId: string;
  authorId: string;
  content: string;
  timestamp: string;
  helpfulCount: number;
}

export interface Match {
  partnerId: string;
  matchScore: number;
  reasoning: {
    youNeed: string[];
    theyOffer: string[];
    mutualBenefits: string[];
  };
}

export interface Job {
  id: string;
  title: string;
  businessId: string;
  businessName: string;
  skills: string[];
  jobType: "full-time" | "part-time" | "contract" | "internship";
  payRange: {
    min: number;
    max: number;
  };
  location: string;
  postedDate: string;
  description: string;
  requirements: string[];
}

export interface Talent {
  id: string;
  name: string;
  skills: string[];
  availability: string;
  bio: string;
  email?: string;
  phone?: string;
  education?: string;
  experience: string;
  lookingFor: ("full-time" | "part-time" | "contract" | "internship")[];
  portfolio?: string;
}

// Business functions
export function getAllBusinesses(): Business[] {
  return businessesData as Business[];
}

export function getBusinessById(id: string): Business | undefined {
  return businessesData.find((b) => b.id === id) as Business | undefined;
}

// Grant functions
export function getAllGrants(): Grant[] {
  return grantsData as Grant[];
}

export function getGrantById(id: string): Grant | undefined {
  return grantsData.find((g) => g.id === id) as Grant | undefined;
}

/**
 * Calculate match percentage between a business and a grant
 */
export function calculateGrantMatch(business: Business, grant: Grant): number {
  let score = 0;
  let maxScore = 0;

  // Check New Brunswick location (required for all grants)
  maxScore += 25;
  if (grant.eligibility.isNewBrunswick && business.eligibility.isNewBrunswick) {
    score += 25;
  }

  // Check revenue requirement
  maxScore += 25;
  if (!grant.eligibility.revenueUnder500k || business.eligibility.revenueUnder500k) {
    score += 25;
  }

  // Check employee count requirement
  maxScore += 20;
  if (!grant.eligibility.employeesUnder50 || business.eligibility.employeesUnder50) {
    score += 20;
  }

  // Check industry match
  maxScore += 30;
  const grantIndustries = grant.eligibility.industries;
  if (grantIndustries.includes("All")) {
    score += 30;
  } else {
    const matchingIndustries = business.eligibility.industries.filter((industry) =>
      grantIndustries.includes(industry)
    );
    if (matchingIndustries.length > 0) {
      score += 30;
    }
  }

  return Math.round((score / maxScore) * 100);
}

/**
 * Get grants matched to a specific business with match percentages
 */
export function getMatchedGrants(businessId: string): Array<Grant & { matchPercentage: number }> {
  const business = getBusinessById(businessId);
  if (!business) return [];

  return grantsData
    .map((grant) => ({
      ...(grant as Grant),
      matchPercentage: calculateGrantMatch(business, grant as Grant),
    }))
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}

/**
 * Filter grants by category
 */
export function getGrantsByCategory(category: string): Grant[] {
  if (category === "All") return getAllGrants();
  return grantsData.filter((g) => g.category === category) as Grant[];
}

// Thread functions
export function getAllThreads(): Thread[] {
  return threadsData as Thread[];
}

export function getThreadById(id: string): Thread | undefined {
  return threadsData.find((t) => t.id === id) as Thread | undefined;
}

/**
 * Filter threads by category
 */
export function getThreadsByCategory(category: string): Thread[] {
  if (category === "All") return getAllThreads();
  return threadsData.filter((t) => t.category === category) as Thread[];
}

/**
 * Search threads by title or content
 */
export function searchThreads(query: string): Thread[] {
  const lowerQuery = query.toLowerCase();
  return threadsData.filter(
    (t) =>
      t.title.toLowerCase().includes(lowerQuery) ||
      t.content.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  ) as Thread[];
}

/**
 * Get threads by business ID (author)
 */
export function getThreadsByBusinessId(businessId: string): Thread[] {
  return threadsData.filter((t) => t.authorId === businessId) as Thread[];
}

// Reply functions
export function getAllReplies(): Reply[] {
  return repliesData as Reply[];
}

export function getRepliesByThreadId(threadId: string): Reply[] {
  return repliesData.filter((r) => r.threadId === threadId) as Reply[];
}

export function getReplyById(id: string): Reply | undefined {
  return repliesData.find((r) => r.id === id) as Reply | undefined;
}

// Match functions
export function getMatchesForBusiness(businessId: string): Match[] {
  const businessMatches = matchesData.find((m) => m.businessId === businessId);
  return (businessMatches?.matches || []) as Match[];
}

/**
 * Get full match data including partner business details
 */
export function getMatchesWithBusinessDetails(businessId: string) {
  const matches = getMatchesForBusiness(businessId);
  const yourBusiness = getBusinessById(businessId);

  return matches.map((match) => ({
    yourBusiness: yourBusiness!,
    partnerBusiness: getBusinessById(match.partnerId)!,
    reasoning: {
      ...match.reasoning,
      matchScore: match.matchScore,
    },
  }));
}

/**
 * Get reciprocal matches - businesses where current business is listed as a partner
 * This shows "You Offer / They Need" relationships
 */
export function getReciprocalMatches(businessId: string): Array<{
  yourBusiness: Business;
  partnerBusiness: Business;
  reasoning: {
    youNeed: string[];
    theyOffer: string[];
    mutualBenefits: string[];
    matchScore: number;
  };
}> {
  const yourBusiness = getBusinessById(businessId);
  if (!yourBusiness) return [];

  const reciprocalMatches: Array<{
    yourBusiness: Business;
    partnerBusiness: Business;
    reasoning: {
      youNeed: string[];
      theyOffer: string[];
      mutualBenefits: string[];
      matchScore: number;
    };
  }> = [];

  // Loop through all businesses' matches to find where current business is a partner
  matchesData.forEach((businessMatches) => {
    if (businessMatches.businessId === businessId) return; // Skip self

    businessMatches.matches.forEach((match) => {
      if (match.partnerId === businessId) {
        // Found a reciprocal match - current business is the partner
        const partnerBusiness = getBusinessById(businessMatches.businessId);
        if (partnerBusiness) {
          reciprocalMatches.push({
            yourBusiness: yourBusiness,
            partnerBusiness: partnerBusiness,
            reasoning: {
              // Swap the perspective: what they need is what you offer
              youNeed: match.reasoning.theyOffer, // They offer becomes what you provide
              theyOffer: match.reasoning.youNeed, // What they need is what you offer
              mutualBenefits: match.reasoning.mutualBenefits,
              matchScore: match.matchScore,
            },
          });
        }
      }
    });
  });

  // Sort by match score descending
  return reciprocalMatches.sort((a, b) => b.reasoning.matchScore - a.reasoning.matchScore);
}

// Job functions
export function getAllJobs(): Job[] {
  return jobsData as Job[];
}

export function getJobById(id: string): Job | undefined {
  return jobsData.find((j) => j.id === id) as Job | undefined;
}

/**
 * Filter jobs by type
 */
export function getJobsByType(jobType: Job["jobType"]): Job[] {
  return jobsData.filter((j) => j.jobType === jobType) as Job[];
}

/**
 * Filter jobs by business
 */
export function getJobsByBusinessId(businessId: string): Job[] {
  return jobsData.filter((j) => j.businessId === businessId) as Job[];
}

/**
 * Search jobs by title or skills
 */
export function searchJobs(query: string): Job[] {
  const lowerQuery = query.toLowerCase();
  return jobsData.filter(
    (j) =>
      j.title.toLowerCase().includes(lowerQuery) ||
      j.skills.some((skill) => skill.toLowerCase().includes(lowerQuery)) ||
      j.description.toLowerCase().includes(lowerQuery)
  ) as Job[];
}

// Talent functions
export function getAllTalents(): Talent[] {
  return talentsData as Talent[];
}

export function getTalentById(id: string): Talent | undefined {
  return talentsData.find((t) => t.id === id) as Talent | undefined;
}

/**
 * Search talents by name, skills, or bio
 */
export function searchTalents(query: string): Talent[] {
  const lowerQuery = query.toLowerCase();
  return talentsData.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.skills.some((skill) => skill.toLowerCase().includes(lowerQuery)) ||
      t.bio.toLowerCase().includes(lowerQuery)
  ) as Talent[];
}

/**
 * Filter talents by availability
 */
export function getTalentsByAvailability(availability: string): Talent[] {
  if (availability === "All") return getAllTalents();
  return talentsData.filter((t) => t.availability === availability) as Talent[];
}

/**
 * Filter talents by job type they're seeking
 */
export function getTalentsByJobType(jobType: Talent["lookingFor"][number]): Talent[] {
  return talentsData.filter((t) => t.lookingFor.includes(jobType)) as Talent[];
}

/**
 * Get all unique skills from both jobs and talents
 */
export function getAllUniqueSkills(): string[] {
  const jobSkills = jobsData.flatMap((j) => j.skills);
  const talentSkills = talentsData.flatMap((t) => t.skills);
  const allSkills = [...jobSkills, ...talentSkills];
  return Array.from(new Set(allSkills)).sort();
}

// Utility functions for AI suggestions and related content
/**
 * Get related grants based on a thread's content/tags
 */
export function getRelatedGrants(thread: Thread, businessId: string): Array<Grant & { matchPercentage: number }> {
  const business = getBusinessById(businessId);
  if (!business) return [];

  // Get matched grants
  const matchedGrants = getMatchedGrants(businessId);

  // Filter by thread keywords
  const keywords = [...thread.tags, thread.category.toLowerCase()];
  const relatedGrants = matchedGrants.filter((grant) => {
    const grantText = `${grant.name} ${grant.description} ${grant.category}`.toLowerCase();
    return keywords.some((keyword) => grantText.includes(keyword.toLowerCase()));
  });

  return relatedGrants.slice(0, 3);
}

/**
 * Get related threads based on category or tags
 */
export function getRelatedThreads(currentThread: Thread): Thread[] {
  return threadsData
    .filter((t) => {
      if (t.id === currentThread.id) return false;
      // Same category or shared tags
      return (
        t.category === currentThread.category ||
        t.tags.some((tag) => currentThread.tags.includes(tag))
      );
    })
    .slice(0, 3) as Thread[];
}

/**
 * Calculate days remaining until deadline
 */
export function getDaysUntilDeadline(deadlineStr: string): number {
  const deadline = new Date(deadlineStr);
  const today = new Date();
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

/**
 * Get forum categories
 */
export function getForumCategories(): string[] {
  return [
    "All",
    "Ask for Help",
    "Collaboration Opportunities",
    "Hiring & Local Talent",
    "Marketplace",
    "Business Ideas",
    "Announcements",
  ];
}

/**
 * Get grant categories
 */
export function getGrantCategories(): string[] {
  const categories = new Set(grantsData.map((g) => g.category));
  return ["All", ...Array.from(categories).sort()];
}

/**
 * Check if business meets a specific requirement
 */
export function checkRequirement(
  business: Business,
  requirement: string
): boolean | null {
  const req = requirement.toLowerCase();

  // Location checks
  if (req.includes("new brunswick") || req.includes("atlantic canada")) {
    return business.eligibility.isNewBrunswick;
  }

  // Revenue checks
  if (req.includes("revenue under") || req.includes("annual revenue")) {
    if (req.includes("500") || req.includes("500k") || req.includes("500,000")) {
      return business.eligibility.revenueUnder500k;
    }
  }

  // Employee checks
  if (req.includes("employees") || req.includes("less than")) {
    if (req.includes("50") || req.includes("100")) {
      return business.eligibility.employeesUnder50;
    }
  }

  // Industry-specific checks
  const industries = business.eligibility.industries.map((i) => i.toLowerCase());

  if (req.includes("manufacturing")) {
    return industries.includes("manufacturing") || industries.includes("industrial");
  }
  if (req.includes("tourism") || req.includes("hospitality")) {
    return industries.includes("tourism") || industries.includes("hospitality");
  }
  if (req.includes("food") || req.includes("agriculture") || req.includes("beverage")) {
    return industries.includes("food & beverage") || industries.includes("agriculture");
  }
  if (req.includes("retail")) {
    return industries.includes("retail");
  }
  if (req.includes("technology") || req.includes("digital")) {
    return industries.includes("technology");
  }
  if (req.includes("creative") || req.includes("cultural")) {
    return industries.includes("creative") || industries.includes("professional services");
  }
  if (req.includes("skilled trades") || req.includes("construction")) {
    return industries.includes("manufacturing") || industries.includes("construction") || industries.includes("trades");
  }

  // Generic requirements that apply to most businesses
  if (
    req.includes("business plan") ||
    req.includes("sustainability") ||
    req.includes("implementation") ||
    req.includes("market") ||
    req.includes("training")
  ) {
    return true; // Assume these can be prepared
  }

  // Unknown requirement
  return null;
}

/**
 * Get eligibility breakdown for a grant
 */
export function getEligibilityBreakdown(
  businessId: string,
  grantId: string
): {
  requirements: Array<{
    text: string;
    met: boolean | null;
    icon: "check" | "x" | "question";
  }>;
  metCount: number;
  totalCount: number;
  percentage: number;
} {
  const business = getBusinessById(businessId);
  const grant = getGrantById(grantId);

  if (!business || !grant) {
    return {
      requirements: [],
      metCount: 0,
      totalCount: 0,
      percentage: 0,
    };
  }

  const requirements = grant.requirements.map((req) => {
    const met = checkRequirement(business, req);
    return {
      text: req,
      met,
      icon: met === true ? ("check" as const) : met === false ? ("x" as const) : ("question" as const),
    };
  });

  const metCount = requirements.filter((r) => r.met === true).length;
  const totalCount = requirements.length;
  const percentage = totalCount > 0 ? Math.round((metCount / totalCount) * 100) : 0;

  return {
    requirements,
    metCount,
    totalCount,
    percentage,
  };
}

/**
 * Get similar grants based on category and match score
 */
export function getSimilarGrants(
  grantId: string,
  businessId: string,
  limit: number = 3
): Array<Grant & { matchPercentage: number }> {
  const currentGrant = getGrantById(grantId);
  if (!currentGrant) return [];

  const matchedGrants = getMatchedGrants(businessId);

  return matchedGrants
    .filter((g) => g.id !== grantId && g.category === currentGrant.category)
    .slice(0, limit);
}
