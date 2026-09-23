import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";

export type User = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  created_at: string;
};

export type Role = "admin" | "user";

/** Usuário com estatísticas, para a listagem do painel admin. */
export type UserWithStats = Omit<User, "password_hash"> & {
  business_name: string | null;
  replies_count: number;
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

  // DATA_DIR permite usar outro banco (ex.: o de demonstração dos prints).
  const dataDir = path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR || "data");
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
    role          TEXT    NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
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

  // Bancos criados antes do painel admin não têm a coluna "role".
  const columns = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  if (!columns.some((c) => c.name === "role")) {
    db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
  }

  // Garante que exista pelo menos um admin: o usuário mais antigo.
  db.exec(`
    UPDATE users SET role = 'admin'
    WHERE id = (SELECT MIN(id) FROM users)
      AND NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin');
  `);
}

// ---------- Usuários ----------

export function findUserByEmail(email: string) {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined;
}

export function findUserById(id: number) {
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as User | undefined;
}

export function createUser(name: string, email: string, passwordHash: string, role?: Role) {
  // O primeiro usuário cadastrado vira administrador.
  const finalRole = role ?? (countUsers() === 0 ? "admin" : "user");
  const result = getDb()
    .prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)")
    .run(name, email, passwordHash, finalRole);
  return Number(result.lastInsertRowid);
}

export function countUsers() {
  return (getDb().prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n;
}

export function countAdmins() {
  return (getDb().prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'").get() as { n: number }).n;
}

export function listUsersWithStats() {
  return getDb()
    .prepare(
      `SELECT u.id, u.name, u.email, u.role, u.created_at,
              b.name AS business_name,
              (SELECT COUNT(*) FROM replies r WHERE r.user_id = u.id) AS replies_count
       FROM users u
       LEFT JOIN businesses b ON b.user_id = u.id
       ORDER BY u.id`,
    )
    .all() as UserWithStats[];
}

export function updateUser(id: number, name: string, email: string) {
  getDb().prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(name, email, id);
}

export function updateUserRole(id: number, role: Role) {
  getDb().prepare("UPDATE users SET role = ? WHERE id = ?").run(role, id);
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
