import { and, desc, eq } from "drizzle-orm";

import { todos } from "@/shared/db";
import { getDb, type DbContext } from "@/shared/db/index.server";
import { DependencyError, NotFoundError, UnexpectedError } from "@/shared/errors";

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
      throw new DependencyError(
        "TODOS_READ_FAILED",
        "Unable to load your todos. Please try again.",
        { cause: error },
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
      throw new DependencyError(
        "TODO_CREATE_FAILED",
        "Unable to save your todo. Please try again.",
        { cause: error },
      );
    });
  if (!created) {
    throw new UnexpectedError("TODO_CREATE_EMPTY", "Something went wrong. Please try again.");
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
      throw new DependencyError(
        "TODO_UPDATE_FAILED",
        "Unable to save your todo. Please try again.",
        { cause: error },
      );
    });
  if (!updated) {
    throw new NotFoundError("TODO_NOT_FOUND", "Todo not found");
  }
  return updated;
}

async function deleteTodo(id: string, { db = getDb(), userId }: TodoContext) {
  const [deleted] = await db
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning()
    .catch((error: unknown) => {
      throw new DependencyError(
        "TODO_DELETE_FAILED",
        "Unable to delete your todo. Please try again.",
        { cause: error },
      );
    });
  if (!deleted) {
    throw new NotFoundError("TODO_NOT_FOUND", "Todo not found");
  }
  return deleted;
}

export { createTodo, deleteTodo, getTodos, updateTodo, type TodoContext };
