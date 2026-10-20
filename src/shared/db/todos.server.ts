import { and, desc, eq } from "drizzle-orm";

import { getDb } from "./db.server";
import { todos, type CreateTodoInput, type UpdateTodoInput } from "./schema/todos";

type Database = ReturnType<typeof getDb>;

const EMPTY_LENGTH = 0;

interface TodoContext {
  db?: Database | undefined;
  userId: string;
}

function assertUserId(userId: unknown): asserts userId is string {
  if (typeof userId !== "string" || userId.trim().length === EMPTY_LENGTH) {
    throw new Error("User ID is required");
  }
}

async function getTodos({ db = getDb(), userId }: TodoContext) {
  assertUserId(userId);
  const result = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, userId))
    .orderBy(desc(todos.createdAt));
  return result;
}

async function createTodo(input: CreateTodoInput, { db = getDb(), userId }: TodoContext) {
  assertUserId(userId);
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

async function toggleTodo(id: string, completed: boolean, { db = getDb(), userId }: TodoContext) {
  assertUserId(userId);
  const [updated] = await db
    .update(todos)
    .set({ completed })
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning();
  if (!updated) {
    throw new Error("Todo not found");
  }
  return updated;
}

async function updateTodo(
  id: string,
  input: UpdateTodoInput,
  { db = getDb(), userId }: TodoContext,
) {
  assertUserId(userId);
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
  assertUserId(userId);
  const [deleted] = await db
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning();
  if (!deleted) {
    throw new Error("Todo not found");
  }
  return deleted;
}

export {
  createTodo,
  deleteTodo,
  getTodos,
  toggleTodo,
  updateTodo,
  type Database,
  type TodoContext,
};
