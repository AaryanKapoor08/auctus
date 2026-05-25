import type { Metadata } from "next";
import {
  Anton,
  Archivo_Black,
  Bagel_Fat_One,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Providers } from "./providers";
import { getShellContext } from "@/lib/session/shell-context";
import { getFundingSiteStats } from "@/lib/funding/site-stats";
import { buildFundingNewsTickerItems } from "@/lib/funding/site-stats-shared";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const bagel = Bagel_Fat_One({
  variable: "--font-bagel",
  subsets: ["latin"],
  weight: "400",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
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
  const [shellContext, fundingStats] = await Promise.all([
    getShellContext(),
    getFundingSiteStats(),
  ]);
  const tickerItems = buildFundingNewsTickerItems(fundingStats);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${archivoBlack.variable} ${anton.variable} ${bagel.variable} ${jetbrainsMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ErrorBoundary>
          <Providers initialSession={shellContext.session}>
            <Navbar
              initialSession={shellContext.session}
              initialProfile={shellContext.navProfile}
              tickerItems={tickerItems}
            />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <Analytics />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
