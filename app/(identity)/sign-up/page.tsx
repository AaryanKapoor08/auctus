import Link from "next/link";
import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getSession } from "@/lib/session/get-session";
import { createClient } from "@/lib/supabase/server";

function getAuthCallbackUrl() {
  return `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`;
}

async function signUpWithGoogle() {
  "use server";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthCallbackUrl(),
    },
  });

  if (error || !data.url) {
    redirect("/sign-up?error=oauth");
  }

  redirect(data.url);
}

async function signUpWithEmail(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!email) {
    redirect("/sign-up?error=email");
  }

  if (!password) {
    redirect("/sign-up?error=password");
  }

  if (password !== confirmPassword) {
    redirect("/sign-up?error=password_mismatch");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("already") || message.includes("registered")) {
      redirect("/sign-up?error=registered");
    }

    redirect("/sign-up?error=signup");
  }

  if (data.user && data.user.identities?.length === 0) {
    redirect("/sign-up?error=registered");
  }

  if (!data.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      redirect("/sign-in?notice=check_email");
    }
  }

  redirect("/onboarding");
}

function getErrorMessage(error?: string) {
  if (!error) return null;

  const messages: Record<string, string> = {
    email: "Enter your email address.",
    password: "Enter a password.",
    password_mismatch: "Passwords do not match.",
    registered: "That email is already registered. Sign in instead.",
    oauth: "Google sign-up could not be started. Try again.",
    signup: "Account creation failed. Try again.",
  };

  return messages[error] ?? "Account creation failed. Try again.";
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session?.role) {
    redirect("/dashboard");
  }
  if (session) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Set up Auctus, then answer a few questions so your dashboard can show
            relevant funding.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <form action={signUpWithGoogle}>
          <Button type="submit" variant="primary" className="w-full">
            Continue with Google
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-medium uppercase text-gray-500">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form action={signUpWithEmail} className="space-y-4">
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Create a password"
          />
          <Input
            label="Confirm password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            placeholder="Repeat your password"
          />
          <Button type="submit" variant="outline" className="w-full">
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-gray-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
