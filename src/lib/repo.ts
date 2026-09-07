import { randomUUID } from "crypto";
import { sql, ensureSchema } from "@/lib/db";

export type Role = "STUDENT" | "ADMIN";
export type ChatModule = "STUDY" | "MOCK";

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: Role;
  created_at: Date;
}

export interface MessageRow {
  id: string;
  user_id: string;
  module: ChatModule;
  role: "user" | "assistant";
  content: string;
  created_at: Date;
}

export interface NoteRow {
  id: string;
  title: string;
  content: string;
  embedding: string | null;
  updated_at: Date;
  created_at: Date;
}

export type ExamFormat = "MCQ" | "SHORT_ANSWER";

export interface ExamQuestionResult {
  question: string;
  // MCQ only:
  options?: string[];
  correctIndex?: number;
  selectedIndex?: number;
  // SHORT_ANSWER only:
  userAnswer?: string;
  modelAnswer?: string;
  feedback?: string;
  // shared:
  score: number;
  maxScore: number;
  explanation?: string;
}

export interface ExamRow {
  id: string;
  user_id: string;
  format: ExamFormat;
  focus: string;
  score: number;
  total: number;
  breakdown: ExamQuestionResult[];
  created_at: Date;
}

export async function countUsers(): Promise<number> {
  await ensureSchema();
  const rows = await sql<{ n: number }[]>`SELECT COUNT(*)::int as n FROM users`;
  return rows[0]?.n ?? 0;
}

export async function getUserByEmail(email: string): Promise<UserRow | null> {
  await ensureSchema();
  const rows = await sql<UserRow[]>`SELECT * FROM users WHERE email = ${email}`;
  return rows[0] ?? null;
}

export async function getUserById(id: string): Promise<UserRow | null> {
  await ensureSchema();
  const rows = await sql<UserRow[]>`SELECT * FROM users WHERE id = ${id}`;
  return rows[0] ?? null;
}

export async function createUser(
  email: string,
  passwordHash: string,
  role: Role
): Promise<UserRow> {
  await ensureSchema();
  const id = randomUUID();
  await sql`
    INSERT INTO users (id, email, password_hash, role)
    VALUES (${id}, ${email}, ${passwordHash}, ${role})
  `;
  const user = await getUserById(id);
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  await ensureSchema();
  await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${userId}`;
}

export async function updateUserRole(userId: string, role: Role): Promise<void> {
  await ensureSchema();
  await sql`UPDATE users SET role = ${role} WHERE id = ${userId}`;
}

export async function deleteUser(userId: string): Promise<void> {
  await ensureSchema();
  await sql`DELETE FROM users WHERE id = ${userId}`;
}

export async function listUsersWithMessageCounts(): Promise<
  (UserRow & { message_count: number })[]
> {
  await ensureSchema();
  return sql<(UserRow & { message_count: number })[]>`
    SELECT u.*, COUNT(m.id)::int as message_count
    FROM users u
    LEFT JOIN messages m ON m.user_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `;
}

export async function insertMessage(
  userId: string,
  chatModule: ChatModule,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO messages (id, user_id, module, role, content)
    VALUES (${randomUUID()}, ${userId}, ${chatModule}, ${role}, ${content})
  `;
}

export async function getRecentMessages(
  userId: string,
  chatModule: ChatModule,
  limit = 50
): Promise<MessageRow[]> {
  await ensureSchema();
  return sql<MessageRow[]>`
    SELECT * FROM messages
    WHERE user_id = ${userId} AND module = ${chatModule}
    ORDER BY created_at ASC
    LIMIT ${limit}
  `;
}

export async function countMessagesByModule(
  userId: string,
  chatModule: ChatModule
): Promise<number> {
  await ensureSchema();
  const rows = await sql<{ n: number }[]>`
    SELECT COUNT(*)::int as n FROM messages
    WHERE user_id = ${userId} AND module = ${chatModule} AND role = 'user'
  `;
  return rows[0]?.n ?? 0;
}

