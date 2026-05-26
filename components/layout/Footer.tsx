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
          <div className="mb-14 grid gap-10 md:grid-cols-[1.25fr_0.75fr] md:items-start md:gap-16">
            <div>
              <h2 className="display text-5xl leading-[0.92] tracking-[-0.035em] md:text-[5.75rem]">
                Stop scrolling.<br />
                Start <span className="text-[var(--auc-lime)]">shortlisting.</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 content-start gap-8 pt-2 text-sm">
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

        <div className={`flex flex-col items-center justify-between gap-4 md:flex-row ${isLanding ? "border-t border-white/15 pt-6" : ""}`}>
          <div className="flex items-center gap-3 text-sm text-white/55">
            <span className="kiki text-2xl text-white">auctus</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--auc-lime)]" />
            <span className="mono text-[0.68rem] uppercase tracking-[0.06em]">© {currentYear} · Made in Canada</span>
          </div>

          {null}
        </div>
      </div>
    </footer>
  );
}
