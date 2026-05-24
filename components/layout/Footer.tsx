"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const isLanding = pathname === "/";

  const footerLinks: { name: string; href: string }[] = [
    { name: "Grants", href: "/grants" },
    { name: "Scholarships", href: "/scholarships" },
    { name: "Research", href: "/research-funding" },
    { name: "Forum", href: "/forum" },
  ];
  const footerSections = [
    ["Product", footerLinks],
    [
      "Account",
      [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Profile", href: "/profile" },
        { name: "Sign in", href: "/sign-in" },
        { name: "Create profile", href: "/sign-up" },
      ],
    ],
    [
      "Data",
      [
        { name: "Grant sources", href: "/grants" },
        { name: "Scholarship sources", href: "/scholarships" },
        { name: "Research sources", href: "/research-funding" },
        { name: "Community notes", href: "/forum" },
      ],
    ],
  ] satisfies [string, typeof footerLinks][];

  return (
    <footer className="relative overflow-hidden bg-[var(--auc-ink)] text-white">
      {isLanding && (
        <div className="pointer-events-none absolute inset-x-6 bottom-[-2rem] hidden select-none opacity-[0.04] md:block">
          <div className="kiki text-[20rem] leading-[0.9] tracking-[-0.02em]">auctus.</div>
        </div>
      )}
      <div className={`relative mx-auto max-w-[82.5rem] px-6 ${isLanding ? "py-20 md:pb-7" : "py-8"}`}>
        {isLanding && (
          <div className="mb-16 grid gap-10 md:grid-cols-[1.4fr_1fr] md:gap-16">
            <div>
              <p className="mono text-xs font-bold uppercase tracking-[0.08em] text-white/55">
                Public browsing · Real records
              </p>
              <h2 className="display mt-4 text-5xl leading-[0.92] tracking-[-0.035em] md:text-[5.75rem]">
                Stop scrolling.<br />
                Start <span className="text-[var(--auc-lime)]">shortlisting.</span>
              </h2>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--auc-lime)] px-7 py-4 text-base font-black text-[var(--auc-ink)]"
                >
                  Create my profile <span>→</span>
                </Link>
                <Link
                  href="/grants"
                  className="rounded-full border border-white/35 px-6 py-4 text-base font-bold text-white hover:bg-white/10"
                >
                  Browse the database
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 content-start gap-6 pt-2 text-sm sm:grid-cols-3">
              {footerSections.map(([heading, links]) => (
                <div key={heading as string}>
                  <p className="mono text-xs font-bold uppercase tracking-[0.08em] text-white/45">
                    {heading as string}
                  </p>
                  <div className="mt-4 flex flex-col gap-2">
                    {(links as typeof footerLinks).map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-white/80 hover:text-white"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-6 md:flex-row">
          <div className="flex items-center gap-3 text-sm text-white/55">
            <span className="kiki text-2xl text-white">auctus</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--auc-lime)]" />
            <span className="mono text-[0.68rem] uppercase tracking-[0.06em]">© {currentYear} · Made in Canada</span>
          </div>

          {isLanding ? (
            <div className="mono text-[0.68rem] font-bold uppercase tracking-[0.06em] text-white/45">
              Active records · Provider links · Live opportunities
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-5">
              {footerLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="mono text-xs font-bold uppercase tracking-[0.06em] text-white/55 transition-colors duration-200 hover:text-white"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
