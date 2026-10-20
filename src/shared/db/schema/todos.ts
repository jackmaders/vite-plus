import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-orm/zod";

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
    title: text("title").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("todos_user_id_idx").on(table.userId)],
);

type Todo = typeof todos.$inferSelect;
type NewTodo = typeof todos.$inferInsert;

type CreateTodoInput = Pick<NewTodo, "title"> & {
  description?: string | null | undefined;
};

interface UpdateTodoInput {
  description?: string | null | undefined;
  title?: string | undefined;
}

const selectTodoSchema = createSelectSchema(todos);
const insertTodoSchema = createInsertSchema(todos).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
  userId: true,
});
const updateTodoSchema = insertTodoSchema.partial();

export {
  insertTodoSchema,
  selectTodoSchema,
  todos,
  updateTodoSchema,
  type CreateTodoInput,
  type NewTodo,
  type Todo,
  type UpdateTodoInput,
};
