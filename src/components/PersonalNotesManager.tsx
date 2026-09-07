"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import type { UserNoteRow } from "@/lib/repo";

export default function PersonalNotesManager({ notes: initialNotes }: { notes: UserNoteRow[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/notes", {
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

  function startEdit(note: UserNoteRow) {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  }

  async function handleSaveEdit(id: string) {
    if (!editTitle.trim() || !editContent.trim()) return;
    setSavingEdit(true);
    setError(null);
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save");
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, title: editTitle, content: editContent, updated_at: new Date() } : n
        )
      );
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div>
      <form
        onSubmit={handleCreate}
        className="mb-6 space-y-2 rounded-xl border border-border-subtle p-4"
      >
        <h3 className="flex items-center gap-1.5 text-sm font-medium">
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add a note
        </h3>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Title (e.g. Retry strategy talking points)"
          className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
        />
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="Write anything you want to remember for your interviews…"
          rows={4}
          className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
        />
        <button
          type="submit"
          disabled={creating || !newTitle.trim() || !newContent.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {creating ? "Adding…" : "Add note"}
        </button>
      </form>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      {notes.length === 0 ? (
        <p className="text-sm text-neutral-400">
          No notes yet — jot down anything you want to remember before your next interview.
        </p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-border-subtle p-4">
              {editingId === note.id ? (
                <div className="space-y-2">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-neutral-300 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(note.id)}
                      disabled={savingEdit}
                      className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                    >
                      {savingEdit ? "Saving…" : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm dark:border-neutral-700"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium">{note.title}</h4>
                    <div className="flex shrink-0 gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => startEdit(note)}
                        className="flex items-center gap-1 text-primary hover:underline dark:text-indigo-400"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(note.id)}
                        className="flex items-center gap-1 text-red-500 hover:underline"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-500">{note.content}</p>
                  <p className="mt-2 text-xs text-neutral-400">
                    Updated {new Date(note.updated_at).toLocaleString()}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
