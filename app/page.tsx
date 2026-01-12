import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Sparkles, Users, DollarSign, MessageSquare, Target, Briefcase } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: DollarSign,
      title: "Grant Matching",
      description: "AI-powered grant discovery matched to your business profile and eligibility",
      color: "text-accent-600",
    },
    {
      icon: MessageSquare,
      title: "Community Forum",
      description: "Connect with local business owners, share advice, and find collaboration opportunities",
      color: "text-secondary-600",
    },
    {
      icon: Target,
      title: "Business Matchmaker",
      description: "Find strategic partners based on complementary needs and offerings",
      color: "text-primary-600",
    },
    {
      icon: Briefcase,
      title: "Local Talent",
      description: "Hire local talent or find opportunities in the Fredericton business community",
      color: "text-purple-600",
    },
    {
      icon: Sparkles,
      title: "AI Advisor",
      description: "24/7 intelligent assistant to help navigate funding, connections, and growth strategies",
      color: "text-pink-600",
    },
  ];

  const stats = [
    { label: "Active Businesses", value: "500+" },
    { label: "Grants Matched", value: "$2.5M" },
    { label: "Connections Made", value: "1,200+" },
    { label: "Success Rate", value: "87%" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 opacity-50" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 sm:py-32">
          <div className="text-center">
            <Badge variant="info" size="md" className="mb-6">
              Powered by AI
            </Badge>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Grow Your Business with{" "}
              <span className="text-primary-600">Auctus AI</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with grants, partners, and opportunities in Fredericton's thriving business ecosystem. 
              Let AI guide your growth journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" variant="primary">
                  Get Started
                </Button>
              </Link>
              <Link href="/funding">
                <Button size="lg" variant="outline">
                  Explore Grants
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
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything Your Business Needs to Thrive
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From funding opportunities to local partnerships, Auctus AI brings together 
            all the tools you need in one intelligent platform.
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

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Trusted by Fredericton Businesses
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                    AC
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">Aroma Coffee House</div>
                    <div className="text-sm text-gray-600">Food & Beverage</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Found the perfect wholesale supplier through the matchmaker. 
                  Also secured a $15k grant we didn't even know existed!"
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center text-secondary-600 font-bold text-lg">
                    MM
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">Maritime Manufacturing</div>
                    <div className="text-sm text-gray-600">Manufacturing</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "The AI advisor helped us navigate complex government funding. 
                  We've connected with 3 new B2B clients through the platform."
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center text-accent-600 font-bold text-lg">
                    DD
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-gray-900">Digital Dreams Agency</div>
                    <div className="text-sm text-gray-600">Technology</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Game changer for finding local talent. The community forum alone 
                  is worth it - so much valuable advice from experienced owners."
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Grow Your Business?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join Fredericton's premier business growth platform today.
          </p>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
