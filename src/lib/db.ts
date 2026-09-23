import "server-only";
import { createClient, type Client, type InStatement, type ResultSet } from "@libsql/client";
import bcrypt from "bcryptjs";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, DEMO_REPLIES } from "./demo-data.ts";
import { mkdirSync } from "node:fs";
import path from "node:path";

export type Role = "admin" | "user";

export type User = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  created_at: string;
};

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

// ---------- Conexão ----------
//
// Em produção (Vercel) usa o Turso, um SQLite na nuvem, via TURSO_DATABASE_URL.
// Localmente, sem essa variável, usa um arquivo SQLite em ./data (zero configuração).

function createDb() {
  const url = process.env.TURSO_DATABASE_URL;
  if (url) return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });

  // DATA_DIR permite usar outro banco local (ex.: o de demonstração dos prints).
  const dataDir = path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR || "data");
  mkdirSync(dataDir, { recursive: true });
  return createClient({ url: "file:" + path.join(dataDir, "app.db").replaceAll("\\", "/") });
}

// Reaproveita a conexão (e a migração) entre recarregamentos em desenvolvimento.
const globalForDb = globalThis as unknown as { db?: Client; ready?: Promise<void> };

async function getDb() {
  globalForDb.db ??= createDb();
  const db = globalForDb.db;
  globalForDb.ready ??= (async () => {
    await migrate(db);
    // No site de demonstração, cria as contas de exemplo se o banco estiver vazio.
    if (process.env.DEMO_SEED === "1") await seedDemo(db);
  })().catch((err) => {
    globalForDb.ready = undefined; // tenta de novo na próxima chamada
    throw err;
  });
  await globalForDb.ready;
  return globalForDb.db;
}

