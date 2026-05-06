type EnvSource = Record<string, string | undefined>;

type PublicEnvKey =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY";
type ServerEnvKey = PublicEnvKey | "SUPABASE_SERVICE_ROLE_KEY";
type ServiceEnvKey = "NEXT_PUBLIC_SUPABASE_URL" | "SUPABASE_SERVICE_ROLE_KEY";

export type PublicEnv = {
  [Key in PublicEnvKey]: string;
};

export type ServerEnv = {
  [Key in ServerEnvKey]: string;
};

export type ServiceEnv = {
  [Key in ServiceEnvKey]: string;
};

function defaultPublicEnv(): EnvSource {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

function defaultServerEnv(): EnvSource {
  return {
    ...defaultPublicEnv(),
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

function defaultServiceEnv(): EnvSource {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

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

export function getPublicEnv(source: EnvSource = defaultPublicEnv()): PublicEnv {
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

export function getServerEnv(source: EnvSource = defaultServerEnv()): ServerEnv {
  return {
    ...getPublicEnv(source),
    SUPABASE_SERVICE_ROLE_KEY: readRequiredEnv(
      source,
      "SUPABASE_SERVICE_ROLE_KEY",
    ),
  };
}

export function getServiceEnv(source: EnvSource = defaultServiceEnv()): ServiceEnv {
  return {
    NEXT_PUBLIC_SUPABASE_URL: readRequiredEnv(
      source,
      "NEXT_PUBLIC_SUPABASE_URL",
    ),
    SUPABASE_SERVICE_ROLE_KEY: readRequiredEnv(
      source,
      "SUPABASE_SERVICE_ROLE_KEY",
    ),
  };
}
