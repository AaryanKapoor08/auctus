"use client";

import dynamic from "next/dynamic";
import { BusinessProvider } from "@/lib/demo/BusinessContext";

const AIChatbot = dynamic(() => import("./AIChatbot"), {
  ssr: false,
  loading: () => null,
});

export default function ChatbotWrapper() {
  return (
    <BusinessProvider>
      <AIChatbot />
    </BusinessProvider>
  );
}
