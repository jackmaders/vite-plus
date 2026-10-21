import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it } from "vite-plus/test";

import { todos } from "@/shared/db";
import { getDb } from "@/shared/db/index.server";
import { createEmptyInsertMockDb, resetTestDb, setupTestDb } from "@test/vitest/fixtures/test-db";

import { createTodo, deleteTodo, getTodos, updateTodo } from "../../todos-operations";

describe("todos.server createTodo creation", () => {
  beforeAll(setupTestDb);
  beforeEach(resetTestDb);

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

describe("todos.server createTodo failures", () => {
  beforeAll(setupTestDb);
  beforeEach(resetTestDb);

  it("throws an error when insert returning array is empty", async () => {
    expect.assertions(1);

    // Arrange
    const mockDb = createEmptyInsertMockDb();

    // Act
    const action = createTodo({ title: "Test" }, { db: mockDb, userId: "user-a" });

    // Assert
    await expect(action).rejects.toThrow("Failed to create todo");
  });
});

describe("todos.server getTodos", () => {
  beforeAll(setupTestDb);
  beforeEach(resetTestDb);

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

describe("todos.server updateTodo toggling completed", () => {
  beforeAll(setupTestDb);
  beforeEach(resetTestDb);

  it("toggles the completed status of an existing todo", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    const created = await createTodo({ title: "Toggle test" }, { db, userId: "user-a" });

    // Act
    const toggled = await updateTodo({ completed: true, id: created.id }, { db, userId: "user-a" });

    // Assert
    expect(toggled.id).toBe(created.id);
    expect(toggled.completed).toBe(true);
  });
});

describe("todos.server updateTodo", () => {
  beforeAll(setupTestDb);
  beforeEach(resetTestDb);

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
      {
        description: "Updated description",
        id: created.id,
        title: "Updated title",
      },
      { db, userId: "user-a" },
    );

    // Assert
    expect(updated.title).toBe("Updated title");
    expect(updated.description).toBe("Updated description");
  });
});

describe("todos.server updateTodo error cases", () => {
  beforeAll(setupTestDb);
  beforeEach(resetTestDb);

  it("throws Todo not found when attempting to update another user's todo", async () => {
    expect.assertions(1);

    // Arrange
    const db = getDb(env.DB);
    const todoB = await createTodo({ title: "User B todo" }, { db, userId: "user-b" });

    // Act
    const action = updateTodo(
      { id: todoB.id, title: "Unauthorized update" },
      { db, userId: "user-a" },
    );

    // Assert
    await expect(action).rejects.toThrow("Todo not found");
  });

  it("throws Todo not found when attempting to update a nonexistent todo", async () => {
    expect.assertions(1);

    // Arrange
    const db = getDb(env.DB);

    // Act
    const action = updateTodo(
      { id: "non-existent-id", title: "Non-existent update" },
      { db, userId: "user-a" },
    );

    // Assert
    await expect(action).rejects.toThrow("Todo not found");
  });
});

describe("todos.server deleteTodo", () => {
  beforeAll(setupTestDb);
  beforeEach(resetTestDb);

  it("deletes an existing todo and returns the deleted record", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    const created = await createTodo({ title: "To be deleted" }, { db, userId: "user-a" });

    // Act
    const deleted = await deleteTodo(created.id, { db, userId: "user-a" });
    const remaining = await getTodos({ db, userId: "user-a" });

    // Assert
    expect(deleted.id).toBe(created.id);
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
