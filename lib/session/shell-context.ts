import "server-only";

import { cache } from "react";
import type { Session } from "@contracts/session";
import type { NavProfile } from "@/lib/session/navigation";
import {
  getSessionProfileContext,
  mapSession,
} from "@/lib/session/get-session";
import { timeServer } from "@/lib/perf/server-timing";

export type ShellContext = {
  session: Session | null;
  navProfile: NavProfile | null;
};

async function loadShellContext(): Promise<ShellContext> {
  const { user, profile } = await getSessionProfileContext();

  return {
    session: mapSession(user, profile),
    navProfile: user
      ? {
          display_name: profile?.display_name ?? null,
          avatar_url: profile?.avatar_url ?? null,
        }
      : null,
  };
}

export const getShellContext = cache(() =>
  timeServer("getShellContext", loadShellContext),
);
