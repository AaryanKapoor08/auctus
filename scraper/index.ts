import {
  createSupabaseDedupeStore,
  createSupabaseExpireStore,
  getServiceRoleClient,
  recordScrapeRun,
} from "./supabase.js";
import { consoleLogger, runSources } from "./runner.js";
import { SOURCES } from "./sources/index.js";
import { normalize } from "./normalize.js";
import { delay } from "./utils.js";
import type { ScrapeContext } from "./types.js";
import { pathToFileURL } from "node:url";
import { HELP_TEXT, parseArgs, selectSources } from "./cli.js";
import https from "node:https";

async function fetchHtml(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "AuctusScraper/0.1 (+https://github.com/aaryan-kapoor/auctus)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }
    return res.text();
  } catch (err) {
    if (isCertificateChainError(err)) {
      return fetchHtmlWithRelaxedCertificate(url);
    }
    throw err;
  }
}

function isCertificateChainError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const cause = err.cause as { code?: string } | undefined;
  return cause?.code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE";
}

function fetchHtmlWithRelaxedCertificate(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": "AuctusScraper/0.1 (+https://github.com/aaryan-kapoor/auctus)",
          Accept: "text/html,application/xhtml+xml",
        },
        rejectUnauthorized: false,
      },
      (res) => {
        const status = res.statusCode ?? 0;
        if (status >= 300 && status < 400 && res.headers.location) {
          const nextUrl = new URL(res.headers.location, url).toString();
          res.resume();
          void fetchHtmlWithRelaxedCertificate(nextUrl).then(resolve, reject);
          return;
        }
        if (status < 200 || status >= 300) {
          res.resume();
          reject(new Error(`HTTP ${status} for ${url}`));
          return;
        }
        res.setEncoding("utf8");
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => resolve(body));
      },
    );
    req.on("error", reject);
    req.end();
  });
}

async function main(): Promise<void> {
  const logger = consoleLogger();
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    process.stdout.write(HELP_TEXT);
    return;
  }

  if (opts.unknown.length > 0) {
    logger.error("scraper unknown args", { args: opts.unknown });
    process.stdout.write(HELP_TEXT);
    process.exit(2);
  }

  if (opts.bootstrapOnly) {
    logger.info("scraper bootstrapped");
    return;
  }

  const { selected, unknown } = selectSources(SOURCES, opts.sourceIds);
  if (unknown.length > 0) {
    logger.error("scraper unknown source id", { unknown });
    process.exit(2);
  }
  if (selected.length === 0) {
    logger.error("scraper no sources selected");
    process.exit(2);
  }

  const context: ScrapeContext = { fetchHtml, delay };

  if (opts.dryRun) {
    logger.info(`scraper dry-run for ${selected.length} source(s)`);
    let totalFetched = 0;
    let totalErrors = 0;
    for (const source of selected) {
      try {
        const rows = await source.scrape(context);
        const normalized = rows.map((r) => normalize(r, new Date()));
        totalFetched += rows.length;
        logger.info(`dry-run ${source.id} fetched ${rows.length}`);
        for (const row of normalized) {
          process.stdout.write(`${JSON.stringify(row)}\n`);
        }
      } catch (err) {
        totalErrors += 1;
        const message = err instanceof Error ? err.message : String(err);
        logger.error(`dry-run ${source.id} failed`, { error: message });
      }
    }
    logger.info("scraper dry-run complete", {
      sources: selected.length,
      fetched: totalFetched,
      errors: totalErrors,
    });
    return;
  }

  const client = getServiceRoleClient();
  const dedupeStore = createSupabaseDedupeStore(client);
  const expireStore = createSupabaseExpireStore(client);

  logger.info(`scraper running ${selected.length} source(s)`);
  const results = await runSources({
    sources: selected,
    context,
    dedupeStore,
    expireStore,
    logger,
    onResult: (result) => recordScrapeRun(client, result),
  });

  for (const r of results) {
    logger.info(`scraper summary ${r.sourceId}`, {
      status: r.status,
      fetched: r.fetched,
      inserted: r.inserted,
      updated: r.updated,
      skipped: r.skipped,
      errors: r.errors,
    });
  }
}

const isCli = (() => {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return import.meta.url === pathToFileURL(entry).href;
  } catch {
    return false;
  }
})();

if (isCli) {
  main().catch((err) => {
    console.error("scraper fatal", err);
    process.exit(1);
  });
}

export { main };
