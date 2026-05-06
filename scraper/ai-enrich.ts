type Provider = "mock" | "gemini" | "openrouter";

interface CliOptions {
  dryRun: boolean;
  provider: Provider;
  taskType: string | null;
  maxRows: number;
  maxTokens: number;
  help: boolean;
  unknown: string[];
}

const HELP = `Usage: tsx ai-enrich.ts [options]

Options:
  --dry-run                 Run without writing to Supabase.
  --provider <id>           mock, gemini, or openrouter. Default: mock.
  --task-type <type>        Limit to one enrichment task type.
  --max-rows <n>            Maximum rows to process. Default: 25.
  --max-tokens <n>          Per-run token cap. Default: 50000.
  -h, --help                Show this message.
`;

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    dryRun: false,
    provider: "mock",
    taskType: null,
    maxRows: 25,
    maxTokens: 50_000,
    help: false,
    unknown: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--provider") {
      const value = argv[i + 1];
      if (value === "mock" || value === "gemini" || value === "openrouter") {
        options.provider = value;
        i += 1;
      } else {
        options.unknown.push("--provider requires mock, gemini, or openrouter");
      }
    } else if (arg === "--task-type") {
      options.taskType = argv[i + 1] ?? null;
      i += 1;
    } else if (arg === "--max-rows") {
      options.maxRows = Number(argv[i + 1] ?? options.maxRows);
      i += 1;
    } else if (arg === "--max-tokens") {
      options.maxTokens = Number(argv[i + 1] ?? options.maxTokens);
      i += 1;
    } else {
      options.unknown.push(arg);
    }
  }

  return options;
}

function main() {
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
  if (!options.dryRun && options.provider === "mock") {
    console.error("Mock provider is allowed only with --dry-run.");
    process.exitCode = 1;
    return;
  }

  const taskTypes = options.taskType
    ? [options.taskType]
    : ["summary", "tags", "checklist", "match_reasons", "data_quality"];
  const rows = Array.from({ length: Math.max(0, options.maxRows) }, (_, index) => ({
    funding_id: `dry-run-funding-${index + 1}`,
    provider: options.provider,
    task_types: taskTypes,
    output: {
      summary: `Mock enrichment ${index + 1}`,
      confidence: 0.8,
    },
  }));

  console.log(
    JSON.stringify(
      {
        dry_run: options.dryRun,
        provider: options.provider,
        max_rows: options.maxRows,
        max_tokens: options.maxTokens,
        rows_attempted: rows.length,
        rows,
      },
      null,
      2,
    ),
  );
}

main();
