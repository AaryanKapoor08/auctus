// Shared session shape used by server and client session helpers.

import type { Role } from "./role";

export interface Session {
  user_id: string; // UUID
  // Nullable to handle the gap between sign-in and onboarding completion.
  // A signed-in user with `role: null` has not picked a role yet; route them to /onboarding.
  role: Role | null;
}

// Server-side helper signature.
export type GetSession = () => Promise<Session | null>;

// Client-side hook signature.
export type UseSession = () => {
  session: Session | null;
  loading: boolean;
};
