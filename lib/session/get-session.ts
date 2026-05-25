import type { GetSession, Session } from "@contracts/session";
import { createClient } from "@/lib/supabase/server";
import { timeServer } from "@/lib/perf/server-timing";

type SupabaseUser = {
  id: string;
};

type ProfileRole = Pick<Session, "role"> | null;

export function mapSession(
  user: SupabaseUser | null,
  profile: ProfileRole,
): Session | null {
  if (!user) {
    return null;
  }

  return {
    user_id: user.id,
    role: profile?.role ?? null,
  };
}

async function loadSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return mapSession(user, profile);
}

export const getSession: GetSession = async () => {
  return timeServer("getSession", loadSession);
};
