// STATUS: LOCKED
// Owner: Dev A owns the registry; Dev B owns the funding entries.
//
// Per-route gating policy registry. Solves the cross-domain edit problem:
// Dev A's middleware (middleware.ts) does NOT branch on funding routes.
// Instead, Dev B registers funding routes in `lib/funding/route-policies.ts`,
// Dev A registers identity/community routes in `lib/auth/route-policies.ts`,
// and middleware combines both registries at startup.

import type { Role } from "./role";

export interface RoutePolicy {
  // URL path prefix this policy guards (e.g. "/grants", "/forum").
  // Match is prefix-based; the most specific (longest) match wins.
  path: string;

  // If null, the route is public.
  // If set, only listed roles may access it. Other roles get redirected to their default route.
  allowed_roles: Role[] | null;

  // If true, an unauthenticated visitor is redirected to /sign-in.
  // If false, the route is reachable without a session.
  require_auth: boolean;
}

// The combined registry, exported by `lib/auth/route-policies.ts`.
// Dev A imports Dev B's registry there and concatenates.
export type RoutePolicyRegistry = RoutePolicy[];
