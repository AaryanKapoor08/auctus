import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, GraduationCap, Microscope, Pencil } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getRoleProfile } from "@/lib/profile/queries";
import { getSession } from "@/lib/session/get-session";

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "Not provided";
  }

  if (typeof value === "number") {
    return value.toLocaleString("en-CA");
  }

  return String(value);
}

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  if (!session.role) {
    redirect("/onboarding");
  }

  const profile = await getRoleProfile(session.user_id);

  if (!profile) {
    redirect("/onboarding");
  }

  const roleMeta = {
    business: {
      label: "Business",
      icon: Briefcase,
    },
    student: {
      label: "Student",
      icon: GraduationCap,
    },
    professor: {
      label: "Professor",
      icon: Microscope,
    },
  }[profile.role];
  const Icon = roleMeta.icon;
  const details = Object.entries(profile.details).filter(([key]) => key !== "id");
  const initials = profile.base.display_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase text-gray-500">Profile</p>
            <h1 className="mt-2 text-4xl font-bold text-gray-900">
              {profile.base.display_name}
            </h1>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="info">{roleMeta.label}</Badge>
              {profile.base.email && (
                <span className="text-sm text-gray-600">{profile.base.email}</span>
              )}
            </div>
          </div>
          <Link href="/profile/edit">
            <Button className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit profile
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
          <Card className="border border-gray-200">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-900 text-2xl font-semibold text-white">
                {initials}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                {profile.base.display_name}
              </h2>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <Icon className="h-4 w-4" />
                {roleMeta.label}
              </div>
            </div>
          </Card>

          <Card
            className="border border-gray-200"
            header={<h2 className="text-lg font-semibold text-gray-900">Onboarding details</h2>}
          >
            <dl className="grid gap-4 sm:grid-cols-2">
              {details.map(([key, value]) => (
                <div key={key} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <dt className="text-xs font-medium uppercase text-gray-500">
                    {formatLabel(key)}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-gray-900">
                    {formatValue(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </main>
  );
}
