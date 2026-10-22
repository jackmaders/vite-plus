import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/zod";
import type * as z from "zod";

import { user } from "./auth";

const TITLE_MIN_LENGTH = 1;
const TITLE_MAX_LENGTH = 256;
const DESCRIPTION_MAX_LENGTH = 1024;
const ID_MIN_LENGTH = 1;

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
  (table) => [index("todos_user_id_idx").on(table.userId)],
);

const refinements = {
  description: (schema: z.ZodString) =>
    schema
      .trim()
      .max(DESCRIPTION_MAX_LENGTH, "Description must not exceed 1024 characters")
      .nullable()
      .optional(),
  id: (schema: z.ZodString) => schema.trim().min(ID_MIN_LENGTH),
  title: (schema: z.ZodString) =>
    schema.trim().min(TITLE_MIN_LENGTH, "Title is required").max(TITLE_MAX_LENGTH),
};

const selectTodoSchema = createSelectSchema(todos, refinements);

const insertTodoSchema = createInsertSchema(todos, refinements).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
  userId: true,
});

const updateTodoSchema = createUpdateSchema(todos, refinements).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
  userId: true,
});

type Todo = typeof todos.$inferSelect;

export { insertTodoSchema, selectTodoSchema, todos, updateTodoSchema };
export type { Todo };
