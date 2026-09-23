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

export type Generation = {
  id: number;
  user_id: number;
  product_name: string;
  details: string;
  tone: string;
  result: string;
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

  CREATE TABLE IF NOT EXISTS generations (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_name TEXT    NOT NULL,
    details      TEXT    NOT NULL,
    tone         TEXT    NOT NULL,
    result       TEXT    NOT NULL,
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);
}

// ---------- Usuários ----------

export function findUserByEmail(email: string) {
  return getDb().prepare("SELECT * FROM users WHERE email = ?").get(email) as
    | User
    | undefined;
}

export function findUserById(id: number) {
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | User
    | undefined;
}

export function createUser(name: string, email: string, passwordHash: string) {
  const result = getDb().prepare("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)")
    .run(name, email, passwordHash);
  return Number(result.lastInsertRowid);
}

export function updateUser(id: number, name: string, email: string) {
  getDb().prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(
    name,
    email,
    id,
  );
}

export function updateUserPassword(id: number, passwordHash: string) {
  getDb().prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
    passwordHash,
    id,
  );
}

export function deleteUser(id: number) {
  getDb().prepare("DELETE FROM users WHERE id = ?").run(id);
}

// ---------- Gerações de descrição ----------

export function createGeneration(
  g: Omit<Generation, "id" | "created_at">,
) {
  getDb().prepare(
    `INSERT INTO generations (user_id, product_name, details, tone, result)
     VALUES (?, ?, ?, ?, ?)`,
  ).run(g.user_id, g.product_name, g.details, g.tone, g.result);
}

export function listGenerations(userId: number) {
  return getDb().prepare(
      "SELECT * FROM generations WHERE user_id = ? ORDER BY id DESC LIMIT 50",
    )
    .all(userId) as Generation[];
}

export function deleteGeneration(id: number, userId: number) {
  getDb().prepare("DELETE FROM generations WHERE id = ? AND user_id = ?").run(
    id,
    userId,
  );
}
