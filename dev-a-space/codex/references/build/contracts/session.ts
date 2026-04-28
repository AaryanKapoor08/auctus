// STATUS: DRAFT (LOCKED at V2.P1 completion gate)
// Owner: Dev A
//
// The slice of session state that Dev B is allowed to read.
// Dev B must NOT reach into Supabase auth helpers directly; consume this contract instead.

import type { Role } from "./role";

export interface Session {
  user_id: string; // UUID
  // Nullable to handle the gap between sign-in and onboarding completion.
  // A signed-in user with `role: null` has not picked a role yet; route them to /onboarding.
  // Dev B must handle the null case in any code path that reads session.role.
  role: Role | null;
  // Add fields here only if Dev B has a real need. Each addition needs the contract change protocol.
}

// Server-side helper signature Dev A publishes from `lib/session/get-session.ts`.
// Dev B may call this in server components and route handlers.
export type GetSession = () => Promise<Session | null>;

// Client-side hook signature Dev A publishes from `lib/session/use-session.ts`.
// Dev B may call this in client components.
export type UseSession = () => {
  session: Session | null;
  loading: boolean;
};
