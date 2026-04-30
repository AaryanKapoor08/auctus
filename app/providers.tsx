"use client";

import { createContext, useContext, type ReactNode } from "react";
import { ToastProvider } from "@/lib/ToastContext";
import { useSession } from "@/lib/session/use-session";
import type { Session } from "@contracts/session";

type AuthContextValue = ReturnType<typeof useSession>;

const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: Session | null;
}) {
  const auth = useSession(initialSession);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function Providers({
  children,
  initialSession = null,
}: {
  children: ReactNode;
  initialSession?: Session | null;
}) {
  return (
    <AuthProvider initialSession={initialSession}>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
