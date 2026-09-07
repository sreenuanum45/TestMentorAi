import { NotebookPen } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listUserNotes } from "@/lib/repo";
import PageHeader from "@/components/PageHeader";
import PersonalNotesManager from "@/components/PersonalNotesManager";

export default async function NotesPage() {
  const user = await getCurrentUser();
  if (!user) return null; // proxy guards this route

  const notes = await listUserNotes(user.sub);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <PageHeader
        icon={NotebookPen}
        title="Notes"
        description="Your personal scratchpad — jot down anything worth remembering before an interview."
        color="emerald"
      />
      <PersonalNotesManager notes={notes} />
    </div>
  );
}
