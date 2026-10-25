import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/zod";
import type * as z from "zod";

import { user } from "./auth";

const TITLE_MIN_LENGTH = 1;
const TITLE_MAX_LENGTH = 256;
const DESCRIPTION_MAX_LENGTH = 1024;

/**
 * Todo database schema table definition.
 *
 * NOTE on $defaultFn and $onUpdate: In Drizzle ORM, `$defaultFn` and `$onUpdate` are evaluated
 * exclusively within Drizzle ORM query builders (e.g. `db.insert()` and `db.update()`). They do not
 * create SQLite database triggers or native DEFAULT expressions in generated D1 SQL migrations. Any
 * external or non-Drizzle SQL writers must explicitly supply id, createdAt, and updatedAt.
 */
const todos = sqliteTable(
  "todos",
  {
    completed: integer("completed", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    description: text("description", { length: DESCRIPTION_MAX_LENGTH }),
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title", { length: TITLE_MAX_LENGTH }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("todos_user_id_idx").on(table.userId),
    uniqueIndex("todos_user_id_title_unique").on(table.userId, table.title),
  ],
);

/**
 * Raw persisted-record schema. Preserves stored values as-is without write-time string
 * transformations or trimming.
 */
const selectTodoSchema = createSelectSchema(todos);

/**
 * Write refinements applied to input schemas. Title and description are trimmed and constrained to
 * valid length.
 */
const writeRefinements = {
  description: (schema: z.ZodString) =>
    schema
      .trim()
      .max(DESCRIPTION_MAX_LENGTH, "Description must not exceed 1024 characters")
      .nullable()
      .optional(),
  title: (schema: z.ZodString) =>
    schema.trim().min(TITLE_MIN_LENGTH, "Title is required").max(TITLE_MAX_LENGTH),
};

const insertTodoSchema = createInsertSchema(todos, writeRefinements).pick({
  description: true,
  title: true,
});

/**
 * Update schema strictly allowlisting client-writable fields: title, description, completed.
 * Excludes server-owned identity, ownership, and timestamp fields (id, userId, createdAt,
 * updatedAt) as well as any future database columns.
 */
const updateTodoSchema = createUpdateSchema(todos, writeRefinements).pick({
  completed: true,
  description: true,
  title: true,
});

type Todo = typeof todos.$inferSelect;

export { insertTodoSchema, selectTodoSchema, todos, updateTodoSchema };
export type { Todo };
