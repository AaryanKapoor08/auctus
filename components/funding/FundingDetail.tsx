import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { FundingItem } from "@contracts/funding";
import Button from "@/components/ui/Button";
import type { FundingEnrichmentBundle } from "@/lib/funding/enrichment";
import { formatFundingAmount, formatFundingDeadline } from "./FundingCard";

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
  const summary = enrichment?.summary;
  const checklist = getUsefulChecklist(item, enrichment);
  const route = getFundingRoute(item);
  const categoryChips = Array.from(
    new Set([item.category, ...item.tags].filter(Boolean) as string[]),
  );

  return (
    <div className="auc-page min-h-screen">
      <div className="auc-reference-section py-12">
        <Link href={route.href} className="mono inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.06em] text-[var(--auc-muted)] hover:text-[var(--auc-ink)]">
          <ArrowLeft className="h-4 w-4" />
          Back to {route.label}
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className={`mono rounded px-3 py-1.5 text-xs font-black uppercase tracking-[0.06em] ${route.badgeClass}`}>
            {route.kind}
          </span>
          <span className="mono rounded-full border-2 border-[var(--auc-ink)] bg-[var(--auc-paper)] px-3 py-1.5 text-xs font-black text-[var(--auc-coral)]">
            Deadline · {formatFundingDeadline(item.deadline)}
          </span>
        </div>

        <h1 className="display mt-5 max-w-5xl text-5xl leading-[0.95] tracking-[-0.035em] md:text-7xl">
          {item.name}
        </h1>
        <p className="mt-4 text-lg font-medium text-[var(--auc-ink-2)]">{item.provider}</p>

        <div className="mt-9 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_360px] lg:items-start">
          <div>
            {summary?.summary ? (
              <section className="rounded-[14px] border-2 border-[var(--auc-ink)] bg-[var(--auc-lime)] p-5 shadow-[4px_4px_0_var(--auc-ink)]">
                <div className="mono text-[0.68rem] font-black uppercase tracking-[0.08em] text-[var(--auc-ink)]">
                  Auctus AI · Overview
                </div>
                <h2 className="sr-only">Overview</h2>
                <p className="mt-3 text-base leading-7 text-[var(--auc-ink)]">
                  {summary.summary}
                </p>
              </section>
            ) : item.description ? (
              <section className="auc-card-flat bg-[var(--auc-paper)] p-6 text-base leading-8 text-[var(--auc-ink-2)]">
                {item.description}
              </section>
            ) : null}

            {summary?.best_fit_applicant ? (
              <DetailSection title="Good fit for">
                <p className="text-base leading-7 text-[var(--auc-ink-2)]">
                  {summary.best_fit_applicant}
                </p>
              </DetailSection>
            ) : null}

            {summary?.eligibility_bullets.length ? (
              <DetailSection title="Eligibility signals">
                <ul className="grid gap-3">
                  {summary.eligibility_bullets.map((bullet) => (
                    <li key={bullet} className="flex gap-3 text-sm leading-6 text-[var(--auc-ink-2)]">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-[var(--auc-ink)] bg-white text-xs font-black text-[var(--auc-ink)]">
                        ✓
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </DetailSection>
            ) : null}

            {item.requirements.length > 0 ? (
              <DetailSection title="Requirements">
                <ul className="grid gap-3">
                  {item.requirements.map((requirement) => (
                    <li key={requirement} className="flex gap-3 text-sm leading-6 text-[var(--auc-ink-2)]">
                      <span className="mono mt-1 text-xs font-bold text-[var(--auc-muted)]">-</span>
                      {requirement}
                    </li>
                  ))}
                </ul>
              </DetailSection>
            ) : null}

            {checklist.length > 0 ? (
              <DetailSection title="Application prep checklist" badge="AI">
                <p className="mb-3 text-sm text-[var(--auc-muted)]">
                  Preparation guidance, not legal or financial advice.
                </p>
                <div className="flex flex-wrap gap-2">
                  {checklist.map((step) => (
                    <span
                      key={step}
                      className="mono rounded-full border-2 border-[var(--auc-ink)] bg-[var(--auc-lime)] px-3 py-2 text-xs font-black text-[var(--auc-ink)]"
                    >
                      ✓ {step}
                    </span>
                  ))}
                </div>
              </DetailSection>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-32">
            <div className="auc-card p-5">
              <div className="auc-label">Amount</div>
              <div className="display mt-2 text-4xl leading-none">{formatFundingAmount(item)}</div>

              <div className="mt-5 flex justify-between gap-4 border-t border-[var(--auc-rule)] pt-4">
                <span className="auc-label">Deadline</span>
                <span className="mono text-xs font-black text-[var(--auc-coral)]">
                  {formatFundingDeadline(item.deadline)}
                </span>
              </div>

              {applicationUrl ? (
                <a href={applicationUrl} target="_blank" rel="noreferrer" className="mt-5 block">
                  <Button className="w-full justify-between gap-3">
                    Apply on provider site
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              ) : (
                <div className="mt-5 rounded-lg border border-[var(--auc-rule)] bg-[var(--auc-bg)] p-3 text-sm text-[var(--auc-muted)]">
                  No safe external application link is listed for this record.
                </div>
              )}
              <div className="mono mt-3 text-center text-[0.65rem] font-bold uppercase tracking-[0.06em] text-[var(--auc-muted)]">
                External links open in a new tab
              </div>
            </div>

            {showPersonalizationPrompt && (
              <div className="rounded-[14px] border-2 border-[var(--auc-purple)] bg-[var(--auc-purple-soft)] p-4">
                <div className="mono text-[0.68rem] font-black uppercase tracking-[0.08em] text-[var(--auc-purple-deep)]">
                  Guest prompt
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--auc-ink)]">
                  Sign in to create a role profile and see how opportunities rank against your background.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/sign-in">
                    <Button size="sm" variant="outline">Sign in</Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button size="sm">Create profile</Button>
                  </Link>
                </div>
              </div>
            )}

            {categoryChips.length > 0 && (
              <div className="auc-card-flat p-4">
                <div className="auc-label mb-3">Categories</div>
                <div className="flex flex-wrap gap-2">
                  {categoryChips.map((chip) => (
                    <span
                      key={chip}
                      className="mono rounded border border-[var(--auc-rule)] px-2 py-1 text-[0.68rem] font-bold text-[var(--auc-ink-2)]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-9">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="auc-label">{title}</h2>
        {badge && (
          <span className="mono rounded bg-[var(--auc-ink)] px-2 py-1 text-[0.62rem] font-black text-[var(--auc-lime)]">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function getFundingRoute(item: FundingItem) {
  if (item.type === "business_grant") {
    return {
      href: "/grants",
      label: "business grants",
      kind: "Grant",
      badgeClass: "bg-[var(--auc-purple-soft)] text-[var(--auc-purple-deep)]",
    };
  }

  if (item.type === "scholarship") {
    return {
      href: "/scholarships",
      label: "scholarships",
      kind: "Scholarship",
      badgeClass: "bg-[var(--auc-coral-soft)] text-[#912f26]",
    };
  }

  return {
    href: "/research-funding",
    label: "research funding",
    kind: "Research",
    badgeClass: "bg-[var(--auc-lime-soft)] text-[#40570b]",
  };
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

function getUsefulChecklist(
  item: FundingItem,
  enrichment: FundingEnrichmentBundle | null | undefined,
) {
  return (enrichment?.checklist?.application_checklist ?? []).filter(
    (step) => !isThinGenericChecklistStep(item, step),
  );
}

function isThinGenericChecklistStep(item: FundingItem, step: string) {
  const normalizedStep = step.trim().toLowerCase();
  const normalizedName = item.name.trim().toLowerCase();

  return (
    normalizedStep === `submit an application for ${normalizedName}.` ||
    normalizedStep === `apply for ${normalizedName}.`
  );
}
