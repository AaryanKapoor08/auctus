"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-20">
      <Card className="mx-auto max-w-xl border border-gray-200 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-7 w-7 text-red-600" />
        </div>
        <p className="text-sm font-medium uppercase text-gray-500">Error</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Something went wrong</h1>
        <p className="mt-3 text-gray-600">
          The app hit a problem while loading this page.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Link href="/">
            <Button type="button" variant="outline">
              Back to home
            </Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
