import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { useDeleteTodo } from "@/pages/todos/api/use-delete-todo";
import { DeleteTodoDialog } from "@/pages/todos/ui/delete-todo-dialog";
import { TEST_TODO } from "@test/vitest/fixtures/todos";

vi.mock(import("@/shared/auth/auth.server"));
vi.mock(import("@/shared/db/db.server"));
vi.mock(import("@/pages/todos/api/use-delete-todo"));

const mockTodo = TEST_TODO;
const mockDeleteTodo = vi.fn<() => void>();

describe("delete todo dialog", () => {
  beforeEach(() => {
    mockDeleteTodo.mockClear();
    vi.mocked(useDeleteTodo).mockReturnValue({
      isPending: false,
      mutate: mockDeleteTodo,
    } as never);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders trigger and opens dialog on click", async () => {
    expect.assertions(2);

    // Arrange
    const user = userEvent.setup();
    render(<DeleteTodoDialog todo={mockTodo} />);

    // Assert trigger
    expect(screen.getByRole("button", { name: "Delete Item" })).toBeDefined();

    // Act
    await user.click(screen.getByRole("button", { name: "Delete Item" }));

    // Assert dialog opened
    expect(screen.getByRole("heading", { name: /delete todo item\?/iu })).toBeDefined();
  });

  it("calls deleteTodo when delete button is confirmed", async () => {
    expect.assertions(1);

    // Arrange
    const user = userEvent.setup();
    render(<DeleteTodoDialog todo={mockTodo} />);

    // Act
    await user.click(screen.getByRole("button", { name: "Delete Item" }));
    await user.click(screen.getByRole("button", { name: "Delete Todo" }));

    // Assert
    expect(mockDeleteTodo).toHaveBeenCalledWith({ id: mockTodo.id });
  });
});
