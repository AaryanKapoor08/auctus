"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBusiness } from "@/lib/BusinessContext";
import { Business } from "@/lib/data-utils";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Forum", href: "/forum" },
  { name: "Funding", href: "/funding" },
  { name: "Matchmaker", href: "/matchmaker" },
  { name: "Talent", href: "/talent" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { currentBusiness, businesses, setCurrentBusiness } = useBusiness();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);

  const isActivePath = (href: string) => pathname === href;

  // Guard against null currentBusiness during initialization
  if (!currentBusiness) {
    return null;
  }

  const handleBusinessSwitch = (businessId: string) => {
    setCurrentBusiness(businessId);
    setIsBusinessDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">
              Auctus AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActivePath(link.href)
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Business Switcher - Desktop */}
          <div className="hidden md:block relative">
            <button
              onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <span className="text-sm font-medium text-gray-900">
                {currentBusiness.name}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {isBusinessDropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsBusinessDropdownOpen(false)}
                />
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  {businesses.map((business: Business) => (
                    <button
                      key={business.id}
                      onClick={() => handleBusinessSwitch(business.id)}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150",
                        currentBusiness.id === business.id && "bg-primary-50"
                      )}
                    >
                      <div className="font-medium text-gray-900">
                        {business.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {business.industry} • {business.location}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-out Menu */}
          <div className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-xl z-50 md:hidden">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <span className="text-xl font-bold text-primary-600">
                  Auctus AI
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 text-gray-700" />
                </button>
              </div>

              {/* Business Switcher - Mobile */}
              <div className="p-4 border-b border-gray-200">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Current Business
                </div>
                <div className="space-y-2">
                  {businesses.map((business: Business) => (
                    <button
                      key={business.id}
                      onClick={() => handleBusinessSwitch(business.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg transition-colors duration-150",
                        currentBusiness.id === business.id
                          ? "bg-primary-50 border-2 border-primary-500"
                          : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                      )}
                    >
                      <div className="font-medium text-sm text-gray-900">
                        {business.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {business.industry}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Links - Mobile */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {navigationLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "block px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150",
                        isActivePath(link.href)
                          ? "bg-primary-50 text-primary-700"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
