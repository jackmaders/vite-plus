import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

// oxlint-disable-next-line import/no-namespace
import * as schema from "./schema";

export function getDb(db: D1Database = env.DB) {
  return drizzle(db, { schema });
}
