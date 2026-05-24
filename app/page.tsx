import Link from "next/link";
import type { ReactNode } from "react";
import type { FundingItem } from "@contracts/funding";
import MarqueeBelt from "@/components/layout/MarqueeBelt";
import { getSession } from "@/lib/session/get-session";
import { ListFundingForRole } from "@/lib/funding/queries";
import { getFundingSiteStats } from "@/lib/funding/site-stats";
import {
  buildFundingMetricTickerItems,
  formatFundingStatCurrency,
} from "@/lib/funding/site-stats-shared";
import { listThreads } from "@/lib/forum/queries";

function formatAmount(item: FundingItem) {
  if (item.amount_min && item.amount_max) {
    return `$${item.amount_min.toLocaleString("en-CA")} - $${item.amount_max.toLocaleString("en-CA")}`;
  }

  if (item.amount_max) {
    return `$${item.amount_max.toLocaleString("en-CA")}`;
  }

  return "Amount varies";
}

function formatDeadline(deadline: string | null) {
  if (!deadline) return "Rolling";
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return "Date varies";

  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function fundingHref(item: FundingItem) {
  if (item.type === "business_grant") return `/grants/${item.id}`;
  if (item.type === "scholarship") return `/scholarships/${item.id}`;
  return `/research-funding/${item.id}`;
}

function fundingLabel(item: FundingItem) {
  if (item.type === "business_grant") return "Grant";
  if (item.type === "scholarship") return "Scholarship";
  return "Research";
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="auc-label mb-2">{children}</div>;
}

function StepBlock({
  step,
  title,
  body,
  color,
}: {
  step: string;
  title: string;
  body: string;
  color: string;
}) {
  return (
    <div className="min-h-[340px] border-b border-[var(--auc-rule)] p-6 lg:border-b-0 lg:border-r lg:last:border-r-0">
      <div className="mono text-[0.68rem] font-bold uppercase tracking-[0.06em] text-[var(--auc-muted)]">
        {step}
      </div>
      <div className="display mt-4 text-4xl leading-[1.05] tracking-[-0.02em]">{title}</div>
      <div className={`mt-5 h-14 rounded-md ${color}`} />
      <p className="mt-5 text-sm leading-6 text-[var(--auc-ink-2)]">{body}</p>
    </div>
  );
}

function AutomateSection() {
  return (
    <section className="auc-reference-section grid gap-10 pt-28 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
      <div>
        <SectionLabel>06 · Automate</SectionLabel>
        <h2 className="display auc-section-title max-w-xl">
          Automate
          <br />
          and <span className="inline-block rounded-md bg-[var(--auc-lime)] px-3">save time</span>
          <br />
          for things
          <br />
          that matter.
        </h2>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--auc-ink-2)]">
          Auctus keeps funding detail pages anchored to provider records, then adds
          plain-language summaries and application checklists when current enrichment exists.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          {[
            "Eligibility checklist",
            "Reviewer red-flag scan",
            "Budget cross-check",
            "Deadline review",
            "Profile matching",
            "Provider links",
          ].map((item) => (
            <span
              key={item}
              className="rounded-full border-2 border-[var(--auc-ink)] bg-[var(--auc-paper)] px-3 py-2 text-sm font-bold"
            >
              ✓ {item}
            </span>
          ))}
        </div>
      </div>

      <div className="auc-card relative overflow-hidden p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="auc-label">Auctus AI · live detail support</div>
          <div className="mono inline-flex items-center gap-2 text-[0.68rem] font-bold text-[var(--auc-muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10c966]" />
            DATA-GATED
          </div>
        </div>
        <div className="grid gap-4 rounded-[14px] border-2 border-[var(--auc-ink)] bg-[var(--auc-bg)] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <div className="mb-2 flex gap-2">
              <span className="mono rounded bg-[var(--auc-purple-soft)] px-2 py-1 text-[0.62rem] font-black text-[var(--auc-purple-deep)]">
                RESEARCH
              </span>
              <span className="mono rounded bg-[var(--auc-coral-soft)] px-2 py-1 text-[0.62rem] font-black text-[#912f26]">
                SUMMARY
              </span>
            </div>
            <div className="text-lg font-black leading-snug">Detail pages stay provider-first.</div>
            <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--auc-ink-2)]">
              <span className="display text-sm">$200,000</span>
              <span className="font-bold text-[var(--auc-coral)]">● Oct 1</span>
              <span className="mono text-[0.68rem] text-[var(--auc-muted)]">CURRENT · REVIEWED</span>
            </div>
          </div>
          <button className="auc-btn-loop inline-flex items-center justify-center gap-2 rounded-full border-2 border-[var(--auc-ink)] bg-[var(--auc-lime)] px-4 py-3 text-sm font-black shadow-[0_3px_0_var(--auc-ink)]">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--auc-ink)] text-[0.7rem] text-[var(--auc-lime)]">
              ✦
            </span>
            Summarize
          </button>
        </div>
        <div className="auc-summary-loop relative mt-3 rounded-[14px] border-2 border-[var(--auc-ink)] bg-[var(--auc-lime)] p-5 shadow-[4px_4px_0_var(--auc-ink)]">
          <div className="auc-label text-[var(--auc-ink)] opacity-70">AI summary · 1.4s</div>
          <p className="mt-2 text-sm leading-6">
            Current enrichment appears only when reviewed and useful. The original
            amount, deadline, requirements, and provider application link remain visible.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["✓ Eligibility", "✓ Requirements", "✓ Checklist", "! Review caveats"].map((item) => (
              <span key={item} className="mono rounded-full border border-[var(--auc-rule-strong)] bg-white px-3 py-1.5 text-[0.68rem] font-black">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  const [session, fundingStats, businessGrants, scholarships, researchFunding, threads] = await Promise.all([
    getSession(),
    getFundingSiteStats(),
    ListFundingForRole({ role: "business", limit: 1 }),
    ListFundingForRole({ role: "student", limit: 1 }),
    ListFundingForRole({ role: "professor", limit: 1 }),
    listThreads({ limit: 4 }),
  ]);

  const totalOpportunities = fundingStats.totalOpen;
  const previewItems = [businessGrants[0], scholarships[0], researchFunding[0]].filter(
    Boolean,
  ) as FundingItem[];
  const sourceCount = fundingStats.providerCount;
  const topAmount = formatFundingStatCurrency(fundingStats.maxListedAmount);
  const metricTickerItems = buildFundingMetricTickerItems(fundingStats);

  const lanes = [
    {
      number: "01",
      label: "BUSINESSES",
      href: "/grants",
      count: fundingStats.byType.business_grant,
      body: "Federal, provincial, growth, digital, export, innovation and founder-support programs.",
      accent: "text-[var(--auc-purple)]",
      tags: fundingStats.topTagsByType.business_grant,
    },
    {
      number: "02",
      label: "STUDENTS",
      href: "/scholarships",
      count: fundingStats.byType.scholarship,
      body: "Scholarships, bursaries, graduate awards, field-specific funding and student prizes.",
      accent: "text-[var(--auc-coral)]",
      tags: fundingStats.topTagsByType.scholarship,
    },
    {
      number: "03",
      label: "RESEARCHERS",
      href: "/research-funding",
      count: fundingStats.byType.research_grant,
      body: "Council grants, partnerships, equipment, training and research-area funds.",
      accent: "text-[#5f8300]",
      tags: fundingStats.topTagsByType.research_grant,
    },
  ];

  return (
    <div className="auc-page" id="top">
      <section className="auc-reference-section pt-12 md:pt-14">
        <h1 className="display auc-hero-title max-w-[82rem]">
          FIND THE
          <br />
          MONEY.
          <br />
          <span className="relative inline-block">
            <span className="absolute inset-y-[0.04em] inset-x-[-0.08em] -skew-x-3 bg-[var(--auc-purple)]" />
            <span className="relative z-10 px-3 text-white">SKIP THE</span>
          </span>{" "}
          NOISE.
        </h1>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.08fr_0.95fr] lg:items-start">
          <div>
            <p className="max-w-xl text-[1.38rem] font-medium leading-[1.4] text-[var(--auc-ink-2)]">
              Auctus indexes{" "}
              <b className="text-[var(--auc-ink)]">
                {totalOpportunities.toLocaleString("en-CA")} open opportunities
              </b>{" "}
              from real Canadian funding sources — then lets your profile sharpen the list.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={session ? "/dashboard" : "/sign-up"}
                className="inline-flex items-center gap-3 rounded-full bg-[var(--auc-ink)] px-7 py-5 text-[1.05rem] font-black text-white"
              >
                {session ? "Open dashboard" : "Let's begin?"}
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--auc-lime)] text-[var(--auc-ink)]">
                  →
                </span>
              </Link>
              <Link
                href="/grants"
                className="inline-flex items-center rounded-full border-2 border-[var(--auc-ink)] px-7 py-5 text-[1.05rem] font-bold text-[var(--auc-ink)]"
              >
                Browse the database
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-8">
              {[
                [totalOpportunities.toLocaleString("en-CA"), "open opportunities"],
                [sourceCount.toLocaleString("en-CA"), "providers indexed"],
                [topAmount, "largest listed value"],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="display text-[2.4rem] leading-none">{value}</div>
                  <div className="mono mt-1 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-[var(--auc-muted)]">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="auc-card p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="auc-label">Live shortlist · real data</div>
              <div className="mono inline-flex items-center gap-2 rounded-full bg-[var(--auc-purple-soft)] px-3 py-1 text-[0.68rem] font-black text-[var(--auc-purple-deep)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--auc-purple)]" />
                CURRENT
              </div>
            </div>
            {previewItems.length === 0 ? (
              <div className="border-t border-[var(--auc-rule)] py-8 text-sm text-[var(--auc-muted)]">
                Funding records will appear here once the database has active items.
              </div>
            ) : (
              previewItems.map((item) => (
                <Link
                  key={item.id}
                  href={fundingHref(item)}
                  className="grid grid-cols-[1fr_auto] gap-4 border-t border-[var(--auc-rule)] py-4 text-[var(--auc-ink)]"
                >
                  <div>
                    <div className="text-base font-black leading-tight">{item.name}</div>
                    <div className="mt-1 text-sm text-[var(--auc-muted)]">
                      {item.provider} · {fundingLabel(item)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="display text-lg">{formatAmount(item)}</div>
                    <div className="mono mt-1 text-xs font-black text-[var(--auc-coral)]">
                      {formatDeadline(item.deadline)}
                    </div>
                  </div>
                </Link>
              ))
            )}
            <div className="mt-1 flex items-center justify-between border-t border-[var(--auc-rule)] pt-4">
              <div className="mono text-xs text-[var(--auc-muted)]">
                {Math.max(totalOpportunities - previewItems.length, 0).toLocaleString("en-CA")} more in the browser
              </div>
              <Link href="/grants" className="text-sm font-black text-[var(--auc-purple-deep)]">
                Open tracks →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-20">
        <MarqueeBelt items={metricTickerItems} ariaLabel="Current funding totals" />
      </div>

      <section id="opportunities" className="auc-reference-section pt-24">
        <div className="mb-8 flex flex-col gap-5 border-b-2 border-[var(--auc-ink)] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <SectionLabel>Section 02 · Entry points</SectionLabel>
            <h2 className="display auc-section-title">Pick a lane.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-[var(--auc-muted)]">
            Each lane uses real records with role-specific tags, filters and detail pages.
          </p>
        </div>

        <div className="grid border-t border-[var(--auc-rule)] lg:grid-cols-3">
          {lanes.map((lane, index) => (
            <div
              key={lane.href}
              className="flex flex-col border-b border-[var(--auc-rule)] p-7 lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <div className="flex items-baseline justify-between">
                <div className="mono text-sm text-[var(--auc-muted)]">NO. {lane.number}</div>
                <div className="mono text-[0.68rem] font-bold uppercase tracking-[0.05em] text-[var(--auc-muted)]">
                  Open now
                </div>
              </div>
              <div className="display mt-2 text-[2.5rem] leading-none">{lane.label}</div>
              <div className={`display-cond mt-5 text-[9rem] leading-[0.85] ${lane.accent}`}>
                {lane.count.toLocaleString("en-CA")}
              </div>
              <p className="mt-5 text-sm leading-6 text-[var(--auc-ink-2)]">{lane.body}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {lane.tags.map((tag) => (
                  <span
                    key={tag}
                    className="mono rounded border border-[var(--auc-rule-strong)] px-2 py-1 text-[0.68rem] font-bold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href={lane.href}
                className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--auc-ink)] px-5 py-3 text-sm font-black text-white"
              >
                Open {lane.label.toLowerCase()} <span className={index === 2 ? "text-[var(--auc-lime)]" : "text-[var(--auc-coral)]"}>→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="auc-reference-section pt-28">
        <SectionLabel>Section 04 · How it works</SectionLabel>
        <h2 className="display auc-section-title max-w-6xl">
          From a live funding database to a cleaner shortlist.
        </h2>
        <div className="mt-14 grid border-t-2 border-[var(--auc-ink)] md:grid-cols-2 lg:grid-cols-4">
          <StepBlock
            step="Step 01"
            title="Tell us once."
            body="Pick a role and answer a short profile. Stage, sector, location and priorities become usable filters."
            color="bg-[var(--auc-purple)]"
          />
          <StepBlock
            step="Step 02"
            title="See what fits."
            body="Auctus matches your profile to live opportunities and keeps broad public browsing intact."
            color="bg-[var(--auc-coral)]"
          />
          <StepBlock
            step="Step 03"
            title="Stay in the loop."
            body="Use the dashboard and forum to return to useful funding context without restarting from search."
            color="bg-[var(--auc-lime)]"
          />
          <StepBlock
            step="Step 04"
            title="Apply with context."
            body="Each detail page keeps provider links primary and adds reviewed enrichment only when it exists."
            color="bg-[var(--auc-butter)]"
          />
        </div>
      </section>

      <div className="mt-24">
        <MarqueeBelt
          slow
          items={[
            "AI summaries when available",
            "Eligibility bullets",
            "Provider links stay primary",
            "Real Canadian records",
            "Built for public browsing",
          ]}
        />
      </div>

      <AutomateSection />

      <section id="community" className="auc-reference-section grid gap-12 pt-28 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <SectionLabel>05 · Community</SectionLabel>
          <h2 className="display max-w-2xl text-[clamp(3.5rem,6vw,4.5rem)] leading-[0.95] tracking-[-0.03em]">
            Real notes from
            <br />
            people doing <span className="text-[var(--auc-purple)]">the work.</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--auc-ink-2)]">
            The Auctus forum is where applicants compare reviewer feedback, share templates,
            and tag the questions that actually got answered.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/forum" className="rounded-full bg-[var(--auc-ink)] px-6 py-3.5 text-sm font-black text-white">
              Browse threads
            </Link>
            <Link href="/forum/new" className="rounded-full border-2 border-[var(--auc-ink)] px-6 py-3.5 text-sm font-black text-[var(--auc-ink)]">
              Start a thread
            </Link>
          </div>
        </div>

        <div className="auc-card p-5">
          {threads.length === 0 ? (
            <div className="py-10 text-center">
              <div className="display text-3xl">No threads yet.</div>
              <p className="mt-2 text-sm text-[var(--auc-muted)]">
                Start the first community discussion after signing in.
              </p>
            </div>
          ) : (
            threads.map((thread, index) => (
              <Link
                key={thread.id}
                href={`/forum/${thread.id}`}
                className="grid gap-3 border-t border-[var(--auc-rule)] py-4 first:border-t-0 sm:grid-cols-[4.75rem_1fr_auto] sm:items-center"
              >
                <span className="mono w-fit rounded bg-[var(--auc-purple-soft)] px-2 py-1 text-center text-[0.68rem] font-black text-[var(--auc-purple-deep)]">
                  {thread.category.toUpperCase()}
                </span>
                <div>
                  <div className="font-black leading-snug text-[var(--auc-ink)]">{thread.title}</div>
                  <div className="mt-1 text-xs text-[var(--auc-muted)]">
                    {thread.author.display_name || "Unknown user"} · {thread.reply_count} replies
                  </div>
                </div>
                <span className={index === 0 ? "rounded bg-[var(--auc-coral)] px-2 py-1 text-[0.62rem] font-black text-[var(--auc-ink)]" : "mono text-xs font-bold text-[var(--auc-muted)]"}>
                  {index === 0 ? "HOT" : `▲ ${thread.reply_count}`}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
