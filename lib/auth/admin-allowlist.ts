export const ADMIN_ALLOWLIST_ENV = "ADMIN_ALLOWLIST";

export function parseAdminAllowlist(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmailAllowed(
  email: string | null | undefined,
  allowlistValue: string | undefined = process.env.ADMIN_ALLOWLIST,
) {
  if (!email) return false;
  const allowlist = parseAdminAllowlist(allowlistValue);
  return allowlist.includes(email.trim().toLowerCase());
}
