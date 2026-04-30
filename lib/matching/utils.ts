import type { FundingItem } from "@contracts/funding";

export function text(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function textIncludes(haystack: unknown, needle: unknown) {
  const haystackText = text(haystack);
  const needleText = text(needle);

  return Boolean(
    haystackText &&
      needleText &&
      (haystackText.includes(needleText) || needleText.includes(haystackText)),
  );
}

export function includesValue(value: unknown, candidate: unknown) {
  const candidateText = text(candidate);
  if (!candidateText) return false;

  if (Array.isArray(value)) {
    return value.some((entry) => textIncludes(entry, candidateText));
  }

  return textIncludes(value, candidateText);
}

export function itemHasText(item: FundingItem, candidate: unknown) {
  const candidateText = text(candidate);
  if (!candidateText) return false;

  return [
    item.name,
    item.provider,
    item.category,
    ...item.tags,
    ...item.requirements,
  ].some((value) => textIncludes(value, candidateText));
}

export function numberInRange(
  value: number | null,
  min: unknown,
  max: unknown,
) {
  if (value === null) return false;

  const minNumber = typeof min === "number" ? min : null;
  const maxNumber = typeof max === "number" ? max : null;

  if (minNumber !== null && value < minNumber) return false;
  if (maxNumber !== null && value > maxNumber) return false;

  return minNumber !== null || maxNumber !== null;
}

export function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}
