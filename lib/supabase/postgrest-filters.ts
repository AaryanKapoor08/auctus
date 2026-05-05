// These characters are meaningful in PostgREST's `.or()` filter DSL or are
// easy to confuse with delimiters in future hand-written filters.
const POSTGREST_FILTER_RESERVED = /[\\,():.*%\[\]"']/g;

export function sanitizePostgrestSearch(value: string, maxLength = 128) {
  return Array.from(value.trim())
    .slice(0, maxLength)
    .join("")
    .replace(POSTGREST_FILTER_RESERVED, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildIlikeOrFilter(columns: string[], search: string) {
  const safeSearch = sanitizePostgrestSearch(search);

  if (!safeSearch) {
    return null;
  }

  return columns
    .map((column) => `${column}.ilike.%${safeSearch}%`)
    .join(",");
}
