import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { useDeleteTodo } from "@/pages/todos/api/use-delete-todo";
import { useUpdateTodo } from "@/pages/todos/api/use-update-todo";
import { TodoItem } from "@/pages/todos/ui/todo-item";
import type { Todo } from "@/shared/db";
import { TEST_TODO } from "@test/vitest/fixtures/todos";

vi.mock(import("@/shared/auth/auth.server"));
vi.mock(import("@/shared/db/db.server"));
vi.mock(import("@/pages/todos/api/use-delete-todo"));
vi.mock(import("@/pages/todos/api/use-update-todo"));

const mockTodo = TEST_TODO;

describe("todo item display", () => {
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

  it("renders todo title, description, and pending status", () => {
    expect.assertions(3);

    // Arrange & Act
    render(<TodoItem todo={mockTodo} />);

    // Assert
    expect(screen.getByText("Test Todo")).toBeDefined();
    expect(screen.getByText("Test Description")).toBeDefined();
    expect(screen.getByText("Pending")).toBeDefined();
  });

  it("renders completed todo with line-through style and done badge", () => {
    expect.assertions(2);

    // Arrange
    const completedTodo: Todo = { ...mockTodo, completed: true };

    // Act
    render(<TodoItem todo={completedTodo} />);

    // Assert
    expect(screen.getByText("Test Todo").className).toContain("line-through");
    expect(screen.getByText("Done")).toBeDefined();
  });

  it("renders custom className on Card container", () => {
    expect.assertions(1);

    // Arrange & Act
    render(<TodoItem aria-label="Todo item" className="opacity-50" todo={mockTodo} />);

    // Assert
    expect(screen.getByLabelText("Todo item").className).toContain("opacity-50");
  });
});
