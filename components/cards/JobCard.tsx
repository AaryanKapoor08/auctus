import { Briefcase, Clock, DollarSign, MapPin } from "lucide-react";
import Badge from "@/components/ui/Badge";

interface JobCardProps {
  id: string;
  title: string;
  businessName: string;
  skills: string[];
  jobType: "full-time" | "part-time" | "contract" | "internship";
  payRange: {
    min: number;
    max: number;
  };
  postedDate: string;
  location?: string;
  onClick?: () => void;
}

const jobTypeLabels: Record<JobCardProps["jobType"], string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
};

const jobTypeColors: Record<JobCardProps["jobType"], "blue" | "green" | "purple" | "orange"> = {
  "full-time": "blue",
  "part-time": "green",
  contract: "purple",
  internship: "orange",
};

export default function JobCard({
  id,
  title,
  businessName,
  skills,
  jobType,
  payRange,
  postedDate,
  location,
  onClick,
}: JobCardProps) {
  const formattedPay = `$${payRange.min.toLocaleString()} - $${payRange.max.toLocaleString()}`;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 flex items-center gap-1.5">
            <Briefcase className="h-4 w-4" />
            {businessName}
          </p>
        </div>
        <Badge color={jobTypeColors[jobType]} size="sm">
          {jobTypeLabels[jobType]}
        </Badge>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium text-green-600">{formattedPay}</span>
        </div>
        {location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>Posted {postedDate}</span>
        </div>
      </div>

      {/* Apply Button */}
      {onClick && (
        <button
          className="mt-4 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm font-medium"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          View Details
        </button>
      )}
    </div>
  );
}
