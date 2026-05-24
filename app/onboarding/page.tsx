import Link from "next/link";
import { Briefcase, GraduationCap, Microscope } from "lucide-react";
import { getSession } from "@/lib/session/get-session";
import { redirect } from "next/navigation";

const roles = [
  {
    href: "/onboarding/business",
    title: "Business",
    description: "Find grants for growth, hiring, exports, and operations.",
    icon: Briefcase,
  },
  {
    href: "/onboarding/student",
    title: "Student",
    description: "Find scholarships and awards aligned to your studies.",
    icon: GraduationCap,
  },
  {
    href: "/onboarding/professor",
    title: "Professor",
    description: "Find research grants and academic funding opportunities.",
    icon: Microscope,
  },
];

export default async function OnboardingPage() {
  const session = await getSession();

  if (session?.role) {
    redirect("/dashboard");
  }

  return (
    <div className="auc-page min-h-screen px-4 py-12">
      <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <div className="auc-label">Onboarding</div>
        <h1 className="display mt-2 text-5xl leading-none md:text-6xl">Choose your role</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--auc-ink-2)]">
          Your role controls the onboarding questions and the funding routes available to you.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {roles.map((role) => {
          const Icon = role.icon;

          return (
            <Link
              key={role.href}
              href={role.href}
              className="auc-card-flat auc-card-hover p-6 shadow-[3px_3px_0_var(--auc-ink)]"
            >
              <Icon className="mb-5 h-8 w-8 text-[var(--auc-ink)]" />
              <h2 className="text-xl font-black text-[var(--auc-ink)]">{role.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--auc-ink-2)]">{role.description}</p>
            </Link>
          );
        })}
      </div>
      </div>
    </div>
  );
}
