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
    .orderBy(desc(todos.createdAt))
    .catch((error: unknown) => {
      throw new ApplicationError(
        "TODOS_READ_FAILED",
        "Unable to load your todos. Please try again.",
        { cause: error, status: 503 },
      );
    });
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
    .returning()
    .catch((error: unknown) => {
      throw new ApplicationError(
        "TODO_CREATE_FAILED",
        "Unable to save your todo. Please try again.",
        { cause: error, status: 503 },
      );
    });
  if (!created) {
    throw new ApplicationError("TODO_CREATE_EMPTY", "Something went wrong. Please try again.");
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
    .returning()
    .catch((error: unknown) => {
      throw new ApplicationError(
        "TODO_UPDATE_FAILED",
        "Unable to save your todo. Please try again.",
        { cause: error, status: 503 },
      );
    });
  if (!updated) {
    throw new ApplicationError("TODO_NOT_FOUND", "Todo not found", { status: 404 });
  }
  return updated;
}

async function deleteTodo(id: string, { db = getDb(), userId }: TodoContext) {
  const [deleted] = await db
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning()
    .catch((error: unknown) => {
      throw new ApplicationError(
        "TODO_DELETE_FAILED",
        "Unable to delete your todo. Please try again.",
        { cause: error, status: 503 },
      );
    });
  if (!deleted) {
    throw new ApplicationError("TODO_NOT_FOUND", "Todo not found", { status: 404 });
  }
  return deleted;
}

export { createTodo, deleteTodo, getTodos, updateTodo, type TodoContext };
