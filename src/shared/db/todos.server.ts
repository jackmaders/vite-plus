import { and, desc, eq } from "drizzle-orm";

import { getDb } from "./db.server";
import { todos, type CreateTodoInput, type UpdateTodoInput } from "./schema/todos";

type Database = ReturnType<typeof getDb>;

const EMPTY_LENGTH = 0;

interface TodoContext {
  db?: Database | undefined;
  userId?: string | undefined;
}

function getWhereClause(id: string, userId: string | undefined) {
  if (typeof userId === "string" && userId.length > EMPTY_LENGTH) {
    return and(eq(todos.id, id), eq(todos.userId, userId));
  }
  return eq(todos.id, id);
}

async function getTodos({ db = getDb(), userId }: TodoContext = {}) {
  const query = db.select().from(todos);
  if (typeof userId === "string" && userId.length > EMPTY_LENGTH) {
    const result = await query.where(eq(todos.userId, userId)).orderBy(desc(todos.createdAt));
    return result;
  }
  const result = await query.orderBy(desc(todos.createdAt));
  return result;
}

async function createTodo(input: CreateTodoInput, { db = getDb(), userId }: TodoContext = {}) {
  if (typeof userId !== "string" || userId.trim().length === EMPTY_LENGTH) {
    throw new Error("User ID is required to create a todo");
  }
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

async function toggleTodo(
  id: string,
  completed: boolean,
  { db = getDb(), userId }: TodoContext = {},
) {
  const whereClause = getWhereClause(id, userId);
  const [updated] = await db
    .update(todos)
    .set({ completed, updatedAt: new Date() })
    .where(whereClause)
    .returning();
  if (!updated) {
    throw new Error("Todo not found");
  }
  return updated;
}

async function updateTodo(
  id: string,
  input: UpdateTodoInput,
  { db = getDb(), userId }: TodoContext = {},
) {
  const whereClause = getWhereClause(id, userId);
  const [updated] = await db
    .update(todos)
    .set({ ...input, updatedAt: new Date() })
    .where(whereClause)
    .returning();
  if (!updated) {
    throw new Error("Todo not found");
  }
  return updated;
}

async function deleteTodo(id: string, { db = getDb(), userId }: TodoContext = {}) {
  const whereClause = getWhereClause(id, userId);
  const [deleted] = await db.delete(todos).where(whereClause).returning();
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
