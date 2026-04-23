"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getAllBusinesses } from "./data-utils";

const BusinessContext = createContext();

export function BusinessProvider({ children }) {
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [businesses, setBusinesses] = useState([]);

  // Initialize businesses on mount
  useEffect(() => {
    const allBusinesses = getAllBusinesses();
    setBusinesses(allBusinesses);
    setCurrentBusiness(allBusinesses[0]); // Default to first business
  }, []);

  const handleSetCurrentBusiness = (id) => {
    const business = businesses.find((b) => b.id === id);
    if (business) {
      setCurrentBusiness(business);
    }
  };

  return (
    <BusinessContext.Provider
      value={{
        currentBusiness,
        setCurrentBusiness: handleSetCurrentBusiness,
        businesses,
        setBusinesses,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusiness must be used within BusinessProvider");
  }
  return context;
}
