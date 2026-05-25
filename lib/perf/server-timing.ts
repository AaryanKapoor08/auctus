import "server-only";

type PerfMetadata = Record<string, string | number | boolean | null | undefined>;

function shouldLogPerf() {
  return process.env.PERF_LOG === "1";
}

function formatMetadata(metadata?: PerfMetadata) {
  if (!metadata) return "";

  const entries = Object.entries(metadata)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`);

  return entries.length > 0 ? ` ${entries.join(" ")}` : "";
}

export async function timeServer<T>(
  label: string,
  callback: () => Promise<T>,
  metadata?: PerfMetadata,
): Promise<T> {
  if (!shouldLogPerf()) {
    return callback();
  }

  const start = process.hrtime.bigint();

  try {
    return await callback();
  } finally {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    console.info(
      `[perf] ${label} ${durationMs.toFixed(1)}ms${formatMetadata(metadata)}`,
    );
  }
}
