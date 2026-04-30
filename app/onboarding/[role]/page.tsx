import { notFound, redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getSession } from "@/lib/session/get-session";
import { parseOnboardingForm, upsertRoleProfile } from "@/lib/profile/upsert";
import { isRole, type Role } from "@contracts/role";

type PageProps = {
  params: Promise<{ role: string }>;
};

const labels: Record<Role, { title: string; description: string }> = {
  business: {
    title: "Business profile",
    description: "Create the business profile used for grant matching.",
  },
  student: {
    title: "Student profile",
    description: "Create the student profile used for scholarship matching.",
  },
  professor: {
    title: "Professor profile",
    description: "Create the research profile used for grant matching.",
  },
};

function SelectField({
  name,
  label,
  children,
}: {
  name: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <select
        name={name}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {children}
      </select>
    </label>
  );
}

function RoleFields({ role }: { role: Role }) {
  if (role === "business") {
    return (
      <>
        <Input name="business_name" label="Business name" required />
        <Input name="industry" label="Industry" />
        <Input name="location" label="Location" />
        <Input name="revenue" label="Annual revenue" inputMode="decimal" />
        <Input name="employees" label="Employees" inputMode="numeric" />
      </>
    );
  }

  if (role === "student") {
    return (
      <>
        <SelectField name="education_level" label="Education level">
          <option value="">Select level</option>
          <option value="high_school">High school</option>
          <option value="college">College</option>
          <option value="undergrad">Undergraduate</option>
          <option value="masters">Masters</option>
          <option value="phd">PhD</option>
        </SelectField>
        <Input name="field_of_study" label="Field of study" />
        <Input name="institution" label="Institution" />
        <Input name="province" label="Province" />
        <Input name="gpa" label="GPA" inputMode="decimal" />
      </>
    );
  }

  return (
    <>
      <Input name="institution" label="Institution" />
      <Input name="department" label="Department" />
      <Input name="research_area" label="Research area" />
      <SelectField name="career_stage" label="Career stage">
        <option value="">Select stage</option>
        <option value="early">Early</option>
        <option value="mid">Mid</option>
        <option value="senior">Senior</option>
        <option value="emeritus">Emeritus</option>
      </SelectField>
      <Input
        name="research_keywords"
        label="Research keywords"
        helperText="Separate keywords with commas."
      />
    </>
  );
}

export default async function OnboardingRolePage({ params }: PageProps) {
  const { role: roleParam } = await params;

  if (!isRole(roleParam)) {
    notFound();
  }

  const role = roleParam;
  const session = await getSession();

  if (session?.role) {
    redirect("/dashboard");
  }

  async function completeOnboarding(formData: FormData) {
    "use server";

    const input = parseOnboardingForm(role, formData);
    await upsertRoleProfile(input);
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">{labels[role].title}</h1>
        <p className="mt-2 text-gray-600">{labels[role].description}</p>
      </div>

      <form action={completeOnboarding} className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="grid gap-5">
          <Input name="display_name" label="Display name" required />
          <RoleFields role={role} />
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit">Complete onboarding</Button>
        </div>
      </form>
    </div>
  );
}
