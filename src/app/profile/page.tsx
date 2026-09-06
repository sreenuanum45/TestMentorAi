import { getCurrentUser } from "@/lib/auth";
import { countMessagesByModule, listExamsForUser } from "@/lib/repo";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null; // proxy guards this route

  const [studyCount, mockCount, exams] = await Promise.all([
    countMessagesByModule(user.sub, "STUDY"),
    countMessagesByModule(user.sub, "MOCK"),
    listExamsForUser(user.sub, 100),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <h1 className="text-xl font-semibold">Profile</h1>

      <div className="mt-6 flex items-center gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-semibold text-white">
          {user.email[0]?.toUpperCase()}
        </span>
        <div>
          <p className="font-medium">{user.email}</p>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${
              user.role === "ADMIN"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            }`}
          >
            {user.role === "ADMIN" ? "Admin" : "Student"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 text-center">
          <div className="text-2xl font-bold">{studyCount}</div>
          <div className="text-xs text-neutral-500">Study questions</div>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 text-center">
          <div className="text-2xl font-bold">{mockCount}</div>
          <div className="text-xs text-neutral-500">Mock interview turns</div>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 text-center">
          <div className="text-2xl font-bold">{exams.length}</div>
          <div className="text-xs text-neutral-500">Exams taken</div>
        </div>
      </div>
    </div>
  );
}
