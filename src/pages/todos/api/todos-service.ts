import { and, desc, eq } from "drizzle-orm";

import { todos } from "@/shared/db";
import { getDb, type DbContext } from "@/shared/db/index.server";
import { ApplicationError } from "@/shared/errors";

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

// Normalization contract:
// Expects input conforming to `CreateTodoInput` (as validated and normalized by `createTodoInputSchema`).
// Direct operations callers must provide a trimmed title. A defensive `title.trim()` is preserved here
// So that callers invoking `createTodo` directly outside of the validated server function pipeline
// Also get normalized titles and consistent unique index conflict behavior.
async function createTodo(input: CreateTodoInput, { db = getDb(), userId }: TodoContext) {
  const [created] = await db
    .insert(todos)
    .values({
      description: input.description,
      title: input.title.trim(),
      userId,
    })
    .onConflictDoNothing({ target: [todos.userId, todos.title] })
    .returning();

  if (!created) {
    throw new ApplicationError("TODO_CREATE_FAILED");
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
    throw new ApplicationError("TODO_NOT_FOUND");
  }

  return updated;
}

async function deleteTodo(id: string, { db = getDb(), userId }: TodoContext) {
  const [deleted] = await db
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning();

  if (!deleted) {
    throw new ApplicationError("TODO_NOT_FOUND");
  }

  return deleted;
}

export { createTodo, deleteTodo, getTodos, updateTodo, type TodoContext };
