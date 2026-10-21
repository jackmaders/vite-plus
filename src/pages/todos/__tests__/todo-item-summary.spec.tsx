import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { TodoItemSummary, type TodoItemSummaryProps } from "@/pages/todos/ui/todo-item-summary";
import type { Todo } from "@/shared/db";
import { TEST_TODO } from "@test/vitest/fixtures/todos";

type ToggleFn = TodoItemSummaryProps["onToggle"];

const mockTodo = TEST_TODO;

describe("todo item summary rendering and states", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders todo title, description, and pending badge", () => {
    expect.assertions(3);

    // Arrange
    const handleToggle = vi.fn<ToggleFn>();

    // Act
    render(<TodoItemSummary onToggle={handleToggle} todo={mockTodo} />);

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
    render(<TodoItemSummary onToggle={vi.fn<ToggleFn>()} todo={completedTodo} />);

    // Assert
    expect(screen.getByText("Test Todo").className).toContain("line-through");
    expect(screen.getByText("Done")).toBeDefined();
  });

  it("does not render description when description is null", () => {
    expect.assertions(1);

    // Arrange
    const todoWithoutDescription: Todo = { ...mockTodo, description: null };

    // Act
    render(<TodoItemSummary onToggle={vi.fn<ToggleFn>()} todo={todoWithoutDescription} />);

    // Assert
    expect(screen.queryByText("Test Description")).toBeNull();
  });

  it("disables checkbox when isUpdating is true", () => {
    expect.assertions(1);

    // Arrange
    const handleToggle = vi.fn<ToggleFn>();

    // Act
    render(<TodoItemSummary isUpdating onToggle={handleToggle} todo={mockTodo} />);

    // Assert
    expect(screen.getByRole("checkbox").getAttribute("aria-disabled")).toBe("true");
  });
});

describe("todo item summary interactions", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("calls onToggle with checked state when checkbox is clicked", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    const handleToggle = vi.fn<ToggleFn>();
    render(<TodoItemSummary onToggle={handleToggle} todo={mockTodo} />);

    // Act
    await user.click(screen.getByRole("checkbox", { name: /toggle test todo/iu }));

    // Assert
    expect(handleToggle).toHaveBeenCalledWith(true);
  });
});
