import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { useDeleteTodo } from "@/pages/todos/api/use-delete-todo";
import { useUpdateTodo } from "@/pages/todos/api/use-update-todo";
import { TodoList } from "@/pages/todos/ui/todo-list";
import { TEST_TODOS } from "@test/vitest/fixtures/todos";

vi.mock(import("@/shared/auth/auth.server"));
vi.mock(import("@/shared/db/db.server"));
vi.mock(import("@/pages/todos/api/use-delete-todo"));
vi.mock(import("@/pages/todos/api/use-update-todo"));

const mockTodos = TEST_TODOS;

describe("todo list empty state", () => {
  beforeEach(() => {
    vi.mocked(useDeleteTodo).mockReturnValue({
      isPending: false,
      mutate: vi.fn<() => void>(),
    } as never);
    vi.mocked(useUpdateTodo).mockReturnValue({
      isPending: false,
      mutate: vi.fn<() => void>(),
    } as never);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders empty state message when todos is empty", () => {
    expect.assertions(1);

    // Arrange & Act
    render(<TodoList todos={[]} />);

    // Assert
    expect(screen.getByText("No todos found")).toBeDefined();
  });
});

describe("todo list items rendering", () => {
  beforeEach(() => {
    vi.mocked(useDeleteTodo).mockReturnValue({
      isPending: false,
      mutate: vi.fn<() => void>(),
    } as never);
    vi.mocked(useUpdateTodo).mockReturnValue({
      isPending: false,
      mutate: vi.fn<() => void>(),
    } as never);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders list of todos", () => {
    expect.assertions(2);

    // Arrange & Act
    render(<TodoList todos={mockTodos} />);

    // Assert
    expect(screen.getByText("First Todo")).toBeDefined();
    expect(screen.getByText("Second Todo")).toBeDefined();
  });

  it("renders custom className on list container", () => {
    expect.assertions(1);

    // Arrange & Act
    render(<TodoList aria-label="Todo list" className="opacity-50" todos={mockTodos} />);

    // Assert
    expect(screen.getByLabelText("Todo list").className).toContain("opacity-50");
  });
});
