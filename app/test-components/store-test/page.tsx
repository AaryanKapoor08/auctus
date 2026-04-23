"use client";

import { useBusiness } from "@/lib/BusinessContext";
import { Business } from "@/lib/data-utils";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { Building2, MapPin, Users, DollarSign } from "lucide-react";

export default function StoreTestPage() {
  const { currentBusiness, businesses, setCurrentBusiness } = useBusiness();

  if (!currentBusiness) {
    return <div>Loading...</div>;
  }

  const businessOptions = businesses.map((business: Business) => ({
    value: business.id,
    label: business.name,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            React Context Store Test
          </h1>
          <p className="text-gray-600">
            Business State Management Demo
          </p>
        </div>

        {/* Business Switcher */}
        <Card header={<h2 className="text-2xl font-bold">Business Switcher</h2>}>
          <div className="space-y-4">
            <p className="text-gray-600">
              Select a business to see the state update dynamically:
            </p>
            <Select
              label="Current Business"
              options={businessOptions}
              value={currentBusiness.id}
              onChange={(e) => setCurrentBusiness(e.target.value)}
            />
          </div>
        </Card>

        {/* Current Business Details */}
        <Card
          header={
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Current Business Details</h2>
              <Badge variant="success">Active</Badge>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Business Name & Description */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {currentBusiness.name}
              </h3>
              <p className="text-gray-600">{currentBusiness.description}</p>
            </div>

            {/* Business Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Industry */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Industry</p>
                  <p className="font-semibold text-gray-900">
                    {currentBusiness.industry}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-secondary-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-secondary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold text-gray-900">
                    {currentBusiness.location}
                  </p>
                </div>
              </div>

              {/* Employees */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-accent-100 rounded-lg">
                  <Users className="h-5 w-5 text-accent-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Employees</p>
                  <p className="font-semibold text-gray-900">
                    {currentBusiness.employees}
                  </p>
                </div>
              </div>

              {/* Revenue */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Annual Revenue</p>
                  <p className="font-semibold text-gray-900">
                    ${currentBusiness.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Needs */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Business Needs</h4>
              <div className="flex flex-wrap gap-2">
                {currentBusiness.needs.map((need: string, index: number) => (
                  <Badge key={index} variant="warning">
                    {need}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Offers */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Services Offered
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentBusiness.offers.map((offer: string, index: number) => (
                  <Badge key={index} variant="success">
                    {offer}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* All Businesses List */}
        <Card header={<h2 className="text-2xl font-bold">All Available Businesses</h2>}>
          <div className="space-y-3">
            {businesses.map((business: Business) => (
              <div
                key={business.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  business.id === currentBusiness.id
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setCurrentBusiness(business.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {business.name}
                    </h4>
                    <p className="text-sm text-gray-600">{business.industry}</p>
                  </div>
                  {business.id === currentBusiness.id && (
                    <Badge variant="info">Selected</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Success Message */}
        <Card className="bg-secondary-50 border-2 border-secondary-500">
          <div className="text-center">
            <h3 className="text-xl font-bold text-secondary-900 mb-2">
              ✅ React Context Store Working!
            </h3>
            <p className="text-secondary-800">
              Phase 1.3 State Management Setup - Complete (React Context)
            </p>
            <p className="text-sm text-secondary-700 mt-2">
              Business switching updates all components reactively
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
