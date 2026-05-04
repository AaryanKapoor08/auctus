import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import FundingCard from "@/components/funding/FundingCard";
import {
  ArrowRight,
  Briefcase,
  DollarSign,
  FlaskConical,
  GraduationCap,
  MessageSquare,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
} from "lucide-react";
import { getSession } from "@/lib/session/get-session";
import { ListFundingForRole } from "@/lib/funding/queries";

export default async function Home() {
  const [session, businessGrants, scholarships, researchFunding] = await Promise.all([
    getSession(),
    ListFundingForRole({ role: "business" }),
    ListFundingForRole({ role: "student" }),
    ListFundingForRole({ role: "professor" }),
  ]);

  const totalOpportunities =
    businessGrants.length + scholarships.length + researchFunding.length;

  const roleEntrypoints = [
    {
      label: "Business grants",
      description: "Programs for financing, growth, innovation, exports, and founder support.",
      href: "/grants",
      count: businessGrants.length,
      icon: Briefcase,
    },
    {
      label: "Scholarships",
      description: "Awards, bursaries, Indigenous funding, graduate support, STEM, health, and more.",
      href: "/scholarships",
      count: scholarships.length,
      icon: GraduationCap,
    },
    {
      label: "Research funding",
      description: "Council programs, partnerships, equipment, training, and research grants.",
      href: "/research-funding",
      count: researchFunding.length,
      icon: FlaskConical,
    },
  ];

  const features = [
    {
      icon: Search,
      title: "Browse first",
      description: "See the full funding database before making an account.",
      color: "text-accent-600",
    },
    {
      icon: SlidersHorizontal,
      title: "Filter precisely",
      description: "Narrow by role, source, audience, field, deadline, amount, and program focus.",
      color: "text-primary-600",
    },
    {
      icon: Target,
      title: "Personalize later",
      description: "Create a profile only when you want rankings and default filters tuned to you.",
      color: "text-secondary-600",
    },
    {
      icon: MessageSquare,
      title: "Ask the community",
      description: "Sign in to compare opportunities and get help from other applicants.",
      color: "text-secondary-600",
    },
    {
      icon: ShieldCheck,
      title: "No hard wall",
      description: "Browsing stays public. Account prompts only appear where they add value.",
      color: "text-primary-600",
    },
    {
      icon: Sparkles,
      title: "Sharper shortlist",
      description: "The dashboard turns broad discovery into a cleaner, role-aware funding list.",
      color: "text-purple-600",
    },
  ];

  const stats = [
    { label: "Total opportunities", value: totalOpportunities.toLocaleString() },
    { label: "Business grants", value: businessGrants.length.toLocaleString() },
    { label: "Scholarships", value: scholarships.length.toLocaleString() },
    { label: "Research funds", value: researchFunding.length.toLocaleString() },
  ];
  const previewItems = [
    ...businessGrants.slice(0, 2).map((item) => ({ item, href: `/grants/${item.id}` })),
    ...scholarships.slice(0, 2).map((item) => ({ item, href: `/scholarships/${item.id}` })),
    ...researchFunding.slice(0, 2).map((item) => ({ item, href: `/research-funding/${item.id}` })),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <Badge variant="info" size="md" className="mb-5">
              {totalOpportunities.toLocaleString()} active funding opportunities
            </Badge>
            <h1 className="max-w-4xl text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              Browse funding first. Personalize when it is worth it.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Auctus AI gives guests the full grant browser up front: business grants,
              scholarships, and research funding. Sign in only when you want role-aware
              matching, saved preferences, and dashboard shortcuts.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/grants">
                <Button size="lg" variant="primary">
                  Explore funding
                </Button>
              </Link>
              <Link href={session ? "/dashboard" : "/sign-up"}>
                <Button size="lg" variant="outline">
                  {session ? "Open dashboard" : "Create a profile"}
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              No account required to browse. Account required only for personalization.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">Start with your track</p>
                <p className="text-sm text-gray-600">Every path is open to browse.</p>
              </div>
              <DollarSign className="h-5 w-5 text-gray-500" />
            </div>
            <div className="space-y-3">
              {roleEntrypoints.map((entry) => {
                const Icon = entry.icon;

                return (
                  <Link
                    key={entry.href}
                    href={entry.href}
                    className="group block rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <span className="rounded-lg bg-gray-900 p-2 text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="font-semibold text-gray-900">{entry.label}</h2>
                          <span className="shrink-0 text-sm font-semibold text-gray-900">
                            {entry.count.toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-gray-600">
                          {entry.description}
                        </p>
                      </div>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-800" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mb-2 text-3xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Live opportunities, not placeholder content
            </h2>
            <p className="mt-2 max-w-2xl text-gray-600">
              These cards come from the same active database used by the app. Open a track
              to filter the full list.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/grants">
              <Button variant="outline">Business</Button>
            </Link>
            <Link href="/scholarships">
              <Button variant="outline">Students</Button>
            </Link>
            <Link href="/research-funding">
              <Button variant="outline">Research</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {previewItems.map(({ item, href }) => (
            <FundingCard key={item.id} item={item} href={href} />
          ))}
        </div>

        {!session && (
          <div className="mt-6 rounded-lg border border-primary-100 bg-primary-50 px-5 py-4 text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Want better matches?</span>{" "}
            Browse freely now, then sign up to let Auctus tailor filters and rankings to your profile.
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            A cleaner path from search to shortlist
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            The public browser handles discovery. The signed-in experience should remove
            noise once you are ready to make it personal.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="transition-shadow duration-200 hover:shadow-lg">
                <div className="p-6">
                  <div className={`${feature.color} mb-4`}>
                    <Icon className="h-10 w-10" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Ready for personalized matches?
          </h2>
          <p className="mb-8 text-xl text-gray-600">
            Browse the database for free, or create a profile to rank opportunities by fit.
          </p>
          <Link href={session ? "/dashboard" : "/sign-up"}>
            <Button size="lg" variant="secondary">
              {session ? "Open Dashboard" : "Create Profile"}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
