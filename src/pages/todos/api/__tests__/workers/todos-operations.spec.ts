import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { todos } from "@/shared/db";
import { getDb } from "@/shared/db/index.server";
import { user } from "@/shared/db/schema";
import { DependencyError, NotFoundError } from "@/shared/errors";
import { createEmptyInsertMockDb } from "@test/vitest/fixtures/db";

import { createTodo, deleteTodo, getTodos, updateTodo } from "../../todos-operations";

beforeEach(async () => {
  const db = getDb(env.DB);
  await db
    .insert(user)
    .values([
      { email: "user-a@example.com", id: "user-a", name: "User A" },
      { email: "user-b@example.com", id: "user-b", name: "User B" },
    ])
    .onConflictDoNothing();
});

describe("todos-operations createTodo creation", () => {
  it("creates a new todo with defaults and trimmed title for user", async () => {
    expect.assertions(3);

    // Arrange
    const db = getDb(env.DB);
    const input = { description: "Wipe counters", title: "  Clean kitchen  " };

    // Act
    const created = await createTodo(input, { db, userId: "user-a" });

    // Assert
    expect(created).toMatchObject({
      completed: false,
      description: "Wipe counters",
      title: "Clean kitchen",
      userId: "user-a",
    });
    expect(created.createdAt).toBeInstanceOf(Date);
    expect(created.updatedAt).toBeInstanceOf(Date);
  });

  it("creates a new todo with null description when omitted", async () => {
    expect.assertions(1);

    // Arrange
    const db = getDb(env.DB);
    const input = { title: "Simple task" };

    // Act
    const created = await createTodo(input, { db, userId: "user-a" });

    // Assert
    expect(created.description).toBeNull();
  });
});

describe("todos-operations createTodo failures", () => {
  it("translates a real D1 constraint failure and retains its cause", async () => {
    expect.assertions(3);

    // Arrange
    const db = getDb(env.DB);

    // Act
    const failure = await createTodo({ title: "Orphan" }, { db, userId: "missing-user" }).catch(
      (error: unknown) => error,
    );

    // Assert
    expect(failure).toBeInstanceOf(DependencyError);
    expect(failure).toMatchObject({
      cause: expect.any(Error) as unknown,
      code: "TODO_CREATE_FAILED",
    });
    expect(failure).toHaveProperty("message", "Unable to save your todo. Please try again.");
  });

  it("throws an error when insert returning array is empty", async () => {
    expect.assertions(1);

    // Arrange
    const mockDb = createEmptyInsertMockDb();

    // Act
    const action = createTodo({ title: "Test" }, { db: mockDb, userId: "user-a" });

    // Assert
    await expect(action).rejects.toMatchObject({
      code: "TODO_CREATE_EMPTY",
      name: "UnexpectedError",
    });
  });
});

describe("database dependency failures", () => {
  it.each([
    {
      code: "TODOS_READ_FAILED",
      operation: "list",
      run: async (db: ReturnType<typeof getDb>) => await getTodos({ db, userId: "user-a" }),
    },
    {
      code: "TODO_UPDATE_FAILED",
      operation: "update",
      run: async (db: ReturnType<typeof getDb>) =>
        await updateTodo("missing", { completed: true }, { db, userId: "user-a" }),
    },
    {
      code: "TODO_DELETE_FAILED",
      operation: "delete",
      run: async (db: ReturnType<typeof getDb>) =>
        await deleteTodo("missing", { db, userId: "user-a" }),
    },
  ])("translates a real D1 failure during $operation", async ({ code, run }) => {
    expect.assertions(2);
    // Arrange
    const db = getDb(env.DB);
    const prepare = vi.spyOn(env.DB, "prepare").mockImplementationOnce(() => {
      throw new Error("D1 driver failed");
    });

    // Act
    const failure = await run(db).catch((error: unknown) => error);
    prepare.mockRestore();

    // Assert
    expect(failure).toBeInstanceOf(DependencyError);
    expect(failure).toMatchObject({ cause: expect.any(Error) as unknown, code });
  });
});

