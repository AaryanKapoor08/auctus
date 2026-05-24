import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, GraduationCap, Microscope, Pencil, Trash2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { DELETE_ACCOUNT_CONFIRMATION } from "@/lib/profile/delete-account-confirmation";
import { deleteCurrentUserAccount } from "@/lib/profile/delete-account";
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

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
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
  const params = await searchParams;
  const deleteError =
    params.error === "delete_confirmation"
      ? `Type ${DELETE_ACCOUNT_CONFIRMATION} to confirm account deletion.`
      : null;
  const initials = profile.base.display_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";

  return (
    <main className="auc-page min-h-screen py-10">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="auc-label">Profile</p>
            <h1 className="display mt-2 text-5xl leading-none md:text-6xl">
              {profile.base.display_name}
            </h1>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="info">{roleMeta.label}</Badge>
              {profile.base.email && (
                <span className="text-sm text-[var(--auc-ink-2)]">{profile.base.email}</span>
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
          <Card>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--auc-ink)] text-2xl font-black text-white">
                {initials}
              </div>
              <h2 className="mt-4 text-xl font-black text-[var(--auc-ink)]">
                {profile.base.display_name}
              </h2>
              <div className="mt-2 flex items-center gap-2 text-sm text-[var(--auc-ink-2)]">
                <Icon className="h-4 w-4" />
                {roleMeta.label}
              </div>
            </div>
          </Card>

          <Card
            header={<h2 className="display text-3xl leading-none text-[var(--auc-ink)]">Onboarding details</h2>}
          >
            <dl className="grid gap-4 sm:grid-cols-2">
              {details.map(([key, value]) => (
                <div key={key} className="rounded-lg border border-[var(--auc-rule)] bg-[var(--auc-bg)] p-4">
                  <dt className="mono text-xs font-black uppercase tracking-[0.06em] text-[var(--auc-muted)]">
                    {formatLabel(key)}
                  </dt>
                  <dd className="mt-2 text-sm font-black text-[var(--auc-ink)]">
                    {formatValue(value)}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>

        <Card
          className="mt-6 border-[#912f26] bg-[var(--auc-coral-soft)]"
          header={
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-[#912f26]" />
              <h2 className="display text-3xl leading-none text-[#912f26]">Delete account</h2>
            </div>
          }
        >
          <div className="grid gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
            <div className="space-y-3 text-sm leading-6 text-[#521b15]">
              <p>
                This permanently deletes your Auctus account, profile, onboarding
                details, funding preferences, forum threads, replies, and helpful
                votes. Threads you started will also remove their reply history.
              </p>
              <p className="font-medium">
                This cannot be undone. Create a new account if you want to use
                Auctus again later.
              </p>
            </div>

            <form action={deleteCurrentUserAccount} className="space-y-3">
              {deleteError && (
                <div className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700">
                  {deleteError}
                </div>
              )}
              <Input
                name="confirm_delete"
                label={`Type ${DELETE_ACCOUNT_CONFIRMATION} to confirm`}
                autoComplete="off"
                required
              />
              <Button
                type="submit"
                className="w-full bg-red-700 text-white hover:bg-red-800 focus:ring-red-700"
              >
                Permanently delete account
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </main>
  );
}
