import { notFound } from "next/navigation";
import FundingDetail from "@/components/funding/FundingDetail";
import { GetFundingById } from "@/lib/funding/queries";
import { getSession } from "@/lib/session/get-session";

export default async function ScholarshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, session] = await Promise.all([GetFundingById(id), getSession()]);

  if (!item || item.type !== "scholarship") {
    notFound();
  }

  return <FundingDetail item={item} showPersonalizationPrompt={!session} />;
}
