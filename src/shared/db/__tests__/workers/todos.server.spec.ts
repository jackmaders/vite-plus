import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import {
  createTodo,
  deleteTodo,
  getDb,
  getTodos,
  toggleTodo,
  updateTodo,
  type Database,
} from "../../index.server";
import { user } from "../../schema/auth";
import { todos } from "../../schema/todos";

async function setupTestDb(): Promise<void> {
  const schemaSql =
    "CREATE TABLE IF NOT EXISTS user (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, email_verified INTEGER DEFAULT false NOT NULL, image TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);" +
    "CREATE TABLE IF NOT EXISTS todos (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE, title TEXT NOT NULL, description TEXT, completed INTEGER DEFAULT false NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);" +
    "CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos (user_id);";
  await env.DB.exec(schemaSql);
}

async function resetTestDb(): Promise<void> {
  const db = getDb(env.DB);
  await db.delete(todos);
  await db
    .insert(user)
    .values([
      { email: "user-a@example.com", id: "user-a", name: "User A" },
      { email: "user-b@example.com", id: "user-b", name: "User B" },
    ])
    .onConflictDoNothing();
}

describe("todos.server createTodo creation", () => {
  beforeAll(setupTestDb);
  beforeEach(resetTestDb);

  it("creates a new todo with defaults and trimmed title for user", async () => {
    expect.assertions(3);

    // Arrange
    const db = getDb(env.DB);
    const input = { description: "Wipe counters", title: "  Clean kitchen  " };

    // Act
    const created = await createTodo(db, "user-a", input);

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
    const created = await createTodo(db, "user-a", input);

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
    const mockDb = {
      insert: vi
        .fn<() => { values: () => { returning: () => Promise<unknown[]> } }>()
        .mockReturnValue({
          values: vi.fn<() => { returning: () => Promise<unknown[]> }>().mockReturnValue({
            returning: vi.fn<() => Promise<unknown[]>>().mockResolvedValue([]),
          }),
        }),
    } as unknown as Database;

    // Act
    const action = createTodo(mockDb, "user-a", { title: "Test" });

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
    const first = await createTodo(db, "user-a", { title: "First todo" });
    await db
      .update(todos)
      .set({ createdAt: new Date(Date.now() - 10_000) })
      .where(eq(todos.id, first.id));
    const second = await createTodo(db, "user-a", { title: "Second todo" });

    // Act
    const results = await getTodos(db, "user-a");

    // Assert
    expect(results).toHaveLength(2);
    expect(results[0]?.id).toBe(second.id);
    expect(results[1]?.id).toBe(first.id);
  });

  it("does not return todos belonging to another user", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    await createTodo(db, "user-b", { title: "User B todo" });
    const userATodo = await createTodo(db, "user-a", { title: "User A todo" });

    // Act
    const results = await getTodos(db, "user-a");

    // Assert
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe(userATodo.id);
  });
});

describe("todos.server toggleTodo", () => {
  beforeAll(setupTestDb);
  beforeEach(resetTestDb);

  it("toggles the completed status of an existing todo", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    const created = await createTodo(db, "user-a", { title: "Toggle test" });

    // Act
    const toggled = await toggleTodo(db, "user-a", created.id, true);

    // Assert
    expect(toggled.id).toBe(created.id);
    expect(toggled.completed).toBe(true);
  });

  it("throws Todo not found when attempting to toggle another user's todo", async () => {
    expect.assertions(1);

    // Arrange
    const db = getDb(env.DB);
    const todoB = await createTodo(db, "user-b", { title: "User B todo" });

    // Act
    const action = toggleTodo(db, "user-a", todoB.id, true);

    // Assert
    await expect(action).rejects.toThrow("Todo not found");
  });

  it("throws Todo not found when attempting to toggle a nonexistent todo", async () => {
    expect.assertions(1);

    // Arrange
    const db = getDb(env.DB);

    // Act
    const action = toggleTodo(db, "user-a", "non-existent-id", true);

    // Assert
    await expect(action).rejects.toThrow("Todo not found");
  });
});

describe("todos.server updateTodo", () => {
  beforeAll(setupTestDb);
  beforeEach(resetTestDb);

  it("updates title and description of an existing todo", async () => {
    expect.assertions(2);

    // Arrange
    const db = getDb(env.DB);
    const created = await createTodo(db, "user-a", {
      description: "Initial description",
      title: "Initial title",
    });

    // Act
    const updated = await updateTodo(db, "user-a", created.id, {
      description: "Updated description",
      title: "Updated title",
    });

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
    const todoB = await createTodo(db, "user-b", { title: "User B todo" });

    // Act
    const action = updateTodo(db, "user-a", todoB.id, { title: "Unauthorized update" });

    // Assert
    await expect(action).rejects.toThrow("Todo not found");
  });

  it("throws Todo not found when attempting to update a nonexistent todo", async () => {
    expect.assertions(1);

    // Arrange
    const db = getDb(env.DB);

    // Act
    const action = updateTodo(db, "user-a", "non-existent-id", { title: "Non-existent update" });

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
    const created = await createTodo(db, "user-a", { title: "To be deleted" });

    // Act
    const deleted = await deleteTodo(db, "user-a", created.id);
    const remaining = await getTodos(db, "user-a");

    // Assert
    expect(deleted.id).toBe(created.id);
    expect(remaining).toHaveLength(0);
  });

  it("throws Todo not found when attempting to delete another user's todo", async () => {
    expect.assertions(1);

    // Arrange
    const db = getDb(env.DB);
    const todoB = await createTodo(db, "user-b", { title: "User B todo" });

    // Act
    const action = deleteTodo(db, "user-a", todoB.id);

    // Assert
    await expect(action).rejects.toThrow("Todo not found");
  });

  it("throws Todo not found when attempting to delete a nonexistent todo", async () => {
    expect.assertions(1);

    // Arrange
    const db = getDb(env.DB);

    // Act
    const action = deleteTodo(db, "user-a", "non-existent-id");

    // Assert
    await expect(action).rejects.toThrow("Todo not found");
  });
});