export async function getActivityByDay(
  userId: string,
  chatModule?: ChatModule,
  limit = 30
): Promise<{ day: string; count: number }[]> {
  await ensureSchema();
  if (chatModule) {
    return sql<{ day: string; count: number }[]>`
      SELECT to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') as day, COUNT(*)::int as count
      FROM messages
      WHERE user_id = ${userId} AND role = 'user' AND module = ${chatModule}
      GROUP BY day
      ORDER BY day DESC
      LIMIT ${limit}
    `;
  }
  return sql<{ day: string; count: number }[]>`
    SELECT to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') as day, COUNT(*)::int as count
    FROM messages
    WHERE user_id = ${userId} AND role = 'user'
    GROUP BY day
    ORDER BY day DESC
    LIMIT ${limit}
  `;
}

export async function listNotes(): Promise<NoteRow[]> {
  await ensureSchema();
  return sql<NoteRow[]>`SELECT * FROM notes ORDER BY updated_at DESC`;
}

export async function getNoteById(id: string): Promise<NoteRow | null> {
  await ensureSchema();
  const rows = await sql<NoteRow[]>`SELECT * FROM notes WHERE id = ${id}`;
  return rows[0] ?? null;
}

export async function createNote(
  title: string,
  content: string,
  embedding: string | null
): Promise<NoteRow> {
  await ensureSchema();
  const id = randomUUID();
  await sql`
    INSERT INTO notes (id, title, content, embedding)
    VALUES (${id}, ${title}, ${content}, ${embedding})
  `;
  const note = await getNoteById(id);
  if (!note) throw new Error("Failed to create note");
  return note;
}

export async function updateNote(
  id: string,
  fields: { title?: string; content?: string; embedding?: string | null }
): Promise<void> {
  await ensureSchema();
  const current = await getNoteById(id);
  if (!current) throw new Error("Note not found");
  await sql`
    UPDATE notes SET
      title = ${fields.title ?? current.title},
      content = ${fields.content ?? current.content},
      embedding = ${fields.embedding !== undefined ? fields.embedding : current.embedding},
      updated_at = now()
    WHERE id = ${id}
  `;
}

export async function deleteNote(id: string): Promise<void> {
  await ensureSchema();
  await sql`DELETE FROM notes WHERE id = ${id}`;
}

export async function createExam(
  userId: string,
  format: ExamFormat,
  focus: string,
  score: number,
  total: number,
  breakdown: ExamQuestionResult[]
): Promise<ExamRow> {
  await ensureSchema();
  const id = randomUUID();
  await sql`
    INSERT INTO exams (id, user_id, format, focus, score, total, breakdown)
    VALUES (${id}, ${userId}, ${format}, ${focus}, ${score}, ${total}, ${JSON.stringify(breakdown)}::jsonb)
  `;
  const exam = await getExamById(id, userId);
  if (!exam) throw new Error("Failed to create exam");
  return exam;
}

// postgres.js doesn't auto-parse this project's jsonb columns back into
// JS values (comes back as the raw JSON string) — normalize defensively
// rather than depend on driver behavior.
function parseExamRow(row: ExamRow): ExamRow {
  return {
    ...row,
    breakdown: typeof row.breakdown === "string" ? JSON.parse(row.breakdown) : row.breakdown,
  };
}

export async function getExamById(id: string, userId: string): Promise<ExamRow | null> {
  await ensureSchema();
  const rows = await sql<ExamRow[]>`SELECT * FROM exams WHERE id = ${id} AND user_id = ${userId}`;
  return rows[0] ? parseExamRow(rows[0]) : null;
}

