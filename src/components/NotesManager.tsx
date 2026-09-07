"use client";

import { useEffect, useState } from "react";

interface Note {
  id: string;
  title: string;
  content: string;
  updated_at: string;
}

export default function NotesManager() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    fetch("/api/admin/notes")
      .then((res) => res.json())
      .then((data) => setNotes(data.notes ?? []))
      .catch(() => setError("Failed to load notes"))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create note");
      setNotes((prev) => [data.note, ...prev]);
      setNewTitle("");
      setNewContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(note: Note) {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  }

  async function handleSaveEdit(id: string) {
    setError(null);
    try {
      const res = await fetch(`/api/admin/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save");
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, title: editTitle, content: editContent } : n))
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this note? It will no longer be used for Study Companion context.")) return;
    try {
      const res = await fetch(`/api/admin/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="mb-6 space-y-2 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
        <h3 className="text-sm font-medium">Add a note</h3>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Title (e.g. Cypress Retry Strategy)"
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
        />
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Note content (markdown supported)"
          rows={4}
          className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={creating}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {creating ? "Adding…" : "Add note"}
        </button>
      </form>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
      {loading && <p className="text-sm text-neutral-400">Loading notes…</p>}

      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note.id} className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            {editingId === note.id ? (
              <div className="space-y-2">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveEdit(note.id)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-lg border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium">{note.title}</h4>
                  <div className="flex shrink-0 gap-2 text-sm">
                    <button onClick={() => startEdit(note)} className="text-primary hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(note.id)} className="text-red-500 hover:underline">
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-500 line-clamp-3">
                  {note.content}
                </p>
              </>
            )}
          </div>
        ))}
        {!loading && notes.length === 0 && (
          <p className="text-sm text-neutral-400">No notes yet — add one above.</p>
        )}
      </div>
    </div>
  );
}
