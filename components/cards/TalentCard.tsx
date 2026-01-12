import { Mail, User, Calendar } from "lucide-react";
import Image from "next/image";

interface TalentCardProps {
  id: string;
  name: string;
  skills: string[];
  availability: string;
  bio: string;
  avatar?: string;
  onClick?: () => void;
}

export default function TalentCard({
  id,
  name,
  skills,
  availability,
  bio,
  avatar,
  onClick,
}: TalentCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Header with Avatar */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-8 w-8 text-primary-600" />
            </div>
          )}
        </div>

        {/* Name and Availability */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{availability}</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{bio}</p>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary-50 text-primary-700"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Contact Button */}
      {onClick && (
        <button
          className="w-full px-4 py-2 bg-white text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <Mail className="h-4 w-4" />
          View Profile
        </button>
      )}
    </div>
  );
}
