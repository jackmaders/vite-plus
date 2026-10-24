import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { useDeleteTodo } from "@/pages/todos/api/use-delete-todo";
import { DeleteTodoDialog } from "@/pages/todos/ui/delete-todo-dialog";
import { ApplicationError } from "@/shared/errors";
import { TEST_TODO } from "@test/vitest/fixtures/todos";

vi.mock(import("@/pages/todos/api/use-delete-todo"));

const mockTodo = TEST_TODO;
const mockDeleteTodo = vi.fn<() => void>();

describe("delete todo dialog", () => {
  let successCallback: (() => void) | null = null;

  beforeEach(() => {
    mockDeleteTodo.mockClear();
    successCallback = null;
    vi.mocked(useDeleteTodo).mockImplementation((options) => {
      successCallback = (options?.onSuccess as (() => void) | undefined) ?? null;
      return {
        isPending: false,
        mutate: mockDeleteTodo,
      } as never;
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("shows a typed failure while leaving the confirmation open", async () => {
    expect.hasAssertions();
    // Arrange
    const user = userEvent.setup();
    vi.mocked(useDeleteTodo).mockReturnValue({
      error: new ApplicationError("TODO_NOT_FOUND", "Todo not found", { status: 404 }),
      isError: true,
      isPending: false,
      mutate: mockDeleteTodo,
    } as never);
    render(<DeleteTodoDialog todo={mockTodo} />);

    // Act
    await user.click(screen.getByRole("button", { name: "Delete Item" }));

    // Assert
    expect(screen.getByRole("alert").textContent).toBe("Todo not found");
    expect(screen.getByRole("dialog")).toBeDefined();
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

  it("closes dialog when delete mutation succeeds", async () => {
    expect.hasAssertions();

    // Arrange
    const user = userEvent.setup();
    render(<DeleteTodoDialog todo={mockTodo} />);

    // Act
    await user.click(screen.getByRole("button", { name: "Delete Item" }));
    expect(screen.getByRole("heading", { name: /delete todo item\?/iu })).toBeDefined();

    // Simulate mutation success callback
    act(() => {
      successCallback?.();
    });

    // Assert dialog closed
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: /delete todo item\?/iu })).toBeNull();
    });
  });

  it("shows deleting state and disables button when mutation is pending", async () => {
    expect.assertions(2);

    // Arrange
    vi.mocked(useDeleteTodo).mockReturnValue({
      isPending: true,
      mutate: mockDeleteTodo,
    } as never);
    const user = userEvent.setup();
    render(<DeleteTodoDialog todo={mockTodo} />);

    // Act
    await user.click(screen.getByRole("button", { name: "Delete Item" }));

    // Assert
    const deleteButton = screen.getByRole("button", { name: "Deleting..." });
    expect(deleteButton).toBeDefined();
    expect(deleteButton.hasAttribute("disabled")).toBe(true);
  });
});
