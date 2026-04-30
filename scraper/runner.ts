import { dedupeAndUpsert, type DedupeStore } from "./deduplicate.js";
import { expirePastDeadlines, type ExpireStore } from "./expire.js";
import { normalize } from "./normalize.js";
import type { ScrapeContext, SourceModule, SourceRunResult } from "./types.js";

export interface RunnerLogger {
  info(msg: string, meta?: Record<string, unknown>): void;
  error(msg: string, meta?: Record<string, unknown>): void;
}

export interface RunSourcesOptions {
  sources: SourceModule[];
  context: ScrapeContext;
  dedupeStore: DedupeStore;
  expireStore?: ExpireStore;
  logger?: RunnerLogger;
  onResult?: (result: SourceRunResult) => Promise<void> | void;
  now?: () => Date;
}

export async function runSources(options: RunSourcesOptions): Promise<SourceRunResult[]> {
  const {
    sources,
    context,
    dedupeStore,
    expireStore,
    logger = consoleLogger(),
    onResult,
    now = () => new Date(),
  } = options;

  const results: SourceRunResult[] = [];

  for (const source of sources) {
    const startedAt = now().toISOString();
    let fetched = 0;
    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const errorMessages: string[] = [];
    let status: "success" | "failed" = "success";

    try {
      const scraped = await source.scrape(context);
      fetched = scraped.length;
      const normalized = scraped.map((row) => normalize(row, now()));
      const counts = await dedupeAndUpsert(normalized, dedupeStore);
      inserted = counts.inserted;
      updated = counts.updated;
      skipped = counts.skipped;
      logger.info(`scraper ${source.id} ok`, { fetched, inserted, updated, skipped });
    } catch (err) {
      status = "failed";
      const message = err instanceof Error ? err.message : String(err);
      errorMessages.push(message);
      logger.error(`scraper ${source.id} failed`, { error: message });
    }

    const result: SourceRunResult = {
      sourceId: source.id,
      status,
      fetched,
      inserted,
      updated,
      skipped,
      errors: errorMessages.length,
      errorMessages,
      startedAt,
      finishedAt: now().toISOString(),
    };
    results.push(result);
    if (onResult) {
      try {
        await onResult(result);
      } catch (err) {
        logger.error(`scraper ${source.id} record-run failed`, {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }

  if (expireStore) {
    try {
      const expired = await expirePastDeadlines(expireStore, now());
      logger.info("scraper expire ok", { expired });
    } catch (err) {
      logger.error("scraper expire failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}

export function consoleLogger(): RunnerLogger {
  return {
    info(msg, meta) {
      if (meta) console.log(msg, meta);
      else console.log(msg);
    },
    error(msg, meta) {
      if (meta) console.error(msg, meta);
      else console.error(msg);
    },
  };
}
