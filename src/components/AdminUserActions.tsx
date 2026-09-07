"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/repo";

export default function AdminUserActions({ userId, role }: { userId: string; role: Role }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function changeRole(newRole: Role) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this user and all their data? This cannot be undone.")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1 text-xs">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => changeRole(role === "ADMIN" ? "STUDENT" : "ADMIN")}
          className="text-primary hover:underline disabled:opacity-50 dark:text-indigo-400"
        >
          {role === "ADMIN" ? "Make Student" : "Make Admin"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={handleDelete}
          className="text-red-500 hover:underline disabled:opacity-50"
        >
          Delete
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
