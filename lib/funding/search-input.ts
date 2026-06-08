import type { Role } from "@contracts/role";
import { FUNDING_FILTERS } from "./filter-definitions";

export const FUNDING_SEARCH_MAX_CHARS = 256;
export const FUNDING_CATEGORY_MAX_CHARS = 80;
export const FUNDING_MAX_CATEGORY_FILTERS = 12;
export const FUNDING_MAX_PAGE = 100;

const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/g;

export type FundingPageSearchParams = {
  search?: string | string[];
  category?: string | string[];
  deadline?: string | string[];
  sort?: string | string[];
  page?: string | string[];
};

export type FundingParsedDeadline = "all" | "30" | "60" | "90" | "rolling";
export type FundingParsedSort = "relevance" | "deadline" | "amount" | "newest";

export function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeFundingSearchInput(
  value: string | string[] | undefined,
  maxLength = FUNDING_SEARCH_MAX_CHARS,
) {
  return Array.from(firstSearchParam(value)?.trim() ?? "")
    .slice(0, maxLength)
    .join("")
    .replace(CONTROL_CHARACTERS, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCategoryValue(value: string) {
  return Array.from(value.trim())
    .slice(0, FUNDING_CATEGORY_MAX_CHARS)
    .join("")
    .replace(CONTROL_CHARACTERS, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseFundingCategories(
  value: string | string[] | undefined,
  role?: Role,
) {
  const allowedValues = role
    ? new Set(
        FUNDING_FILTERS[role]
          .flatMap((filter) => filter.options ?? [])
          .map((option) => option.value),
      )
    : null;

  const values = (Array.isArray(value) ? value : value ? [value] : [])
    .flatMap((item) => item.split(","))
    .map(normalizeCategoryValue)
    .filter(Boolean)
    .filter((item) => !allowedValues || allowedValues.has(item));

  return Array.from(new Set(values)).slice(0, FUNDING_MAX_CATEGORY_FILTERS);
}

export function parseFundingDeadline(
  value: string | string[] | undefined,
): FundingParsedDeadline {
  const deadline = firstSearchParam(value);
  return deadline === "30" ||
    deadline === "60" ||
    deadline === "90" ||
    deadline === "rolling"
    ? deadline
    : "all";
}

export function parseFundingSort(
  value: string | string[] | undefined,
): FundingParsedSort {
  const sort = firstSearchParam(value);
  return sort === "deadline" || sort === "amount" || sort === "newest"
    ? sort
    : "relevance";
}

export function parseFundingPage(value: string | string[] | undefined) {
  const page = Number(firstSearchParam(value));
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(Math.floor(page), FUNDING_MAX_PAGE);
}

export function parseFundingPageSearchParams(
  params: FundingPageSearchParams,
  role: Role,
) {
  return {
    search: normalizeFundingSearchInput(params.search),
    categories: parseFundingCategories(params.category, role),
    deadline: parseFundingDeadline(params.deadline),
    sort: parseFundingSort(params.sort),
    page: parseFundingPage(params.page),
  };
}
