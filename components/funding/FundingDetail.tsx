import type { FundingItem } from "@contracts/funding";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function FundingDetail({
  item,
  showPersonalizationPrompt = false,
}: {
  item: FundingItem;
  showPersonalizationPrompt?: boolean;
}) {
  const applicationUrl = getSafeExternalUrl(item.application_url);

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

          {item.description ? (
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
