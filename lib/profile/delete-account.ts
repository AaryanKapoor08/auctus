"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session/get-session";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDeleteAccountConfirmation } from "./delete-account-confirmation";

export async function deleteCurrentUserAccount(formData: FormData) {
  const session = await getSession();

  if (!session?.user_id) {
    redirect("/sign-in");
  }

  if (!isDeleteAccountConfirmation(formData.get("confirm_delete"))) {
    redirect("/profile?error=delete_confirmation");
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(session.user_id);

  if (error) {
    throw new Error("Account deletion failed. Try again or contact support.");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/?notice=account_deleted");
}
