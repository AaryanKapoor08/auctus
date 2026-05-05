import { redirect } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/session/get-session";
import { getPostAuthRoute } from "@/lib/session/post-auth-route";

function getAuthCallbackUrl() {
  return `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`;
}

async function signInWithGoogle() {
  "use server";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthCallbackUrl(),
    },
  });

  if (error || !data.url) {
    redirect("/sign-in?error=oauth");
  }

  redirect(data.url);
}

async function signInWithEmail(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email) {
    redirect("/sign-in?error=email");
  }

  if (!password) {
    redirect("/sign-in?error=password");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/sign-in?error=credentials");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    redirect(getPostAuthRoute(profile?.role));
  }

  redirect(getPostAuthRoute(null));
}

function getErrorMessage(error?: string) {
  if (!error) return null;

  const messages: Record<string, string> = {
    email: "Enter your email address.",
    password: "Enter your password.",
    credentials: "Email or password is incorrect.",
    oauth: "Google sign-in could not be started. Try again.",
    link_expired: "That sign-in link expired or could not be verified. Try signing in again.",
    registered: "That email is already registered. Sign in instead.",
  };

  return messages[error] ?? "Sign-in failed. Try again.";
}

function getNoticeMessage(notice?: string) {
  if (notice === "check_email") {
    return "Check your email to confirm your account, then sign in.";
  }

  return null;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect(getPostAuthRoute(session.role));
  }

  const params = await searchParams;
  const errorMessage = getErrorMessage(params.error);
  const noticeMessage = getNoticeMessage(params.notice);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
          <p className="mt-2 text-sm text-gray-600">
            Use Google or your email and password to access your account.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
        {noticeMessage && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {noticeMessage}
          </div>
        )}

        <form action={signInWithGoogle}>
          <Button type="submit" variant="primary" className="w-full">
            Continue with Google
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-medium uppercase text-gray-500">
            or
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form action={signInWithEmail} className="space-y-4">
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
            autoComplete="current-password"
            required
            placeholder="Enter your password"
          />
          <Button type="submit" variant="outline" className="w-full">
            Sign in with email
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          New to Auctus?{" "}
          <Link href="/sign-up" className="font-medium text-gray-900 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
