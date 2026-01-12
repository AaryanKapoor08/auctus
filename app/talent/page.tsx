"use client";

import { useMemo, useState } from "react";
import { useBusiness } from "@/lib/BusinessContext";
import {
  getAllJobs,
  getAllTalents,
  getAllUniqueSkills,
  type Job,
  type Talent,
} from "@/lib/data-utils";
import JobCard from "@/components/cards/JobCard";
import TalentCard from "@/components/cards/TalentCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Briefcase, User, Search, X, Plus, UserPlus } from "lucide-react";

type ViewMode = "hiring" | "looking";
type SortOption = "recent" | "pay" | "type" | "match" | "experience";

export default function TalentPage() {
  const { currentBusiness } = useBusiness();

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>("hiring");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedJobType, setSelectedJobType] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");
  const [selectedLookingFor, setSelectedLookingFor] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  // Get all data
  const allJobs = getAllJobs();
  const allTalents = getAllTalents();
  const allSkills = getAllUniqueSkills();

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = [...allJobs];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          job.skills.some((skill) => skill.toLowerCase().includes(query)) ||
          job.businessName.toLowerCase().includes(query)
      );
    }

    // Skills filter (must have ALL selected skills)
    if (selectedSkills.length > 0) {
      filtered = filtered.filter((job) =>
        selectedSkills.every((skill) =>
          job.skills.some((jobSkill) => jobSkill.toLowerCase() === skill.toLowerCase())
        )
      );
    }

    // Job type filter
    if (selectedJobType !== "All") {
      filtered = filtered.filter((job) => job.jobType === selectedJobType);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          // Assume more recent jobs are later in the array
          return allJobs.indexOf(b) - allJobs.indexOf(a);
        case "pay":
          return b.payRange.max - a.payRange.max;
        case "type":
          return a.jobType.localeCompare(b.jobType);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allJobs, searchQuery, selectedSkills, selectedJobType, sortBy]);

  // Filter and sort talents
  const filteredTalents = useMemo(() => {
    let filtered = [...allTalents];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (talent) =>
          talent.name.toLowerCase().includes(query) ||
          talent.bio.toLowerCase().includes(query) ||
          talent.skills.some((skill) => skill.toLowerCase().includes(query)) ||
          talent.experience.toLowerCase().includes(query)
      );
    }

    // Skills filter (must have ALL selected skills)
    if (selectedSkills.length > 0) {
      filtered = filtered.filter((talent) =>
        selectedSkills.every((skill) =>
          talent.skills.some((talentSkill) => talentSkill.toLowerCase() === skill.toLowerCase())
        )
      );
    }

    // Availability filter
    if (selectedAvailability !== "All") {
      filtered = filtered.filter((talent) => talent.availability === selectedAvailability);
    }

    // Looking for filter (must match at least one)
    if (selectedLookingFor.length > 0) {
      filtered = filtered.filter((talent) =>
        selectedLookingFor.some((type) => talent.lookingFor.includes(type as any))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return allTalents.indexOf(b) - allTalents.indexOf(a);
        case "experience":
          // Simple heuristic: more years = higher
          const aYears = parseInt(a.experience) || 0;
          const bYears = parseInt(b.experience) || 0;
          return bYears - aYears;
        case "match":
          // Skills match count
          const aMatch = selectedSkills.filter((skill) =>
            a.skills.some((s) => s.toLowerCase() === skill.toLowerCase())
          ).length;
          const bMatch = selectedSkills.filter((skill) =>
            b.skills.some((s) => s.toLowerCase() === skill.toLowerCase())
          ).length;
          return bMatch - aMatch;
        default:
          return 0;
      }
    });

    return filtered;
  }, [allTalents, searchQuery, selectedSkills, selectedAvailability, selectedLookingFor, sortBy]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSkills([]);
    setSelectedJobType("All");
    setSelectedAvailability("All");
    setSelectedLookingFor([]);
    setSortBy("recent");
  };

  // Handle skill selection
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Handle looking for toggle
  const toggleLookingFor = (type: string) => {
    if (selectedLookingFor.includes(type)) {
      setSelectedLookingFor(selectedLookingFor.filter((t) => t !== type));
    } else {
      setSelectedLookingFor([...selectedLookingFor, type]);
    }
  };

  // Handle card click
  const handleJobClick = (job: Job) => {
    alert(
      `${job.title}\n\n` +
        `Company: ${job.businessName}\n` +
        `Location: ${job.location}\n` +
        `Type: ${job.jobType}\n` +
        `Pay: $${job.payRange.min.toLocaleString()} - $${job.payRange.max.toLocaleString()}\n` +
        `Posted: ${job.postedDate}\n\n` +
        `Skills: ${job.skills.join(", ")}\n\n` +
        `${job.description}\n\n` +
        `Requirements:\n${job.requirements.map((r) => `• ${r}`).join("\n")}\n\n` +
        `In the full platform, this would open a detailed modal with application options.`
    );
  };

  const handleTalentClick = (talent: Talent) => {
    alert(
      `${talent.name}\n\n` +
        `Skills: ${talent.skills.join(", ")}\n` +
        `Availability: ${talent.availability}\n` +
        `Looking for: ${talent.lookingFor.join(", ")}\n` +
        `Experience: ${talent.experience}\n` +
        (talent.education ? `Education: ${talent.education}\n` : "") +
        (talent.email ? `Email: ${talent.email}\n` : "") +
        (talent.phone ? `Phone: ${talent.phone}\n` : "") +
        (talent.portfolio ? `Portfolio: ${talent.portfolio}\n` : "") +
        `\n${talent.bio}\n\n` +
        `In the full platform, this would open a detailed profile with contact options.`
    );
  };

  const handleFABClick = () => {
    const message =
      viewMode === "hiring"
        ? "Post a job feature will be available in the full Auctus AI platform!"
        : "Create talent profile feature will be available in the full Auctus AI platform!";
    alert(message);
  };

  if (!currentBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const displayedItems = viewMode === "hiring" ? filteredJobs : filteredTalents;
  const totalCount = viewMode === "hiring" ? allJobs.length : allTalents.length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Local Talent Marketplace
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Hire local talent or find opportunities in Fredericton
          </p>

          {/* View Toggle */}
          <div className="flex gap-4">
            <button
              onClick={() => setViewMode("hiring")}
              className={`flex-1 md:flex-none px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                viewMode === "hiring"
                  ? "bg-primary-600 text-white shadow-md"
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300"
              }`}
            >
              <Briefcase className="h-5 w-5" />
              I'm Hiring
            </button>
            <button
              onClick={() => setViewMode("looking")}
              className={`flex-1 md:flex-none px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                viewMode === "looking"
                  ? "bg-primary-600 text-white shadow-md"
                  : "bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-300"
              }`}
            >
              <User className="h-5 w-5" />
              Looking for Work
            </button>
          </div>
        </div>

        {/* Main Layout: Sidebar + Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      viewMode === "hiring"
                        ? "Search jobs..."
                        : "Search talent..."
                    }
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Skills Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills ({selectedSkills.length} selected)
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                  {allSkills.slice(0, 20).map((skill) => (
                    <label
                      key={skill}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Job Type Filter (Jobs View) */}
              {viewMode === "hiring" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type
                  </label>
                  <Select
                    value={selectedJobType}
                    onChange={(e) => setSelectedJobType(e.target.value)}
                    options={[
                      { value: "All", label: "All Types" },
                      { value: "full-time", label: "Full-time" },
                      { value: "part-time", label: "Part-time" },
                      { value: "contract", label: "Contract" },
                      { value: "internship", label: "Internship" },
                    ]}
                  />
                </div>
              )}

              {/* Availability Filter (Talents View) */}
              {viewMode === "looking" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <Select
                    value={selectedAvailability}
                    onChange={(e) => setSelectedAvailability(e.target.value)}
                    options={[
                      { value: "All", label: "All" },
                      { value: "Immediately", label: "Immediately" },
                      { value: "Within 2 weeks", label: "Within 2 weeks" },
                      { value: "Within 1 month", label: "Within 1 month" },
                      { value: "Flexible", label: "Flexible" },
                    ]}
                  />
                </div>
              )}

              {/* Looking For Filter (Talents View) */}
              {viewMode === "looking" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Looking For
                  </label>
                  <div className="space-y-2">
                    {["full-time", "part-time", "contract", "internship"].map(
                      (type) => (
                        <label
                          key={type}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedLookingFor.includes(type)}
                            onChange={() => toggleLookingFor(type)}
                            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700 capitalize">
                            {type}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  options={
                    viewMode === "hiring"
                      ? [
                          { value: "recent", label: "Most Recent" },
                          { value: "pay", label: "Highest Pay" },
                          { value: "type", label: "Job Type" },
                        ]
                      : [
                          { value: "recent", label: "Most Recent" },
                          { value: "match", label: "Best Match" },
                          { value: "experience", label: "Experience Level" },
                        ]
                  }
                />
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats Row */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="font-semibold">{displayedItems.length}</span>{" "}
                of {totalCount} {viewMode === "hiring" ? "jobs" : "talent profiles"}
              </p>
            </div>

            {/* Empty State */}
            {displayedItems.length === 0 && (
              <Card className="text-center py-12">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No {viewMode === "hiring" ? "jobs" : "talent profiles"} found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or clearing filters
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </Card>
            )}

            {/* Jobs Grid */}
            {viewMode === "hiring" && displayedItems.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {(displayedItems as Job[]).map((job) => (
                  <JobCard
                    key={job.id}
                    {...job}
                    onClick={() => handleJobClick(job)}
                  />
                ))}
              </div>
            )}

            {/* Talents Grid */}
            {viewMode === "looking" && displayedItems.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {(displayedItems as Talent[]).map((talent) => (
                  <TalentCard
                    key={talent.id}
                    {...talent}
                    onClick={() => handleTalentClick(talent)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={handleFABClick}
        className="fixed bottom-8 right-8 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all duration-200 hover:shadow-xl flex items-center gap-2 group"
      >
        {viewMode === "hiring" ? (
          <>
            <Plus className="h-6 w-6" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
              Post a Job
            </span>
          </>
        ) : (
          <>
            <UserPlus className="h-6 w-6" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
              Create Profile
            </span>
          </>
        )}
      </button>
    </div>
  );
}
