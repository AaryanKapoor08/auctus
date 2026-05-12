// Per-route gating policy registry.

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

export type RoutePolicyRegistry = RoutePolicy[];
