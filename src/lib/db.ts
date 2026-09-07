import postgres from "postgres";

const globalForSql = globalThis as unknown as { sql?: postgres.Sql };

function createClient(): postgres.Sql {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set on the server");
  // Supabase's pooler (port 6543, pgbouncer transaction mode) doesn't support
  // prepared statements across pooled connections.
  return postgres(url, { prepare: false });
}

export const sql = globalForSql.sql ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForSql.sql = sql;
}

let migrated: Promise<void> | null = null;

/** Idempotent — call before any query that might run against a fresh database. */
export async function ensureSchema(): Promise<void> {
  migrated ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'STUDENT',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        module TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_user_module ON messages(user_id, module)`;
    await sql`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        embedding TEXT,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS exams (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        format TEXT NOT NULL,
        focus TEXT NOT NULL,
        score INT NOT NULL,
        total INT NOT NULL,
        breakdown JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_exams_user ON exams(user_id)`;
    await sql`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        module TEXT NOT NULL,
        question TEXT NOT NULL,
        answer TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id)`;
    await sql`
      CREATE TABLE IF NOT EXISTS user_notes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_notes_user ON user_notes(user_id)`;
    await sql`
      CREATE TABLE IF NOT EXISTS daily_challenge_log (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        challenge_date TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (user_id, challenge_date)
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_daily_challenge_log_user ON daily_challenge_log(user_id)`;
  })();
  return migrated;
}
