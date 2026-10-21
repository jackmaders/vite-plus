import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/zod";
import type * as z from "zod";

import { user } from "./auth";

const todos = sqliteTable(
  "todos",
  {
    completed: integer("completed", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    description: text("description"),
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title", { length: 256 }).notNull(),
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

const TITLE_MIN_LENGTH = 1;
const ID_MIN_LENGTH = 1;

const refinements = {
  description: (schema: z.ZodString) => schema.trim().nullable().optional(),
  id: (schema: z.ZodString) => schema.trim().min(ID_MIN_LENGTH),
  title: (schema: z.ZodString) => schema.trim().min(TITLE_MIN_LENGTH, "Title is required"),
};

const selectTodoSchema = createSelectSchema(todos, refinements);

const insertTodoSchema = createInsertSchema(todos, refinements).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
  userId: true,
});

const updateTodoSchema = createUpdateSchema(todos, refinements)
  .extend({ id: selectTodoSchema.shape.id })
  .omit({ createdAt: true, updatedAt: true, userId: true });

type Todo = typeof todos.$inferSelect;

export { insertTodoSchema, selectTodoSchema, todos, updateTodoSchema };
export type { Todo };
