import Link from "next/link";
import { SearchX } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getSession } from "@/lib/session/get-session";

export default async function NotFound() {
  const session = await getSession();
  const href = session ? "/dashboard" : "/";
  const label = session ? "Back to dashboard" : "Back to home";

  return (
    <main className="auc-page min-h-screen px-6 py-20">
      <Card className="mx-auto max-w-xl text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--auc-lime)]">
          <SearchX className="h-7 w-7 text-[var(--auc-ink)]" />
        </div>
        <p className="auc-label">404</p>
        <h1 className="display mt-2 text-4xl leading-none text-[var(--auc-ink)]">Page not found</h1>
        <p className="mt-3 text-[var(--auc-ink-2)]">
          The page you are looking for does not exist or has moved.
        </p>
        <Link href={href} className="mt-6 inline-flex">
          <Button>{label}</Button>
        </Link>
      </Card>
    </main>
  );
}