export async function listExamsForUser(userId: string, limit = 20): Promise<ExamRow[]> {
  await ensureSchema();
  const rows = await sql<ExamRow[]>`
    SELECT * FROM exams WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows.map(parseExamRow);
}

export type BookmarkModule = "STUDY" | "MOCK" | "EXAM";

export interface BookmarkRow {
  id: string;
  user_id: string;
  module: BookmarkModule;
  question: string;
  answer: string | null;
  created_at: Date;
}

export async function createBookmark(
  userId: string,
  bookmarkModule: BookmarkModule,
  question: string,
  answer: string | null
): Promise<BookmarkRow> {
  await ensureSchema();
  const id = randomUUID();
  const rows = await sql<BookmarkRow[]>`
    INSERT INTO bookmarks (id, user_id, module, question, answer)
    VALUES (${id}, ${userId}, ${bookmarkModule}, ${question}, ${answer})
    RETURNING *
  `;
  return rows[0];
}

export async function listBookmarksForUser(userId: string, limit = 200): Promise<BookmarkRow[]> {
  await ensureSchema();
  return sql<BookmarkRow[]>`
    SELECT * FROM bookmarks WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${limit}
  `;
}

export async function countBookmarks(userId: string): Promise<number> {
  await ensureSchema();
  const rows = await sql<{ n: number }[]>`
    SELECT COUNT(*)::int as n FROM bookmarks WHERE user_id = ${userId}
  `;
  return rows[0]?.n ?? 0;
}

/** Scoped to userId so one user can never delete another's bookmark. */
export async function deleteBookmark(id: string, userId: string): Promise<void> {
  await ensureSchema();
  await sql`DELETE FROM bookmarks WHERE id = ${id} AND user_id = ${userId}`;
}

export interface UserNoteRow {
  id: string;
  user_id: string;
  title: string;
  content: string;
  updated_at: Date;
  created_at: Date;
}

export async function listUserNotes(userId: string): Promise<UserNoteRow[]> {
  await ensureSchema();
  return sql<UserNoteRow[]>`
    SELECT * FROM user_notes WHERE user_id = ${userId} ORDER BY updated_at DESC
  `;
}

export async function createUserNote(
  userId: string,
  title: string,
  content: string
): Promise<UserNoteRow> {
  await ensureSchema();
  const id = randomUUID();
  const rows = await sql<UserNoteRow[]>`
    INSERT INTO user_notes (id, user_id, title, content)
    VALUES (${id}, ${userId}, ${title}, ${content})
    RETURNING *
  `;
  return rows[0];
}

/** Scoped to userId so one user can never edit another's note. */
export async function updateUserNote(
  id: string,
  userId: string,
  fields: { title: string; content: string }
): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE user_notes SET title = ${fields.title}, content = ${fields.content}, updated_at = now()
    WHERE id = ${id} AND user_id = ${userId}
  `;
}

/** Scoped to userId so one user can never delete another's note. */
export async function deleteUserNote(id: string, userId: string): Promise<void> {
  await ensureSchema();
  await sql`DELETE FROM user_notes WHERE id = ${id} AND user_id = ${userId}`;
}

export async function hasCompletedDailyChallenge(userId: string, date: string): Promise<boolean> {
  await ensureSchema();
  const rows = await sql<{ id: string }[]>`
    SELECT id FROM daily_challenge_log WHERE user_id = ${userId} AND challenge_date = ${date}
  `;
  return rows.length > 0;
}

export async function markDailyChallengeComplete(userId: string, date: string): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO daily_challenge_log (id, user_id, challenge_date)
    VALUES (${randomUUID()}, ${userId}, ${date})
    ON CONFLICT (user_id, challenge_date) DO NOTHING
  `;
}

export async function getDailyChallengeActivity(
  userId: string,
  limit = 60
): Promise<{ day: string; count: number }[]> {
  await ensureSchema();
  const rows = await sql<{ challenge_date: string }[]>`
    SELECT challenge_date FROM daily_challenge_log
    WHERE user_id = ${userId}
    ORDER BY challenge_date DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({ day: r.challenge_date, count: 1 }));
}

