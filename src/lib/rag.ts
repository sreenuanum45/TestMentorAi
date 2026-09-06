import fs from "fs";
import path from "path";
import { listNotes, createNote, updateNote, type NoteRow } from "@/lib/repo";
import { embedText, cosineSimilarity } from "@/lib/embeddings";

const SEED_NOTES_DIR = path.join(process.cwd(), "content", "notes");
const MIN_SIMILARITY = 0.3;

export interface ContextMatch {
  title: string;
  snippet: string;
}

let seeded = false;

/** One-time import of the bundled sample notes into the DB, on first use. */
async function ensureSeeded() {
  if (seeded) return;
  seeded = true;
  const existing = await listNotes();
  if (existing.length > 0) return;
  if (!fs.existsSync(SEED_NOTES_DIR)) return;

  for (const file of fs.readdirSync(SEED_NOTES_DIR).filter((f) => f.endsWith(".md"))) {
    const content = fs.readFileSync(path.join(SEED_NOTES_DIR, file), "utf-8");
    const title = file.replace(/\.md$/, "").replace(/-/g, " ");
    await createNote(title, content, null);
  }
}

function keywordFallback(query: string, notes: NoteRow[], maxResults: number): ContextMatch[] {
  const queryWords = Array.from(
    new Set(query.toLowerCase().split(/\W+/).filter((w) => w.length > 3))
  );
  if (queryWords.length === 0) return [];

  return notes
    .map((n) => ({
      note: n,
      score: queryWords.reduce(
        (acc, w) => acc + (n.content.toLowerCase().includes(w) ? 1 : 0),
        0
      ),
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((s) => ({ title: s.note.title, snippet: s.note.content.slice(0, 1200) }));
}

/**
 * Embedding-based retrieval over notes stored in the DB (managed from
 * /admin), with a lazy backfill of missing embeddings and a keyword-match
 * fallback if the embedding API is unavailable.
 */
export async function retrieveContext(query: string, maxResults = 2): Promise<ContextMatch[]> {
  await ensureSeeded();
  const notes = await listNotes();
  if (notes.length === 0) return [];

  try {
    const queryEmbedding = await embedText(query);

    const scored: { note: NoteRow; score: number }[] = [];
    for (const note of notes) {
      let vector: number[];
      if (note.embedding) {
        vector = JSON.parse(note.embedding);
      } else {
        vector = await embedText(note.content);
        await updateNote(note.id, { embedding: JSON.stringify(vector) });
      }
      scored.push({ note, score: cosineSimilarity(queryEmbedding, vector) });
    }

    return scored
      .filter((s) => s.score >= MIN_SIMILARITY)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map((s) => ({ title: s.note.title, snippet: s.note.content.slice(0, 1200) }));
  } catch (err) {
    console.error("Embedding retrieval failed, falling back to keyword match:", err);
    return keywordFallback(query, notes, maxResults);
  }
}
