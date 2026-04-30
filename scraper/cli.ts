import type { SourceModule } from "./types.js";

export interface CliOptions {
  bootstrapOnly: boolean;
  dryRun: boolean;
  sourceIds: string[];
  help: boolean;
  unknown: string[];
}

export function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    bootstrapOnly: false,
    dryRun: false,
    sourceIds: [],
    help: false,
    unknown: [],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--bootstrap-only") {
      opts.bootstrapOnly = true;
    } else if (arg === "--dry-run") {
      opts.dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      opts.help = true;
    } else if (arg === "--source") {
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        opts.unknown.push("--source requires an id");
      } else {
        opts.sourceIds.push(next);
        i += 1;
      }
    } else if (arg.startsWith("--source=")) {
      const value = arg.slice("--source=".length);
      if (value) opts.sourceIds.push(value);
    } else {
      opts.unknown.push(arg);
    }
  }

  return opts;
}

export function selectSources(
  all: SourceModule[],
  ids: string[],
): { selected: SourceModule[]; unknown: string[] } {
  if (ids.length === 0) {
    return { selected: all, unknown: [] };
  }
  const byId = new Map(all.map((s) => [s.id, s]));
  const selected: SourceModule[] = [];
  const unknown: string[] = [];
  for (const id of ids) {
    const found = byId.get(id);
    if (found) selected.push(found);
    else unknown.push(id);
  }
  return { selected, unknown };
}

export const HELP_TEXT = `Usage: tsx index.ts [options]

Options:
  --bootstrap-only        Print "scraper bootstrapped" and exit (no DB access).
  --dry-run               Run the scrape pipeline but do not write to Supabase.
                          Prints normalized rows + per-source counts to stdout.
  --source <id>           Limit the run to one source (repeatable).
                          Source ids: ised-benefits-finder, ised-supports,
                          educanada, indigenous-bursaries, nserc, sshrc.
  -h, --help              Show this message.

Without --bootstrap-only or --dry-run, the scraper requires
NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment
and writes funding rows + scrape_runs entries to the linked Supabase project.
`;
