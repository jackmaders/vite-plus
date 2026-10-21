import { env } from "cloudflare:workers";
import { beforeAll, beforeEach } from "vite-plus/test";

import { getDb } from "@/shared/db/index.server";
import { user } from "@/shared/db/schema/auth";
import { todos } from "@/shared/db/schema/todos";

interface MigrationEntry {
  name: string;
  queries: string[];
}

interface WorkerTestEnv {
  TEST_MIGRATIONS?: MigrationEntry[];
}

const testEnv = env as unknown as WorkerTestEnv;
const initializedDatabases = new WeakSet<D1Database>();

async function applyMigrations(db: D1Database, migrations: MigrationEntry[]): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS d1_migrations (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );`,
    )
    .run();

  const { results } = await db.prepare("SELECT name FROM d1_migrations;").all<{ name: string }>();
  const appliedNames = new Set(results.map((entry) => entry.name));
  const insertStmt = db.prepare("INSERT INTO d1_migrations (name) VALUES (?);");

  const unapplied = migrations.filter((migration) => !appliedNames.has(migration.name));
  const statements = unapplied.flatMap((migration) => {
    const queryStatements = migration.queries.map((query) => db.prepare(query));
    queryStatements.push(insertStmt.bind(migration.name));
    return queryStatements;
  });

  if (statements.length > 0) {
    await db.batch(statements);
  }
}

async function ensureMigrations(): Promise<void> {
  if (initializedDatabases.has(env.DB)) {
    return;
  }
  if (testEnv.TEST_MIGRATIONS && testEnv.TEST_MIGRATIONS.length > 0) {
    await applyMigrations(env.DB, testEnv.TEST_MIGRATIONS);
  }
  initializedDatabases.add(env.DB);
}

beforeAll(async () => {
  await ensureMigrations();
});

beforeEach(async () => {
  const db = getDb(env.DB);
  await db.delete(todos);
  await db
    .insert(user)
    .values([
      { email: "user-a@example.com", id: "user-a", name: "User A" },
      { email: "user-b@example.com", id: "user-b", name: "User B" },
    ])
    .onConflictDoNothing();
});
