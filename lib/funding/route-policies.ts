import type { RoutePolicyRegistry } from "@contracts/route-policy";

export const fundingPolicies: RoutePolicyRegistry = [
  { path: "/grants", allowed_roles: ["business"], require_auth: false },
  { path: "/scholarships", allowed_roles: ["student"], require_auth: false },
  {
    path: "/research-funding",
    allowed_roles: ["professor"],
    require_auth: false,
  },
];
