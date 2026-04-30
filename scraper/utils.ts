export function cleanText(input: string | null | undefined): string {
  if (input == null) return "";
  return input
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseAmount(input: string | null | undefined): number | null {
  if (input == null) return null;
  const cleaned = String(input).replace(/[\s,$]/g, "").toLowerCase();
  if (cleaned === "") return null;

  const match = cleaned.match(/(\d+(?:\.\d+)?)([kmb])?/);
  if (!match) return null;

  const base = Number(match[1]);
  if (!Number.isFinite(base)) return null;

  const suffix = match[2];
  const multiplier = suffix === "k" ? 1_000 : suffix === "m" ? 1_000_000 : suffix === "b" ? 1_000_000_000 : 1;
  return Math.round(base * multiplier);
}

export function parseAmountRange(
  input: string | null | undefined,
): { min: number | null; max: number | null } {
  if (input == null) return { min: null, max: null };
  const text = String(input);
  const numbers = text.match(/\$\s*\d[\d,]*(?:\.\d+)?\s*(?:[kmb])?|\b\d[\d,]*(?:\.\d+)?\s*[kmb]\b/gi);
  if (!numbers || numbers.length === 0) return { min: null, max: null };

  if (numbers.length === 1) {
    const value = parseAmount(numbers[0]);
    return { min: null, max: value };
  }

  const parsed = numbers.map(parseAmount).filter((n): n is number => n !== null);
  if (parsed.length === 0) return { min: null, max: null };
  return {
    min: Math.min(...parsed),
    max: Math.max(...parsed),
  };
}

export function parseDate(input: string | null | undefined): string | null {
  if (input == null) return null;
  const text = cleanText(input);
  if (text === "" || /rolling|ongoing|continuous|open/i.test(text)) return null;

  const iso = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const [, y, m, d] = iso;
    return `${y}-${m}-${d}`;
  }

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getUTCFullYear().toString().padStart(4, "0");
    const m = (parsed.getUTCMonth() + 1).toString().padStart(2, "0");
    const d = parsed.getUTCDate().toString().padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return null;
}

export function resolveUrl(href: string | null | undefined, baseUrl: string): string | null {
  if (!href) return null;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
