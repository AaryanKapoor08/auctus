// Source: ISED Business Benefits Finder.
// robots.txt: https://ised-isde.canada.ca/robots.txt — public crawling allowed; no Disallow on the funding paths.
// ToS: Government of Canada content under the Open Government Licence – Canada.
// Verification: see scraper/SOURCES.md §1.

import * as cheerio from "cheerio";
import type { ScrapeContext, ScrapedFunding, SourceModule } from "../../types.js";
import { cleanText, parseAmountRange, parseDate, resolveUrl } from "../../utils.js";

const LISTING_URL =
  "https://ised-isde.canada.ca/site/innovation-canada/en/innovation-canada";
const BENEFITS_FINDER_URL = "https://innovation.ised-isde.canada.ca/s/?language=en_CA";
const RATE_LIMIT_MS = 1500;

export function parseIsedBenefitsFinder(html: string, baseUrl: string): ScrapedFunding[] {
  const $ = cheerio.load(html);
  const items: ScrapedFunding[] = [];

  $(".funding-card").each((_, el) => {
    const titleEl = $(el).find(".funding-title a").first();
    const name = cleanText(titleEl.text());
    if (!name) return;

    const href = titleEl.attr("href") ?? null;
    const sourceUrl = resolveUrl(href, baseUrl);
    if (!sourceUrl) return;

    const provider = cleanText($(el).find(".funding-provider").text()) || "Government of Canada";
    const description = cleanText($(el).find(".funding-summary").text()) || null;
    const deadline = parseDate($(el).find(".funding-deadline").text());
    const { min, max } = parseAmountRange($(el).find(".funding-amount").text());
    const tags = $(el)
      .find(".funding-tag")
      .map((_i, t) => cleanText($(t).text()))
      .get()
      .filter(Boolean);

    items.push({
      type: "business_grant",
      name,
      description,
      provider,
      amount_min: min,
      amount_max: max,
      deadline,
      application_url: sourceUrl,
      source_url: sourceUrl,
      eligibility: { audience: "business" },
      requirements: [],
      category: "business",
      tags,
      scraped_from: baseUrl,
    });
  });

  if (items.length === 0) {
    $("a[href]").each((_, el) => {
      const link = $(el);
      const name = cleanText(link.text());
      const href = link.attr("href") ?? null;
      if (!name || !href) return;
      if (
        !/compute|cluster|innovative solutions|strategic response|elevateip|business benefits finder/i.test(
          name,
        )
      ) {
        return;
      }

      const sourceUrl = resolveUrl(href, baseUrl);
      if (!sourceUrl) return;

      const paragraph = cleanText(link.closest("div, section, article, li").find("p").first().text());
      items.push({
        type: "business_grant",
        name,
        description: paragraph || "Program surfaced from Innovation Canada's Business Benefits Finder ecosystem.",
        provider: "Innovation, Science and Economic Development Canada",
        amount_min: null,
        amount_max: null,
        deadline: null,
        application_url: sourceUrl,
        source_url: sourceUrl,
        eligibility: { audience: "business", source_surface: "business-benefits-finder" },
        requirements: [],
        category: "business",
        tags: ["business-benefits-finder"],
        scraped_from: baseUrl,
      });
    });
  }

  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.name}|${item.source_url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function scrapeIsedBenefitsFinder(ctx: ScrapeContext): Promise<ScrapedFunding[]> {
  const html = await ctx.fetchHtml(LISTING_URL);
  await ctx.delay(RATE_LIMIT_MS);
  const rows = parseIsedBenefitsFinder(html, LISTING_URL);
  if (rows.length > 0) return rows;

  return [
    {
      type: "business_grant",
      name: "Business Benefits Finder",
      description:
        "Tailored official search surface for Canadian business funding, loans, tax credits, wage subsidies, expert advice, and related support.",
      provider: "Innovation, Science and Economic Development Canada",
      amount_min: null,
      amount_max: null,
      deadline: null,
      application_url: BENEFITS_FINDER_URL,
      source_url: BENEFITS_FINDER_URL,
      eligibility: { audience: "business", source_surface: "business-benefits-finder" },
      requirements: [],
      category: "business",
      tags: ["business-benefits-finder"],
      scraped_from: LISTING_URL,
    },
  ];
}

export const isedBenefitsFinder: SourceModule = {
  id: "ised-benefits-finder",
  role: "business",
  type: "business_grant",
  listingUrl: LISTING_URL,
  rateLimitMs: RATE_LIMIT_MS,
  scrape: scrapeIsedBenefitsFinder,
};
