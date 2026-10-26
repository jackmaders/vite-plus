import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { useUpdateTodo } from "@/pages/todos/api/use-update-todo";
import { TodoItemSummary } from "@/pages/todos/ui/todo-item-summary";
import type { Todo } from "@/shared/db";
import { TEST_TODO } from "@test/vitest/fixtures/todos";

vi.mock(import("@/pages/todos/api/use-update-todo"));

const mockTodo = TEST_TODO;
const mockUpdateTodo = vi.fn<() => void>();

describe("todo item summary rendering and states", () => {
  beforeEach(() => {
    vi.mocked(useUpdateTodo).mockReturnValue({
      mutate: mockUpdateTodo,
    } as never);
  });

  it("renders todo title, description, and pending badge", () => {
    expect.assertions(3);

    // Arrange & Act
    render(<TodoItemSummary todo={mockTodo} />);

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
    render(<TodoItemSummary todo={completedTodo} />);

    // Assert
    expect(screen.getByText("Test Todo").className).toContain("line-through");
    expect(screen.getByText("Done")).toBeDefined();
  });

  it("does not render description when description is null", () => {
    expect.assertions(1);

    // Arrange
    const todoWithoutDescription: Todo = { ...mockTodo, description: null };

    // Act
    render(<TodoItemSummary todo={todoWithoutDescription} />);

    // Assert
    expect(screen.queryByText("Test Description")).toBeNull();
  });
});

describe("todo item summary interactions", () => {
  beforeEach(() => {
    vi.mocked(useUpdateTodo).mockReturnValue({
      mutate: mockUpdateTodo,
    } as never);
  });

  it("calls updateTodo when checkbox is clicked", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    render(<TodoItemSummary todo={mockTodo} />);

    // Act
    await user.click(screen.getByRole("checkbox", { name: /toggle test todo/iu }));

    // Assert
    expect(mockUpdateTodo).toHaveBeenCalledWith({
      data: { completed: true },
      id: mockTodo.id,
    });
  });
});
