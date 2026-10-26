import { applyD1Migrations, type D1Migration } from "cloudflare:test";
import { env } from "cloudflare:workers";
import { afterEach, beforeAll } from "vite-plus/test";

import { todos } from "@/shared/db";
import { getDb } from "@/shared/db/index.server";
import { rateLimit, user } from "@/shared/db/schema";

const testEnv = env as unknown as {
  TEST_MIGRATIONS?: D1Migration[];
};

beforeAll(async () => {
  await applyD1Migrations(env.DB, testEnv.TEST_MIGRATIONS ?? []);
});

afterEach(async () => {
  const db = getDb(env.DB);
  await db.delete(todos);
  await db.delete(user);
  await db.delete(rateLimit);
});
