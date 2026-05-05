const POSTGREST_FILTER_RESERVED = /[\\,():.*%]/g;

export function sanitizePostgrestSearch(value: string, maxLength = 128) {
  return value
    .trim()
    .slice(0, maxLength)
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
