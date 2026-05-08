import Link from "next/link";
import { Activity, Gauge, ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "../_lib/require-admin";

export const dynamic = "force-dynamic";

type RunRow = {
  id: string;
  started_at: string;
  finished_at: string | null;
  provider: string | null;
  model: string | null;
  rows_attempted: number;
  rows_enriched: number;
  rows_needs_review: number;
  rows_failed: number;
  tokens_in: number;
  tokens_out: number;
  cost_in_cents: number;
  cost_out_cents: number;
  status: string;
  aborted_reason: string | null;
};

function statusColor(status: string): "default" | "success" | "warning" | "info" {
  if (status === "success") return "success";
  if (status === "partial") return "warning";
  if (status === "aborted_budget") return "info";
  return "default";
}

function formatDate(value: string | null) {
  if (!value) return "Running";
  return new Date(value).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCost(cents: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
}

export default async function AdminRunsPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("ai_enrichment_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  const rows = (data ?? []) as RunRow[];
  const totals = rows.reduce(
    (acc, row) => ({
      attempts: acc.attempts + row.rows_attempted,
      enriched: acc.enriched + row.rows_enriched,
      failed: acc.failed + row.rows_failed,
      tokens: acc.tokens + row.tokens_in + row.tokens_out,
      cost: acc.cost + row.cost_in_cents + row.cost_out_cents,
    }),
    { attempts: 0, enriched: 0, failed: 0, tokens: 0, cost: 0 },
  );
  const tokenBudget = Number(process.env.AI_MONTHLY_TOKEN_BUDGET ?? 2_000_000);
  const costBudget = Number(process.env.AI_MONTHLY_COST_BUDGET_CENTS ?? 500);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-950">AI run observability</h1>
            <p className="mt-2 text-gray-600">
              Provider reliability, token use, budget posture, and queue output.
            </p>
          </div>
          <Link href="/admin/review" className="text-sm font-semibold text-gray-900 hover:underline">
            Review queue
          </Link>
        </div>

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <Card className="border border-gray-200">
            <div className="flex items-start gap-3">
              <Gauge className="mt-1 h-5 w-5 text-gray-700" />
              <div>
                <p className="text-sm text-gray-600">Rows enriched</p>
                <p className="mt-1 text-3xl font-bold text-gray-950">{totals.enriched}</p>
                <p className="mt-1 text-sm text-gray-500">{totals.attempts} attempted</p>
              </div>
            </div>
          </Card>
          <Card className="border border-gray-200">
            <div className="flex items-start gap-3">
              <Activity className="mt-1 h-5 w-5 text-gray-700" />
              <div>
                <p className="text-sm text-gray-600">Token budget</p>
                <p className="mt-1 text-3xl font-bold text-gray-950">{totals.tokens.toLocaleString("en-CA")}</p>
                <p className="mt-1 text-sm text-gray-500">of {tokenBudget.toLocaleString("en-CA")}</p>
              </div>
            </div>
          </Card>
          <Card className="border border-gray-200">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 text-gray-700" />
              <div>
                <p className="text-sm text-gray-600">Cost budget</p>
                <p className="mt-1 text-3xl font-bold text-gray-950">{formatCost(totals.cost)}</p>
                <p className="mt-1 text-sm text-gray-500">of {formatCost(costBudget)}</p>
              </div>
            </div>
          </Card>
        </section>

        <Card className="border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Provider</th>
                  <th className="py-3 pr-4">Rows</th>
                  <th className="py-3 pr-4">Tokens</th>
                  <th className="py-3 pr-4">Cost</th>
                  <th className="py-3 pr-4">Started</th>
                  <th className="py-3 pr-4">Finished</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3 pr-4">
                      <Badge variant={statusColor(row.status)}>{row.status}</Badge>
                      {row.aborted_reason && (
                        <p className="mt-1 text-xs text-gray-500">{row.aborted_reason}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {row.provider ?? "unknown"}
                      <p className="mt-1 text-xs text-gray-500">{row.model ?? "No model recorded"}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {row.rows_enriched}/{row.rows_attempted}
                      <p className="mt-1 text-xs text-gray-500">
                        {row.rows_needs_review} review · {row.rows_failed} failed
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {(row.tokens_in + row.tokens_out).toLocaleString("en-CA")}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {formatCost(row.cost_in_cents + row.cost_out_cents)}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{formatDate(row.started_at)}</td>
                    <td className="py-3 pr-4 text-gray-600">{formatDate(row.finished_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}
