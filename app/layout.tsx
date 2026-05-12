import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Providers } from "./providers";
import { getSession } from "@/lib/session/get-session";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auctus - Canadian Funding Discovery",
  description:
    "Browse Canadian grants, scholarships, and research funding, then personalize matches by role.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <Providers initialSession={session}>
            <Navbar initialSession={session} />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
