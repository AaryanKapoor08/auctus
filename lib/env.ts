type EnvSource = Record<string, string | undefined>;

type PublicEnvKey =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY";
type ServerEnvKey = PublicEnvKey | "SUPABASE_SERVICE_ROLE_KEY";

export type PublicEnv = {
  [Key in PublicEnvKey]: string;
};

export type ServerEnv = {
  [Key in ServerEnvKey]: string;
};

function readRequiredEnv<Key extends string>(
  source: EnvSource,
  key: Key,
): string {
  const value = source[key];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Add it to .env.local for local development or to deployment secrets.`,
    );
  }

  return value;
}

export function getPublicEnv(source: EnvSource = process.env): PublicEnv {
  return {
    NEXT_PUBLIC_SUPABASE_URL: readRequiredEnv(
      source,
      "NEXT_PUBLIC_SUPABASE_URL",
    ),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: readRequiredEnv(
      source,
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ),
  };
}

export function getServerEnv(source: EnvSource = process.env): ServerEnv {
  return {
    ...getPublicEnv(source),
    SUPABASE_SERVICE_ROLE_KEY: readRequiredEnv(
      source,
      "SUPABASE_SERVICE_ROLE_KEY",
    ),
  };
}
