// STATUS: LOCKED
// Owner: Dev A
//
// The single role enum used everywhere that "what kind of user" matters.
// Dev B reads this for role-aware funding visibility and RLS policy authoring.
// Renaming any value is a breaking change and requires the contract change protocol.

export const ROLES = ["business", "student", "professor"] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

// Convenience map for role -> default route after sign-in.
// Dev A owns the routing decision; Dev B should not branch on this map.
export const ROLE_DEFAULT_ROUTE: Record<Role, string> = {
  business: "/grants",
  student: "/scholarships",
  professor: "/research-funding",
};
