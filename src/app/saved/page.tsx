import { Bookmark } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listBookmarksForUser } from "@/lib/repo";
import PageHeader from "@/components/PageHeader";
import SavedItemsList from "@/components/SavedItemsList";

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) return null; // proxy guards this route

  const bookmarks = await listBookmarksForUser(user.sub);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <PageHeader
        icon={Bookmark}
        title="Saved"
        description="Questions and answers you've bookmarked from Study Companion, Mock Interviewer, and Timed Exams."
        color="rose"
      />
      <SavedItemsList bookmarks={bookmarks} />
    </div>
  );
}
