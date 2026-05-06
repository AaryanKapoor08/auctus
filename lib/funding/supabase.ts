import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getPublicEnv, getServiceEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function createFundingReadClient() {
  return createClient();
}

export function createFundingServiceClient() {
  const env = getServiceEnv();

  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

export function createFundingAnonClient() {
  const env = getPublicEnv();

  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