async function migrate(db: Client) {
  await db.executeMultiple(`
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

    CREATE INDEX IF NOT EXISTS replies_user_id ON replies(user_id);

    -- Tabela da versão anterior (gerador de descrições), não usada mais.
    DROP TABLE IF EXISTS generations;
  `);

  // Bancos criados antes do painel admin não têm a coluna "role".
  const columns = await db.execute("PRAGMA table_info(users)");
  if (!columns.rows.some((c) => c.name === "role")) {
    await db.execute("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
  }

  // Garante que exista pelo menos um admin: o usuário mais antigo.
  await db.execute(`
    UPDATE users SET role = 'admin'
    WHERE id = (SELECT MIN(id) FROM users)
      AND NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin')
  `);
}

/** Cria as contas e dados de demonstração que ainda não existirem. */
export async function seedDemo(db?: Client) {
  const client = db ?? (await getDb());
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const acc of DEMO_ACCOUNTS) {
    const found = await client.execute({ sql: "SELECT id FROM users WHERE email = ?", args: [acc.email] });
    if (found.rows.length > 0) continue;

    const res = await client.execute({
      sql: "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      args: [acc.name, acc.email, hash, acc.role],
    });
    const userId = Number(res.lastInsertRowid);

    if (acc.business) {
      const b = acc.business;
      await client.execute({
        sql: "INSERT INTO businesses (user_id, name, segment, tone, info) VALUES (?, ?, ?, ?, ?)",
        args: [userId, b.name, b.segment, b.tone, b.info],
      });
    }
    if (acc.role === "admin") {
      await client.batch(
        DEMO_REPLIES.map((r) => ({
          sql: `INSERT INTO replies
                  (user_id, channel, customer_message, intent, sentiment, urgency, summary, reply, missing_info)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            userId,
            r.channel,
            r.customer_message,
            r.intent,
            r.sentiment,
            r.urgency,
            r.summary,
            r.reply,
            JSON.stringify(r.missing_info),
          ],
        })),
        "write",
      );
    }
  }
}

// ---------- Helpers ----------

/** Converte as linhas do libSQL em objetos simples. */
function rows<T>(result: ResultSet): T[] {
  return result.rows.map(
    (row) => Object.fromEntries(result.columns.map((col) => [col, row[col]])) as T,
  );
}

async function all<T>(stmt: InStatement) {
  return rows<T>(await (await getDb()).execute(stmt));
}

async function first<T>(stmt: InStatement) {
  return (await all<T>(stmt))[0] as T | undefined;
}

async function run(stmt: InStatement) {
  return (await getDb()).execute(stmt);
}

// ---------- Usuários ----------

export function findUserByEmail(email: string) {
  return first<User>({ sql: "SELECT * FROM users WHERE email = ?", args: [email] });
}

export function findUserById(id: number) {
  return first<User>({ sql: "SELECT * FROM users WHERE id = ?", args: [id] });
}

export async function countUsers() {
  return (await first<{ n: number }>("SELECT COUNT(*) AS n FROM users"))!.n;
}

export async function countAdmins() {
  return (await first<{ n: number }>("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'"))!.n;
}

export async function createUser(name: string, email: string, passwordHash: string, role?: Role) {
  // O primeiro usuário cadastrado vira administrador.
  const finalRole = role ?? ((await countUsers()) === 0 ? "admin" : "user");
  const result = await run({
    sql: "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    args: [name, email, passwordHash, finalRole],
  });
  return Number(result.lastInsertRowid);
}

export function listUsersWithStats() {
  return all<UserWithStats>(`
    SELECT u.id, u.name, u.email, u.role, u.created_at,
           b.name AS business_name,
           (SELECT COUNT(*) FROM replies r WHERE r.user_id = u.id) AS replies_count
    FROM users u
    LEFT JOIN businesses b ON b.user_id = u.id
    ORDER BY u.id
  `);
}

export async function updateUser(id: number, name: string, email: string) {
  await run({ sql: "UPDATE users SET name = ?, email = ? WHERE id = ?", args: [name, email, id] });
}

export async function updateUserRole(id: number, role: Role) {
  await run({ sql: "UPDATE users SET role = ? WHERE id = ?", args: [role, id] });
}

export async function updateUserPassword(id: number, passwordHash: string) {
  await run({ sql: "UPDATE users SET password_hash = ? WHERE id = ?", args: [passwordHash, id] });
}

export async function deleteUser(id: number) {
  // Apaga os dados relacionados explicitamente (não depende de PRAGMA foreign_keys,
  // que não fica ativo entre requisições no banco remoto).
  await (await getDb()).batch(
    [
      { sql: "DELETE FROM replies WHERE user_id = ?", args: [id] },
      { sql: "DELETE FROM businesses WHERE user_id = ?", args: [id] },
      { sql: "DELETE FROM users WHERE id = ?", args: [id] },
    ],
    "write",
  );
}

// ---------- Negócio ----------

export function getBusiness(userId: number) {
  return first<Business>({ sql: "SELECT * FROM businesses WHERE user_id = ?", args: [userId] });
}

export async function saveBusiness(b: Omit<Business, "updated_at">) {
  await run({
    sql: `INSERT INTO businesses (user_id, name, segment, tone, info)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            name = excluded.name, segment = excluded.segment, tone = excluded.tone,
            info = excluded.info, updated_at = datetime('now')`,
    args: [b.user_id, b.name, b.segment, b.tone, b.info],
  });
}

// ---------- Respostas ----------

export async function createReply(r: Omit<Reply, "id" | "created_at">) {
  await run({
    sql: `INSERT INTO replies
            (user_id, channel, customer_message, intent, sentiment, urgency, summary, reply, missing_info)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      r.user_id,
      r.channel,
      r.customer_message,
      r.intent,
      r.sentiment,
      r.urgency,
      r.summary,
      r.reply,
      r.missing_info,
    ],
  });
}

export function listReplies(userId: number) {
  return all<Reply>({
    sql: "SELECT * FROM replies WHERE user_id = ? ORDER BY id DESC LIMIT 50",
    args: [userId],
  });
}

export async function deleteReply(id: number, userId: number) {
  await run({ sql: "DELETE FROM replies WHERE id = ? AND user_id = ?", args: [id, userId] });
}
