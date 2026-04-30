// Source: EduCanada Scholarships.
// robots.txt: https://www.educanada.ca/robots.txt — User-agent: * with no Disallow on the scholarships path.
// ToS: Government of Canada content under the Open Government Licence – Canada.
// Verification: see scraper/SOURCES.md §3.

import * as cheerio from "cheerio";
import type { ScrapeContext, ScrapedFunding, SourceModule } from "../../types.js";
import { cleanText, parseAmountRange, parseDate, resolveUrl } from "../../utils.js";

const LISTING_URL =
  "https://www.educanada.ca/scholarships-bourses/non_can/index.aspx?lang=eng";
const RATE_LIMIT_MS = 1500;

export function parseEduCanada(html: string, baseUrl: string): ScrapedFunding[] {
  const $ = cheerio.load(html);
  const items: ScrapedFunding[] = [];

  $("tr.scholarship-row").each((_, el) => {
    const row = $(el);
    const titleEl = row.find("td.name a").first();
    const name = cleanText(titleEl.text());
    if (!name) return;

    const href = titleEl.attr("href") ?? null;
    const sourceUrl = resolveUrl(href, baseUrl);
    if (!sourceUrl) return;

    const provider = cleanText(row.find("td.provider").text()) || "Government of Canada";
    const country = cleanText(row.find("td.country").text()) || null;
    const level = cleanText(row.find("td.level").text()) || null;
    const deadline = parseDate(row.find("td.deadline").text());
    const { min, max } = parseAmountRange(row.find("td.amount").text());

    items.push({
      type: "scholarship",
      name,
      description: cleanText(row.find("td.summary").text()) || null,
      provider,
      amount_min: min,
      amount_max: max,
      deadline,
      application_url: sourceUrl,
      source_url: sourceUrl,
      eligibility: {
        audience: "student",
        country,
        education_level: level,
      },
      requirements: [],
      category: "international",
      tags: [country, level].filter((t): t is string => Boolean(t)),
      scraped_from: baseUrl,
    });
  });

  if (items.length === 0) {
    $("main h3, .mwsbodytext h3").each((_, el) => {
      const heading = $(el);
      const titleText = cleanText(heading.text());
      if (!titleText || !/scholarship|exchange|award|development/i.test(titleText)) return;

      const link = heading.find("a[href]").first().length
        ? heading.find("a[href]").first()
        : heading.nextAll("a[href]").first();
      const href = link.attr("href") ?? null;
      const sourceUrl = resolveUrl(href, baseUrl);
      if (!sourceUrl) return;

      const sectionText = cleanText(heading.parent().text());
      const { min, max } = parseAmountRange(sectionText);
      items.push({
        type: "scholarship",
        name: titleText,
        description: sectionText && sectionText !== titleText ? sectionText : null,
        provider: "Global Affairs Canada",
        amount_min: min,
        amount_max: max,
        deadline: parseDate(sectionText),
        application_url: sourceUrl,
        source_url: sourceUrl,
        eligibility: {
          audience: "student",
          education_level: null,
        },
        requirements: [],
        category: "international",
        tags: ["international"],
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

export const educanada: SourceModule = {
  id: "educanada",
  role: "student",
  type: "scholarship",
  listingUrl: LISTING_URL,
  rateLimitMs: RATE_LIMIT_MS,
  scrape: async (ctx: ScrapeContext) => {
    const html = await ctx.fetchHtml(LISTING_URL);
    await ctx.delay(RATE_LIMIT_MS);
    return parseEduCanada(html, LISTING_URL);
  },
};
