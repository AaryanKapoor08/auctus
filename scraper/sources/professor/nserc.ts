// Source: NSERC Funding Opportunities.
// robots.txt: https://nserc.canada.ca/robots.txt — public crawling allowed.
// ToS: Government of Canada content under the Open Government Licence – Canada.
// Verification: see scraper/SOURCES.md §5.

import * as cheerio from "cheerio";
import type { ScrapeContext, ScrapedFunding, SourceModule } from "../../types.js";
import { cleanText, parseAmountRange, parseDate, resolveUrl } from "../../utils.js";

const LISTING_URL = "https://nserc.canada.ca/en/funding/funding-opportunity";
const RATE_LIMIT_MS = 1500;

export function parseNserc(html: string, baseUrl: string): ScrapedFunding[] {
  const $ = cheerio.load(html);
  const items: ScrapedFunding[] = [];

  $("tr.opp").each((_, el) => {
    const row = $(el);
    const titleEl = row.find("td.opp-name a").first();
    const name = cleanText(titleEl.text());
    if (!name) return;

    const href = titleEl.attr("href") ?? null;
    const sourceUrl = resolveUrl(href, baseUrl);
    if (!sourceUrl) return;

    const program = cleanText(row.find("td.opp-program").text()) || null;
    const stage = cleanText(row.find("td.opp-stage").text()) || null;
    const deadline = parseDate(row.find("td.opp-deadline").text());
    const { min, max } = parseAmountRange(row.find("td.opp-amount").text());

    items.push({
      type: "research_grant",
      name,
      description: cleanText(row.find("td.opp-summary").text()) || null,
      provider: "NSERC",
      amount_min: min,
      amount_max: max,
      deadline,
      application_url: sourceUrl,
      source_url: sourceUrl,
      eligibility: {
        audience: "professor",
        council: "NSERC",
        program,
        career_stage: stage,
      },
      requirements: [],
      category: "research",
      tags: ["nserc", program].filter((t): t is string => Boolean(t)),
      scraped_from: baseUrl,
    });
  });

  if (items.length === 0) {
    $("h3").each((_, el) => {
      const heading = $(el);
      const name = cleanText(heading.text());
      if (!name) return;

      const link = heading.find("a[href], gcds-link[href]").first();
      const href = link.attr("href") ?? null;
      const sourceUrl = resolveUrl(href, baseUrl);
      if (!sourceUrl) return;

      const statusText = cleanText(heading.parent().nextAll().slice(0, 1).text());
      const description = cleanText(heading.parent().nextAll().slice(1, 2).text()) || null;
      const modifiedText = cleanText(heading.parent().nextAll().slice(2, 3).text());

      items.push({
        type: "research_grant",
        name,
        description,
        provider: "NSERC",
        amount_min: null,
        amount_max: null,
        deadline: null,
        application_url: sourceUrl,
        source_url: sourceUrl,
        eligibility: {
          audience: "professor",
          council: "NSERC",
          status: statusText || null,
          date_modified: parseDate(modifiedText),
        },
        requirements: [],
        category: "research",
        tags: ["nserc", statusText.toLowerCase()].filter(Boolean),
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

export const nserc: SourceModule = {
  id: "nserc",
  role: "professor",
  type: "research_grant",
  listingUrl: LISTING_URL,
  rateLimitMs: RATE_LIMIT_MS,
  scrape: async (ctx: ScrapeContext) => {
    const html = await ctx.fetchHtml(LISTING_URL);
    await ctx.delay(RATE_LIMIT_MS);
    return parseNserc(html, LISTING_URL);
  },
};
