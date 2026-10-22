import { and, desc, eq } from "drizzle-orm";

import { todos } from "@/shared/db";
import { getDb, type DbContext } from "@/shared/db/index.server";

import type { CreateTodoInput, UpdateTodoData } from "../model/todo-schema";

interface TodoContext extends DbContext {
  userId: string;
}

async function getTodos({ db = getDb(), userId }: TodoContext) {
  const result = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, userId))
    .orderBy(desc(todos.createdAt));
  return result;
}

async function createTodo(input: CreateTodoInput, { db = getDb(), userId }: TodoContext) {
  const [created] = await db
    .insert(todos)
    .values({
      description: input.description,
      title: input.title.trim(),
      userId,
    })
    .returning();
  if (!created) {
    throw new Error("Failed to create todo");
  }
  return created;
}

async function updateTodo(
  id: string,
  input: UpdateTodoData,
  { db = getDb(), userId }: TodoContext,
) {
  const [updated] = await db
    .update(todos)
    .set(input)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning();
  if (!updated) {
    throw new Error("Todo not found");
  }
  return updated;
}

async function deleteTodo(id: string, { db = getDb(), userId }: TodoContext) {
  const [deleted] = await db
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning();
  if (!deleted) {
    throw new Error("Todo not found");
  }
  return deleted;
}

export { createTodo, deleteTodo, getTodos, updateTodo, type TodoContext };
