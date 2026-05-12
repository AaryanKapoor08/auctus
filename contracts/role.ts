// The single role enum used everywhere that "what kind of user" matters.

export const ROLES = ["business", "student", "professor"] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

// Convenience map for role -> default route after sign-in.
export const ROLE_DEFAULT_ROUTE: Record<Role, string> = {
  business: "/grants",
  student: "/scholarships",
  professor: "/research-funding",
};
