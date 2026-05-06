import type { FundingItem } from "@contracts/funding";
import type { FundingEnrichmentBundle } from "@/lib/funding/enrichment";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function FundingDetail({
  item,
  enrichment,
  showPersonalizationPrompt = false,
}: {
  item: FundingItem;
  enrichment?: FundingEnrichmentBundle | null;
  showPersonalizationPrompt?: boolean;
}) {
  const applicationUrl = getSafeExternalUrl(item.application_url);
  const summary = enrichment?.summary?.summary;
  const checklist = enrichment?.checklist?.application_checklist ?? [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Card className="border border-gray-200">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge color="gray">{item.category ?? "General"}</Badge>
            <Badge variant="success">{item.deadline ?? "Rolling deadline"}</Badge>
          </div>

          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              {item.name}
            </h1>
            <p className="mt-2 text-gray-600">{item.provider}</p>
          </div>

          {summary ? (
            <section>
              <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
              <p className="mt-2 text-base leading-7 text-gray-700">{summary}</p>
            </section>
          ) : item.description ? (
            <p className="text-base leading-7 text-gray-700">
              {item.description}
            </p>
          ) : null}

          <section>
            <h2 className="text-lg font-semibold text-gray-900">
              Requirements
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
              {item.requirements.map((requirement) => (
                <li key={requirement}>{requirement}</li>
              ))}
            </ul>
          </section>

          {checklist.length > 0 && (
            <section className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Application prep checklist
              </h2>
              <p className="mt-1 text-sm text-gray-700">
                Preparation guidance, not legal or financial advice.
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
                {checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {applicationUrl && (
            <a href={applicationUrl} target="_blank" rel="noreferrer">
              <Button variant="primary">Apply</Button>
            </a>
          )}

          {showPersonalizationPrompt && (
            <div className="rounded-lg border border-primary-100 bg-primary-50 p-4">
              <p className="text-sm font-semibold text-gray-900">
                Want Auctus to sort opportunities around you?
              </p>
              <p className="mt-1 text-sm text-gray-700">
                Sign in to customize filters, match funding to your profile, and keep a cleaner shortlist.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href="/sign-in">
                  <Button variant="outline">Sign in</Button>
                </a>
                <a href="/sign-up">
                  <Button variant="primary">Customize matches</Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function getSafeExternalUrl(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
