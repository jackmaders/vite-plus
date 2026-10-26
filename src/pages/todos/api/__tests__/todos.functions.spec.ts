import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { ensureSession } from "@/shared/auth/session.server";
import { TEST_SESSION } from "@test/vitest/fixtures/session";
import { TEST_TODO } from "@test/vitest/fixtures/todos";

import { createTodo, deleteTodo, getTodos, updateTodo } from "../todos-service";
import { createTodoFn, deleteTodoFn, getTodosFn, updateTodoFn } from "../todos.functions";

vi.mock(import("@tanstack/react-start"));
vi.mock(import("@/shared/auth/session.server"));
vi.mock(import("../todos-service"));

const MOCK_TODO = TEST_TODO;

beforeEach(() => {
  vi.mocked(ensureSession).mockResolvedValue(TEST_SESSION);
});

describe("todos functions getTodosFn", () => {
  it("getTodosFn returns todos array for authenticated user", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(getTodos).mockResolvedValueOnce([MOCK_TODO]);

    // Act
    const result = await getTodosFn();

    // Assert
    expect(getTodos).toHaveBeenCalledWith({ userId: TEST_SESSION.user.id });
    expect(result).toStrictEqual([MOCK_TODO]);
  });
});

describe("todos functions createTodoFn", () => {
  it("createTodoFn creates todo using validated input", async () => {
    expect.assertions(2);

    // Arrange
    const inputData = { description: "Test desc", title: "Test todo" };
    vi.mocked(createTodo).mockResolvedValueOnce(MOCK_TODO);

    // Act
    const result = await createTodoFn({ data: inputData });

    // Assert
    expect(createTodo).toHaveBeenCalledWith(inputData, { userId: TEST_SESSION.user.id });
    expect(result).toStrictEqual(MOCK_TODO);
  });
});

describe("todos functions updateTodoFn fields", () => {
  it("updateTodoFn updates todo using validated input", async () => {
    expect.assertions(2);

    // Arrange
    const updatedTodo = { ...MOCK_TODO, title: "Updated title" };
    vi.mocked(updateTodo).mockResolvedValueOnce(updatedTodo);

    // Act
    const result = await updateTodoFn({
      data: {
        data: { description: "Updated desc", title: "Updated title" },
        id: MOCK_TODO.id,
      },
    });

    // Assert
    expect(updateTodo).toHaveBeenCalledWith(
      MOCK_TODO.id,
      {
        description: "Updated desc",
        title: "Updated title",
      },
      { userId: TEST_SESSION.user.id },
    );
    expect(result).toStrictEqual(updatedTodo);
  });
});

describe("todos functions updateTodoFn completed toggle", () => {
  it("updateTodoFn updates completed status when toggled", async () => {
    expect.assertions(2);

    // Arrange
    const toggledTodo = { ...MOCK_TODO, completed: true };
    vi.mocked(updateTodo).mockResolvedValueOnce(toggledTodo);

    // Act
    const result = await updateTodoFn({
      data: {
        data: { completed: true },
        id: MOCK_TODO.id,
      },
    });

    // Assert
    expect(updateTodo).toHaveBeenCalledWith(
      MOCK_TODO.id,
      {
        completed: true,
      },
      { userId: TEST_SESSION.user.id },
    );
    expect(result).toStrictEqual(toggledTodo);
  });
});

describe("todos functions deleteTodoFn", () => {
  it("deleteTodoFn deletes todo using validated id", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(deleteTodo).mockResolvedValueOnce(MOCK_TODO);

    // Act
    const result = await deleteTodoFn({ data: { id: MOCK_TODO.id } });

    // Assert
    expect(deleteTodo).toHaveBeenCalledWith(MOCK_TODO.id, { userId: TEST_SESSION.user.id });
    expect(result).toStrictEqual(MOCK_TODO);
  });
});
