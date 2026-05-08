import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "../_lib/require-admin";

export const dynamic = "force-dynamic";

type ReviewRow = {
  id: string;
  funding_id: string;
  task_type: string;
  confidence: number;
  provider: string;
  model: string;
  enriched_at: string;
  funding: {
    name: string;
    type: string;
    status: string;
    provider: string;
  } | null;
};

function fundingHref(row: ReviewRow) {
  if (row.funding?.type === "business_grant") return `/grants/${row.funding_id}`;
  if (row.funding?.type === "scholarship") return `/scholarships/${row.funding_id}`;
  return `/research-funding/${row.funding_id}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminReviewPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("funding_ai_enrichment")
    .select("id,funding_id,task_type,confidence,provider,model,enriched_at,funding(name,type,status,provider)")
    .eq("needs_review", true)
    .order("enriched_at", { ascending: false })
    .limit(100);

  if (error) throw error;
  const rows = (data ?? []) as unknown as ReviewRow[];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-950">AI review queue</h1>
            <p className="mt-2 text-gray-600">
              Enrichment rows held out of the public UX until review clears them.
            </p>
          </div>
          <Link href="/admin/runs" className="text-sm font-semibold text-gray-900 hover:underline">
            View runs
          </Link>
        </div>

        <Card className="border border-gray-200">
          {rows.length === 0 ? (
            <div className="flex items-start gap-3 rounded-lg border border-green-100 bg-green-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-700" />
              <div>
                <p className="font-semibold text-green-950">No rows need review.</p>
                <p className="mt-1 text-sm text-green-800">
                  Current public enrichment remains hidden unless it is validated and review-cleared.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="py-3 pr-4">Opportunity</th>
                    <th className="py-3 pr-4">Task</th>
                    <th className="py-3 pr-4">Confidence</th>
                    <th className="py-3 pr-4">Provider</th>
                    <th className="py-3 pr-4">Enriched</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="py-3 pr-4">
                        <Link href={fundingHref(row)} className="font-semibold text-gray-950 hover:underline">
                          {row.funding?.name ?? row.funding_id}
                        </Link>
                        <p className="mt-1 text-xs text-gray-500">{row.funding?.provider ?? "Unknown provider"}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge color="gray">{row.task_type}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          {Number(row.confidence).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-600">
                        {row.provider} / {row.model}
                      </td>
                      <td className="py-3 pr-4 text-gray-600">{formatDate(row.enriched_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