describe("todos-operations getTodos", () => {
  it("returns todos for user ordered by createdAt descending", async () => {
    expect.assertions(3);

    // Arrange
    const db = getDb(env.DB);
    const first = await createTodo({ title: "First todo" }, { db, userId: "user-a" });
    await db
      .update(todos)
      .set({ createdAt: new Date(Date.now() - 10_000) })
      .where(eq(todos.id, first.id));
    const second = await createTodo({ title: "Second todo" }, { db, userId: "user-a" });

    // Act
    const results = await getTodos({ db, userId: "user-a" });

    // Assert
    expect(results).toHaveLength(2);
    expect(results[0]?.id).toBe(second.id);
    expect(results[1]?.id).toBe(first.id);
  });

  it("does not return todos belonging to another user", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    await createTodo({ title: "User B todo" }, { db, userId: "user-b" });
    const userATodo = await createTodo({ title: "User A todo" }, { db, userId: "user-a" });

    // Act
    const results = await getTodos({ db, userId: "user-a" });

    // Assert
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe(userATodo.id);
  });
});

describe("todos-operations updateTodo toggling completed", () => {
  it("toggles the completed status of an existing todo", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    const created = await createTodo({ title: "Toggle test" }, { db, userId: "user-a" });

    // Act
    const toggled = await updateTodo(created.id, { completed: true }, { db, userId: "user-a" });

    // Assert
    expect(toggled.id).toBe(created.id);
    expect(toggled.completed).toBe(true);
  });
});

describe("todos-operations updateTodo", () => {
  it("updates title and description of an existing todo", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    const created = await createTodo(
      {
        description: "Initial description",
        title: "Initial title",
      },
      { db, userId: "user-a" },
    );

    // Act
    const updated = await updateTodo(
      created.id,
      {
        description: "Updated description",
        title: "Updated title",
      },
      { db, userId: "user-a" },
    );

    // Assert
    expect(updated.title).toBe("Updated title");
    expect(updated.description).toBe("Updated description");
  });
});

describe("todos-operations updateTodo error cases", () => {
  it("throws Todo not found when attempting to update another user's todo", async () => {
    expect.assertions(1);

    // Arrange
    const db = getDb(env.DB);
    const todoB = await createTodo({ title: "User B todo" }, { db, userId: "user-b" });

    // Act
    const action = updateTodo(todoB.id, { title: "Unauthorized update" }, { db, userId: "user-a" });

    // Assert
    await expect(action).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws Todo not found when attempting to update a nonexistent todo", async () => {
    expect.assertions(1);

    // Arrange
    const db = getDb(env.DB);

    // Act
    const action = updateTodo(
      "non-existent-id",
      { title: "Non-existent update" },
      { db, userId: "user-a" },
    );

    // Assert
    await expect(action).rejects.toThrow("Todo not found");
  });
});

describe("todos-operations deleteTodo", () => {
  it("deletes an existing todo and returns the deleted record", async () => {
    expect.assertions(1);

    // Arrange
    const db = getDb(env.DB);
    const created = await createTodo({ title: "To be deleted" }, { db, userId: "user-a" });

    // Act
    const deleted = await deleteTodo(created.id, { db, userId: "user-a" });

    // Assert
    expect(deleted.id).toBe(created.id);
  });

  it("removes the deleted record from the database", async () => {
    expect.assertions(1);

    // Arrange
    const db = getDb(env.DB);
    const created = await createTodo({ title: "To be deleted" }, { db, userId: "user-a" });

    // Act
    await deleteTodo(created.id, { db, userId: "user-a" });
    const remaining = await db.select().from(todos).where(eq(todos.id, created.id));

    // Assert
    expect(remaining).toHaveLength(0);
  });

  it("throws Todo not found when attempting to delete another user's todo", async () => {
    expect.assertions(1);

    // Arrange
    const db = getDb(env.DB);
    const todoB = await createTodo({ title: "User B todo" }, { db, userId: "user-b" });

    // Act
    const action = deleteTodo(todoB.id, { db, userId: "user-a" });

    // Assert
    await expect(action).rejects.toThrow("Todo not found");
  });

  it("throws Todo not found when attempting to delete a nonexistent todo", async () => {
    expect.assertions(1);

    // Arrange
    const db = getDb(env.DB);

    // Act
    const action = deleteTodo("non-existent-id", { db, userId: "user-a" });

    // Assert
    await expect(action).rejects.toThrow("Todo not found");
  });
});
