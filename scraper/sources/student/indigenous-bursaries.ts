// Source: Indigenous Bursaries Search Tool (Indigenous Services Canada).
// robots.txt: https://sac-isc.gc.ca/robots.txt — public crawling allowed.
// ToS: Government of Canada content under the Open Government Licence – Canada.
// Verification: see scraper/SOURCES.md §4.

import * as cheerio from "cheerio";
import type { ScrapeContext, ScrapedFunding, SourceModule } from "../../types.js";
import { cleanText, parseAmountRange, parseDate, resolveUrl } from "../../utils.js";

const LISTING_URL = "https://sac-isc.gc.ca/eng/1351185180120/1351685455328";
const RATE_LIMIT_MS = 1500;

export function parseIndigenousBursaries(html: string, baseUrl: string): ScrapedFunding[] {
  const $ = cheerio.load(html);
  const items: ScrapedFunding[] = [];

  $("li.bursary").each((_, el) => {
    const node = $(el);
    const titleEl = node.find(".bursary-title a").first();
    const name = cleanText(titleEl.text());
    if (!name) return;

    const href = titleEl.attr("href") ?? null;
    const sourceUrl = resolveUrl(href, baseUrl);
    if (!sourceUrl) return;

    const provider = cleanText(node.find(".bursary-org").text()) || "Indigenous Services Canada";
    const eligibility = cleanText(node.find(".bursary-eligibility").text()) || null;
    const deadline = parseDate(node.find(".bursary-deadline").text());
    const { min, max } = parseAmountRange(node.find(".bursary-amount").text());

    items.push({
      type: "scholarship",
      name,
      description: cleanText(node.find(".bursary-summary").text()) || null,
      provider,
      amount_min: min,
      amount_max: max,
      deadline,
      application_url: sourceUrl,
      source_url: sourceUrl,
      eligibility: {
        audience: "student",
        indigenous: true,
        notes: eligibility,
      },
      requirements: eligibility ? [eligibility] : [],
      category: "indigenous",
      tags: ["indigenous"],
      scraped_from: baseUrl,
    });
  });

  if (items.length === 0) {
    $("a[href]").each((_, el) => {
      const link = $(el);
      const name = cleanText(link.text());
      const href = link.attr("href") ?? null;
      if (!name || !href) return;
      if (!/sac-isc\.gc\.ca\/eng\/\d+\/\d+|^\/eng\/\d+\/\d+/.test(href)) return;
      if (!/award|bursary|scholarship|education|student|indigenous|aboriginal|metis|first nations|inuit/i.test(name)) {
        return;
      }

      const sourceUrl = resolveUrl(href, baseUrl);
      if (!sourceUrl) return;

      items.push({
        type: "scholarship",
        name,
        description: null,
        provider: "Indigenous Services Canada",
        amount_min: null,
        amount_max: null,
        deadline: null,
        application_url: sourceUrl,
        source_url: sourceUrl,
        eligibility: {
          audience: "student",
          indigenous: true,
        },
        requirements: [],
        category: "indigenous",
        tags: ["indigenous"],
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

export const indigenousBursaries: SourceModule = {
  id: "indigenous-bursaries",
  role: "student",
  type: "scholarship",
  listingUrl: LISTING_URL,
  rateLimitMs: RATE_LIMIT_MS,
  scrape: async (ctx: ScrapeContext) => {
    const html = await ctx.fetchHtml(LISTING_URL);
    await ctx.delay(RATE_LIMIT_MS);
    return parseIndigenousBursaries(html, LISTING_URL);
  },
};
