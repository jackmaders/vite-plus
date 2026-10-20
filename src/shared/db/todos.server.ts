import { and, desc, eq } from "drizzle-orm";

import type { getDb } from "./db.server";
import { todos, type CreateTodoInput, type UpdateTodoInput } from "./schema/todos";

type Database = ReturnType<typeof getDb>;

async function getTodos(db: Database, userId: string) {
  const result = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, userId))
    .orderBy(desc(todos.createdAt));
  return result;
}

async function createTodo(db: Database, userId: string, input: CreateTodoInput) {
  const [created] = await db
    .insert(todos)
    .values({
      // eslint-disable-next-line unicorn/no-null
      description: input.description ?? null,
      title: input.title.trim(),
      userId,
    })
    .returning();
  if (!created) {
    throw new Error("Failed to create todo");
  }
  return created;
}

// eslint-disable-next-line eslint/max-params
async function toggleTodo(db: Database, userId: string, id: string, completed: boolean) {
  const [updated] = await db
    .update(todos)
    .set({ completed, updatedAt: new Date() })
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning();
  if (!updated) {
    throw new Error("Todo not found");
  }
  return updated;
}

// eslint-disable-next-line eslint/max-params
async function updateTodo(db: Database, userId: string, id: string, input: UpdateTodoInput) {
  const [updated] = await db
    .update(todos)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning();
  if (!updated) {
    throw new Error("Todo not found");
  }
  return updated;
}

async function deleteTodo(db: Database, userId: string, id: string) {
  const [deleted] = await db
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning();
  if (!deleted) {
    throw new Error("Todo not found");
  }
  return deleted;
}

export { createTodo, deleteTodo, getTodos, toggleTodo, updateTodo, type Database };
