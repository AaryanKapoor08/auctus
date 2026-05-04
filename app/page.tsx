import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import FundingCard from "@/components/funding/FundingCard";
import { Sparkles, DollarSign, MessageSquare, Target, Briefcase, GraduationCap, FlaskConical } from "lucide-react";
import { getSession } from "@/lib/session/get-session";
import { ListFundingForRole } from "@/lib/funding/queries";

export default async function Home() {
  const [session, businessGrants, scholarships, researchFunding] = await Promise.all([
    getSession(),
    ListFundingForRole({ role: "business", limit: 3 }),
    ListFundingForRole({ role: "student", limit: 3 }),
    ListFundingForRole({ role: "professor", limit: 3 }),
  ]);

  const features = [
    {
      icon: DollarSign,
      title: "Open Funding Search",
      description: "Browse active business grants, scholarships, and research funding before creating an account",
      color: "text-accent-600",
    },
    {
      icon: GraduationCap,
      title: "Student Awards",
      description: "Filter scholarships by audience, field, award type, level, and deadline",
      color: "text-primary-600",
    },
    {
      icon: FlaskConical,
      title: "Research Grants",
      description: "Find council funding, partnerships, equipment grants, training support, and research programs",
      color: "text-secondary-600",
    },
    {
      icon: MessageSquare,
      title: "Community Forum",
      description: "Sign in to ask questions, compare opportunities, and learn from other applicants",
      color: "text-secondary-600",
    },
    {
      icon: Target,
      title: "Personalized Matching",
      description: "Create a profile when you want ranked results and filters based on your role",
      color: "text-primary-600",
    },
    {
      icon: Briefcase,
      title: "Deadline Tracking",
      description: "Your dashboard highlights upcoming deadlines once your profile is set up",
      color: "text-purple-600",
    },
    {
      icon: Sparkles,
      title: "AI Advisor",
      description: "Use Auctus to move from broad discovery to a sharper funding shortlist",
      color: "text-pink-600",
    },
  ];

  const stats = [
    { label: "Business Grants", value: `${businessGrants.length}+` },
    { label: "Scholarships", value: `${scholarships.length}+` },
    { label: "Research Funds", value: `${researchFunding.length}+` },
    { label: "Public Browsing", value: "Open" },
  ];
  const previewItems = [
    ...businessGrants.map((item) => ({ item, href: `/grants/${item.id}` })),
    ...scholarships.map((item) => ({ item, href: `/scholarships/${item.id}` })),
    ...researchFunding.map((item) => ({ item, href: `/research-funding/${item.id}` })),
  ].slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 opacity-50" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32">
          <div className="text-center">
            <Badge variant="info" size="md" className="mb-6">
              Public funding browser
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Find Funding with{" "}
              <span className="text-gray-900">Auctus AI</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Browse real grants, scholarships, and research funding without signing in.
              Create a profile when you want Auctus to personalize the results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/grants">
                <Button size="lg" variant="primary">
                  Browse Grants
                </Button>
              </Link>
              <Link href={session ? "/dashboard" : "/sign-up"}>
                <Button size="lg" variant="outline">
                  {session ? "Go to Dashboard" : "Customize Matches"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Funding Preview */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Browse real opportunities first
            </h2>
            <p className="mt-2 max-w-2xl text-gray-600">
              These are active records from the funding database. Sign in only when you want profile-based ranking and saved preferences.
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

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Discovery first, personalization second
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The app should prove value before asking for an account. Browsing stays open;
            the signed-in layer improves relevance and workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className={`${feature.color} mb-4`}>
                    <Icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
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

      {/* CTA Section */}
      <section className="bg-white border-t border-gray-200 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready for personalized matches?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Keep browsing for free, or create a profile to rank opportunities by fit.
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
