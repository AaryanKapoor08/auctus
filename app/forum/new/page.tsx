import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { createThread, FORUM_CATEGORIES } from "@/lib/forum/queries";

export default function NewThreadPage() {
  async function submitThread(formData: FormData) {
    "use server";

    const threadId = await createThread(formData);
    redirect(`/forum/${threadId}`);
  }

  return (
    <div className="auc-page min-h-screen py-12">
      <div className="mx-auto max-w-[820px] px-4">
        <Link
          href="/forum"
          className="mono mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.06em] text-[var(--auc-muted)] transition-colors hover:text-[var(--auc-ink)]"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to forum</span>
        </Link>

        <div className="mb-7">
          <h1 className="display text-6xl leading-none tracking-[-0.03em]">Start a thread</h1>
          <p className="mt-4 text-lg leading-8 text-[var(--auc-ink-2)]">
            Keep it specific. The community is most helpful when the title names
            a real funding program or shared question.
          </p>
        </div>

        <Card className="shadow-[6px_6px_0_var(--auc-ink)]">
          <form action={submitThread} className="space-y-5">
            <Input
              name="title"
              label="Title"
              maxLength={120}
              required
              placeholder="What do you want to discuss?"
            />

            <label className="block text-sm font-bold text-[var(--auc-ink)]">
              Category
              <select
                name="category"
                required
                className="auc-field mt-1 w-full px-3 py-2"
              >
                <option value="">Select a category</option>
                {FORUM_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-bold text-[var(--auc-ink)]">
              Content
              <textarea
                name="content"
                required
                rows={10}
                placeholder="Share the context, what you have tried, and what answer would help."
                className="auc-field mt-1 w-full resize-none px-4 py-3"
              />
            </label>

            <Input
              name="tags"
              label="Tags"
              helperText="Optional. Separate up to five tags with commas."
              placeholder="CDAP, Stream 2, Advisor"
            />

            <div className="flex justify-end gap-3 border-t border-[var(--auc-rule)] pt-5">
              <Link href="/forum">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit">Post thread</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
