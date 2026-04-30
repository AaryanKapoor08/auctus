import type { ReactNode } from "react";
import { BusinessProvider } from "@/lib/demo/BusinessContext";

export default function DemoLayout({ children }: { children: ReactNode }) {
  return <BusinessProvider>{children}</BusinessProvider>;
}
