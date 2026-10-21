import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { TodoList, type TodoListProps } from "@/pages/todos/ui/todo-list";
import { TEST_TODOS } from "@test/vitest/fixtures/todos";

type DeleteFn = TodoListProps["onDelete"];
type ToggleFn = TodoListProps["onToggle"];
type UpdateFn = TodoListProps["onUpdate"];

const mockTodos = TEST_TODOS;

describe("todo list empty state with all filter", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders empty state message when filter is all and todos is empty", () => {
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

describe("todo list empty state with active filter", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders empty state message with active filter when todos is empty", () => {
    expect.assertions(1);

    // Arrange
    const handleDelete = vi.fn<DeleteFn>();
    const handleToggle = vi.fn<ToggleFn>();
    const handleUpdate = vi.fn<UpdateFn>();

    // Act
    render(
      <TodoList
        filter="active"
        onDelete={handleDelete}
        onToggle={handleToggle}
        onUpdate={handleUpdate}
        todos={[]}
      />,
    );

    // Assert
    expect(screen.getByText("No active todos found")).toBeDefined();
  });
});

describe("todo list items rendering", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders list of todos and marks updatingId as updating", () => {
    expect.assertions(3);

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
        updatingId="todo-1"
      />,
    );

    // Assert
    expect(screen.getByText("First Todo")).toBeDefined();
    expect(screen.getByText("Second Todo")).toBeDefined();
    expect(
      screen.getByRole("checkbox", { name: /toggle first todo/iu }).getAttribute("aria-disabled"),
    ).toBe("true");
  });
});
