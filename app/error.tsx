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
    <main className="auc-page min-h-screen px-6 py-20">
      <Card className="mx-auto max-w-xl text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--auc-coral-soft)]">
          <AlertTriangle className="h-7 w-7 text-[#912f26]" />
        </div>
        <p className="auc-label">Error</p>
        <h1 className="display mt-2 text-4xl leading-none text-[var(--auc-ink)]">Something went wrong</h1>
        <p className="mt-3 text-[var(--auc-ink-2)]">
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
