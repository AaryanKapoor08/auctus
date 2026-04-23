"use client";

import { BusinessProvider } from "@/lib/BusinessContext";
import { ToastProvider } from "@/lib/ToastContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BusinessProvider>
      <ToastProvider>{children}</ToastProvider>
    </BusinessProvider>
  );
}
