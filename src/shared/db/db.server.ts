import { env } from "cloudflare:workers";
import { defineRelations } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

// oxlint-disable-next-line import/no-namespace
import * as schema from "./schema";

const relations = defineRelations(schema);

export function getDb(db: D1Database = env.DB) {
  return drizzle(db, { relations });
}
