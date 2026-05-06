import "server-only";

const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const URL_WITH_QUERY_PATTERN = /\bhttps?:\/\/[^\s"'<>?]+(?:\?[^\s"'<>]*)?/gi;
const MAX_REDACTED_LENGTH = 32 * 1024;

export function redactAiLogValue(value: unknown): string {
  const raw = typeof value === "string" ? value : JSON.stringify(value);
  const redacted = raw
    .replace(EMAIL_PATTERN, "[redacted-email]")
    .replace(URL_WITH_QUERY_PATTERN, (match) => {
      const queryIndex = match.indexOf("?");
      return queryIndex === -1 ? match : match.slice(0, queryIndex);
    });

  if (redacted.length <= MAX_REDACTED_LENGTH) return redacted;
  return `${redacted.slice(0, MAX_REDACTED_LENGTH - 11)}[truncated]`;
}
