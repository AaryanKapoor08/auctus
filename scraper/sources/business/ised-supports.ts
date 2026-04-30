// Source: ISED Supports for Business.
// robots.txt: https://ised-isde.canada.ca/robots.txt — public crawling allowed.
// ToS: Government of Canada content under the Open Government Licence – Canada.
// Verification: see scraper/SOURCES.md §2.

import * as cheerio from "cheerio";
import type { ScrapeContext, ScrapedFunding, SourceModule } from "../../types.js";
import { cleanText, parseAmountRange, parseDate, resolveUrl } from "../../utils.js";

const LISTING_URL = "https://ised-isde.canada.ca/site/ised/en/supports-for-business";
const RATE_LIMIT_MS = 1500;

export function parseIsedSupports(html: string, baseUrl: string): ScrapedFunding[] {
  const $ = cheerio.load(html);
  const items: ScrapedFunding[] = [];

  $("a.gc-card").each((_, el) => {
    const node = $(el);
    const name = cleanText(node.find(".card-title").text());
    if (!name) return;

    const href = node.attr("href") ?? null;
    const sourceUrl = resolveUrl(href, baseUrl);
    if (!sourceUrl) return;

    const provider = cleanText(node.find(".card-provider").text()) || "Innovation, Science and Economic Development Canada";
    const description = cleanText(node.find(".card-summary").text()) || null;
    const deadline = parseDate(node.find(".card-deadline").text());
    const { min, max } = parseAmountRange(node.attr("data-amount") ?? node.find(".card-amount").text());

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
      tags: [],
      scraped_from: baseUrl,
    });
  });

  if (items.length === 0) {
    $("main a[href], #wb-cont ~ * a[href]").each((_, el) => {
      const link = $(el);
      const name = cleanText(link.text());
      const href = link.attr("href") ?? null;
      if (!name || !href || href.startsWith("#") || href.startsWith("mailto:")) return;
      if (!/financing|funding|loan|entrepreneurship|business|support/i.test(name)) return;

      const sourceUrl = resolveUrl(href, baseUrl);
      if (!sourceUrl) return;

      const parent = link.closest("li, article, section, div");
      const description = cleanText(parent.find("p").first().text()) || null;
      const { min, max } = parseAmountRange(parent.text());

      items.push({
        type: "business_grant",
        name,
        description,
        provider: "Innovation, Science and Economic Development Canada",
        amount_min: min,
        amount_max: max,
        deadline: parseDate(parent.text()),
        application_url: sourceUrl,
        source_url: sourceUrl,
        eligibility: { audience: "business" },
        requirements: [],
        category: "business",
        tags: ["business-support"],
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

export const isedSupports: SourceModule = {
  id: "ised-supports",
  role: "business",
  type: "business_grant",
  listingUrl: LISTING_URL,
  rateLimitMs: RATE_LIMIT_MS,
  scrape: async (ctx: ScrapeContext) => {
    const html = await ctx.fetchHtml(LISTING_URL);
    await ctx.delay(RATE_LIMIT_MS);
    return parseIsedSupports(html, LISTING_URL);
  },
};
