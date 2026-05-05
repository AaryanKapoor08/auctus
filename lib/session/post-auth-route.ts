import type { Role } from "@contracts/role";

export function getPostAuthRoute(role: Role | null | undefined) {
  return role ? "/dashboard" : "/onboarding";
}
