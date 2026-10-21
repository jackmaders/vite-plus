import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { TodoList, type TodoListProps } from "@/pages/todos/ui/todo-list";
import { TEST_TODOS } from "@test/vitest/fixtures/todos";

type DeleteFn = TodoListProps["onDelete"];
type ToggleFn = TodoListProps["onToggle"];
type UpdateFn = TodoListProps["onUpdate"];

const mockTodos = TEST_TODOS;

describe("todo list empty state", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders empty state message when todos is empty", () => {
    expect.assertions(1);

    // Arrange
    const handleDelete = vi.fn<DeleteFn>();
    const handleToggle = vi.fn<ToggleFn>();
    const handleUpdate = vi.fn<UpdateFn>();

    // Act
    render(
      <TodoList
        filter="all"
        onDelete={handleDelete}
        onToggle={handleToggle}
        onUpdate={handleUpdate}
        todos={[]}
      />,
    );

    // Assert
    expect(screen.getByText("No todos found")).toBeDefined();
  });
});

describe("todo list items rendering", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders list of todos", () => {
    expect.assertions(2);

    // Arrange
    const handleDelete = vi.fn<DeleteFn>();
    const handleToggle = vi.fn<ToggleFn>();
    const handleUpdate = vi.fn<UpdateFn>();

    // Act
    render(
      <TodoList
        filter="all"
        onDelete={handleDelete}
        onToggle={handleToggle}
        onUpdate={handleUpdate}
        todos={mockTodos}
      />,
    );

    // Assert
    expect(screen.getByText("First Todo")).toBeDefined();
    expect(screen.getByText("Second Todo")).toBeDefined();
  });
});
