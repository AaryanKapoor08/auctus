"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Session } from "@contracts/session";
import { createClient } from "@/lib/supabase/client";

export function useSession(initialSession: Session | null = null) {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(initialSession);
  const [loading, setLoading] = useState(initialSession === null);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    async function loadSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setSession(null);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      setSession({
        user_id: user.id,
        role: profile?.role ?? null,
      });
      setLoading(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadSession();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname]);

  return { session, loading };
};
