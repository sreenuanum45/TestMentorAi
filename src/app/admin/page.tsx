import { getCurrentUser } from "@/lib/auth";
import { listUsersWithMessageCounts } from "@/lib/repo";
import NotesManager from "@/components/NotesManager";
import AdminUserActions from "@/components/AdminUserActions";

export default async function AdminPage() {
  const session = await getCurrentUser();
  const users = await listUsersWithMessageCounts();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <h1 className="text-xl font-semibold">Admin</h1>
      <p className="mt-1 text-sm text-neutral-500">Users and RAG source notes.</p>

      <h2 className="mt-8 mb-3 text-sm font-medium">Users ({users.length})</h2>
      <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
              <th className="px-4 py-2 font-medium">Messages</th>
              <th className="px-4 py-2 font-medium">Joined</th>
              <th className="px-4 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-neutral-100 dark:border-neutral-900 last:border-0">
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      u.role === "ADMIN"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-2">{u.message_count}</td>
                <td className="px-4 py-2 text-neutral-500">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  {session && u.id === session.sub ? (
                    <span className="text-xs text-neutral-400">(you)</span>
                  ) : (
                    <AdminUserActions userId={u.id} role={u.role} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-medium">RAG source notes</h2>
      <NotesManager />
    </div>
  );
}
