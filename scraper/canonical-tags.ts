import type { FundingType } from "../contracts/funding.js";
import type { ScrapedFunding } from "./types.js";

export type CanonicalFundingInput = Pick<
  ScrapedFunding,
  "type" | "name" | "description" | "provider" | "category" | "tags" | "requirements" | "scraped_from"
>;

function corpusText(row: CanonicalFundingInput) {
  return [
    row.name,
    row.description ?? "",
    row.provider,
    row.category ?? "",
    row.scraped_from,
    row.tags.join(" "),
    row.requirements.join(" "),
  ]
    .join(" ")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function has(text: string, pattern: RegExp) {
  return pattern.test(text);
}

function unique(tags: Array<string | null>) {
  return Array.from(new Set(tags.filter((tag): tag is string => Boolean(tag))));
}

export function canonicalFundingTags(row: CanonicalFundingInput) {
  const text = corpusText(row);
  const source = row.scraped_from.toLowerCase();
  const tags: Array<string | null> = [];

  if (row.type === "business_grant") {
    tags.push("Business");
    tags.push("Federal");

    if (has(text, /new brunswick|nova scotia|prince edward island|newfoundland|labrador|atlantic|regional|province|provincial|toronto|vancouver|calgary|edmonton|winnipeg|halifax|fredericton|moncton/)) tags.push("Provincial");
    if (has(text, /startup|start-up|start up|new venture|early validation|accelerator|incubator|elevateip/)) tags.push("Startup");
    if (has(text, /growth|scale|scaling|expand|expansion|commercializ|market trend|business data|cluster|strategic response/)) tags.push("Growth");
    if (has(text, /loan|financ|capital|credit|bdc|small business financing|offset cost|up to \$|funding/)) tags.push("Financing");
    if (has(text, /export|trade|tariff|cusma|united states|market expansion|international/)) tags.push("Export");
    if (has(text, /digital|software|ecommerce|e-commerce|technology|ai|compute|data|intellectual property|ip\b/)) tags.push("Digital");
    if (has(text, /innovative|innovation|r&d|research|develop|prototype|commercializ|cutting-edge|clusters?|ai|quantum/)) tags.push("Innovation");
    if (has(text, /equipment|leasehold|facility|facilities|intellectual property|ip\b/)) tags.push("Equipment");
    if (has(text, /clean|energy|environment|sustainab|green|climate|efficiency/)) tags.push("Sustainability");
    if (has(text, /mentor|training|network|knowledge hub|resources|support network|guidance|advisory|app|newsletter|finder/)) tags.push("Advisory");
    if (has(text, /indigenous|aboriginal|first nations|metis|inuit/)) tags.push("Indigenous");
    if (has(text, /women|woman|female/)) tags.push("Women");
    if (has(text, /black entrepreneur/)) tags.push("Black Entrepreneurs");
    if (has(text, /2slgbtqi\+|lgbtq/)) tags.push("2SLGBTQI+");
  }

  if (row.type === "scholarship") {
    tags.push("Student", "Scholarship");

    if (source.includes("educanada") || has(text, /international|foreign|non-canadian|non canadian|global affairs/)) tags.push("International", "Federal");
    if (source.includes("sac-isc") || has(text, /indigenous|aboriginal|first nations|metis|inuit|native|indspire|dene|cree|ojibw|anishinaabe|wsanec|nuu-chah-nulth/)) tags.push("Indigenous", "Federal");
    if (has(text, /new brunswick|nova scotia|prince edward island|newfoundland|labrador|quebec|ontario|manitoba|saskatchewan|alberta|british columbia|yukon|northwest territories|nunavut|provincial|territorial|regina|winnipeg|york|calgary|toronto|vancouver/)) tags.push("Provincial");
    if (has(text, /bursary|bursaries|financial need|in need|need-based|support program|student financial support/)) tags.push("Need-based");
    if (has(text, /scholarship|award|prize|excellence|merit|leadership|fellowship/)) tags.push("Merit-based");
    if (has(text, /essay|prize|competition/)) tags.push("Essay / Prize");
    if (has(text, /entrance|first year|1st year/)) tags.push("Entrance");
    if (has(text, /graduate|master|master's|masters|doctoral|doctorate|phd|postgraduate|research training/)) tags.push("Graduate");
    if (has(text, /undergraduate|bachelor|college|university|diploma/)) tags.push("Undergraduate");
    if (has(text, /science|technology|engineering|math|mathematics|computer|data|artificial intelligence|ai\b|stem|physics|chemistry|biology|geology|geomatics|forestry|environment|energy/)) tags.push("STEM");
    if (has(text, /health|nursing|nurse|medicine|medical|dental|kinesiology|pharmacy|therapy|psychology|social work|helping professions|cancer/)) tags.push("Health");
    if (has(text, /trade|trades|apprentice|apprenticeship|journey|carpentry|welding/)) tags.push("Trades");
    if (has(text, /business|commerce|accounting|finance|administration|mba|entrepreneur/)) tags.push("Business");
    if (has(text, /art|arts|humanities|music|design|history|political science|native studies|literature|creative|communications|architecture|fine arts/)) tags.push("Arts");
    if (has(text, /education|teacher|teaching|school board/)) tags.push("Education");
    if (has(text, /law|legal|political|policy|social sciences|sociology|social work|community/)) tags.push("Law / Social Sciences");
    if (has(text, /environment|forestry|fish|wildlife|conservation|energy|geomatics|ocean/)) tags.push("Environment");
    if (has(text, /athletic|athlete|sports?|soccer|hockey/)) tags.push("Athletics");
    if (has(text, /women|woman|female|girls/)) tags.push("Women");
  }

  if (row.type === "research_grant") {
    tags.push("Professor", "Research", "Federal");

    if (row.provider.toLowerCase().includes("nserc") || has(text, /nserc|natural sciences|engineering/)) tags.push("NSERC", "STEM");
    if (row.provider.toLowerCase().includes("sshrc") || has(text, /sshrc|social sciences|humanities|social innovation/)) tags.push("SSHRC", "Social Sciences");
    if (has(text, /quantum/)) tags.push("Quantum", "STEM");
    if (has(text, /environment|ocean|biodiversity|ecosystem|forest|climate|sustainab/)) tags.push("Environment");
    if (has(text, /discovery/)) tags.push("Discovery");
    if (has(text, /alliance|partner|partnership|industry|collaboration|collaborative|community/)) tags.push("Partnership");
    if (has(text, /international|global|g7|belmont/)) tags.push("International");
    if (has(text, /applied research|college|community/)) tags.push("Applied Research");
    if (has(text, /equipment|instrument|tools|facilities|facility/)) tags.push("Equipment");
    if (has(text, /graduate|doctoral|master|postdoctoral|fellowship|training|trainee|travel supplement|award/)) tags.push("Training");
    if (has(text, /women|equity|diversity|inclusion|dimensions/)) tags.push("Equity / Diversity");
    if (has(text, /interdisciplinary|transdisciplinary|catalyst|team/)) tags.push("Interdisciplinary");
  }

  return unique(tags);
}

export function primaryFundingCategory(type: FundingType, tags: string[]) {
  const orderedByType: Record<FundingType, string[]> = {
    business_grant: [
      "Startup",
      "Growth",
      "Financing",
      "Export",
      "Digital",
      "Innovation",
      "Equipment",
      "Sustainability",
      "Advisory",
      "Indigenous",
      "Women",
    ],
    scholarship: [
      "Indigenous",
      "International",
      "Need-based",
      "Merit-based",
      "Graduate",
      "Undergraduate",
      "STEM",
      "Health",
      "Trades",
      "Business",
      "Arts",
      "Education",
    ],
    research_grant: [
      "NSERC",
      "SSHRC",
      "Discovery",
      "Partnership",
      "International",
      "Applied Research",
      "Equipment",
      "Training",
      "Social Sciences",
      "STEM",
    ],
  };

  return orderedByType[type].find((tag) => tags.includes(tag)) ?? tags[0] ?? null;
}
