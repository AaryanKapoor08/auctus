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
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Choose your role</h1>
        <p className="mt-2 max-w-2xl text-gray-600">
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
              className="rounded-lg border border-gray-200 bg-white p-6 transition hover:border-gray-900 hover:shadow-sm"
            >
              <Icon className="mb-4 h-8 w-8 text-gray-900" />
              <h2 className="text-xl font-semibold text-gray-900">{role.title}</h2>
              <p className="mt-2 text-sm text-gray-600">{role.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
