// Source: SSHRC Funding Opportunities.
// robots.txt: https://sshrc-crsh.canada.ca/robots.txt — public crawling allowed.
// ToS: Government of Canada content under the Open Government Licence – Canada.
// Verification: see scraper/SOURCES.md §6.

import * as cheerio from "cheerio";
import type { ScrapeContext, ScrapedFunding, SourceModule } from "../../types.js";
import { cleanText, parseAmountRange, parseDate, resolveUrl } from "../../utils.js";

const LISTING_URL = "https://sshrc-crsh.canada.ca/en/funding/opportunities.aspx";
const RATE_LIMIT_MS = 1500;

export function parseSshrc(html: string, baseUrl: string): ScrapedFunding[] {
  const $ = cheerio.load(html);
  const items: ScrapedFunding[] = [];

  $(".opportunity").each((_, el) => {
    const node = $(el);
    const titleEl = node.find("h3 a").first();
    const name = cleanText(titleEl.text());
    if (!name) return;

    const href = titleEl.attr("href") ?? null;
    const sourceUrl = resolveUrl(href, baseUrl);
    if (!sourceUrl) return;

    const program = cleanText(node.find(".opportunity-program").text()) || null;
    const discipline = cleanText(node.find(".opportunity-discipline").text()) || null;
    const deadline = parseDate(node.find(".opportunity-deadline").text());
    const { min, max } = parseAmountRange(node.find(".opportunity-amount").text());

    items.push({
      type: "research_grant",
      name,
      description: cleanText(node.find(".opportunity-summary").text()) || null,
      provider: "SSHRC",
      amount_min: min,
      amount_max: max,
      deadline,
      application_url: sourceUrl,
      source_url: sourceUrl,
      eligibility: {
        audience: "professor",
        council: "SSHRC",
        program,
        discipline,
      },
      requirements: [],
      category: "research",
      tags: ["sshrc", discipline].filter((t): t is string => Boolean(t)),
      scraped_from: baseUrl,
    });
  });

  if (items.length === 0) {
    $("a[href]").each((_, el) => {
      const link = $(el);
      const name = cleanText(link.text());
      const href = link.attr("href") ?? null;
      if (!name || !href) return;
      if (!/research|grant|fund|award|chair|frontiers|biomedical|support/i.test(name)) return;

      const sourceUrl = resolveUrl(href, baseUrl);
      if (!sourceUrl) return;

      items.push({
        type: "research_grant",
        name,
        description: null,
        provider: "SSHRC",
        amount_min: null,
        amount_max: null,
        deadline: null,
        application_url: sourceUrl,
        source_url: sourceUrl,
        eligibility: {
          audience: "professor",
          council: "SSHRC",
        },
        requirements: [],
        category: "research",
        tags: ["sshrc"],
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

export const sshrc: SourceModule = {
  id: "sshrc",
  role: "professor",
  type: "research_grant",
  listingUrl: LISTING_URL,
  rateLimitMs: RATE_LIMIT_MS,
  scrape: async (ctx: ScrapeContext) => {
    const html = await ctx.fetchHtml(LISTING_URL);
    await ctx.delay(RATE_LIMIT_MS);
    return parseSshrc(html, LISTING_URL);
  },
};
