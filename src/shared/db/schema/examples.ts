import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const examples = sqliteTable("examples", {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  description: text("description"),
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

type Example = typeof examples.$inferSelect;
type NewExample = typeof examples.$inferInsert;

export { examples, type Example, type NewExample };
