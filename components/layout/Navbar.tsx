"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, UserCircle, X } from "lucide-react";
import { useAuth } from "@/app/providers";
import { cn } from "@/lib/utils";
import type { Session } from "@contracts/session";
import { createClient } from "@/lib/supabase/client";

type NavProfile = {
  display_name: string | null;
  avatar_url: string | null;
};

function navForSession(session: Session | null) {
  const links = [
    { name: "Grants", href: "/grants" },
    { name: "Scholarships", href: "/scholarships" },
    { name: "Research", href: "/research-funding" },
    { name: "Forum", href: "/forum" },
  ];

  if (!session) return links;
  return session.role
    ? [{ name: "Dashboard", href: "/dashboard" }, ...links]
    : [...links, { name: "Onboarding", href: "/onboarding" }];
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
  const links = navForSession(session);

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
  const tickerItems = [
    "New · NSERC PGS-D opens Oct 14",
    "CDAP renewed · live federal programs",
    "Scholarships indexed daily",
    "SSHRC Insight · rolling research updates",
    "Public forum reads now open",
    "Live opportunities from real data",
  ];

  return (
    <nav className="sticky top-4 z-50 px-3 sm:px-6">
      <div className="mx-auto flex w-full max-w-[77.5rem] flex-col items-center gap-1.5">
        <div className="flex h-16 w-full items-center justify-between gap-4 rounded-[14px] bg-[var(--auc-ink)] px-3 py-2 text-white shadow-[0_10px_30px_-8px_rgba(14,14,16,0.4),inset_0_0_0_1px_rgba(255,255,255,0.05)] sm:px-5">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1 text-white"
          >
            <span className="kiki text-[1.85rem] leading-none">auctus</span>
            <span className="h-2 w-2 rounded-full bg-[var(--auc-lime)]" />
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
              "auc-nav-link rounded-lg px-3 py-2 text-sm font-medium text-white/75 transition-all duration-150 lg:px-4",
                  isActivePath(link.href)
                    ? "bg-white/12 text-white"
                    : "",
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden shrink-0 items-center gap-1.5 md:flex">
            {session ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-[10px] bg-white/8 py-1 pl-1 pr-3 text-sm font-semibold text-white transition hover:bg-white/12"
                  aria-expanded={isProfileOpen}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--auc-lime)] text-xs font-black text-[var(--auc-ink)]">
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
                    {profile?.display_name || session.role || "Complete profile"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-white/60" />
                </button>

                {isProfileOpen && (
                  <div className="auc-card-flat absolute right-0 mt-2 w-60 bg-[var(--auc-paper)] p-2 text-[var(--auc-ink)] shadow-[5px_5px_0_var(--auc-ink)]">
                    <Link
                      href={session.role ? "/profile" : "/onboarding"}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold hover:bg-[var(--auc-bg-warm)]"
                    >
                      <UserCircle className="h-4 w-4" />
                      {session.role ? "My profile" : "Complete profile"}
                    </Link>
                    <form action="/sign-out" method="post" className="mt-1 border-t border-[var(--auc-rule)] pt-1">
                      <button
                        type="submit"
                        className="w-full rounded-md px-3 py-2 text-left text-sm font-semibold hover:bg-[var(--auc-bg-warm)]"
                      >
                        Sign out
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="auc-nav-link rounded-lg px-4 py-2 text-sm font-medium text-white/85"
                >
                  Login
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-[10px] bg-[var(--auc-lime)] px-5 py-2.5 text-sm font-black text-[var(--auc-ink)]"
                >
                  Join
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2.5 text-white transition-colors hover:bg-white/10 md:hidden"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        <div className="w-full overflow-hidden rounded-[10px] border border-[var(--auc-ink)] bg-[var(--auc-lime)] py-[7px] text-[var(--auc-ink)]">
          <div className="auc-marquee-track mono text-xs font-black uppercase tracking-[0.06em]">
            {[0, 1].map((round) =>
              tickerItems.map((item) => (
                <span key={`${round}-${item}`} className="inline-flex items-center gap-5">
                  <span>* {item}</span>
                  <span>+</span>
                </span>
              )),
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="auc-card-flat mx-auto mt-2 max-w-7xl bg-[var(--auc-paper)] p-4 md:hidden">
          <div className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "block rounded-lg px-4 py-3 text-sm font-bold",
                  isActivePath(link.href)
                    ? "bg-[var(--auc-ink)] text-white"
                    : "text-[var(--auc-ink)] hover:bg-[var(--auc-bg-warm)]",
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
          {session && (
            <div className="mt-3 border-t border-[var(--auc-rule)] pt-3">
              <Link
                href={session.role ? "/profile" : "/onboarding"}
                onClick={() => setIsMobileMenuOpen(false)}
                className="mb-3 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-[var(--auc-ink)] hover:bg-[var(--auc-bg-warm)]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--auc-ink)] text-xs font-semibold text-white">
                  {initials}
                </span>
                <span>{profile?.display_name || session.role || "Complete profile"}</span>
              </Link>
              <form action="/sign-out" method="post">
                <button
                  type="submit"
                  className="w-full rounded-full border-2 border-[var(--auc-ink)] px-4 py-2 text-sm font-black text-[var(--auc-ink)]"
                >
                  Sign out
                </button>
              </form>
            </div>
          )}
          {!session && (
            <div className="mt-3 grid gap-2 border-t border-[var(--auc-rule)] pt-3">
              <Link
                href="/sign-in"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full border-2 border-[var(--auc-ink)] px-4 py-2 text-center text-sm font-black text-[var(--auc-ink)]"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full border-2 border-[var(--auc-ink)] bg-[var(--auc-lime)] px-4 py-2 text-center text-sm font-black text-[var(--auc-ink)]"
              >
                Join
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
