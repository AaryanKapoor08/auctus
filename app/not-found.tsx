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
    <main className="min-h-screen bg-gray-50 px-6 py-20">
      <Card className="mx-auto max-w-xl border border-gray-200 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <SearchX className="h-7 w-7 text-gray-700" />
        </div>
        <p className="text-sm font-medium uppercase text-gray-500">404</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-3 text-gray-600">
          The page you are looking for does not exist or has moved.
        </p>
        <Link href={href} className="mt-6 inline-flex">
          <Button>{label}</Button>
        </Link>
      </Card>
    </main>
  );
}
