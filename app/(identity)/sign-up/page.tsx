import Link from "next/link";
import { redirect } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { getSession } from "@/lib/session/get-session";
import { createClient } from "@/lib/supabase/server";
import { getPostAuthRoute } from "@/lib/session/post-auth-route";

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

  redirect(getPostAuthRoute(null));
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
  if (session) {
    redirect(getPostAuthRoute(session.role));
  }

  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);

  return (
    <div className="auc-page min-h-screen px-4 py-16">
      <div className="auc-card mx-auto max-w-md p-6">
        <div className="mb-6">
          <div className="auc-label">Account</div>
          <h1 className="display mt-2 text-4xl leading-none">Create your account</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--auc-ink-2)]">
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
          <div className="h-px flex-1 bg-[var(--auc-rule)]" />
          <span className="mono text-xs font-bold uppercase tracking-[0.06em] text-[var(--auc-muted)]">or</span>
          <div className="h-px flex-1 bg-[var(--auc-rule)]" />
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

        <p className="mt-6 text-center text-sm text-[var(--auc-ink-2)]">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-black text-[var(--auc-ink)] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
