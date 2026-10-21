import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { useDeleteTodo } from "@/pages/todos/api/use-delete-todo";
import { useUpdateTodo } from "@/pages/todos/api/use-update-todo";
import { TodoItemActions } from "@/pages/todos/ui/todo-item-actions";
import { TEST_TODO } from "@test/vitest/fixtures/todos";

vi.mock(import("@/shared/auth/auth.server"));
vi.mock(import("@/shared/db/db.server"));
vi.mock(import("@/pages/todos/api/use-delete-todo"));
vi.mock(import("@/pages/todos/api/use-update-todo"));

const mockTodo = TEST_TODO;

describe("todo item actions rendering and interactions", () => {
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

  it("renders update and delete action triggers", () => {
    expect.assertions(2);

    // Arrange & Act
    render(<TodoItemActions todo={mockTodo} />);

    // Assert
    expect(screen.getByRole("button", { name: "Edit todo" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Delete todo" })).toBeDefined();
  });

  it("opens delete dialog when delete trigger is clicked", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    render(<TodoItemActions todo={mockTodo} />);

    // Act
    await user.click(screen.getByRole("button", { name: "Delete todo" }));

    // Assert
    expect(screen.getByRole("heading", { name: /delete todo item\?/iu })).toBeDefined();
  });

  it("opens update dialog when update trigger is clicked", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    render(<TodoItemActions todo={mockTodo} />);

    // Act
    await user.click(screen.getByRole("button", { name: "Edit todo" }));

    // Assert
    expect(screen.getByRole("heading", { name: /update todo item\?/iu })).toBeDefined();
  });
});
