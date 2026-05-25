import type { Session } from "@contracts/session";

export type NavLink = {
  name: string;
  href: string;
};

export type NavProfile = {
  display_name: string | null;
  avatar_url: string | null;
};

const PUBLIC_FUNDING_LINKS: NavLink[] = [
  { name: "Grants", href: "/grants" },
  { name: "Scholarships", href: "/scholarships" },
  { name: "Research", href: "/research-funding" },
];

const ROLE_FUNDING_LINK: Record<NonNullable<Session["role"]>, NavLink> = {
  business: { name: "Grants", href: "/grants" },
  student: { name: "Scholarships", href: "/scholarships" },
  professor: { name: "Research", href: "/research-funding" },
};

const FORUM_LINK: NavLink = { name: "Forum", href: "/forum" };
const DASHBOARD_LINK: NavLink = { name: "Dashboard", href: "/dashboard" };
const ONBOARDING_LINK: NavLink = { name: "Onboarding", href: "/onboarding" };

export function getNavLinksForSession(session: Session | null): NavLink[] {
  if (!session) {
    return [...PUBLIC_FUNDING_LINKS, FORUM_LINK];
  }

  if (!session.role) {
    return [...PUBLIC_FUNDING_LINKS, FORUM_LINK, ONBOARDING_LINK];
  }

  return [DASHBOARD_LINK, ROLE_FUNDING_LINK[session.role], FORUM_LINK];
}
