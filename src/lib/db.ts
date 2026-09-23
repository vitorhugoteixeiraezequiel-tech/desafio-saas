import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

export type User = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
};

/** Base de conhecimento do negócio (uma por usuário). */
export type Business = {
  user_id: number;
  name: string;
  segment: string;
  tone: string;
  info: string;
  updated_at: string;
};

/** Mensagem de cliente analisada e respondida pela IA. */
export type Reply = {
  id: number;
  user_id: number;
  channel: string;
  customer_message: string;
  intent: string;
  sentiment: string;
  urgency: string;
  summary: string;
  reply: string;
  missing_info: string; // JSON: string[]
  created_at: string;
};

// Reaproveita a conexão entre recarregamentos do servidor em desenvolvimento.
const globalForDb = globalThis as unknown as { db?: DatabaseSync };

// Conexão aberta só no primeiro uso (evita abrir o banco durante o build).
function getDb() {
  if (globalForDb.db) return globalForDb.db;

  const dataDir = path.join(process.cwd(), "data");
  mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, "app.db"), { timeout: 5000 });
  migrate(db);
  globalForDb.db = db;
  return db;
}

function migrate(db: DatabaseSync) {
  db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS businesses (
    user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name       TEXT    NOT NULL,
    segment    TEXT    NOT NULL,
    tone       TEXT    NOT NULL,
    info       TEXT    NOT NULL,
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS replies (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    channel          TEXT    NOT NULL,
    customer_message TEXT    NOT NULL,
    intent           TEXT    NOT NULL,
    sentiment        TEXT    NOT NULL,
    urgency          TEXT    NOT NULL,
    summary          TEXT    NOT NULL,
    reply            TEXT    NOT NULL,
    missing_info     TEXT    NOT NULL DEFAULT '[]',
    created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Tabela da versão anterior (gerador de descrições), não usada mais.
  DROP TABLE IF EXISTS generations;
`);
}

// ---------- Usuários ----------

export function findUserByEmail(email: string) {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined;
}

export function findUserById(id: number) {
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
}

export function createUser(name: string, email: string, passwordHash: string) {
  const result = getDb()
    .prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)")
    .run(name, email, passwordHash);
  return Number(result.lastInsertRowid);
}

export function updateUser(id: number, name: string, email: string) {
  getDb().prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(name, email, id);
}

export function updateUserPassword(id: number, passwordHash: string) {
  getDb().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, id);
}

export function deleteUser(id: number) {
  getDb().prepare("DELETE FROM users WHERE id = ?").run(id);
}

// ---------- Negócio ----------

export function getBusiness(userId: number) {
  return getDb().prepare("SELECT * FROM businesses WHERE user_id = ?").get(userId) as
    | Business
    | undefined;
}

export function saveBusiness(b: Omit<Business, "updated_at">) {
  getDb()
    .prepare(
      `INSERT INTO businesses (user_id, name, segment, tone, info)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         name = excluded.name, segment = excluded.segment, tone = excluded.tone,
         info = excluded.info, updated_at = datetime('now')`,
    )
    .run(b.user_id, b.name, b.segment, b.tone, b.info);
}

// ---------- Respostas ----------

export function createReply(r: Omit<Reply, "id" | "created_at">) {
  getDb()
    .prepare(
      `INSERT INTO replies
         (user_id, channel, customer_message, intent, sentiment, urgency, summary, reply, missing_info)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      r.user_id,
      r.channel,
      r.customer_message,
      r.intent,
      r.sentiment,
      r.urgency,
      r.summary,
      r.reply,
      r.missing_info,
    );
}

export function listReplies(userId: number) {
  return getDb()
    .prepare("SELECT * FROM replies WHERE user_id = ? ORDER BY id DESC LIMIT 50")
    .all(userId) as Reply[];
}

export function deleteReply(id: number, userId: number) {
  getDb().prepare("DELETE FROM replies WHERE id = ? AND user_id = ?").run(id, userId);
}
