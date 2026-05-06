import { COMBINED_PROMPT_VERSION, COMBINED_TASK_TYPES, SCHEMA_VERSIONS } from "../lib/ai/enrichment-schema";
import { runEnrichmentQueue, type AiEnrichmentRunBudget } from "../lib/ai/enrichment-queue";
import { createGeminiProvider } from "../lib/ai/gemini";
import { createOpenRouterProvider } from "../lib/ai/openrouter";
import type { AiProvider, AiProviderId } from "../lib/ai/provider";
import { createFundingServiceClient } from "../lib/funding/supabase";

type Provider = "gemini" | "openrouter";

interface CliOptions {
  provider: Provider;
  maxRows: number;
  help: boolean;
  unknown: string[];
}

const HELP = `Usage: tsx jobs/ai-enrich.ts [options]

Options:
  --provider <id>           gemini or openrouter. Default: gemini.
  --max-rows <n>            Maximum rows to process. Default: 25.
  -h, --help                Show this message.
`;

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    provider: "gemini",
    maxRows: 25,
    help: false,
    unknown: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--provider") {
      const value = argv[i + 1];
      if (value === "gemini" || value === "openrouter") {
        options.provider = value;
        i += 1;
      } else {
        options.unknown.push("--provider requires gemini or openrouter");
      }
    } else if (arg === "--max-rows") {
      options.maxRows = Number(argv[i + 1] ?? options.maxRows);
      i += 1;
    } else {
      options.unknown.push(arg);
    }
  }

  return options;
}

function readIntEnv(key: string, fallback: number): number {
  const value = Number(process.env[key] ?? fallback);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

async function getBudget(): Promise<AiEnrichmentRunBudget> {
  const supabase = createFundingServiceClient();
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("ai_enrichment_runs")
    .select("tokens_in,tokens_out,cost_in_cents,cost_out_cents")
    .gte("created_at", monthStart.toISOString());

  if (error) throw error;

  const totals = (data ?? []).reduce(
    (acc, row) => ({
      tokens: acc.tokens + Number(row.tokens_in ?? 0) + Number(row.tokens_out ?? 0),
      cost: acc.cost + Number(row.cost_in_cents ?? 0) + Number(row.cost_out_cents ?? 0),
    }),
    { tokens: 0, cost: 0 },
  );

  return {
    monthlyTokenBudget: readIntEnv("AI_MONTHLY_TOKEN_BUDGET", 2_000_000),
    monthlyCostBudgetCents: readIntEnv("AI_MONTHLY_COST_BUDGET_CENTS", 500),
    monthToDateTokens: totals.tokens,
    monthToDateCostCents: totals.cost,
  };
}

function createProviders(provider: Provider): Partial<Record<AiProviderId, AiProvider>> {
  if (provider === "gemini") {
    const apiKey = process.env.AI_GEMINI_API_KEY;
    const model = process.env.AI_GEMINI_MODEL;
    if (!apiKey) throw new Error("Missing AI_GEMINI_API_KEY.");
    if (!model) throw new Error("Missing AI_GEMINI_MODEL.");
    return { gemini: createGeminiProvider({ apiKey, model }) };
  }

  const apiKey = process.env.AI_OPENROUTER_API_KEY;
  const model = process.env.AI_OPENROUTER_MODEL;
  if (!apiKey) throw new Error("Missing AI_OPENROUTER_API_KEY.");
  if (!model) throw new Error("Missing AI_OPENROUTER_MODEL.");
  return { openrouter: createOpenRouterProvider({ apiKey, model }) };
}

async function enqueueMissingJobs(maxRows: number, provider: Provider) {
  const supabase = createFundingServiceClient();
  const limit = Math.max(maxRows * 3, maxRows);
  const { data: fundingRows, error: fundingError } = await supabase
    .from("funding")
    .select("id,content_hash")
    .eq("source", "scraped")
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (fundingError) throw fundingError;
  const rows = (fundingRows ?? []).filter((row) => row.content_hash);
  if (rows.length === 0) return 0;

  const fundingIds = rows.map((row) => row.id);
  const { data: activeJobs, error: activeJobsError } = await supabase
    .from("ai_enrichment_jobs")
    .select("funding_id,content_hash")
    .in("funding_id", fundingIds)
    .in("status", ["pending", "processing", "failed_retryable"]);

  if (activeJobsError) throw activeJobsError;

  const activeJobKeys = new Set(
    (activeJobs ?? []).map((job) => `${job.funding_id}:${job.content_hash}`),
  );

  const { data: enrichmentRows, error: enrichmentError } = await supabase
    .from("funding_ai_enrichment")
    .select("funding_id,task_type,content_hash,prompt_version,schema_version,needs_review")
    .in("funding_id", fundingIds)
    .eq("prompt_version", COMBINED_PROMPT_VERSION)
    .eq("needs_review", false);

  if (enrichmentError) throw enrichmentError;

  const completeTasksByFunding = new Map<string, Set<string>>();
  for (const row of enrichmentRows ?? []) {
    const expectedSchemaVersion = SCHEMA_VERSIONS[row.task_type as keyof typeof SCHEMA_VERSIONS];
    if (row.schema_version !== expectedSchemaVersion) continue;
    const funding = rows.find((candidate) => candidate.id === row.funding_id);
    if (!funding || funding.content_hash !== row.content_hash) continue;
    const tasks = completeTasksByFunding.get(row.funding_id) ?? new Set<string>();
    tasks.add(row.task_type);
    completeTasksByFunding.set(row.funding_id, tasks);
  }

  const providerPreference = provider === "gemini" ? "gemini-only" : "openrouter-only";
  const jobs = rows
    .filter((row) => !activeJobKeys.has(`${row.id}:${row.content_hash}`))
    .filter((row) => {
      const completed = completeTasksByFunding.get(row.id);
      return !completed || COMBINED_TASK_TYPES.some((task) => !completed.has(task));
    })
    .slice(0, maxRows)
    .map((row) => ({
      funding_id: row.id,
      content_hash: row.content_hash,
      task_types: [...COMBINED_TASK_TYPES],
      status: "pending",
      provider_preference: providerPreference,
    }));

  if (jobs.length === 0) return 0;
  const { error: insertError } = await supabase.from("ai_enrichment_jobs").insert(jobs);
  if (insertError) throw insertError;
  return jobs.length;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(HELP);
    return;
  }
  if (options.unknown.length > 0) {
    console.error(`Unknown arguments: ${options.unknown.join(", ")}`);
    process.exitCode = 1;
    return;
  }
  if (!Number.isFinite(options.maxRows) || options.maxRows < 1) {
    console.error("--max-rows must be a positive number.");
    process.exitCode = 1;
    return;
  }
  if (process.env.AI_ENRICHMENT_ENABLED !== "true") {
    console.error("AI_ENRICHMENT_ENABLED must be true for a real enrichment run.");
    process.exitCode = 1;
    return;
  }

  const enqueued = await enqueueMissingJobs(options.maxRows, options.provider);
  const result = await runEnrichmentQueue({
    providers: createProviders(options.provider),
    budget: await getBudget(),
    maxRows: options.maxRows,
  });

  console.log(
    JSON.stringify(
      {
        provider: options.provider,
        enqueued_jobs: enqueued,
        status: result.status,
        rows_attempted: result.rowsAttempted,
        rows_enriched: result.rowsEnriched,
        rows_needs_review: result.rowsNeedsReview,
        rows_failed: result.rowsFailed,
        tokens_in: result.tokensIn,
        tokens_out: result.tokensOut,
        error_summary: result.errorSummary,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
