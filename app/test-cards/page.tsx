"use client";

import { TrendingUp, MessageSquare, DollarSign, Users } from "lucide-react";
import StatsCard from "@/components/cards/StatsCard";
import ThreadCard from "@/components/cards/ThreadCard";
import GrantCard from "@/components/cards/GrantCard";
import MatchCard from "@/components/cards/MatchCard";
import ReplyCard from "@/components/cards/ReplyCard";
import JobCard from "@/components/cards/JobCard";
import TalentCard from "@/components/cards/TalentCard";
import { useBusiness } from "@/lib/BusinessContext";

export default function TestCardsPage() {
  const { businesses } = useBusiness();

  if (!businesses || businesses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Card Components Test Page
        </h1>

        {/* StatsCard Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            StatsCard Component
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              icon={DollarSign}
              title="New Grants Available"
              value={12}
              trend={{ value: 15, direction: "up" }}
              variant="default"
            />
            <StatsCard
              icon={MessageSquare}
              title="Active Forum Threads"
              value={34}
              trend={{ value: 8, direction: "up" }}
              variant="success"
            />
            <StatsCard
              icon={Users}
              title="Business Matches"
              value={8}
              variant="warning"
            />
            <StatsCard
              icon={TrendingUp}
              title="Upcoming Deadlines"
              value={3}
              trend={{ value: 2, direction: "down" }}
              variant="default"
            />
          </div>
        </section>

        {/* ThreadCard Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            ThreadCard Component
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ThreadCard
              id="thread-1"
              title="Looking for a wholesale coffee supplier"
              author={{
                name: "Sarah Johnson",
                businessName: "Aroma Coffee House",
              }}
              category="Ask for Help"
              preview="I'm searching for a reliable wholesale supplier for organic coffee beans. Does anyone have recommendations for local roasters?"
              tags={["wholesale", "supplier", "coffee"]}
              replyCount={12}
              timestamp="2 hours ago"
              onClick={() => console.log("Thread clicked")}
            />
            <ThreadCard
              id="thread-2"
              title="Collaboration opportunity: Joint marketing campaign"
              author={{
                name: "Mike Chen",
                businessName: "Digital Dreams Agency",
              }}
              category="Collaboration Opportunities"
              preview="Looking to partner with local businesses for a summer marketing campaign. Great opportunity to increase visibility!"
              tags={["marketing", "collaboration", "summer"]}
              replyCount={5}
              timestamp="5 hours ago"
              onClick={() => console.log("Thread clicked")}
            />
            <ThreadCard
              id="thread-3"
              title="Hiring experienced welder - urgently needed"
              author={{
                name: "James Wilson",
                businessName: "Maritime Manufacturing Ltd",
              }}
              category="Hiring & Local Talent"
              preview="We're looking for an experienced welder to join our team immediately. Competitive salary and benefits package."
              tags={["hiring", "manufacturing", "urgent"]}
              replyCount={8}
              timestamp="1 day ago"
              onClick={() => console.log("Thread clicked")}
            />
          </div>
        </section>

        {/* GrantCard Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            GrantCard Component (Match Percentage Logic)
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GrantCard
              id="grant-1"
              name="Canada Small Business Grant"
              amount={50000}
              matchPercentage={85}
              deadline="March 15, 2026"
              description="Support for small businesses looking to expand operations, hire new employees, or invest in equipment."
              category="Business Expansion"
              onClick={() => console.log("Grant clicked")}
            />
            <GrantCard
              id="grant-2"
              name="Tourism Recovery Fund"
              amount={25000}
              matchPercentage={55}
              deadline="April 30, 2026"
              description="Helping tourism and hospitality businesses recover from economic challenges and modernize their operations."
              category="Tourism"
              onClick={() => console.log("Grant clicked")}
            />
            <GrantCard
              id="grant-3"
              name="Manufacturing Innovation Grant"
              amount={100000}
              matchPercentage={30}
              deadline="May 20, 2026"
              description="Supporting manufacturing companies investing in new technology, automation, and process improvements."
              category="Manufacturing"
              onClick={() => console.log("Grant clicked")}
            />
          </div>
        </section>

        {/* MatchCard Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            MatchCard Component
          </h2>
          <div className="space-y-6">
            <MatchCard
              yourBusiness={businesses[0]}
              partnerBusiness={businesses[1]}
              reasoning={{
                youNeed: ["Wholesale supplier", "Manufacturing partnership"],
                theyOffer: ["Contract manufacturing", "Metal fabrication"],
                matchScore: 92,
              }}
              onConnect={() => console.log("Connect clicked")}
            />
            <MatchCard
              yourBusiness={businesses[0]}
              partnerBusiness={businesses[2]}
              reasoning={{
                youNeed: ["Marketing help", "Event promotion"],
                theyOffer: ["Website development", "Social media management"],
                matchScore: 78,
              }}
              onConnect={() => console.log("Connect clicked")}
            />
          </div>
        </section>

        {/* ReplyCard Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            ReplyCard Component
          </h2>
          <div className="space-y-4">
            <ReplyCard
              id="reply-1"
              author={{
                name: "Emily Davis",
                businessName: "Fresh Roast Coffee Co.",
              }}
              content="I highly recommend checking out Atlantic Bean Roasters. They've been our supplier for 3 years and their quality is consistently excellent. They offer both organic and fair-trade options."
              timestamp="1 hour ago"
              helpfulCount={5}
              onHelpful={() => console.log("Helpful clicked")}
            />
            <ReplyCard
              id="reply-2"
              author={{
                name: "Robert Smith",
                businessName: "Downtown Café",
              }}
              content="We also use Atlantic Bean Roasters! Their customer service is amazing and they deliver weekly. Prices are very competitive too."
              timestamp="45 minutes ago"
              helpfulCount={0}
              onHelpful={() => console.log("Helpful clicked")}
              isNested={true}
            />
          </div>
        </section>

        {/* JobCard Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            JobCard Component
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <JobCard
              id="job-1"
              title="Senior Web Developer"
              businessName="Digital Dreams Agency"
              skills={["React", "TypeScript", "Node.js", "Tailwind CSS"]}
              jobType="full-time"
              payRange={{ min: 70000, max: 90000 }}
              postedDate="3 days ago"
              location="Fredericton, NB"
              onClick={() => console.log("Job clicked")}
            />
            <JobCard
              id="job-2"
              title="Barista (Part-time)"
              businessName="Aroma Coffee House"
              skills={["Customer Service", "Coffee Preparation", "Cash Handling"]}
              jobType="part-time"
              payRange={{ min: 15, max: 18 }}
              postedDate="1 day ago"
              location="Downtown Fredericton"
              onClick={() => console.log("Job clicked")}
            />
            <JobCard
              id="job-3"
              title="Marketing Consultant"
              businessName="Local Business Network"
              skills={["Digital Marketing", "SEO", "Content Strategy"]}
              jobType="contract"
              payRange={{ min: 50, max: 75 }}
              postedDate="5 days ago"
              location="Remote"
              onClick={() => console.log("Job clicked")}
            />
          </div>
        </section>

        {/* TalentCard Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            TalentCard Component
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TalentCard
              id="talent-1"
              name="Alex Thompson"
              skills={["Graphic Design", "Adobe Suite", "Branding", "UI/UX"]}
              availability="Available immediately"
              bio="Experienced graphic designer with 5+ years creating brand identities for local businesses. Passionate about helping small companies stand out."
              onClick={() => console.log("Talent clicked")}
            />
            <TalentCard
              id="talent-2"
              name="Jordan Lee"
              skills={["Welding", "Metal Fabrication", "CNC Operation"]}
              availability="Available part-time"
              bio="Certified welder with 10 years of experience in custom metal fabrication and industrial manufacturing."
              onClick={() => console.log("Talent clicked")}
            />
            <TalentCard
              id="talent-3"
              name="Taylor Brown"
              skills={["Accounting", "Bookkeeping", "QuickBooks", "Payroll"]}
              availability="Available weekends"
              bio="CPA with expertise in small business accounting and financial planning. Help businesses stay organized and tax-compliant."
              onClick={() => console.log("Talent clicked")}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
