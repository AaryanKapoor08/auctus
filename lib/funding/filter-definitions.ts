import type { Role } from "@contracts/role";

export type FundingFilterDefinition = {
  key: string;
  label: string;
  type: "text" | "select";
  options?: Array<{ value: string; label: string; group?: string }>;
};

export const FUNDING_FILTERS: Record<Role, FundingFilterDefinition[]> = {
  business: [
    { key: "search", label: "Search", type: "text" },
    {
      key: "category",
      label: "Filters",
      type: "select",
      options: [
        { value: "Federal", label: "Federal programs", group: "Source" },
        { value: "Provincial", label: "Provincial / regional", group: "Source" },
        { value: "Startup", label: "Startup / early stage", group: "Business need" },
        { value: "Growth", label: "Growth / scaling", group: "Business need" },
        { value: "Financing", label: "Loans / financing", group: "Business need" },
        { value: "Export", label: "Export / trade", group: "Business need" },
        { value: "Digital", label: "Digital / technology", group: "Business need" },
        { value: "Innovation", label: "R&D / innovation", group: "Business need" },
        { value: "Equipment", label: "Equipment / IP", group: "Business need" },
        { value: "Sustainability", label: "Clean growth", group: "Business need" },
        { value: "Advisory", label: "Mentorship / advisory", group: "Support type" },
        { value: "Indigenous", label: "Indigenous entrepreneurs", group: "Audience" },
        { value: "Women", label: "Women entrepreneurs", group: "Audience" },
        { value: "Black Entrepreneurs", label: "Black entrepreneurs", group: "Audience" },
        { value: "2SLGBTQI+", label: "2SLGBTQI+ entrepreneurs", group: "Audience" },
      ],
    },
  ],
  student: [
    { key: "search", label: "Search", type: "text" },
    {
      key: "category",
      label: "Filters",
      type: "select",
      options: [
        { value: "Federal", label: "Federal", group: "Source" },
        { value: "Provincial", label: "Provincial / territorial", group: "Source" },
        { value: "Indigenous", label: "Indigenous students", group: "Audience" },
        { value: "Women", label: "Women", group: "Audience" },
        { value: "International", label: "International students", group: "Audience" },
        { value: "Need-based", label: "Bursary / financial need", group: "Award type" },
        { value: "Merit-based", label: "Scholarship / merit", group: "Award type" },
        { value: "Essay / Prize", label: "Essay / prize", group: "Award type" },
        { value: "Entrance", label: "Entrance awards", group: "Award type" },
        { value: "Graduate", label: "Graduate / doctoral", group: "Study level" },
        { value: "Undergraduate", label: "Undergraduate", group: "Study level" },
        { value: "STEM", label: "STEM", group: "Field" },
        { value: "Health", label: "Health / medicine", group: "Field" },
        { value: "Trades", label: "Trades / apprenticeships", group: "Field" },
        { value: "Business", label: "Business", group: "Field" },
        { value: "Arts", label: "Arts / humanities", group: "Field" },
        { value: "Education", label: "Education", group: "Field" },
        { value: "Law / Social Sciences", label: "Law / social sciences", group: "Field" },
        { value: "Environment", label: "Environment / forestry", group: "Field" },
        { value: "Athletics", label: "Athletics", group: "Field" },
      ],
    },
  ],
  professor: [
    { key: "search", label: "Search", type: "text" },
    {
      key: "category",
      label: "Filters",
      type: "select",
      options: [
        { value: "Federal", label: "Federal councils", group: "Source" },
        { value: "NSERC", label: "NSERC", group: "Source" },
        { value: "SSHRC", label: "SSHRC", group: "Source" },
        { value: "STEM", label: "Natural sciences / engineering", group: "Research area" },
        { value: "Social Sciences", label: "Social sciences / humanities", group: "Research area" },
        { value: "Environment", label: "Environment / oceans", group: "Research area" },
        { value: "Quantum", label: "Quantum", group: "Research area" },
        { value: "Discovery", label: "Discovery research", group: "Program focus" },
        { value: "Partnership", label: "Partnership / industry", group: "Program focus" },
        { value: "International", label: "International collaboration", group: "Program focus" },
        { value: "Applied Research", label: "Applied / college research", group: "Program focus" },
        { value: "Equipment", label: "Equipment / instruments", group: "Program focus" },
        { value: "Training", label: "Training / fellowships", group: "Program focus" },
        { value: "Equity / Diversity", label: "Equity / diversity", group: "Program focus" },
        { value: "Interdisciplinary", label: "Interdisciplinary", group: "Program focus" },
      ],
    },
  ],
};
