import { cache } from "react";
import type { GetSession, Session } from "@contracts/session";
import { createClient } from "@/lib/supabase/server";
import { timeServer } from "@/lib/perf/server-timing";

type SupabaseUser = {
  id: string;
};

type ProfileRole = Pick<Session, "role">;
type ProfileRoleRow = ProfileRole & {
  display_name: string | null;
  avatar_url: string | null;
};

export type SessionProfileContext = {
  user: SupabaseUser | null;
  profile: ProfileRoleRow | null;
};

export function mapSession(
  user: SupabaseUser | null,
  profile: ProfileRole | null,
): Session | null {
  if (!user) {
    return null;
  }

  return {
    user_id: user.id,
    role: profile?.role ?? null,
  };
}

async function loadSessionProfileContext(): Promise<SessionProfileContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: profile ?? null,
  };
}

export const getSessionProfileContext = cache(() =>
  timeServer("getSessionProfileContext", loadSessionProfileContext),
);

export const getSession: GetSession = async () => {
  return timeServer("getSession", async () => {
    const { user, profile } = await getSessionProfileContext();
    return mapSession(user, profile);
  });
};
