import type { RoutePolicyRegistry } from "@contracts/route-policy";

export const fundingPolicies: RoutePolicyRegistry = [
  { path: "/grants", allowed_roles: null, require_auth: false },
  { path: "/scholarships", allowed_roles: null, require_auth: false },
  {
    path: "/research-funding",
    allowed_roles: null,
    require_auth: false,
  },
];
