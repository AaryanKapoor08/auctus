import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { getRoleProfile } from "@/lib/profile/queries";
import { parseOnboardingForm, updateRoleProfile } from "@/lib/profile/upsert";
import { getSession } from "@/lib/session/get-session";
import type { Role } from "@contracts/role";
import type {
  BusinessProfile,
  ProfessorProfile,
  StudentProfile,
} from "@contracts/profile";

function SelectField({
  name,
  label,
  defaultValue,
  required = false,
  children,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {children}
      </select>
    </label>
  );
}

function RoleFields({
  role,
  details,
}: {
  role: Role;
  details: BusinessProfile | StudentProfile | ProfessorProfile;
}) {
  if (role === "business") {
    const business = details as BusinessProfile;
    return (
      <>
        <Input
          name="business_name"
          label="Business name"
          defaultValue={business.business_name}
          required
        />
        <Input name="industry" label="Industry" defaultValue={business.industry ?? ""} />
        <Input name="location" label="Location" defaultValue={business.location ?? ""} />
        <Input
          name="revenue"
          label="Annual revenue"
          inputMode="decimal"
          defaultValue={business.revenue ?? ""}
        />
        <Input
          name="employees"
          label="Employees"
          inputMode="numeric"
          defaultValue={business.employees ?? ""}
        />
      </>
    );
  }

  if (role === "student") {
    const student = details as StudentProfile;
    return (
      <>
        <SelectField
          name="education_level"
          label="Education level"
          defaultValue={student.education_level}
          required
        >
          <option value="">Select level</option>
          <option value="high_school">High school</option>
          <option value="college">College</option>
          <option value="undergrad">Undergraduate</option>
          <option value="masters">Masters</option>
          <option value="phd">PhD</option>
        </SelectField>
        <Input
          name="field_of_study"
          label="Field of study"
          defaultValue={student.field_of_study ?? ""}
          required
        />
        <Input name="institution" label="Institution" defaultValue={student.institution ?? ""} />
        <Input name="province" label="Province" defaultValue={student.province ?? ""} required />
        <Input name="gpa" label="GPA" inputMode="decimal" defaultValue={student.gpa ?? ""} />
      </>
    );
  }

  const professor = details as ProfessorProfile;
  return (
    <>
      <Input name="institution" label="Institution" defaultValue={professor.institution ?? ""} />
      <Input name="department" label="Department" defaultValue={professor.department ?? ""} />
      <Input
        name="research_area"
        label="Research area"
        defaultValue={professor.research_area ?? ""}
        required
      />
      <SelectField
        name="career_stage"
        label="Career stage"
        defaultValue={professor.career_stage}
        required
      >
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
        defaultValue={professor.research_keywords.join(", ")}
      />
    </>
  );
}

function getFormErrorMessage(error?: string) {
  if (!error) return null;

  const messages: Record<string, string> = {
    invalid: "Check the required fields and try again.",
    save_failed: "We could not save your profile. Try again.",
    auth_required: "Sign in again, then update your profile.",
  };

  return messages[error] ?? "We could not save your profile. Try again.";
}

function getProfileFormError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("authentication")) return "auth_required";
  if (message.includes("required") || message.includes("invalid")) return "invalid";

  return "save_failed";
}

export default async function EditProfilePage({
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

  const role = profile.role;

  async function saveProfile(formData: FormData) {
    "use server";

    try {
      const input = parseOnboardingForm(role, formData);
      await updateRoleProfile(input);
    } catch (error) {
      redirect(`/profile/edit?error=${getProfileFormError(error)}`);
    }

    redirect("/profile");
  }

  const params = await searchParams;
  const formError = getFormErrorMessage(params.error);

  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase text-gray-500">Profile</p>
          <h1 className="mt-2 text-3xl font-semibold text-gray-900">Edit profile</h1>
          <p className="mt-2 text-gray-600">
            Keep your profile current so funding recommendations stay relevant.
          </p>
        </div>

        <Card className="border border-gray-200">
          <form action={saveProfile}>
            {formError && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}
            <div className="grid gap-5">
              <Input
                name="display_name"
                label="Display name"
                defaultValue={profile.base.display_name}
                required
              />
              <RoleFields role={profile.role} details={profile.details} />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="submit">Save profile</Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
