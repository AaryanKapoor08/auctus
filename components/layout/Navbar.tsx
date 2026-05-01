"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ROLE_DEFAULT_ROUTE } from "@contracts/role";
import Button from "@/components/ui/Button";
import { useAuth } from "@/app/providers";
import { cn } from "@/lib/utils";
import type { Session } from "@contracts/session";

function navForRole(role: keyof typeof ROLE_DEFAULT_ROUTE | null) {
  if (!role) {
    return [
      { name: "Home", href: "/" },
      { name: "Sign in", href: "/sign-in" },
    ];
  }

  return [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Forum", href: "/forum" },
    { name: "Funding", href: ROLE_DEFAULT_ROUTE[role] },
  ];
}

export default function Navbar({ initialSession }: { initialSession?: Session | null }) {
  const pathname = usePathname();
  const { session: clientSession, loading } = useAuth();
  const session = loading ? initialSession ?? null : clientSession;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const links = navForRole(session?.role ?? null);

  const isActivePath = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

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
            {!loading && session?.role && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                {session.role}
              </span>
            )}
            {!loading && session ? (
              <form action="/sign-out" method="post">
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
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
            <form action="/sign-out" method="post" className="mt-3">
              <Button type="submit" variant="outline" className="w-full">
                Sign out
              </Button>
            </form>
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
