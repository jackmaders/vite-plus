import { env } from "cloudflare:workers";
import { vi } from "vite-plus/test";

import { getDb, type Database } from "@/shared/db/index.server";
import { user } from "@/shared/db/schema/auth";
import { todos } from "@/shared/db/schema/todos";

const migrationFiles = import.meta.glob<string>("../../../drizzle/*/migration.sql", {
  eager: true,
  import: "default",
  query: "?raw",
});

const migrationScript = Object.entries(migrationFiles)
  .toSorted(([firstPath], [secondPath]) => firstPath.localeCompare(secondPath))
  .flatMap(([, content]) =>
    content
      .split("--> statement-breakpoint")
      .map((statement) => statement.replaceAll(/\s+/gu, " ").trim())
      .filter((statement) => statement.length > 0),
  )
  .join("; ");

const initializedDatabases = new WeakSet<D1Database>();

async function setupTestDb(): Promise<void> {
  if (initializedDatabases.has(env.DB)) {
    return;
  }
  await env.DB.exec(migrationScript);
  initializedDatabases.add(env.DB);
}

async function resetTestDb(): Promise<void> {
  const db = getDb(env.DB);
  await db.delete(todos);
  await db
    .insert(user)
    .values([
      { email: "user-a@example.com", id: "user-a", name: "User A" },
      { email: "user-b@example.com", id: "user-b", name: "User B" },
    ])
    .onConflictDoNothing();
}

function createEmptyInsertMockDb(): Database {
  return {
    insert: vi
      .fn<() => { values: () => { returning: () => Promise<unknown[]> } }>()
      .mockReturnValue({
        values: vi.fn<() => { returning: () => Promise<unknown[]> }>().mockReturnValue({
          returning: vi.fn<() => Promise<unknown[]>>().mockResolvedValue([]),
        }),
      }),
  } as unknown as Database;
}

export { createEmptyInsertMockDb, resetTestDb, setupTestDb };
