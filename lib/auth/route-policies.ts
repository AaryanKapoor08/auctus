import type { RoutePolicyRegistry } from "@contracts/route-policy";
import { ROLE_DEFAULT_ROUTE, type Role } from "@contracts/role";

export type RouteDecision =
  | { action: "allow" }
  | { action: "redirect"; location: string };

export const authPolicies: RoutePolicyRegistry = [
  { path: "/auth/callback", allowed_roles: null, require_auth: false },
  { path: "/sign-in", allowed_roles: null, require_auth: false },
  { path: "/sign-up", allowed_roles: null, require_auth: false },
  { path: "/sign-out", allowed_roles: null, require_auth: true },
  { path: "/onboarding", allowed_roles: null, require_auth: true },
  { path: "/profile/edit", allowed_roles: null, require_auth: true },
  { path: "/profile", allowed_roles: null, require_auth: true },
  { path: "/forum", allowed_roles: null, require_auth: true },
  { path: "/dashboard", allowed_roles: null, require_auth: true },
  { path: "/", allowed_roles: null, require_auth: false },
];

export function combineRegistries(
  ...registries: RoutePolicyRegistry[]
): RoutePolicyRegistry {
  return registries
    .flat()
    .sort((a, b) => b.path.length - a.path.length);
}

export function findPolicy(pathname: string, registry: RoutePolicyRegistry) {
  return registry.find((policy) => {
    if (policy.path === "/") {
      return pathname === "/";
    }

    return pathname === policy.path || pathname.startsWith(`${policy.path}/`);
  });
}

export function resolveRouteDecision(
  pathname: string,
  role: Role | null | undefined,
  authenticated: boolean,
  registry: RoutePolicyRegistry,
): RouteDecision {
  const policy = findPolicy(pathname, registry);

  if (!policy) {
    return { action: "allow" };
  }

  if (policy.require_auth && !authenticated) {
    return { action: "redirect", location: "/sign-in" };
  }

  if (
    authenticated &&
    role === null &&
    policy.require_auth &&
    !pathname.startsWith("/onboarding") &&
    !pathname.startsWith("/sign-out")
  ) {
    return { action: "redirect", location: "/onboarding" };
  }

  if (
    authenticated &&
    role &&
    policy.allowed_roles &&
    !policy.allowed_roles.includes(role)
  ) {
    return { action: "redirect", location: ROLE_DEFAULT_ROUTE[role] };
  }

  return { action: "allow" };
}
