"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, UserCircle, X } from "lucide-react";
import { ROLE_DEFAULT_ROUTE } from "@contracts/role";
import Button from "@/components/ui/Button";
import { useAuth } from "@/app/providers";
import { cn } from "@/lib/utils";
import type { Session } from "@contracts/session";
import { createClient } from "@/lib/supabase/client";

type NavProfile = {
  display_name: string | null;
  avatar_url: string | null;
};

function navForRole(role: keyof typeof ROLE_DEFAULT_ROUTE | null) {
  if (!role) {
    return [
      { name: "Home", href: "/" },
      { name: "Sign in", href: "/sign-in" },
    ];
  }

  return [
    { name: "Home", href: "/" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Forum", href: "/forum" },
    { name: "Funding", href: ROLE_DEFAULT_ROUTE[role] },
  ];
}

function getInitials(profile: NavProfile | null, session: Session | null) {
  const source = profile?.display_name || session?.role || "Auctus";
  return (
    source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "A"
  );
}

export default function Navbar({ initialSession }: { initialSession?: Session | null }) {
  const pathname = usePathname();
  const { session: clientSession, loading } = useAuth();
  const session = loading ? initialSession ?? null : clientSession;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profile, setProfile] = useState<NavProfile | null>(null);
  const links = navForRole(session?.role ?? null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!session?.user_id) {
        setProfile(null);
        return;
      }

      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", session.user_id)
        .maybeSingle();

      if (mounted) {
        setProfile(data ?? null);
      }
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, [session?.user_id]);

  const isActivePath = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
  const initials = getInitials(profile, session);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href={session?.role ? "/dashboard" : "/"} className="flex items-center">
            <span className="text-xl font-bold text-gray-900">Auctus AI</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                  isActivePath(link.href)
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {!loading && session ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                  aria-expanded={isProfileOpen}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                    {profile?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatar_url}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </span>
                  <span className="max-w-32 truncate">
                    {profile?.display_name || session.role || "Profile"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <UserCircle className="h-4 w-4" />
                      My profile
                    </Link>
                    <form action="/sign-out" method="post" className="mt-1 border-t border-gray-100 pt-1">
                      <button
                        type="submit"
                        className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              !loading && (
                <Link href="/sign-up">
                  <Button size="sm">Sign up</Button>
                </Link>
              )
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2.5 transition-colors hover:bg-gray-100 md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white p-4 md:hidden">
          <div className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "block rounded-lg px-4 py-3 text-sm font-medium",
                  isActivePath(link.href)
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100",
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
          {!loading && session && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mb-3 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                  {initials}
                </span>
                <span>{profile?.display_name || session.role || "My profile"}</span>
              </Link>
              <form action="/sign-out" method="post">
              <Button type="submit" variant="outline" className="w-full">
                Sign out
              </Button>
              </form>
            </div>
          )}
          {!loading && !session && (
            <Link
              href="/sign-up"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-3 block"
            >
              <Button className="w-full">Sign up</Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
