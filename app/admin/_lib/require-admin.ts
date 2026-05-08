import { notFound, redirect } from "next/navigation";
import { isAdminEmailAllowed } from "@/lib/auth/admin-allowlist";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (!isAdminEmailAllowed(user.email)) {
    notFound();
  }

  return user;
}
