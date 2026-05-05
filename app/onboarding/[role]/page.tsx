import { notFound, redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getSession } from "@/lib/session/get-session";
import { parseOnboardingForm, upsertRoleProfile } from "@/lib/profile/upsert";
import { isRole, type Role } from "@contracts/role";

type PageProps = {
  params: Promise<{ role: string }>;
  searchParams: Promise<{ error?: string }>;
};

const labels: Record<Role, { title: string; description: string }> = {
  business: {
    title: "Business profile",
    description: "Answer a few funding-focused questions so grant matches start relevant.",
  },
  student: {
    title: "Student profile",
    description: "Map your scholarship preferences to the tags available in Auctus.",
  },
  professor: {
    title: "Professor profile",
    description: "Tell us which research funding tags should drive your recommendations.",
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
        <SelectField name="industry" label="What best describes your funding need?">
          <option value="">Select focus</option>
          <option value="Technology / software">Digital or technology</option>
          <option value="Clean energy">Clean energy or sustainability</option>
          <option value="Export growth">Export or market expansion</option>
          <option value="Startup validation">Startup validation</option>
          <option value="Business growth">General growth</option>
        </SelectField>
        <SelectField name="funding_scope" label="Which funding scope is most relevant?">
          <option value="">Select scope</option>
          <option value="New Brunswick">Provincial or local</option>
          <option value="Federal">Federal or Canada-wide</option>
        </SelectField>
        <SelectField name="business_stage" label="What stage is the business in?">
          <option value="">Select stage</option>
          <option value="Startup">Startup</option>
          <option value="Growth">Growth or scaling</option>
          <option value="Export">Export-ready</option>
        </SelectField>
        <Input name="location" label="Province" placeholder="New Brunswick" />
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
        <SelectField name="field_of_study" label="Which field should scholarships match?">
          <option value="">Select field</option>
          <option value="STEM">STEM</option>
          <option value="Arts">Arts or humanities</option>
          <option value="Health">Health</option>
          <option value="Trades">Trades</option>
          <option value="Leadership">Leadership or community</option>
        </SelectField>
        <SelectField name="province" label="Where are you studying?">
          <option value="">Select province</option>
          <option value="New Brunswick">New Brunswick</option>
          <option value="Nova Scotia">Nova Scotia</option>
          <option value="Prince Edward Island">Prince Edward Island</option>
          <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
          <option value="Ontario">Ontario</option>
          <option value="Quebec">Quebec</option>
          <option value="Western Canada">Western Canada</option>
          <option value="Northern Canada">Northern Canada</option>
        </SelectField>
        <SelectField name="funding_basis" label="Which awards are most useful?">
          <option value="">Select basis</option>
          <option value="merit">Merit-based scholarships</option>
          <option value="need">Need-based bursaries</option>
        </SelectField>
        <Input name="institution" label="Institution" />
      </>
    );
  }

  return (
    <>
      <Input name="institution" label="Institution" />
      <SelectField name="research_area" label="Which research area should funding match?">
        <option value="">Select area</option>
        <option value="STEM">STEM or natural sciences</option>
        <option value="social_sciences">Social sciences or humanities</option>
        <option value="Health">Health</option>
        <option value="Interdisciplinary">Interdisciplinary</option>
      </SelectField>
      <SelectField name="research_focus" label="What funding format is most relevant?">
        <option value="">Select focus</option>
        <option value="discovery">Discovery research</option>
        <option value="partnership">Industry partnership</option>
        <option value="equipment">Equipment or facilities</option>
        <option value="interdisciplinary">Team or catalyst funding</option>
      </SelectField>
      <SelectField name="career_stage" label="Career stage">
        <option value="">Select stage</option>
        <option value="early">Early</option>
        <option value="mid">Mid</option>
        <option value="senior">Senior</option>
        <option value="emeritus">Emeritus</option>
      </SelectField>
      <Input
        name="research_keywords"
        label="Specific keywords"
        helperText="Optional. Separate keywords with commas."
      />
    </>
  );
}

function getFormErrorMessage(error?: string) {
  if (!error) return null;

  const messages: Record<string, string> = {
    invalid: "Check the required fields and try again.",
    save_failed: "We could not save your profile. Try again.",
    auth_required: "Sign in again, then complete onboarding.",
    already_onboarded: "This account has already completed onboarding.",
  };

  return messages[error] ?? "We could not save your profile. Try again.";
}

function getProfileFormError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("authentication")) return "auth_required";
  if (message.includes("already")) return "already_onboarded";
  if (message.includes("required") || message.includes("invalid")) return "invalid";

  return "save_failed";
}

export default async function OnboardingRolePage({ params, searchParams }: PageProps) {
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

    try {
      const input = parseOnboardingForm(role, formData);
      await upsertRoleProfile(input);
    } catch (error) {
      redirect(`/onboarding/${role}?error=${getProfileFormError(error)}`);
    }

    redirect("/dashboard");
  }

  const { error } = await searchParams;
  const formError = getFormErrorMessage(error);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">{labels[role].title}</h1>
        <p className="mt-2 text-gray-600">{labels[role].description}</p>
      </div>

      <form action={completeOnboarding} className="rounded-lg border border-gray-200 bg-white p-6">
        {formError && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        )}
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
