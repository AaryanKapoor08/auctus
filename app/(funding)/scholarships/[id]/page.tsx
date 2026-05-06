import { notFound } from "next/navigation";
import FundingDetail from "@/components/funding/FundingDetail";
import { getEnrichmentForFunding } from "@/lib/funding/enrichment";
import { GetFundingById } from "@/lib/funding/queries";
import { getSession } from "@/lib/session/get-session";

export default async function ScholarshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, session, enrichment] = await Promise.all([
    GetFundingById(id),
    getSession(),
    getEnrichmentForFunding(id),
  ]);

  if (!item || item.type !== "scholarship") {
    notFound();
  }

  return (
    <FundingDetail
      item={item}
      enrichment={enrichment}
      showPersonalizationPrompt={!session}
    />
  );
}
