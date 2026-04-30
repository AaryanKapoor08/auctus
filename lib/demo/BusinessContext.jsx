"use client";

import { createContext, useContext, useState } from "react";
import { getAllBusinesses } from "./data";

const BusinessContext = createContext();
const initialBusinesses = getAllBusinesses();

export function BusinessProvider({ children }) {
  const [businesses, setBusinesses] = useState(initialBusinesses);
  const [currentBusiness, setCurrentBusiness] = useState(
    initialBusinesses[0] ?? null
  );

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
