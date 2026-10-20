import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { ensureSession } from "@/shared/auth/session.server";
import {
  createTodo,
  deleteTodo,
  getDb,
  getTodos,
  toggleTodo,
  updateTodo,
} from "@/shared/db/index.server";
import { TEST_SESSION } from "@test/vitest/fixtures/session";

import {
  createTodoFn,
  deleteTodoFn,
  getTodosFn,
  toggleTodoFn,
  updateTodoFn,
} from "../api/todos.functions";

vi.mock(import("@tanstack/react-start"));
vi.mock(import("@/shared/auth/auth.server"));
vi.mock(import("@/shared/auth/session.server"));
vi.mock(import("@/shared/db/index.server"));
vi.mock(import("@/shared/db/db.server"));

const MOCK_TODO = {
  completed: false,
  createdAt: new Date("2026-10-20T00:00:00Z"),
  description: "Test description",
  id: "todo-1",
  title: "Test todo",
  updatedAt: new Date("2026-10-20T00:00:00Z"),
  userId: TEST_SESSION.user.id,
};

describe("todos functions query handlers", () => {
  beforeEach(() => {
    vi.mocked(ensureSession).mockResolvedValue(TEST_SESSION);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("getTodosFn queries todos for session user and returns result", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(getTodos).mockResolvedValueOnce([MOCK_TODO]);

    // Act
    const result = await getTodosFn();

    // Assert
    expect(getTodos).toHaveBeenCalledWith(getDb(), TEST_SESSION.user.id);
    expect(result).toStrictEqual([MOCK_TODO]);
  });
});

describe("todos functions create and toggle handlers", () => {
  beforeEach(() => {
    vi.mocked(ensureSession).mockResolvedValue(TEST_SESSION);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("createTodoFn creates a todo using validated input", async () => {
    expect.assertions(2);

    // Arrange
    const inputData = { description: "Test desc", title: "Test title" };
    vi.mocked(createTodo).mockResolvedValueOnce(MOCK_TODO);

    // Act
    const result = await createTodoFn({ data: inputData });

    // Assert
    expect(createTodo).toHaveBeenCalledWith(getDb(), TEST_SESSION.user.id, inputData);
    expect(result).toStrictEqual(MOCK_TODO);
  });

  it("toggleTodoFn toggles completed using validated parameters", async () => {
    expect.assertions(2);

    // Arrange
    const toggledTodo = { ...MOCK_TODO, completed: true };
    vi.mocked(toggleTodo).mockResolvedValueOnce(toggledTodo);

    // Act
    const result = await toggleTodoFn({ data: { completed: true, id: MOCK_TODO.id } });

    // Assert
    expect(toggleTodo).toHaveBeenCalledWith(getDb(), TEST_SESSION.user.id, MOCK_TODO.id, true);
    expect(result).toStrictEqual(toggledTodo);
  });
});

describe("todos functions update and delete handlers", () => {
  beforeEach(() => {
    vi.mocked(ensureSession).mockResolvedValue(TEST_SESSION);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("updateTodoFn updates todo using validated input", async () => {
    expect.assertions(2);

    // Arrange
    const updatedTodo = { ...MOCK_TODO, title: "Updated title" };
    vi.mocked(updateTodo).mockResolvedValueOnce(updatedTodo);

    // Act
    const result = await updateTodoFn({
      data: { description: "Updated desc", id: MOCK_TODO.id, title: "Updated title" },
    });

    // Assert
    expect(updateTodo).toHaveBeenCalledWith(getDb(), TEST_SESSION.user.id, MOCK_TODO.id, {
      description: "Updated desc",
      title: "Updated title",
    });
    expect(result).toStrictEqual(updatedTodo);
  });

  it("deleteTodoFn deletes todo using validated id", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(deleteTodo).mockResolvedValueOnce(MOCK_TODO);

    // Act
    const result = await deleteTodoFn({ data: { id: MOCK_TODO.id } });

    // Assert
    expect(deleteTodo).toHaveBeenCalledWith(getDb(), TEST_SESSION.user.id, MOCK_TODO.id);
    expect(result).toStrictEqual(MOCK_TODO);
  });
});

describe("todos api index barrel", () => {
  it("api index barrel exports all server functions", async () => {
    expect.assertions(5);

    // Arrange
    const api = await import("../api/index");

    // Assert
    expect(api.getTodosFn).toBeDefined();
    expect(api.createTodoFn).toBeDefined();
    expect(api.toggleTodoFn).toBeDefined();
    expect(api.updateTodoFn).toBeDefined();
    expect(api.deleteTodoFn).toBeDefined();
  });
});
